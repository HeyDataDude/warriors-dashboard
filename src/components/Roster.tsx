// src/components/Roster.tsx
import { useEffect, useMemo, useState } from "react";
import Card, { SectionTitle } from "./Card";
import { Player } from "../types";
import PlayerCard from "./PlayerCard";
import { Skeleton } from "./Skeleton";
import { Modal } from "./Modal";

/* ----------------- Skeleton ----------------- */
export function RosterSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden bg-white/5 border border-white/10">
          <Skeleton className="aspect-[4/3]" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ----------------- Helpers ----------------- */
const W_BLUE = "#1D428A";
const W_GOLD = "#FFC72C";

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition focus:outline-none focus:ring-2
        ${active
          ? "bg-white/15 ring-1 ring-inset ring-white/20 text-white"
          : "bg-white/5 ring-1 ring-inset ring-white/10 text-white/85 hover:bg-white/10"}`}
      title={label}
    >
      {label}
    </button>
  );
}

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:ring-2 ring-[rgba(255,199,44,0.4)] text-sm placeholder-white/40 transition"
        aria-label="Search players"
        type="search"
      />
      <svg
        viewBox="0 0 20 20"
        className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/50 pointer-events-none"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="8.5" cy="8.5" r="5.5" />
        <line x1="13" y1="13" x2="17" y2="17" />
      </svg>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  "aria-label"?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none text-sm"
      aria-label={ariaLabel || "Select"}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

/* ----------------- Main ----------------- */

type Props = { players?: Player[] };

export default function Roster({ players = [] }: Props) {
  const [q, setQ] = useState("");
  const [pos, setPos] = useState("All");
  const [sort, setSort] = useState<"Name A–Z" | "Jersey #" | "Position">("Name A–Z");
  const [active, setActive] = useState<Player | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Reduced motion
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const set = () => setReducedMotion(!!mq?.matches);
    set(); mq?.addEventListener?.("change", set);
    return () => mq?.removeEventListener?.("change", set);
  }, []);

  // Positions list
  const positions = useMemo(() => {
    const set = new Set((players || []).map((p) => p.strPosition || "Unknown"));
    return ["All", ...Array.from(set).sort()];
  }, [players]);

  // Debounce search
  const [qLive, setQLive] = useState(q);
  useEffect(() => {
    const t = setTimeout(() => setQ(qLive), 150);
    return () => clearTimeout(t);
  }, [qLive]);

  // Filter + sort
  const filtered = useMemo(() => {
    const qLower = (q || "").toLowerCase();
    let list = players.filter((p) =>
      (p.strPlayer ?? "").toLowerCase().includes(qLower)
    );
    if (pos !== "All") list = list.filter((p) => (p.strPosition || "Unknown") === pos);

    const byNum = (p?: string | null) => {
      const n = parseInt(String(p ?? "").replace(/[^\d]/g, ""), 10);
      return Number.isFinite(n) ? n : 9999;
    };
    const byPos = (s?: string | null) => (s || "Unknown");

    switch (sort) {
      case "Jersey #":
        list.sort((a, b) => byNum(a.strNumber) - byNum(b.strNumber));
        break;
      case "Position":
        list.sort(
          (a, b) =>
            byPos(a.strPosition).localeCompare(byPos(b.strPosition)) ||
            (a.strPlayer || "").localeCompare(b.strPlayer || "")
        );
        break;
      default:
        list.sort((a, b) => (a.strPlayer || "").localeCompare(b.strPlayer || ""));
    }
    return list;
  }, [players, q, pos, sort]);

  const jersey = (active?.strNumber ?? "").toString().replace(/[^\d]/g, "");
  const initials = (active?.strPlayer ?? "")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div id="roster" className="scroll-mt-24">
      <Card className="p-4 sm:p-5 md:p-6 ring-1 ring-white/10 bg-gradient-to-b from-white/5 to-transparent">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <SectionTitle>Roster</SectionTitle>
            <p className="text-white/70 text-xs md:text-[13px] mt-0.5">
              Player directory and filters
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <SearchInput value={qLive} onChange={setQLive} placeholder="Search players…" />
            <Select
              value={sort}
              onChange={(v) => setSort(v as any)}
              options={["Name A–Z", "Jersey #", "Position"]}
              aria-label="Sort roster"
            />
          </div>

          {/* Position chips */}
          <div className="flex flex-wrap items-center gap-2">
            {positions.map((p) => (
              <Chip key={p} label={p} active={pos === p} onClick={() => setPos(p)} />
            ))}
            {(pos !== "All" || q) && (
              <button
                type="button"
                onClick={() => { setPos("All"); setQLive(""); }}
                className="ml-1 inline-flex items-center px-3 py-1.5 rounded-lg text-[12.5px] font-medium bg-white/5 ring-1 ring-inset ring-white/10 hover:bg-white/10 transition focus:outline-none focus:ring-2"
                title="Clear filters"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Grid (mobile shows 1 card per row) */}
        <ul
          className="mt-4 grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          role="list"
        >
          {filtered.map((p) => (
            <li key={p.idPlayer}>
              <button
                type="button"
                onClick={() => setActive(p)}
                className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-xl"
                title={`View ${p.strPlayer}`}
              >
                <PlayerCard p={p} />
              </button>
            </li>
          ))}
        </ul>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-inset ring-white/10">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-white/70" fill="currentColor">
                <path d="M12 2a5 5 0 0 1 5 5v2h1a3 3 0 0 1 3 3v7h-6v-5H9v5H3v-7a3 3 0 0 1 3-3h1V7a5 5 0 0 1 5-5z" />
              </svg>
              <span className="text-sm text-white/70">No players match your filters.</span>
            </div>
          </div>
        )}
      </Card>

      {/* Modal */}
      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.strPlayer}
        size="xl"
        watermark={jersey || initials}
      >
{active && (
  <div className="p-4 sm:p-5 md:p-6">
    {/* Media + meta grid */}
    <div className="grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-4 sm:gap-6 items-start">
      {/* Bigger image: full-width on mobile, fixed rail on desktop */}
      <div className="sm:sticky sm:top-6">
        <div className="relative w-full sm:w-52 md:w-56 aspect-[4/5] rounded-2xl overflow-hidden bg-white/5 ring-1 ring-inset ring-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.35)] mx-auto sm:mx-0">
          {active.strThumb ? (
            <img
              src={active.strThumb}
              alt={active.strPlayer}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
          ) : null}

          {/* subtle bottom gradient for legibility if needed */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Right column: perfectly aligned text + chips */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-2xl md:text-[26px] font-semibold leading-tight truncate">
            {active.strPlayer}
          </h3>

          {active.strNumber && (
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[12.5px] font-semibold"
              style={{
                backgroundColor: "rgba(255,199,44,0.15)",
                color: W_GOLD,
                border: "1px solid rgba(255,199,44,0.25)",
              }}
            >
              #{String(active.strNumber).replace(/[^\d]/g, "")}
            </span>
          )}
        </div>

        <div className="mt-1 text-white/70 text-sm">
          {(active.strPosition || "—")}
          {active.strNationality ? ` • ${active.strNationality}` : ""}
        </div>

        {/* Key facts – stack on mobile, 3-up at sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-4">
          <div className="rounded-xl bg-white/5 p-3 border border-white/10 text-center sm:text-left">
            <div className="text-white/60">Height</div>
            <div className="font-medium tabular-nums">{active.strHeight || "—"}</div>
          </div>
          <div className="rounded-xl bg-white/5 p-3 border border-white/10 text-center sm:text-left">
            <div className="text-white/60">Weight</div>
            <div className="font-medium tabular-nums">{active.strWeight || "—"}</div>
          </div>
          <div className="rounded-xl bg-white/5 p-3 border border-white/10 text-center sm:text-left">
            <div className="text-white/60">Born</div>
            <div className="font-medium tabular-nums">{active.dateBorn || "—"}</div>
          </div>
        </div>

        {/* Bio */}
        {active.strDescriptionEN && (
          <p className="text-sm text-white/85 mt-4 leading-relaxed max-h-56 overflow-y-auto pr-1">
            {active.strDescriptionEN}
          </p>
        )}

        {/* Actions aligned to the end */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={() => setActive(null)}
            className="px-4 py-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2"
            style={{ backgroundColor: W_GOLD, color: "#1D428A" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      </Modal>
    </div>
  );
}

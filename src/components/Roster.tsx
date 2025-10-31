import { useMemo, useState } from "react";
import { Card, SectionTitle } from "./Card";
import { Player } from "../types";
import PlayerCard from "./PlayerCard";
import { Skeleton } from "./Skeleton";
import { Modal } from "./Modal";

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

type Props = { players?: Player[] };

export default function Roster({ players = [] }: Props) {
  const [q, setQ] = useState("");
  const [pos, setPos] = useState("All");
  const [active, setActive] = useState<Player | null>(null);

  const positions = useMemo(() => {
    const set = new Set(players.map(p => p.strPosition || "Unknown"));
    return ["All", ...Array.from(set)];
  }, [players]);

  const qLower = q.toLowerCase();
  const filtered = players
    .filter(p => (p.strPlayer ?? "").toLowerCase().includes(qLower))
    .filter(p => (pos === "All" ? true : (p.strPosition || "Unknown") === pos));

  return (
    <div id="roster">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Roster</SectionTitle>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search players…"
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:ring-2 ring-warriorsGold/50"
          />
          <select
            value={pos}
            onChange={(e) => setPos(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none"
          >
            {positions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map(p => (
            <li key={p.idPlayer}>
              {/* Click to open modal */}
              <button
                type="button"
                onClick={() => setActive(p)}
                className="w-full text-left"
              >
                <li key={p.idPlayer} onClick={() => setActive(p)} className="cursor-pointer">
  <PlayerCard p={p} />
</li>

              </button>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <div className="p-6 text-center text-white/60">
            No players match your filters.
          </div>
        )}
      </Card>

      {/* ⬇️ Modal moved INSIDE the return ⬇️ */}
      <Modal open={!!active} onClose={() => setActive(null)}>
        {active && (
          <div className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 bg-white/5 rounded-xl overflow-hidden">
                {active.strThumb ? (
                  <img src={active.strThumb} alt={active.strPlayer} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0">
                <div className="text-xl font-semibold truncate">{active.strPlayer}</div>
                <div className="text-textMuted text-sm">{active.strPosition || "—"}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm mt-4">
              <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                <div className="text-textMuted">Height</div>
                <div className="font-medium">{active.strHeight || "—"}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                <div className="text-textMuted">Weight</div>
                <div className="font-medium">{active.strWeight || "—"}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3 border border-white/10">
                <div className="text-textMuted">Born</div>
                <div className="font-medium">{active.dateBorn || "—"}</div>
              </div>
            </div>
            {active.strDescriptionEN && (
              <p className="text-sm text-white/80 mt-4 leading-relaxed line-clamp-6">
                {active.strDescriptionEN}
              </p>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setActive(null)}
                className="px-4 py-2 rounded-lg bg-warriorsGold text-warriorsBg hover:opacity-90 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

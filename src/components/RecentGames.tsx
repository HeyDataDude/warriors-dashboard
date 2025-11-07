import { useEffect, useState, useMemo } from "react";
import Card, { SectionTitle } from "./Card";
import { Event } from "../types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

const W_BLUE = "#1D428A";
const W_GOLD = "#FFC72C";

type Props = { events: Event[] };

/** Last-game spotlight: score, quick chips, compact bar, and momentum */
export default function RecentGames({ events }: Props) {
  // Respect OS “Reduce Motion” for chart animations
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(!!mq?.matches);
    apply();
    mq?.addEventListener?.("change", apply);
    return () => mq?.removeEventListener?.("change", apply);
  }, []);

  // Take the latest game only
  const game = events?.[0];
  const formattedDate = useMemo(() => {
    if (!game?.dateEvent) return "";
    // Simple readable date without adding a lib
    try {
      const d = new Date(game.dateEvent);
      return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return game.dateEvent;
    }
  }, [game]);

  // Empty state
  if (!game) {
    return (
      <div id="games" className="scroll-mt-24">
        <Card className="p-5 ring-1 ring-white/10 bg-white/5">
          <SectionTitle>Recent Games</SectionTitle>
          <div className="mt-3 text-sm text-white/70">
            No recent game available. Check back after the next matchup.
          </div>
        </Card>
      </div>
    );
  }

  // Derive result info
  const home = game.strHomeTeam?.toLowerCase().includes("warriors");
  const opp = home ? game.strAwayTeam : game.strHomeTeam;
  const forPts = Number(home ? game.intHomeScore : game.intAwayScore) || 0;
  const againstPts = Number(home ? game.intAwayScore : game.intHomeScore) || 0;
  const diff = forPts - againstPts;
  const result = forPts === againstPts ? "T" : forPts > againstPts ? "W" : "L";
  const venue = home ? "Home" : "Away";

  // Bounded momentum score (0–100) from margin
  const momentum = clamp01(0.5 + Math.tanh(diff / 18) * 0.5) * 100;

  const bars = [{ name: formattedDate || "Last game", Warriors: forPts, Opponent: againstPts }];

  return (
    <div id="games" className="scroll-mt-24">
      <Card className="p-4 sm:p-5 md:p-6 overflow-hidden ring-1 ring-white/10 bg-gradient-to-b from-white/5 to-transparent">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <SectionTitle>Last Game</SectionTitle>
            <p className="text-white/70 text-xs md:text-[13px] mt-0.5">
              {game.strEvent} {formattedDate ? `• ${formattedDate}` : ""}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Chip label={result} tone={result === "W" ? "good" : result === "L" ? "bad" : "muted"} />
            <DividerDot />
            <Chip
              label={`${diff > 0 ? "+" : diff < 0 ? "−" : ""}${Math.abs(diff)} margin`}
              tone={diff >= 0 ? "good" : "bad"}
            />
            <Chip label={venue} tone="muted" />
          </div>
        </div>

        {/* Score + compact bar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Final score</span>
              <span className="flex items-center gap-3">
                <LegendDot color={W_GOLD} label="Warriors" />
                <LegendDot color={W_BLUE} label={opp || "Opponent"} />
              </span>
            </div>

            <div className="mt-3 flex items-end justify-between">
              <div className="font-semibold text-3xl sm:text-4xl tabular-nums">
                {forPts} <span className="text-white/50 text-xl align-top">–</span> {againstPts}
              </div>
              <div
                className={`text-sm font-medium ${
                  diff > 0 ? "text-emerald-400" : diff < 0 ? "text-rose-400" : "text-white/70"
                }`}
              >
                {diff > 0 ? `Warriors +${diff}` : diff < 0 ? `-${Math.abs(diff)}` : "Even"}
              </div>
            </div>

            <div className="h-48 sm:h-52 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bars} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    dataKey="name"
                    tickMargin={6}
                    tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                    tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                    tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
                    width={34}
                  />
                  <Tooltip content={<SingleGameTooltip opp={opp || "Opponent"} />} />
                  <Bar dataKey="Warriors" barSize={28} radius={[6, 6, 0, 0]} isAnimationActive={!reducedMotion}>
                    <Cell fill={W_GOLD} />
                  </Bar>
                  <Bar dataKey="Opponent" barSize={28} radius={[6, 6, 0, 0]} isAnimationActive={!reducedMotion}>
                    <Cell fill={W_BLUE} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Momentum tile */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col">
            <div className="text-sm text-white/70">Momentum score</div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-3xl font-semibold tabular-nums">{Math.round(momentum)}</div>
              <div className="text-white/60">/100</div>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full ${diff >= 0 ? "bg-emerald-400/80" : "bg-rose-400/80"}`}
                style={{ width: `${Math.round(momentum)}%` }}
              />
            </div>
            <p className="mt-2 text-[12.5px] text-white/70">Derived from point margin (tapers for blowouts).</p>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <InfoPill label="Venue" value={venue} />
              <InfoPill label="Opponent" value={opp || "—"} />
              <InfoPill
                label="Result"
                value={result}
                tone={result === "W" ? "good" : result === "L" ? "bad" : "muted"}
              />
              <InfoPill label="Margin" value={`${diff > 0 ? "+" : diff < 0 ? "−" : ""}${Math.abs(diff)}`} />
            </div>
          </div>
        </div>

        {/* Single list item keeps page rhythm */}
        <ul className="mt-4">
          <li
            className="rounded-xl bg-white/5 border border-white/10 p-3.5 flex items-center justify-between hover:bg-white/7 transition"
          >
            <div className="text-sm min-w-0">
              <div className="font-medium truncate" title={game.strEvent}>
                {game.strEvent}
              </div>
              <div className="text-white/60">
                {formattedDate} • {venue}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-semibold tabular-nums">
                {forPts} - {againstPts}
              </div>
              <div
                className={`text-xs ${
                  result === "W" ? "text-emerald-400" : result === "L" ? "text-rose-400" : "text-white/60"
                }`}
              >
                {result}
              </div>
            </div>
          </li>
        </ul>
      </Card>
    </div>
  );
}

/* ---------- Small presentational helpers ---------- */

function Chip({ label, tone }: { label: string; tone: "good" | "bad" | "muted" }) {
  const toneClasses =
    tone === "good"
      ? "bg-emerald-400/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/25"
      : tone === "bad"
      ? "bg-rose-400/15 text-rose-300 ring-1 ring-inset ring-rose-400/25"
      : "bg-white/10 text-white/80 ring-1 ring-inset ring-white/15";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-medium ${toneClasses}`}>
      {label}
    </span>
  );
}

function DividerDot() {
  return <span className="h-1 w-1 rounded-full bg-white/30 inline-block mx-1" aria-hidden />;
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      <span className="text-white/80">{label}</span>
    </span>
  );
}

function InfoPill({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: "good" | "bad" | "muted";
}) {
  const toneClasses =
    tone === "good"
      ? "text-emerald-300 bg-emerald-400/10 ring-emerald-400/20"
      : tone === "bad"
      ? "text-rose-300 bg-rose-400/10 ring-rose-400/20"
      : "text-white/80 bg-white/5 ring-white/10";
  return (
    <div className={`rounded-lg px-2.5 py-1.5 text-[12.5px] ring-1 ring-inset ${toneClasses}`}>
      <span className="text-white/60">{label}: </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

/* Keep tooltip types minimal; Recharts payloads are loose */
type TooltipEntry = { dataKey?: string; value?: number };
type TooltipProps = { active?: boolean; payload?: TooltipEntry[]; label?: string };

function SingleGameTooltip({ active, payload, label, opp }: TooltipProps & { opp: string }) {
  if (!active || !payload || payload.length < 2) return null;
  const w = payload.find((p) => p.dataKey === "Warriors")?.value ?? null;
  const o = payload.find((p) => p.dataKey === "Opponent")?.value ?? null;
  const diff = (w ?? 0) - (o ?? 0);

  return (
    <div className="rounded-xl border border-white/10 bg-[rgba(11,15,26,0.95)] p-3 shadow-xl backdrop-blur-md">
      <div className="text-[12.5px] text-white/70">{label}</div>
      <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: W_GOLD }} aria-hidden />
          <span className="text-white/80">Warriors</span>
        </div>
        <div className="text-right tabular-nums font-semibold">{w}</div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: W_BLUE }} aria-hidden />
          <span className="text-white/80">{opp}</span>
        </div>
        <div className="text-right tabular-nums font-semibold">{o}</div>
      </div>

      <div className="mt-2 pt-2 border-t border-white/10 text-[12.5px] flex items-center justify-between">
        <span className="text-white/70">Diff</span>
        <span
          className={`tabular-nums font-semibold ${
            diff > 0 ? "text-emerald-400" : diff < 0 ? "text-rose-400" : "text-white/80"
          }`}
        >
          {diff > 0 ? "+" : ""}
          {diff}
        </span>
      </div>
    </div>
  );
}

/* Clamp to [0,1] */
function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

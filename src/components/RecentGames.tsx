import Card, { SectionTitle } from "./Card";
import { Event } from "../types";
import { transformEvents } from "../utils";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { useEffect, useMemo, useState } from "react";

const W_BLUE = "#1D428A";
const W_GOLD = "#FFC72C";
const W_SLATE = "#0B0F1A";

type Props = { events: Event[] };

export default function RecentGames({ events }: Props) {
  // Respect prefers-reduced-motion for chart anims
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const set = () => setReducedMotion(!!mq?.matches);
    set(); mq?.addEventListener?.("change", set);
    return () => mq?.removeEventListener?.("change", set);
  }, []);

  // Transform + compute quick insights (last 6 by default)
  const recent = useMemo(() => (events || []).slice(0, 6), [events]);
  const chart = useMemo(() => transformEvents(recent), [recent]);

  const insights = useMemo(() => {
    let wins = 0, losses = 0, ties = 0, pf = 0, pa = 0;
    recent.forEach((e) => {
      const home = e.strHomeTeam?.toLowerCase().includes("warriors");
      const forPts = Number(home ? e.intHomeScore : e.intAwayScore) || 0;
      const agPts = Number(home ? e.intAwayScore : e.intHomeScore) || 0;
      pf += forPts; pa += agPts;
      if (forPts === agPts) ties++; else if (forPts > agPts) wins++; else losses++;
    });
    const n = recent.length || 1;
    const diff = (pf - pa) / n;
    // streak (from most recent forward)
    let streak = 0;
    for (let i = 0; i < recent.length; i++) {
      const e = recent[i];
      const home = e.strHomeTeam?.toLowerCase().includes("warriors");
      const forPts = Number(home ? e.intHomeScore : e.intAwayScore) || 0;
      const agPts = Number(home ? e.intAwayScore : e.intHomeScore) || 0;
      const res = forPts === agPts ? 0 : forPts > agPts ? 1 : -1;
      if (i === 0) streak = res === 0 ? 0 : res;
      else {
        if (res === 0) break;
        if (Math.sign(streak) === res) streak += res;
        else break;
      }
    }
    return {
      wins, losses, ties,
      avgFor: pf / (recent.length || 1),
      avgAgainst: pa / (recent.length || 1),
      avgDiff: diff,
      streakLabel:
        streak === 0 ? "—" :
        streak > 0 ? `W${streak}` : `L${Math.abs(streak)}`
    };
  }, [recent]);

  if (!events || events.length === 0) {
    return (
      <div id="games" className="scroll-mt-24">
        <Card className="p-5 ring-1 ring-white/10 bg-white/5">
          <SectionTitle>Recent Games</SectionTitle>
          <div className="mt-3 text-sm text-white/70">
            No recent games available. Check back after the next matchup.
          </div>
        </Card>
      </div>
    );
  }

  // --------- Single-game spotlight mode ----------
  if (recent.length === 1) {
    const e = recent[0];
    const home = e.strHomeTeam?.toLowerCase().includes("warriors");
    const opp = home ? e.strAwayTeam : e.strHomeTeam;
    const forPts = Number(home ? e.intHomeScore : e.intAwayScore) || 0;
    const againstPts = Number(home ? e.intAwayScore : e.intHomeScore) || 0;
    const diff = forPts - againstPts;
    const result = forPts === againstPts ? "T" : forPts > againstPts ? "W" : "L";
    const venue = home ? "Home" : "Away";

    // A loud but simple "momentum" score from point margin (0–100)
    const momentum = clamp01(0.5 + Math.tanh(diff / 18) * 0.5) * 100;

    const bars = [{ name: e.dateEvent || "Last game", Warriors: forPts, Opponent: againstPts }];

    return (
      <div id="games" className="scroll-mt-24">
        <Card className="p-4 sm:p-5 md:p-6 overflow-hidden ring-1 ring-white/10 bg-gradient-to-b from-white/5 to-transparent">
          {/* Header */}
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <SectionTitle>Last Game Spotlight</SectionTitle>
              <p className="text-white/70 text-xs md:text-[13px] mt-0.5">
                {e.strEvent} • {e.dateEvent}
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

          {/* Big score banner */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Final score</span>
                <span className="flex items-center gap-3">
                  <LegendDot color={W_GOLD} label="Warriors" />
                  <LegendDot color={W_BLUE} label={`${opp || "Opponent"}`} />
                </span>
              </div>

              <div className="mt-3 flex items-end justify-between">
                <div className="font-semibold text-3xl sm:text-4xl tabular-nums">
                  {forPts} <span className="text-white/50 text-xl align-top">–</span> {againstPts}
                </div>
                <div className={`text-sm font-medium ${diff>0?"text-emerald-400":diff<0?"text-rose-400":"text-white/70"}`}>
                  {diff>0?`Warriors +${diff}`:diff<0?`-${Math.abs(diff)}`:"Even"}
                </div>
              </div>

              {/* Compact grouped bar instead of line chart */}
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
                    <Bar
                      dataKey="Warriors"
                      barSize={28}
                      radius={[6,6,0,0]}
                      isAnimationActive={!reducedMotion}
                    >
                      <Cell fill={W_GOLD} />
                    </Bar>
                    <Bar
                      dataKey="Opponent"
                      barSize={28}
                      radius={[6,6,0,0]}
                      isAnimationActive={!reducedMotion}
                    >
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
                  className={`h-full ${diff>=0 ? "bg-emerald-400/80" : "bg-rose-400/80"}`}
                  style={{ width: `${Math.round(momentum)}%` }}
                />
              </div>
              <p className="mt-2 text-[12.5px] text-white/70">
                Derived from point margin (tapers for blowouts).
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <InfoPill label="Venue" value={venue} />
                <InfoPill label="Opponent" value={opp || "—"} />
                <InfoPill label="Result" value={result} tone={result === "W" ? "good" : result === "L" ? "bad" : "muted"} />
                <InfoPill label="Margin" value={`${diff > 0 ? "+" : diff < 0 ? "−" : ""}${Math.abs(diff)}`} />
              </div>
            </div>
          </div>

          {/* Single list item keeps visual rhythm with the rest of the page */}
          <ul className="mt-4">
            <li
              key={e.idEvent}
              className="rounded-xl bg-white/5 border border-white/10 p-3.5 flex items-center justify-between hover:bg-white/7 transition"
            >
              <div className="text-sm min-w-0">
                <div className="font-medium truncate" title={e.strEvent}>
                  {e.strEvent}
                </div>
                <div className="text-white/60">{e.dateEvent} • {venue}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-semibold tabular-nums">{forPts} - {againstPts}</div>
                <div className={`text-xs ${result === "W" ? "text-emerald-400" : result === "L" ? "text-rose-400" : "text-white/60"}`}>{result}</div>
              </div>
            </li>
          </ul>
        </Card>
      </div>
    );
  }

  // --------- Multi-game mode (your original UI) ----------
  return (
    <div id="games" className="scroll-mt-24">
      <Card className="p-4 sm:p-5 md:p-6 overflow-hidden ring-1 ring-white/10 bg-gradient-to-b from-white/5 to-transparent">
        {/* Header row */}
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <SectionTitle>Recent Games</SectionTitle>
            <p className="text-white/70 text-xs md:text-[13px] mt-0.5">
              Last {recent.length} results • Momentum snapshot
            </p>
          </div>

          {/* Mini insights */}
          <div className="hidden sm:flex items-center gap-2">
            <Chip label={`W ${insights.wins}`} tone="good" />
            <Chip label={`L ${insights.losses}`} tone="bad" />
            {insights.ties > 0 && <Chip label={`T ${insights.ties}`} tone="muted" />}
            <DividerDot />
            <Chip
              label={`${insights.avgDiff >= 0 ? "+" : ""}${insights.avgDiff.toFixed(1)} avg diff`}
              tone={insights.avgDiff >= 0 ? "good" : "bad"}
            />
            <Chip label={insights.streakLabel} tone="muted" />
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center gap-3 text-[12.5px] text-white/80">
          <LegendDot color={W_GOLD} label="Warriors points" />
          <LegendDot color={W_BLUE} label="Opponent points" />
        </div>

        {/* Chart */}
        <div className="h-60 sm:h-64 md:h-72 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chart}
              margin={{ top: 12, right: 8, bottom: 4, left: 0 }}
            >
              <defs>
                <linearGradient id="goldLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={W_GOLD} stopOpacity={1} />
                  <stop offset="100%" stopColor={W_GOLD} stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="blueLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={W_BLUE} stopOpacity={1} />
                  <stop offset="100%" stopColor={W_BLUE} stopOpacity={0.3} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="date"
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

              <Tooltip content={<ProTooltip />} />

              <Line
                type="monotone"
                dataKey="forPts"
                stroke="url(#goldLine)"
                strokeWidth={3}
                dot={false}
                isAnimationActive={!reducedMotion}
                animationDuration={500}
                animationEasing="ease-out"
                name="Warriors"
              />
              <Line
                type="monotone"
                dataKey="againstPts"
                stroke="url(#blueLine)"
                strokeWidth={3}
                dot={false}
                isAnimationActive={!reducedMotion}
                animationDuration={500}
                animationEasing="ease-out"
                name="Opponent"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Game list */}
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {recent.map((e) => {
            const home = e.strHomeTeam?.toLowerCase().includes("warriors");
            const forPts = Number(home ? e.intHomeScore : e.intAwayScore) || 0;
            const againstPts = Number(home ? e.intAwayScore : e.intHomeScore) || 0;
            const result = forPts === againstPts ? "T" : forPts > againstPts ? "W" : "L";
            const tone =
              result === "W" ? "text-emerald-400" :
              result === "L" ? "text-rose-400" :
              "text-white/60";

            return (
              <li
                key={e.idEvent}
                className="rounded-xl bg-white/5 border border-white/10 p-3.5 flex items-center justify-between hover:bg-white/7 transition"
              >
                <div className="text-sm min-w-0">
                  <div className="font-medium truncate" title={e.strEvent}>
                    {e.strEvent}
                  </div>
                  <div className="text-white/60">{e.dateEvent}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold tabular-nums">{forPts} - {againstPts}</div>
                  <div className={`text-xs ${tone}`}>{result}</div>
                </div>
              </li>
            );
          })}
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

function InfoPill({ label, value, tone = "muted" as const }: { label: string; value: string; tone?: "good" | "bad" | "muted" }) {
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

function ProTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length < 2) return null;
  const forPts = payload.find((p: any) => p.dataKey === "forPts")?.value ?? null;
  const againstPts = payload.find((p: any) => p.dataKey === "againstPts")?.value ?? null;
  const diff = (forPts ?? 0) - (againstPts ?? 0);
  return (
    <div
      className="rounded-xl border border-white/10 bg-[rgba(11,15,26,0.95)] p-3 shadow-xl backdrop-blur-md"
      style={{ minWidth: 180 }}
    >
      <div className="text-[12.5px] text-white/70">{label}</div>
      <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: W_GOLD }} />
          <span className="text-white/80">Warriors</span>
        </div>
        <div className="text-right tabular-nums font-semibold">{forPts}</div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: W_BLUE }} />
          <span className="text-white/80">Opponent</span>
        </div>
        <div className="text-right tabular-nums font-semibold">{againstPts}</div>
      </div>

      <div className="mt-2 pt-2 border-t border-white/10 text-[12.5px] flex items-center justify-between">
        <span className="text-white/70">Diff</span>
        <span
          className={`tabular-nums font-semibold ${
            (forPts - againstPts) > 0 ? "text-emerald-400" : (forPts - againstPts) < 0 ? "text-rose-400" : "text-white/80"
          }`}
        >
          {diff > 0 ? "+" : ""}{diff}
        </span>
      </div>
    </div>
  );
}

function SingleGameTooltip({ active, payload, label, opp }: any) {
  if (!active || !payload || payload.length < 2) return null;
  const w = payload.find((p: any) => p.dataKey === "Warriors")?.value ?? null;
  const o = payload.find((p: any) => p.dataKey === "Opponent")?.value ?? null;
  const diff = (w ?? 0) - (o ?? 0);
  return (
    <div className="rounded-xl border border-white/10 bg-[rgba(11,15,26,0.95)] p-3 shadow-xl backdrop-blur-md">
      <div className="text-[12.5px] text-white/70">{label}</div>
      <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: W_GOLD }} />
          <span className="text-white/80">Warriors</span>
        </div>
        <div className="text-right tabular-nums font-semibold">{w}</div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: W_BLUE }} />
          <span className="text-white/80">{opp}</span>
        </div>
        <div className="text-right tabular-nums font-semibold">{o}</div>
      </div>
      <div className="mt-2 pt-2 border-t border-white/10 text-[12.5px] flex items-center justify-between">
        <span className="text-white/70">Diff</span>
        <span className={`tabular-nums font-semibold ${diff>0?"text-emerald-400":diff<0?"text-rose-400":"text-white/80"}`}>
          {diff > 0 ? "+" : ""}{diff}
        </span>
      </div>
    </div>
  );
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

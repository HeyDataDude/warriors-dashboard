// src/components/StephenCurryDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { parse, type ParseResult } from "papaparse";
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
  PieChart, Pie, Cell, Legend
} from "recharts";

// ===== Types (match your CSV headings) =====
type CurryRow = {
  Season_year: string;
  Season_div: string;
  Date: string;
  OPP: string;
  Result: string;
  "T Score": string;
  "O Score": string;
  MIN: string;
  FG: string;
  FGM: string;
  FGA: string;
  "FG%": string;
  "3PT": string;
  "3PTM": string;
  "3PTA": string;
  "3P%": string;
  FT: string;
  FTM: string;
  FTA: string;
  "FT%": string;
  REB: string;
};

type Props = {
  csvUrl?: string;
  portraitUrl?: string;
  title?: string;
};

type LocalFile = File;

export default function StephenCurryDashboard({
  csvUrl = "/curry.csv",
  portraitUrl = "https://i.imgur.com/Jr2kNl2.png",
  title = "Stephen Curry",
}: Props) {
  const [rows, setRows] = useState<CurryRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>();
  const [seasonDiv, setSeasonDiv] = useState<string>("All");
  const [seasonYear, setSeasonYear] = useState<string>("All");

  // Load CSV (remote url)
  useEffect(() => {
    setLoading(true);
    setError(undefined);

    if (csvUrl) {
      parse<CurryRow>(csvUrl, {
        download: true,
        header: true,
        dynamicTyping: false,
        skipEmptyLines: true,
        complete: (results: ParseResult<CurryRow>) => {
          const data = (results.data || []).filter(Boolean) as CurryRow[];
          setRows(data);
          setLoading(false);
        },
        error: (err) => {
          setError(err?.message || "Failed to parse CSV");
          setLoading(false);
        },
      });
    } else {
      setError("No CSV source provided.");
      setLoading(false);
    }
  }, [csvUrl]);

  // Helpers
  const toNum = (v?: string) => {
    if (!v) return 0;
    const n = Number(String(v).replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const ptsFromLine = (r: CurryRow) => {
    const fgm = toNum(r.FGM);
    const tpm = toNum(r["3PTM"]);
    const ftm = toNum(r.FTM);
    return (fgm - tpm) * 2 + tpm * 3 + ftm;
    // (2PT makes)*2 + (3PT makes)*3 + FT makes
  };

  // Filters
  const seasonYears = useMemo(() => {
    const set = new Set(rows.map((r) => r.Season_year));
    return ["All", ...Array.from(set).sort()];
  }, [rows]);

  const seasonDivs = useMemo(() => {
    const set = new Set(rows.map((r) => r.Season_div));
    return ["All", ...Array.from(set)];
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const okDiv = seasonDiv === "All" || r.Season_div === seasonDiv;
      const okYear = seasonYear === "All" || r.Season_year === seasonYear;
      return okDiv && okYear;
    });
  }, [rows, seasonDiv, seasonYear]);

  // Aggregates
  const agg = useMemo(() => {
    const games = filtered.length;
    const sums = filtered.reduce(
      (acc, r) => {
        const fgm = toNum(r.FGM);
        const fga = toNum(r.FGA);
        const tpm = toNum(r["3PTM"]);
        const tpa = toNum(r["3PTA"]);
        const ftm = toNum(r.FTM);
        const fta = toNum(r.FTA);
        const reb = toNum(r.REB);
        const pts = ptsFromLine(r);
        const min = toNum(r.MIN);
        return {
          games,
          pts: acc.pts + pts,
          fgm: acc.fgm + fgm,
          fga: acc.fga + fga,
          tpm: acc.tpm + tpm,
          tpa: acc.tpa + tpa,
          ftm: acc.ftm + ftm,
          fta: acc.fta + fta,
          reb: acc.reb + reb,
          min: acc.min + min,
          wins: acc.wins + (r.Result?.trim().startsWith("W") ? 1 : 0),
        };
      },
      { games: 0, pts: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0, reb: 0, min: 0, wins: 0 }
    );

    const avg = (v: number) => (filtered.length ? v / filtered.length : 0);

    return {
      games,
      wins: sums.wins,
      winPct: games ? Math.round((sums.wins / games) * 100) : 0,
      ppg: avg(sums.pts),
      rpg: avg(sums.reb),
      mpg: avg(sums.min),
      fgPct: sums.fga ? (sums.fgm / sums.fga) * 100 : 0,
      tpPct: sums.tpa ? (sums.tpm / sums.tpa) * 100 : 0,
      ftPct: sums.fta ? (sums.ftm / sums.fta) * 100 : 0,
      totals: sums,
    };
  }, [filtered]);

  // Series for charts
  const seriesByGame = useMemo(() => {
    return filtered.map((r, idx) => ({
      i: idx + 1,
      date: r.Date,
      opp: r.OPP,
      pts: ptsFromLine(r),
      tpm: toNum(r["3PTM"]),
      reb: toNum(r.REB),
      min: toNum(r.MIN),
    }));
  }, [filtered]);

  // Donut data (total makes by type)
  const scoringBreakdown = useMemo(() => {
    const twoPM = filtered.reduce((s, r) => s + Math.max(0, toNum(r.FGM) - toNum(r["3PTM"])), 0);
    const threePM = filtered.reduce((s, r) => s + toNum(r["3PTM"]), 0);
    const ftM = filtered.reduce((s, r) => s + toNum(r.FTM), 0);
    return [
      { name: "2PT Makes", value: twoPM, color: "#4FC3F7" },
      { name: "3PT Makes", value: threePM, color: "#FDB927" },
      { name: "FT Makes", value: ftM, color: "#1D428A" },
    ];
  }, [filtered]);

  const Stat = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl px-4 py-3 shadow-soft">
      <div className="text-[11px] uppercase tracking-wide text-white/60">{label}</div>
      <div className="text-2xl font-semibold leading-tight">{value}</div>
      {sub && <div className="text-xs text-white/50">{sub}</div>}
    </div>
  );

  if (loading) {
    return (
      <section className="rounded-2xl bg-white/5 border border-white/10 p-10 text-center">
        Loading Curry CSV…
      </section>
    );
  }
  if (error) {
    return (
      <section className="rounded-2xl bg-white/5 border border-white/10 p-10">
        <div className="text-red-300 font-medium mb-2">Failed to load CSV</div>
        <div className="text-white/70 text-sm">{error}</div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header / Filters */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={seasonDiv}
            onChange={(e) => setSeasonDiv(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:ring-2 ring-warriorsGold/40"
          >
            {seasonDivs.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={seasonYear}
            onChange={(e) => setSeasonYear(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:ring-2 ring-warriorsGold/40"
          >
            {seasonYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Hero + Orbits */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Left orbit */}
          <div className="grid gap-3">
            <Stat label="Games" value={`${agg.games}`} sub={`${agg.wins} W • ${agg.games - agg.wins} L • ${agg.winPct}%`} />
            <Stat label="PPG" value={agg.ppg.toFixed(1)} sub="Points per game" />
            <Stat label="MPG" value={agg.mpg.toFixed(1)} sub="Minutes per game" />
          </div>

          {/* Center portrait */}
          <div className="relative mx-auto">
            <div className="absolute inset-0 -z-10 animate-[spin_18s_linear_infinite]">
              <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-warriorsGold/20 to-warriorsBlue/30 blur-xl" />
            </div>
            <div className="relative w-64 h-64 rounded-full border-4 border-white/10 overflow-hidden shadow-2xl">
              <img
                src={portraitUrl}
                alt="Stephen Curry"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-full" />
            </div>
            <div className="text-center mt-3">
              <div className="text-lg font-semibold">Stephen Curry</div>
              <div className="text-xs text-white/60">G • Golden State Warriors</div>
            </div>
          </div>

          {/* Right orbit */}
          <div className="grid gap-3">
            <Stat label="FG%" value={`${agg.fgPct.toFixed(1)}%`} sub={`${agg.totals.fgm} / ${agg.totals.fga}`} />
            <Stat label="3PT%" value={`${agg.tpPct.toFixed(1)}%`} sub={`${agg.totals.tpm} / ${agg.totals.tpa}`} />
            <Stat label="FT%" value={`${agg.ftPct.toFixed(1)}%`} sub={`${agg.totals.ftm} / ${agg.totals.fta}`} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Points by game (line) */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="text-sm font-medium mb-2">Points by Game</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={seriesByGame}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="i" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip
                  contentStyle={{
                    background: "#0B0F1A",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                  labelFormatter={(i) => `Game #${i}`}
                  formatter={(v: any, n: string) => [v, n.toUpperCase()]}
                />
                <Line type="monotone" dataKey="pts" stroke="#FDB927" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-white/60 mt-2">Computed as 2PM×2 + 3PM×3 + FTM</div>
        </div>

        {/* 3PM per game (bar) */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="text-sm font-medium mb-2">3PT Makes per Game</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seriesByGame}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="i" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip
                  contentStyle={{
                    background: "#0B0F1A",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                  labelFormatter={(i) => `Game #${i}`}
                />
                <Bar dataKey="tpm" fill="#1D428A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-white/60 mt-2">Higher bars = hotter shooting nights from deep.</div>
        </div>

        {/* Scoring Breakdown (donut) */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="text-sm font-medium mb-2">Scoring Breakdown (Makes)</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoringBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="80%"
                  paddingAngle={2}
                  isAnimationActive
                >
                  {scoringBreakdown.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  wrapperStyle={{ color: "#fff" }}
                />
                <Tooltip
                  formatter={(v: any, n: string) => [`${v}`, n]}
                  contentStyle={{
                    background: "#0B0F1A",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-white/60 mt-2">Distribution of total 2PT, 3PT and FT makes for selected filters.</div>
        </div>
      </div>

      {/* (Removed Recent Games block per last iteration) */}
    </section>
  );
}

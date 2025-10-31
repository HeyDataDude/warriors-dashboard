import { Card, SectionTitle } from "./Card";
import { Event } from "../types";
import { transformEvents } from "../utils";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export default function RecentGames({ events }: { events: Event[] }) {
  const chart = transformEvents(events);

  return (
    <div id="games">
      <Card className="p-4">
        <SectionTitle>Recent Games</SectionTitle>

        <div className="h-56 my-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip wrapperStyle={{
                background: "#0B0F1A",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: 8,
                color: "white"
              }} />
              <Line type="monotone" dataKey="forPts" stroke="#FDB927" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="againstPts" stroke="#1D428A" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {events.slice(0, 6).map(e => {
            const home = e.strHomeTeam.toLowerCase().includes("warriors");
            const forPts = Number(home ? e.intHomeScore : e.intAwayScore) || 0;
            const againstPts = Number(home ? e.intAwayScore : e.intHomeScore) || 0;
            const result = forPts === againstPts ? "T" : (forPts > againstPts ? "W" : "L");
            return (
              <li key={e.idEvent} className="rounded-xl bg-white/5 border border-white/10 p-3 flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-medium truncate" title={e.strEvent}>{e.strEvent}</div>
                  <div className="text-white/60">{e.dateEvent}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{forPts} - {againstPts}</div>
                  <div className={`text-xs ${result==="W"?"text-green-400": result==="L"?"text-red-400":"text-white/60"}`}>{result}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

import Shell from "./components/Shell";
import TeamHero from "./components/TeamHero";
import Roster from "./components/Roster";
import RecentGames from "./components/RecentGames";
import { Loader, ErrorState } from "./components/States";
import { useAsync } from "./hooks";
import { getTeam, getPlayers, getRecentEvents } from "./api";
import { RosterSkeleton } from "./components/Roster";

export default function App() {
  const team = useAsync(getTeam, []);
  const players = useAsync(getPlayers, []);
  const games = useAsync(getRecentEvents, []);

  const loading = team.loading || players.loading || games.loading;
  const error = team.error || players.error || games.error;

  return (
    <Shell>
      {loading && <Loader />}
      {error && <ErrorState message={error} />}

      {!loading && !error && (
        <div className="space-y-6">
          <TeamHero team={team.data} />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Roster players={players.data || []} />
            </div>
            <div>
              <RecentGames events={games.data || []} />
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}

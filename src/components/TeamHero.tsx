import { Card } from "./Card";
import { Team } from "../types";

export default function TeamHero({ team }: { team?: Team }) {
  if (!team) return null;

  return (
    <div id="team">
      <Card className="overflow-hidden">
        <div className="relative">
          {team.strTeamBanner ? (
            <img
              src={team.strTeamBanner}
              alt={team.strTeam}
              className="w-full h-48 sm:h-56 object-cover opacity-90"
            />
          ) : (
            <div className="w-full h-48 sm:h-56 bg-warriorsBlue/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-warriorsBg to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4">
            {team.strTeamBadge && (
              <img src={team.strTeamBadge} alt="badge" className="h-16 w-16 drop-shadow-xl" />
            )}
            <div className="min-w-0">
              <div className="text-2xl font-bold truncate">{team.strTeam}</div>
              <div className="text-white/70 text-sm">
                {team.strLeague} • Est. {team.intFormedYear} • {team.strStadium}
              </div>
            </div>
          </div>
        </div>
        {team.strDescriptionEN && (
          <p className="p-4 text-sm text-white/80 leading-relaxed">
            {team.strDescriptionEN.split(". ").slice(0, 2).join(". ") + "."}
          </p>
        )}
      </Card>
    </div>
  );
}

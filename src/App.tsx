// src/App.tsx
import HeroShowcase from "./components/HeroShowcase";
import RecentGames from "./components/RecentGames";
import Roster from "./components/Roster";
import Shell from "./components/Shell";
import TeamHero from "./components/TeamHero";
import { Loader, ErrorState } from "./components/States";
import { useAsync } from "./hooks";
import { getPlayers, getRecentEvents } from "./api";
import heroImage from "./assets/2.webp";

function SectionHeader({
  id,
  title,
  subtitle,
  right,
  headingId, 
}: {
  id: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  headingId?: string;
}) {
  const hId = headingId ?? `${id}-heading`;
  return (
    <div id={id} className="scroll-mt-24 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2
          id={hId}
          className="truncate"
          style={{
            fontFamily: "Bebas Neue, Montserrat, sans-serif",
            fontSize: 28,
            letterSpacing: 0.3,
            lineHeight: 1.05,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-white/70 text-sm md:text-[13.5px]">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}

export default function App() {
  const players = useAsync(getPlayers, []);
  const games = useAsync(getRecentEvents, []);

  const loading = players.loading || games.loading;
  const error = players.error || games.error;

  return (
    <Shell>
      {loading && <Loader />}
      {error && <ErrorState message={error} />}

      {!loading && !error && (
        <>
          {/* Full-bleed hero */}
          <HeroShowcase
            imageUrl={heroImage}
            kicker="2025 Season"
            title="Relentless. Resilient. Warriors."
            subtitle="Strength in Numbers"
            ctaPrimary={{ label: "View Recent Games", href: "#games" }}
            ctaSecondary={{ label: "Browse Roster", href: "#roster" }}
          />

          {/* Recent Game Content */}
          <div className="max-w-7xl mx-auto px-5 space-y-10 md:space-y-12">
            <section id="games" aria-labelledby="games-heading" className="space-y-4">
              <SectionHeader
                id="games"
                headingId="games-heading"
                title="Recent Games"
                subtitle="Latest results and momentum snapshot"
                right={
                  <a
                    href="#roster"
                    className="hidden sm:inline-flex items-center gap-2 text-[13px] px-3 py-1.5 rounded-lg bg-white/10 ring-1 ring-inset ring-white/15 hover:bg-white/15 transition focus:outline-none focus:ring-2"
                  >
                    Jump to Roster
                  </a>
                }
              />
              <RecentGames events={games.data || []} />
            </section>

            {/* Roster */}
            <section id="roster" aria-labelledby="roster-heading" className="space-y-4">
              <SectionHeader
                id="roster"
                headingId="roster-heading"
                title="Roster"
                subtitle="Players, roles, and availability"
                right={
                  <a
                    href="#games"
                    className="hidden sm:inline-flex items-center gap-2 text-[13px] px-3 py-1.5 rounded-lg bg-white/10 ring-1 ring-inset ring-white/15 hover:bg-white/15 transition focus:outline-none focus:ring-2"
                  >
                    Back to Recent Games
                  </a>
                }
              />
              <Roster players={players.data || []} />
              <TeamHero />
            </section>
          </div>
        </>
      )}
    </Shell>
  );
}

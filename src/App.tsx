// src/App.tsx
import Shell from "./components/Shell";
import TeamHero from "./components/TeamHero";
import Roster from "./components/Roster";
import RecentGames from "./components/RecentGames";
import { Loader, ErrorState } from "./components/States";
import { useAsync } from "./hooks";
import {  getPlayers, getRecentEvents } from "./api";
import HeroShowcase from "./components/HeroShowcase";
import heroImage from "./assets/2.webp";


function SectionHeader({
  id,
  title,
  subtitle,
  right,
}: {
  id: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-24 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2
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

  const loading =  players.loading || games.loading;
  const error =  players.error || games.error;

  return (
    <Shell>
      {loading && <Loader />}
      {error && <ErrorState message={error} />}

      {!loading && !error && (
        <>
          {/* FULL-BLEED HERO (sits flush beneath the navbar) */}
          <HeroShowcase
            imageUrl={heroImage}
            kicker="2025 Season"
            title="Relentless. Resilient. Warriors."
            subtitle="Strength in Numbers"
            ctaPrimary={{ label: "View Recent Games", href: "#games" }}
            ctaSecondary={{ label: "Browse Roster", href: "#roster" }}
            // roundedBottom={false} // uncomment for a straight bottom edge
          />

          {/* CONSTRAINED CONTENT */}
          <div className="max-w-7xl mx-auto px-5 space-y-10 md:space-y-12">
            {/* Team hero (keeps its own id="team" internally) */}
            

            {/* Recent Games ABOVE Roster */}
            <section aria-labelledby="recent-games-heading" className="space-y-4">
              <SectionHeader
                id="games"
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
            <section aria-labelledby="roster-heading" className="space-y-4">
              <SectionHeader
                id="roster"
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
              <div className="space-y-6">

    </div>
              <TeamHero  />
            </section>
          </div>
        </>
      )}
    </Shell>
  );
}

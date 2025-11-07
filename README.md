Golden State Warriors — Fan Dashboard

A fast, responsive dashboard for Warriors fans. It pulls real team/player data from TheSportsDB, showcases recent games, a browsable roster, and an optional Stephen Curry mini-analytics panel (CSV-driven).

🚀 Live Demo & Repo

        Repository: https://github.com/HeyDataDude/warriors-dashboard

✨ Highlights

        Clean architecture: clear separation of API, hooks, components, and types.

        Real data: team, roster, last game from TheSportsDB.

        Responsive UI: mobile → desktop, fluid and accessible.

        Nice touches: parallax hero, championship banners, modal with focus trap, reduced-motion support.

        Type-safe: strict TypeScript types for API models.

        Error handling: fallbacks and skeleton states.

🧱 Tech Stack

        Build: Vite + TypeScript + React

        UI: Tailwind CSS

        Charts: Recharts

        HTTP: Axios

        CSV parsing (Curry panel): PapaParse

📦 Getting Started
        # 1) Install
        npm install

        # 2) (Optional) Configure environment
        #    Create a .env file in the project root:
        #    VITE_API_BASE=https://www.thesportsdb.com/api/v1/json/123
        #    VITE_TEAM_ID=134865   # Golden State Warriors

        # 3) Run locally
        npm run dev   # http://localhost:5173

        # 4) Build & Preview
        npm run build
        npm run preview


        You can also run it with the default env (it falls back to TheSportsDB public demo key and Warriors team id).

🔑 Environment Variables

        A .env file (optional):

        VITE_API_BASE=https://www.thesportsdb.com/api/v1/json/123
        VITE_TEAM_ID=134865


        VITE_API_BASE – TheSportsDB base URL.

        VITE_TEAM_ID – team ID (Warriors default: 134865).

📁 Project Structure
        src/
        api.ts                 # axios calls (players, recent events) + safeFetch helper
        types.ts               # Team, Player, Event interfaces
        utils.ts               # transform helpers (e.g., events → chart series)
        hooks/
            index.ts             # useAsync hook (loading/error/data + refetch)
        components/
            Shell.tsx            # app shell (header, footer, textures, install prompt)
            HeroShowcase.tsx     # full-bleed hero, parallax, portal modal opener
            ChampionshipBanners*.tsx # decorative championship pennants
            TeamHero.tsx         # team banner + meta + CTAs
            RecentGames.tsx      # last game view (chart/summary)
            Roster.tsx           # search-by-name + position chips, modal per player
            PlayerCard.tsx       # individual player tile
            Card.tsx             # UI card primitives + SectionTitle
            Modal.tsx            # accessible modal (focus trap, ESC, backdrop lock)
            States.tsx           # Loader / Error UI
            Skeleton.tsx         # skeleton blocks
            StephenCurryDashboard.tsx # optional CSV mini-dashboard for #30
        App.tsx                # composition of sections
        main.tsx               # React entry (Vite)
        assets/                # images and CSV (e.g., curry.csv)

🔌 Data Sources (TheSportsDB)

        Team Info: lookupteam.php?id=134865 , (This doesnt give Golden State Warriors data so I had to work around)

        Players: lookup_all_players.php?id=134865

        Recent Games: eventslast.php?id=134865 (Note: this API often returns only the last game. The UI adapts to that single-game mode.)
import { ReactNode } from "react";

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-warriorsBg text-white">
      <header className="sticky top-0 z-20 backdrop-blur bg-warriorsBg/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-warriorsGold text-warriorsBg font-black grid place-items-center">
              W
            </div>
            <div className="leading-tight">
              <div className="font-semibold">Golden State Warriors</div>
              <div className="text-xs text-textMuted">Fan Dashboard (Demo)</div>
            </div>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-textMuted">
            <a href="#team" className="hover:text-white">Team</a>
            <a href="#roster" className="hover:text-white">Roster</a>
            <a href="#games" className="hover:text-white">Games</a>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      <footer className="py-10 text-center text-xs text-white/50">
        Data: TheSportsDB • Built by Zain
      </footer>
    </div>
  );
}

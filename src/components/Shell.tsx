import { ReactNode, useEffect, useRef, useState } from "react";
import logo from "../assets/warriors-logo1.png";

type ShellProps = {
  children: ReactNode;
  logoUrl?: string;
  title?: string;
  subtitle?: string;
};

// Minimal typing for the PWA install event
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function Shell({
  children,
  logoUrl = logo,
  title = "GOLDEN STATE WARRIORS",
  subtitle = "Operations Dashboard",
}: ShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [canInstall, setCanInstall] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  /* Respect OS-level “Reduced Motion” */
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(!!mq?.matches);
    apply();
    mq?.addEventListener?.("change", apply);
    return () => mq?.removeEventListener?.("change", apply);
  }, []);

  /* Load fonts (unloaded on unmount) */
  useEffect(() => {
    const head = document.head;
    const pre1 = document.createElement("link");
    pre1.rel = "preconnect";
    pre1.href = "https://fonts.googleapis.com";

    const pre2 = document.createElement("link");
    pre2.rel = "preconnect";
    pre2.href = "https://fonts.gstatic.com";
    pre2.crossOrigin = "";

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Bebas+Neue:wght@400&family=Montserrat:wght@400;500;600;700&display=swap";

    head.append(pre1, pre2, link);
    return () => {
      try {
        head.removeChild(pre1);
        head.removeChild(pre2);
        head.removeChild(link);
      } catch {}
    };
  }, []);

  /* PWA install prompt */
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler as EventListener);
    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    setCanInstall(false);
  };

  /* Scroll progress + header style */
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const el = document.documentElement;
        const h = Math.max(1, el.scrollHeight - el.clientHeight);
        setProgress(Math.min(100, Math.max(0, (el.scrollTop / h) * 100)));
        setAtTop(el.scrollTop < 8);
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const W_BLUE = "#1D428A";
  const W_GOLD = "#FFC72C";

  /* In-page anchor link with smooth scroll and focus management */
  const NavLink = ({ href, children }: { href: string; children: ReactNode }) => (
    <a
      href={href}
      onClick={(e) => {
        if (!href.startsWith("#")) return;
        e.preventDefault();
        setMobileOpen(false);
        smoothScrollToHash(href);
        history.pushState(null, "", href);
      }}
      className="group relative text-[13.5px] md:text-sm font-semibold tracking-tight text-white/85 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
      style={{ textShadow: "0 0 10px rgba(255,199,44,0.08)" }}
    >
      {children}
      <span
        className="absolute -bottom-2 left-0 h-[3px] w-0 transition-all duration-300 ease-out group-hover:w-full"
        style={{ backgroundColor: W_GOLD }}
        aria-hidden="true"
      />
    </a>
  );

  const HEADER_OFFSET_PX = 76;

  function smoothScrollToHash(hash: string) {
    const id = hash.replace(/^#/, "");
    const target = document.getElementById(id);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const absoluteTop = window.pageYOffset + rect.top;
    const top = Math.max(absoluteTop - HEADER_OFFSET_PX, 0);

    window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });

    // move focus to target after scroll completes
    setTimeout(() => {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }, reducedMotion ? 0 : 420);
  }

  /* Handle initial hash and future hash changes */
  useEffect(() => {
    const handleHash = () => {
      if (!location.hash) return;
      setTimeout(() => smoothScrollToHash(location.hash), 40);
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [reducedMotion]);

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      /* Multi-layer background: film grain, faint grid, brand glows, and base gradient */
      style={{
        backgroundImage: [
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E\")",
          "linear-gradient(135deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          "radial-gradient(1200px 600px at 8% -10%, rgba(255,199,44,0.08) 0%, transparent 90%)",
          "radial-gradient(900px 500px at 110% 15%, rgba(0,74,173,0.18) 0%, transparent 60%)",
          "radial-gradient(800px 400px at 50% 110%, rgba(18,34,60,0.25) 0%, transparent 70%)",
          "linear-gradient(180deg, #0A1224 0%, #0B0F1A 40%, #050709 100%)",
        ].join(", "),
        backgroundSize: "auto, 24px 24px, auto, auto, auto, auto",
        backgroundBlendMode: "overlay, soft-light, normal, normal, normal, normal",
        backgroundAttachment: "fixed",
        fontFamily:
          'Montserrat, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
        colorScheme: "dark",
      }}
    >
      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded-lg"
      >
        Skip to content
      </a>

      {/* Scroll progress */}
      <div
        className="fixed top-0 left-0 h-[3px] z-50 will-change-[width,opacity,transform]"
        style={{
          width: `${progress}%`,
          background: `linear-gradient(90deg, rgba(255,199,44,0.2), ${W_GOLD}, rgba(255,199,44,0.2))`,
          boxShadow: "0 0 16px rgba(255,199,44,0.6)",
          opacity: progress > 1 ? 1 : 0,
          transformOrigin: "left",
          transition: reducedMotion
            ? undefined
            : "width 600ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease",
        }}
        aria-hidden="true"
      />

      {/* Header */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: atTop
            ? "linear-gradient(180deg, rgba(9,16,26,0.25), rgba(9,16,26,0))"
            : "rgba(13, 20, 34, 0.72)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: atTop ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.1)",
          transition: "background 250ms ease, border-color 250ms ease",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-5">
          <div className="flex items-center justify-between py-2.5 md:py-3">
            {/* Brand */}
            <div className="flex items-center gap-3 md:gap-4">
              <div
                className="h-12 w-12 md:h-[54px] md:w-[54px] rounded-2xl grid place-items-center ring-1 ring-inset ring-white/10 shadow"
                style={{ backgroundColor: W_GOLD, color: W_BLUE }}
                aria-label="GSW mark"
              >
                <img
                  src={logoUrl}
                  alt="Golden State Warriors Logo"
                  className="h-12 w-12 md:h-11 md:w-11 object-contain"
                  draggable={false}
                />
              </div>
              <div className="leading-tight select-none">
                <div
                  className="tracking-tight"
                  style={{
                    fontFamily: "Bebas Neue, Montserrat, sans-serif",
                    fontSize: 24,
                    letterSpacing: 0.3,
                    lineHeight: 1,
                  }}
                >
                  {title}
                </div>
                <div className="text-[11px] text-white/70">{subtitle}</div>
              </div>
            </div>

            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-6">
              <nav className="flex items-center gap-6" aria-label="Primary navigation">
                <NavLink href="#games">Games</NavLink>
                <NavLink href="#roster">Roster</NavLink>
                <NavLink href="#team">About</NavLink>
              </nav>

              {canInstall && (
                <button
                  type="button"
                  onClick={handleInstall}
                  className="ml-1 hidden md:inline-flex items-center gap-2 text-[13px] px-3 py-1.5 rounded-lg transition focus:outline-none focus:ring-2 hover:brightness-110"
                  style={{
                    backgroundColor: W_GOLD,
                    color: W_BLUE,
                    boxShadow: "0 8px 20px rgba(255,199,44,0.25)",
                  }}
                  title="Install App"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M12 3v10.586l3.293-3.293 1.414 1.414L12 17.414l-4.707-4.707 1.414-1.414L11 13.586V3h1ZM5 19h14v2H5z" />
                  </svg>
                  <span className="font-semibold">Install</span>
                </button>
              )}
            </div>

            {/* Mobile */}
            <div className="sm:hidden flex items-center gap-2">
              {canInstall && (
                <button
                  type="button"
                  onClick={handleInstall}
                  className="text-xs px-2 py-1 rounded-lg focus:outline-none focus:ring-2"
                  style={{ backgroundColor: W_GOLD, color: W_BLUE }}
                  title="Install App"
                >
                  Install
                </button>
              )}
              <button
                type="button"
                className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition focus:outline-none focus:ring-2"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            id="mobile-nav"
            className="sm:hidden border-t border-white/10 backdrop-blur-xl"
            style={{ backgroundColor: "rgba(13,20,34,0.86)" }}
          >
            <div className="px-4 py-3 space-y-3 text-sm">
              {["Games", "Roster", "Team"].map((label) => (
                <a
                  key={label}
                  href={`#${label.toLowerCase()}`}
                  onClick={() => setMobileOpen(false)}
                  className="block py-1.5 text-white/90 hover:text-white"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main id="main">{children}</main>

      {/* Footer */}
      <footer className="mt-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-5 py-8 text-sm text-white/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="opacity-80">Data:</span>
            <a className="hover:text-white" href="https://www.thesportsdb.com/" target="_blank" rel="noreferrer">
              TheSportsDB
            </a>
            <span className="opacity-30">•</span>
            <a className="hover:text-white" href="https://www.nba.com/warriors" target="_blank" rel="noreferrer">
              nba.com/warriors
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/30">|</span>
            <span>© {new Date().getFullYear()} (Zain Raza)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

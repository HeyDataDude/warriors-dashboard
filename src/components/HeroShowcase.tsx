import { useEffect, useRef, useState, Suspense, lazy, useCallback } from "react";
import { createPortal } from "react-dom";
import ChampionshipBanners from "./ChampionshipBanners";
import curryimg from "../assets/curry.png";
import currycsv from "../assets/CSV-Data/curry.csv?url";

const StephenCurryDashboard = lazy(() => import("../components/StephenCurryDashboard"));

type Props = {
  imageUrl: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  roundedBottom?: boolean;
};

const W_GOLD = "#FFC72C";

export default function HeroShowcase({
  imageUrl,
  kicker,
  title,
  subtitle,
  roundedBottom = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion & view state
  const [reducedMotion, setReducedMotion] = useState(false);
  const [parallax, setParallax] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [mountedAnim, setMountedAnim] = useState(false); // modal entry animation

  /* Respect user “Reduced Motion” preference */
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(!!mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  /* Parallax transform on scroll (skips when reduced motion is on) */
  useEffect(() => {
    if (reducedMotion) return;
    const el = containerRef.current;
    if (!el) return;

    let raf = 0;
    const onScrollOrResize = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const viewport = Math.max(1, window.innerHeight);
        const progress = Math.min(1, Math.max(0, 1 - rect.top / viewport));
        setParallax(progress);
        raf = 0;
      });
    };

    onScrollOrResize();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  /* Modal: lock page scroll, ESC to close, and stage entry animation */
  useEffect(() => {
    if (!showStats) return;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowStats(false);
    window.addEventListener("keydown", onKey);

    const body = document.body;
    const html = document.documentElement;
    const hasScrollbar = window.innerWidth > html.clientWidth;
    const scrollPad = hasScrollbar ? window.innerWidth - html.clientWidth : 0;

    const prevOverflow = body.style.overflow;
    const prevPadRight = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (scrollPad) body.style.paddingRight = `${scrollPad}px`;

    const t = requestAnimationFrame(() => setMountedAnim(true));

    return () => {
      window.removeEventListener("keydown", onKey);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadRight;
      setMountedAnim(false);
      cancelAnimationFrame(t);
    };
  }, [showStats]);

  /* Smooth-scroll to top, then open modal */
  const openStats = useCallback(() => {
    const start = window.scrollY || window.pageYOffset;
    if (start <= 4) {
      setShowStats(true);
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    let raf = 0;
    const check = () => {
      if ((window.scrollY || window.pageYOffset) <= 4) {
        setShowStats(true);
      } else {
        raf = requestAnimationFrame(check);
      }
    };
    raf = requestAnimationFrame(check);
    // Safety: ensure modal opens if rAF is throttled
    setTimeout(() => {
      cancelAnimationFrame(raf);
      setShowStats(true);
    }, 900);
  }, []);

  return (
    <section
      ref={containerRef}
      aria-label="Hero"
      className={[
        "-mx-[calc(50vw-50%)] w-[100vw]",
        "relative isolate overflow-hidden grid content-end",
        "min-h-[56svh] sm:min-h-[62svh] md:min-h-[70svh]",
        roundedBottom ? "md:rounded-b-[28px]" : "",
        "mt-0",
        "mb-10 sm:mb-12 md:mb-16 lg:mb-20",
      ].join(" ")}
      style={{ scrollMarginTop: "80px" }}
    >
      {/* Background image with parallax transform (decorative) */}
      <div
        className="absolute inset-0"
        style={{
          transform: reducedMotion
            ? "translateY(0) scale(1.04)"
            : `translateY(${(-parallax * 18).toFixed(1)}px) scale(${(1.04 + parallax * 0.03).toFixed(3)})`,
          transition: reducedMotion ? "transform 200ms ease-out" : undefined,
          willChange: "transform",
        }}
      >
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover select-none"
          draggable={false}
          loading="lazy"
          decoding="async"
          sizes="100vw"
        />
      </div>

      {/* Texture + vignette overlays (decorative only) */}
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[rgba(9,16,26,0.92)] via-[rgba(9,16,26,0.35)] to-transparent"
        aria-hidden="true"
      />

      {/* Championship banners  */}
      <ChampionshipBanners
        items={[
          { year: 1947, note: "4–1 CHI (BAA)" },
          { year: 1956, note: "4–1 FTW" },
          { year: 1975, note: "4–0 WSB" },
          { year: 2015, note: "4–2 CLE" },
          { year: 2017, note: "4–1 CLE" },
          { year: 2018, note: "4–0 CLE" },
          { year: 2022, note: "4–2 BOS" },
        ]}
        offsetRightPx={20}
        offsetTopPx={0}
        width={46}
        mobileMode="hide"
        stagger={110}
        intensity={1}
      />

      {/* Text card */}
      <div className="relative z-10 pb-6 sm:pb-8 md:pb-10">
        <div className="mx-auto max-w-7xl px-5">
          <div
            className="w-full sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] rounded-2xl backdrop-blur-xl bg-white/5 ring-1 ring-inset ring-white/10 p-4 sm:p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            style={{
              transform: reducedMotion ? "none" : `translateY(${(12 - parallax * 12).toFixed(1)}px)`,
              transition: "transform 200ms ease-out",
            }}
          >
            {kicker && (
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 ring-1 ring-inset ring-white/15 text-[11.5px] text-white/85 mb-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: W_GOLD }}
                  aria-hidden="true"
                />
                {kicker}
              </div>
            )}
            <h1
              className="leading-[1.02] tracking-tight"
              style={{
                fontFamily: "Bebas Neue, Montserrat, sans-serif",
                fontSize: "clamp(28px, 5.2vw, 54px)",
                letterSpacing: 0.4,
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-white/85 text-sm md:text-[13.5px] leading-relaxed">{subtitle}</p>
            )}
          </div>

          {roundedBottom && (
            <div
              className="mt-5 h-[3px] w-24 rounded-full"
              style={{ background: `linear-gradient(90deg, ${W_GOLD}, transparent)` }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* FAB: opens Curry modal */}
      <button
        type="button"
        onClick={openStats}
        className="group absolute z-20 right-5 bottom-5 sm:right-7 sm:bottom-7 h-14 w-14 sm:h-[60px] sm:w-[60px] rounded-full
                   bg-[rgba(255,199,44,1)] text-[#0B0F1A] shadow-[0_14px_36px_rgba(253,185,39,0.35)]
                   ring-1 ring-[#FFE08A]/50 hover:shadow-[0_18px_44px_rgba(253,185,39,0.5)]
                   transition-transform hover:scale-[1.04] active:scale-[0.98] focus:outline-none focus:ring-2
                   flex items-center justify-center"
        aria-label="Open Stephen Curry Advanced Stats"
        title="Open Stephen Curry Advanced Stats"
      >
        <span className="font-black text-[18px] leading-none">30</span>
      </button>

      {/* Modal rendered via portal to avoid stacking/overflow issues */}
      {showStats &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] grid place-items-center 
                       bg-black/55 backdrop-blur-md p-4 transition-opacity duration-300"
            style={{ opacity: mountedAnim ? 1 : 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Stephen Curry Advanced Stats"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowStats(false); // backdrop close
            }}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-[min(1100px,100%)] max-h-[calc(100vh-2rem)] overflow-auto
                         rounded-2xl border border-white/12 bg-warriorsBg shadow-2xl
                         transition-transform duration-300"
              style={{
                transform: mountedAnim ? "translateY(0) scale(1)" : "translateY(10px) scale(0.97)",
              }}
            >
              {/* Sticky modal header with close */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0
                           bg-warriorsBg/95 backdrop-blur supports-[backdrop-filter]:bg-warriorsBg/80 z-10"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#FFC72C] text-[#0B0F1A] grid place-items-center font-black">
                    30
                  </div>
                  <div className="leading-tight">
                    <div className="font-semibold">Stephen Curry</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStats(false)}
                  className="rounded-lg p-2 hover:bg-white/10 focus:outline-none focus:ring-2"
                  aria-label="Close"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Modal body: lazily loaded Curry dashboard */}
              <div className="p-4 md:p-6">
                <Suspense
                  fallback={
                    <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
                      Loading advanced stats…
                    </div>
                  }
                >
                  <StephenCurryDashboard csvUrl={currycsv} portraitUrl={curryimg} />
                </Suspense>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}

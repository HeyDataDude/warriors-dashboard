// src/components/TeamHero.tsx
import { useEffect, useRef, useState } from "react";
import Card from "./Card";
import { Team } from "../types";
import bannerImg from "../assets/chase.webp";
import badgeImg from "../assets/warriors-logo.png";

export default function TeamHero({ team }: { team?: Team }) {
  // --- Static Golden State data (override API completely) ---
  const GSW = {
    strTeam: "Golden State Warriors",
    strTeamBanner: bannerImg,
    strTeamBadge: badgeImg,
    intFormedYear: "1946",
    strLeague: "NBA • Western Conference • Pacific Division",
    strStadium: "Chase Center (San Francisco, CA)",
    strDescriptionEN:
      "Founded in 1946, the Golden State Warriors are one of the NBA’s most storied franchises, known for pace-and-space offense, elite shooting, and modern dynasty runs. With a passionate Bay Area fanbase and a culture built on movement and unselfish play, the Warriors have reshaped how basketball is played at the highest level.",
  };

  const data = { ...GSW, ...team };

  const banner = data.strTeamBanner || "";
  const badge = data.strTeamBadge || "";
  const formed = data.intFormedYear || "—";
  const league = data.strLeague || "NBA";
  const stadium = data.strStadium || "Chase Center";
  const description =
    (data.strDescriptionEN || "")
      .split(". ")
      .slice(0, 2)
      .join(". ")
      .trim()
      .replace(/\.$/, "") + (data.strDescriptionEN ? "." : "");

  // --- Animations / reduced motion ---
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const set = () => setReducedMotion(!!mq?.matches);
    set();
    mq?.addEventListener?.("change", set);
    return () => mq?.removeEventListener?.("change", set);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setInView(true);
      },
      { threshold: 0.22 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const W_BLUE = "#1D428A";
  const W_GOLD = "#FFC72C";

  return (
    <div id="team" className="scroll-mt-24">
      <Card className="overflow-hidden relative ring-1 ring-white/10 bg-gradient-to-b from-white/5 to-transparent">
        {/* Banner */}
        <div
          ref={rootRef}
          className={[
            "relative w-full",
            // Responsive height: fluid on mobile to avoid squish
            "h-[42vh] min-h-[240px] sm:h-80 md:h-[22rem]",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
            "transition-all ease-out",
          ].join(" ")}
          style={{
            transitionDuration: reducedMotion ? "0ms" : "600ms",
          }}
        >
          {banner ? (
            <img
              src={banner}
              alt={`${data.strTeam} banner`}
              className="absolute inset-0 w-full h-full object-cover object-[50%_35%] select-none"
              draggable={false}
              style={{
                transform: reducedMotion
                  ? "scale(1)"
                  : mounted
                  ? "scale(1.075)"
                  : "scale(1.02)",
                transition: reducedMotion ? undefined : "transform 6000ms ease-out",
                willChange: "transform",
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_20%_10%,rgba(255,199,44,0.12),transparent_60%),radial-gradient(80%_50%_at_100%_0%,rgba(29,66,138,0.35),transparent_55%),linear-gradient(180deg,rgba(13,20,34,0.9),rgba(13,20,34,0.6))]" />
          )}

          {/* Overlays */}
          <div
            className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E\")",
            }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(9,16,26,0.95)] via-[rgba(9,16,26,0.35)] to-transparent" />
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{
              background:
                "radial-gradient(600px 260px at 20% 35%, rgba(255,199,44,0.16), transparent 60%)",
            }}
          />

          {/* Glass content strip */}
          <div className="absolute bottom-0 left-0 right-0 px-[max(16px,env(safe-area-inset-left))] pr-[max(16px,env(safe-area-inset-right))] pb-4">
            <div
              className={[
                "backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl",
                "p-3 sm:p-4 md:p-5",
                "shadow-[0_10px_40px_rgba(0,0,0,0.35)]",
                "transition-transform duration-300 ease-out hover:-translate-y-0.5",
              ].join(" ")}
            >
              {/* On mobile: stack vertically; on sm+: row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                {/* Badge */}
                {!!badge && (
                  <div
                    className="shrink-0 grid place-items-center rounded-xl sm:rounded-2xl bg-white/90 p-1.5 sm:p-2 ring-1 ring-inset ring-white/60 shadow-md mx-auto sm:mx-0"
                    style={{
                      transform: inView ? "translateY(0)" : "translateY(6px)",
                      transition: reducedMotion ? undefined : "transform 500ms 120ms ease-out",
                    }}
                  >
                    <img
                      src={badge}
                      alt={`${data.strTeam} badge`}
                      className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 object-contain"
                      draggable={false}
                    />
                  </div>
                )}

                {/* Title + meta */}
                <div className="min-w-0 flex-1">
                  <h1
                    className="truncate"
                    style={{
                      fontFamily: "Bebas Neue, Montserrat, sans-serif",
                      fontSize: 28,          // slightly smaller base
                      letterSpacing: 0.3,
                      lineHeight: 1.05,
                    }}
                  >
                    {data.strTeam}
                  </h1>

                  {/* Meta chips: scroll horizontally on small screens */}
                  <div className="mt-1.5 flex gap-2 text-[12.5px] text-white/80 overflow-x-auto sm:flex-wrap sm:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none]">
                    {/* hide scrollbar on WebKit */}
                    <style>{`.meta-hide::-webkit-scrollbar{display:none}`}</style>
                    <span className="meta-hide inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 ring-1 ring-inset ring-white/10 whitespace-nowrap">
                      <span className="opacity-80">League:</span>
                      <strong className="font-medium">{league}</strong>
                    </span>
                    <span className="meta-hide inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 ring-1 ring-inset ring-white/10 whitespace-nowrap">
                      <span className="opacity-80">Est.</span>
                      <strong className="font-medium">{formed}</strong>
                    </span>
                    <span className="meta-hide inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 ring-1 ring-inset ring-white/10 whitespace-nowrap">
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M4 21V9l8-6 8 6v12h-6v-6H10v6H4z" />
                      </svg>
                      <span className="truncate max-w-[12rem] sm:max-w-[18rem]">{stadium}</span>
                    </span>
                  </div>
                </div>

                {/* Desktop CTAs */}
                <div className="hidden sm:flex items-center gap-2">
                  <a
                    href="#roster"
                    className="inline-flex items-center justify-center gap-2 h-[40px] px-3.5 rounded-lg font-semibold text-[13px]
                               transition focus:outline-none focus:ring-2 hover:brightness-110"
                    style={{
                      backgroundColor: W_GOLD,
                      color: W_BLUE,
                      boxShadow: "0 6px 18px rgba(255,199,44,0.28)",
                    }}
                  >
                    View Roster
                  </a>
                  <a
                    href="#games"
                    className="inline-flex items-center justify-center gap-2 h-[40px] px-3.5 rounded-lg font-semibold text-[13px]
                               bg-white/10 ring-1 ring-inset ring-white/15 transition hover:bg-white/15 focus:outline-none focus:ring-2"
                  >
                    Recent Games
                  </a>
                </div>
              </div>

              {/* Description */}
              {description && (
                <p
                  className="mt-3 text-[13px] sm:text-[13.5px] text-white/85 leading-relaxed line-clamp-4 sm:line-clamp-3"
                  style={{
                    transform: inView ? "none" : "translateY(4px)",
                    opacity: inView ? 1 : 0,
                    transition: reducedMotion
                      ? undefined
                      : "opacity 500ms 100ms ease-out, transform 500ms 100ms ease-out",
                  }}
                >
                  {description}
                </p>
              )}

              {/* Mobile CTAs (full width) */}
              <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
                <a
                  href="#roster"
                  className="inline-flex items-center justify-center h-[40px] px-3 rounded-lg font-semibold text-[13px]
                             transition focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: W_GOLD,
                    color: W_BLUE,
                    boxShadow: "0 4px 14px rgba(255,199,44,0.25)",
                  }}
                >
                  View Roster
                </a>
                <a
                  href="#games"
                  className="inline-flex items-center justify-center h-[40px] px-3 rounded-lg font-semibold text-[13px]
                             bg-white/10 ring-1 ring-inset ring-white/15 transition hover:bg-white/15 focus:outline-none focus:ring-2"
                >
                  Recent Games
                </a>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

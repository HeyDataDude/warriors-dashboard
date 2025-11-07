import { useEffect, useMemo, useRef, useState } from "react";

type BannerInfo = { year: number; note?: string };

type Props = {
  items?: BannerInfo[];
  offsetRightPx?: number;          // distance from hero's right edge
  offsetTopPx?: number;            // distance from hero's top edge
  width?: number;                  // banner width (desktop)
  mobileMode?: "hide" | "mini";    // hide entirely or show last 3
  stagger?: number;                // ms between drop-in animations
  intensity?: number;              // 0..1 hover emphasis
};

const W_BLUE = "#1D428A";
const W_GOLD = "#FFC72C";

/** Mount inside the hero <section> (position: relative). */
export default function ChampionshipBannersFlip({
  items = [
    { year: 1947, note: "BAA" },
    { year: 1956, note: "NBA" },
    { year: 1975, note: "NBA" },
    { year: 2015, note: "4–2 CLE" },
    { year: 2017, note: "4–1 CLE" },
    { year: 2018, note: "4–0 CLE" },
    { year: 2022, note: "4–2 BOS" },
  ],
  offsetRightPx = 20,
  offsetTopPx = 0,
  width = 96,
  mobileMode = "hide",
  stagger = 120,
  intensity = 1,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Reduced motion
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(!!mq?.matches);
    apply();
    mq?.addEventListener?.("change", apply);
    return () => mq?.removeEventListener?.("change", apply);
  }, []);

  // In-view trigger
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && setInView(true),
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Mobile behavior
  const prepared = useMemo(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    if (!isMobile) return items;
    if (mobileMode === "hide") return [] as BannerInfo[];
    return items.slice(-3);
  }, [items, mobileMode]);

  return (
    <>
      <style>{`
        @keyframes hinge-flip-drop {
          0%   { opacity: 0; transform: rotateX(-110deg) translateY(-16px) rotateZ(0.6deg) scale(0.995); filter: drop-shadow(0 0 0 rgba(0,0,0,0)); }
          38%  { opacity: 1; transform: rotateX(16deg) translateY(6px)  rotateZ(-0.3deg) scale(1.002); filter: drop-shadow(0 18px 24px rgba(0,0,0,0.35)); }
          62%  { transform: rotateX(-7deg) translateY(0px) rotateZ(0.15deg) scale(1.000); filter: drop-shadow(0 12px 22px rgba(0,0,0,0.30)); }
          80%  { transform: rotateX(3.5deg) translateY(0px) rotateZ(-0.1deg); filter: drop-shadow(0 10px 18px rgba(0,0,0,0.28)); }
          100% { transform: rotateX(0deg) translateY(0px) rotateZ(0deg);  filter: drop-shadow(0 8px 16px rgba(0,0,0,0.25)); }
        }
        @keyframes pendulum {
          0% { transform: rotateZ(0deg); }
          35% { transform: rotateZ(0.6deg); }
          70% { transform: rotateZ(-0.45deg); }
          100% { transform: rotateZ(0deg); }
        }
        .cap {
          background:
            radial-gradient(160% 120% at 50% -30%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 55%),
            linear-gradient(180deg, #0D2142, ${W_BLUE});
          box-shadow: inset 0 -1px 0 rgba(255,255,255,0.18), inset 0 1px 0 rgba(0,0,0,0.3);
        }
        .fabric {
          background:
            linear-gradient(180deg, ${W_GOLD}, #E6B520),
            radial-gradient(160% 120% at 50% -40%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 60%);
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.12), 0 6px 14px rgba(0,0,0,0.35);
          position: relative;
        }
        .fabric::after {
          content: ""; position: absolute; inset: 0; opacity: .08; pointer-events: none; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.6'/%3E%3C/svg%3E");
        }
        .stitch:before {
          content:""; position:absolute; left:7px; right:7px; top:10px; height:0;
          border-top: 1px dashed rgba(0,0,0,0.28); opacity:.6;
        }
        .pin {
          width:8px; height:8px; border-radius:9999px;
          background: radial-gradient(circle at 30% 30%, #ffffff, #cfd6e3 45%, #8090b2 70%, #334366 100%);
          box-shadow: 0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 6px rgba(0,0,0,0.35);
        }
      `}</style>

      <div
        ref={rootRef}
        className="absolute"
        style={{
          top: offsetTopPx,
          right: offsetRightPx,
          perspective: 1000,
          pointerEvents: prepared.length ? "auto" : "none",
        }}
      >
        <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3" style={{ transformOrigin: "top right" }}>
          {prepared.map((b, i) => (
            <BannerTile
              key={b.year}
              year={b.year}
              note={b.note}
              width={width}
              delay={i * stagger}
              intensity={intensity}
              play={inView && !reducedMotion}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function BannerTile({
  year,
  note,
  width,
  delay,
  intensity,
  play,
}: {
  year: number;
  note?: string;
  width: number;
  delay: number;
  intensity: number;
  play: boolean;
}) {
  const bodyH = 52;
  const pointH = 14;

  return (
    <div className="relative" style={{ transformStyle: "preserve-3d" }}>
      {/* Pins */}
      <div className="absolute -top-2 left-1/2 -translate-x-[calc(50%-18px)] pin" />
      <div className="absolute -top-2 left-1/2 translate-x-[calc(50%-18px)] pin" />

      <button
        type="button"
        className="group outline-none"
        aria-label={`Championship ${year}${note ? ` — ${note}` : ""}`}
        style={{
          WebkitTapHighlightColor: "transparent",
          border: "none",
          padding: 0,
          background: "transparent",
          cursor: "pointer",
          transformOrigin: "top center",
          transformStyle: "preserve-3d",
          animation: play ? `hinge-flip-drop 680ms cubic-bezier(.22,1,.36,1) ${delay}ms both` : undefined,
        }}
        onMouseEnter={(e) => {
          const t = e.currentTarget;
          const lift = Math.max(0.5, Math.min(1, intensity));
          t.style.transition = "transform 160ms ease-out, filter 160ms ease-out";
          t.style.transform = `translateY(${-2 * lift}px) rotateZ(${0.7 * lift}deg)`;
          t.style.filter = "drop-shadow(0 10px 18px rgba(0,0,0,0.32))";
        }}
        onMouseLeave={(e) => {
          const t = e.currentTarget;
          t.style.transition = "transform 220ms ease-out, filter 220ms ease-out";
          t.style.transform = "translateY(0) rotateZ(0)";
          t.style.filter = "drop-shadow(0 8px 16px rgba(0,0,0,0.25))";
        }}
      >
        {/* Cap */}
        <div
          className="cap"
          style={{ width, height: 10, borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
        />

        {/* Fabric */}
        <div className="fabric stitch relative" style={{ width }}>
          {/* Gentle idle sway */}
          <div
            className="absolute inset-0"
            style={{
              transformOrigin: "top center",
              animation: play ? `pendulum ${5200 + (delay % 1200)}ms ease-in-out ${delay + 680}ms infinite` : undefined,
            }}
          />

          {/* Year */}
          <div
            className="flex select-none items-center justify-center"
            style={{
              height: bodyH,
              width,
              color: W_BLUE,
              fontWeight: 900,
              letterSpacing: 1,
              fontSize: 14,
              fontFamily: "Montserrat, ui-sans-serif",
              textShadow: "0 1px 0 rgba(255,255,255,0.35), 0 6px 12px rgba(0,0,0,0.20)",
            }}
          >
            {year}
          </div>

          {/* Fold shadow under cap */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-[10px]"
            style={{
              height: 8,
              background: "linear-gradient(180deg, rgba(0,0,0,0.28), rgba(0,0,0,0))",
              opacity: 0.35,
            }}
          />
        </div>

        {/* Pennant tip */}
        <svg viewBox={`0 0 ${width} ${pointH}`} width={width} height={pointH} preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id={`lg-${year}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={W_GOLD} />
              <stop offset="1" stopColor="#E6B520" />
            </linearGradient>
          </defs>
          <path d={`M0 0 L${width / 2} ${pointH} L${width} 0 Z`} fill={`url(#lg-${year})`} />
          <path d={`M0 0 L${width / 2} ${pointH} L${width} 0 Z`} fill="none" stroke="rgba(0,0,0,0.14)" />
        </svg>

        {/* Tooltip */}
        <div
          className="pointer-events-none absolute left-1/2 -bottom-[46px] -translate-x-1/2 opacity-0 transition group-hover:opacity-100"
          style={{
            background: "rgba(9,16,26,0.85)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            borderRadius: 10,
            padding: "6px 10px",
            whiteSpace: "nowrap",
            fontSize: 9.5,
            color: "white",
            transitionDuration: "160ms",
          }}
        >
          <span className="opacity-80">Championship</span> • <strong>{year}</strong>
          {note ? <span className="opacity-80"> — {note}</span> : null}
        </div>
      </button>
    </div>
  );
}

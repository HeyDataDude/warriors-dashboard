import { Player } from "../types";

const W_BLUE = "#1D428A";
const W_GOLD = "#FFC72C";

export default function PlayerCard({ p }: { p: Player }) {
  const number = (p.strNumber || "").toString().replace(/[^\d]/g, "");

  return (
    <div
      className="group relative w-full rounded-2xl overflow-hidden ring-1 ring-inset ring-white/10 bg-white/5
                 transition motion-safe:supports-hover:hover:-translate-y-0.5 supports-hover:hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]
                 supports-hover:hover:ring-white/20 focus-within:ring-white/30"
      role="article"
      aria-label={p.strPlayer}
      tabIndex={0}
    >
      {/* Media */}
      <div className="relative aspect-[4/3] bg-white/5">
        {p.strThumb ? (
          <>
            <img
              src={p.strThumb}
              alt={p.strPlayer}
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 480px) 45vw, (max-width: 768px) 30vw, (max-width: 1280px) 20vw, 200px"
            />
            {/* Subtle gradient + responsive spotlight */}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(9,16,26,0.85)] via-transparent to-transparent" />
            <div
              className="absolute inset-0 pointer-events-none opacity-80 mix-blend-soft-light"
              style={{
                // percentage-based so it scales with card size
                background:
                  "radial-gradient(45% 30% at 20% 85%, rgba(255,199,44,0.18), transparent 60%)",
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center text-white/50">
            <svg
              viewBox="0 0 24 24"
              className="h-9 w-9 sm:h-10 sm:w-10"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <circle cx="12" cy="8" r="3.5" />
              <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
            </svg>
            <span className="sr-only">No image</span>
          </div>
        )}

        {/* Jersey chip */}
        {number && (
          <span
            className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 rounded-md text-[11px] sm:text-[12px] font-semibold
                       ring-1 ring-inset shadow-sm"
            style={{
              backgroundColor: "rgba(255,199,44,0.18)",
              color: W_GOLD,
              borderColor: "rgba(255,199,44,0.3)",
            }}
            aria-label={`Jersey number ${number}`}
          >
            #{number}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-3.5">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <div
              className="font-semibold leading-snug truncate sm:line-clamp-2"
              title={p.strPlayer}
              style={{
                fontFamily: "Montserrat, ui-sans-serif",
                letterSpacing: 0.1,
              }}
            >
              {/* Slightly smaller on very narrow cards, scales up on sm+ */}
              <span className="text-[13px] sm:text-sm md:text-base">{p.strPlayer}</span>
            </div>
            <div className="mt-0.5 text-[11px] sm:text-xs text-white/65 truncate">
              {p.strPosition || "—"}
              {p.strNationality ? ` • ${p.strNationality}` : ""}
            </div>
          </div>

          {/* compact meta chip (hide on very tight widths) */}
          <span className="hidden xs:inline-block shrink-0 px-2 py-0.5 rounded-md text-[10.5px] sm:text-[11px] bg-white/8 ring-1 ring-inset ring-white/10 text-white/75">
            {(p.strPosition || "—").slice(0, 2).toUpperCase()}
          </span>
        </div>

        {/* Footer meta (height / weight) */}
        {(p.strHeight || p.strWeight) && (
          <div className="mt-2 sm:mt-2.5 grid grid-cols-2 gap-1.5 sm:gap-2 text-[11px] sm:text-[11.5px]">
            <div className="rounded-md bg-white/5 ring-1 ring-inset ring-white/10 px-2 py-1.5 min-w-0">
              <div className="text-white/55 truncate">Height</div>
              <div className="mt-0.5 font-medium tabular-nums truncate">
                {p.strHeight || "—"}
              </div>
            </div>
            <div className="rounded-md bg-white/5 ring-1 ring-inset ring-white/10 px-2 py-1.5 min-w-0">
              <div className="text-white/55 truncate">Weight</div>
              <div className="mt-0.5 font-medium tabular-nums truncate">
                {p.strWeight || "—"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Focus ring for keyboard users */}
      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-0 group-focus-within:ring-2 ring-white/40" />
    </div>
  );
}

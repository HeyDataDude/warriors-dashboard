import { ReactNode, HTMLAttributes } from "react";

/** Brand accents */
const W_BLUE = "#1D428A";
const W_GOLD = "#FFC72C";

/** Visual container with optional glass/solid/tonal styles and a top accent */
type CardProps = {
  children: ReactNode;
  /** Visual surface style (default: glass) */
  variant?: "glass" | "solid" | "tonal";
  /** Subtle lift + ring on hover/focus */
  interactive?: boolean;
  /** Thin top stripe accent */
  accent?: "none" | "gold" | "blue";
  /** Content padding scale */
  padding?: "none" | "sm" | "md" | "lg";
  /** Extra utility classes */
  className?: string;
} & HTMLAttributes<HTMLElement>;

function Card({
  children,
  variant = "glass",
  interactive = false,
  accent = "none",
  padding = "md",
  className = "",
  ...rest
}: CardProps) {
  const base =
    "relative rounded-2xl overflow-hidden backdrop-blur-xl ring-1 ring-inset";

  // Compact padding mapping (no branches elsewhere)
  const pad =
    padding === "none"
      ? ""
      : padding === "sm"
      ? "p-3 sm:p-4"
      : padding === "lg"
      ? "p-6 sm:p-7"
      : "p-4 sm:p-5";

  // Surface variants tuned for depth + subtle ring
  const variantCls =
    variant === "solid"
      ? "bg-[rgba(13,20,34,0.9)] ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
      : variant === "tonal"
      ? "bg-white/[0.06] ring-white/12 shadow-[0_10px_30px_rgba(0,0,0,0.28)]"
      : "bg-white/[0.05] ring-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.32)]";

  const interactiveCls = interactive
    ? "transition will-change-transform hover:translate-y-[-2px] hover:ring-white/20 focus-within:ring-white/25"
    : "";

  return (
    <section
      className={`${base} ${variantCls} ${interactiveCls} ${pad} ${className}`}
      {...rest}
    >
      {/* Subtle noise texture for depth; decorative only */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Optional top accent hairline; decorative */}
      {accent !== "none" && (
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{
            background:
              accent === "gold"
                ? `linear-gradient(90deg, transparent, ${W_GOLD}, transparent)`
                : `linear-gradient(90deg, transparent, ${W_BLUE}, transparent)`,
          }}
        />
      )}

      {children}
    </section>
  );
}

/** Slots keep layout consistent across cards */
function CardHeader({
  children,
  className = "",
}: { children: ReactNode; className?: string }) {
  return (
    <div className={`mb-3 sm:mb-4 flex items-end justify-between gap-3 ${className}`}>
      {children}
    </div>
  );
}

function CardBody({
  children,
  className = "",
}: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function CardFooter({
  children,
  className = "",
}: { children: ReactNode; className?: string }) {
  return (
    <div className={`mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-white/10 ${className}`}>
      {children}
    </div>
  );
}

type SectionTitleProps = {
  children: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/** Section-level title with optional subtitle and right-aligned actions */
function SectionTitle({
  children,
  subtitle,
  actions,
  className = "",
}: SectionTitleProps) {
  return (
    <div className={`w-full flex items-end justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <h2
          className="truncate tracking-tight"
          style={{
            fontFamily: "Bebas Neue, Montserrat, sans-serif",
            fontSize: 28,
            letterSpacing: 0.3,
            lineHeight: 1.05,
          }}
        >
          {children}
        </h2>
        {subtitle && (
          <p className="text-white/70 text-xs md:text-[13px] mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}

export default Card;
export { CardHeader, CardBody, CardFooter, SectionTitle };

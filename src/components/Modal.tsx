import React, {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useId,
} from "react";
import { createPortal } from "react-dom";

const W_GOLD = "#FFC72C";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnBackdrop?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  watermark?: string | number;
};

export function Modal({
  open,
  onClose,
  children,
  title,
  size = "md",
  closeOnBackdrop = true,
  initialFocusRef,
  watermark,
}: ModalProps) {
  const [mounted, setMounted] = useState(false); // keep DOM mounted for fade-out
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const titleId = useId();

  // Stage mount when opening to allow exit transition
  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  // Lock page scroll while open; restore focus to previously focused element
  useLayoutEffect(() => {
    if (!open) return;
    restoreFocusRef.current = (document.activeElement as HTMLElement) || null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  // Focus trap + ESC to close
  useEffect(() => {
    if (!open) return;
    const node = dialogRef.current!;
    const toFocus = initialFocusRef?.current || firstFocusable(node) || node;
    requestAnimationFrame(() => toFocus?.focus?.());

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") trapTabKey(e, node);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, initialFocusRef]);

  if (!open && !mounted) return null;

  const maxW =
    size === "sm"
      ? "max-w-md"
      : size === "lg"
      ? "max-w-3xl"
      : size === "xl"
      ? "max-w-5xl"
      : "max-w-xl";

  const hasMark = watermark != null && String(watermark).trim() !== "";

  const overlay = (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4" aria-hidden={false}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 z-10 bg-black/60 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDuration: prefersReducedMotion ? "0ms" : "180ms" }}
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Watermark (decorative) */}
      {hasMark && (
        <div className="pointer-events-none absolute inset-0 z-20 select-none" aria-hidden="true">
          <div
            className="absolute top-1/2"
            style={{
              left: "4vw",
              transform: "translateY(-50%)",
              filter: "drop-shadow(0 22px 60px rgba(0,0,0,0.55))",
              mixBlendMode: "soft-light",
            }}
          >
            <span
              style={{
                fontFamily: "Bebas Neue, Montserrat, sans-serif",
                fontSize: "clamp(320px, 80vmin, 1400px)",
                fontWeight: 900,
                letterSpacing: -3,
                lineHeight: 1,
                color: "transparent",
                WebkitTextStroke: "3px rgba(255,255,255,0.28)",
                backgroundImage:
                  "linear-gradient(180deg, rgba(255,255,255,0.52), rgba(255,255,255,0.08))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                opacity: 0.18,
                userSelect: "none",
              }}
            >
              {String(watermark).toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`relative z-30 w-full ${maxW} rounded-2xl ring-1 ring-inset ring-white/10
          bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]
          border border-white/10 overflow-hidden transition-all`}
        style={{
          transform:
            open || prefersReducedMotion ? "translateY(0) scale(1)" : "translateY(8px) scale(0.98)",
          opacity: open || prefersReducedMotion ? 1 : 0,
          transitionDuration: prefersReducedMotion ? "0ms" : "220ms",
          transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)",
        }}
        onTransitionEnd={() => {
          if (!open) setMounted(false);
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent hairline */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: `linear-gradient(90deg, transparent, ${W_GOLD}, transparent)` }}
          aria-hidden="true"
        />

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2.5 right-2.5 inline-flex h-9 w-9 items-center justify-center
                     rounded-lg bg-white/8 ring-1 ring-inset ring-white/10 text-white/80
                     hover:bg-white/12 focus:outline-none focus:ring-2"
          aria-label="Close dialog"
          title="Close"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden="true"
          >
            <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-4 sm:p-5 md:p-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
          {title && (
            <h2
              id={titleId}
              className="mb-2 tracking-tight"
              style={{
                fontFamily: "Bebas Neue, Montserrat, sans-serif",
                fontSize: 26,
                letterSpacing: 0.3,
                lineHeight: 1.05,
              }}
            >
              {title}
            </h2>
          )}
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}

/* ----------------- Utilities ----------------- */

/** Respect OS-level “reduced motion” preference */
function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => setPrefers(!!mq?.matches);
    update();
    mq?.addEventListener?.("change", update);
    return () => mq?.removeEventListener?.("change", update);
  }, []);
  return prefers;
}

/** Focusable elements within a container (visible/eligible only) */
function getFocusable(container: HTMLElement): HTMLElement[] {
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");
  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement
  );
}

function firstFocusable(container: HTMLElement) {
  return getFocusable(container)[0];
}

/** Trap focus within modal; cycle with Tab/Shift+Tab */
function trapTabKey(e: KeyboardEvent, container: HTMLElement) {
  const focusables = getFocusable(container);
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement as HTMLElement;

  if (e.shiftKey && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

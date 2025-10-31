import { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl bg-white/5 border border-white/10 shadow-soft p-4 backdrop-blur-xl transition hover:border-warriorsGold/30 ${className}`}
    >
      {children}
    </div>
  );
}

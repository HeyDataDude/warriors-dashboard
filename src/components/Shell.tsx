import { ReactNode } from "react";

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4">
      {children}
    </div>
  );
}

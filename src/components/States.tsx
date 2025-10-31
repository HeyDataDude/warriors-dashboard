export function Loader() {
  return (
    <div className="w-full grid place-items-center py-16 text-white/70">
      <div className="animate-pulse">Loading…</div>
    </div>
  );
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <div className="w-full grid place-items-center py-16 text-red-300">
      {message || "Something went wrong."}
    </div>
  );
}

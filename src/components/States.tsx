export function Loader() {
  return <div className="py-10 text-center text-white/70">Loading...</div>;
}

export function ErrorState({ message }: { message?: string }) {
  return <div className="py-10 text-center text-red-400">{message || "Something went wrong."}</div>;
}

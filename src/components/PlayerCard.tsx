import { Player } from "../types";

export default function PlayerCard({ p }: { p: Player }) {
  return (
    <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-warriorsGold/30 transition">
      <div className="aspect-[4/3] bg-white/5">
        {p.strThumb ? (
          <img src={p.strThumb} alt={p.strPlayer} className="w-full h-full object-cover" />
        ) : (
          <div className="grid place-items-center w-full h-full text-white/50 text-xs">
            No Image
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="font-medium truncate" title={p.strPlayer}>{p.strPlayer}</div>
        <div className="text-xs text-textMuted">{p.strPosition || "—"}</div>
      </div>
    </div>
  );
}

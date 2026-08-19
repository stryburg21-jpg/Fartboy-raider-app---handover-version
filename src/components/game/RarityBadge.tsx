import type { Rarity } from "@/types/game";
import { rarityLabel, rarityTextClass, rarityBorderClass } from "@/lib/rarity";

export function RarityBadge({ rarity, size = "sm" }: { rarity: Rarity; size?: "sm" | "md" }) {
  const pad = size === "md" ? "px-2 py-1 text-[11px]" : "px-1.5 py-0.5 text-[9px]";
  return (
    <span
      className={`inline-flex items-center rounded border bg-surface-2/60 font-bold uppercase tracking-wider ${pad} ${rarityTextClass[rarity]} ${rarityBorderClass[rarity]}`}
    >
      {rarityLabel[rarity]}
    </span>
  );
}

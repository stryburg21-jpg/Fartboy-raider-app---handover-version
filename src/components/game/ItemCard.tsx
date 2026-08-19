import type { Item } from "@/types/game";
import { rarityBorderClass, rarityLabel, rarityTextClass } from "@/lib/rarity";
import { isImageUrl } from "./RaiderAvatar";

export function ItemCard({
  item,
  equipped,
  onClick,
}: {
  item: Item;
  equipped?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 bg-surface-1 p-3 text-left transition-transform hover:-translate-y-0.5 ${rarityBorderClass[item.rarity]}`}
    >
      {equipped && (
        <span className="absolute right-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary-foreground">
          Equipped
        </span>
      )}
      <div className="grid h-16 w-16 place-items-center rounded-lg bg-surface-3 text-3xl overflow-hidden">
        {isImageUrl(item.image) ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-contain"
            referrerPolicy="no-referrer"
          />
        ) : (
          item.image
        )}
      </div>
      <div className="w-full min-w-0">
        <div className="truncate text-sm font-semibold">{item.name}</div>
        <div className={`text-[10px] uppercase tracking-wider ${rarityTextClass[item.rarity]}`}>
          {rarityLabel[item.rarity]} · {item.slot}
        </div>
      </div>
    </button>
  );
}

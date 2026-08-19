import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { EquipmentSlot, Item } from "@/types/game";
import { rarityBorderClass, rarityLabel, rarityTextClass } from "@/lib/rarity";
import { EquipmentSelectorModal } from "./EquipmentSelectorModal";
import { ItemDetailsModal } from "./ItemDetailsModal";
import { useGameStore } from "@/store/gameStore";
import { resolveItemById } from "@/lib/equipmentResolver";
import { isImageUrl } from "./RaiderAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, ArrowRightLeft, X, Hammer, Plus, Sparkles } from "lucide-react";

export interface EquipmentSlotConfig {
  key: EquipmentSlot;
  label: string;
  icon: string;
  emptyHelp: string;
}

const SLOTS: EquipmentSlotConfig[] = [
  { key: "head", label: "Hat", icon: "🎩", emptyHelp: "Find Hat gear in Packs" },
  { key: "body", label: "Top", icon: "👕", emptyHelp: "Find Top apparel in Packs" },
  { key: "shorts", label: "Shorts", icon: "🩳", emptyHelp: "Find Shorts in Vault" },
  { key: "feet", label: "Boots", icon: "🥾", emptyHelp: "Find Boots & Footwear" },
  { key: "back", label: "Cape", icon: "🦸", emptyHelp: "Capes grant luck & prestige" },
  { key: "pet", label: "Pet", icon: "🐾", emptyHelp: "Find a Pet Companion" },
  { key: "powerItem", label: "Power Item", icon: "⚡", emptyHelp: "Unlock Power Relics" },
];

export function EquipmentSlots({
  equipped,
  itemsById,
}: {
  equipped: Partial<Record<EquipmentSlot, string>>;
  itemsById: Record<string, Item>;
}) {
  const navigate = useNavigate();
  const unequipSlot = useGameStore((s) => s.unequipSlot);
  const inventory = useGameStore((s) => s.inventory);

  const [activeSelectorSlot, setActiveSelectorSlot] = useState<EquipmentSlot | null>(null);
  const [inspectingItem, setInspectingItem] = useState<Item | null>(null);

  const handleSlotClick = (slotKey: EquipmentSlot, isEquipped: boolean) => {
    if (!isEquipped) {
      setActiveSelectorSlot(slotKey);
    }
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-1.5 xs:gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {SLOTS.map((s) => {
          let itemId = equipped[s.key];
          if (!itemId) {
            // Check legacy slot alias fallback
            if (s.key === "head") itemId = equipped["hat"];
            else if (s.key === "face") itemId = equipped["power"];
            else if (s.key === "body") itemId = equipped["top"];
            else if (s.key === "back") itemId = equipped["cape"];
            else if (s.key === "accessory") itemId = equipped["pet"];
            else if (s.key === "feet")
              itemId = equipped["feet"] || equipped["trousers"] || equipped["socks"];
          }

          const item = resolveItemById(itemId, inventory, itemsById);

          return item ? (
            /* EQUIPPED SLOT ITEM WITH ACTION MENU */
            <DropdownMenu key={s.key}>
              <DropdownMenuTrigger asChild>
                <button
                  className={`group relative flex flex-col items-center justify-between rounded-xl border-2 bg-card p-1.5 xs:p-2 sm:p-3 text-center transition-all hover:scale-[1.02] hover:shadow-lg ${rarityBorderClass[item.rarity]}`}
                >
                  <span className="absolute left-1.5 top-1 font-mono text-[7.5px] sm:text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </span>
                  <span className="absolute right-1.5 top-1 rounded bg-primary/20 px-1 py-0.2 text-[7px] sm:text-[8px] font-bold text-primary">
                    Lv {item.level ?? 1}
                  </span>

                  <div className="my-2 sm:my-3 grid h-9 w-9 xs:h-11 xs:w-11 sm:h-14 sm:w-14 place-items-center rounded-lg bg-surface-3 text-xl xs:text-2xl sm:text-3xl shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
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
                    <div className="truncate text-[10px] xs:text-xs font-bold text-foreground">
                      {item.name}
                    </div>
                    <div
                      className={`text-[7.5px] xs:text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wider truncate ${rarityTextClass[item.rarity]}`}
                    >
                      {rarityLabel[item.rarity]}
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="center" className="w-48 border-border bg-surface-1">
                <DropdownMenuLabel className="text-xs font-bold truncate">
                  {s.label}: {item.name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setInspectingItem(item)}
                  className="cursor-pointer text-xs font-semibold"
                >
                  <Eye className="mr-2 h-3.5 w-3.5 text-primary" /> View Details
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setActiveSelectorSlot(s.key)}
                  className="cursor-pointer text-xs font-semibold"
                >
                  <ArrowRightLeft className="mr-2 h-3.5 w-3.5 text-accent" /> Change Gear
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate({ to: "/forge" })}
                  className="cursor-pointer text-xs font-semibold text-amber-400"
                >
                  <Hammer className="mr-2 h-3.5 w-3.5" /> Upgrade in Forge
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => unequipSlot(s.key)}
                  className="cursor-pointer text-xs font-semibold text-destructive focus:bg-destructive/10"
                >
                  <X className="mr-2 h-3.5 w-3.5" /> Unequip
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* EMPTY SLOT INTERACTIVE CARD */
            <button
              key={s.key}
              onClick={() => handleSlotClick(s.key, false)}
              className="group flex flex-col items-center justify-between rounded-xl border-2 border-dashed border-border/80 bg-surface-1/50 p-1.5 xs:p-2 sm:p-3 text-center transition-all hover:border-primary/60 hover:bg-surface-2/80 hover:shadow-md"
            >
              <span className="font-mono text-[7.5px] sm:text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </span>

              <div className="my-2 sm:my-3 grid h-9 w-9 xs:h-11 xs:w-11 sm:h-14 sm:w-14 place-items-center rounded-lg bg-surface-2 text-lg xs:text-xl sm:text-2xl text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all">
                {s.icon}
              </div>

              <div className="w-full min-w-0">
                <div className="text-[9px] xs:text-[10px] sm:text-[11px] font-bold text-muted-foreground group-hover:text-primary transition-colors flex items-center justify-center gap-0.5 truncate">
                  <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                  <span className="truncate">No {s.label}</span>
                </div>
                <div className="truncate text-[7.5px] xs:text-[8.5px] sm:text-[9px] text-muted-foreground/70 mt-0.5">
                  {s.emptyHelp}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filtered Equipment Selector Modal for empty slot / changing gear */}
      <EquipmentSelectorModal
        slot={activeSelectorSlot}
        open={Boolean(activeSelectorSlot)}
        onClose={() => setActiveSelectorSlot(null)}
        onOpenDetails={(item) => setInspectingItem(item)}
      />

      {/* Item Details Inspection Modal */}
      {inspectingItem && (
        <ItemDetailsModal item={inspectingItem} onClose={() => setInspectingItem(null)} />
      )}
    </>
  );
}

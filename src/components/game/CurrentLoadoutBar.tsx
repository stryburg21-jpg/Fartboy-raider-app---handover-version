import { useState } from "react";
import { Swords, Sparkles, Plus, Zap, ArrowRight } from "lucide-react";
import type { EquipmentSlot, Item, Player } from "@/types/game";
import { useGameStore } from "@/store/gameStore";
import { resolveItemById } from "@/lib/equipmentResolver";
import { rarityBorderClass, rarityLabel, rarityTextClass } from "@/lib/rarity";
import { EquipmentSelectorModal } from "./EquipmentSelectorModal";
import { isImageUrl } from "./RaiderAvatar";

const SLOTS_CONFIG: Array<{ key: EquipmentSlot; label: string; icon: string }> = [
  { key: "head", label: "Hat", icon: "🎩" },
  { key: "body", label: "Top", icon: "👕" },
  { key: "shorts", label: "Shorts", icon: "🩳" },
  { key: "feet", label: "Boots", icon: "🥾" },
  { key: "back", label: "Cape", icon: "🦸" },
  { key: "pet", label: "Pet", icon: "🐾" },
  { key: "powerItem", label: "Power Item", icon: "⚡" },
];

interface CurrentLoadoutBarProps {
  player: Player;
  itemsById?: Record<string, Item>;
  activeSpecialistIdentity: string;
  setInfoBonusDescription?: string;
  onScrollToEquipment?: () => void;
}

export function CurrentLoadoutBar({
  player,
  itemsById = {},
  activeSpecialistIdentity,
  setInfoBonusDescription,
  onScrollToEquipment,
}: CurrentLoadoutBarProps) {
  const inventory = useGameStore((s) => s.inventory);
  const [selectedSlotForModal, setSelectedSlotForModal] = useState<EquipmentSlot | null>(null);

  const equippedCount = Object.values(player.equipped ?? {}).filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-surface-2/80 p-4 sm:p-5 space-y-4 shadow-xl backdrop-blur-sm">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold shrink-0">
            <Swords className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
              Current Equipped Loadout
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Equipment directly contributing to Raider stats and set bonuses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full">
            {equippedCount} / 7 Slots Active
          </span>
          <button
            onClick={() => {
              setSelectedSlotForModal("head");
              onScrollToEquipment?.();
            }}
            className="font-mono text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Full Gear Inspect</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* 7 SLOT CARDS HORIZONTAL/GRID DISPLAY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {SLOTS_CONFIG.map((s) => {
          const itemId = player.equipped?.[s.key];
          const item = resolveItemById(itemId, inventory, itemsById);

          if (item) {
            return (
              <button
                key={s.key}
                onClick={() => setSelectedSlotForModal(s.key)}
                className={`group relative flex flex-col items-center justify-between rounded-xl border-2 bg-card p-2.5 text-center transition-all hover:scale-[1.03] hover:shadow-lg cursor-pointer ${rarityBorderClass[item.rarity]}`}
                title={`Click to manage ${item.name}`}
              >
                <span className="absolute left-1.5 top-1 font-mono text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </span>

                <span className="rounded bg-primary/20 px-1 py-0.2 text-[8px] font-mono font-bold text-primary absolute right-1.5 top-1">
                  L{item.level ?? 1}
                </span>

                <div className="my-2 text-2xl transition-transform group-hover:scale-110 flex justify-center">
                  {isImageUrl(item.image) ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-7 w-7 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    item.image || s.icon
                  )}
                </div>

                <div className="w-full space-y-0.5 min-w-0">
                  <div className="font-display text-[11px] font-bold leading-tight text-foreground truncate w-full">
                    {item.name}
                  </div>
                  <span
                    className={`block font-mono text-[9px] font-extrabold uppercase ${rarityTextClass[item.rarity]}`}
                  >
                    {rarityLabel[item.rarity]}
                  </span>
                </div>
              </button>
            );
          }

          return (
            <button
              key={s.key}
              onClick={() => setSelectedSlotForModal(s.key)}
              className="group flex flex-col items-center justify-between rounded-xl border-2 border-dashed border-border/80 bg-surface-3/60 p-2.5 text-center transition-all hover:border-primary/60 hover:bg-surface-3 cursor-pointer min-h-[105px]"
            >
              <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </span>

              <div className="my-1.5 text-xl opacity-40 group-hover:opacity-80 transition-opacity">
                {s.icon}
              </div>

              <span className="inline-flex items-center gap-0.5 rounded bg-surface-2 px-1.5 py-0.5 text-[9px] font-mono font-bold text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                <Plus className="h-2.5 w-2.5" /> Equip
              </span>
            </button>
          );
        })}
      </div>

      {/* SPECIALIST GEAR SUMMARY BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Specialist Gear: <strong>{activeSpecialistIdentity}</strong>
          </span>

          {setInfoBonusDescription && (
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              <Zap className="h-3 w-3 text-emerald-400" />
              {setInfoBonusDescription}
            </span>
          )}
        </div>

        <button
          onClick={() => setSelectedSlotForModal("head")}
          className="font-mono text-[11px] text-muted-foreground hover:text-amber-300 transition-colors cursor-pointer"
        >
          ⚙️ Change Equipment
        </button>
      </div>

      {/* EQUIPPED SELECTOR MODAL */}
      {selectedSlotForModal && (
        <EquipmentSelectorModal
          slot={selectedSlotForModal}
          open={!!selectedSlotForModal}
          onClose={() => setSelectedSlotForModal(null)}
        />
      )}
    </div>
  );
}

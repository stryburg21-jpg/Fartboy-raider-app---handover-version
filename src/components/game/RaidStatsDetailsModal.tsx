import { Shield, Zap, Sparkles, Award, Layers, Trophy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Item, Player } from "@/types/game";
import { resolveItemById } from "@/lib/equipmentResolver";
import { isImageUrl } from "./RaiderAvatar";
import { calculateActive6Stats, getItem6Stats, getDetailedItemStats } from "@/utils/itemStats";
import { getUserMultipliersPayload } from "@/services/player";

interface RaidStatsDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: Player;
  inventory: Item[];
  itemsById: Record<string, Item>;
}

export function RaidStatsDetailsModal({
  open,
  onOpenChange,
  player,
  inventory,
  itemsById,
}: RaidStatsDetailsModalProps) {
  const equippedSlots = player.equipped ?? {};

  const equippedItemList: { slot: string; item: Item }[] = [];
  for (const [slot, itemId] of Object.entries(equippedSlots)) {
    if (!itemId) continue;
    const item = resolveItemById(itemId, inventory, itemsById);
    if (item) {
      equippedItemList.push({ slot, item });
    }
  }

  const payload = getUserMultipliersPayload(player, inventory, itemsById);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border border-amber-500/40 bg-[#0B0E14] text-foreground shadow-2xl">
        <DialogHeader className="border-b border-amber-500/20 pb-3">
          <DialogTitle className="flex items-center gap-2 font-display text-xl font-black text-amber-400">
            <Trophy className="h-5 w-5 text-amber-400" /> Granular 6-Stat Multipliers
          </DialogTitle>
          <DialogDescription className="text-xs text-amber-200/60 font-mono">
            Detailed breakdown of your active 6-stat multipliers from equipped gear and bonuses.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 max-h-[460px] overflow-y-auto pr-1 font-mono">
          {/* TOTAL XP BOOST HEADER */}
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-900 p-4 flex items-center justify-between shadow-inner">
            <div>
              <span className="font-mono text-[10px] uppercase font-black tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Total Effective Multiplier
              </span>
              <div className="font-display text-3xl font-black text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] mt-0.5">
                {Number(payload?.total_effective_multiplier ?? 1).toFixed(2)}x
              </div>
              <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                +{Number(payload?.equipped_gear_passive_boost_pct ?? 0).toFixed(2)}% Gear Passive
                Boost
                {payload?.gear_cap_applied && (
                  <span className="ml-1 text-amber-300">
                    ({Number(payload?.max_gear_cap_pct ?? 10).toFixed(1)}% Max Cap)
                  </span>
                )}
              </div>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-xl border border-amber-400/40 bg-amber-500/20 text-amber-300 text-2xl shadow-lg">
              🦅
            </div>
          </div>

          {/* 6-STAT CATEGORY CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {(payload?.equipped_gear_by_stat ?? []).map((st) => (
              <div
                key={st.stat_key}
                className="rounded-xl border border-amber-500/30 bg-slate-950 p-2.5 space-y-0.5"
              >
                <div className="text-[10px] uppercase text-amber-400 font-bold flex items-center gap-1">
                  <span>{st.icon}</span>
                  <span className="truncate">{st.stat_label}</span>
                </div>
                <div className="font-bold text-amber-300 text-sm">
                  +{Number(st?.total_bonus_pct ?? 0).toFixed(2)}%
                </div>
                <div className="text-[9px] text-slate-400">
                  {st.items_contributing} {st.items_contributing === 1 ? "item" : "items"}
                </div>
              </div>
            ))}
          </div>

          {/* EQUIPPED ITEM GEAR LIST */}
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Award className="h-3.5 w-3.5" /> Equipped Gear ({equippedItemList.length})
            </div>

            <div className="space-y-1.5">
              {equippedItemList.map(({ slot, item }) => {
                const detailed = getDetailedItemStats(item);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-amber-500/15 bg-slate-950/70 p-2.5 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {isImageUrl(item.image) ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-5 w-5 object-contain inline-block align-middle"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          item.image
                        )}
                      </span>
                      <div>
                        <div className="font-bold text-amber-100">{item.name}</div>
                        <div className="text-[9px] text-slate-400 uppercase">
                          {slot} • {item.rarity} {item.level ? `• Lv.${item.level}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-bold text-emerald-400 text-xs">
                      {detailed.primary.icon} {detailed.primary.formatted}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-amber-500/20">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="font-mono text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
          >
            Close Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

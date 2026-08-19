import { Link } from "@tanstack/react-router";
import {
  Swords,
  Sparkles,
  Zap,
  Target,
  CheckCircle2,
  Hammer,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { EquipmentSlot, Item, Player } from "@/types/game";
import { EquipmentSlots } from "./EquipmentSlots";
import { isImageUrl } from "./RaiderAvatar";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";
import { resolveItemById } from "@/lib/equipmentResolver";

interface SetInfoType {
  setName: string;
  ownedCount: number;
  totalRequired: number;
  bonusDescription: string;
  missingItems: Item[];
}

interface EquippedLoadoutShowcaseProps {
  player: Player;
  itemsById: Record<string, Item>;
  setInfo?: SetInfoType | null;
  activeSpecialistIdentity: string;
}

export function EquippedLoadoutShowcase({
  player,
  itemsById,
  setInfo,
  activeSpecialistIdentity,
}: EquippedLoadoutShowcaseProps) {
  const inventory = useGameStore((s) => s.inventory);
  const equippedCount = Object.values(player?.equipped ?? {}).filter(Boolean).length;

  // Calculate stats from equipped gear
  const equippedItemsList = Object.values(player?.equipped ?? {})
    .map((id) => resolveItemById(id, inventory, itemsById))
    .filter((item): item is Item => Boolean(item));

  // Compute stat boosts
  const totalRaidPower = (player?.level ?? 1) * 150 + equippedCount * 85;
  const xpBoostPercent = 5 * equippedCount + (setInfo && setInfo.ownedCount === 7 ? 15 : 0);
  const luckBoostPercent = 3 * equippedCount + (setInfo && setInfo.ownedCount === 7 ? 10 : 0);

  return (
    <div
      id="equipment-slots-section"
      className="overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-surface-1 via-card to-card p-6 sm:p-8 space-y-6 shadow-2xl"
    >
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0 shadow-lg shadow-amber-500/10">
            <Swords className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-xl text-foreground tracking-tight">
                Equipped Loadout & Specialist Gear
              </h2>
              <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                <ShieldCheck className="h-3 w-3" />
                {equippedCount} / 7 Slots
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Equip matching gear to maximize your active {activeSpecialistIdentity} set bonuses and
              XP multipliers.
            </p>
          </div>
        </div>

        <Link to="/forge" className="shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 font-mono text-xs font-bold uppercase tracking-wider border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
          >
            <Hammer className="h-3.5 w-3.5 text-amber-400" />
            Forge Gear Upgrade
          </Button>
        </Link>
      </div>

      {/* CHARACTER BENEFIT & STAT BOOSTS SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-amber-400" /> Equipped Slots
            </div>
            <div className="font-display font-black text-lg text-amber-300">
              {equippedCount} / 7 Active
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
            {equippedCount === 7 ? "Full Set" : "Partial"}
          </span>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" /> XP Multiplier
            </div>
            <div className="font-display font-black text-lg text-emerald-300">
              +{xpBoostPercent}% Boost
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
            Active
          </span>
        </div>

        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase font-bold text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-cyan-400" /> Vault Pack Luck
            </div>
            <div className="font-display font-black text-lg text-cyan-300">
              +{luckBoostPercent}% Rare Luck
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded border border-cyan-500/30">
            Boosted
          </span>
        </div>
      </div>

      {/* INTERACTIVE LOADOUT SLOTS GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-bold uppercase tracking-wider text-muted-foreground">
            Active Loadout Slots (Click slot to change gear)
          </span>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            7 Slots total: Hat, Top, Trousers, Socks, Cape, Pet, Power
          </span>
        </div>

        <EquipmentSlots equipped={player.equipped} itemsById={itemsById} />
      </div>

      {/* ACTIVE SPECIALIST SET & MISSING ITEMS BREAKDOWN */}
      {setInfo && (
        <div className="rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 via-surface-1 to-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-accent/20 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                <h3 className="font-display text-lg font-extrabold text-foreground">
                  Specialist Set: {setInfo.setName}
                </h3>
                <span className="rounded-full bg-accent/20 px-2.5 py-0.5 font-mono text-xs font-bold text-accent">
                  {setInfo.ownedCount} / {setInfo.totalRequired} Pieces Collected
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Complete all set items to trigger legendary title perks and passive multipliers.
              </p>
            </div>

            <Link to="/packs" search={{ section: "tracker" }}>
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-bold uppercase border-accent/40 text-accent hover:bg-accent/10"
              >
                View Full Set Tracker →
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Active Set Bonuses */}
            <div className="rounded-xl border border-border/60 bg-surface-2/60 p-4 space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-400" /> Set Perk Description
              </div>
              <div className="text-xs text-foreground font-semibold leading-relaxed bg-background/60 p-3 rounded-lg border border-border/40 shadow-inner">
                {setInfo.bonusDescription}
              </div>
            </div>

            {/* Missing Set Pieces Radar */}
            <div className="rounded-xl border border-border/60 bg-surface-2/60 p-4 space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Target className="h-4 w-4 text-primary" />
                <span>Missing Set Pieces ({setInfo.missingItems.length})</span>
              </div>

              {setInfo.missingItems.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Full Set Mastered! All 7
                  Pieces Owned!
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {setInfo.missingItems.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="flex items-center gap-1.5 rounded-lg border border-border bg-background/70 px-2.5 py-1.5 text-xs"
                    >
                      <span className="text-base">
                        {isImageUrl(item.image) ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-4 w-4 object-contain inline-block align-middle"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          item.image
                        )}
                      </span>
                      <span className="font-semibold text-foreground truncate max-w-[120px]">
                        {item.name}
                      </span>
                      <span className="font-mono text-[9px] uppercase text-muted-foreground bg-surface-3 px-1 rounded">
                        {item.slot}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

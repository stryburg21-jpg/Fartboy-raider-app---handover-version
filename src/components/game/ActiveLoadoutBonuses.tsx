import { Zap, Sparkles, ShieldCheck, Award, Info, AlertCircle } from "lucide-react";
import type { Player } from "@/types/game";
import { useGameStore } from "@/store/gameStore";
import { isImageUrl } from "./RaiderAvatar";
import {
  calculateActiveSetBonuses,
  getActiveSpecialistIdentity,
  getSetInfoForItem,
} from "@/lib/sets";

interface ActiveLoadoutBonusesProps {
  player: Player;
}

export function ActiveLoadoutBonuses({ player }: ActiveLoadoutBonusesProps) {
  const inventory = useGameStore((s) => s.inventory);

  const activeSpecialistIdentity = getActiveSpecialistIdentity(player.equipped ?? {}, inventory);
  const activeSetBonuses = calculateActiveSetBonuses(player.equipped ?? {}, inventory);

  // Get progress info for the primary specialist set
  const primarySetInfo = getSetInfoForItem(
    `${activeSpecialistIdentity} Set`,
    inventory,
    player.equipped ?? {},
  );

  const equippedCount = Object.values(player.equipped ?? {}).filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-surface-2 via-card to-surface-3 p-5 sm:p-6 space-y-4 shadow-xl backdrop-blur-sm">
      {/* SECTION HEADER - ACTIVE SPECIALIST SET */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold shrink-0">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display font-black text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
              Active Specialist Set
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Equipment set bonuses and active stat multipliers
            </p>
          </div>
        </div>

        {/* EQUIPPED PIECES BADGE */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="font-mono text-xs font-extrabold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            Set Progress:{" "}
            <strong className="text-white">
              {primarySetInfo ? primarySetInfo.ownedCount : equippedCount} / 7 Pieces
            </strong>
          </span>
        </div>
      </div>

      {/* PRIMARY SPECIALIST SET CARD */}
      <div className="relative overflow-hidden rounded-xl border border-amber-500/40 bg-surface-1/90 p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-400/20 px-2 py-0.5 font-mono text-[10px] font-black uppercase text-amber-300 border border-amber-400/30">
              {primarySetInfo?.category || "Specialist"}
            </span>
            <h4 className="font-display text-base font-bold text-foreground">
              {primarySetInfo?.setName || `${activeSpecialistIdentity} Set`}
            </h4>
          </div>

          <div className="font-mono text-xs font-bold text-amber-300">
            {primarySetInfo?.ownedCount ?? 0} of {primarySetInfo?.totalRequired ?? 7} Items
            Completed
          </div>
        </div>

        {/* ACTIVE BONUS MULTIPLIERS OR SET EFFECT PREVIEW */}
        {activeSetBonuses.length > 0 ? (
          <div className="space-y-3 pt-1">
            {activeSetBonuses.map((activeSet) => (
              <div key={activeSet.setName} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  Full Set Bonus Active! ({activeSet.setName})
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {activeSet.bonuses.map((bonus, idx) => (
                    <div
                      key={`${bonus.label}-${idx}`}
                      className="rounded-lg border border-amber-500/40 bg-surface-2 p-3 text-center shadow-sm"
                    >
                      <div className="font-display font-black text-lg text-amber-300">
                        {bonus.value}
                      </div>
                      <div className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
                        {bonus.label}
                      </div>
                    </div>
                  ))}
                </div>

                {activeSet.fullSetRewardTitle && (
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-200 bg-amber-500/10 p-2 rounded-lg border border-amber-500/30">
                    <Award className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Reward Title Unlocked: {activeSet.fullSetRewardTitle}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* SET IN PROGRESS PREVIEW & BONUS EFFECTS */
          <div className="space-y-2.5 pt-1">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Target Bonus Effect: </strong>
                {primarySetInfo?.bonusDescription ||
                  "Equip 7 matching set pieces for +35% XP & rare luck boost."}
              </span>
            </div>

            {/* MISSING PIECES CALLOUT */}
            {primarySetInfo && primarySetInfo.missingItems.length > 0 && (
              <div className="rounded-lg bg-surface-2 p-3 border border-border/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Missing Pieces ({primarySetInfo.missingItems.length} remaining):
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {primarySetInfo.missingItems.map((missing) => (
                    <span
                      key={missing.id}
                      className="inline-flex items-center gap-1 rounded bg-surface-3 px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground border border-border"
                    >
                      <span>
                        {isImageUrl(missing.image) ? (
                          <img
                            src={missing.image}
                            alt={missing.name}
                            className="h-3 w-3 object-contain inline-block align-middle"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          missing.image
                        )}
                      </span>
                      <span>{missing.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { getPlayerDailyXPState, getActiveEquipmentSetXPBonus } from "@/services/xpEngine";
import {
  XP_DAILY_DECAY_BRACKETS,
  getDailyDecayMultiplier,
  EQUIPMENT_SET_XP_BONUSES,
} from "@/config/xpConfig";
import { useGameStore } from "@/store/gameStore";
import { Zap, ShieldCheck, Clock, AlertCircle, Award, Flame } from "lucide-react";

export function DailyXpCapCard({ className = "" }: { className?: string }) {
  const player = useGameStore((s) => s.player);
  const inventory = useGameStore((s) => s.inventory);

  const [dailyState, setDailyState] = useState(getPlayerDailyXPState());
  const [timeToReset, setTimeToReset] = useState("");

  // Update daily state & countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      setDailyState(getPlayerDailyXPState());

      const now = new Date();
      const nextReset = new Date();
      nextReset.setUTCHours(24, 0, 0, 0);

      const diffMs = nextReset.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeToReset(
        `${hours.toString().padStart(2, "0")}h ${minutes
          .toString()
          .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`,
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!player) return null;

  const currentXP = dailyState.dailyXPEarned;
  const maxCap = 100000;
  const currentPct = Math.min(100, Math.round((currentXP / maxCap) * 100));
  const activeMultiplier = getDailyDecayMultiplier(currentXP);

  // Check active equipment set bonus
  const activeSetBonus = player
    ? getActiveEquipmentSetXPBonus(player, inventory, "social_raid_like_rt")
    : { setConfig: null, isActive: false };

  return (
    <div
      className={`rounded-2xl border border-amber-500/30 bg-gradient-to-br from-surface-2 via-surface-1 to-card p-4 sm:p-5 shadow-lg space-y-4 ${className}`}
    >
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              Daily XP Efficiency Tracker
            </h3>
            <p className="font-mono text-[10px] text-muted-foreground">Resets daily at 00:00 UTC</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            <Clock className="h-3.5 w-3.5" /> Reset in {timeToReset || "00h 00m 00s"}
          </span>
        </div>
      </div>

      {/* METRIC & DECAY BADGE */}
      <div className="flex items-center justify-between">
        <div>
          <span className="font-mono text-xs text-muted-foreground">Today's Earned XP</span>
          <div className="font-display text-2xl font-extrabold text-foreground flex items-baseline gap-1.5">
            <span>{currentXP.toLocaleString()}</span>
            <span className="font-mono text-xs text-muted-foreground">/ 100,000 XP Cap</span>
          </div>
        </div>

        <div className="text-right">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">
            Active Multiplier
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-extrabold font-mono border ${
              activeMultiplier >= 1.0
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : activeMultiplier >= 0.5
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : activeMultiplier > 0
                    ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                    : "bg-destructive/20 text-destructive border-destructive/40"
            }`}
          >
            <Flame className="h-3.5 w-3.5" /> {(activeMultiplier * 100).toFixed(0)}% Rate
          </span>
        </div>
      </div>

      {/* MULTI-SEGMENT PROGRESS BAR */}
      <div className="space-y-1.5">
        <div className="h-3 w-full overflow-hidden rounded-full bg-surface-3 flex p-0.5 border border-border/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-400 to-primary transition-all duration-500"
            style={{ width: `${currentPct}%` }}
          />
        </div>

        {/* BRACKET TICKS */}
        <div className="grid grid-cols-5 text-[9px] font-mono text-muted-foreground text-center pt-0.5">
          <div className="text-left border-l border-border/40 pl-1">0-10k (100%)</div>
          <div className="border-l border-border/40 pl-1">10k-25k (75%)</div>
          <div className="border-l border-border/40 pl-1">25k-50k (50%)</div>
          <div className="border-l border-border/40 pl-1">50k-100k (25%)</div>
          <div className="text-right border-r border-border/40 pr-1">100k+ (0%)</div>
        </div>
      </div>

      {/* ACTIVE EQUIPMENT SET XP BOOST BADGES */}
      <div className="rounded-xl border border-border/80 bg-surface-2/60 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-foreground">
          <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider text-[11px] text-primary">
            <ShieldCheck className="h-4 w-4" /> Equipment Set XP Multipliers (7/7 Set)
          </span>
          <span className="text-[10px] text-muted-foreground">Equip 7 matching pieces</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {Object.entries(EQUIPMENT_SET_XP_BONUSES).map(([setName, cfg]) => {
            const isEquippedAndActive =
              activeSetBonus.setConfig?.setName === setName && activeSetBonus.isActive;

            return (
              <div
                key={setName}
                className={`rounded-lg p-2 text-center border transition-all ${
                  isEquippedAndActive
                    ? "bg-primary/20 border-primary text-primary font-bold shadow-sm"
                    : "bg-surface-3/50 border-border/60 text-muted-foreground opacity-70"
                }`}
              >
                <div className="font-mono text-[10px] font-extrabold uppercase truncate">
                  {setName}
                </div>
                <div className="font-mono text-xs font-black text-amber-400">
                  +{(cfg.bonusPercentage * 100).toFixed(0)}% XP
                </div>
                <div className="text-[8px] truncate mt-0.5 text-muted-foreground">
                  {isEquippedAndActive ? "Active (7/7 Equipped)" : "Inactive"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

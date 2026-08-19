import { Lock, CheckCircle2, Gift, Sparkles, Award } from "lucide-react";
import type { ContributorRewards } from "@/services/contributor";

interface RewardTierCardProps {
  tierReward: ContributorRewards;
}

export function RewardTierCard({ tierReward }: RewardTierCardProps) {
  const rarityColors: Record<string, string> = {
    common: "border-slate-500/40 bg-slate-500/10 text-slate-300",
    uncommon: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    rare: "border-sky-500/40 bg-sky-500/10 text-sky-300",
    epic: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    legendary: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    mythic: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  };

  const rarityClass = rarityColors[tierReward.rarity] || rarityColors.common;

  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all ${
        tierReward.isCurrent
          ? "border-amber-400 bg-gradient-to-b from-amber-500/15 via-surface-1 to-card ring-1 ring-amber-400/50 shadow-lg"
          : tierReward.unlocked
            ? "border-emerald-500/30 bg-surface-2/60"
            : "border-border/60 bg-surface-1/40 opacity-80"
      }`}
    >
      {/* TIER HEADER */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{tierReward.rankIcon}</span>
          <div>
            <div className="font-mono text-[10px] font-extrabold uppercase text-muted-foreground">
              Tier {tierReward.tier} Reward Pass
            </div>
            <div className="font-display font-black text-base text-foreground">
              {tierReward.rankName}
            </div>
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-extrabold uppercase border ${rarityClass}`}
        >
          {tierReward.rarity}
        </span>
      </div>

      {/* REWARDS LIST */}
      <div className="space-y-2.5">
        <div className="text-[10px] font-mono font-extrabold uppercase text-muted-foreground flex items-center gap-1">
          <Gift className="h-3.5 w-3.5 text-amber-400" /> Unlocked Package Items
        </div>

        <div className="space-y-1.5">
          {tierReward.rewards.map((reward) => (
            <div
              key={reward.id}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <span className="text-base">{reward.icon}</span>
                <span className="truncate">{reward.name}</span>
              </div>
              {reward.quantity && (
                <span className="font-mono text-[10px] font-extrabold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                  x{reward.quantity}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER LOCK/UNLOCK CLAIM STATUS */}
      <div className="border-t border-border/50 pt-3 flex items-center justify-between text-xs">
        {tierReward.unlocked ? (
          <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-extrabold text-[11px]">
            <CheckCircle2 className="h-4 w-4" /> Contributor Rewards Active
          </div>
        ) : (
          <div className="flex items-center gap-1.5 font-mono text-muted-foreground font-semibold text-[11px]">
            <Lock className="h-4 w-4" /> Locked (Requires Tier {tierReward.tier})
          </div>
        )}
      </div>
    </div>
  );
}

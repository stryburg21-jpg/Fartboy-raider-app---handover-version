import type { SeasonTier as Tier } from "@/types/game";
import { Lock, Check } from "lucide-react";

export function SeasonTier({ tier }: { tier: Tier }) {
  return (
    <div
      className={`flex min-w-[92px] flex-col items-center gap-2 rounded-xl border p-3 text-center ${
        tier.unlocked ? "border-primary bg-primary/5" : "border-border bg-surface-1"
      }`}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        Tier {tier.tier}
      </div>
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-surface-3">
        {tier.unlocked ? (
          <Check className="h-4 w-4 text-primary" />
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="text-[11px]">
        <div className="text-muted-foreground">Free</div>
        <div className="font-semibold">+{tier.freeReward?.xp ?? 0} XP</div>
      </div>
      <div className="text-[11px]">
        <div className="text-accent">Premium</div>
        <div className="font-semibold">
          {tier.premiumReward?.packId ? "Pack" : `+${tier.premiumReward?.xp ?? 0} XP`}
        </div>
      </div>
    </div>
  );
}

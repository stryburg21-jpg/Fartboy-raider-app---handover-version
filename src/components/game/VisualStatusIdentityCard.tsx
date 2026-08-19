import { Award, Sparkles, Crown, Gift, ShieldCheck, Zap } from "lucide-react";
import type { PlayerContributorProfile } from "@/services/contributor";

interface VisualStatusIdentityCardProps {
  profile: PlayerContributorProfile;
}

export function VisualStatusIdentityCard({ profile }: VisualStatusIdentityCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-accent/40 bg-gradient-to-b from-surface-1 via-card to-card p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0 shadow-lg shadow-amber-500/10">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-xl text-foreground tracking-tight">
                In-Game Identity & Status Perks
              </h2>
              <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Sparkles className="h-3 w-3" /> Exclusive Recognition
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Higher contribution ranks unlock prestigious badges, rare titles, and free pack
              allocations.
            </p>
          </div>
        </div>
      </div>

      {/* CURRENT TITLE VS NEXT TITLE COMPARISON */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CURRENT TITLE */}
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-amber-400">
            <span className="flex items-center gap-1.5">
              <Award className="h-4 w-4" /> Active Contributor Title
            </span>
            <span className="bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
              Equipped Status
            </span>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-background/80 p-4 text-center space-y-1">
            <div className="text-2xl">{profile.currentRankIcon}</div>
            <div className="font-display font-black text-xl text-amber-300">
              "{profile.currentTitle}"
            </div>
            <p className="text-[11px] text-muted-foreground">
              Tier {profile.currentRankTier} Recognized Contributor
            </p>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Displayed on your Raider profile, global leaderboards, and Discord server status tags.
          </p>
        </div>

        {/* NEXT TITLE */}
        <div className="rounded-2xl border border-purple-500/40 bg-purple-500/10 p-5 space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-purple-300">
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4" /> Next Contributor Title Target
            </span>
            <span className="bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
              {profile.nextRankName ? `Tier ${profile.nextRankTier} Target` : "Maximum Tier"}
            </span>
          </div>

          <div className="rounded-xl border border-purple-500/30 bg-background/80 p-4 text-center space-y-1">
            <div className="text-2xl">{profile.nextRankIcon || "👑"}</div>
            <div className="font-display font-black text-xl text-purple-300">
              "{profile.nextTitle || "Apex Sovereign"}"
            </div>
            <p className="text-[11px] text-muted-foreground">
              {profile.nextRankName ? `Unlocks at ${profile.nextRankName} Rank` : "Pinnacle Status"}
            </p>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {profile.amountToNextRank
              ? `Only $${profile.amountToNextRank.toLocaleString()} away from unlocking this next title.`
              : "You have unlocked all contributor titles!"}
          </p>
        </div>
      </div>

      {/* 4 STATUS ADVANTAGE HIGHLIGHTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        <div className="rounded-xl border border-border/60 bg-surface-2/40 p-3.5 text-center space-y-1">
          <Award className="h-5 w-5 text-indigo-400 mx-auto" />
          <div className="font-display font-bold text-xs text-foreground">Rare Titles</div>
          <p className="text-[10px] text-muted-foreground">Unique title badges for every rank</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-surface-2/40 p-3.5 text-center space-y-1">
          <Gift className="h-5 w-5 text-amber-400 mx-auto" />
          <div className="font-display font-bold text-xs text-foreground">
            Free Pack Allocations
          </div>
          <p className="text-[10px] text-muted-foreground">Monthly Vault pack drops per tier</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-surface-2/40 p-3.5 text-center space-y-1">
          <Crown className="h-5 w-5 text-purple-400 mx-auto" />
          <div className="font-display font-bold text-xs text-foreground">
            Exclusive Recognition
          </div>
          <p className="text-[10px] text-muted-foreground">Discord roles & leaderboard badges</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-surface-2/40 p-3.5 text-center space-y-1">
          <ShieldCheck className="h-5 w-5 text-emerald-400 mx-auto" />
          <div className="font-display font-bold text-xs text-foreground">100% Non-Pay-To-Win</div>
          <p className="text-[10px] text-muted-foreground">Zero combat stat boost advantage</p>
        </div>
      </div>
    </div>
  );
}

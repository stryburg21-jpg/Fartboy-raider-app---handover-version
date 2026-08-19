import { motion } from "motion/react";
import { CheckCircle2, Gift, Sparkles, ShieldCheck, Award } from "lucide-react";
import type { PlayerContributorProfile, ContributorRewards } from "@/services/contributor";

interface BenefitListProps {
  profile: PlayerContributorProfile;
  rewards: ContributorRewards[];
}

export function BenefitList({ profile, rewards }: BenefitListProps) {
  const currentTierRewards = rewards.find((r) => r.isCurrent) || rewards[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-surface-1 via-card to-card p-6 sm:p-8 space-y-6 shadow-2xl"
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
        <div>
          <h2 className="font-display font-extrabold text-xl text-foreground flex items-center gap-2 tracking-tight">
            <Gift className="h-5 w-5 text-purple-400" />
            <span>Your Contributor Pass Benefits</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Rank perks, cosmetics, and monthly free pack allocations unlocked for Tier{" "}
            {profile.currentRankTier}.
          </p>
        </div>
        <span className="font-mono text-xs font-bold text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30 self-start sm:self-auto">
          Tier {profile.currentRankTier} Active Benefits
        </span>
      </div>

      {/* 3 CORE BENEFIT PILLARS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* BENEFIT 1: TITLE & IDENTITY */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-extrabold uppercase">
            <Award className="h-4 w-4 text-amber-400" /> Exclusive Title Badge
          </div>
          <div className="font-display font-bold text-base text-foreground">
            "{profile.currentTitle}"
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Equipped across your Raider profile, public raid leaderboards, and Discord role badge.
          </p>
        </div>

        {/* BENEFIT 2: PACK ALLOCATION */}
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5 space-y-3">
          <div className="flex items-center gap-2 text-purple-300 font-mono text-xs font-extrabold uppercase">
            <Gift className="h-4 w-4 text-purple-400" /> Free Vault Pack Drops
          </div>
          <div className="font-display font-bold text-base text-foreground">
            {currentTierRewards?.rewards.find((r) => r.type === "pack")?.name ||
              "Supporter Pack Drops"}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Automated monthly pack drop allocations based on your contributor rank level.
          </p>
        </div>

        {/* BENEFIT 3: COMMUNITY RECOGNITION */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-300 font-mono text-xs font-extrabold uppercase">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Recognized Status
          </div>
          <div className="font-display font-bold text-base text-foreground">
            Non-Pay-To-Win Prestige
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Special Discord contributor roles and access to exclusive CTO feedback channels.
          </p>
        </div>
      </div>

      {/* BACKEND-MANAGED FUTURE REWARDS NOTE */}
      <div className="flex items-center justify-between rounded-xl border border-border/80 bg-surface-2/60 p-4 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground font-medium">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            Future rewards, seasonal pack drops, and perks are managed dynamically through the
            backend.
          </span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold bg-surface-3 px-2 py-1 rounded">
          Dynamic API Sync
        </span>
      </div>
    </motion.div>
  );
}

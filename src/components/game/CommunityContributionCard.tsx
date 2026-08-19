import { Globe, Users, TrendingUp, Sparkles, HeartHandshake, ShieldCheck } from "lucide-react";
import type { CommunityContribution } from "@/services/contributor";
import { ProgressBar } from "./ProgressBar";

interface CommunityContributionCardProps {
  data: CommunityContribution;
}

export function CommunityContributionCard({ data }: CommunityContributionCardProps) {
  const milestonePercent = Math.min(
    100,
    Math.round((data.totalRaised / data.milestoneTarget) * 100),
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-surface-1 via-card to-card p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0 shadow-lg shadow-emerald-500/10">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-xl text-foreground tracking-tight">
                Community Contribution & Ecosystem Pool
              </h2>
              <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="h-3 w-3" /> Live Ecosystem Stats
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Supporting community growth, CTO raids, meme rewards, and ecosystem initiatives.
            </p>
          </div>
        </div>

        <div className="font-mono text-xs text-muted-foreground flex items-center gap-1.5 bg-surface-2 px-3 py-1.5 rounded-lg border border-border">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          Updated: {data.lastUpdated}
        </div>
      </div>

      {/* 3 STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TOTAL RAISED */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-2">
          <div className="text-xs font-mono font-bold uppercase text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-400" /> Total Community Raised
          </div>
          <div className="font-display font-black text-3xl text-emerald-300">
            ${data.totalRaised.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-400/90 font-mono">
            Directly funding community raids & dev grants
          </p>
        </div>

        {/* ACTIVE CONTRIBUTORS */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-2">
          <div className="text-xs font-mono font-bold uppercase text-muted-foreground flex items-center gap-1.5">
            <Users className="h-4 w-4 text-amber-400" /> Active Supporters
          </div>
          <div className="font-display font-black text-3xl text-amber-300">
            {data.contributorCount.toLocaleString()} Raiders
          </div>
          <p className="text-[11px] text-amber-400/90 font-mono">Across 6 Contributor Rank Tiers</p>
        </div>

        {/* ECOSYSTEM INITIATIVES */}
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5 space-y-2">
          <div className="text-xs font-mono font-bold uppercase text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-purple-400" /> Supporting Initiatives
          </div>
          <div className="font-display font-bold text-sm text-foreground line-clamp-2">
            {data.supportingCause}
          </div>
          <p className="text-[11px] text-purple-300 font-mono">
            100% Non-Pay-To-Win Transparent Pool
          </p>
        </div>
      </div>

      {/* MILESTONE PROGRESS BAR */}
      <div className="rounded-2xl border border-border/80 bg-surface-2/60 p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="font-mono font-extrabold uppercase text-foreground flex items-center gap-1.5">
            <HeartHandshake className="h-4 w-4 text-amber-400" /> Current Ecosystem Goal:{" "}
            {data.recentMilestone}
          </div>
          <span className="font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded border border-emerald-500/30">
            ${data.totalRaised.toLocaleString()} / ${data.milestoneTarget.toLocaleString()} (
            {milestonePercent}%)
          </span>
        </div>

        <ProgressBar value={milestonePercent} className="h-3 rounded-full bg-surface-3" />
      </div>
    </div>
  );
}

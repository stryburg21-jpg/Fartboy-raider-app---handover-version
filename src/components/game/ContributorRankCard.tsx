import { Lock, CheckCircle2, Sparkles, Award, Gift } from "lucide-react";
import type { ContributorRank } from "@/services/contributor";

interface ContributorRankCardProps {
  rank: ContributorRank;
}

export function ContributorRankCard({ rank }: ContributorRankCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 flex flex-col justify-between space-y-4 ${
        rank.isCurrent
          ? "border-amber-400 bg-gradient-to-b from-amber-500/15 via-surface-1 to-card shadow-xl ring-2 ring-amber-400/50 scale-[1.02]"
          : rank.unlocked
            ? "border-emerald-500/40 bg-surface-2/60 shadow-md hover:border-emerald-400/60"
            : "border-border/60 bg-surface-1/40 opacity-75 hover:opacity-100"
      }`}
    >
      {/* ATMOSPHERIC GLOW FOR CURRENT/TOP TIERS */}
      {rank.isCurrent && (
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-400/20 blur-2xl" />
      )}

      {/* CARD TOP BADGE & STATUS */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl filter drop-shadow">{rank.icon}</span>
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Tier {rank.tier} Rank
            </div>
            <h3 className="font-display font-black text-lg text-foreground tracking-tight">
              {rank.name}
            </h3>
          </div>
        </div>

        {/* UNLOCKED / CURRENT / LOCKED STATUS PILL */}
        {rank.isCurrent ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/60 bg-amber-400/20 px-2.5 py-1 font-mono text-xs font-extrabold text-amber-300 shadow-sm animate-pulse">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Current Rank
          </span>
        ) : rank.unlocked ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 font-mono text-xs font-bold text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Mastered
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-3 px-2.5 py-1 font-mono text-xs font-bold text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Locked
          </span>
        )}
      </div>

      {/* DESCRIPTION */}
      <p className="text-xs text-muted-foreground leading-relaxed italic">"{rank.description}"</p>

      {/* CONTRIBUTION REQUIREMENT */}
      <div className="rounded-xl border border-border/60 bg-background/60 p-3 space-y-1 shadow-inner">
        <div className="text-[10px] font-mono uppercase font-extrabold text-muted-foreground">
          Contribution Requirement
        </div>
        <div className="font-display font-extrabold text-sm text-amber-300 flex items-center justify-between">
          <span>{rank.requiredAmount.toLocaleString()} Contribution Pts / $</span>
          <span className="font-mono text-[10px] font-bold text-muted-foreground">
            Tier {rank.tier}
          </span>
        </div>
      </div>

      {/* UNLOCKS & REWARD PREVIEW */}
      <div className="space-y-2 border-t border-border/50 pt-3">
        <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Gift className="h-3.5 w-3.5 text-amber-400" /> Rank Rewards & Perks
        </div>

        <ul className="space-y-1.5 text-xs">
          <li className="flex items-center gap-2 text-foreground font-semibold">
            <Award className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">Title: "{rank.rewardData.titleReward}"</span>
          </li>
          {rank.rewardData.perks.map((perk, i) => (
            <li key={i} className="flex items-center gap-2 text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
              <span className="truncate">{perk}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

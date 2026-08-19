import { Award, HeartHandshake, Shield, Sparkles, CheckCircle2 } from "lucide-react";
import {
  CONTRIBUTOR_TIERS,
  CONTRIBUTION_CATEGORIES,
  getContributorTierByName,
} from "@/config/contributor";

/**
 * Contributor Rank Display Card.
 * Communicates 100% Non-Pay-To-Win recognition status, official 6-tier structure,
 * and contribution categories (CTO Raids, Videos, Memes, Personal Raids).
 */
export function SupporterRankCard({ rank }: { rank: string }) {
  const currentTier = getContributorTierByName(rank);

  return (
    <div className="rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/10 via-surface-1 to-card p-5 shadow-lg">
      {/* Header & Current Rank */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-accent/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent/20 text-accent border border-accent/30 text-2xl">
            {currentTier.badge}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Contributor Rank:
              </span>
              <span className={`font-display text-lg font-bold ${currentTier.colorClass}`}>
                {currentTier.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tier {currentTier.tier} Community Recognition · {currentTier.purpose}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            <HeartHandshake className="h-4 w-4" /> Community Supporter
          </span>
        </div>
      </div>

      {/* 6 Official Contributor Tiers Pathway */}
      <div className="mt-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Official Contributor Rank Tiers (6-Tier Structure)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {CONTRIBUTOR_TIERS.map((t) => {
            const isCurrent = t.name.toLowerCase() === rank.toLowerCase();
            return (
              <div
                key={t.tier}
                className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all ${
                  isCurrent
                    ? `${t.borderClass} ${t.bgClass} shadow-md ring-1 ring-accent/50`
                    : "border-border/50 bg-black/20 opacity-70"
                }`}
              >
                <span className="text-lg">{t.badge}</span>
                <span className="font-display text-xs font-bold text-foreground mt-1 truncate max-w-full">
                  {t.name}
                </span>
                <span className="text-[9px] font-mono text-muted-foreground">Tier {t.tier}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contribution Categories Breakdown */}
      <div className="mt-4 pt-4 border-t border-border/60">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Contribution Categories (How Ranks Are Earned)
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {CONTRIBUTION_CATEGORIES.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-border/50 bg-surface-2/60 p-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-base">{c.icon}</span>
                  <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-accent">
                    {c.valueTier}
                  </span>
                </div>
                <div className="font-display text-xs font-bold text-foreground mt-1">{c.title}</div>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                  {c.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Non-Pay-to-Win Commitment */}
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-300">
        <Shield className="h-4 w-4 shrink-0 text-emerald-400" />
        <span>
          <strong>100% Non-Pay-To-Win Commitment:</strong> Contributor ranks are earned strictly
          through community support, raid involvement, and creator contributions. They provide
          status & visual recognition — zero combat or stat advantages.
        </span>
      </div>
    </div>
  );
}

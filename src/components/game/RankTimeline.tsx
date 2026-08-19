import { motion } from "motion/react";
import { CheckCircle2, Lock, Sparkles, Trophy } from "lucide-react";
import type { ContributorRank } from "@/services/contributor";

interface RankTimelineProps {
  ranks: ContributorRank[];
}

export function RankTimeline({ ranks }: RankTimelineProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-surface-1 via-card to-card p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-4">
        <div>
          <h2 className="font-display font-extrabold text-xl text-foreground flex items-center gap-2 tracking-tight">
            <Trophy className="h-5 w-5 text-amber-400" />
            <span>Rank Progression Journey</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Complete rank ladder from entry supporter to pinnacle community sovereign.
          </p>
        </div>
        <div className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 self-start sm:self-auto">
          6 Contribution Tiers
        </div>
      </div>

      {/* TIMELINE TRACK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {ranks.map((rank, index) => {
          return (
            <motion.div
              key={rank.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`relative rounded-2xl border p-4 flex flex-col justify-between space-y-3 transition-all duration-300 ${
                rank.isCurrent
                  ? "border-amber-400 bg-gradient-to-b from-amber-500/20 to-surface-1 shadow-lg ring-2 ring-amber-400/50 scale-[1.03] z-10"
                  : rank.unlocked
                    ? "border-emerald-500/40 bg-surface-2/60 hover:border-emerald-400/60"
                    : "border-border/60 bg-surface-1/40 opacity-70 hover:opacity-100"
              }`}
            >
              {/* STATUS INDICATOR */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-extrabold text-muted-foreground">
                  Tier {rank.tier}
                </span>

                {rank.isCurrent ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 font-mono text-[10px] font-black text-amber-300 border border-amber-400/60">
                    <Sparkles className="h-3 w-3 text-amber-400 animate-spin" /> Active
                  </span>
                ) : rank.unlocked ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[10px] font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Unlocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-muted-foreground font-mono text-[10px] font-semibold">
                    <Lock className="h-3 w-3" /> Locked
                  </span>
                )}
              </div>

              {/* ICON & NAME */}
              <div className="space-y-1">
                <div className="text-3xl filter drop-shadow">{rank.icon}</div>
                <div className="font-display font-extrabold text-sm text-foreground tracking-tight line-clamp-1">
                  {rank.name}
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-2 italic">
                  "{rank.description}"
                </div>
              </div>

              {/* REQUIREMENT & TITLE */}
              <div className="border-t border-border/50 pt-2 space-y-1">
                <div className="font-mono text-[10px] font-extrabold text-amber-300">
                  ${rank.requiredAmount.toLocaleString()} Required
                </div>
                <div className="text-[10px] text-foreground font-medium truncate">
                  Title: "{rank.title}"
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

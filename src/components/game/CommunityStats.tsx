import { motion } from "motion/react";
import { Globe, Users, TrendingUp, Sparkles, HeartHandshake } from "lucide-react";
import type { CommunityContribution } from "@/services/contributor";

interface CommunityStatsProps {
  data: CommunityContribution;
}

export function CommunityStats({ data }: CommunityStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-surface-1 via-card to-card p-6 shadow-xl space-y-4"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2.5">
          <Globe className="h-5 w-5 text-emerald-400" />
          <h3 className="font-display font-bold text-base text-foreground tracking-tight">
            Community Contribution Pool
          </h3>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground bg-surface-2 px-3 py-1 rounded-full border border-border">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          Supporting Ecosystem Growth & Dev Raids
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* TOTAL RAISED */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-extrabold uppercase text-muted-foreground">
              Total Raised
            </div>
            <div className="font-display font-black text-2xl text-emerald-300">
              ${data.totalRaised.toLocaleString()}
            </div>
          </div>
        </div>

        {/* ACTIVE CONTRIBUTORS */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-extrabold uppercase text-muted-foreground">
              Supporters
            </div>
            <div className="font-display font-black text-2xl text-amber-300">
              {data.contributorCount.toLocaleString()} Raiders
            </div>
          </div>
        </div>

        {/* CAUSE */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-purple-500/30 bg-purple-500/5 p-4 sm:col-span-2 lg:col-span-1">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] font-mono font-extrabold uppercase text-muted-foreground">
              Supporting Initiatives
            </div>
            <div className="font-display font-bold text-xs text-foreground line-clamp-1">
              {data.supportingCause}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

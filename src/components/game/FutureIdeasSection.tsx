import { Sparkles, ArrowRight, Lightbulb, Rocket, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FutureIdeasSectionProps {
  onExplore: () => void;
}

export function FutureIdeasSection({ onExplore }: FutureIdeasSectionProps) {
  return (
    <div className="rounded-3xl border-2 border-cyan-500/40 bg-gradient-to-br from-cyan-950/80 via-slate-900/95 to-indigo-950/80 p-6 sm:p-8 shadow-2xl relative overflow-hidden text-left font-sans">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative z-10 space-y-6">
        {/* Top badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 border border-cyan-400/40 px-3.5 py-1 font-mono text-xs font-black text-cyan-300 shadow-sm">
            <Rocket className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span>COMMUNITY ROADMAP VISION</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-cyan-300/80 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
            <span>DEVELOPMENT IDEAS</span>
          </div>
        </div>

        {/* Headline & Body Copy */}
        <div className="space-y-4">
          <div>
            <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>FUTURE IDEAS</span>
              <span className="text-2xl sm:text-3xl">🚀</span>
            </h3>
            <p className="font-mono text-xs sm:text-sm font-extrabold text-cyan-400 uppercase tracking-wider mt-1">
              This is only the beginning.
            </p>
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-4xl font-normal">
            As each season passes, we want Fartboy Raid to evolve into something much bigger — a
            Web3-powered game where the community doesn't just play the game,{" "}
            <strong className="font-bold text-white">they help power the project.</strong>
          </p>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-4xl font-normal">
            Future seasons could bring new characters, items, packs, stats, achievements, game modes
            and eventually{" "}
            <strong className="font-bold text-cyan-200">
              on-chain collectibles that players can truly own, trade and use.
            </strong>
          </p>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-4xl font-normal">
            The vision is to build the first memecoin with an army behind it — turning community
            activity into progression, rewards and an ever-growing game.
          </p>
        </div>

        {/* Action Button & Subtle Disclaimer */}
        <div className="pt-2 space-y-4 border-t border-cyan-500/20">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <Button
              type="button"
              onClick={onExplore}
              className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 hover:from-cyan-300 hover:to-emerald-300 shadow-[0_0_25px_rgba(45,212,191,0.45)] px-7 py-3.5 rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <span>EXPLORE FUTURE IDEAS</span>
              <ArrowRight className="h-4 w-4 stroke-[3]" />
            </Button>

            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300/80">
              <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>Multi-Season World Progression</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3.5 text-[11px] sm:text-xs text-slate-400 leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              These are development ideas, not guaranteed features. What gets built will depend on
              the project's success, resources, community demand and available development time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

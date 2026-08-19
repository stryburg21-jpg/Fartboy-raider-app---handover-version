import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, ChevronDown, Crown, Shield, Sparkles, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContributorRoadmapCard } from "./ContributorRoadmapCard";

export function CareerRecordsAccordion() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-[#0d0f14] via-[#12151e] to-[#0d0f14] p-3 sm:p-4 shadow-xl transition-all duration-300 font-mono overflow-hidden mb-6 ${
        isExpanded ? "space-y-3 sm:space-y-4" : ""
      }`}
      style={{ marginBottom: "24px" }}
    >
      {/* ACCORDION HEADER TRIGGER */}
      <div
        className={`flex items-center justify-between gap-2 ${
          isExpanded ? "border-b border-amber-500/20 pb-2.5" : ""
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          <div className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/50 shrink-0 shadow-lg shadow-amber-500/20">
            <Crown className="h-4 w-4 text-amber-300" />
          </div>
          <div className="min-w-0 flex-1 flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h2 className="font-display font-black text-sm sm:text-base text-amber-300 uppercase tracking-wider truncate leading-tight">
              CAREER STATS
            </h2>
            <span className="inline-flex items-center gap-1 font-mono text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 whitespace-nowrap">
              <Sparkles className="h-2.5 w-2.5 text-amber-300 shrink-0" />
              <span>Lore & Stats</span>
            </span>
          </div>
        </div>

        {/* EXPAND / COLLAPSE BUTTON WITH MIN 48PX TOUCH TARGET */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            size="sm"
            className="min-h-[48px] px-3.5 text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider border-amber-500/40 text-amber-300 bg-amber-950/40 hover:bg-amber-500/20 active:bg-amber-500/30 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 touch-manipulation shrink-0"
            aria-label={isExpanded ? "Collapse Career Stats" : "Expand Career Stats"}
          >
            <span>{isExpanded ? "COLLAPSE" : "EXPAND STATS"}</span>
            <ChevronDown
              className={`h-4 w-4 text-amber-300 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : "rotate-0"
              }`}
            />
          </Button>
        </div>
      </div>

      {/* COLLAPSIBLE ACCORDION CONTENT */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden space-y-4 pt-1"
          >
            {/* CONTRIBUTOR ROADMAP CARD */}
            <ContributorRoadmapCard />

            {/* LIFETIME CAREER STATS */}
            <div className="rounded-2xl border border-amber-500/30 bg-[#14171f] p-4 space-y-3">
              <div className="text-xs font-mono font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-400" /> LIFETIME CAREER STATS
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Total Verified Raids</div>
                  <div className="text-amber-300 font-bold text-sm">1,420</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Total Approved Memes</div>
                  <div className="text-amber-300 font-bold text-sm">88</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Total Approved Videos</div>
                  <div className="text-amber-300 font-bold text-sm">14</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Missions Completed</div>
                  <div className="text-amber-300 font-bold text-sm">312</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Lifetime XP Earned</div>
                  <div className="text-emerald-400 font-bold text-sm">1,850,000</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Packs Opened</div>
                  <div className="text-cyan-300 font-bold text-sm">74</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

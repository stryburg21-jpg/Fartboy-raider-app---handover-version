import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  Shield,
  Trophy,
  Zap,
  Target,
  Hammer,
  Video,
  Flame,
  Gift,
} from "lucide-react";
import { MISSION_PILLARS, type MissionPillar } from "@/utils/missionPillars";

export interface LockedMilestoneItem {
  id: string;
  pillar: MissionPillar;
  title: string;
  codename: string;
  unlockCondition: string;
  etaCountdown?: string;
  currentProgress: number;
  maxProgress: number;
  progressUnit: string;
  teaserReward: string;
  description: string;
  clueSnippet: string;
}

const CANONICAL_LOCKED_MILESTONES: LockedMilestoneItem[] = [
  {
    id: "locked_phase_2",
    pillar: "TACTICAL_RAIDS",
    title: "PHASE 2: DEEP SPACE CITADEL",
    codename: "OP: CITADEL SIEGE",
    unlockCondition: "SEASON 1 PHASE 2 LAUNCH",
    etaCountdown: "COMING IN 4 DAYS",
    currentProgress: 3,
    maxProgress: 7,
    progressUnit: "Days",
    teaserReward: "🎁 Legendary Void Raider Set + 10,000 XP",
    description:
      "Cross-alliance coordinated raids attacking high-value sniper targets and liquidity pools.",
    clueSnippet:
      "INTEL CLUE: Transmissions intercepted from sector 07 indicate synchronized assaults.",
  },
  {
    id: "locked_armory_ascension",
    pillar: "FORGE_ARMORY",
    title: "ARMORY ASCENSION PROTOCOL",
    codename: "OP: TITAN FORGE",
    unlockCondition: "UNLOCKS AT 50 FORGE ACTIONS",
    currentProgress: 32,
    maxProgress: 50,
    progressUnit: "Actions",
    teaserReward: "🏆 'Forge Lord' Title + 500x Forge Dust",
    description:
      "Execute 50 Forge operations (upgrades, fusions, and dismantles) to unlock master blueprints.",
    clueSnippet:
      "INTEL CLUE: High-temperature plasma calibration unlocks mythical craft tier recipes.",
  },
  {
    id: "locked_level_30",
    pillar: "TACTICAL_RAIDS",
    title: "TITANIC SQUAD SIEGE: VOID REAPER",
    codename: "OP: REAPER PROTOCOL",
    unlockCondition: "UNLOCKS AT LEVEL 30",
    currentProgress: 22,
    maxProgress: 30,
    progressUnit: "Level",
    teaserReward: "🎁 3x Specialist Packs + Exclusive Raid Badge",
    description:
      "High-difficulty 4-man tactical raid requiring verified Discord channel TA and synchronized voting.",
    clueSnippet:
      "INTEL CLUE: Level 30 clearance required for encrypted tactical command room access.",
  },
  {
    id: "locked_psyop_viral",
    pillar: "PSYOP_CONTENT",
    title: "VIRAL MEMETIC DOMINANCE",
    codename: "OP: MEME STORM",
    unlockCondition: "UNLOCKS AT 10 VERIFIED SUBMISSIONS",
    currentProgress: 6,
    maxProgress: 10,
    progressUnit: "Memes",
    teaserReward: "⭐ 'Psy-Op Architect' Badge + 15,000 XP",
    description:
      "Publish 10 verified original meme graphics or reels that pass community bot reaction quotas.",
    clueSnippet:
      "INTEL CLUE: Algorithm penetration metrics tracked continuously on X and Telegram.",
  },
  {
    id: "locked_warchest_titan",
    pillar: "WARCHEST_BOOSTS",
    title: "WAR CHEST HIGH COMMAND",
    codename: "OP: TREASURY TITAN",
    unlockCondition: "UNLOCKS AT 1.0 SOL TOTAL DONATION",
    currentProgress: 0.45,
    maxProgress: 1.0,
    progressUnit: "SOL",
    teaserReward: "👑 'Treasury Guardian' Aura + 2x Specialist Packs",
    description:
      "Cumulative ecosystem liquidity contribution supporting decentralized exchange pairing reserves.",
    clueSnippet:
      "INTEL CLUE: Treasury contributors receive automated on-chain verified Discord roles.",
  },
];

interface LockedMilestonesSectionProps {
  currentPillarFilter?: string;
  className?: string;
}

export function LockedMilestonesSection({
  currentPillarFilter,
  className = "",
}: LockedMilestonesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredMilestones =
    currentPillarFilter && currentPillarFilter !== "ALL"
      ? CANONICAL_LOCKED_MILESTONES.filter((m) => m.pillar === currentPillarFilter)
      : CANONICAL_LOCKED_MILESTONES;

  return (
    <div
      id="locked-future-milestones-section"
      className={`space-y-3 pt-4 border-t border-slate-800/80 font-mono ${className}`}
    >
      {/* SECTION HEADER BAR */}
      <div className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-950/70 p-3.5 sm:p-4 backdrop-blur-md flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-900 border border-slate-700/80 text-amber-400">
            <Lock className="h-4 w-4 text-amber-400/90" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-black text-xs sm:text-sm text-white tracking-wide uppercase">
                CLUES & FUTURE SEASON MILESTONES
              </h3>
              <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.2 rounded-full">
                {filteredMilestones.length} Upcoming Directives
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Preview encrypted seasonal milestones and preparation requirements.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all cursor-pointer"
        >
          <span>{isExpanded ? "Hide Clues" : "View Clues"}</span>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* EXPANDABLE CARDS GRID */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5"
          >
            {filteredMilestones.map((m) => {
              const pillar = MISSION_PILLARS[m.pillar];
              const PillarIcon = pillar.icon;
              const pct = Math.min(100, Math.round((m.currentProgress / m.maxProgress) * 100));

              return (
                <div
                  key={m.id}
                  className="relative overflow-hidden rounded-2xl border border-dashed border-slate-700/80 bg-gradient-to-b from-slate-950/90 via-slate-900/70 to-slate-950/90 p-4 backdrop-blur-md space-y-3 shadow-lg flex flex-col justify-between group hover:border-amber-500/40 transition-colors"
                >
                  {/* FROSTED GLASS SCAN OVERLAY */}
                  <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-slate-800/20 blur-2xl group-hover:bg-amber-500/5 transition-all" />

                  <div className="space-y-2 relative z-10">
                    {/* CARD HEADER: PILLAR & UNLOCK BADGE */}
                    <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-slate-800/60">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-1.5 py-0.5 text-[8.5px] font-black rounded-md border uppercase ${pillar.badgeClass}`}
                        >
                          {pillar.shortLabel}
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold">{m.codename}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[9.5px] font-black text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        <Lock className="h-2.5 w-2.5" />
                        <span>{m.etaCountdown || m.unlockCondition}</span>
                      </div>
                    </div>

                    {/* TITLE & DESCRIPTION */}
                    <div className="space-y-1">
                      <h4 className="font-display font-black text-xs sm:text-sm text-slate-200 tracking-tight flex items-center gap-1.5">
                        <span>{m.title}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                        {m.description}
                      </p>
                    </div>

                    {/* ENCRYPTED CLUE BOX */}
                    <div className="rounded-xl border border-slate-800/80 bg-black/40 p-2 text-[10px] text-amber-200/80 italic leading-snug">
                      {m.clueSnippet}
                    </div>
                  </div>

                  {/* BOTTOM: THRESHOLD PROGRESS & REWARD TEASER */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80 mt-auto relative z-10">
                    {/* PROGRESS BAR */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                        <span className="text-slate-400">Unlock Requirement</span>
                        <span className="text-amber-300 font-mono">
                          {m.currentProgress} / {m.maxProgress} {m.progressUnit} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-slate-600 via-amber-500/70 to-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>

                    {/* TEASER REWARD CALLOUT */}
                    <div className="flex items-center justify-between text-[10.5px] font-bold text-amber-300 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg">
                      <span className="text-slate-400 text-[9.5px]">Projected Bounty:</span>
                      <span className="truncate max-w-[170px] text-right font-black">
                        {m.teaserReward}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

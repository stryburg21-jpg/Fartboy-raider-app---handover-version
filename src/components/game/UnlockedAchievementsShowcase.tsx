import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Lock,
  ChevronDown,
} from "lucide-react";
import type { Achievement, Rarity } from "@/types/game";
import { Button } from "@/components/ui/button";

interface UnlockedAchievementsShowcaseProps {
  achievements: Achievement[];
  isLoading?: boolean;
}

function getNeonRarityStyles(rarity: Rarity | undefined, unlocked: boolean) {
  if (!unlocked) {
    return {
      cardBg:
        "from-slate-950/90 via-[#0d1017] to-slate-950/90 border-slate-800 hover:border-slate-700",
      iconBg: "bg-slate-900/90 text-slate-500 border-slate-800",
      tagBg: "bg-slate-900 text-slate-400 border-slate-800",
      glow: "shadow-none opacity-85",
    };
  }

  switch (rarity) {
    case "mythic":
      return {
        cardBg:
          "from-pink-950/60 via-[#120d1a] to-slate-950 border-pink-500/70 hover:border-pink-400",
        iconBg:
          "bg-gradient-to-br from-pink-500/20 to-purple-500/30 text-pink-300 border-pink-500/60 shadow-pink-500/20 shadow-lg",
        tagBg: "bg-pink-950/80 text-pink-300 border-pink-500/50",
        glow: "shadow-[0_0_20px_rgba(236,72,153,0.35)]",
      };
    case "legendary":
      return {
        cardBg:
          "from-amber-950/60 via-[#14120a] to-slate-950 border-amber-500/70 hover:border-amber-400",
        iconBg:
          "bg-gradient-to-br from-amber-500/20 to-yellow-500/30 text-amber-300 border-amber-500/60 shadow-amber-500/20 shadow-lg",
        tagBg: "bg-amber-950/80 text-amber-300 border-amber-500/50",
        glow: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
      };
    case "epic":
      return {
        cardBg:
          "from-purple-950/60 via-[#120e1a] to-slate-950 border-purple-500/60 hover:border-purple-400",
        iconBg:
          "bg-gradient-to-br from-purple-500/20 to-violet-500/30 text-purple-300 border-purple-500/60 shadow-purple-500/20 shadow-lg",
        tagBg: "bg-purple-950/80 text-purple-300 border-purple-500/50",
        glow: "shadow-[0_0_15px_rgba(168,85,247,0.3)]",
      };
    case "rare":
      return {
        cardBg:
          "from-cyan-950/60 via-[#0a1218] to-slate-950 border-cyan-500/60 hover:border-cyan-400",
        iconBg:
          "bg-gradient-to-br from-cyan-500/20 to-blue-500/30 text-cyan-300 border-cyan-500/60 shadow-cyan-500/20 shadow-lg",
        tagBg: "bg-cyan-950/80 text-cyan-300 border-cyan-500/50",
        glow: "shadow-[0_0_15px_rgba(6,182,212,0.3)]",
      };
    default:
      return {
        cardBg:
          "from-slate-900/90 via-[#0c0f16] to-slate-950 border-slate-700/80 hover:border-slate-500",
        iconBg: "bg-slate-800/80 text-slate-200 border-slate-700 shadow-slate-500/10 shadow-md",
        tagBg: "bg-slate-900/80 text-slate-300 border-slate-700",
        glow: "shadow-[0_0_10px_rgba(148,163,184,0.15)]",
      };
  }
}

function formatDate(isoString?: string): string {
  if (!isoString) return "Unlocked";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Unlocked";
  }
}

export function UnlockedAchievementsShowcase({
  achievements,
  isLoading,
}: UnlockedAchievementsShowcaseProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const unlockedOnly = achievements.filter((a) => a.unlocked);

  if (isLoading) {
    return (
      <div className="rounded-2xl border-2 border-amber-500/30 bg-[#090b10] p-4 space-y-2 shadow-xl font-mono">
        <div className="h-5 w-48 rounded bg-slate-800" />
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-[#0d0f14] via-[#12151e] to-[#0d0f14] p-3 sm:p-4 shadow-xl transition-all duration-300 font-mono overflow-hidden ${
        isExpanded ? "space-y-3 sm:space-y-4" : ""
      }`}
    >
      {/* SECTION HEADER / SLEEK ROW CONTAINER */}
      <div
        className={`flex items-center justify-between gap-2 ${
          isExpanded ? "border-b border-amber-500/20 pb-2.5" : ""
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          <div className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/50 shrink-0 shadow-lg shadow-amber-500/20">
            <Trophy className="h-4 w-4 text-amber-300" />
          </div>
          <div className="min-w-0 flex-1 flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h2 className="font-display font-black text-sm sm:text-base text-amber-300 uppercase tracking-wider truncate leading-tight">
              TROPHY CABINET
            </h2>
            <span className="inline-flex items-center gap-1 font-mono text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 whitespace-nowrap">
              <Sparkles className="h-2.5 w-2.5 text-amber-300 shrink-0" />
              <span>
                {unlockedOnly.length} / {achievements.length} Unlocked
              </span>
            </span>
          </div>
        </div>

        {/* EXPAND CATALOGUE TOGGLE BUTTON & ACTIONS */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            size="sm"
            className="min-h-[44px] sm:min-h-[48px] px-3.5 text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider border-amber-500/40 text-amber-300 bg-amber-950/40 hover:bg-amber-500/20 active:bg-amber-500/30 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 touch-manipulation shrink-0"
            aria-label={isExpanded ? "Collapse Trophy Cabinet" : "Expand Trophy Cabinet"}
          >
            <span>{isExpanded ? "COLLAPSE" : `EXPAND (${achievements.length})`}</span>
            <ChevronDown
              className={`h-4 w-4 text-amber-300 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : "rotate-0"
              }`}
            />
          </Button>

          <Link to="/achievements" className="hidden sm:block shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px] sm:min-h-[48px] px-3 gap-1.5 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl whitespace-nowrap shrink-0"
            >
              <span>Full Page</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ANIMATED TROPHY CABINET CATALOGUE DRAWER */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden space-y-4 pt-3 border-t border-amber-500/20 transition-all duration-300 ease-in-out"
          >
            {achievements.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/60 p-6 text-center space-y-2">
                <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-slate-500">
                  <Trophy className="h-5 w-5" />
                </div>
                <p className="font-display text-xs font-bold text-slate-300">
                  No Achievements In Catalogue
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {achievements.map((achievement) => {
                  const isUnlocked = Boolean(achievement.unlocked);
                  const styles = getNeonRarityStyles(achievement.rarity, isUnlocked);
                  const curProgress = achievement.progress ?? (isUnlocked ? 100 : 0);
                  const reqProgress = achievement.requirement ?? 100;
                  const progressPct = Math.min(100, Math.round((curProgress / reqProgress) * 100));

                  return (
                    <div
                      key={achievement.id}
                      className={`group relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br ${styles.cardBg} ${styles.glow} p-4 transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between gap-3`}
                    >
                      {/* COMPLETED / STATUS CHIP */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono font-extrabold uppercase tracking-wider border ${styles.tagBg}`}
                        >
                          {isUnlocked ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              <span>EARNED & CLAIMED</span>
                            </>
                          ) : progressPct > 0 ? (
                            <>
                              <Zap className="h-3 w-3 text-cyan-400" />
                              <span>IN PROGRESS ({progressPct}%)</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3 text-slate-500" />
                              <span>LOCKED</span>
                            </>
                          )}
                        </span>
                        {achievement.rarity && (
                          <span className="font-mono text-[9px] uppercase font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                            {achievement.rarity}
                          </span>
                        )}
                      </div>

                      {/* MAIN CARD CONTENT */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 text-2xl transition-transform duration-300 group-hover:scale-110 ${styles.iconBg}`}
                        >
                          {achievement.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display font-black text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                            {achievement.name}
                          </h3>
                          <p className="text-xs font-mono text-slate-400 leading-relaxed mt-0.5 break-words">
                            {achievement.description}
                          </p>
                        </div>
                      </div>

                      {/* PROGRESS BAR FOR LOCKED/IN-PROGRESS ACHIEVEMENTS */}
                      {!isUnlocked && (
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 font-bold">
                            <span>Requirement Progress</span>
                            <span className="text-cyan-300">
                              {curProgress} / {reqProgress}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden p-0.5">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* BOTTOM FOOTER: DISCORD ROLE & XP REWARD */}
                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                        {achievement.discordTag ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 font-bold text-[10px]">
                            <Award className="h-3 w-3 text-indigo-400" />
                            {achievement.discordTag}
                          </span>
                        ) : achievement.unlockedAt ? (
                          <span className="text-slate-500 text-[10px]">
                            {formatDate(achievement.unlockedAt)}
                          </span>
                        ) : null}

                        {achievement.reward?.xp ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-extrabold ml-auto text-[11px]">
                            <Zap className="h-3 w-3" />
                            {`+${achievement.reward.xp.toLocaleString()} POWER`}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* BOTTOM ACTION BANNER */}
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-purple-950/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display font-black text-sm uppercase text-amber-300">
                    Complete Your Trophy Cabinet
                  </div>
                  <p className="text-xs font-mono text-slate-400">
                    Complete missions, verify raids, and open specialist packs to earn all badges!
                  </p>
                </div>
              </div>

              <Link to="/achievements" className="w-full sm:w-auto shrink-0">
                <Button className="w-full sm:w-auto font-mono text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 hover:bg-amber-300 gap-2 shadow-lg shadow-amber-500/20 cursor-pointer">
                  Explore Collection
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

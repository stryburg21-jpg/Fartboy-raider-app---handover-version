import { useState } from "react";
import confetti from "canvas-confetti";
import { Trophy, Lock, Award, CheckCircle2, Zap, Sparkles } from "lucide-react";
import type { Achievement, Rarity } from "@/types/game";
import type { AutomatedMissionItem } from "@/services/automatedMissionsApi";
import { ProgressBar } from "./ProgressBar";
import { TacticalMissionBriefModal } from "./TacticalMissionBriefModal";

interface AchievementCatalogueCardProps {
  achievement: Achievement;
}

function playCelebrationChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Celebratory Major Chime)
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.45);
    });
  } catch {
    // Ignore audio context autoplay restrictions
  }
}

function triggerGoldConfetti(e?: React.MouseEvent) {
  try {
    let origin = { x: 0.5, y: 0.6 };
    if (e) {
      origin = {
        x: Math.max(0.1, Math.min(0.9, e.clientX / window.innerWidth)),
        y: Math.max(0.1, Math.min(0.9, e.clientY / window.innerHeight)),
      };
    }
    confetti({
      particleCount: 35,
      spread: 60,
      origin,
      colors: ["#fbbf24", "#f59e0b", "#eab308", "#38bdf8", "#a855f7"],
      disableForReducedMotion: true,
    });
  } catch {
    // Ignore confetti errors
  }
}

function getRarityCardStyles(rarity: Rarity | undefined, unlocked: boolean) {
  if (!unlocked) {
    return {
      cardBg:
        "from-slate-900/80 via-slate-900/90 to-slate-950/90 border-slate-700/50 text-muted-foreground opacity-85 hover:opacity-100 hover:border-slate-500 hover:bg-slate-900/90 shadow-md",
      iconBg: "bg-slate-800/80 text-slate-500 border-slate-700/60",
      tagBg: "bg-slate-800/90 text-slate-400 border-slate-700/80",
      glow: "",
      shimmer: false,
      accentText: "text-slate-400",
    };
  }

  switch (rarity) {
    case "mythic":
      return {
        cardBg:
          "from-rose-950/40 via-slate-900 to-amber-950/30 border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.3)] hover:shadow-[0_0_35px_rgba(251,191,36,0.45)] hover:border-amber-300 ring-1 ring-amber-400/40",
        iconBg:
          "bg-gradient-to-br from-rose-500/30 via-amber-500/20 to-purple-500/40 text-rose-300 border-amber-400/60 shadow-lg shadow-amber-500/20",
        tagBg: "bg-rose-500/20 text-rose-300 border-rose-400/50 font-bold",
        glow: "shadow-[0_0_25px_rgba(251,191,36,0.3)]",
        shimmer: true,
        accentText: "text-rose-300",
      };
    case "legendary":
      return {
        cardBg:
          "from-amber-950/50 via-slate-900 to-yellow-950/30 border-amber-400/90 shadow-[0_0_25px_rgba(251,191,36,0.35)] hover:shadow-[0_0_35px_rgba(251,191,36,0.5)] hover:border-amber-300 ring-1 ring-amber-400/50",
        iconBg:
          "bg-gradient-to-br from-amber-500/40 to-yellow-500/40 text-amber-300 border-amber-400/80 shadow-lg shadow-amber-500/30",
        tagBg: "bg-amber-500/20 text-amber-300 border-amber-400/50 font-bold",
        glow: "shadow-[0_0_25px_rgba(251,191,36,0.35)]",
        shimmer: true,
        accentText: "text-amber-300",
      };
    case "epic":
      return {
        cardBg:
          "from-purple-950/40 via-slate-900 to-amber-950/20 border-amber-400/75 shadow-[0_0_22px_rgba(251,191,36,0.25)] hover:shadow-[0_0_32px_rgba(251,191,36,0.4)] hover:border-amber-300 ring-1 ring-amber-400/30",
        iconBg:
          "bg-gradient-to-br from-purple-500/30 to-violet-500/40 text-purple-300 border-purple-400/60 shadow-md shadow-purple-500/30",
        tagBg: "bg-purple-500/20 text-purple-300 border-purple-400/50 font-bold",
        glow: "shadow-[0_0_22px_rgba(251,191,36,0.25)]",
        shimmer: true,
        accentText: "text-purple-300",
      };
    case "rare":
      return {
        cardBg:
          "from-cyan-950/30 via-slate-900 to-amber-950/20 border-amber-400/70 shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_30px_rgba(251,191,36,0.35)] hover:border-amber-300 ring-1 ring-amber-400/30",
        iconBg:
          "bg-gradient-to-br from-cyan-500/30 to-blue-500/40 text-cyan-300 border-cyan-400/60 shadow-md shadow-cyan-500/25",
        tagBg: "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold",
        glow: "shadow-[0_0_20px_rgba(251,191,36,0.2)]",
        shimmer: false,
        accentText: "text-cyan-300",
      };
    default:
      return {
        cardBg:
          "from-slate-900 via-slate-900 to-amber-950/20 border-amber-400/70 shadow-[0_0_18px_rgba(251,191,36,0.2)] hover:border-amber-300 hover:shadow-[0_0_28px_rgba(251,191,36,0.35)] ring-1 ring-amber-400/25",
        iconBg:
          "bg-gradient-to-br from-emerald-500/20 to-teal-500/30 text-emerald-300 border-emerald-500/50",
        tagBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold",
        glow: "shadow-[0_0_18px_rgba(251,191,36,0.2)]",
        shimmer: false,
        accentText: "text-emerald-300",
      };
  }
}

function formatDate(isoString?: string): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function AchievementCatalogueCard({ achievement }: AchievementCatalogueCardProps) {
  const [inspectOpen, setInspectOpen] = useState(false);
  const isUnlocked = achievement.unlocked;
  const styles = getRarityCardStyles(achievement.rarity, isUnlocked);
  const formattedDate = formatDate(achievement.unlockedAt);

  const hasProgress =
    !isUnlocked &&
    typeof achievement.progress === "number" &&
    typeof achievement.requirement === "number" &&
    achievement.requirement > 0;

  const progressPercent = hasProgress
    ? Math.min(100, Math.round((achievement.progress! / achievement.requirement!) * 100))
    : 0;

  const handleCardClick = (e: React.MouseEvent) => {
    setInspectOpen(true);
    if (isUnlocked) {
      triggerGoldConfetti(e);
      playCelebrationChime();
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick(e as unknown as React.MouseEvent);
          }
        }}
        className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${styles.cardBg} p-5 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:brightness-105 cursor-pointer flex flex-col justify-between gap-4 select-none`}
      >
        {/* SUBTLE CONTINUOUS SHIMMER ANIMATION FOR UNLOCKED CARDS */}
        {isUnlocked && styles.shimmer && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute -inset-full w-[200%] h-[200%] bg-gradient-to-r from-transparent via-amber-200/10 to-transparent animate-shimmer-sweep opacity-75" />
          </div>
        )}

        {/* TOP BAR: CELEBRATION BADGE & CATEGORY */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {isUnlocked ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-mono font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-amber-500/30 border border-amber-400/80 text-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.4)]">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                [CLAIMED]
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-mono font-extrabold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                <Lock className="h-3 w-3" />
                {achievement.rarity ? `${achievement.rarity}` : "Locked"}
              </span>
            )}

            {achievement.category && (
              <span className="font-mono text-[10px] uppercase font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                {achievement.category}
              </span>
            )}
          </div>

          {isUnlocked && formattedDate && (
            <span className="font-mono text-[10px] text-amber-400 font-bold flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" />
              {formattedDate}
            </span>
          )}
        </div>

        {/* CENTER: ICON & DETAILS */}
        <div className="relative z-10 flex items-start gap-4">
          <div
            className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border text-3xl transition-transform duration-200 group-hover:scale-105 ${styles.iconBg}`}
          >
            {isUnlocked ? achievement.icon : <Lock className="h-6 w-6 text-slate-500" />}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h3
              className={`font-display font-extrabold text-base tracking-tight truncate transition-colors ${
                isUnlocked ? "text-foreground group-hover:text-amber-300" : "text-slate-400"
              }`}
            >
              {achievement.name}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
              {achievement.description}
            </p>
          </div>
        </div>

        {/* PROGRESS BAR FOR LOCKED ACHIEVEMENTS */}
        {!isUnlocked && hasProgress && (
          <div className="relative z-10 space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-slate-400">Progress</span>
              <span className="font-bold text-foreground">
                {achievement.progress} / {achievement.requirement} ({progressPercent}%)
              </span>
            </div>
            <ProgressBar value={progressPercent} className="h-2 rounded-full bg-slate-800" />
          </div>
        )}

        {/* FOOTER: SHINY REWARDS CONTAINER */}
        <div className="relative z-10 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          {achievement.discordTag ? (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-extrabold border transition-all ${
                isUnlocked
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm"
                  : "bg-slate-800/70 text-slate-400 border-slate-700/60"
              }`}
            >
              <Award
                className={`h-3.5 w-3.5 ${isUnlocked ? "text-indigo-400" : "text-slate-400"}`}
              />
              {achievement.discordTag}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Trophy className="h-3 w-3 text-amber-400/80" /> Raider Badge
            </span>
          )}

          <div className="flex items-center gap-1.5 ml-auto flex-wrap">
            {achievement.reward?.packs?.map((pack, idx) => (
              <span
                key={`pack-${idx}`}
                className={`inline-flex items-center gap-1 font-extrabold text-[11px] px-2.5 py-1 rounded-lg border transition-transform group-hover:scale-105 ${
                  isUnlocked
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                    : "bg-slate-800/80 text-slate-400 border-slate-700/60"
                }`}
              >
                <Sparkles className="h-3 w-3 text-amber-400" /> +{pack.qty}{" "}
                {pack.type.replace(/_/g, " ").toUpperCase()} PACK
              </span>
            ))}

            {achievement.reward?.xp ? (
              <span
                className={`inline-flex items-center gap-1.5 font-extrabold text-[11px] px-2.5 py-1 rounded-lg border transition-transform group-hover:scale-105 ${
                  isUnlocked
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    : "bg-slate-800/80 text-slate-400 border-slate-700/60"
                }`}
              >
                <Zap className="h-3.5 w-3.5 text-emerald-400" />
                {`+${achievement.reward.xp.toLocaleString()} POWER`}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <TacticalMissionBriefModal
        open={inspectOpen}
        onClose={() => setInspectOpen(false)}
        mission={achievement as unknown as AutomatedMissionItem}
      />
    </>
  );
}

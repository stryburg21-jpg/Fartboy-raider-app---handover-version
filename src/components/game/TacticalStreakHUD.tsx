import React from "react";
import { motion } from "motion/react";
import { Flame, Zap, Shield, Clock, Trophy, Sparkles, AlertTriangle } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { audio } from "@/services/audio";

interface TacticalStreakHUDProps {
  dailyResetTimer?: string;
}

export function TacticalStreakHUD({ dailyResetTimer = "07h 12m" }: TacticalStreakHUDProps) {
  const streakStatus = useGameStore((s) => s.streakStatus);
  const count = streakStatus?.count || 3;
  const bonusXPPercent = streakStatus?.bonusXPPercent || Math.min(25, 5 + count * 5);

  const streakDays = [
    { day: 1, label: "Day 1", boost: "+5%", reward: "Base XP" },
    { day: 2, label: "Day 2", boost: "+10%", reward: "Raid Multiplier" },
    { day: 3, label: "Day 3", boost: "+15%", reward: "Supply Cache" },
    { day: 4, label: "Day 4", boost: "+18%", reward: "XP Overcharge" },
    { day: 5, label: "Day 5", boost: "+20%", reward: "Rare Fragment" },
    { day: 6, label: "Day 6", boost: "+22%", reward: "Elite Intel" },
    { day: 7, label: "Day 7", boost: "+25%", reward: "🎁 Free Raider Pack", isCrown: true },
  ];

  return (
    <div
      id="tactical-streak-multiplier-hud"
      className="relative overflow-hidden rounded-2xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-950/90 via-slate-900/95 to-slate-950 p-4 sm:p-5 shadow-[0_0_30px_rgba(245,158,11,0.25)] animate-fire-aura font-mono"
    >
      {/* BACKGROUND BURNING EMBER OVERLAY */}
      <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-red-600/10 via-amber-500/10 to-transparent pointer-events-none" />

      {/* TOP ROW: STREAK BADGE, COMBAT MULTIPLIER, COUNTDOWN */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-500/30 pb-3 relative z-10">
        <div className="flex items-center gap-3">
          {/* BURNING FIRE AURA ICON */}
          <div
            onMouseEnter={() => audio.play("streak.fire")}
            className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.8)] border-2 border-amber-200 animate-pulse cursor-pointer"
          >
            <Flame className="h-7 w-7 fill-slate-950 text-slate-950" />
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-amber-300 text-[10px] font-black border border-amber-400">
              {count}d
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-base sm:text-lg text-white tracking-tight">
                {count}-DAY RAID STREAK
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 text-[10px] font-black uppercase animate-pulse">
                <Flame className="h-3 w-3 fill-red-400 text-red-400" /> ACTIVE
              </span>
            </div>

            <div className="text-xs text-amber-300 font-bold flex items-center gap-1.5 pt-0.5">
              <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>
                STREAK MULTIPLIER:{" "}
                <span className="text-white font-extrabold text-sm">
                  +{bonusXPPercent}% XP BOOST
                </span>{" "}
                ON ALL BOUNTIES!
              </span>
            </div>
          </div>
        </div>

        {/* STREAK RESET WARNING */}
        <div className="flex items-center gap-2 bg-slate-950/80 border border-amber-500/30 rounded-xl px-3 py-1.5 text-xs text-slate-300 shrink-0">
          <Clock className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            Streak Shield Expires:{" "}
            <span className="text-amber-400 font-black">{dailyResetTimer}</span>
          </span>
        </div>
      </div>

      {/* 7-DAY MILESTONES NODES TRACK */}
      <div className="pt-3.5 relative z-10">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold pb-2">
          <span>7-DAY RAID PROTOCOL PROGRESS</span>
          <span className="text-amber-300 font-extrabold">
            {count >= 7 ? "MAX OVERCHARGE REACHED ⚡" : `Day ${count}/7 Achieved`}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {streakDays.map((step) => {
            const isCompleted = count >= step.day;
            const isCurrent = count === step.day;

            return (
              <motion.div
                key={`streak-day-${step.day}`}
                whileHover={{ scale: 1.05 }}
                className={`relative flex flex-col items-center justify-between rounded-xl p-1.5 sm:p-2 text-center transition-all border ${
                  isCurrent
                    ? "bg-gradient-to-b from-amber-500/30 via-slate-900 to-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/40"
                    : isCompleted
                      ? "bg-amber-950/40 border-amber-500/40 text-amber-300"
                      : "bg-slate-950/60 border-slate-800 text-slate-500 opacity-60"
                }`}
              >
                <div className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400">
                  {step.label}
                </div>

                <div className="my-1">
                  {step.isCrown ? (
                    <Trophy
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        isCompleted ? "text-amber-400 fill-amber-400" : "text-slate-600"
                      }`}
                    />
                  ) : (
                    <Flame
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        isCompleted
                          ? "text-amber-400 fill-amber-400 animate-pulse"
                          : "text-slate-600"
                      }`}
                    />
                  )}
                </div>

                <div
                  className={`text-[9px] sm:text-[10px] font-black ${
                    isCompleted ? "text-amber-300" : "text-slate-500"
                  }`}
                >
                  {step.boost}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

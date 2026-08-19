import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Trophy, Flame, Rocket, ChevronDown, Sparkles, Info, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatInfoTooltip } from "./StatInfoTooltip";
import { UserRankStatusWidget } from "./UserRankStatusWidget";
import {
  getSeasonMeter,
  getWarchestMeter,
  subscribeToCommunityMeters,
  SEASON_METER_MILESTONE_CONFIGS,
  WARCHEST_METER_MILESTONE_CONFIGS,
  type CommunityMeterState,
} from "@/services/communityMeters";
import type { MeterMilestoneConfig } from "@/config/communityMeters";
import { UnlockCelebration, type CelebrationPayload } from "./UnlockCelebration";

function milestoneToCelebration(
  meterLabel: string,
  milestone: MeterMilestoneConfig,
): CelebrationPayload {
  return {
    kind: "achievement",
    title: milestone.label,
    subtitle: `${meterLabel} milestone unlocked — reward credited to your account.`,
    iconEmoji: "🎉",
    rarity: "legendary",
    rewards: [
      {
        label: milestone.rewardDescription,
        kind: milestone.rewardType === "spendableXP" ? "xp" : "item",
        amount: milestone.spendableXPGrant,
      },
    ],
  };
}

function MeterTrack({
  icon,
  label,
  accent,
  state,
  milestones,
  isExpanded,
}: {
  icon: React.ReactNode;
  label: string;
  accent: "amber" | "emerald";
  state: CommunityMeterState;
  milestones: MeterMilestoneConfig[];
  isExpanded: boolean;
}) {
  const currentValue = state?.currentValue ?? 0;
  const goal = state?.goal ?? 1;
  const pct = goal > 0 ? Math.min(100, (currentValue / goal) * 100) : 0;
  const accentBar =
    accent === "amber"
      ? "bg-gradient-to-r from-amber-500 to-yellow-400"
      : "bg-gradient-to-r from-emerald-500 to-cyan-400";
  const borderTone = accent === "amber" ? "border-amber-500/30" : "border-emerald-500/30";
  const unlockedIds = state?.unlockedMilestoneIds ?? [];

  return (
    <div className={`space-y-2 rounded-xl bg-black/40 p-2.5 sm:p-3 border ${borderTone}`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold">
          {icon}
          <span className="text-foreground text-xs sm:text-sm uppercase tracking-wide">
            {label}
          </span>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          <span className="text-foreground font-extrabold">{currentValue.toLocaleString()}</span> /{" "}
          {goal.toLocaleString()} ({pct.toFixed(0)}%)
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative h-2.5 w-full rounded-full bg-slate-900 overflow-hidden border border-white/10">
        <div
          className={`h-full ${accentBar} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Streamlined Milestones Row */}
      {isExpanded && (
        <div className="pt-1.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {milestones.map((m) => {
              const isUnlocked = unlockedIds.includes(m.id);
              const milestoneThreshold = Math.round((m.thresholdPct ?? 0) * goal);
              return (
                <div
                  key={m.id}
                  className={`p-1.5 rounded-lg border text-[9.5px] sm:text-[10px] flex items-center justify-between gap-1 transition-all ${
                    isUnlocked
                      ? "bg-amber-500/15 border-amber-400/60 text-amber-200"
                      : "bg-slate-950/60 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold truncate text-slate-200">{m.label || m.id}</span>
                    <span className="text-[8px] text-muted-foreground truncate">
                      {milestoneThreshold.toLocaleString()} (
                      {Math.round((m.thresholdPct ?? 0) * 100)}%)
                    </span>
                  </div>
                  <span className="shrink-0 font-bold">{isUnlocked ? "✓" : "🔒"}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProgressionAndServerMeters() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [season, setSeason] = useState<CommunityMeterState>(() => getSeasonMeter());
  const [warchest, setWarchest] = useState<CommunityMeterState>(() => getWarchestMeter());
  const [celebration, setCelebration] = useState<CelebrationPayload | null>(null);
  const [celebrationQueue, setCelebrationQueue] = useState<CelebrationPayload[]>([]);

  useEffect(() => {
    function refresh() {
      setSeason((prev) => {
        const next = getSeasonMeter();
        const newlyUnlocked = next.unlockedMilestoneIds.filter(
          (id) => !prev.unlockedMilestoneIds.includes(id),
        );
        if (newlyUnlocked.length > 0) {
          const payloads = newlyUnlocked
            .map((id) => SEASON_METER_MILESTONE_CONFIGS.find((m) => m.id === id))
            .filter((m): m is MeterMilestoneConfig => !!m)
            .map((m) => milestoneToCelebration("Community Season Meter", m));
          setCelebrationQueue((q) => [...q, ...payloads]);
        }
        return next;
      });
      setWarchest((prev) => {
        const next = getWarchestMeter();
        const newlyUnlocked = next.unlockedMilestoneIds.filter(
          (id) => !prev.unlockedMilestoneIds.includes(id),
        );
        if (newlyUnlocked.length > 0) {
          const payloads = newlyUnlocked
            .map((id) => WARCHEST_METER_MILESTONE_CONFIGS.find((m) => m.id === id))
            .filter((m): m is MeterMilestoneConfig => !!m)
            .map((m) => milestoneToCelebration("Warchest Meter", m));
          setCelebrationQueue((q) => [...q, ...payloads]);
        }
        return next;
      });
    }

    const unsubscribe = subscribeToCommunityMeters(refresh);
    const interval = setInterval(refresh, 15_000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Drain celebration queue
  useEffect(() => {
    if (!celebration && celebrationQueue.length > 0) {
      setCelebration(celebrationQueue[0]);
      setCelebrationQueue((q) => q.slice(1));
    }
  }, [celebration, celebrationQueue]);

  const seasonCurrent = season?.currentValue ?? 0;
  const seasonGoal = season?.goal ?? 1;
  const seasonPct = seasonGoal > 0 ? Math.min(100, (seasonCurrent / seasonGoal) * 100) : 0;

  const warchestCurrent = warchest?.currentValue ?? 0;
  const warchestGoal = warchest?.goal ?? 1;
  const warchestPct = warchestGoal > 0 ? Math.min(100, (warchestCurrent / warchestGoal) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-[#0d0f14] via-[#12151e] to-[#0d0f14] px-2.5 sm:px-3 py-2 shadow-xl space-y-1.5 font-mono">
      {/* HEADER ROW WITH BADGES & INLINE EXPAND/COLLAPSE TOGGLE */}
      <div className="flex items-center justify-between gap-1.5 flex-wrap border-b border-amber-500/20 pb-1.5 w-full">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 flex-wrap">
          <div className="grid h-7 w-7 sm:h-7.5 sm:w-7.5 place-items-center rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/50 shrink-0 shadow-md shadow-amber-500/20">
            <Trophy className="h-3.5 w-3.5 text-amber-300" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <h3 className="font-display text-[11px] sm:text-sm font-black uppercase tracking-wider text-amber-300 truncate leading-tight shrink-0">
              HQ Directives & Server Meters
            </h3>
            <span className="inline-flex items-center gap-1 font-mono text-xs font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/25 to-yellow-500/25 text-amber-300 border border-amber-500/50 shrink-0 whitespace-nowrap">
              <Sparkles className="h-2 w-2 text-amber-400 shrink-0" />
              <span className="hidden xs:inline">[SEASON & SERVER METERS]</span>
              <span className="xs:hidden">[METERS]</span>
            </span>
            <StatInfoTooltip stat="season_rank" />
          </div>
        </div>

        {/* EXPAND / COLLAPSE BUTTON INLINE ON TOP RIGHT */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <Button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            size="sm"
            className="h-7 sm:h-7.5 px-2 sm:px-2.5 text-xs font-mono font-black uppercase tracking-wider border-amber-500/40 text-amber-300 bg-amber-950/40 hover:bg-amber-500/20 active:bg-amber-500/30 rounded-lg sm:rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95 touch-manipulation shrink-0 whitespace-nowrap"
            aria-label={
              isExpanded ? "Collapse Directives & Progression" : "Expand Directives & Progression"
            }
          >
            <span>{isExpanded ? "COLLAPSE" : "EXPAND DIRECTIVES"}</span>
            <ChevronDown
              className={`h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-300 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : "rotate-0"
              }`}
            />
          </Button>
        </div>
      </div>

      {/* COMPACT SUMMARY ROW WHEN COLLAPSED */}
      {!isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 pt-0.5">
          {/* PERSONAL RANK SNAPSHOT */}
          <div
            onClick={() => setIsExpanded(true)}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-400/60 flex items-center justify-between text-xs cursor-pointer transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="grid h-6 w-6 place-items-center rounded bg-amber-400 text-slate-950 font-black text-xs shrink-0">
                #12
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase truncate">
                  Personal Rank
                </span>
                <span className="text-xs text-amber-300 font-bold truncate">Top 15.0%</span>
              </div>
            </div>
            <span className="text-[9px] text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/40 font-bold shrink-0">
              ▲ +2
            </span>
          </div>

          {/* SEASON METER SNAPSHOT */}
          <div
            onClick={() => setIsExpanded(true)}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-400/60 flex flex-col gap-1 text-xs cursor-pointer transition-all active:scale-[0.99]"
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 text-amber-400 font-bold truncate">
                <Flame className="h-3 w-3 shrink-0" /> Season 1 Progress
              </span>
              <span className="text-amber-300 font-bold text-[9px] font-mono">
                {seasonPct.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                style={{ width: `${seasonPct}%` }}
              />
            </div>
          </div>

          {/* WARCHEST METER SNAPSHOT */}
          <div
            onClick={() => setIsExpanded(true)}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-400/60 flex flex-col gap-1 text-xs cursor-pointer transition-all active:scale-[0.99]"
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400 font-bold truncate">
                <Rocket className="h-3 w-3 shrink-0 text-emerald-400" /> Warchest Meter
              </span>
              <span className="text-emerald-300 font-bold text-[9px] font-mono">
                {warchestPct.toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                style={{ width: `${warchestPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* FULL EXPANDED CONTENT */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden space-y-3.5 pt-1"
          >
            {/* 1. PERSONAL RAIDER PROGRESSION & TIER STATUS */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-400/90 flex items-center gap-1 px-1">
                <Award className="h-3.5 w-3.5 text-amber-400" />
                <span>1. Personal Raider Progression & Season Goals</span>
              </div>
              <UserRankStatusWidget />
            </div>

            {/* 2. SERVER & COMMUNITY MOMENTUM */}
            <div className="space-y-2 pt-2 border-t border-amber-500/20">
              <div className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-400/90 flex items-center gap-1 px-1">
                <Users className="h-3.5 w-3.5 text-emerald-400" />
                <span>2. Server-Wide Community Momentum</span>
              </div>

              {/* GLOBAL GOAL GUIDANCE BANNER */}
              <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs">
                <Info className="h-4 w-4 text-amber-400 shrink-0" />
                <p className="text-[11px] text-amber-200/90 font-sans leading-tight">
                  <strong className="text-amber-300 font-mono font-bold">Global Goal:</strong> All
                  community members earn rewards when Milestones are completed.
                </p>
              </div>

              <MeterTrack
                icon={<Flame className="h-3.5 w-3.5 text-amber-400" />}
                label="Season Meter"
                accent="amber"
                state={season}
                milestones={SEASON_METER_MILESTONE_CONFIGS}
                isExpanded={true}
              />

              <MeterTrack
                icon={<Rocket className="h-3.5 w-3.5 text-emerald-400" />}
                label="Warchest Meter"
                accent="emerald"
                state={warchest}
                milestones={WARCHEST_METER_MILESTONE_CONFIGS}
                isExpanded={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <UnlockCelebration payload={celebration} onClose={() => setCelebration(null)} />
    </div>
  );
}

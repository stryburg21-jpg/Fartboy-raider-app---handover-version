import { useEffect, useMemo, useState } from "react";
import {
  Flame,
  Rocket,
  Users,
  ChevronDown,
  Gift,
  Sparkles,
  Info,
  CheckCircle2,
  Lock,
  Trophy,
} from "lucide-react";
import {
  getSeasonMeter,
  getWarchestMeter,
  subscribeToCommunityMeters,
  SEASON_METER_MILESTONE_CONFIGS,
  WARCHEST_METER_MILESTONE_CONFIGS,
  type CommunityMeterState,
} from "@/services/communityMeters";
import type { MeterMilestoneConfig } from "@/config/communityMeters";
import { UnlockCelebration, type CelebrationPayload } from "@/components/game/UnlockCelebration";
import { Button } from "@/components/ui/button";

function formatTimeUntil(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "resetting…";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}d ${hours}h`;
}

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
  const pct = state.goal > 0 ? Math.min(100, (state.currentValue / state.goal) * 100) : 0;
  const barGradient =
    accent === "amber"
      ? "from-amber-500 via-orange-400 to-yellow-300"
      : "from-emerald-500 via-teal-400 to-cyan-300";
  const glow = accent === "amber" ? "rgba(245,158,11,0.6)" : "rgba(52,211,153,0.6)";
  const nextMilestone = milestones.find((m) => !state.unlockedMilestoneIds.includes(m.id));

  return (
    <div className="space-y-2 rounded-xl bg-black/40 border border-white/5 p-3">
      {/* Track Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-mono font-black uppercase tracking-wider text-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          Resets in {formatTimeUntil(state.resetsAt)}
        </span>
      </div>

      {/* Progress Bar with Milestone Markers */}
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-black/80 border border-white/10 p-0.5 shadow-inner">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-[width] duration-700`}
          style={{ width: `${pct}%`, boxShadow: `0 0 14px ${glow}` }}
        />
        {/* Milestone pips */}
        {milestones.map((m) => (
          <div
            key={m.id}
            className={`absolute top-0 h-full w-0.5 ${
              state.unlockedMilestoneIds.includes(m.id)
                ? "bg-white/90 shadow-[0_0_6px_#fff]"
                : "bg-white/25"
            }`}
            style={{ left: `${m.thresholdPct * 100}%` }}
            title={`${m.label}: ${m.rewardDescription}`}
          />
        ))}
      </div>

      {/* Numerical Stats & Next Milestone Goal */}
      <div className="flex items-center justify-between text-[11px] font-mono flex-wrap gap-1">
        <span className="text-muted-foreground font-semibold">
          {state.currentValue.toLocaleString()} / {state.goal.toLocaleString()}{" "}
          <span className="text-slate-400">({pct.toFixed(0)}%)</span>
        </span>
        {nextMilestone ? (
          <span className="text-amber-300 font-bold flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
            Next: {nextMilestone.label} ({Math.round(nextMilestone.thresholdPct * 100)}%)
          </span>
        ) : (
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <Trophy className="h-3 w-3 text-emerald-400 shrink-0" />
            All milestones unlocked!
          </span>
        )}
      </div>

      {/* REWARD PREVIEW PILL / BANNER */}
      <div className="flex items-center gap-2 rounded-lg bg-slate-900/90 border border-amber-500/20 px-2.5 py-1.5 text-xs text-amber-200">
        <Gift className="h-3.5 w-3.5 text-amber-400 shrink-0" />
        <span className="text-[11px] font-mono leading-tight">
          <strong className="text-amber-300">
            {nextMilestone
              ? `Next Unlock (${Math.round(nextMilestone.thresholdPct * 100)}%):`
              : "Completed Tier:"}
          </strong>{" "}
          <span className="text-slate-200">
            {nextMilestone
              ? `${nextMilestone.rewardDescription} (All Raiders)`
              : "Max season reward claimed for all community members!"}
          </span>
        </span>
      </div>

      {/* EXPANDED DETAILED MILESTONE TIERS */}
      {isExpanded && (
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Info className="h-3 w-3 text-slate-400" />
            <span>Community Milestone Thresholds:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {milestones.map((m) => {
              const isUnlocked = state.unlockedMilestoneIds.includes(m.id);
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 p-2 rounded-lg border text-[11px] font-mono transition-colors ${
                    isUnlocked
                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                      : "bg-slate-950/60 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isUnlocked ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-slate-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold flex items-center justify-between">
                      <span className={isUnlocked ? "text-emerald-300" : "text-slate-300"}>
                        {m.label} ({Math.round(m.thresholdPct * 100)}%)
                      </span>
                      {isUnlocked && (
                        <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          UNLOCKED
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      {m.rewardDescription}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function CommunityMomentumMeters() {
  const [season, setSeason] = useState<CommunityMeterState>(() => getSeasonMeter());
  const [warchest, setWarchest] = useState<CommunityMeterState>(() => getWarchestMeter());
  const [celebration, setCelebration] = useState<CelebrationPayload | null>(null);
  const [celebrationQueue, setCelebrationQueue] = useState<CelebrationPayload[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

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

  // Drain the celebration queue one at a time.
  useEffect(() => {
    if (!celebration && celebrationQueue.length > 0) {
      setCelebration(celebrationQueue[0]);
      setCelebrationQueue((q) => q.slice(1));
    }
  }, [celebration, celebrationQueue]);

  const anyoneActive = useMemo(
    () => season.playerIsActiveParticipant || warchest.playerIsActiveParticipant,
    [season, warchest],
  );

  const seasonPct = season.goal > 0 ? Math.min(100, (season.currentValue / season.goal) * 100) : 0;
  const warchestPct =
    warchest.goal > 0 ? Math.min(100, (warchest.currentValue / warchest.goal) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-slate-950 via-zinc-950 to-emerald-950/20 p-3.5 sm:p-5 shadow-xl space-y-3 font-mono">
      {/* HEADER ROW WITH BADGES & EXPAND/COLLAPSE TOGGLE */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/50 shrink-0 shadow-lg shadow-amber-500/20">
            <Users className="h-4 w-4 text-amber-300" />
          </div>
          <h3 className="font-display text-sm sm:text-base font-black uppercase tracking-wider text-amber-300 truncate">
            Community Momentum
          </h3>
          {/* [SERVER-WIDE UNLOCKS] BADGE */}
          <span className="inline-flex items-center gap-1 font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/25 to-yellow-500/25 text-amber-300 border border-amber-500/50 shadow-sm shrink-0">
            <Sparkles className="h-2.5 w-2.5 text-amber-400 shrink-0" />
            [SERVER-WIDE UNLOCKS]
          </span>
        </div>

        {/* EXPAND / COLLAPSE BUTTON WITH MIN 48PX TOUCH TARGET */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            size="sm"
            className="min-h-[44px] sm:min-h-[48px] px-3 text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider border-amber-500/40 text-amber-300 bg-amber-950/40 hover:bg-amber-500/20 active:bg-amber-500/30 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 touch-manipulation shrink-0"
            aria-label={isExpanded ? "Collapse Community Momentum" : "Expand Community Momentum"}
          >
            <span>{isExpanded ? "COLLAPSE" : "EXPAND METERS"}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-amber-300 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : "rotate-0"
              }`}
            />
          </Button>
        </div>
      </div>

      {/* EXPLICIT GLOBAL GOAL GUIDANCE BANNER */}
      <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs">
        <Info className="h-4 w-4 text-amber-400 shrink-0" />
        <p className="text-[11px] text-amber-200/90 font-sans leading-tight">
          <strong className="text-amber-300 font-mono font-bold">Global Goal:</strong> All community
          members earn rewards when Milestones are completed.
        </p>
      </div>

      {/* COMPACT OVERVIEW WHEN COLLAPSED */}
      {!isExpanded && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20 text-xs flex flex-col gap-1">
            <div className="flex items-center justify-between text-muted-foreground text-[10px]">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Flame className="h-3 w-3" /> Season
              </span>
              <span>{seasonPct.toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                style={{ width: `${seasonPct}%` }}
              />
            </div>
            <span className="text-[10px] text-amber-200/80 truncate">
              {season.unlockedMilestoneIds.length}/4 Milestones Unlocked
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/20 text-xs flex flex-col gap-1">
            <div className="flex items-center justify-between text-muted-foreground text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Rocket className="h-3 w-3" /> Warchest
              </span>
              <span>{warchestPct.toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                style={{ width: `${warchestPct}%` }}
              />
            </div>
            <span className="text-[10px] text-emerald-200/80 truncate">
              {warchest.unlockedMilestoneIds.length}/4 Milestones Unlocked
            </span>
          </div>
        </div>
      )}

      {/* FULL DETAILED PROGRESS TRACKS (Rendered when expanded) */}
      {isExpanded && (
        <div className="space-y-3 pt-1">
          {!anyoneActive && (
            <div className="text-[10px] font-mono text-muted-foreground bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              ⚡ Contribute XP or a boost/donation this week to count as an active participant for
              airdropped milestone rewards.
            </div>
          )}

          <MeterTrack
            icon={<Flame className="h-3.5 w-3.5 text-amber-400" />}
            label="Season Meter"
            accent="amber"
            state={season}
            milestones={SEASON_METER_MILESTONE_CONFIGS}
            isExpanded={isExpanded}
          />
          <MeterTrack
            icon={<Rocket className="h-3.5 w-3.5 text-emerald-400" />}
            label="Warchest Meter"
            accent="emerald"
            state={warchest}
            milestones={WARCHEST_METER_MILESTONE_CONFIGS}
            isExpanded={isExpanded}
          />
        </div>
      )}

      <UnlockCelebration payload={celebration} onClose={() => setCelebration(null)} />
    </div>
  );
}

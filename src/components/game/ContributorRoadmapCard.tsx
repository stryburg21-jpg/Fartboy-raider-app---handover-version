import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  HeartHandshake,
  Sparkles,
  Award,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Trophy,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "./ProgressBar";
import {
  getPlayerContributorProgress,
  type PlayerContributorProgress,
} from "@/services/contributor";
import { useGameStore } from "@/store/gameStore";

/**
 * Cohesive Contributor Progress Card — Merges Season Goal, Contributor Tier, and Rank Progress.
 * Pulls profile & rank progression from ContributorService (TODO backend GET /api/player/contributor-progress).
 */
export function ContributorRoadmapCard() {
  const player = useGameStore((s) => s.player);
  const [data, setData] = useState<PlayerContributorProgress | null>(null);

  useEffect(() => {
    if (!player) return;
    let isMounted = true;
    // TODO(backend): GET /api/player/contributor-progress?playerId=${player.id}
    getPlayerContributorProgress(player.id, player.contributorTier, player.level).then((res) => {
      if (isMounted) setData(res);
    });
    return () => {
      isMounted = false;
    };
  }, [player]);

  if (!data) return null;

  const isContributor = data.isContributor;

  if (!isContributor) {
    // NON-CONTRIBUTOR VIEW
    return (
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-surface-1 to-card p-6 shadow-xl space-y-5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-400 text-black shadow-lg font-black text-xl">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 font-mono text-[10px] font-extrabold uppercase text-amber-300 border border-amber-400/30">
                  Contributor Pass
                </span>
                <span className="text-xs font-mono font-bold text-muted-foreground flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-400" /> Free Tier Active
                </span>
              </div>
              <h3 className="font-display font-black text-xl text-foreground tracking-tight">
                Become a Contributor
              </h3>
              <p className="text-xs text-muted-foreground max-w-xl">
                Support community infrastructure and unlock monthly pack drops, prestige titles, and
                XP boosts. Progress starts after joining!
              </p>
            </div>
          </div>

          <Link to="/season-pass" className="shrink-0">
            <Button className="bg-amber-400 text-black hover:bg-amber-300 font-mono text-xs font-black uppercase tracking-wider shadow-md">
              Learn More & Unlock <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* SEASON 1 GOAL PREVIEW FOR NON-CONTRIBUTORS */}
        <div className="rounded-2xl border border-amber-500/20 bg-surface-2/60 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-muted-foreground flex items-center gap-1.5 font-bold">
              <Trophy className="h-4 w-4 text-amber-400" /> {data.seasonGoalName}: Level{" "}
              {data.seasonLevel} / {data.maxSeasonLevel}
            </span>
            <span className="font-mono text-amber-300 font-extrabold">
              {data.seasonProgressPercent}% Progress
            </span>
          </div>

          <ProgressBar
            value={data.seasonLevel}
            max={data.maxSeasonLevel}
            className="h-2.5 rounded-full bg-surface-3"
          />

          <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
            <Gift className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>{data.seasonGoalRewardPreview}</span>
          </p>
        </div>

        {/* BENEFITS SUMMARY GRID */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-muted-foreground block">
            Key Contributor Benefits
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {data.benefitsSummary.map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-xl border border-border/50 bg-surface-2/60 px-3 py-2 text-xs font-semibold text-foreground shadow-sm"
              >
                <span className="text-base">{benefit.icon}</span>
                <span className="truncate text-[11px] font-mono">{benefit.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE CONTRIBUTOR PROGRESS VIEW (SEASON 1 GOAL + TIER & RANK PROGRESS)
  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/50 bg-gradient-to-r from-amber-500/15 via-surface-1 to-card p-6 shadow-2xl space-y-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-amber-400/20 blur-3xl" />

      {/* HEADER: CURRENT RANK & TIER SUMMARY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-400 text-black shadow-lg font-bold text-2xl">
            {data.currentRankIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 font-mono text-[10px] font-extrabold uppercase text-amber-300 border border-amber-400/40 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Contributor Tier {data.currentRankTier}
              </span>
              <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-amber-200 border border-amber-500/30">
                {data.seasonName}
              </span>
            </div>
            <h3 className="font-display font-black text-xl text-foreground tracking-tight">
              Rank: {data.currentRankName}
            </h3>
          </div>
        </div>

        <Link to="/season-pass" className="shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="border-amber-400/60 bg-surface-2/80 hover:bg-surface-3 text-amber-300 font-mono text-xs font-bold"
          >
            Manage Pass & Perks →
          </Button>
        </Link>
      </div>

      {/* DUAL PROGRESSION GRID: TIER PROGRESS & SEASON 1 GOAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. TIER & RANK PROGRESSION */}
        <div className="space-y-3 rounded-2xl border border-border/80 bg-surface-2/50 p-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground font-bold flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Progress to{" "}
                <strong className="text-amber-300">{data.nextRankName ?? "Max Rank"}</strong> (
                {data.nextRankIcon})
              </span>
              <span className="text-amber-300 font-extrabold">{data.progressPercent}%</span>
            </div>

            <ProgressBar
              value={data.progressPercent ?? 0}
              max={100}
              className="h-2.5 rounded-full bg-surface-3"
            />
          </div>

          {data.nextUnlockPreview && data.nextUnlockPreview.length > 0 && (
            <div className="pt-1">
              <div className="text-[10px] font-mono font-extrabold uppercase text-muted-foreground mb-1.5 flex items-center gap-1">
                <Award className="h-3 w-3 text-amber-400" /> Next Unlock Rewards:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.nextUnlockPreview.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-md bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300 border border-amber-400/30"
                  >
                    <CheckCircle2 className="h-3 w-3 text-amber-400" /> {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. SEASON 1 GOAL PROGRESSION */}
        <div className="space-y-3 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-surface-2/50 to-surface-1 p-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-300 font-bold flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-400" /> {data.seasonGoalName}
              </span>
              <span className="text-amber-300 font-extrabold">
                Level {data.seasonLevel} / {data.maxSeasonLevel} ({data.seasonProgressPercent}%)
              </span>
            </div>

            <ProgressBar
              value={data.seasonLevel}
              max={data.maxSeasonLevel}
              className="h-2.5 rounded-full bg-surface-3"
            />
          </div>

          <div className="pt-1">
            <div className="text-[10px] font-mono font-extrabold uppercase text-muted-foreground mb-1 flex items-center gap-1">
              <Gift className="h-3 w-3 text-emerald-400" /> Season Milestone Benefit:
            </div>
            <p className="text-xs text-emerald-300 font-mono font-semibold">
              {data.seasonGoalRewardPreview}
            </p>
          </div>
        </div>
      </div>

      {/* CONTRIBUTOR BENEFITS SUMMARY ROW */}
      <div className="pt-2 border-t border-border/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-muted-foreground">
            Active Contributor Perks Included:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {data.benefitsSummary.map((b, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-surface-2/60 px-2.5 py-1 text-[11px] font-mono text-foreground"
              >
                <span>{b.icon}</span>
                <span>{b.title}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

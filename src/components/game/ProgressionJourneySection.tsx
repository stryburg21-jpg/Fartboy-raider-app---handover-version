import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Compass, CheckCircle2, ArrowRight, Flame, Sparkles, Target, Trophy } from "lucide-react";
import type { Player } from "@/types/game";
import { getMissions } from "@/services/missions";
import { getCurrentSeasonInfo, getSeasonPass } from "@/services/season";
import { ProgressBar } from "./ProgressBar";
import { Button } from "@/components/ui/button";

interface ProgressionJourneySectionProps {
  player: Player;
}

export function ProgressionJourneySection({ player }: ProgressionJourneySectionProps) {
  const missionsQuery = useQuery({
    queryKey: ["current-missions"],
    queryFn: getMissions,
  });

  const seasonInfoQuery = useQuery({
    queryKey: ["current-season-info"],
    queryFn: getCurrentSeasonInfo,
  });

  const seasonPassQuery = useQuery({
    queryKey: ["season-pass-tiers"],
    queryFn: getSeasonPass,
  });

  const missions = missionsQuery.data ?? [];
  const seasonInfo = seasonInfoQuery.data;
  const seasonTiers = seasonPassQuery.data ?? [];

  // Focus on top active priority mission
  const activePriorityMission = missions.find((m) => !m.completed) ?? missions[0];

  const unlockedSeasonTiersCount = seasonTiers.filter((t) => t.unlocked).length;
  const totalSeasonTiersCount = seasonTiers.length || 20;

  // Next Milestone calculation
  const currentXPInLevel = (player.lifetimeXP ?? player.xp) % player.xpToNext;
  const xpRemainingForLevel = player.xpToNext - currentXPInLevel;
  const nextSeasonTierToUnlock =
    seasonTiers.find((t) => !t.unlocked)?.tier ?? unlockedSeasonTiersCount + 1;

  return (
    <div
      id="progression-journey"
      className="overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-surface-1 via-card to-card p-6 sm:p-8 space-y-6 shadow-2xl"
    >
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 shrink-0 shadow-lg shadow-purple-500/10">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-xl text-foreground tracking-tight">
                Next Raider Objectives & Roadmap
              </h2>
              <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                <Sparkles className="h-3 w-3" />
                {seasonInfo?.name ?? "Season 1 Active"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your next progression targets, active priority objective, and season pass milestones.
            </p>
          </div>
        </div>

        <Link to="/raids" className="shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 font-mono text-xs font-bold uppercase tracking-wider border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
          >
            Launch Raids Page
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* 3 STREAMLINED NEXT-OBJECTIVE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. NEXT LEVEL TARGET */}
        <div className="rounded-2xl border border-border bg-surface-2/40 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="h-4 w-4" /> Next Level Target
              </span>
              <span className="font-mono text-[10px] text-amber-300 font-bold bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                Lv {player.level + 1} Goal
              </span>
            </div>
            <div className="space-y-1">
              <div className="font-display font-black text-xl text-foreground">
                Level {player.level + 1} Raider
              </div>
              <p className="text-xs text-muted-foreground">
                Earn{" "}
                <strong className="text-amber-300">
                  {xpRemainingForLevel.toLocaleString()} XP
                </strong>{" "}
                to gain next level status and rewards.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/40 text-xs">
            <div className="flex justify-between font-mono">
              <span className="text-muted-foreground">Level Progress</span>
              <span className="font-bold text-amber-300">
                {currentXPInLevel.toLocaleString()} / {player.xpToNext.toLocaleString()} XP
              </span>
            </div>
            <ProgressBar
              value={currentXPInLevel}
              max={player.xpToNext}
              className="h-2 rounded-full bg-surface-3"
            />
          </div>
        </div>

        {/* 2. FEATURED PRIORITY MISSION */}
        <div className="rounded-2xl border border-border bg-surface-2/40 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Target className="h-4 w-4" /> Priority Objective
              </span>
              {activePriorityMission?.completed ? (
                <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                  Completed
                </span>
              ) : (
                <span className="font-mono text-[10px] text-muted-foreground bg-surface-3 px-2 py-0.5 rounded">
                  Daily Objective
                </span>
              )}
            </div>

            {activePriorityMission ? (
              <div className="space-y-1">
                <div className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                  <span>{activePriorityMission.artwork}</span>
                  <span className="truncate">{activePriorityMission.title}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {activePriorityMission.description}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No active missions found.</p>
            )}
          </div>

          {activePriorityMission && (
            <div className="space-y-2 pt-2 border-t border-border/40 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-bold text-foreground">
                  {activePriorityMission.progress} / {activePriorityMission.requirement}
                </span>
              </div>
              <ProgressBar
                value={activePriorityMission.progress}
                max={activePriorityMission.requirement}
                className="h-2 rounded-full bg-surface-3"
              />
            </div>
          )}
        </div>

        {/* 3. SEASON PASS MILESTONE */}
        <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-amber-500/10 p-5 space-y-4 flex flex-col justify-between shadow-inner">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-purple-400" /> Season Pass Goal
              </span>
              <span className="font-mono text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                Tier {unlockedSeasonTiersCount} / {totalSeasonTiersCount}
              </span>
            </div>
            <div className="space-y-1">
              <div className="font-display font-bold text-sm text-foreground">
                Next: Unlock Tier {nextSeasonTierToUnlock} Rewards
              </div>
              <p className="text-xs text-muted-foreground">
                Complete daily raids to unlock exclusive seasonal avatar items and pack keys.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-purple-500/20">
            <Link to="/season-pass" className="w-full">
              <Button
                size="sm"
                className="w-full font-mono text-xs font-bold uppercase tracking-wider bg-purple-500 text-white hover:bg-purple-400 gap-1.5 shadow-md shadow-purple-500/20"
              >
                Open Season Pass Vault
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

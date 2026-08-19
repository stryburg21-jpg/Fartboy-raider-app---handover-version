import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/game/AppShell";
import { PageHeader } from "@/components/game/PageHeader";
import { PrestigeLeaderboardHub } from "@/components/game/PrestigeLeaderboardHub";
import { ArmoryHeaderTabs, ArmorySwipeContainer } from "@/components/game/ArmoryHeaderTabs";
import { Clock } from "lucide-react";
import { CURRENT_SEASON } from "@/config/seasons";

export const Route = createFileRoute("/leaderboard")({ component: LeaderboardPage });

export function LeaderboardPage() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <ArmoryHeaderTabs />
        <ArmorySwipeContainer>
          {/* PAGE HEADER */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4 sm:pb-5">
            <PageHeader
              title="Season 1 Leaderboards & Social Prestige"
              subtitle="Competitive seasonal rankings, weekly sprint sprints, and raid squad standings."
            />
            <div className="flex items-center gap-2.5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-surface-1 to-card px-3 py-2 sm:px-4 sm:py-2.5 shrink-0 shadow-lg justify-between sm:justify-start w-full sm:w-auto">
              <Clock className="h-4 sm:h-5 w-4 sm:w-5 text-amber-400 animate-pulse shrink-0" />
              <div className="flex flex-col text-right sm:text-left">
                <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold">
                  {CURRENT_SEASON.name} Active
                </span>
                <span className="font-mono text-xs sm:text-sm font-extrabold text-amber-400">
                  {CURRENT_SEASON.durationDays} Days Duration
                </span>
              </div>
            </div>
          </div>

          {/* PRESTIGE LEADERBOARD HUB */}
          <PrestigeLeaderboardHub />
        </ArmorySwipeContainer>
      </div>
    </AppShell>
  );
}

import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/game/AppShell";
import { PageHeader } from "@/components/game/PageHeader";
import { PlayerSummaryCard } from "@/components/game/PlayerSummaryCard";
import { SupporterRankCard } from "@/components/game/SupporterRankCard";
import { StatCard } from "@/components/game/StatCard";
import { TitleBadge } from "@/components/game/TitleBadge";
import { AchievementBadge } from "@/components/game/AchievementBadge";
import { ShareProfileModal } from "@/components/game/ShareProfileModal";
import { DailyXpCapCard } from "@/components/game/DailyXpCapCard";
import { XPTransactionHistoryList } from "@/components/game/XPTransactionHistoryList";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";
import {
  Swords,
  Image,
  Video,
  Package,
  Gem,
  Flame,
  Share2,
  Award,
  Zap,
  Crown,
  Trophy,
  Shield,
  Star,
} from "lucide-react";
import type { Title } from "@/types/game";
import {
  getLeaderboardRankings,
  type SeasonalLeaderboardEntry,
  type WeeklySprintEntry,
} from "@/services/leaderboards";
import { PRESTIGE_DIVISIONS } from "@/config/prestigeConfig";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const player = useGameStore((s) => s.player);
  const achievements = useGameStore((s) => s.achievements);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  if (!player) {
    return (
      <AppShell>
        <div className="text-muted-foreground">Loading profile…</div>
      </AppShell>
    );
  }

  const equippedTitle = player?.titles?.find((t) => t?.equipped);
  const unlockedTitles = (player?.titles ?? []).filter(
    (t) => t?.unlocked !== false && !t?.equipped,
  );
  const lockedTitles = (player?.titles ?? []).filter((t) => t?.unlocked === false);
  const stats = player.lifetimeStats;

  const lifetimeXP = player.lifetimeXP ?? player.xp ?? 0;
  const spendableXP = player.spendableXP ?? player.xp ?? 0;

  return (
    <AppShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Profile" subtitle="Your raider identity, XP metrics & history." />
        <Button
          onClick={() => setShareModalOpen(true)}
          className="font-mono text-xs uppercase tracking-wider shrink-0"
        >
          <Share2 className="mr-2 h-4 w-4" /> Share Profile
        </Button>
      </div>

      <ShareProfileModal open={shareModalOpen} onOpenChange={setShareModalOpen} />

      {/* DUAL XP BALANCES HEADER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-surface-1 to-card p-4 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase font-black tracking-wider text-emerald-400 flex items-center gap-1">
              <Award className="h-3.5 w-3.5" /> Total Lifetime XP (LT-XP)
            </span>
            <div className="font-display text-2xl font-black text-foreground mt-0.5">
              {lifetimeXP.toLocaleString()} LT-XP
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">
              Unspendable • Used for Leaderboard Rank & Prestige
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-surface-1 to-card p-4 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase font-black tracking-wider text-amber-400 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5" /> Spendable XP (SP-XP)
            </span>
            <div className="font-display text-2xl font-black text-amber-300 mt-0.5">
              {spendableXP.toLocaleString()} SP-XP
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">
              Spendable • Used for Pack Purchases & Forge Crafts
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PlayerSummaryCard player={player} />
        </div>
        <SupporterRankCard rank={player.supporterRank} />
      </div>

      {/* SEASON 1 PRESTIGE & LEADERBOARD STANDINGS */}
      {(() => {
        const seasonalRankings = getLeaderboardRankings("seasonal") as SeasonalLeaderboardEntry[];
        const weeklyRankings = getLeaderboardRankings("weekly") as WeeklySprintEntry[];
        const mySeasonal = seasonalRankings.find((e) => e.playerId === player.id) || {
          currentRank: seasonalRankings.length || 1,
          peakRank: seasonalRankings.length || 1,
          currentDivision: "Gas Cadet",
          seasonalLifetimeXP: lifetimeXP,
        };
        const myWeekly = weeklyRankings.find((e) => e.playerId === player.id) || {
          weeklyRank: weeklyRankings.length || 1,
          weeklyXP: 0,
        };
        const divConfig =
          PRESTIGE_DIVISIONS.find((d) => d.name === mySeasonal.currentDivision) ||
          PRESTIGE_DIVISIONS[4];

        return (
          <section className="mt-8 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-surface-1 to-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-400" />
                <h2 className="font-display text-lg font-bold text-foreground">
                  Season 1 Social Prestige & Rankings
                </h2>
              </div>
              <Link
                to="/leaderboard"
                className="font-mono text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                View Full Leaderboards →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border/80 bg-surface-1 p-3 text-center space-y-1">
                <span className="text-2xl">{divConfig.badgeIcon}</span>
                <div className="font-mono text-[10px] text-muted-foreground uppercase font-bold">
                  Prestige Division
                </div>
                <div className="font-display font-extrabold text-sm text-amber-300">
                  {mySeasonal.currentDivision}
                </div>
              </div>

              <div className="rounded-xl border border-border/80 bg-surface-1 p-3 text-center space-y-1">
                <Trophy className="h-5 w-5 text-amber-400 mx-auto" />
                <div className="font-mono text-[10px] text-muted-foreground uppercase font-bold">
                  Seasonal Rank
                </div>
                <div className="font-display font-extrabold text-sm text-foreground">
                  #{mySeasonal.currentRank}
                </div>
              </div>

              <div className="rounded-xl border border-border/80 bg-surface-1 p-3 text-center space-y-1">
                <Zap className="h-5 w-5 text-purple-400 mx-auto" />
                <div className="font-mono text-[10px] text-muted-foreground uppercase font-bold">
                  Weekly Rank
                </div>
                <div className="font-display font-extrabold text-sm text-purple-300">
                  #{myWeekly.weeklyRank}
                </div>
              </div>

              <div className="rounded-xl border border-border/80 bg-surface-1 p-3 text-center space-y-1">
                <Star className="h-5 w-5 text-emerald-400 mx-auto" />
                <div className="font-mono text-[10px] text-muted-foreground uppercase font-bold">
                  Peak Rank
                </div>
                <div className="font-display font-extrabold text-sm text-emerald-300">
                  #{mySeasonal.peakRank}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* DAILY XP CAP & EFFICIENCY DECAY SECTION */}
      <section className="mt-8">
        <DailyXpCapCard />
      </section>

      {/* RECENT XP ACTIVITY TRANSACTION LOG */}
      <section className="mt-8 rounded-2xl border border-border bg-card p-5">
        <XPTransactionHistoryList limit={8} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold">Lifetime Statistics</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Raids" value={stats.raids} icon={<Swords className="h-4 w-4" />} />
          <StatCard label="Memes" value={stats.memes} icon={<Image className="h-4 w-4" />} />
          <StatCard label="Videos" value={stats.videos} icon={<Video className="h-4 w-4" />} />
          <StatCard
            label="Packs Opened"
            value={stats.packsOpened}
            icon={<Package className="h-4 w-4" />}
          />
          <StatCard
            label="Legendaries"
            value={stats.legendaryItemsFound ?? 0}
            icon={<Gem className="h-4 w-4" />}
          />
          <StatCard
            label="Login Streak"
            value={`${player.loginStreak}d`}
            icon={<Flame className="h-4 w-4" />}
          />
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-4 font-display text-lg font-bold">Titles</h2>
        <TitleGroup
          label="Equipped"
          titles={equippedTitle ? [equippedTitle] : []}
          emptyText="No title equipped."
        />
        <div className="mt-4">
          <TitleGroup
            label="Unlocked"
            titles={unlockedTitles}
            emptyText="No unlocked titles yet."
          />
        </div>
        <div className="mt-4">
          <TitleGroup label="Locked" titles={lockedTitles} emptyText="You've unlocked them all!" />
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold">Achievements</h2>
          <Link to="/achievements" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.slice(0, 6).map((a) => (
            <AchievementBadge key={a.id} achievement={a} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function TitleGroup({
  label,
  titles,
  emptyText,
}: {
  label: string;
  titles: Title[];
  emptyText: string;
}) {
  return (
    <div>
      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      {titles.length ? (
        <div className="flex flex-wrap gap-2">
          {titles.map((t) => (
            <TitleBadge key={t.id} title={t} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{emptyText}</p>
      )}
    </div>
  );
}

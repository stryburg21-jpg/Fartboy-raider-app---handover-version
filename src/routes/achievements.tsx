import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Trophy,
  Award,
  Lock,
  CheckCircle2,
  Sparkles,
  Zap,
  Search,
  ArrowLeft,
  Filter,
  X,
} from "lucide-react";
import { AppShell } from "@/components/game/AppShell";
import { PageHeader } from "@/components/game/PageHeader";
import { AchievementCatalogueCard } from "@/components/game/AchievementCatalogueCard";
import { ProgressBar } from "@/components/game/ProgressBar";
import { Button } from "@/components/ui/button";
import { getAllAchievements } from "@/services/achievements";
import { useGameStore } from "@/store/gameStore";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievement Collection — Fartboy Raid 2.0" },
      {
        name: "description",
        content:
          "Explore all Fartboy Raid 2.0 achievements, Discord roles, and completion progress.",
      },
    ],
  }),
  component: AchievementsPage,
});

type StatusFilter = "all" | "unlocked" | "locked";

export function AchievementsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const player = useGameStore((s) => s.player);

  const achievementsQuery = useQuery({
    queryKey: ["all-achievements"],
    queryFn: getAllAchievements,
  });

  const rawAchievements = achievementsQuery.data;
  const achievements = useMemo(() => rawAchievements ?? [], [rawAchievements]);

  // Summary statistics
  const totalCount = achievements.length;
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const lockedCount = totalCount - unlockedCount;
  const completionPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const totalXpEarned = achievements
    .filter((a) => a.unlocked)
    .reduce((acc, a) => acc + (a.reward?.xp ?? 0), 0);

  const discordRolesEarnedCount = achievements.filter(
    (a) => a.unlocked && Boolean(a.discordTag),
  ).length;

  // Categories extraction and counts
  const { categories, categoryCounts } = useMemo(() => {
    const set = new Set<string>();
    const counts: Record<string, number> = {};
    achievements.forEach((a) => {
      if (a.category) {
        set.add(a.category);
        counts[a.category] = (counts[a.category] || 0) + 1;
      }
    });
    return { categories: Array.from(set), categoryCounts: counts };
  }, [achievements]);

  // Filtered achievements
  const filteredAchievements = useMemo(() => {
    return achievements.filter((a) => {
      // Status filter
      if (statusFilter === "unlocked" && !a.unlocked) return false;
      if (statusFilter === "locked" && a.unlocked) return false;

      // Category filter
      if (categoryFilter !== "all" && a.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = a.name.toLowerCase().includes(query);
        const matchesDesc = a.description.toLowerCase().includes(query);
        const matchesCategory = a.category?.toLowerCase().includes(query);
        const matchesDiscord = a.discordTag?.toLowerCase().includes(query);

        if (!matchesName && !matchesDesc && !matchesCategory && !matchesDiscord) {
          return false;
        }
      }

      return true;
    });
  }, [achievements, statusFilter, categoryFilter, searchQuery]);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* TOP BACK TO CHARACTER HQ LINK */}
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 font-mono text-xs uppercase font-bold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Character HQ
            </Button>
          </Link>
          <div className="font-mono text-xs text-muted-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span>Raider ID: {player?.username ?? "Raider"}</span>
          </div>
        </div>

        {/* PAGE HEADER */}
        <PageHeader
          title="Achievement Collection Catalogue"
          subtitle="View earned bragging rights, track locked requirements, and unlock Discord tags."
        />

        {/* ==================================================================== */}
        {/* OVERALL TROPHY ROOM STATS SUMMARY                                     */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. COMPLETION PROGRESS */}
          <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-amber-950/20 via-card to-card p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Trophy className="h-4 w-4" />
                </div>
                <span className="font-display font-extrabold text-sm text-foreground">
                  Collection Progress
                </span>
              </div>
              <span className="font-mono text-xs font-extrabold text-amber-300">
                {completionPercent}%
              </span>
            </div>
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-display font-black text-2xl text-foreground">
                  {unlockedCount}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    / {totalCount} Unlocked
                  </span>
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {lockedCount} Remaining
                </span>
              </div>
              <ProgressBar value={completionPercent} className="h-2.5 rounded-full bg-surface-3" />
            </div>
          </div>

          {/* 2. TOTAL POWER / SP-XP REWARDS EARNED */}
          <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-emerald-950/20 via-card to-card p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <Zap className="h-4 w-4" />
                </div>
                <span className="font-display font-extrabold text-sm text-foreground">
                  Total POWER Earned
                </span>
              </div>
              <span className="font-mono text-xs font-extrabold text-emerald-300">
                POWER & SP-XP
              </span>
            </div>
            <div>
              <div className="font-display font-black text-2xl text-emerald-400">
                +{totalXpEarned.toLocaleString()}{" "}
                <span className="text-xs font-mono font-bold text-emerald-400/80">POWER</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Granted directly as POWER / SP-XP to unlock rare gear and specialist packs.
              </p>
            </div>
          </div>

          {/* 3. DISCORD ROLES UNLOCKED */}
          <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-indigo-950/20 via-card to-card p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  <Award className="h-4 w-4" />
                </div>
                <span className="font-display font-extrabold text-sm text-foreground">
                  Discord Roles Earned
                </span>
              </div>
              <span className="font-mono text-xs font-extrabold text-indigo-300">Discord Tags</span>
            </div>
            <div>
              <div className="font-display font-black text-2xl text-indigo-300">
                {discordRolesEarnedCount}{" "}
                <span className="text-xs font-mono text-muted-foreground">Roles Unlocked</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Synced automatically to your Discord profile identity.
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* FILTER BAR & SEARCH                                                  */}
        {/* ==================================================================== */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3.5 shadow-xl">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* STATUS FILTER TABS */}
            <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border/80 w-full md:w-auto shrink-0">
              <button
                onClick={() => setStatusFilter("all")}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 font-mono text-xs font-extrabold transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-amber-400 text-black shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-3"
                }`}
              >
                <Trophy className="h-3.5 w-3.5 shrink-0" />
                <span>All ({totalCount})</span>
              </button>

              <button
                onClick={() => setStatusFilter("unlocked")}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 font-mono text-xs font-extrabold transition-all cursor-pointer ${
                  statusFilter === "unlocked"
                    ? "bg-emerald-400 text-black shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-3"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>Completed ({unlockedCount})</span>
              </button>

              <button
                onClick={() => setStatusFilter("locked")}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 font-mono text-xs font-extrabold transition-all cursor-pointer ${
                  statusFilter === "locked"
                    ? "bg-purple-500 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-3"
                }`}
              >
                <Lock className="h-3.5 w-3.5 shrink-0" />
                <span>Missing ({lockedCount})</span>
              </button>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search achievements or Discord roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-1 pl-9 pr-8 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* STREAMLINED HORIZONTAL SWIPEABLE CATEGORY FILTER ROW */}
          <div className="pt-2.5 border-t border-border/50 flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-muted-foreground flex items-center gap-1 shrink-0">
              <Filter className="h-3 w-3 text-amber-400" /> Category:
            </span>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 whitespace-nowrap scroll-smooth flex-1 touch-pan-x">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  categoryFilter === "all"
                    ? "bg-amber-400 text-black shadow-md font-extrabold"
                    : "bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground border border-border/50"
                }`}
              >
                All ({totalCount})
              </button>

              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    categoryFilter === cat
                      ? "bg-amber-400 text-black shadow-md font-extrabold"
                      : "bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground border border-border/50"
                  }`}
                >
                  {cat.replace(/_/g, " ")} ({categoryCounts[cat] ?? 0})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* ACHIEVEMENT CARDS GRID                                               */}
        {/* ==================================================================== */}
        {achievementsQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl bg-surface-2 border border-border"
              />
            ))}
          </div>
        ) : filteredAchievements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3 shadow-md">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-surface-3 text-muted-foreground">
              <Trophy className="h-6 w-6" />
            </div>
            <h3 className="font-display font-extrabold text-base text-foreground">
              No Achievements Found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No achievements matched your selected filters or search terms. Try clearing your
              search or switching categories.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatusFilter("all");
                setCategoryFilter("all");
                setSearchQuery("");
              }}
              className="font-mono text-xs uppercase"
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementCatalogueCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

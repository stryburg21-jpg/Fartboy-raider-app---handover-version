import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  Trophy,
  Crown,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  Search,
  Sparkles,
  Flame,
  Zap,
  Shield,
  Star,
} from "lucide-react";
import type { LeaderboardEntry } from "@/types/game";
import { RaiderProfileModal } from "./RaiderProfileModal";
import { RaiderAvatar } from "./RaiderAvatar";
import { Button } from "@/components/ui/button";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentPlayerId?: string;
  mode?: "season" | "lifetime";
  pageSize?: number;
}

export function LeaderboardTable({
  entries,
  currentPlayerId = "p_04",
  mode = "season",
  pageSize = 15,
}: LeaderboardTableProps) {
  const [inspectingPlayer, setInspectingPlayer] = useState<LeaderboardEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(
      (e) =>
        e.username.toLowerCase().includes(q) ||
        (e.specialistIdentity && e.specialistIdentity.toLowerCase().includes(q)) ||
        (e.contributorTitle && e.contributorTitle.toLowerCase().includes(q)),
    );
  }, [entries, searchQuery]);

  const totalPages = Math.ceil(filteredEntries.length / pageSize) || 1;
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEntries.slice(start, start + pageSize);
  }, [filteredEntries, currentPage, pageSize]);

  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-amber-400 text-black border-amber-300 font-extrabold shadow-md shadow-amber-400/20";
      case 2:
        return "bg-slate-300 text-black border-slate-200 font-extrabold shadow-md shadow-slate-300/20";
      case 3:
        return "bg-amber-700 text-amber-100 border-amber-600 font-extrabold shadow-md shadow-amber-700/20";
      default:
        return "bg-surface-3 text-muted-foreground border-border/80 font-bold";
    }
  };

  const getRankRowBorder = (rank: number, isMe: boolean) => {
    if (isMe) {
      return "border-amber-400/90 bg-gradient-to-r from-amber-500/15 via-surface-1 to-card shadow-lg ring-2 ring-amber-400/30";
    }
    switch (rank) {
      case 1:
        return "border-amber-400/60 bg-gradient-to-r from-amber-950/30 via-surface-1 to-card hover:border-amber-400 hover:bg-surface-2";
      case 2:
        return "border-slate-400/40 bg-gradient-to-r from-slate-900/30 via-surface-1 to-card hover:border-slate-300 hover:bg-surface-2";
      case 3:
        return "border-amber-700/40 bg-gradient-to-r from-amber-950/20 via-surface-1 to-card hover:border-amber-600 hover:bg-surface-2";
      default:
        return "border-border/60 bg-card/80 hover:border-amber-400/40 hover:bg-surface-1";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          {mode === "season" ? (
            <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
          ) : (
            <Crown className="h-4 w-4 text-purple-400 shrink-0" />
          )}
          <span className="truncate">
            {mode === "season" ? "Season 3 Registered Standings" : "Lifetime Registered Standings"}{" "}
            ({filteredEntries.length} Raiders)
          </span>
        </h3>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Raider or Title..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl bg-surface-2 border border-border/80 pl-9 pr-3 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400/60"
          />
        </div>
      </div>

      {/* Traditional Clean Leaderboard Rows */}
      <div className="space-y-2">
        {paginatedEntries.length === 0 ? (
          <div className="text-center py-8 font-mono text-xs text-muted-foreground">
            No raiders found matching "{searchQuery}"
          </div>
        ) : (
          paginatedEntries.map((entry) => {
            const isMe = entry.playerId === currentPlayerId;
            const xpValue = mode === "season" ? (entry.seasonXP ?? entry.xp) : entry.lifetimeXP;

            return (
              <motion.div
                key={entry.playerId}
                whileHover={{ scale: 1.002, x: 2 }}
                onClick={() => setInspectingPlayer(entry)}
                className={`group cursor-pointer flex items-center justify-between gap-2 sm:gap-3.5 rounded-xl sm:rounded-2xl border p-2.5 sm:p-3.5 transition-all duration-200 min-w-0 ${getRankRowBorder(
                  entry.rank,
                  isMe,
                )}`}
              >
                {/* Left Column: Rank + Avatar + Details */}
                <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
                  {/* Rank Badge */}
                  <div
                    className={`grid h-8 w-8 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-lg sm:rounded-xl font-mono text-[10px] sm:text-xs border ${getRankBadgeStyle(
                      entry.rank,
                    )}`}
                  >
                    {entry.rank === 1
                      ? "🥇 #1"
                      : entry.rank === 2
                        ? "🥈 #2"
                        : entry.rank === 3
                          ? "🥉 #3"
                          : `#${entry.rank}`}
                  </div>

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <RaiderAvatar
                      avatar={entry.avatar}
                      username={entry.username}
                      sizeClassName="h-9 w-9 text-xl sm:h-11 sm:w-11 sm:text-2xl"
                    />
                    <span className="absolute -bottom-1 -right-1 rounded bg-amber-400 px-1 py-0.2 font-mono text-[7px] sm:text-[8px] font-extrabold text-black shadow">
                      LV {entry.level ?? 1}
                    </span>
                  </div>

                  {/* Raider Identity Details */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                      <span className="font-display text-xs sm:text-sm font-extrabold text-foreground truncate max-w-[90px] min-[380px]:max-w-[125px] min-[420px]:max-w-[165px] sm:max-w-none">
                        {entry.username}
                      </span>

                      {isMe && (
                        <span className="rounded bg-amber-400 text-black px-1 sm:px-1.5 py-0.2 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-0.5 shadow shrink-0">
                          <UserCheck className="h-2 sm:h-2.5 w-2 sm:w-2.5" /> YOU
                        </span>
                      )}

                      {entry.rank === 1 && (
                        <span className="rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1 sm:px-1.5 py-0.2 font-mono text-[8px] sm:text-[9px] font-extrabold shrink-0">
                          🏆 Champion
                        </span>
                      )}

                      {entry.rank >= 2 && entry.rank <= 5 && (
                        <span className="rounded bg-slate-300/20 text-slate-200 border border-slate-300/30 px-1 sm:px-1.5 py-0.2 font-mono text-[8px] sm:text-[9px] font-extrabold shrink-0">
                          🥇 Top Elite
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 font-mono text-[9px] sm:text-[10px] min-w-0">
                      <span className="truncate font-semibold text-muted-foreground max-w-[80px] min-[380px]:max-w-[110px] min-[420px]:max-w-[140px] sm:max-w-none">
                        {entry.specialistIdentity ?? "Specialist Raider"}
                      </span>
                      {entry.contributorTitle && (
                        <span className="truncate text-amber-400 font-bold max-w-[80px] min-[380px]:max-w-[110px] min-[420px]:max-w-[140px] sm:max-w-none">
                          • "{entry.contributorTitle}"
                        </span>
                      )}
                      {entry.titleXPBoostPct && (
                        <span className="hidden md:inline-block font-mono text-[9px] text-emerald-400 font-extrabold bg-emerald-500/10 px-1.5 rounded border border-emerald-500/20 shrink-0">
                          +{entry.titleXPBoostPct}% Boost
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: XP + Arrow */}
                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 text-right">
                  <div>
                    <div className="font-mono text-xs sm:text-sm font-extrabold text-amber-400 whitespace-nowrap">
                      ⚡ {xpValue.toLocaleString()} XP
                    </div>
                    <div className="font-mono text-[9px] sm:text-[10px] text-muted-foreground whitespace-nowrap">
                      {entry.raidCount.toLocaleString()} Raids
                    </div>
                  </div>

                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-amber-400 transition-colors shrink-0" />
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center justify-between pt-4 border-t border-border/60 font-mono text-xs">
          <span className="text-muted-foreground text-center sm:text-left text-[11px] sm:text-xs">
            Showing Page <strong className="text-foreground">{currentPage}</strong> of{" "}
            <strong className="text-foreground">{totalPages}</strong> ({filteredEntries.length}{" "}
            Raiders)
          </span>

          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 px-3 font-mono text-xs"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-3 font-mono text-xs"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Profile Inspector Modal */}
      <RaiderProfileModal player={inspectingPlayer} onClose={() => setInspectingPlayer(null)} />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useGameStore } from "@/store/gameStore";
import {
  Trophy,
  TrendingUp,
  Award,
  Gift,
  Zap,
  ArrowRight,
  Shield,
  Target,
  Sparkles,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatInfoTooltip } from "./StatInfoTooltip";
import { getMissions, getTimeUntilUtcMidnight } from "@/services/missions";
import type { Mission } from "@/types/game";
import { RankPromotedVictoryModal, type RankPromotionDetails } from "./RankPromotedVictoryModal";

interface UserRankStatusWidgetProps {
  className?: string;
  showNextTierGoal?: boolean;
}

export function UserRankStatusWidget({
  className = "",
  showNextTierGoal = true,
}: UserRankStatusWidgetProps) {
  const player = useGameStore((s) => s.player);
  const streakStatus = useGameStore((s) => s.streakStatus);
  const [dailyMissions, setDailyMissions] = useState<Mission[]>([]);
  const [resetTimer, setResetTimer] = useState<string>(() => getTimeUntilUtcMidnight());
  const [promotionModal, setPromotionModal] = useState<RankPromotionDetails | null>(null);

  const streakCount = streakStatus?.count || 3;
  const streakBonus = streakStatus?.bonusXPPercent || Math.min(25, 5 + streakCount * 5);

  useEffect(() => {
    let isMounted = true;
    getMissions().then((missions) => {
      if (isMounted) {
        setDailyMissions(missions.filter((m) => m.type === "daily"));
      }
    });

    const interval = setInterval(() => {
      setResetTimer(getTimeUntilUtcMidnight());
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // User's current rank & status metrics
  const currentRank = 12;
  const percentile = "Top 15.0%";
  const rankDelta = 2;
  const specialTitle = "Vanguard Specialist";
  const qualifiedPrize = "Novice Pack + 2,500 SP-XP + Contributor Pin";

  // Next Rank Goal
  const nextTierRank = "#10";
  const nextTierBracket = "Top 5.0%";
  const nextTierTitle = "Raid Commander";
  const xpNeededToNextTier = 13000;

  const triggerPromotionTest = () => {
    setPromotionModal({
      open: true,
      oldRank: currentRank,
      newRank: 10,
      title: "Raid Commander",
      level: player?.level || 15,
      totalXP: player?.lifetimeXP || 128500,
      unlockedPerks: [
        "+500 Max Inventory Capacity",
        "+5% Base SP-XP Multiplier",
        "Unlocks Forge Tier II Blueprints",
        "Raid Commander Special Title & Badge",
      ],
    });
  };

  return (
    <>
      <div
        id="user-rank-status-widget"
        className={`relative overflow-hidden rounded-xl border border-amber-400/80 bg-gradient-to-r from-amber-950/80 via-slate-900/90 to-slate-950 p-2.5 sm:p-3 shadow-md space-y-2 font-mono animate-fire-aura ${className}`}
      >
        {/* TOP HEADER ROW */}
        <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* BURNING FLAME RANK BADGE */}
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black text-xs shadow-xs border border-amber-200">
              #{currentRank}
            </div>
            <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
              <span className="font-display font-black text-xs sm:text-sm text-white tracking-tight whitespace-nowrap">
                Rank <span className="text-amber-300">#{currentRank}</span> ({percentile})
              </span>
              <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 text-[9px] font-bold shrink-0">
                <TrendingUp className="h-2.5 w-2.5" /> ▲+{rankDelta}
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-red-500/20 text-red-300 border border-red-500/40 px-1.5 py-0.2 text-[9px] font-bold shrink-0 animate-pulse">
                <Flame className="h-2.5 w-2.5 fill-red-400 text-red-400" /> {streakCount}d Streak: +
                {streakBonus}% XP
              </span>
              <span className="inline-flex rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 text-[9px] font-bold shrink-0 truncate max-w-[140px]">
                "{specialTitle}"
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={triggerPromotionTest}
              className="h-6 sm:h-7 px-2 text-[9px] sm:text-[9.5px] font-mono font-bold bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 rounded-lg cursor-pointer flex items-center gap-1 shadow-xs"
              title="Preview Level-Up & Rank Promotion modal"
            >
              <Trophy className="h-2.5 w-2.5 text-amber-400" />
              <span>Preview Rank Flex</span>
            </button>

            <Link to="/leaderboard" className="shrink-0">
              <Button
                size="sm"
                className="h-6 sm:h-7 px-2 text-[9.5px] sm:text-[10px] font-mono font-black uppercase bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <span>Rankings</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>

        {/* COMPACT SUMMARY METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[9.5px] sm:text-[10px]">
          {/* QUALIFIED REWARD */}
          <div className="flex items-center justify-between gap-1 bg-slate-950/80 px-2 py-1.5 rounded-lg border border-amber-500/20">
            <span className="text-amber-400 font-bold uppercase flex items-center gap-1 shrink-0">
              <Gift className="h-3 w-3" /> Prize:
            </span>
            <span className="font-bold text-slate-200 truncate">{qualifiedPrize}</span>
          </div>

          {/* NEXT TIER GOAL */}
          <div className="flex items-center justify-between gap-1 bg-slate-950/80 px-2 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-300">
            <span className="font-bold uppercase flex items-center gap-1 shrink-0">
              <Target className="h-3 w-3 text-emerald-400" /> Next Tier ({nextTierRank}):
            </span>
            <span className="font-bold text-amber-300 truncate">
              +{xpNeededToNextTier.toLocaleString()} XP
            </span>
          </div>
        </div>
      </div>

      {/* RANK PROMOTED VICTORY MODAL */}
      <RankPromotedVictoryModal details={promotionModal} onClose={() => setPromotionModal(null)} />
    </>
  );
}

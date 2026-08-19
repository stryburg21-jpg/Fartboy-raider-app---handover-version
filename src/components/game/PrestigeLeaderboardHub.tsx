import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameStore } from "@/store/gameStore";
import { awardActivityXP } from "@/services/xpEngine";
import { RaiderProfileModal } from "@/components/game/RaiderProfileModal";
import { RaiderAvatar } from "@/components/game/RaiderAvatar";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Crown,
  Zap,
  Clock,
  Sparkles,
  Flame,
  Shield,
  Award,
  Search,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Gift,
  Star,
  ArrowUpRight,
  Sparkle,
  Swords,
  Target,
  Layers,
  Calendar,
  Camera,
  ChevronDown,
} from "lucide-react";

export interface LeaderboardCompetitor {
  rank: number;
  playerId: string;
  username: string;
  avatar: string;
  level: number;
  specialistIdentity: string;
  divisionName: string; // e.g. "Top 0.1%", "Top 1.0%", "Top 5.0%", "Top 15.0%", "Top 50.0%", "Bottom 50%"
  specialTitle: string;
  rankPrize: string;
  packReward: string;
  nextSeasonXpBonusPct: number;
  isTemporaryTitle: boolean;
  lifetimeXP: number;
  seasonXP: number;
  weeklyXP: number;
  raidCount: number;
  rankDelta: number; // positive = gained positions, negative = dropped, 0 = unchanged
  equippedItemIcons?: string[];
  reputation?: number;
  isCurrentUser?: boolean;
}

// ----------------------------------------------------------------------
// MOCK DATASET FOR TOP 15 COMPETITORS (ECONOMY DESIGN BIBLE v3.1/v3.2 COMPLIANT)
// ----------------------------------------------------------------------

const SEASONAL_COMPETITORS_DATA: LeaderboardCompetitor[] = [
  {
    rank: 1,
    playerId: "p_top1",
    username: "SatoshiFart",
    avatar:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
    level: 42,
    specialistIdentity: "Stench Sovereign",
    divisionName: "Hall of Fame #1",
    specialTitle: "Eternal Fart Supreme",
    rankPrize: "3x Legendary Packs + 50,000 SP-XP",
    packReward: "3x Legendary Packs + 50,000 SP-XP",
    nextSeasonXpBonusPct: 5,
    isTemporaryTitle: true,
    seasonXP: 485000,
    weeklyXP: 72000,
    lifetimeXP: 1250000,
    raidCount: 342,
    rankDelta: 0,
    equippedItemIcons: ["👑", "🧪", "🥼", "⚡", "🦸", "🐉", "🔮"],
    reputation: 980,
  },
  {
    rank: 2,
    playerId: "p_top2",
    username: "GigaChadtoshi",
    avatar:
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&auto=format&fit=crop&q=80",
    level: 38,
    specialistIdentity: "Alpha Raider",
    divisionName: "Hall of Fame #2",
    specialTitle: "Grand Stench Warlord",
    rankPrize: "2x Legendary Packs + 35,000 SP-XP",
    packReward: "2x Legendary Packs + 35,000 SP-XP",
    nextSeasonXpBonusPct: 4,
    isTemporaryTitle: true,
    seasonXP: 412000,
    weeklyXP: 61000,
    lifetimeXP: 980000,
    raidCount: 289,
    rankDelta: 1,
    equippedItemIcons: ["🛡️", "⚗️", "👔", "⚡", "🦅", "🔥", "💎"],
    reputation: 850,
  },
  {
    rank: 3,
    playerId: "p_top3",
    username: "GasLord_99",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    level: 35,
    specialistIdentity: "Meme Vanguard",
    divisionName: "Hall of Fame #3",
    specialTitle: "Apex Raid Commander",
    rankPrize: "1x Legendary Pack + 25,000 SP-XP",
    packReward: "1x Legendary Pack + 25,000 SP-XP",
    nextSeasonXpBonusPct: 3,
    isTemporaryTitle: true,
    seasonXP: 378000,
    weeklyXP: 58000,
    lifetimeXP: 870000,
    raidCount: 260,
    rankDelta: -1,
    equippedItemIcons: ["⚔️", "🧬", "🦺", "🌀", "🐺", "💥", "🧿"],
    reputation: 790,
  },
  {
    rank: 4,
    playerId: "p_top4",
    username: "DegenSniper",
    avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80",
    level: 32,
    specialistIdentity: "CTO Sniper",
    divisionName: "Top 5 Elite",
    specialTitle: "Elite Vanguard Specialist",
    rankPrize: "1x Legendary Pack + 15,000 SP-XP",
    packReward: "1x Legendary Pack + 15,000 SP-XP",
    nextSeasonXpBonusPct: 2,
    isTemporaryTitle: true,
    seasonXP: 325000,
    weeklyXP: 49000,
    lifetimeXP: 720000,
    raidCount: 215,
    rankDelta: 2,
    equippedItemIcons: ["🎯", "🧪", "🧥", "⚡", "🦊", "✨", "🔮"],
    reputation: 710,
  },
  {
    rank: 5,
    playerId: "p_top5",
    username: "MemeKing.sol",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
    level: 30,
    specialistIdentity: "Viral Tactician",
    divisionName: "Top 5 Elite",
    specialTitle: "Elite Vanguard Specialist",
    rankPrize: "1x Legendary Pack + 15,000 SP-XP",
    packReward: "1x Legendary Pack + 15,000 SP-XP",
    nextSeasonXpBonusPct: 2,
    isTemporaryTitle: true,
    seasonXP: 298000,
    weeklyXP: 44000,
    lifetimeXP: 650000,
    raidCount: 198,
    rankDelta: 0,
    equippedItemIcons: ["🎭", "⚗️", "👕", "🌟", "🦁", "🔥", "💎"],
    reputation: 680,
  },
  {
    rank: 6,
    playerId: "p_top6",
    username: "CTO Vanguard",
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&auto=format&fit=crop&q=80",
    level: 28,
    specialistIdentity: "Community Sentinel",
    divisionName: "Top 0.1%",
    specialTitle: "Eternal Fart Legend",
    rankPrize: "Rare Vault Pack + 10,000 SP-XP",
    packReward: "Rare Vault Pack",
    nextSeasonXpBonusPct: 5,
    isTemporaryTitle: true,
    seasonXP: 260000,
    weeklyXP: 38000,
    lifetimeXP: 580000,
    raidCount: 175,
    rankDelta: 3,
    equippedItemIcons: ["🛡️", "🧪", "🥼", "⚡", "🦅", "💥", "🔮"],
    reputation: 620,
  },
  {
    rank: 7,
    playerId: "p_top7",
    username: "PepeRaidMaster",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80",
    level: 27,
    specialistIdentity: "Pepe High Templar",
    divisionName: "Top 1.0%",
    specialTitle: "Stench Warlord",
    rankPrize: "Rare Vault Pack + 8,500 SP-XP",
    packReward: "Rare Vault Pack",
    nextSeasonXpBonusPct: 3,
    isTemporaryTitle: true,
    seasonXP: 220000,
    weeklyXP: 34000,
    lifetimeXP: 510000,
    raidCount: 152,
    rankDelta: -2,
    equippedItemIcons: ["🐸", "⚗️", "🧥", "⚡", "🐺", "🔥", "🧿"],
    reputation: 580,
  },
  {
    rank: 8,
    playerId: "p_top8",
    username: "SolanaRaider",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    level: 25,
    specialistIdentity: "High-Speed Raider",
    divisionName: "Top 1.0%",
    specialTitle: "Stench Warlord",
    rankPrize: "Rare Vault Pack + 7,500 SP-XP",
    packReward: "Rare Vault Pack",
    nextSeasonXpBonusPct: 3,
    isTemporaryTitle: true,
    seasonXP: 195000,
    weeklyXP: 31000,
    lifetimeXP: 440000,
    raidCount: 138,
    rankDelta: 1,
    equippedItemIcons: ["⚡", "🧪", "👕", "🌀", "🦊", "✨", "💎"],
    reputation: 540,
  },
  {
    rank: 9,
    playerId: "p_top9",
    username: "FartboyPrime",
    avatar:
      "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=120&auto=format&fit=crop&q=80",
    level: 24,
    specialistIdentity: "Stench Specialist",
    divisionName: "Top 5.0%",
    specialTitle: "Raid Commander",
    rankPrize: "Standard Pack + 5,000 SP-XP",
    packReward: "Standard Pack",
    nextSeasonXpBonusPct: 2,
    isTemporaryTitle: true,
    seasonXP: 175000,
    weeklyXP: 28000,
    lifetimeXP: 390000,
    raidCount: 120,
    rankDelta: -1,
    equippedItemIcons: ["👑", "⚗️", "🥼", "⚡", "🦁", "🔥", "🔮"],
    reputation: 500,
  },
  {
    rank: 10,
    playerId: "p_top10",
    username: "VaporTrail_X",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    level: 22,
    specialistIdentity: "Vapor Specialist",
    divisionName: "Top 5.0%",
    specialTitle: "Raid Commander",
    rankPrize: "Standard Pack + 4,000 SP-XP",
    packReward: "Standard Pack",
    nextSeasonXpBonusPct: 2,
    isTemporaryTitle: true,
    seasonXP: 150000,
    weeklyXP: 24000,
    lifetimeXP: 340000,
    raidCount: 105,
    rankDelta: 0,
    equippedItemIcons: ["💨", "🧪", "🧥", "🌟", "🦅", "💥", "🧿"],
    reputation: 460,
  },
  {
    rank: 11,
    playerId: "p_top11",
    username: "StenchCadet_42",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    level: 20,
    specialistIdentity: "Gas Operations",
    divisionName: "Top 15.0%",
    specialTitle: "Vanguard Specialist",
    rankPrize: "Novice Pack + 3,000 SP-XP",
    packReward: "Novice Pack",
    nextSeasonXpBonusPct: 1,
    isTemporaryTitle: true,
    seasonXP: 128000,
    weeklyXP: 21000,
    lifetimeXP: 290000,
    raidCount: 92,
    rankDelta: 4,
    equippedItemIcons: ["🦺", "⚗️", "👕", "⚡", "🐺", "✨", "💎"],
    reputation: 420,
  },
  {
    rank: 12,
    playerId: "p_currentUser",
    username: "Fartboy Raider",
    avatar:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
    level: 19,
    specialistIdentity: "Community Contributor",
    divisionName: "Top 15.0%",
    specialTitle: "Vanguard Specialist",
    rankPrize: "Novice Pack + 2,500 SP-XP + Contributor Pin",
    packReward: "Novice Pack",
    nextSeasonXpBonusPct: 1,
    isTemporaryTitle: true,
    seasonXP: 115000,
    weeklyXP: 19500,
    lifetimeXP: 340000,
    raidCount: 84,
    rankDelta: 2,
    equippedItemIcons: ["🛡️", "🧪", "🥼", "⚡", "🦊", "🔥", "🔮"],
    reputation: 400,
    isCurrentUser: true,
  },
  {
    rank: 13,
    playerId: "p_top13",
    username: "AlphaFart_99",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80",
    level: 18,
    specialistIdentity: "Raid Initiate",
    divisionName: "Top 50.0%",
    specialTitle: "Gas Cadet",
    rankPrize: "Cadet Chest + 1,500 SP-XP",
    packReward: "Cadet Chest",
    nextSeasonXpBonusPct: 0,
    isTemporaryTitle: true,
    seasonXP: 98000,
    weeklyXP: 15000,
    lifetimeXP: 210000,
    raidCount: 71,
    rankDelta: -1,
    equippedItemIcons: ["⚔️", "⚗️", "🧥", "🌟", "🦁", "💥", "🧿"],
    reputation: 360,
  },
  {
    rank: 14,
    playerId: "p_top14",
    username: "DegenWhale",
    avatar:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
    level: 17,
    specialistIdentity: "Solana Degen",
    divisionName: "Top 50.0%",
    specialTitle: "Gas Cadet",
    rankPrize: "Cadet Chest + 1,000 SP-XP",
    packReward: "Cadet Chest",
    nextSeasonXpBonusPct: 0,
    isTemporaryTitle: true,
    seasonXP: 84000,
    weeklyXP: 12000,
    lifetimeXP: 190000,
    raidCount: 60,
    rankDelta: -3,
    equippedItemIcons: ["🐋", "🧪", "👕", "⚡", "🦅", "✨", "💎"],
    reputation: 330,
  },
  {
    rank: 15,
    playerId: "p_top15",
    username: "CyberPioneer",
    avatar:
      "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&auto=format&fit=crop&q=80",
    level: 16,
    specialistIdentity: "Cyber Specialist",
    divisionName: "Bottom 50%",
    specialTitle: "Unranked Raider",
    rankPrize: "Starter Loot Box",
    packReward: "Starter Box",
    nextSeasonXpBonusPct: 0,
    isTemporaryTitle: true,
    seasonXP: 72000,
    weeklyXP: 9500,
    lifetimeXP: 160000,
    raidCount: 52,
    rankDelta: 0,
    equippedItemIcons: ["🤖", "⚗️", "🥼", "🌀", "🐺", "🔥", "🔮"],
    reputation: 300,
  },
];

// Helper to calculate countdown timers
function useLeaderboardCountdowns() {
  const [seasonClock, setSeasonClock] = useState({
    days: 74,
    hours: 18,
    minutes: 42,
    seconds: 15,
  });

  const [weeklyClock, setWeeklyClock] = useState({
    days: 3,
    hours: 9,
    minutes: 28,
    seconds: 40,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setSeasonClock((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0)
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });

      setWeeklyClock((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0)
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return { seasonClock, weeklyClock };
}

// Helper to style percentile bracket badges for ranks 6+
function getPercentileBadgeStyle(divisionName: string) {
  if (divisionName.includes("0.1%")) {
    return "bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
  }
  if (divisionName.includes("1.0%")) {
    return "bg-purple-500/20 text-purple-300 border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]";
  }
  if (divisionName.includes("5.0%")) {
    return "bg-cyan-500/20 text-cyan-300 border-cyan-400/40";
  }
  if (divisionName.includes("15.0%")) {
    return "bg-teal-500/20 text-teal-300 border-teal-400/40";
  }
  if (divisionName.includes("50.0%")) {
    return "bg-amber-950/40 text-amber-200/80 border-amber-500/30";
  }
  return "bg-slate-800 text-slate-300 border-slate-700";
}

export function PrestigeLeaderboardHub() {
  const [trackMode, setTrackMode] = useState<"seasonal" | "lifetime">("seasonal");
  const [selectedSeason, setSelectedSeason] = useState<"season_1" | "season_0" | "pre_alpha">(
    "season_1",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>("all");
  const [inspectingPlayer, setInspectingPlayer] = useState<LeaderboardCompetitor | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const player = useGameStore((s) => s.player);
  const { seasonClock } = useLeaderboardCountdowns();
  const userRowRef = useRef<HTMLDivElement>(null);

  // Sync user profile info into datasets and sort based on active track and season snapshot
  const rawSeasonData = useMemo(() => {
    if (selectedSeason === "season_0") {
      // Historical Snapshot for Season 0
      return [
        {
          rank: 1,
          playerId: "p_s0_1",
          username: "SatoshiFart",
          avatar:
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
          level: 40,
          specialistIdentity: "Season 0 Champion",
          divisionName: "Hall of Fame #1",
          specialTitle: "Genesis Stench Master",
          rankPrize: "3x Mythic Vault Packs + 50,000 SP-XP",
          packReward: "3x Mythic Vault Packs",
          nextSeasonXpBonusPct: 5,
          isTemporaryTitle: false,
          seasonXP: 510000,
          weeklyXP: 0,
          lifetimeXP: 1100000,
          raidCount: 380,
          rankDelta: 0,
          reputation: 950,
        },
        {
          rank: 2,
          playerId: "p_s0_2",
          username: "GigaChadtoshi",
          avatar:
            "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&auto=format&fit=crop&q=80",
          level: 36,
          specialistIdentity: "Season 0 Runner-up",
          divisionName: "Hall of Fame #2",
          specialTitle: "Beta Warlord",
          rankPrize: "2x Mythic Vault Packs + 35,000 SP-XP",
          packReward: "2x Mythic Vault Packs",
          nextSeasonXpBonusPct: 4,
          isTemporaryTitle: false,
          seasonXP: 450000,
          weeklyXP: 0,
          lifetimeXP: 920000,
          raidCount: 310,
          rankDelta: 0,
          reputation: 880,
        },
        {
          rank: 3,
          playerId: "p_s0_3",
          username: "GasLord_99",
          avatar:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
          level: 34,
          specialistIdentity: "Beta Elite",
          divisionName: "Hall of Fame #3",
          specialTitle: "Genesis Raid Commander",
          rankPrize: "1x Mythic Vault Pack + 25,000 SP-XP",
          packReward: "1x Mythic Vault Pack",
          nextSeasonXpBonusPct: 3,
          isTemporaryTitle: false,
          seasonXP: 390000,
          weeklyXP: 0,
          lifetimeXP: 810000,
          raidCount: 275,
          rankDelta: 0,
          reputation: 820,
        },
        {
          rank: 4,
          playerId: "p_s0_4",
          username: "DegenSniper",
          avatar:
            "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80",
          level: 31,
          specialistIdentity: "CTO Sniper",
          divisionName: "Top 5 Elite",
          specialTitle: "Vanguard Specialist",
          rankPrize: "2x Legend Packs + 15,000 SP-XP",
          packReward: "2x Legend Packs",
          nextSeasonXpBonusPct: 2,
          isTemporaryTitle: false,
          seasonXP: 330000,
          weeklyXP: 0,
          lifetimeXP: 700000,
          raidCount: 220,
          rankDelta: 0,
          reputation: 740,
        },
        {
          rank: 5,
          playerId: "p_s0_5",
          username: "MemeKing.sol",
          avatar:
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
          level: 29,
          specialistIdentity: "Beta Tactician",
          divisionName: "Top 5 Elite",
          specialTitle: "Vanguard Specialist",
          rankPrize: "1x Legend Pack + 15,000 SP-XP",
          packReward: "1x Legend Pack",
          nextSeasonXpBonusPct: 2,
          isTemporaryTitle: false,
          seasonXP: 300000,
          weeklyXP: 0,
          lifetimeXP: 640000,
          raidCount: 200,
          rankDelta: 0,
          reputation: 700,
        },
      ];
    } else if (selectedSeason === "pre_alpha") {
      // Historical Snapshot for Pre-Alpha
      return [
        {
          rank: 1,
          playerId: "p_pa_1",
          username: "GasLord_99",
          avatar:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
          level: 28,
          specialistIdentity: "Pre-Alpha Founder",
          divisionName: "Hall of Fame #1",
          specialTitle: "Genesis Pioneer",
          rankPrize: "Genesis Founder Box + 40,000 SP-XP",
          packReward: "Founder Box",
          nextSeasonXpBonusPct: 5,
          isTemporaryTitle: false,
          seasonXP: 320000,
          weeklyXP: 0,
          lifetimeXP: 500000,
          raidCount: 190,
          rankDelta: 0,
          reputation: 900,
        },
        {
          rank: 2,
          playerId: "p_pa_2",
          username: "SatoshiFart",
          avatar:
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
          level: 26,
          specialistIdentity: "Alpha Raider",
          divisionName: "Hall of Fame #2",
          specialTitle: "Genesis Warlord",
          rankPrize: "3x Legend Packs + 25,000 SP-XP",
          packReward: "3x Legend Packs",
          nextSeasonXpBonusPct: 4,
          isTemporaryTitle: false,
          seasonXP: 290000,
          weeklyXP: 0,
          lifetimeXP: 450000,
          raidCount: 170,
          rankDelta: 0,
          reputation: 860,
        },
      ];
    }
    return SEASONAL_COMPETITORS_DATA;
  }, [selectedSeason]);

  const dataset = useMemo(() => {
    const rawData = [...rawSeasonData];

    // Enrich current user entry if viewing active Season 1
    const enriched = rawData.map((entry) => {
      if (entry.isCurrentUser && player && selectedSeason === "season_1") {
        return {
          ...entry,
          username: player.name || entry.username,
          avatar: player.avatarUrl || entry.avatar,
          level: player.level || entry.level,
          seasonXP: player.xp || entry.seasonXP,
          lifetimeXP: player.lifetimeXP || entry.lifetimeXP,
        };
      }
      return entry;
    });

    if (trackMode === "lifetime") {
      enriched.sort((a, b) => b.lifetimeXP - a.lifetimeXP);
      return enriched.map((item, idx) => ({ ...item, rank: idx + 1 }));
    }
    return enriched;
  }, [rawSeasonData, trackMode, player, selectedSeason]);

  // Filter dataset by search and division filter
  const filteredDataset = useMemo(() => {
    let result = dataset;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.username.toLowerCase().includes(q) ||
          c.specialistIdentity.toLowerCase().includes(q) ||
          c.specialTitle.toLowerCase().includes(q) ||
          c.divisionName.toLowerCase().includes(q),
      );
    }

    if (selectedDivisionFilter !== "all") {
      result = result.filter((c) => c.divisionName.includes(selectedDivisionFilter));
    }

    return result;
  }, [dataset, searchQuery, selectedDivisionFilter]);

  // Top 5 Podium Showcase vs Ranks 6+
  const top5Podium = useMemo(() => {
    return dataset.filter((c) => c.rank <= 5);
  }, [dataset]);

  const ranks6Plus = useMemo(() => {
    return filteredDataset.filter((c) => c.rank > 5);
  }, [filteredDataset]);

  const currentUserEntry = useMemo(() => {
    return dataset.find((c) => c.isCurrentUser) || dataset[11] || dataset[0] || null;
  }, [dataset]);

  const handleSimulateXP = async () => {
    const res = await awardActivityXP({
      activityType: "social_raid_like_rt",
      customBaseXP: 5000,
      note: "Simulated Raid Standings Boost",
    });
    if (res.success) {
      setFeedbackMessage("🎉 +5,000 XP Awarded! Standings recalculated.");
    } else {
      setFeedbackMessage("XP simulation completed.");
    }
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const scrollToUserRow = () => {
    if (userRowRef.current) {
      userRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Convert LeaderboardCompetitor to LeaderboardEntry for RaiderProfileModal
  const convertToLeaderboardEntry = (comp: LeaderboardCompetitor) => {
    if (!comp) return null;
    return {
      rank: comp.rank,
      playerId: comp.playerId,
      username: comp.username,
      avatar: comp.avatar,
      level: comp.level,
      specialistIdentity: comp.specialistIdentity,
      contributorTitle: comp.specialTitle,
      titleXPBoostPct: comp.nextSeasonXpBonusPct,
      lifetimeXP: comp.lifetimeXP,
      xp: trackMode === "weekly" ? comp.weeklyXP : comp.seasonXP,
      seasonXP: comp.seasonXP,
      raidCount: comp.raidCount,
      equippedItemIcons: comp.equippedItemIcons,
      reputation: comp.reputation,
    };
  };

  return (
    <div className="space-y-8 pb-28 relative">
      {/* FEEDBACK BANNER */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-emerald-400/50 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-amber-950/90 p-4 text-xs font-mono font-bold text-emerald-300 flex items-center justify-between shadow-2xl backdrop-blur-2xl"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" />
              <span>{feedbackMessage}</span>
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setFeedbackMessage(null)}
              className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. COMPETITIVE HYPE BANNER WITH SEASON SNAPSHOT SELECTOR */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-slate-950 via-zinc-950 to-emerald-950/60 p-5 sm:p-7 shadow-[0_0_80px_rgba(16,185,129,0.15)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-emerald-300 border border-emerald-400/40 shadow-sm">
                <Crown className="h-4 w-4 text-emerald-400 animate-pulse" />
                GLOBAL POWER RANKINGS
              </span>

              {/* COMPACT SEASON SELECT DROPDOWN (Frees up vertical space) */}
              <div className="relative inline-flex items-center">
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value as typeof selectedSeason)}
                  className="appearance-none bg-slate-950/95 hover:bg-slate-900 border border-amber-500/50 hover:border-amber-400 text-amber-300 text-xs font-mono font-black py-1 pl-3 pr-7 rounded-xl cursor-pointer shadow-md focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all select-none"
                  aria-label="Select Season Archive"
                >
                  <option value="season_1" className="bg-slate-950 text-amber-300 font-bold">
                    🔽 Season 1 (Active)
                  </option>
                  <option value="season_0" className="bg-slate-950 text-slate-300 font-bold">
                    📦 Season 0 (Beta)
                  </option>
                  <option value="pre_alpha" className="bg-slate-950 text-slate-300 font-bold">
                    🏛️ Pre-Alpha Archive
                  </option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-400" />
              </div>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-4xl text-foreground tracking-tight leading-tight">
              Global Power Rankings &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                Raid Contributors
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Ascend the leaderboards to earn Mythic Vault Packs, exclusive profile cosmetics, and
              next-season XP multipliers!
            </p>

            {selectedSeason !== "season_1" && (
              <div className="inline-flex items-center gap-2 rounded-xl bg-amber-500/20 border border-amber-400/60 px-3 py-1.5 font-mono text-xs font-bold text-amber-300">
                <Camera className="h-4 w-4 text-amber-400 shrink-0" />
                <span>📸 READ-ONLY SEASON SNAPSHOT • Final Standings Captured at Season End</span>
              </div>
            )}
          </div>

          {/* DYNAMIC SEASON COUNTDOWN TIMER WIDGET (SEASON 1 ONLY) */}
          {selectedSeason === "season_1" && (
            <div className="w-full lg:w-auto shrink-0 rounded-2xl border-2 border-amber-400/60 bg-gradient-to-b from-amber-950/70 via-slate-900/90 to-slate-950 p-4 shadow-[0_0_40px_rgba(245,158,11,0.25)] backdrop-blur-xl space-y-2">
              <div className="flex items-center justify-between gap-4 border-b border-amber-500/30 pb-2">
                <span className="font-mono text-[10px] font-black uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                  Season 1 Active Countdown
                </span>
                <span className="rounded bg-amber-400/20 px-2 py-0.5 font-mono text-[9px] font-black uppercase text-amber-300 border border-amber-400/40">
                  LIVE CLOCK
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center pt-1 font-mono">
                <div className="rounded-xl bg-slate-950/80 p-2 border border-amber-500/30">
                  <span className="block font-black text-lg text-amber-300">
                    {String(seasonClock.days).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-muted-foreground uppercase font-bold">DAYS</span>
                </div>
                <div className="rounded-xl bg-slate-950/80 p-2 border border-amber-500/30">
                  <span className="block font-black text-lg text-amber-300">
                    {String(seasonClock.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-muted-foreground uppercase font-bold">HRS</span>
                </div>
                <div className="rounded-xl bg-slate-950/80 p-2 border border-amber-500/30">
                  <span className="block font-black text-lg text-amber-300">
                    {String(seasonClock.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-muted-foreground uppercase font-bold">MINS</span>
                </div>
                <div className="rounded-xl bg-slate-950/80 p-2 border border-amber-400/80 bg-amber-400/10">
                  <span className="block font-black text-lg text-emerald-400 animate-pulse">
                    {String(seasonClock.seconds).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] text-emerald-400 uppercase font-bold">SECS</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span>Cycle: 90-Day Seasonal</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSimulateXP}
                  className="h-6 px-2 text-[10px] font-mono text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/20 cursor-pointer"
                >
                  +5,000 XP Test
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. TOGGLE SWITCH: SEASONAL VS LIFETIME (WEEKLY SPRINTS REMOVED PER REQUEST) */}
      <div className="flex justify-center">
        <div className="relative grid grid-cols-2 p-1.5 rounded-2xl bg-slate-900/90 border-2 border-emerald-500/40 shadow-2xl backdrop-blur-xl w-full max-w-xl">
          {[
            {
              id: "seasonal",
              title: "Seasonal Standings",
              subtitle: "Season Specific Standings & Rewards",
              icon: Trophy,
              color: "text-emerald-400",
            },
            {
              id: "lifetime",
              title: "Lifetime Hall",
              subtitle: "All-Time Cumulative Leaderboard",
              icon: Crown,
              color: "text-amber-400",
            },
          ].map((tab) => {
            const isActive = trackMode === tab.id;
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setTrackMode(tab.id as typeof trackMode)}
                className={`relative z-10 flex flex-col items-center justify-center p-3 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "text-foreground font-black"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTrackPill"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-amber-500/20 border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
                  />
                )}
                <div className="relative z-10 flex items-center gap-2">
                  <IconComp className={`h-4 w-4 ${tab.color}`} />
                  <span className="font-display text-xs sm:text-sm font-extrabold tracking-tight">
                    {tab.title}
                  </span>
                </div>
                <span className="relative z-10 font-mono text-[9px] text-muted-foreground mt-0.5 text-center hidden md:block">
                  {tab.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TOP 5 HALL OF FAME HERO GRID (IN LINE & BALANCED) */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2.5">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-400 animate-pulse" />
            <h2 className="font-display font-black text-lg sm:text-xl text-foreground">
              Top 5 Podium & Champions
            </h2>
          </div>
          <span className="font-mono text-xs font-bold text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
            Top 5 Rewards
          </span>
        </div>

        {/* TOP 1 - 3 PODIUM ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end font-mono">
          {/* 2ND PLACE (SILVER) */}
          {top5Podium[1] && (
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => setInspectingPlayer(convertToLeaderboardEntry(top5Podium[1]))}
              className="order-2 md:order-1 relative overflow-hidden rounded-2xl border-2 border-slate-300 bg-gradient-to-b from-slate-800/50 via-slate-950 to-slate-900 p-4 shadow-xl backdrop-blur-2xl space-y-3 cursor-pointer group"
            >
              <div className="flex items-center justify-between border-b border-slate-400/30 pb-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/20 px-2.5 py-0.5 text-[10px] font-black text-slate-200 border border-slate-300/40">
                  🥈 2ND PLACE
                </span>
                <span className="text-[10px] font-bold text-slate-300">
                  {top5Podium[1].rankDelta > 0
                    ? `▲ +${top5Podium[1].rankDelta}`
                    : top5Podium[1].rankDelta < 0
                      ? `▼ ${top5Podium[1].rankDelta}`
                      : "—"}
                </span>
              </div>

              <div className="flex flex-col items-center text-center space-y-2">
                <div className="relative">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-300 text-black font-extrabold shadow-md border-2 border-white">
                    <img
                      src={top5Podium[1].avatar}
                      alt={top5Podium[1].username}
                      className="h-full w-full object-cover rounded-2xl"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-slate-300 text-black text-[10px] font-black shadow-md">
                    #2
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-black text-lg text-foreground group-hover:text-slate-200 transition-colors">
                    {top5Podium[1].username}
                  </h3>
                  <span className="text-[10px] text-muted-foreground block">
                    {top5Podium[1].specialistIdentity}
                  </span>
                </div>

                <div className="w-full rounded-xl bg-slate-950/90 p-2.5 border border-slate-400/30 space-y-1 text-left text-[11px]">
                  <div className="text-[9px] text-slate-300 uppercase font-black flex items-center justify-between">
                    <span>Silver Champion Prize</span>
                    <Gift className="h-3 w-3 text-slate-300" />
                  </div>
                  <div className="font-extrabold text-slate-100">
                    🎁 2x Mythic Vault Packs + 35,000 SP-XP
                  </div>
                  <div className="text-emerald-300 font-black text-[10px]">
                    ✨ Silver Frame & Badge • +4% XP Boost
                  </div>
                </div>

                <div className="font-black text-xs text-slate-200">
                  ⚡{" "}
                  {(trackMode === "lifetime"
                    ? top5Podium[1].lifetimeXP
                    : top5Podium[1].seasonXP
                  ).toLocaleString()}{" "}
                  XP
                </div>
              </div>
            </motion.div>
          )}

          {/* 1ST PLACE (GOLD) */}
          {top5Podium[0] && (
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setInspectingPlayer(convertToLeaderboardEntry(top5Podium[0]))}
              className="order-1 md:order-2 relative overflow-hidden rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-500/25 via-slate-950 to-amber-950/60 p-5 shadow-[0_0_50px_rgba(245,158,11,0.35)] backdrop-blur-2xl space-y-3 cursor-pointer group"
            >
              <div className="flex items-center justify-between border-b border-amber-500/40 pb-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/25 px-3 py-0.5 text-xs font-black text-amber-300 border border-amber-400/50 shadow-sm animate-pulse">
                  👑 1ST PLACE CHAMPION
                </span>
                <span className="text-xs font-black text-emerald-400">▲ TOP SOVEREIGN</span>
              </div>

              <div className="flex flex-col items-center text-center space-y-2">
                <div className="relative">
                  <div className="grid h-20 w-20 place-items-center rounded-2xl bg-amber-400 text-black font-extrabold shadow-[0_0_25px_rgba(245,158,11,0.5)] border-3 border-amber-200">
                    <img
                      src={top5Podium[0].avatar}
                      alt={top5Podium[0].username}
                      className="h-full w-full object-cover rounded-2xl"
                    />
                  </div>
                  <span className="absolute -top-2 -right-2 grid h-7 w-7 place-items-center rounded-full bg-amber-400 text-black text-xs font-black shadow-lg">
                    👑
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-black text-xl text-foreground group-hover:text-amber-300 transition-colors">
                    {top5Podium[0].username}
                  </h3>
                  <span className="text-[10px] font-bold text-amber-300/80 block">
                    {top5Podium[0].specialistIdentity}
                  </span>
                </div>

                <div className="w-full rounded-xl bg-slate-950/95 p-3 border border-amber-400/50 space-y-1 text-left text-xs">
                  <div className="text-[9px] text-amber-400 uppercase font-black flex items-center justify-between">
                    <span>👑 Gold Supreme Prize</span>
                    <Gift className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <div className="font-black text-amber-200 text-xs">
                    🎁 3x Mythic Vault Packs + 50,000 SP-XP
                  </div>
                  <div className="text-emerald-300 font-black text-[11px]">
                    ✨ Gold Crown & Aura • +5% XP Boost
                  </div>
                </div>

                <div className="font-black text-sm text-amber-300">
                  ⚡{" "}
                  {(trackMode === "lifetime"
                    ? top5Podium[0].lifetimeXP
                    : top5Podium[0].seasonXP
                  ).toLocaleString()}{" "}
                  XP
                </div>
              </div>
            </motion.div>
          )}

          {/* 3RD PLACE (BRONZE) */}
          {top5Podium[2] && (
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => setInspectingPlayer(convertToLeaderboardEntry(top5Podium[2]))}
              className="order-3 relative overflow-hidden rounded-2xl border-2 border-amber-700 bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-900 p-4 shadow-xl backdrop-blur-2xl space-y-3 cursor-pointer group"
            >
              <div className="flex items-center justify-between border-b border-amber-800/30 pb-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-800/20 px-2.5 py-0.5 text-[10px] font-black text-amber-300 border border-amber-700/40">
                  🥉 3RD PLACE
                </span>
                <span className="text-[10px] font-bold text-amber-400">
                  {top5Podium[2].rankDelta > 0
                    ? `▲ +${top5Podium[2].rankDelta}`
                    : top5Podium[2].rankDelta < 0
                      ? `▼ ${top5Podium[2].rankDelta}`
                      : "—"}
                </span>
              </div>

              <div className="flex flex-col items-center text-center space-y-2">
                <div className="relative">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-amber-700 text-amber-100 font-extrabold shadow-md border-2 border-amber-500">
                    <img
                      src={top5Podium[2].avatar}
                      alt={top5Podium[2].username}
                      className="h-full w-full object-cover rounded-2xl"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-amber-700 text-amber-100 text-[10px] font-black shadow-md">
                    #3
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-black text-lg text-foreground group-hover:text-amber-300 transition-colors">
                    {top5Podium[2].username}
                  </h3>
                  <span className="text-[10px] text-muted-foreground block">
                    {top5Podium[2].specialistIdentity}
                  </span>
                </div>

                <div className="w-full rounded-xl bg-slate-950/90 p-2.5 border border-amber-800/30 space-y-1 text-left text-[11px]">
                  <div className="text-[9px] text-amber-400 uppercase font-black flex items-center justify-between">
                    <span>Bronze Champion Prize</span>
                    <Gift className="h-3 w-3 text-amber-400" />
                  </div>
                  <div className="font-extrabold text-amber-200">
                    🎁 1x Mythic Vault Pack + 25,000 SP-XP
                  </div>
                  <div className="text-emerald-300 font-black text-[10px]">
                    ✨ Bronze Frame & Badge • +3% XP Boost
                  </div>
                </div>

                <div className="font-black text-xs text-amber-400">
                  ⚡{" "}
                  {(trackMode === "lifetime"
                    ? top5Podium[2].lifetimeXP
                    : top5Podium[2].seasonXP
                  ).toLocaleString()}{" "}
                  XP
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* RANKS 4 & 5 (TOP 5 ELITE) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
          {[top5Podium[3], top5Podium[4]].filter(Boolean).map((p) => (
            <motion.div
              key={p.rank}
              whileHover={{ y: -2 }}
              onClick={() => setInspectingPlayer(convertToLeaderboardEntry(p))}
              className="rounded-xl border border-amber-500/40 p-3.5 bg-slate-950/90 backdrop-blur-xl shadow-md cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-900 border border-amber-400 text-amber-300 font-extrabold">
                    <img
                      src={p.avatar}
                      alt={p.username}
                      className="h-full w-full object-cover rounded-xl"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 font-mono text-[9px] font-black rounded bg-amber-400 text-black px-1">
                    #{p.rank}
                  </span>
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-sm text-foreground truncate">
                      {p.username}
                    </span>
                    <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-400/20 px-1.5 py-0.2 rounded border border-amber-400/30">
                      TOP 5 ELITE
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-300 font-bold truncate">
                    "{p.specialTitle}"
                  </p>
                  <p className="text-[10px] text-emerald-400 font-black">
                    🎁 {p.rank === 4 ? "2x Legend Packs" : "1x Legend Pack"} + 15,000 SP-XP • +2% XP
                    Boost
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-xs font-black text-amber-300">
                  ⚡ {(trackMode === "lifetime" ? p.lifetimeXP : p.seasonXP).toLocaleString()} XP
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 4. OTHER SEASONAL REWARDS SECTION (FOR FINISHING OUTSIDE TOP 5) */}
      <div className="space-y-3 font-mono pt-2">
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-amber-400" />
            <h2 className="font-display font-black text-base sm:text-lg text-foreground">
              Other Seasonal Tier Rewards (Ranks 6+)
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">
            Granted to all participants based on final percentile
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {[
            {
              tier: "Top 1%",
              division: "Stench Warlord",
              reward: "1x Legend Pack + 10,000 SP-XP",
              badge: "Legendary Pin",
              boost: "+3% XP Boost",
              color: "border-purple-500/40 bg-purple-950/30 text-purple-300",
            },
            {
              tier: "Top 5%",
              division: "Raid Commander",
              reward: "1x Specialist Pack + 6,000 SP-XP",
              badge: "Commander Badge",
              boost: "+2% XP Boost",
              color: "border-cyan-500/40 bg-cyan-950/30 text-cyan-300",
            },
            {
              tier: "Top 15%",
              division: "Vanguard Specialist",
              reward: "1x Standard Pack + 3,500 SP-XP",
              badge: "Contributor Pin",
              boost: "+1% XP Boost",
              color: "border-teal-500/40 bg-teal-950/30 text-teal-300",
            },
            {
              tier: "Top 50%",
              division: "Gas Cadet",
              reward: "1x Novice Pack + 1,500 SP-XP",
              badge: "Cadet Badge",
              boost: "+0.5% XP Boost",
              color: "border-amber-500/40 bg-amber-950/30 text-amber-300",
            },
            {
              tier: "Top 100%",
              division: "Participant",
              reward: "1x Starter Pack + 500 SP-XP",
              badge: "Participation Pin",
              boost: "Base Rate",
              color: "border-slate-700 bg-slate-900/60 text-slate-300",
            },
          ].map((item) => (
            <div
              key={item.tier}
              className={`rounded-xl border p-3 flex flex-col justify-between space-y-1.5 shadow-sm ${item.color}`}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <span className="font-black text-xs uppercase tracking-wider">{item.tier}</span>
                <span className="text-[9px] font-bold opacity-80">{item.division}</span>
              </div>
              <div className="text-[11px] font-extrabold text-white leading-tight">
                {item.reward}
              </div>
              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className="opacity-90 font-bold">{item.badge}</span>
                <span className="font-black text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  {item.boost}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. PRESTIGE DIVISIONS & LEADERBOARD TABLE (RANKS 6+) */}
      <div className="space-y-4 pt-4">
        {/* SEARCH & PRESTIGE DIVISION FILTERS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/30 pb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            <h3 className="font-display font-black text-lg text-foreground">
              Prestige Divisions & Ranks 6+ Standings
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Division Filter Chips */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-emerald-500/30 text-xs font-mono overflow-x-auto max-w-full">
              {[
                { id: "all", label: "All Divisions" },
                { id: "Top 0.1%", label: "Top 0.1%" },
                { id: "Top 1.0%", label: "Top 1.0%" },
                { id: "Top 5.0%", label: "Top 5.0%" },
                { id: "Top 15.0%", label: "Top 15.0%" },
                { id: "Top 50.0%", label: "Top 50.0%" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedDivisionFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap text-[11px] ${
                    selectedDivisionFilter === f.id
                      ? "bg-emerald-400 text-black shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Raider, Division, Title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-slate-900/90 border border-emerald-500/30 pl-9 pr-3 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* GLASSMORPHISM LEADERBOARD ROWS */}
        <div className="space-y-2.5">
          {ranks6Plus.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-slate-900/60 p-8 text-center font-mono text-xs text-muted-foreground">
              No raiders found matching "{searchQuery}".
            </div>
          ) : (
            ranks6Plus.map((comp) => {
              const isCurrentUser = comp.isCurrentUser;
              const xpVal =
                trackMode === "weekly"
                  ? comp.weeklyXP
                  : trackMode === "lifetime"
                    ? comp.lifetimeXP
                    : comp.seasonXP;

              return (
                <motion.div
                  key={comp.playerId}
                  ref={isCurrentUser ? userRowRef : null}
                  whileHover={{ scale: 1.002, x: 2 }}
                  onClick={() => setInspectingPlayer(convertToLeaderboardEntry(comp))}
                  className={`group relative overflow-hidden rounded-xl border px-3.5 py-2.5 sm:px-4 sm:py-3 transition-all duration-200 backdrop-blur-xl shadow-md cursor-pointer ${
                    isCurrentUser
                      ? "border-2 border-amber-400/90 bg-gradient-to-r from-amber-500/20 via-slate-900/95 to-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/40"
                      : "border-emerald-500/20 bg-slate-900/70 hover:border-emerald-400/50 hover:bg-slate-900/95 hover:shadow-[0_0_15px_rgba(16,185,129,0.12)]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    {/* LEFT: RANK + AVATAR + IDENTITY & COMPACT INLINE REWARDS */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank Badge + Delta */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`grid h-8 w-8 place-items-center rounded-lg font-mono text-xs font-black border shadow-sm ${
                            isCurrentUser
                              ? "bg-amber-400 text-black border-amber-200"
                              : "bg-slate-800 text-emerald-300 border-emerald-500/30"
                          }`}
                        >
                          #{comp.rank}
                        </span>

                        <span className="font-mono text-[9px] font-bold shrink-0">
                          {comp.rankDelta > 0 ? (
                            <span className="text-emerald-400 flex items-center">
                              <TrendingUp className="h-2.5 w-2.5" />+{comp.rankDelta}
                            </span>
                          ) : comp.rankDelta < 0 ? (
                            <span className="text-red-400 flex items-center">
                              <TrendingDown className="h-2.5 w-2.5" />
                              {comp.rankDelta}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">--</span>
                          )}
                        </span>
                      </div>

                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <RaiderAvatar
                          avatar={comp.avatar}
                          username={comp.username}
                          sizeClassName="h-9 w-9 text-lg"
                        />
                        <span className="absolute -bottom-1 -right-1 rounded bg-slate-950 px-1 py-0.2 font-mono text-[7px] font-black text-emerald-400 border border-emerald-500/40">
                          LV {comp.level}
                        </span>
                      </div>

                      {/* Raider Info & Compact Inline Reward Row */}
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-extrabold text-sm text-foreground truncate">
                            {comp.username}
                          </span>

                          {isCurrentUser && (
                            <span className="rounded bg-amber-400 text-black px-1.5 py-0.2 text-[8px] font-mono font-black uppercase tracking-wider shadow">
                              YOU
                            </span>
                          )}

                          {/* SPECIAL TITLE BADGE */}
                          <span className="text-amber-300 font-mono text-xs font-bold truncate">
                            "{comp.specialTitle}"
                          </span>
                        </div>

                        {/* COMPACT REWARD DISPLAY INLINE ROW: [Badge Tag] | [XP Boost %] | [Prize Pack] */}
                        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                          <span className="text-slate-400 hidden sm:inline">
                            {comp.specialistIdentity}
                          </span>
                          <span className="hidden sm:inline text-slate-600">•</span>
                          <span className="text-emerald-400 font-extrabold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 shrink-0">
                            ⚡ +{comp.nextSeasonXpBonusPct}% XP
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-amber-300/90 font-bold flex items-center gap-1 min-w-0 truncate">
                            <Gift className="h-3 w-3 text-amber-400 shrink-0" />
                            <span className="truncate">{comp.rankPrize}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: PROMINENT PERCENTILE DIVISION BADGE + XP + ARROW */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                      <div className="flex flex-col items-end gap-0.5">
                        {/* PROMINENT PERCENTILE BADGE AT TOP RIGHT */}
                        <span
                          className={`rounded px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider border shadow-sm ${getPercentileBadgeStyle(
                            comp.divisionName,
                          )}`}
                        >
                          {comp.divisionName}
                        </span>

                        <div className="font-mono text-xs sm:text-sm font-black text-amber-300">
                          ⚡ {xpVal.toLocaleString()} XP
                        </div>
                      </div>

                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. DYNAMIC USER CURRENT POSITION PINNED BAR (STICKY AT BOTTOM, LEVEL 2 Z-INDEX: 100) */}
      {currentUserEntry && (
        <div className="fixed bottom-20 lg:bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-4xl">
          <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-950/95 via-slate-900/95 to-slate-950 p-3.5 sm:p-4 shadow-[0_0_40px_rgba(245,158,11,0.4)] backdrop-blur-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-xl bg-amber-400 text-black font-extrabold text-sm sm:text-base shrink-0 shadow-md">
                #{currentUserEntry.rank}
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-black text-xs sm:text-sm text-foreground truncate">
                    Your Current Rank: #{currentUserEntry.rank} ({currentUserEntry.divisionName})
                  </span>
                  <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 font-mono text-[9px] font-bold">
                    ▲ +{currentUserEntry.rankDelta} Delta
                  </span>
                  <span className="font-mono text-[10px] text-amber-300 font-bold hidden md:inline">
                    "{currentUserEntry.specialTitle}"
                  </span>
                </div>

                <div className="text-[10px] sm:text-[11px] font-mono text-muted-foreground truncate">
                  Qualified Prize:{" "}
                  <strong className="text-amber-300">{currentUserEntry.rankPrize}</strong> • Next
                  Season Perk:{" "}
                  <strong className="text-emerald-400">
                    +{currentUserEntry.nextSeasonXpBonusPct}% XP Boost
                  </strong>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              onClick={scrollToUserRow}
              className="font-mono text-xs font-black uppercase bg-amber-400 text-black hover:bg-amber-300 rounded-xl px-4 h-9 gap-1.5 shrink-0 shadow-md cursor-pointer"
            >
              Jump to My Rank <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* RAIDER PROFILE INSPECTION MODAL */}
      <RaiderProfileModal player={inspectingPlayer} onClose={() => setInspectingPlayer(null)} />
    </div>
  );
}

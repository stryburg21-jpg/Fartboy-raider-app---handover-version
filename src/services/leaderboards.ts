import {
  PRESTIGE_DIVISIONS,
  WEEKLY_SPRINT_REWARDS,
  type PrestigeDivisionConfig,
  type WeeklySprintRewardBracket,
} from "@/config/prestigeConfig";
import { CURRENT_SEASON, type LegacyCommemorativeBadge } from "@/config/seasons";
import { getActiveProfileData } from "@/services/profiles";
import { getCurrentPlayer, setMockPlayer } from "@/services/player";
import { awardActivityXP } from "@/services/xpEngine";
import { grantPackToPlayer } from "@/services/packs";
import { useGameStore } from "@/store/gameStore";
import type { Player, Title } from "@/types/game";
import { safeStorage } from "@/lib/storage";

export interface SeasonalLeaderboardEntry {
  playerId: string;
  discordId: string;
  displayName: string;
  avatarUrl: string;
  seasonId: number;
  seasonalLifetimeXP: number;
  currentDivision: string;
  currentRank: number;
  peakRank: number;
  updatedAt: string;
  isCurrentUser?: boolean;
}

export interface WeeklySprintEntry {
  playerId: string;
  discordId: string;
  displayName: string;
  avatarUrl: string;
  seasonId: number;
  weekNumber: number;
  weeklyXP: number;
  weeklyRank: number;
  claimedReward?: boolean;
  updatedAt: string;
  isCurrentUser?: boolean;
}

export interface RaidSquadEntry {
  squadId: string;
  squadName: string;
  tag: string;
  avatarUrl: string;
  memberCount: number;
  combinedLifetimeXP: number;
  rank: number;
  seasonId: number;
}

export interface LeaderboardStore {
  seasonId: number;
  currentWeekNumber: number;
  seasonalLeaderboard: Record<string, SeasonalLeaderboardEntry>;
  weeklyLeaderboard: Record<string, WeeklySprintEntry>;
  squadLeaderboard: Record<string, RaidSquadEntry>;
  weeklyHistory: Record<number, WeeklySprintEntry[]>;
  claimedWeeklyRewards: Record<number, boolean>;
  lastWeeklyResetTime: string;
  lastSeasonResetTime: string;
  legacyBadges: LegacyCommemorativeBadge[];
}

const STORAGE_KEY = "fartboy_leaderboard_engine_v1";

// Default Seed Mock Leaderboards
const INITIAL_SEED_PLAYERS: Array<{
  playerId: string;
  discordId: string;
  displayName: string;
  avatarUrl: string;
  lifetimeXP: number;
  weeklyXP: number;
}> = [
  {
    playerId: "p_top1",
    discordId: "SatoshiFart#0001",
    displayName: "SatoshiFart",
    avatarUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
    lifetimeXP: 485000,
    weeklyXP: 42000,
  },
  {
    playerId: "p_top2",
    discordId: "GigaChadtoshi#1337",
    displayName: "GigaChadtoshi",
    avatarUrl:
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&auto=format&fit=crop&q=80",
    lifetimeXP: 412000,
    weeklyXP: 38500,
  },
  {
    playerId: "p_top3",
    discordId: "GasLord_99#4200",
    displayName: "GasLord_99",
    avatarUrl:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    lifetimeXP: 378000,
    weeklyXP: 31000,
  },
  {
    playerId: "p_top4",
    discordId: "DegenSniper#7777",
    displayName: "DegenSniper",
    avatarUrl:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80",
    lifetimeXP: 325000,
    weeklyXP: 28000,
  },
  {
    playerId: "p_top5",
    discordId: "MemeKing_sol#6969",
    displayName: "MemeKing.sol",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
    lifetimeXP: 298000,
    weeklyXP: 24500,
  },
  {
    playerId: "p_top6",
    discordId: "CTO_Vanguard#1010",
    displayName: "CTO Vanguard",
    avatarUrl:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&auto=format&fit=crop&q=80",
    lifetimeXP: 260000,
    weeklyXP: 21000,
  },
  {
    playerId: "p_top7",
    discordId: "PepeRaidMaster#8888",
    displayName: "PepeRaidMaster",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80",
    lifetimeXP: 220000,
    weeklyXP: 18500,
  },
  {
    playerId: "p_top8",
    discordId: "SolanaRaider#0007",
    displayName: "SolanaRaider",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    lifetimeXP: 195000,
    weeklyXP: 16000,
  },
  {
    playerId: "p_top9",
    discordId: "FartboyPrime#1001",
    displayName: "Fartboy Prime",
    avatarUrl:
      "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=120&auto=format&fit=crop&q=80",
    lifetimeXP: 175000,
    weeklyXP: 14000,
  },
  {
    playerId: "p_top10",
    discordId: "VaporTrail_X#5555",
    displayName: "VaporTrail_X",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    lifetimeXP: 150000,
    weeklyXP: 12500,
  },
];

const INITIAL_SEED_SQUADS: RaidSquadEntry[] = [
  {
    squadId: "squad_genesis",
    squadName: "Genesis Raid Battalion",
    tag: "GRB",
    avatarUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
    memberCount: 24,
    combinedLifetimeXP: 1850000,
    rank: 1,
    seasonId: 1,
  },
  {
    squadId: "squad_solana",
    squadName: "Solana CTO Snipers",
    tag: "SNIPE",
    avatarUrl:
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&auto=format&fit=crop&q=80",
    memberCount: 18,
    combinedLifetimeXP: 1420000,
    rank: 2,
    seasonId: 1,
  },
  {
    squadId: "squad_memes",
    squadName: "Meme Lords Syndicate",
    tag: "MEME",
    avatarUrl:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    memberCount: 30,
    combinedLifetimeXP: 1150000,
    rank: 3,
    seasonId: 1,
  },
  {
    squadId: "squad_fartboy",
    squadName: "Fartboy Stench Cadets",
    tag: "GAS",
    avatarUrl:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80",
    memberCount: 12,
    combinedLifetimeXP: 820000,
    rank: 4,
    seasonId: 1,
  },
];

/**
 * Calculates current week number since Season 1 start date.
 */
export function getCurrentWeekNumber(): number {
  const start = new Date(CURRENT_SEASON.startDate).getTime();
  const now = Date.now();
  const diffDays = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  return Math.floor(diffDays / 7) + 1;
}

/**
 * Calculates time remaining until Sunday 00:00 UTC (Weekly Reset).
 */
export function getTimeUntilWeeklyReset(): { days: number; hours: number; minutes: number } {
  const now = new Date();
  const utcDay = now.getUTCDay(); // 0 = Sunday
  const daysUntilSunday = utcDay === 0 ? 7 : 7 - utcDay;

  const nextSunday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilSunday, 0, 0, 0),
  );

  const diffMs = Math.max(0, nextSunday.getTime() - now.getTime());
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}

/**
 * Calculates Prestige Division based strictly on rank and total players.
 */
export function calculatePrestigeDivision(
  rank: number,
  totalPlayers: number,
): PrestigeDivisionConfig {
  if (totalPlayers <= 0) return PRESTIGE_DIVISIONS[PRESTIGE_DIVISIONS.length - 1];

  const percentile = rank / totalPlayers;

  // 1. Eternal Fart Legend (Top 0.1%, Max 100 players)
  if (rank <= 100 && percentile <= 0.001) {
    return PRESTIGE_DIVISIONS[0]; // Eternal Fart Legend
  }

  // 2. Stench Warlord (Top 1%)
  if (percentile <= 0.01) {
    return PRESTIGE_DIVISIONS[1];
  }

  // 3. Raid Commander (Top 5%)
  if (percentile <= 0.05) {
    return PRESTIGE_DIVISIONS[2];
  }

  // 4. Vanguard Specialist (Top 15%)
  if (percentile <= 0.15) {
    return PRESTIGE_DIVISIONS[3];
  }

  // 5. Gas Cadet (Top 50%)
  if (percentile <= 0.5) {
    return PRESTIGE_DIVISIONS[4];
  }

  // 6. Unranked
  return PRESTIGE_DIVISIONS[5];
}

/**
 * Loads or initializes the Leaderboard Store from local persistence.
 */
export function getLeaderboardStore(): LeaderboardStore {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: LeaderboardStore = JSON.parse(raw);
      return parsed;
    }
  } catch (err) {
    console.error("Failed to load leaderboard store", err);
  }

  // Initialize fresh store
  const currentWeek = getCurrentWeekNumber();
  const store: LeaderboardStore = {
    seasonId: CURRENT_SEASON.seasonId,
    currentWeekNumber: currentWeek,
    seasonalLeaderboard: {},
    weeklyLeaderboard: {},
    squadLeaderboard: {},
    weeklyHistory: {},
    claimedWeeklyRewards: {},
    lastWeeklyResetTime: new Date().toISOString(),
    lastSeasonResetTime: new Date().toISOString(),
    legacyBadges: [],
  };

  // Populate Seed Data
  INITIAL_SEED_PLAYERS.forEach((seed, idx) => {
    store.seasonalLeaderboard[seed.playerId] = {
      playerId: seed.playerId,
      discordId: seed.discordId,
      displayName: seed.displayName,
      avatarUrl: seed.avatarUrl,
      seasonId: 1,
      seasonalLifetimeXP: seed.lifetimeXP,
      currentDivision: "Gas Cadet",
      currentRank: idx + 1,
      peakRank: idx + 1,
      updatedAt: new Date().toISOString(),
    };

    store.weeklyLeaderboard[seed.playerId] = {
      playerId: seed.playerId,
      discordId: seed.discordId,
      displayName: seed.displayName,
      avatarUrl: seed.avatarUrl,
      seasonId: 1,
      weekNumber: currentWeek,
      weeklyXP: seed.weeklyXP,
      weeklyRank: idx + 1,
      updatedAt: new Date().toISOString(),
    };
  });

  INITIAL_SEED_SQUADS.forEach((squad) => {
    store.squadLeaderboard[squad.squadId] = squad;
  });

  saveLeaderboardStore(store);
  return store;
}

export function saveLeaderboardStore(store: LeaderboardStore): void {
  try {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error("Failed to save leaderboard store", err);
  }
}

/**
 * Updates or inserts user's Seasonal & Weekly leaderboard entries based on active player profile data.
 * MUST be invoked whenever Lifetime XP increases.
 */
export function syncPlayerLeaderboards(addedXp: number = 0): {
  seasonalRank: number;
  weeklyRank: number;
  division: PrestigeDivisionConfig;
} {
  const store = getLeaderboardStore();
  const profile = getActiveProfileData();
  const player = profile.player;

  const playerId = player.id || "player_1";
  const displayName = player.name || "Fartboy Raider";
  const avatarUrl =
    player.avatarUrl ||
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80";
  const discordId = player.titles?.find((t) => t.equipped)?.name
    ? `${displayName} (${player.titles.find((t) => t.equipped)?.name})`
    : `${displayName}#1337`;

  const ltXp = player.lifetimeXP ?? player.xp ?? 0;

  // 1. UPDATE SEASONAL LEADERBOARD (LT-XP)
  const existingSeasonal = store.seasonalLeaderboard[playerId] || {
    playerId,
    discordId,
    displayName,
    avatarUrl,
    seasonId: CURRENT_SEASON.seasonId,
    seasonalLifetimeXP: 0,
    currentDivision: "Unranked",
    currentRank: 999,
    peakRank: 999,
    updatedAt: new Date().toISOString(),
  };

  existingSeasonal.seasonalLifetimeXP = ltXp;
  existingSeasonal.displayName = displayName;
  existingSeasonal.avatarUrl = avatarUrl;
  existingSeasonal.updatedAt = new Date().toISOString();
  existingSeasonal.isCurrentUser = true;

  store.seasonalLeaderboard[playerId] = existingSeasonal;

  // 2. UPDATE WEEKLY SPRINT LEADERBOARD
  const currentWeek = getCurrentWeekNumber();
  const existingWeekly = store.weeklyLeaderboard[playerId] || {
    playerId,
    discordId,
    displayName,
    avatarUrl,
    seasonId: CURRENT_SEASON.seasonId,
    weekNumber: currentWeek,
    weeklyXP: 0,
    weeklyRank: 999,
    updatedAt: new Date().toISOString(),
  };

  existingWeekly.weeklyXP += addedXp;
  existingWeekly.displayName = displayName;
  existingWeekly.avatarUrl = avatarUrl;
  existingWeekly.updatedAt = new Date().toISOString();
  existingWeekly.isCurrentUser = true;

  store.weeklyLeaderboard[playerId] = existingWeekly;

  // 3. RE-CALCULATE SEASONAL RANKS & DIVISIONS
  const sortedSeasonal = Object.values(store.seasonalLeaderboard).sort(
    (a, b) => b.seasonalLifetimeXP - a.seasonalLifetimeXP,
  );

  const totalPlayers = sortedSeasonal.length;
  let mySeasonalRank = totalPlayers;

  sortedSeasonal.forEach((entry, idx) => {
    const rank = idx + 1;
    entry.currentRank = rank;
    if (rank < entry.peakRank) entry.peakRank = rank;

    const div = calculatePrestigeDivision(rank, totalPlayers);
    entry.currentDivision = div.name;

    store.seasonalLeaderboard[entry.playerId] = entry;

    if (entry.playerId === playerId) {
      mySeasonalRank = rank;
    }
  });

  // 4. RE-CALCULATE WEEKLY RANKS
  const sortedWeekly = Object.values(store.weeklyLeaderboard).sort(
    (a, b) => b.weeklyXP - a.weeklyXP,
  );

  let myWeeklyRank = sortedWeekly.length;
  sortedWeekly.forEach((entry, idx) => {
    entry.weeklyRank = idx + 1;
    store.weeklyLeaderboard[entry.playerId] = entry;

    if (entry.playerId === playerId) {
      myWeeklyRank = entry.weeklyRank;
    }
  });

  // 5. UPDATE RAID SQUAD COMBINED XP
  if (store.squadLeaderboard["squad_fartboy"]) {
    store.squadLeaderboard["squad_fartboy"].combinedLifetimeXP += addedXp;
  }

  saveLeaderboardStore(store);

  const myDivision = calculatePrestigeDivision(mySeasonalRank, totalPlayers);

  return {
    seasonalRank: mySeasonalRank,
    weeklyRank: myWeeklyRank,
    division: myDivision,
  };
}

/**
 * Returns formatted rankings for the UI based on requested track.
 */
export function getLeaderboardRankings(
  track: "seasonal" | "weekly" | "squad",
): SeasonalLeaderboardEntry[] | WeeklySprintEntry[] | RaidSquadEntry[] {
  const store = getLeaderboardStore();

  if (track === "seasonal") {
    // Sync current user first
    syncPlayerLeaderboards(0);
    const reloaded = getLeaderboardStore();
    return Object.values(reloaded.seasonalLeaderboard).sort(
      (a, b) => a.currentRank - b.currentRank,
    );
  } else if (track === "weekly") {
    syncPlayerLeaderboards(0);
    const reloaded = getLeaderboardStore();
    return Object.values(reloaded.weeklyLeaderboard).sort((a, b) => a.weeklyRank - b.weeklyRank);
  } else {
    return Object.values(store.squadLeaderboard).sort((a, b) => a.rank - b.rank);
  }
}

/**
 * Claims weekly sprint reward for the current active player if available.
 */
export async function claimWeeklySprintReward(): Promise<{
  success: boolean;
  message: string;
  bracket?: WeeklySprintRewardBracket;
}> {
  const store = getLeaderboardStore();
  const currentWeek = store.currentWeekNumber;

  if (store.claimedWeeklyRewards[currentWeek]) {
    return { success: false, message: "Weekly sprint reward already claimed for this week." };
  }

  const playerId = (await getCurrentPlayer()).id || "player_1";
  const userEntry = store.weeklyLeaderboard[playerId];

  if (!userEntry || userEntry.weeklyRank > 100) {
    return {
      success: false,
      message: "Finish inside Rank 1-100 in Weekly Sprint to claim sprint rewards.",
    };
  }

  const rank = userEntry.weeklyRank;
  const bracket = WEEKLY_SPRINT_REWARDS.find((b) => rank >= b.minRank && rank <= b.maxRank);

  if (!bracket) {
    return { success: false, message: "No reward bracket found for your weekly rank." };
  }

  // Award XP via XP Engine
  if (bracket.xpReward > 0) {
    await awardActivityXP({
      activityType: "weekly_mission",
      customBaseXP: bracket.xpReward,
      note: `Weekly Sprint Rank ${rank} Reward`,
    });
  }

  // Grant Packs via Pack Engine
  if (bracket.packReward) {
    for (let i = 0; i < bracket.packReward.count; i++) {
      grantPackToPlayer(bracket.packReward.packId);
    }
  }

  // Grant Title
  if (bracket.titleReward) {
    const profile = getActiveProfileData();
    const existingTitles = profile.player.titles || [];
    if (!existingTitles.some((t) => t.id === bracket.titleReward?.id)) {
      const newTitle: Title = {
        id: bracket.titleReward.id,
        name: bracket.titleReward.name,
        equipped: false,
        unlocked: true,
        description: `Earned from Weekly Sprint Rank ${rank}`,
      };
      profile.player.titles = [...existingTitles, newTitle];
      useGameStore.getState().setPlayer({ ...profile.player });
    }
  }

  store.claimedWeeklyRewards[currentWeek] = true;
  saveLeaderboardStore(store);

  return {
    success: true,
    message: `Claimed Weekly Sprint Reward (${bracket.description})!`,
    bracket,
  };
}

/**
 * Resets the Weekly Sprint Leaderboard (Every Sunday 00:00 UTC).
 * Archives history and resets weekly XP counters.
 */
export function executeWeeklyReset(): { success: boolean; message: string } {
  const store = getLeaderboardStore();

  // Archive current week history
  const weekNum = store.currentWeekNumber;
  store.weeklyHistory[weekNum] = Object.values(store.weeklyLeaderboard);

  // Increment week number & reset weekly XP
  store.currentWeekNumber += 1;
  Object.keys(store.weeklyLeaderboard).forEach((pid) => {
    store.weeklyLeaderboard[pid].weeklyXP = 0;
    store.weeklyLeaderboard[pid].weekNumber = store.currentWeekNumber;
  });

  store.lastWeeklyResetTime = new Date().toISOString();
  saveLeaderboardStore(store);

  return {
    success: true,
    message: `Weekly Sprint Reset complete. Commenced Week ${store.currentWeekNumber}.`,
  };
}

/**
 * SOFT SEASON RESET LOGIC
 * Executed at end of 90-day Season.
 * Resets:
 * ❌ Spendable XP above 50,000 carry limit (converts excess to Legacy Commemorative Badges)
 * ❌ Weekly leaderboard
 * ❌ Seasonal leaderboard positions
 * ❌ Mission states
 * ❌ Contributor Pass tier
 * Persists:
 * ✅ Equipped items
 * ✅ Inventory
 * ✅ Cosmetics
 * ✅ Titles
 * ✅ Lifetime XP
 * ✅ Hall of Fame achievements
 */
export async function executeSeasonReset(): Promise<{
  success: boolean;
  message: string;
  badgeGranted?: LegacyCommemorativeBadge;
}> {
  const store = getLeaderboardStore();
  const profile = getActiveProfileData();
  const player = profile.player;

  const carryLimit = CURRENT_SEASON.spendableXpCarryLimit; // 50,000
  const currentSpendable = player.spendableXP ?? player.xp ?? 0;

  let excessBadge: LegacyCommemorativeBadge | undefined;

  // 1. Calculate Spendable XP Carry & Conversion
  if (currentSpendable > carryLimit) {
    const excess = currentSpendable - carryLimit;
    const badgeCount = Math.floor(excess / 100000);

    if (badgeCount > 0) {
      excessBadge = {
        id: `legacy_badge_s${CURRENT_SEASON.seasonId}_${Date.now()}`,
        seasonId: CURRENT_SEASON.seasonId,
        seasonName: CURRENT_SEASON.name,
        excessXpConverted: excess,
        badgeCount,
        grantedAt: new Date().toISOString(),
      };
      store.legacyBadges.push(excessBadge);
    }

    // Clamp spendable XP to carry limit
    player.spendableXP = carryLimit;
    player.xp = carryLimit;
  }

  // 2. Reset Weekly & Seasonal Leaderboard Counters
  Object.keys(store.weeklyLeaderboard).forEach((pid) => {
    store.weeklyLeaderboard[pid].weeklyXP = 0;
  });

  store.lastSeasonResetTime = new Date().toISOString();
  saveLeaderboardStore(store);

  // 3. Save Player & Sync Store
  setMockPlayer(player);
  profile.player = player;
  useGameStore.getState().setPlayer({ ...player });

  return {
    success: true,
    message: `Season Reset executed successfully. ${
      excessBadge
        ? `Converted excess Spendable XP into ${excessBadge.badgeCount}x Legacy Badges!`
        : "Spendable XP within carry limits."
    }`,
    badgeGranted: excessBadge,
  };
}

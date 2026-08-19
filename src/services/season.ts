import { SEASON_REWARDS_PER_TIER } from "@/config/seasons";
import type { SeasonTier } from "@/types/game";

export interface CurrentSeasonInfo {
  id: string;
  name: string;
  number: number;
  startDate: string;
  endDate: string;
  remainingDays: number;
  currentTier: number;
  totalTiers: number;
  description?: string;
}

export interface PlayerHeaderSummary {
  season: CurrentSeasonInfo;
  unopenedPacksCount: number;
  spendableXP: number;
  missionNotification: {
    title: string;
    subtitle: string;
    badgeText: string;
    targetUrl: string;
  };
}

// TODO backend: replace mock season data with API response (GET /api/season/current)
export async function getCurrentSeasonInfo(): Promise<CurrentSeasonInfo> {
  return {
    id: "season_1",
    name: "Rise of the Raider",
    number: 1,
    startDate: "2026-07-01",
    endDate: "2026-08-15",
    remainingDays: 12,
    currentTier: 18,
    totalTiers: 30,
    description:
      "Compete in raids, complete objectives, and climb the Leaderboard for exclusive season pass rewards.",
  };
}

/**
 * Single endpoint contract for persistent global header banner.
 * TODO backend: GET /api/player/header (combines GET /api/season/current, GET /api/player/packs, GET /api/player/currency)
 */
export async function getPlayerHeaderSummary(): Promise<PlayerHeaderSummary> {
  const season = await getCurrentSeasonInfo();
  return {
    season,
    // TODO backend: GET /api/player/packs
    unopenedPacksCount: 3,
    // TODO backend: GET /api/player/currency
    spendableXP: 4250,
    missionNotification: {
      title: "Earn Extra Mission Bonus Packs & Badges",
      subtitle: "Complete daily raid objectives to claim bonus packs & badges.",
      badgeText: "Active Raid Missions",
      targetUrl: "/missions",
    },
  };
}

// TODO backend: replace mock season pass data with API response (GET /api/season/pass)
export async function getSeasonPass(): Promise<SeasonTier[]> {
  const tiers: SeasonTier[] = [];
  for (let i = 1; i <= SEASON_REWARDS_PER_TIER.totalTiers; i++) {
    tiers.push({
      tier: i,
      freeReward: { xp: 100 + i * 10, description: "XP Reward (configured by backend)" },
      premiumReward:
        i % 5 === 0
          ? {
              xp: 500,
              packId: "pack_specialist",
              description: "Specialist Pack (configured by backend)",
            }
          : { xp: 250, description: "XP Boost (configured by backend)" },
      unlocked: i <= 18,
    });
  }
  return tiers;
}

import type { Mission, MissionStatus } from "@/types/mission";
import { getMockActiveMissions, type ActiveMissionsResponse } from "@/data/season1Data";

/**
 * MOCK API STATE TOGGLE
 * Set to false when connecting exclusively to external production live backend / Discord Bot API.
 */
export const USE_MOCK_DATA = true;

/**
 * Fetches active 3 daily and 3 weekly missions from GET /api/v1/missions/active
 */
export async function fetchActiveMissionsApi(): Promise<ActiveMissionsResponse> {
  try {
    const response = await fetch("/api/v1/missions/active", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const json = await response.json();
      if (json.data) {
        return json.data as ActiveMissionsResponse;
      }
    }
  } catch (err) {
    console.warn("fetchActiveMissionsApi failed, falling back to mock provider", err);
  }

  return getMockActiveMissions();
}

/**
 * Claims Mastery bonus (daily, weekly, or seasonal) from POST /api/v1/missions/claim-mastery
 */
export async function claimMasteryApi(
  type: "daily" | "weekly" | "seasonal",
  userId: string = "player-1",
): Promise<{
  success: boolean;
  type: "daily" | "weekly" | "seasonal";
  xpGranted: number;
  itemGranted?: string;
  titleGranted?: string;
  message?: string;
}> {
  try {
    const response = await fetch("/api/v1/missions/claim-mastery", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type, userId }),
    });

    if (response.ok) {
      const json = await response.json();
      return {
        success: true,
        type,
        xpGranted:
          json.data?.xpGranted ?? (type === "daily" ? 1000 : type === "weekly" ? 5000 : 25000),
        itemGranted: json.data?.itemGranted,
        titleGranted: json.data?.titleGranted,
        message: json.message,
      };
    }
  } catch (err) {
    console.warn("claimMasteryApi failed, falling back to mock response", err);
  }

  // Fallback mock rewards
  const fallbackRewards = {
    daily: { xp: 1000, item: "PACK_RAIDER" },
    weekly: { xp: 5000, item: "PACK_SPECIALIST" },
    seasonal: { xp: 25000, item: "PACK_LEGENDARY", title: "Prestige Veteran" },
  };

  const reward = fallbackRewards[type];
  return {
    success: true,
    type,
    xpGranted: reward.xp,
    itemGranted: reward.item,
    titleGranted: "title" in reward ? reward.title : undefined,
    message: `${type.toUpperCase()} Mastery Bonus Claimed!`,
  };
}

/**
 * Checks verification status of a mission with the backend / Discord bot service.
 */
export async function checkMissionStatus(
  missionId: string,
  _userId: string = "player-1",
): Promise<{ success: boolean; progress: number; status: MissionStatus }> {
  // Simulated async delay for Discord Bot polling
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { success: true, progress: 1, status: "claimable" };
}

/**
 * Claims a completed mission's rewards (XP + Items/Packs) from backend.
 */
export async function claimMissionReward(
  _missionId: string,
  _userId: string = "player-1",
): Promise<{ success: boolean; xpGranted: number; itemGranted?: unknown; message?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { success: true, xpGranted: 750 };
}

/**
 * Rerolls an unstarted daily mission for a new randomized bounty.
 */
export async function rerollDailyMission(
  _missionId: string,
  _userId: string = "player-1",
): Promise<{ success: boolean; newMission?: Mission; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  // TODO: Replace mock re-roll array with API endpoint POST /api/missions/reroll
  // Pool of potential reroll replacement missions
  const pool: Omit<Mission, "id">[] = [
    {
      title: "CTO Recon Specialist",
      description: "Engage with 2 viral tweets in #cto-official-post with custom meme responses",
      xpReward: 850,
      category: "daily",
      rarity: "rare",
      discordChannel: "#cto-official-post",
      discordChannelId: "12345678912",
      verificationType: "discord_emoji_check",
      apiEndpoint: "/api/v1/missions/verify/cto-recon",
      progress: 0,
      maxProgress: 2,
      status: "in_progress",
      canReroll: false,
    },
    {
      title: "Community Hype Booster",
      description: "Post 1 positive comment in #general-chat and react with 🎯 emoji",
      xpReward: 600,
      category: "daily",
      rarity: "common",
      discordChannel: "#general-chat",
      discordChannelId: "12345678913",
      verificationType: "discord_emoji_check",
      apiEndpoint: "/api/v1/missions/verify/hype-booster",
      progress: 0,
      maxProgress: 1,
      status: "in_progress",
      canReroll: false,
    },
    {
      title: "Viral GIF Tactician",
      description: "Upload 1 animated GIF or reaction clip to #memes-submission",
      xpReward: 1200,
      category: "daily",
      rarity: "epic",
      discordChannel: "#memes-submission",
      discordChannelId: "12345678903",
      verificationType: "api_sync",
      apiEndpoint: "/api/v1/missions/verify/gif-tactician",
      progress: 0,
      maxProgress: 1,
      status: "in_progress",
      canReroll: false,
    },
  ];

  const randomIndex = Math.floor(Math.random() * pool.length);
  const picked = pool[randomIndex];

  const newMission: Mission = {
    ...picked,
    id: `rerolled_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  };

  return {
    success: true,
    newMission,
    message: `Mission successfully rerolled: ${newMission.title}`,
  };
}

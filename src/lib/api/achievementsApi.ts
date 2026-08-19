import type { Achievement } from "@/types/game";
import { getSeason1MappedAchievements } from "@/data/season1Data";

export interface Season1AchievementsResponse {
  status: "success" | "error";
  seasonId: string;
  seasonName: string;
  meta: {
    totalAchievements: number;
    unlockedAchievements: number;
    completionPercentage: number;
    durationDays: number;
  };
  data: Achievement[];
}

/**
 * Fetches Season 1 achievements from GET /api/v1/achievements/season1
 */
export async function fetchSeason1AchievementsApi(): Promise<Achievement[]> {
  try {
    const response = await fetch("/api/v1/achievements/season1", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const json: Season1AchievementsResponse = await response.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn("fetchSeason1AchievementsApi failed, using mock data provider", err);
  }

  return getSeason1MappedAchievements();
}

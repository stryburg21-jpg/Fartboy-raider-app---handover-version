import type { Achievement } from "@/types/game";
import { getActiveProfileData, subscribeToProfileChanges } from "@/services/profiles";
import { getSeason1MappedAchievements } from "@/data/season1Data";
import { fetchSeason1AchievementsApi } from "@/lib/api/achievementsApi";

const defaultCatalogAchievements: Achievement[] = getSeason1MappedAchievements();

let achievementsCache: Achievement[] | null = null;

subscribeToProfileChanges(() => {
  achievementsCache = null;
});

/**
 * Fetches all achievements for Season 1, applying user profile unlock status
 */
export async function getAchievements(): Promise<Achievement[]> {
  if (!achievementsCache) {
    try {
      const apiAchievements = await fetchSeason1AchievementsApi();
      if (apiAchievements && apiAchievements.length > 0) {
        achievementsCache = apiAchievements;
      }
    } catch {
      // Fallback
    }

    if (!achievementsCache) {
      achievementsCache = defaultCatalogAchievements;
    }

    const profile = getActiveProfileData();
    const unlockedIds = new Set(profile.player.achievements || []);

    achievementsCache = achievementsCache.map((a) => {
      const isProfileUnlocked = unlockedIds.has(a.id);
      const isUnlocked = a.unlocked || isProfileUnlocked;
      return {
        ...a,
        unlocked: isUnlocked,
        state: isUnlocked ? ("completed" as const) : ("locked" as const),
      };
    });
  }

  return [...achievementsCache];
}

export async function getAllAchievements(): Promise<Achievement[]> {
  return getAchievements();
}

export async function getSeason1Achievements(): Promise<Achievement[]> {
  return fetchSeason1AchievementsApi();
}

export async function getPlayerUnlockedAchievements(_playerId?: string): Promise<Achievement[]> {
  const all = await getAchievements();
  return all.filter((a) => a.unlocked);
}

export async function getAchievementCategories(): Promise<string[]> {
  const all = await getAchievements();
  const categories = new Set(all.map((a) => a.category).filter(Boolean) as string[]);
  return Array.from(categories);
}

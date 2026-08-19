import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGameStore } from "./gameStore";
import { getCurrentPlayer } from "@/services/player";
import { getInventory } from "@/services/inventory";
import { getOwnedPacks } from "@/services/packs";
import { getMissions } from "@/services/missions";
import { getNotifications } from "@/services/notifications";
import { getSeasonPass } from "@/services/season";
import { getAchievements } from "@/services/achievements";
import { getCollectionProgress } from "@/services/collection";
import { getRecentActivity } from "@/services/activity";
import { getLatestRewards } from "@/services/rewards";

// Hydrates the global game store from mock services once the user is
// authenticated. Runs once per session.
//
// TODO(backend): Replace this parallel-fetch bootstrap with real API calls
// and consider streaming/refetching per slice (e.g. WebSocket updates for
// notifications, revalidation after mutations). The store shape should stay
// stable so components do not need changes.
export function GameStateProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const hydrated = useGameStore((s) => s.hydrated);
  const reset = useGameStore((s) => s.reset);

  useEffect(() => {
    if (status !== "authenticated" || hydrated) return;
    let cancelled = false;
    (async () => {
      const [
        player,
        inventory,
        packs,
        missions,
        notifications,
        season,
        achievements,
        collection,
        activity,
        rewards,
      ] = await Promise.all([
        getCurrentPlayer(),
        getInventory(),
        getOwnedPacks(),
        getMissions(),
        getNotifications(),
        getSeasonPass(),
        getAchievements(),
        getCollectionProgress(),
        getRecentActivity(),
        getLatestRewards(),
      ]);
      if (cancelled) return;
      const s = useGameStore.getState();
      s.setPlayer(player);
      s.setInventory(inventory);
      s.setPacks(packs);
      s.setMissions(missions);
      s.setNotifications(notifications);
      s.setSeason(season);
      s.setAchievements(achievements);
      s.setCollection(collection);
      s.setActivity(activity);
      s.setRewards(rewards);
      s.markHydrated();
    })();
    return () => {
      cancelled = true;
    };
  }, [status, hydrated]);

  useEffect(() => {
    if (status === "unauthenticated" && hydrated) reset();
  }, [status, hydrated, reset]);

  return <>{children}</>;
}

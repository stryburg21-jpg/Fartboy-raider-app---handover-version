import { create } from "zustand";
import { openPack as openPackService, grantPackToPlayer, getOwnedPacks } from "@/services/packs";
import { purchaseShopListing, type PurchaseItemResponse } from "@/services/shop";
import { VaultService } from "@/services/vault";
import {
  equipPlayerItem,
  unequipPlayerItem,
  getPlayerProfile,
  setMockPlayer,
} from "@/services/player";
import { upgradeItem, fuseItems, rerollCapeStats } from "@/services/forge";
import { getOnboardingStatus, completeOnboarding } from "@/services/onboarding";
import { setMockInventory } from "@/services/inventory";
import type {
  Achievement,
  EquipmentSlot,
  Item,
  ItemSet,
  Mission,
  Notification,
  Pack,
  Player,
  SeasonTier,
} from "@/types/game";
import type { ActivityEntry } from "@/services/activity";
import type { RewardEntry } from "@/services/rewards";

// Single global game state — the ONE source of truth for player-scoped data.
//
// TODO(backend): Every slice below currently loads from mock services in
// `src/services/*`. When wiring real APIs, replace the hydrator in
// `GameStateProvider` and the action bodies here — the slice shapes are the
// contract components rely on. Do NOT change field names without updating the
// components that read them.

export interface GameSettings {
  missionAlerts: boolean;
  raidPings: boolean;
}

export interface StreakStatus {
  count: number;
  bonusXPPercent: number;
  lastActiveDate: string;
}

export interface QuestMasteryProgress {
  dailyCompleted: number;
  dailyTotal: number;
  dailyRewardClaimed: boolean;
  weeklyCompleted: number;
  weeklyTotal: number;
  weeklyRewardClaimed: boolean;
}

export interface GameState {
  hydrated: boolean;
  // Slices
  player: Player | null;
  inventory: Item[];
  packs: Pack[];
  missions: Mission[];
  notifications: Notification[];
  season: SeasonTier[];
  achievements: Achievement[];
  collection: ItemSet[];
  activity: ActivityEntry[];
  rewards: RewardEntry[];
  settings: GameSettings;
  pendingLevelUp: number | null;
  streakStatus: StreakStatus;
  dailyResetTimer: string;
  questCompletionProgress: QuestMasteryProgress;

  // Tutorial Sandbox State
  isTutorialMode: boolean;
  sandboxXP: number;
  hasCompletedTutorial: boolean;

  // Tutorial & Sandbox Actions
  startTutorialSandbox: () => void;
  finishTutorialAndClaimReward: (payload?: {
    avatarId?: string;
    customAvatarUrl?: string;
  }) => Promise<{ rewardGranted: boolean; rewardMessage: string }>;
  cleanupTutorialAssets: () => void;

  // Setters (used by the hydrator)
  setPlayer: (p: Player | null) => void;
  setInventory: (items: Item[]) => void;
  setPacks: (packs: Pack[]) => void;
  setMissions: (missions: Mission[]) => void;
  setNotifications: (n: Notification[]) => void;
  setSeason: (tiers: SeasonTier[]) => void;
  setAchievements: (a: Achievement[]) => void;
  setCollection: (sets: ItemSet[]) => void;
  setActivity: (a: ActivityEntry[]) => void;
  setRewards: (r: RewardEntry[]) => void;
  setSettings: (patch: Partial<GameSettings>) => void;
  setStreakStatus: (s: Partial<StreakStatus>) => void;
  setDailyResetTimer: (t: string) => void;
  setQuestCompletionProgress: (p: Partial<QuestMasteryProgress>) => void;
  incrementStreak: () => void;
  clearLevelUp: () => void;
  markHydrated: () => void;
  reset: () => void;

  // Backend service-driven actions.
  // TODO(backend): each of these calls the corresponding API service and
  // reconciles returned server state into the store.
  equipItem: (slot: EquipmentSlot, itemId: string) => Promise<void>;
  unequipSlot: (slot: EquipmentSlot) => Promise<void>;
  markNotificationRead: (id: string) => void;
  addXp: (amount: number) => void;
  spendXp: (amount: number) => boolean;
  consumePack: (packId: string) => void;
  addItemsToInventory: (items: Item[]) => void;
  openPackAction: (packId: string) => Promise<Item[]>;
  purchaseListingAction: (listingId: string) => Promise<PurchaseItemResponse>;
  fetchVaultAction: () => Promise<void>;
  fetchPlayerAction: () => Promise<void>;
  upgradeItemAction: (itemId: string, targetLevel: number, costXP: number) => Promise<boolean>;
  fuseItemsAction: (baseItemId: string, sacrificeItemIds: string[]) => Promise<boolean>;
  rerollCapeStatsAction: (itemId: string, costXP: number) => Promise<boolean>;
}

const initial = {
  hydrated: false,
  player: null,
  inventory: [],
  packs: [],
  missions: [],
  notifications: [],
  season: [],
  achievements: [],
  collection: [],
  activity: [],
  rewards: [],
  settings: { missionAlerts: true, raidPings: true } as GameSettings,
  pendingLevelUp: null,
  streakStatus: { count: 5, bonusXPPercent: 10, lastActiveDate: "" },
  dailyResetTimer: "07h 12m",
  questCompletionProgress: {
    dailyCompleted: 2,
    dailyTotal: 3,
    dailyRewardClaimed: false,
    weeklyCompleted: 1,
    weeklyTotal: 5,
    weeklyRewardClaimed: false,
  },
  isTutorialMode: false,
  sandboxXP: 99999,
  hasCompletedTutorial: false,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initial,

  startTutorialSandbox: () => {
    set({
      isTutorialMode: true,
      sandboxXP: 99999,
    });
  },

  cleanupTutorialAssets: () => {
    const state = get();
    // Filter out any items in inventory tagged as tutorial asset or with id starting with item_tut_
    const cleanInventory = state.inventory.filter(
      (item) => !item.isTutorialAsset && !item.id.startsWith("item_tut_"),
    );

    const updatedEquipped = { ...(state.player?.equipped || {}) };
    if (state.player && updatedEquipped) {
      const tutorialItemIds = new Set(
        state.inventory.filter((i) => i.isTutorialAsset).map((i) => i.id),
      );
      let changed = false;
      for (const [slot, itemId] of Object.entries(updatedEquipped)) {
        if (itemId && (itemId.startsWith("item_tut_") || tutorialItemIds.has(itemId))) {
          delete updatedEquipped[slot as EquipmentSlot];
          changed = true;
        }
      }
      if (changed) {
        const updatedPlayer = { ...state.player, equipped: updatedEquipped };
        set({ player: updatedPlayer });
        setMockPlayer(updatedPlayer);
      }
    }

    set({ inventory: cleanInventory });
    setMockInventory(cleanInventory);
  },

  finishTutorialAndClaimReward: async (payload) => {
    const store = get();
    const onboardingStatus = await getOnboardingStatus();
    const alreadyCompleted =
      onboardingStatus.hasCompletedTutorial ||
      onboardingStatus.completed ||
      store.hasCompletedTutorial ||
      store.player?.hasCompletedTutorial;

    let rewardGranted = false;
    let rewardMessage = "";

    if (!alreadyCompleted) {
      rewardGranted = true;
      rewardMessage =
        "🎁 Onboarding Reward Claimed: 1x Real Supply Pack & +1,000 Real SP-XP added to permanent profile!";

      // Add 1,000 Real SP-XP directly to profile balance
      const currentRealPlayer = store.player;
      if (currentRealPlayer) {
        const newSpXp = (currentRealPlayer.spendableXP ?? currentRealPlayer.xp) + 1000;
        const newLtXp = (currentRealPlayer.lifetimeXP ?? currentRealPlayer.xp) + 1000;
        const updatedRealPlayer: Player = {
          ...currentRealPlayer,
          spendableXP: newSpXp,
          lifetimeXP: newLtXp,
          xp: newSpXp,
          hasCompletedTutorial: true,
        };
        set({ player: updatedRealPlayer });
        setMockPlayer(updatedRealPlayer);
      }

      // Grant 1x Real Starter Supply Pack to vault
      grantPackToPlayer("pack_starter");
      const updatedOwnedPacks = await getOwnedPacks();
      set({ packs: updatedOwnedPacks });
    } else {
      rewardGranted = false;
      rewardMessage = "Tutorial completed! (One-time reward was claimed during your first run)";
    }

    // Persist onboarding completion status
    await completeOnboarding(payload);

    // Update store state
    set({
      hasCompletedTutorial: true,
      isTutorialMode: false,
    });

    // Strip all tutorial assets from inventory and loadout
    get().cleanupTutorialAssets();

    return { rewardGranted, rewardMessage };
  },

  setPlayer: (player) => set({ player }),
  setInventory: (inventory) => set({ inventory }),
  setPacks: (packs) => set({ packs }),
  setMissions: (missions) => set({ missions }),
  setNotifications: (notifications) => set({ notifications }),
  setSeason: (season) => set({ season }),
  setAchievements: (achievements) => set({ achievements }),
  setCollection: (collection) => set({ collection }),
  setActivity: (activity) => set({ activity }),
  setRewards: (rewards) => set({ rewards }),
  setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
  setStreakStatus: (patch) => set((s) => ({ streakStatus: { ...s.streakStatus, ...patch } })),
  setDailyResetTimer: (t) => set({ dailyResetTimer: t }),
  setQuestCompletionProgress: (patch) =>
    set((s) => ({ questCompletionProgress: { ...s.questCompletionProgress, ...patch } })),
  incrementStreak: () =>
    set((s) => {
      const nextCount = s.streakStatus.count + 1;
      return {
        streakStatus: {
          ...s.streakStatus,
          count: nextCount,
          bonusXPPercent: Math.min(25, 10 + Math.floor(nextCount / 5) * 5),
        },
      };
    }),
  clearLevelUp: () => set({ pendingLevelUp: null }),
  markHydrated: () => set({ hydrated: true }),
  reset: () => set({ ...initial }),

  equipItem: async (slot, itemId) => {
    // Call backend service contract: POST /api/player/equip
    const res = await equipPlayerItem(slot, itemId);
    if (res.success) {
      set({ player: res.updatedPlayer, inventory: res.updatedInventory });
    }
  },

  unequipSlot: async (slot) => {
    // Call backend service contract: POST /api/player/unequip
    const res = await unequipPlayerItem(slot);
    if (res.success) {
      set({ player: res.updatedPlayer, inventory: res.updatedInventory });
    }
  },

  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  addXp: (amount) =>
    set((s) => {
      if (s.isTutorialMode) {
        return { sandboxXP: Math.max(0, s.sandboxXP + amount) };
      }
      if (!s.player) return s;
      if (amount >= 0) {
        const nextLifetime = (s.player.lifetimeXP ?? s.player.xp) + amount;
        const nextSpendable = (s.player.spendableXP ?? s.player.xp) + amount;
        const xpPerLevel = s.player.xpToNext || 1500;
        const calculatedLevel = Math.max(s.player.level, Math.floor(nextLifetime / xpPerLevel) + 1);
        const didLevelUp = calculatedLevel > s.player.level;

        return {
          pendingLevelUp: didLevelUp ? calculatedLevel : s.pendingLevelUp,
          player: {
            ...s.player,
            level: calculatedLevel,
            lifetimeXP: nextLifetime,
            spendableXP: nextSpendable,
            xp: nextSpendable,
          },
        };
      } else {
        const cost = Math.abs(amount);
        const currentSpendable = s.player.spendableXP ?? s.player.xp;
        const nextSpendable = Math.max(0, currentSpendable - cost);
        return {
          player: {
            ...s.player,
            spendableXP: nextSpendable,
            xp: nextSpendable,
          },
        };
      }
    }),

  spendXp: (amount) => {
    const state = get();
    if (state.isTutorialMode) {
      set((s) => ({ sandboxXP: Math.max(0, s.sandboxXP - amount) }));
      return true;
    }
    const current = state.player;
    if (!current) return false;
    const available = current.spendableXP ?? current.xp;
    if (available < amount) return false;
    set((s) => {
      if (!s.player) return s;
      const nextSpendable = (s.player.spendableXP ?? s.player.xp) - amount;
      return {
        player: {
          ...s.player,
          spendableXP: nextSpendable,
          xp: nextSpendable,
        },
      };
    });
    return true;
  },

  consumePack: (packId) =>
    set((s) => {
      const idx = s.packs.findIndex((p) => p.id === packId);
      if (idx < 0) return s;
      const next = s.packs.slice();
      next.splice(idx, 1);
      return { packs: next };
    }),

  addItemsToInventory: (items) =>
    set((s) => {
      const existing = new Set(s.inventory.map((i) => i.id));
      const merged = [...s.inventory, ...items.filter((i) => !existing.has(i.id))];
      return { inventory: merged };
    }),

  openPackAction: async (packId) => {
    // Call backend service contract: POST /api/packs/open
    const res = await openPackService(packId);
    if (res.success) {
      set({
        player: res.updatedPlayer,
        inventory: res.updatedInventory,
        packs: res.unopenedPacks,
        collection: res.updatedCollection,
      });
      return res.rewards;
    }
    return [];
  },

  purchaseListingAction: async (listingId) => {
    // Call backend service contract: POST /api/shop/purchase-pack or POST /api/shop/purchase
    const currentPlayer = get().player;
    const res = await purchaseShopListing(listingId, currentPlayer?.id ?? "player_001");
    if (res.success) {
      if (res.updatedPlayer) {
        set({ player: res.updatedPlayer });
      }
      if (res.newlyOwnedPacks) {
        set({ packs: [...get().packs, ...res.newlyOwnedPacks] });
      }
      if (res.updatedInventory) {
        set({ inventory: res.updatedInventory });
      }
    }
    return res;
  },

  fetchVaultAction: async () => {
    // Call backend service contract: GET /api/vault
    const vault = await VaultService.getVault();
    set({
      packs: vault.unopenedPacks,
      inventory: vault.ownedItems,
      collection: vault.collectionProgress,
    });
  },

  fetchPlayerAction: async () => {
    // Call backend service contract: GET /api/player/profile
    const p = await getPlayerProfile();
    set({ player: p });
  },

  upgradeItemAction: async (itemId, targetLevel, costXP) => {
    // Call backend service contract: POST /api/forge/upgrade
    const res = await upgradeItem(itemId, targetLevel, costXP);
    if (res.success) {
      if (res.updatedPlayer) set({ player: res.updatedPlayer });
      if (res.updatedInventory) set({ inventory: res.updatedInventory });
      return true;
    }
    return false;
  },

  fuseItemsAction: async (baseItemId, sacrificeItemIds) => {
    // Call backend service contract: POST /api/forge/fuse
    const res = await fuseItems(baseItemId, sacrificeItemIds);
    if (res.success) {
      if (res.updatedPlayer) set({ player: res.updatedPlayer });
      if (res.updatedInventory) set({ inventory: res.updatedInventory });
      return true;
    }
    return false;
  },

  rerollCapeStatsAction: async (itemId, costXP) => {
    // Call backend service contract: POST /api/forge/reroll
    const res = await rerollCapeStats(itemId, costXP);
    if (res.success) {
      if (res.updatedPlayer) set({ player: res.updatedPlayer });
      if (res.updatedInventory) set({ inventory: res.updatedInventory });
      return true;
    }
    return false;
  },
}));

import { create } from "zustand";
import defaultData from "@/data/dailyMissionsData.json";
import {
  fetchMissionsPayload,
  claimDailyMasteryBonus,
  handleVerifyMission as verifyApi,
  completeAutomatedMission,
  type AutomatedMissionPayload,
  type AutomatedMissionItem,
} from "@/services/automatedMissionsApi";
import { rerollDailyMission } from "@/lib/api/missionsApi";
import { useGameStore } from "@/store/gameStore";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { safeStorage } from "@/lib/storage";

const STORAGE_KEY_UNSEALED = "fartboy_daily_bounty_unsealed_date";
const STORAGE_KEY_REROLLS = "fartboy_daily_rerolls_left_v2";

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function checkIsUnsealed(): boolean {
  try {
    const savedDate = safeStorage.getItem(STORAGE_KEY_UNSEALED);
    return savedDate === getTodayStr();
  } catch {
    return false;
  }
}

function getInitialRerolls(): number {
  try {
    const saved = safeStorage.getItem(STORAGE_KEY_REROLLS);
    if (saved !== null) return parseInt(saved, 10);
  } catch {
    // fallback
  }
  return defaultData.rerollsRemaining ?? 1;
}

export interface DailyMissionsState {
  isDailyUnsealed: boolean;
  rerollsRemaining: number;
  payload: AutomatedMissionPayload | null;
  isRerolling: boolean;
  showGoldFlash: boolean;
  claimingMastery: boolean;
  lastRewardModal: {
    open: boolean;
    title: string;
    xpEarned: number;
    packGranted?: string;
  } | null;

  // Actions
  unsealDailyPacks: () => void;
  fetchPayload: () => Promise<void>;
  rerollFeatured: () => Promise<boolean>;
  claimDailyMastery: () => Promise<void>;
  verifyMission: (id: string) => Promise<void>;
  claimMissionReward: (id: string) => Promise<void>;
  closeRewardModal: () => void;
  updatePayload: (p: AutomatedMissionPayload) => void;
  devResetDailyState: () => void;
  devSetMasteryReady: () => void;
}

export const useDailyMissionsStore = create<DailyMissionsState>((set, get) => ({
  isDailyUnsealed: checkIsUnsealed(),
  rerollsRemaining: getInitialRerolls(),
  payload: null,
  isRerolling: false,
  showGoldFlash: false,
  claimingMastery: false,
  lastRewardModal: null,

  unsealDailyPacks: () => {
    try {
      safeStorage.setItem(STORAGE_KEY_UNSEALED, getTodayStr());
    } catch (err) {
      console.error("Failed saving unsealed date", err);
    }
    set({ isDailyUnsealed: true });
  },

  fetchPayload: async () => {
    try {
      const p = await fetchMissionsPayload();

      // Ensure daily category has bounties from defaultData if empty or missing
      const dailyCat = p.categories.find((c) => c.id === "daily");
      if (dailyCat && dailyCat.missions.length === 0) {
        dailyCat.missions = defaultData.bounties as unknown as AutomatedMissionItem[];
      }

      set({ payload: p });
    } catch (err) {
      console.error("Error fetching missions payload", err);
    }
  },

  rerollFeatured: async () => {
    const { rerollsRemaining, isRerolling, payload } = get();
    if (rerollsRemaining <= 0 || isRerolling || !payload) {
      toast.error("No free rerolls remaining today!");
      return false;
    }

    const dailyCat = payload.categories.find((c) => c.id === "daily");
    if (!dailyCat || dailyCat.missions.length === 0) return false;

    const featured = dailyCat.missions.slice(0, 3);
    const uncompleted = featured.find((m) => m.status !== "claimed" && m.status !== "verified");
    if (!uncompleted) {
      toast.info("All featured missions are already completed!");
      return false;
    }

    set({ isRerolling: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const res = await rerollDailyMission(uncompleted.id);
      if (res.success && res.newMission) {
        const nextRerolls = Math.max(0, rerollsRemaining - 1);
        try {
          safeStorage.setItem(STORAGE_KEY_REROLLS, nextRerolls.toString());
        } catch {
          // ignore
        }

        const updatedCategories = payload.categories.map((cat) => {
          if (cat.id !== "daily") return cat;
          const updatedMissions = cat.missions.map((m) => {
            if (m.id === uncompleted.id) {
              return {
                ...res.newMission!,
                roomTag: res.newMission!.discordChannel || "#daily-quests",
                actionRequirements: res.newMission!.description || res.newMission!.title,
                completedCount: 0,
                totalRequired: res.newMission!.maxProgress || 1,
                progress: 0,
                status: "unstarted" as const,
                discordUrl: "https://discord.gg/fartboy",
              };
            }
            return m;
          });
          return { ...cat, missions: updatedMissions };
        });

        const newPayload = { ...payload, categories: updatedCategories };
        set({
          rerollsRemaining: nextRerolls,
          payload: newPayload,
          showGoldFlash: true,
        });

        setTimeout(() => set({ showGoldFlash: false }), 1400);

        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#F59E0B", "#FCD34D", "#FEF08A", "#10B981"],
        });

        toast.success(`🎲 Featured Pack Rerolled! New mission: "${res.newMission.title}"`);
        return true;
      } else {
        toast.error(res.message || "Failed to reroll featured mission.");
        return false;
      }
    } catch (err) {
      console.error("Error rerolling featured mission", err);
      toast.error("Failed requesting reroll.");
      return false;
    } finally {
      set({ isRerolling: false });
    }
  },

  claimDailyMastery: async () => {
    const { claimingMastery } = get();
    if (claimingMastery) return;
    set({ claimingMastery: true });
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#F59E0B", "#10B981", "#3B82F6", "#F43F5E"],
      });

      const res = await claimDailyMasteryBonus();
      if (res.success) {
        set({
          payload: res.updatedPayload,
          lastRewardModal: {
            open: true,
            title: "DAILY MISSION MASTERY UNLOCKED!",
            xpEarned: 1000,
            packGranted: "Raider Pack",
          },
        });
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error("Error claiming daily mastery", err);
    } finally {
      set({ claimingMastery: false });
    }
  },

  verifyMission: async (id: string) => {
    try {
      const res = await verifyApi(id);
      if (res.success) {
        toast.success(res.message);
        set({ payload: res.updatedPayload });
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error("Error verifying mission", err);
    }
  },

  claimMissionReward: async (id: string) => {
    try {
      const res = await completeAutomatedMission(id);
      if (res.success) {
        toast.success(res.message);
        set({
          payload: res.updatedPayload,
          lastRewardModal: {
            open: true,
            title: "MISSION COMPLETED & REWARD CLAIMED!",
            xpEarned: res.xpEarned,
            packGranted: res.packGranted,
          },
        });
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error("Error claiming mission reward", err);
    }
  },

  closeRewardModal: () => set({ lastRewardModal: null }),

  updatePayload: (p: AutomatedMissionPayload) => set({ payload: p }),

  devResetDailyState: () => {
    try {
      safeStorage.removeItem(STORAGE_KEY_UNSEALED);
      safeStorage.setItem(STORAGE_KEY_REROLLS, "1");
    } catch (err) {
      console.error("Failed clearing dev storage", err);
    }

    const currentPayload = get().payload;
    if (currentPayload) {
      const updatedCategories = currentPayload.categories.map((cat) => {
        if (cat.id !== "daily") return cat;
        const resetMissions = cat.missions.map((m) => ({
          ...m,
          status: "unstarted" as const,
          completedCount: 0,
          progress: 0,
        }));
        return { ...cat, missions: resetMissions };
      });

      set({
        isDailyUnsealed: false,
        rerollsRemaining: 1,
        payload: {
          ...currentPayload,
          dailyMastery: {
            completedCount: 0,
            totalRequired: 3,
            claimed: false,
          },
          categories: updatedCategories,
        },
      });
    } else {
      set({
        isDailyUnsealed: false,
        rerollsRemaining: 1,
      });
    }

    toast.success("🧪 DEV RESET: Daily Mission Mastery resealed & progress reset!");
  },

  devSetMasteryReady: () => {
    try {
      safeStorage.setItem(STORAGE_KEY_UNSEALED, getTodayStr());
    } catch (err) {
      console.error("Failed setting unsealed state in storage", err);
    }

    const currentPayload = get().payload;
    if (currentPayload) {
      const updatedCategories = currentPayload.categories.map((cat) => {
        if (cat.id !== "daily") return cat;
        const verifiedMissions = cat.missions.map((m) => ({
          ...m,
          status: "verified" as const,
          completedCount: m.totalRequired || 1,
          progress: m.totalRequired || 1,
        }));
        return { ...cat, missions: verifiedMissions };
      });

      set({
        isDailyUnsealed: true,
        payload: {
          ...currentPayload,
          dailyMastery: {
            completedCount: 3,
            totalRequired: 3,
            claimed: false,
          },
          categories: updatedCategories,
        },
      });
    } else {
      set({ isDailyUnsealed: true });
    }

    toast.success("⚡ DEV: Daily Mission Mastery set to 3/3 ready to claim!");
  },
}));

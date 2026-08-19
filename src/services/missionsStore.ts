import { create } from "zustand";
import initialMissionsData from "@/data/missionsData.json";
import { useGameStore } from "@/store/gameStore";
import { grantPackToPlayer, getOwnedPacks } from "@/services/packs";
import { audio } from "@/services/audio";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import type { AutomatedMissionItem } from "@/services/automatedMissionsApi";
import { safeStorage } from "@/lib/storage";

const STORAGE_KEY = "fartboy_missions_state_v2";

export interface MissionsStoreState {
  missions: AutomatedMissionItem[];
  rerollsLeft: number;
  isLoading: boolean;

  // Reactive State Actions (Developer Ready & Swappable for API Calls)
  loadMissions: () => void;
  claimMission: (id: string) => Promise<{
    success: boolean;
    title: string;
    xpEarned: number;
    packGranted?: string;
  }>;
  claimAllCompleted: () => Promise<{
    success: boolean;
    totalClaimed: number;
    totalXpEarned: number;
    packsGranted: string[];
    message: string;
  }>;
  deployMission: (id: string) => void;
  rerollMission: (id: string) => Promise<boolean>;
  resetToDefaults: () => void;
}

function loadInitialState(): AutomatedMissionItem[] {
  try {
    const saved = safeStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed loading saved missions state", err);
  }
  return initialMissionsData as unknown as AutomatedMissionItem[];
}

function persistState(missions: AutomatedMissionItem[]) {
  try {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
  } catch (err) {
    console.error("Failed saving missions state", err);
  }
}

export const useMissionsStore = create<MissionsStoreState>((set, get) => ({
  missions: loadInitialState(),
  rerollsLeft: 1,
  isLoading: false,

  loadMissions: () => {
    set({ missions: loadInitialState() });
  },

  claimMission: async (id: string) => {
    const state = get();
    const mission = state.missions.find((m) => m.id === id);
    if (!mission) {
      return { success: false, title: "Unknown Mission", xpEarned: 0 };
    }

    if (mission.status === "claimed") {
      return { success: false, title: mission.title, xpEarned: 0 };
    }

    const xpToAward = mission.xpReward || mission.baseRewardXP || mission.xpBounty || 500;
    let packGranted: string | undefined = undefined;

    // 1. Update Game Store (XP & Packs)
    const gameStore = useGameStore.getState();
    gameStore.addXp(xpToAward);

    if (mission.itemReward && mission.itemReward.toLowerCase().includes("pack")) {
      const packId = mission.itemReward.toLowerCase().includes("specialist")
        ? "specialist_pack"
        : "raider_pack";
      const pack = grantPackToPlayer(packId);
      packGranted = pack.name;
      const owned = await getOwnedPacks();
      gameStore.setPacks(owned);
    }

    // 2. Transition State: Mark as claimed, completed count = maxProgress
    const updatedMissions = state.missions.map((m) => {
      if (m.id === id) {
        const total = m.maxProgress || m.totalRequired || 1;
        return {
          ...m,
          status: "claimed" as const,
          progress: total,
          completedCount: total,
        };
      }
      return m;
    });

    persistState(updatedMissions);
    set({ missions: updatedMissions });

    // 3. Audio & Visual Celebration
    audio.play("mission.complete");
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#F59E0B", "#10B981", "#3B82F6", "#EC4899"],
    });

    toast.success(`🎉 Mission Claimed: "${mission.title}"! +${xpToAward.toLocaleString()} XP`);

    return {
      success: true,
      title: mission.title,
      xpEarned: xpToAward,
      packGranted,
    };
  },

  claimAllCompleted: async () => {
    const state = get();
    const claimable = state.missions.filter((m) => {
      const total = m.maxProgress || m.totalRequired || 1;
      const count = m.progress !== undefined ? m.progress : m.completedCount || 0;
      return m.status === "claimable" || (count >= total && m.status !== "claimed");
    });

    if (claimable.length === 0) {
      return {
        success: false,
        totalClaimed: 0,
        totalXpEarned: 0,
        packsGranted: [],
        message: "No completed rewards ready to claim.",
      };
    }

    let totalXpEarned = 0;
    const packsGranted: string[] = [];
    const claimableIds = new Set(claimable.map((m) => m.id));

    const gameStore = useGameStore.getState();

    claimable.forEach((m) => {
      const xp = m.xpReward || m.baseRewardXP || m.xpBounty || 500;
      totalXpEarned += xp;

      if (m.itemReward && m.itemReward.toLowerCase().includes("pack")) {
        const packId = m.itemReward.toLowerCase().includes("specialist")
          ? "specialist_pack"
          : "raider_pack";
        const pack = grantPackToPlayer(packId);
        packsGranted.push(pack.name);
      }
    });

    // Update global game store XP & packs
    gameStore.addXp(totalXpEarned);
    const owned = await getOwnedPacks();
    gameStore.setPacks(owned);

    // Transition all claimable to "claimed"
    const updatedMissions = state.missions.map((m) => {
      if (claimableIds.has(m.id)) {
        const total = m.maxProgress || m.totalRequired || 1;
        return {
          ...m,
          status: "claimed" as const,
          progress: total,
          completedCount: total,
        };
      }
      return m;
    });

    persistState(updatedMissions);
    set({ missions: updatedMissions });

    audio.play("mission.complete");
    confetti({
      particleCount: 180,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#A855F7"],
    });

    const msg = `Claimed ${claimable.length} directives! Earned +${totalXpEarned.toLocaleString()} XP${
      packsGranted.length > 0 ? ` & ${packsGranted.length} pack(s)` : ""
    }!`;
    toast.success(msg);

    return {
      success: true,
      totalClaimed: claimable.length,
      totalXpEarned,
      packsGranted,
      message: msg,
    };
  },

  deployMission: (id: string) => {
    const state = get();
    const mission = state.missions.find((m) => m.id === id);
    if (!mission) return;

    // Simulate progress if not yet completed
    if (mission.status === "unstarted" || mission.status === "in_progress") {
      const current = mission.progress || mission.completedCount || 0;
      const total = mission.maxProgress || mission.totalRequired || 1;
      const nextProgress = Math.min(total, current + 1);
      const isNowClaimable = nextProgress >= total;

      const updatedMissions = state.missions.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            progress: nextProgress,
            completedCount: nextProgress,
            status: isNowClaimable ? ("claimable" as const) : ("in_progress" as const),
          };
        }
        return m;
      });

      persistState(updatedMissions);
      set({ missions: updatedMissions });

      if (isNowClaimable) {
        toast.info(`🎯 Objective Completed: "${mission.title}"! Ready to claim bounty.`);
      }
    }

    // Open target URL
    const url = mission.externalUrl || mission.discordUrl;
    if (url) {
      if (url.startsWith("http")) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    }
  },

  rerollMission: async (id: string) => {
    const state = get();
    if (state.rerollsLeft <= 0) {
      toast.error("No rerolls remaining today.");
      return false;
    }

    const mission = state.missions.find((m) => m.id === id);
    if (!mission || mission.status === "claimed" || mission.status === "claimable") {
      return false;
    }

    const rerollOptions = [
      {
        title: "Community Vanguard Rally",
        description: "Participate in 2 discussions in #general-chat.",
        targetChannel: "#general-chat",
        categoryLabel: "COMMUNITY OPS",
        xpBounty: 650,
      },
      {
        title: "Memetic Amplification",
        description: "Post 1 viral meme in #fartboy-memes.",
        targetChannel: "#fartboy-memes",
        categoryLabel: "MEME SQUAD",
        xpBounty: 500,
      },
      {
        title: "Clip Curator Recon",
        description: "Watch and like 2 clips in #community-clips.",
        targetChannel: "#community-clips",
        categoryLabel: "CLIPS STUDIO",
        xpBounty: 600,
      },
    ];

    const pick = rerollOptions[Math.floor(Math.random() * rerollOptions.length)];

    const updatedMissions = state.missions.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          title: pick.title,
          description: pick.description,
          targetChannel: pick.targetChannel,
          discordChannel: pick.targetChannel,
          categoryLabel: pick.categoryLabel,
          xpBounty: pick.xpBounty,
          baseRewardXP: pick.xpBounty,
          xpReward: pick.xpBounty,
          progress: 0,
          completedCount: 0,
          status: "unstarted" as const,
        };
      }
      return m;
    });

    persistState(updatedMissions);
    set({
      missions: updatedMissions,
      rerollsLeft: Math.max(0, state.rerollsLeft - 1),
    });

    audio.play("card.flip");
    toast.success(`🎲 Rerolled! New bounty: "${pick.title}"`);
    return true;
  },

  resetToDefaults: () => {
    safeStorage.removeItem(STORAGE_KEY);
    set({
      missions: initialMissionsData as unknown as AutomatedMissionItem[],
      rerollsLeft: 1,
    });
    toast.info("Missions state reset to default.");
  },
}));

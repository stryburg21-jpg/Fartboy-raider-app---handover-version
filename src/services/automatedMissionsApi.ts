import mockData from "@/data/mockMissionsData.json";
import { useGameStore } from "@/store/gameStore";
import { grantPackToPlayer, getOwnedPacks } from "@/services/packs";
import { claimMasteryApi } from "@/lib/api/missionsApi";
import { safeStorage } from "@/lib/storage";

export interface MissionDossier {
  dossierNumber: string;
  dept: string;
  title: string;
  targetChannel: string;
  externalUrl: string;
  actionButtonText: string;
  xpBounty: number;
  itemReward?: string;
  rarity: string;
  brief: {
    step1: string;
    step2: string;
    step3: string;
  };
  verificationType: string;
  verificationNote: string;
}

export interface AutomatedMissionItem {
  id: string;
  dossierNumber?: string;
  dept?: string;
  title: string;
  targetChannel?: string;
  externalUrl?: string;
  actionButtonText?: string;
  xpBounty?: number;
  description?: string;
  roomTag: string;
  actionRequirements: string;
  baseRewardXP: number;
  xpReward?: number;
  itemReward?: string;
  rewardText?: string;
  multiplierText?: string;
  dailyCap?: number;
  completedCount: number;
  totalRequired: number;
  progress?: number;
  maxProgress?: number;
  category?: "daily" | "weekly" | "milestones";
  rarity?:
    "common" | "rare" | "epic" | "legendary" | "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | string;
  discordChannel?: string;
  discordChannelId?: string;
  verificationType?: "discord_emoji_check" | "api_sync" | "manual" | string;
  apiEndpoint?: string;
  currentXP?: number;
  maxXp?: number;
  status:
    | "unstarted"
    | "in_progress"
    | "pending_bot_sync"
    | "claimable"
    | "claimed"
    | "not_started"
    | "verifying"
    | "verified";
  discordUrl: string;
  note?: string;
  rules?: string[];
  brief?: {
    step1: string;
    step2: string;
    step3: string;
  };
  verificationNote?: string;
  dossier?: MissionDossier;
}

export interface AutomatedMissionCategory {
  id: "daily" | "weekly" | "milestones";
  label: string;
  roomTag: string;
  missions: AutomatedMissionItem[];
}

export interface AutomatedMissionPayload {
  dailyMastery: {
    completedCount: number;
    totalRequired: number;
    rewardCallout: string;
    claimed?: boolean;
  };
  weeklyMastery: {
    completedCount: number;
    totalRequired: number;
    rewardCallout: string;
    claimed?: boolean;
  };
  summary: {
    spendableXP: number;
  };
  categories: AutomatedMissionCategory[];
}

const MISSIONS_STORAGE_KEY = "fartboy_missions_payload_v4";

function getStoredPayload(): AutomatedMissionPayload {
  try {
    const raw = safeStorage.getItem(MISSIONS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed loading stored missions payload", err);
  }
  return JSON.parse(JSON.stringify(mockData)) as AutomatedMissionPayload;
}

function saveStoredPayload(payload: AutomatedMissionPayload): void {
  try {
    safeStorage.setItem(MISSIONS_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error("Failed saving missions payload", err);
  }
}

function syncStoreMasteryProgress(payload: AutomatedMissionPayload) {
  const store = useGameStore.getState();
  store.setQuestCompletionProgress({
    dailyCompleted: payload.dailyMastery.completedCount,
    dailyTotal: payload.dailyMastery.totalRequired,
    dailyRewardClaimed: !!payload.dailyMastery.claimed,
    weeklyCompleted: payload.weeklyMastery.completedCount,
    weeklyTotal: payload.weeklyMastery.totalRequired,
    weeklyRewardClaimed: !!payload.weeklyMastery.claimed,
  });
}

/**
 * Clean Async API Placeholder Hook: Fetches the missions payload from backend / Discord Bot API.
 */
export async function fetchMissionsPayload(): Promise<AutomatedMissionPayload> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const payload = getStoredPayload();

  // Recalculate completed counts accurately from missions array
  const dailyCat = payload.categories.find((c) => c.id === "daily");
  if (dailyCat) {
    payload.dailyMastery.completedCount = dailyCat.missions.filter(
      (m) =>
        m.status === "verified" ||
        m.status === "claimed" ||
        m.status === "claimable" ||
        m.completedCount >= m.totalRequired,
    ).length;
  }

  const weeklyCat = payload.categories.find((c) => c.id === "weekly");
  if (weeklyCat) {
    payload.weeklyMastery.completedCount = weeklyCat.missions.filter(
      (m) =>
        m.status === "verified" ||
        m.status === "claimed" ||
        m.status === "claimable" ||
        m.completedCount >= m.totalRequired,
    ).length;
  }

  syncStoreMasteryProgress(payload);
  saveStoredPayload(payload);
  return payload;
}

/**
 * Clean Async API Placeholder Hook: Syncs real-time state with Discord Bot webhook service.
 */
export async function syncDiscordBotState(): Promise<{
  success: boolean;
  lastSyncTimestamp: string;
  message: string;
}> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    success: true,
    lastSyncTimestamp: new Date().toISOString(),
    message: "Discord Bot State synchronized successfully",
  };
}

/**
 * Clean Async API Placeholder Hook: Fetches specific mission detail by ID.
 */
export async function getMissionDetails(missionId: string): Promise<AutomatedMissionItem | null> {
  const payload = getStoredPayload();
  for (const cat of payload.categories) {
    const found = cat.missions.find((m) => m.id === missionId);
    if (found) return found;
  }
  return null;
}

/**
 * Completes a mission by ID, updating streak counts, granting Spendable XP and Packs immediately.
 */
export async function completeAutomatedMission(missionId: string): Promise<{
  success: boolean;
  message: string;
  xpEarned: number;
  packGranted?: string;
  updatedPayload: AutomatedMissionPayload;
}> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const payload = getStoredPayload();

  let targetMission: AutomatedMissionItem | null = null;
  let categoryId: "daily" | "weekly" | "milestones" = "daily";

  for (const cat of payload.categories) {
    const found = cat.missions.find((m) => m.id === missionId);
    if (found) {
      targetMission = found;
      categoryId = cat.id;
      break;
    }
  }

  if (!targetMission) {
    return {
      success: false,
      message: "Quest not found.",
      xpEarned: 0,
      updatedPayload: payload,
    };
  }

  if (targetMission.status === "verified" || targetMission.status === "claimed") {
    return {
      success: false,
      message: "Quest already verified and claimed.",
      xpEarned: 0,
      updatedPayload: payload,
    };
  }

  // Mark completed
  targetMission.completedCount = targetMission.totalRequired;
  targetMission.progress = targetMission.maxProgress || targetMission.totalRequired;
  targetMission.status = "claimed";

  // Award XP to global store
  const xpEarned = targetMission.xpReward || targetMission.baseRewardXP || 0;
  const store = useGameStore.getState();
  if (xpEarned > 0) {
    store.addXp(xpEarned);
  }

  // Grant pack if specified
  let packGranted: string | undefined = undefined;
  if (
    targetMission.rewardText?.toLowerCase().includes("pack") ||
    targetMission.itemReward?.toLowerCase().includes("pack") ||
    targetMission.id.includes("sniper") ||
    targetMission.id.includes("architect") ||
    targetMission.id.includes("unboxing") ||
    targetMission.id.includes("curator")
  ) {
    const newPack = grantPackToPlayer(
      targetMission.id.includes("curator") ? "legendary_pack" : "raider_pack",
    );
    packGranted = newPack.name;
    const ownedPacks = await getOwnedPacks();
    store.setPacks(ownedPacks);
  }

  // Update streak count if it's a daily quest
  if (categoryId === "daily") {
    store.incrementStreak();
  }

  // Recalculate category totals
  const dailyCat = payload.categories.find((c) => c.id === "daily");
  if (dailyCat) {
    payload.dailyMastery.completedCount = dailyCat.missions.filter(
      (m) =>
        m.status === "verified" || m.status === "claimed" || m.completedCount >= m.totalRequired,
    ).length;
  }

  const weeklyCat = payload.categories.find((c) => c.id === "weekly");
  if (weeklyCat) {
    payload.weeklyMastery.completedCount = weeklyCat.missions.filter(
      (m) =>
        m.status === "verified" || m.status === "claimed" || m.completedCount >= m.totalRequired,
    ).length;
  }

  syncStoreMasteryProgress(payload);
  saveStoredPayload(payload);

  return {
    success: true,
    message: `Quest "${targetMission.title}" Complete! +${xpEarned.toLocaleString()} XP${
      packGranted ? ` & +1 ${packGranted}` : ""
    }`,
    xpEarned,
    packGranted,
    updatedPayload: payload,
  };
}

/**
 * Developer-friendly Async API Handler for verifying mission status via Discord bot integration.
 * // TODO: Replace mock with real API call to Discord bot endpoint (e.g. POST /api/missions/verify/:id)
 */
export async function handleVerifyMission(missionId: string): Promise<{
  success: boolean;
  message: string;
  updatedPayload: AutomatedMissionPayload;
}> {
  // TODO: Replace mock with real API call to Discord bot endpoint (e.g. fetch(`/api/missions/verify/${missionId}`, { method: "POST" }))
  await new Promise((resolve) => setTimeout(resolve, 300));
  const payload = getStoredPayload();

  let targetMission: AutomatedMissionItem | null = null;
  for (const cat of payload.categories) {
    const found = cat.missions.find((m) => m.id === missionId);
    if (found) {
      targetMission = found;
      break;
    }
  }

  if (!targetMission) {
    return { success: false, message: "Mission not found", updatedPayload: payload };
  }

  targetMission.status = "claimable";
  targetMission.completedCount = targetMission.totalRequired;
  targetMission.progress = targetMission.maxProgress || targetMission.totalRequired;

  syncStoreMasteryProgress(payload);
  saveStoredPayload(payload);

  return {
    success: true,
    message: `Discord bot verified reaction in ${targetMission.discordChannel || targetMission.roomTag}! Reward ready to claim.`,
    updatedPayload: payload,
  };
}

/**
 * Developer-friendly Async API Handler for claiming a verified mission reward.
 * // TODO: Replace mock with real API call to Discord bot endpoint (e.g. POST /api/missions/claim/:id)
 */
export async function handleClaimReward(missionId: string): Promise<{
  success: boolean;
  message: string;
  xpEarned: number;
  packGranted?: string;
  updatedPayload: AutomatedMissionPayload;
}> {
  // TODO: Replace mock with real API call to Discord bot endpoint (e.g. fetch(`/api/missions/claim/${missionId}`, { method: "POST" }))
  return completeAutomatedMission(missionId);
}

/**
 * Claims ALL currently completed/claimable missions across all categories in a single batch action.
 */
export async function claimAllCompletedMissions(): Promise<{
  success: boolean;
  totalClaimed: number;
  totalXpEarned: number;
  packsGranted: string[];
  message: string;
  updatedPayload: AutomatedMissionPayload;
}> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const payload = getStoredPayload();
  const store = useGameStore.getState();

  let totalClaimed = 0;
  let totalXpEarned = 0;
  const packsGranted: string[] = [];

  for (const cat of payload.categories) {
    for (const mission of cat.missions) {
      const isAlreadyClaimed = mission.status === "claimed" || mission.status === "verified";
      const isReadyToClaim =
        mission.status === "claimable" ||
        (mission.completedCount >= mission.totalRequired && !isAlreadyClaimed);

      if (isReadyToClaim && !isAlreadyClaimed) {
        mission.completedCount = mission.totalRequired;
        mission.progress = mission.maxProgress || mission.totalRequired;
        mission.status = "claimed";
        totalClaimed++;

        const xp = mission.xpReward || mission.baseRewardXP || mission.xpBounty || 500;
        totalXpEarned += xp;
        store.addXp(xp);

        if (
          mission.rewardText?.toLowerCase().includes("pack") ||
          mission.itemReward?.toLowerCase().includes("pack") ||
          mission.id.includes("sniper") ||
          mission.id.includes("architect") ||
          mission.id.includes("unboxing") ||
          mission.id.includes("curator")
        ) {
          const pack = grantPackToPlayer(
            mission.id.includes("curator") ? "legendary_pack" : "raider_pack",
          );
          packsGranted.push(pack.name);
        }

        if (cat.id === "daily") {
          store.incrementStreak();
        }
      }
    }
  }

  if (packsGranted.length > 0) {
    const ownedPacks = await getOwnedPacks();
    store.setPacks(ownedPacks);
  }

  // Recalculate categories
  const dailyCat = payload.categories.find((c) => c.id === "daily");
  if (dailyCat) {
    payload.dailyMastery.completedCount = dailyCat.missions.filter(
      (m) =>
        m.status === "verified" || m.status === "claimed" || m.completedCount >= m.totalRequired,
    ).length;
  }

  const weeklyCat = payload.categories.find((c) => c.id === "weekly");
  if (weeklyCat) {
    payload.weeklyMastery.completedCount = weeklyCat.missions.filter(
      (m) =>
        m.status === "verified" || m.status === "claimed" || m.completedCount >= m.totalRequired,
    ).length;
  }

  syncStoreMasteryProgress(payload);
  saveStoredPayload(payload);

  if (totalClaimed === 0) {
    return {
      success: false,
      totalClaimed: 0,
      totalXpEarned: 0,
      packsGranted: [],
      message: "No completed rewards to claim right now.",
      updatedPayload: payload,
    };
  }

  return {
    success: true,
    totalClaimed,
    totalXpEarned,
    packsGranted,
    message: `Claimed ${totalClaimed} directive rewards! Earned +${totalXpEarned.toLocaleString()} XP${
      packsGranted.length > 0 ? ` and ${packsGranted.length} pack(s)` : ""
    }!`,
    updatedPayload: payload,
  };
}

/**
 * Claims Daily Mission Mastery completion bonus (+1,000 XP & 1 Raider Pack).
 */
export async function claimDailyMasteryBonus(): Promise<{
  success: boolean;
  message: string;
  updatedPayload: AutomatedMissionPayload;
}> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const payload = getStoredPayload();

  if (payload.dailyMastery.claimed) {
    return {
      success: false,
      message: "Daily Mission Mastery reward already claimed.",
      updatedPayload: payload,
    };
  }

  if (payload.dailyMastery.completedCount < payload.dailyMastery.totalRequired) {
    return {
      success: false,
      message: `Complete all ${payload.dailyMastery.totalRequired} daily missions first!`,
      updatedPayload: payload,
    };
  }

  // Call mastery claim API placeholder (POST /api/v1/missions/claim-mastery)
  await claimMasteryApi("daily");

  // Award +1,000 Spendable XP and 1x Raider Pack
  const store = useGameStore.getState();
  store.addXp(1000);

  const grantedPack = grantPackToPlayer("raider_pack");
  const ownedPacks = await getOwnedPacks();
  store.setPacks(ownedPacks);

  payload.dailyMastery.claimed = true;
  payload.dailyMastery.rewardCallout = "✓ CLAIMED (+1,000 XP & 1 Raider Pack)";

  syncStoreMasteryProgress(payload);
  saveStoredPayload(payload);

  return {
    success: true,
    message: `Daily Mission Mastery Bonus Claimed! +1,000 Spendable XP & 1x ${grantedPack.name} added to Vault.`,
    updatedPayload: payload,
  };
}

/**
 * Claims Weekly Grand Mastery completion bonus (+5,000 XP & 1 Specialist Pack).
 */
export async function claimWeeklyMasteryBonus(): Promise<{
  success: boolean;
  message: string;
  updatedPayload: AutomatedMissionPayload;
}> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const payload = getStoredPayload();

  if (payload.weeklyMastery.claimed) {
    return {
      success: false,
      message: "Weekly Grand Mastery reward already claimed.",
      updatedPayload: payload,
    };
  }

  if (payload.weeklyMastery.completedCount < payload.weeklyMastery.totalRequired) {
    return {
      success: false,
      message: `Complete all ${payload.weeklyMastery.totalRequired} weekly campaigns first!`,
      updatedPayload: payload,
    };
  }

  // Call mastery claim API placeholder (POST /api/v1/missions/claim-mastery)
  await claimMasteryApi("weekly");

  const store = useGameStore.getState();
  store.addXp(5000);

  const grantedPack = grantPackToPlayer("specialist_pack");
  const ownedPacks = await getOwnedPacks();
  store.setPacks(ownedPacks);

  payload.weeklyMastery.claimed = true;
  payload.weeklyMastery.rewardCallout = "✓ CLAIMED (+5,000 XP & 1 Specialist Pack)";

  syncStoreMasteryProgress(payload);
  saveStoredPayload(payload);

  return {
    success: true,
    message: `Weekly Grand Mastery Bonus Claimed! +5,000 Spendable XP & 1x ${grantedPack.name} added to Vault.`,
    updatedPayload: payload,
  };
}

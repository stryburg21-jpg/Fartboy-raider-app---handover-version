import {
  DAILY_MISSION_POOL,
  DAILY_COMPLETION_BONUS,
  WEEKLY_MISSION_POOL,
  WEEKLY_COMPLETION_BONUS,
  SEASONAL_MILESTONES,
  type MissionConfig,
  type MissionTrackingEvent,
  type MissionType,
} from "@/config/missionsConfig";
import { awardActivityXP } from "@/services/xpEngine";
import { grantPackToPlayer } from "@/services/packs";
import { awardSeasonPassXP } from "@/services/contributorPass";
import { getActiveProfileData, subscribeToProfileChanges } from "@/services/profiles";
import { getCurrentPlayer } from "@/services/player";
import { getInventory } from "@/services/inventory";
import { contributeToWarchestMeter } from "@/services/communityMeters";
import { useGameStore } from "@/store/gameStore";
import type { Mission, MissionReward, Player, Title } from "@/types/game";
import { safeStorage } from "@/lib/storage";

export interface MissionProgressRecord {
  id: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export interface MissionEngineStore {
  lastDailyResetUtc: string;
  lastWeeklyResetUtc: string;
  activeDailyIds: string[];
  activeWeeklyIds: string[];
  dailyBonusClaimed: boolean;
  weeklyBonusClaimed: boolean;
  records: Record<string, MissionProgressRecord>;
}

const STORAGE_KEY = "fartboy_season1_missions_v1";

// Helper date utilities
export function getTodayUtcKey(): string {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

export function getWeeklyUtcKey(): string {
  const d = new Date();
  const day = d.getUTCDay();
  // Calculate Monday of current week
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
  return monday.toISOString().split("T")[0];
}

export function getTimeUntilUtcMidnight(): string {
  const now = new Date();
  const tomorrowUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  const ms = tomorrowUtc.getTime() - now.getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
}

export function getTimeUntilWeeklyReset(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const daysUntilMonday = (8 - day) % 7 || 7;
  const nextMondayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday),
  );
  const ms = nextMondayUtc.getTime() - now.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}d ${hours}h`;
}

// Internal persistence loader
function loadEngineStore(): MissionEngineStore {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to parse mission engine store", err);
  }

  // Default initial state
  return {
    lastDailyResetUtc: "",
    lastWeeklyResetUtc: "",
    activeDailyIds: [],
    activeWeeklyIds: [],
    dailyBonusClaimed: false,
    weeklyBonusClaimed: false,
    records: {},
  };
}

function saveEngineStore(store: MissionEngineStore): void {
  try {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error("Failed to save mission engine store", err);
  }
}

/**
 * Ensures daily and weekly mission resets are executed when reset timers expire.
 * Rotates or selects active missions from pools.
 */
export function syncAndCheckMissionResets(): MissionEngineStore {
  const store = loadEngineStore();
  const todayKey = getTodayUtcKey();
  const weeklyKey = getWeeklyUtcKey();

  let modified = false;

  // 1. DAILY RESET (00:00 UTC)
  if (store.lastDailyResetUtc !== todayKey || store.activeDailyIds.length !== 3) {
    store.lastDailyResetUtc = todayKey;
    store.dailyBonusClaimed = false;

    // Select 3 daily missions deterministically by date hash or pool order
    const dateNum = todayKey.split("-").reduce((acc, val) => acc + Number(val), 0);
    const pool = [...DAILY_MISSION_POOL];
    const selected: string[] = [];
    for (let i = 0; i < 3; i++) {
      const idx = (dateNum + i * 2) % pool.length;
      selected.push(pool[idx].id);
    }
    store.activeDailyIds = selected;

    // Reset records for daily pool missions
    for (const m of DAILY_MISSION_POOL) {
      store.records[m.id] = {
        id: m.id,
        progress: 0,
        completed: false,
        claimed: false,
      };
    }
    modified = true;
  }

  // 2. WEEKLY RESET (Monday 00:00 UTC)
  if (store.lastWeeklyResetUtc !== weeklyKey || store.activeWeeklyIds.length !== 3) {
    store.lastWeeklyResetUtc = weeklyKey;
    store.weeklyBonusClaimed = false;

    // Select 3 weekly missions deterministically by week hash or pool order
    const weekNum = weeklyKey.split("-").reduce((acc, val) => acc + Number(val), 0);
    const weeklyPool = [...WEEKLY_MISSION_POOL];
    const selected: string[] = [];
    for (let i = 0; i < 3; i++) {
      const idx = (weekNum + i * 2) % weeklyPool.length;
      selected.push(weeklyPool[idx].id);
    }
    store.activeWeeklyIds = selected;

    // Reset records for weekly pool missions
    for (const m of WEEKLY_MISSION_POOL) {
      store.records[m.id] = {
        id: m.id,
        progress: 0,
        completed: false,
        claimed: false,
      };
    }
    modified = true;
  }

  // 3. SEASONAL MILESTONES (Ensure records exist)
  for (const m of SEASONAL_MILESTONES) {
    if (!store.records[m.id]) {
      store.records[m.id] = {
        id: m.id,
        progress: 0,
        completed: false,
        claimed: false,
      };
      modified = true;
    }
  }

  if (modified) {
    saveEngineStore(store);
  }

  return store;
}

// Convert MissionConfig + record to UI Mission model
function mapToUIMission(config: MissionConfig, record?: MissionProgressRecord): Mission {
  const progress = record?.progress ?? 0;
  const completed = (record?.completed ?? false) || progress >= config.requirement;
  const claimed = record?.claimed ?? false;

  let status: Mission["status"] = "available";
  if (claimed) {
    status = "claimed";
  } else if (completed) {
    status = "completed";
  } else if (progress > 0) {
    status = "in_progress";
  }

  let expiry = "";
  if (config.type === "daily") expiry = getTimeUntilUtcMidnight();
  else if (config.type === "weekly") expiry = getTimeUntilWeeklyReset();
  else if (config.type === "seasonal") expiry = "Season 1 (90 Days)";

  const reward: MissionReward = {
    xp: config.xpReward,
    description: config.bonusReward
      ? `+${config.xpReward.toLocaleString()} XP & ${config.bonusReward.description || "Bonus"}`
      : `+${config.xpReward.toLocaleString()} XP`,
    itemId: config.bonusReward?.titleId,
    packId: config.bonusReward?.packId,
  };

  return {
    id: config.id,
    type: config.type,
    category: config.type,
    title: config.title,
    description: config.description,
    requirement: config.requirement,
    progress: Math.min(config.requirement, progress),
    reward,
    artwork: config.artwork,
    status,
    expiry,
    completed,
  };
}

/**
 * Returns all active daily, weekly, and seasonal missions.
 */
export async function getMissions(): Promise<Mission[]> {
  const store = syncAndCheckMissionResets();

  const activeConfigs: MissionConfig[] = [];

  // 1. Active Daily
  for (const id of store.activeDailyIds) {
    const cfg = DAILY_MISSION_POOL.find((m) => m.id === id);
    if (cfg) activeConfigs.push(cfg);
  }

  // 2. Active Weekly
  for (const id of store.activeWeeklyIds) {
    const cfg = WEEKLY_MISSION_POOL.find((m) => m.id === id);
    if (cfg) activeConfigs.push(cfg);
  }

  // 3. Seasonal Milestones
  for (const cfg of SEASONAL_MILESTONES) {
    activeConfigs.push(cfg);
  }

  const result = activeConfigs.map((cfg) => mapToUIMission(cfg, store.records[cfg.id]));

  // Sync back to active profile data and Zustand store
  const profile = getActiveProfileData();
  profile.missions = result;

  return result;
}

export async function getActiveMissions(): Promise<Mission[]> {
  return getMissions();
}

/**
 * Central event pipeline to track mission progress upon user actions.
 */
export async function trackMissionEvent(
  eventType: MissionTrackingEvent,
  count: number = 1,
  metadata: Record<string, unknown> = {},
): Promise<{ updatedCount: number; newlyCompleted: string[] }> {
  const store = syncAndCheckMissionResets();
  const newlyCompleted: string[] = [];

  const [player, inventory] = await Promise.all([getCurrentPlayer(), getInventory()]);

  // Feature 3 (Warchest Meter): single additive hook off the same verified tracking
  // events already wired into the mission system. Count-based (1 unit per verified
  // boost/donation), never $-denominated. Fire-and-forget — never block mission
  // progress on this.
  if (eventType === "external_boost_submitted" || eventType === "donation_contributed") {
    contributeToWarchestMeter(count, player.username).catch((e) =>
      console.error("[Warchest Meter] contribution failed", e),
    );
  }

  // Combine all active mission configs
  const allConfigs = [
    ...DAILY_MISSION_POOL.filter((m) => store.activeDailyIds.includes(m.id)),
    ...WEEKLY_MISSION_POOL.filter((m) => store.activeWeeklyIds.includes(m.id)),
    ...SEASONAL_MILESTONES,
  ];

  let stateChanged = false;

  for (const cfg of allConfigs) {
    const record = store.records[cfg.id] || {
      id: cfg.id,
      progress: 0,
      completed: false,
      claimed: false,
    };

    if (record.claimed) continue; // Already claimed

    let eventMatches = false;
    let addValue = count;

    if (cfg.trackingEvent === eventType) {
      eventMatches = true;
    } else if (eventType === "cto_snipe" && cfg.trackingEvent === "raid_verified") {
      eventMatches = true; // CTO snipe counts as a verified raid
    } else if (eventType === "content_meme_approved" && cfg.trackingEvent === "content_approved") {
      eventMatches = true; // Meme counts towards general content approved
    }

    // Special metadata handlers
    if (cfg.trackingEvent === "set_equipped") {
      // Check if player currently has 4 or more items from the same set
      const equippedMap = player.equipped || {};
      const setCounts: Record<string, number> = {};
      for (const slot of Object.keys(equippedMap)) {
        const itemId = equippedMap[slot as keyof typeof equippedMap];
        if (itemId) {
          const item = inventory.find((i) => i.id === itemId);
          if (item?.set) {
            setCounts[item.set] = (setCounts[item.set] || 0) + 1;
          }
        }
      }
      const maxInSet = Math.max(0, ...Object.values(setCounts));
      if (maxInSet >= 4) {
        eventMatches = true;
        addValue = 1;
        record.progress = 1;
      }
    } else if (cfg.trackingEvent === "catalogue_unlocked") {
      // Unique items unlocked in inventory
      const uniqueItemsCount = new Set(inventory.map((i) => i.templateId || i.id)).size;
      record.progress = Math.min(cfg.requirement, uniqueItemsCount);
      stateChanged = true;
      if (record.progress >= cfg.requirement && !record.completed) {
        record.completed = true;
        newlyCompleted.push(cfg.id);
      }
      continue;
    } else if (cfg.trackingEvent === "viral_impression_reached") {
      const impressions = Number(metadata.impressions || count) || 0;
      if (impressions >= 10000) {
        record.progress = 10000;
        record.completed = true;
        newlyCompleted.push(cfg.id);
        stateChanged = true;
      }
      continue;
    } else if (cfg.trackingEvent === "mythic_item_acquired") {
      if (
        metadata.rarity === "legendary" ||
        metadata.rarity === "mythic" ||
        eventType === "mythic_item_acquired"
      ) {
        eventMatches = true;
        addValue = 1;
      }
    }

    if (eventMatches) {
      const prevProgress = record.progress;
      record.progress = Math.min(cfg.requirement, record.progress + addValue);

      if (record.progress !== prevProgress) {
        stateChanged = true;
      }

      if (record.progress >= cfg.requirement && !record.completed) {
        record.completed = true;
        newlyCompleted.push(cfg.id);
        stateChanged = true;
      }

      store.records[cfg.id] = record;
    }
  }

  if (stateChanged) {
    saveEngineStore(store);
    const updatedMissions = await getMissions();
    useGameStore.getState().setMissions(updatedMissions);
  }

  return { updatedCount: newlyCompleted.length, newlyCompleted };
}

const claimingInFlight = new Set<string>();
const bonusClaimingInFlight = new Set<string>();

/**
 * Claims reward for a completed mission.
 * Flow:
 * 1. Validate completed & not claimed
 * 2. Award XP via XP Engine
 * 3. Grant bonus packs/titles
 * 4. Update state & UI
 */
export async function claimMissionReward(
  missionId: string,
): Promise<{ success: boolean; message: string; updatedMissions?: Mission[] }> {
  if (claimingInFlight.has(missionId)) {
    return { success: false, message: "Claim request currently processing." };
  }

  claimingInFlight.add(missionId);

  try {
    const store = syncAndCheckMissionResets();
    const record = store.records[missionId];

    if (!record) {
      return { success: false, message: "Mission not found." };
    }

    if (record.claimed) {
      return { success: false, message: "Mission reward already claimed." };
    }

    // Find config
    const config =
      DAILY_MISSION_POOL.find((m) => m.id === missionId) ||
      WEEKLY_MISSION_POOL.find((m) => m.id === missionId) ||
      SEASONAL_MILESTONES.find((m) => m.id === missionId);

    if (!config) {
      return { success: false, message: "Mission configuration missing." };
    }

    if (record.progress < config.requirement && !record.completed) {
      return { success: false, message: "Mission requirement not yet fulfilled." };
    }

    // 1. Award XP through XP Engine
    const activityType =
      config.type === "daily"
        ? "daily_mission"
        : config.type === "weekly"
          ? "weekly_mission"
          : "seasonal_mission";

    const xpResult = await awardActivityXP({
      activityType,
      customBaseXP: config.xpReward,
      note: `Mission Reward: ${config.title}`,
    });

    if (!xpResult.success) {
      return { success: false, message: xpResult.error || "Failed to award XP via XP Engine." };
    }

    // 2. Grant Bonus Rewards (Packs, Titles, Badges)
    const profile = getActiveProfileData();
    let bonusMessage = "";

    if (config.bonusReward) {
      if (config.bonusReward.packId) {
        grantPackToPlayer(config.bonusReward.packId);
        bonusMessage += ` + ${config.bonusReward.packName || "1x Bonus Pack"}`;
      }

      if (config.bonusReward.titleId) {
        const titleName = config.bonusReward.titleName || "New Title";
        const existingTitles = profile.player.titles || [];
        if (!existingTitles.some((t) => t.id === config.bonusReward?.titleId)) {
          const newTitle: Title = {
            id: config.bonusReward.titleId,
            name: titleName,
            equipped: false,
            unlocked: true,
            description: `Earned from ${config.title} mission`,
          };
          profile.player.titles = [...existingTitles, newTitle];
        }
        bonusMessage += ` + Title: ${titleName}`;
      }
    }

    // 3. Mark as claimed
    record.claimed = true;
    record.completed = true;
    store.records[missionId] = record;
    saveEngineStore(store);

    // 4. Update GameStore player and missions state
    const updatedMissions = await getMissions();
    useGameStore.getState().setMissions(updatedMissions);
    useGameStore.getState().setPlayer({ ...profile.player });

    return {
      success: true,
      message: `Claimed +${config.xpReward.toLocaleString()} XP${bonusMessage}!`,
      updatedMissions,
    };
  } finally {
    claimingInFlight.delete(missionId);
  }
}

/**
 * Claims Daily or Weekly completion bonus when all active missions are claimed.
 */
export async function claimCompletionBonus(
  type: "daily" | "weekly",
): Promise<{ success: boolean; message: string }> {
  if (bonusClaimingInFlight.has(type)) {
    return { success: false, message: "Completion bonus claim in progress." };
  }

  bonusClaimingInFlight.add(type);

  try {
    const store = syncAndCheckMissionResets();

    if (type === "daily") {
      if (store.dailyBonusClaimed) {
        return { success: false, message: "Daily completion bonus already claimed." };
      }

      // Check if all 3 active daily missions are claimed
      const activeClaimed = store.activeDailyIds.every((id) => store.records[id]?.claimed);
      if (!activeClaimed) {
        return { success: false, message: "Complete and claim all 3 daily missions first." };
      }

      // Award +1,000 XP through XP Engine
      const xpResult = await awardActivityXP({
        activityType: "daily_mission",
        customBaseXP: DAILY_COMPLETION_BONUS.xpReward,
        note: "Daily 3/3 Mission Mastery Completion Bonus",
      });

      if (!xpResult.success) {
        return { success: false, message: xpResult.error || "Failed to award bonus XP." };
      }

      // Grant Raider Pack
      grantPackToPlayer(DAILY_COMPLETION_BONUS.packId);

      store.dailyBonusClaimed = true;
      saveEngineStore(store);

      const updatedMissions = await getMissions();
      useGameStore.getState().setMissions(updatedMissions);

      return {
        success: true,
        message: `Daily Completion Bonus Claimed! (+1,000 XP & 1x Raider Pack)`,
      };
    } else {
      if (store.weeklyBonusClaimed) {
        return { success: false, message: "Weekly completion bonus already claimed." };
      }

      // Check if all 3 active weekly missions are claimed
      const activeClaimed = store.activeWeeklyIds.every((id) => store.records[id]?.claimed);
      if (!activeClaimed) {
        return { success: false, message: "Complete and claim all 3 weekly missions first." };
      }

      // Award +5,000 XP through XP Engine
      const xpResult = await awardActivityXP({
        activityType: "weekly_mission",
        customBaseXP: WEEKLY_COMPLETION_BONUS.xpReward,
        note: "Weekly 3/3 Campaign Completion Bonus",
      });

      if (!xpResult.success) {
        return { success: false, message: xpResult.error || "Failed to award bonus XP." };
      }

      // Grant Specialist Pack
      grantPackToPlayer(WEEKLY_COMPLETION_BONUS.packId);

      // Award +5,000 Season Pass XP
      await awardSeasonPassXP(5000, "Weekly Mission Mastery Bonus");

      store.weeklyBonusClaimed = true;
      saveEngineStore(store);

      const updatedMissions = await getMissions();
      useGameStore.getState().setMissions(updatedMissions);

      return {
        success: true,
        message: `Weekly Completion Bonus Claimed! (+5,000 XP & 1x Specialist Pack)`,
      };
    }
  } finally {
    bonusClaimingInFlight.delete(type);
  }
}

/**
 * Get current bonus claim status
 */
export function getCompletionBonusStatus(): {
  dailyBonusClaimed: boolean;
  dailyProgressCount: number;
  weeklyBonusClaimed: boolean;
  weeklyProgressCount: number;
} {
  const store = syncAndCheckMissionResets();

  const dailyProgressCount = store.activeDailyIds.filter((id) => store.records[id]?.claimed).length;
  const weeklyProgressCount = store.activeWeeklyIds.filter(
    (id) => store.records[id]?.claimed,
  ).length;

  return {
    dailyBonusClaimed: store.dailyBonusClaimed,
    dailyProgressCount,
    weeklyBonusClaimed: store.weeklyBonusClaimed,
    weeklyProgressCount,
  };
}

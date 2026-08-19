// Feature 1 (Community Season Meter) + Feature 3 (Warchest Meter) service layer.
// Both are thin, additive hooks over existing systems — see xpEngine.ts (Season Meter)
// and missions.ts (Warchest Meter) for where these are called from.
//
// NOTE ON THIS MOCK IMPLEMENTATION: this app has no live multiplayer backend, so
// "the whole community's XP" is simulated as this session's player contributing to a
// shared counter that's persisted (weekly) in localStorage, and "every active
// participant gets the reward" is simulated as granting the reward to the current
// player once.
//
// API PLACEHOLDER FOR HANDOVER: GET /api/v1/community/season-meter and
// GET /api/v1/community/warchest-meter (see src/server/apiHandlers.ts) already return
// this same CommunityMeterState shape, currently backed by the same localStorage mock.
// getSeasonMeter()/getWarchestMeter() below read localStorage directly rather than
// fetch() so the UI keeps working instantly and offline in this mock app — swap their
// bodies for a fetch() to those routes (or your real backend) once state is server-side.
// IMPORTANT FOR A DISCORD ACTIVITY EMBED: localStorage is per-browser/per-user, so two
// players in the same Activity will each see their own copy of "the community meter"
// until this is backed by a real shared endpoint. Do not ship the Discord build without
// making that swap.

import {
  SEASON_METER_MILESTONES,
  SEASON_METER_WEEKLY_GOAL_XP,
  SEASON_METER_XP_CONTRIBUTION_RATE,
  WARCHEST_METER_MILESTONES,
  WARCHEST_METER_WEEKLY_GOAL_UNITS,
  METER_ACTIVE_PARTICIPANT_MIN_XP,
  type MeterMilestoneConfig,
} from "@/config/communityMeters";
import { postMeterMilestoneAnnouncement } from "@/services/discordWebhook";
import { getCurrentPlayer, setMockPlayer } from "@/services/player";
import { grantPackToPlayer } from "@/services/packs";
import { getActiveProfileData } from "@/services/profiles";
import { recordCustomXPTransaction } from "@/services/xpEngine";
import { safeStorage } from "@/lib/storage";

export interface CommunityMeterState {
  weekId: string;
  currentValue: number;
  goal: number;
  unlockedMilestoneIds: string[];
  resetsAt: string;
  /** Has the current player contributed >= min XP/units this week (i.e. counts as "active")? */
  playerIsActiveParticipant: boolean;
}

const SEASON_METER_KEY = "fartboy_season_meter_v1";
const WARCHEST_METER_KEY = "fartboy_warchest_meter_v1";

interface StoredMeter {
  weekId: string;
  currentValue: number;
  unlockedMilestoneIds: string[];
  playerContributedThisWeek: boolean;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function getWeeklyKey(): string {
  const d = new Date();
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday of current week
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
  return monday.toISOString().split("T")[0];
}

function getWeeklyResetIso(): string {
  const d = new Date();
  const day = d.getUTCDay();
  const daysUntilMonday = (8 - day) % 7 || 7;
  const nextMonday = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + daysUntilMonday),
  );
  return nextMonday.toISOString();
}

function loadStoredMeter(storageKey: string): StoredMeter {
  const weekId = getWeeklyKey();
  try {
    const raw = safeStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredMeter;
      if (parsed.weekId === weekId) return parsed;
    }
  } catch (e) {
    console.error(`Failed loading meter state (${storageKey})`, e);
  }
  return { weekId, currentValue: 0, unlockedMilestoneIds: [], playerContributedThisWeek: false };
}

function saveStoredMeter(storageKey: string, state: StoredMeter): void {
  try {
    safeStorage.setItem(storageKey, JSON.stringify(state));
  } catch (e) {
    console.error(`Failed saving meter state (${storageKey})`, e);
  }
}

// Lightweight pub/sub so the HUD widget can react without websockets (per spec:
// "poll on load / periodic refresh is enough for v1" — this adds instant local
// updates on top of that for the contributing player's own session).
type Listener = () => void;
const listeners = new Set<Listener>();
export function subscribeToCommunityMeters(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function notifyListeners(): void {
  listeners.forEach((fn) => fn());
}

/**
 * Grants a milestone's community-wide reward to the current (mock) player and
 * records it as an XP transaction / pack grant so it's visible in existing UI.
 */
async function grantMilestoneRewardToCurrentPlayer(milestone: MeterMilestoneConfig): Promise<void> {
  if (milestone.rewardType === "spendableXP" && milestone.spendableXPGrant) {
    const player = await getCurrentPlayer();
    const spBefore = player.spendableXP ?? player.xp ?? 0;
    const spAfter = spBefore + milestone.spendableXPGrant;
    const updatedPlayer = { ...player, spendableXP: spAfter, xp: spAfter };
    setMockPlayer(updatedPlayer);
    const activeProfile = getActiveProfileData();
    activeProfile.player = updatedPlayer;
    recordCustomXPTransaction({
      activityName: `Community Milestone: ${milestone.label}`,
      netXPAwarded: milestone.spendableXPGrant,
      spXpBefore: spBefore,
      spXpAfter: spAfter,
      ltXpBefore: player.lifetimeXP ?? 0,
      ltXpAfter: player.lifetimeXP ?? 0, // milestone rewards don't inflate lifetime/level progress
      note: milestone.rewardDescription,
    });
  } else if (milestone.rewardType === "pack" && milestone.packConfigId) {
    grantPackToPlayer(milestone.packConfigId);
  }
  // "cosmetic" / "title" / "discordRole" reward types are cosmetic-only for v1 and
  // don't have a corresponding grant pathway yet — surface them in the milestone
  // description/UI and wire up a real grant call once that catalog exists.
}

/**
 * Shared increment + milestone-check routine used by both meters.
 */
async function incrementMeter(params: {
  storageKey: string;
  milestones: MeterMilestoneConfig[];
  goal: number;
  amount: number;
  meterLabel: string;
  creditUsername?: string;
}): Promise<MeterMilestoneConfig[]> {
  const { storageKey, milestones, goal, amount, meterLabel, creditUsername } = params;
  if (amount <= 0) return [];

  const state = loadStoredMeter(storageKey);
  state.currentValue += amount;
  state.playerContributedThisWeek = true;

  const newlyUnlocked: MeterMilestoneConfig[] = [];
  for (const milestone of milestones) {
    if (state.unlockedMilestoneIds.includes(milestone.id)) continue;
    if (state.currentValue >= milestone.thresholdPct * goal) {
      state.unlockedMilestoneIds.push(milestone.id);
      newlyUnlocked.push(milestone);
    }
  }

  saveStoredMeter(storageKey, state);
  notifyListeners();

  for (const milestone of newlyUnlocked) {
    await grantMilestoneRewardToCurrentPlayer(milestone);
    // Fire-and-forget: never block gameplay on a Discord post succeeding.
    postMeterMilestoneAnnouncement(meterLabel, milestone, creditUsername).catch(() => {});
  }
  if (newlyUnlocked.length > 0) notifyListeners();

  return newlyUnlocked;
}

// ---------------------------------------------------------------------------
// Feature 1: Community Season Meter
// ---------------------------------------------------------------------------

export function getSeasonMeter(): CommunityMeterState {
  const s = loadStoredMeter(SEASON_METER_KEY);
  return {
    weekId: s.weekId,
    currentValue: s.currentValue,
    goal: SEASON_METER_WEEKLY_GOAL_XP,
    unlockedMilestoneIds: s.unlockedMilestoneIds,
    resetsAt: getWeeklyResetIso(),
    playerIsActiveParticipant: s.playerContributedThisWeek,
  };
}

export const SEASON_METER_MILESTONE_CONFIGS = SEASON_METER_MILESTONES;

/**
 * Called from xpEngine.awardActivityXP() — single additive hook, per spec.
 * `netXPAwarded` is the XP the player actually received (post-decay); a scaled-down
 * fraction of it feeds the community meter so the meter fills at a readable pace.
 */
export async function contributeToSeasonMeter(
  netXPAwarded: number,
): Promise<MeterMilestoneConfig[]> {
  const scaled = Math.floor(netXPAwarded * SEASON_METER_XP_CONTRIBUTION_RATE);
  return incrementMeter({
    storageKey: SEASON_METER_KEY,
    milestones: SEASON_METER_MILESTONES,
    goal: SEASON_METER_WEEKLY_GOAL_XP,
    amount: scaled,
    meterLabel: "Community Season Meter",
  });
}

// ---------------------------------------------------------------------------
// Feature 3: Warchest Meter
// ---------------------------------------------------------------------------

export function getWarchestMeter(): CommunityMeterState {
  const s = loadStoredMeter(WARCHEST_METER_KEY);
  return {
    weekId: s.weekId,
    currentValue: s.currentValue,
    goal: WARCHEST_METER_WEEKLY_GOAL_UNITS,
    unlockedMilestoneIds: s.unlockedMilestoneIds,
    resetsAt: getWeeklyResetIso(),
    playerIsActiveParticipant: s.playerContributedThisWeek,
  };
}

export const WARCHEST_METER_MILESTONE_CONFIGS = WARCHEST_METER_MILESTONES;

/**
 * Called from missions.trackMissionEvent() when a verified `external_boost_submitted`
 * or `donation_contributed` event fires. Count-based (1 unit per verified event), not
 * $-denominated — see spec for why. `contributorUsername` is used to name-credit
 * whoever pushed the meter over a threshold in the Discord announcement.
 */
export async function contributeToWarchestMeter(
  units: number,
  contributorUsername?: string,
): Promise<MeterMilestoneConfig[]> {
  return incrementMeter({
    storageKey: WARCHEST_METER_KEY,
    milestones: WARCHEST_METER_MILESTONES,
    goal: WARCHEST_METER_WEEKLY_GOAL_UNITS,
    amount: units,
    meterLabel: "Warchest Meter",
    creditUsername: contributorUsername,
  });
}

export const METER_ACTIVE_MIN_XP = METER_ACTIVE_PARTICIPANT_MIN_XP;

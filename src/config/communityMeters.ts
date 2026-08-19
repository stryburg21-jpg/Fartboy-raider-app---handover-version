// Community Momentum Features config — Season Meter (Feature 1) & Warchest Meter (Feature 3)
// See: Community Momentum Features — Build Spec v0.1

export type MeterRewardType = "pack" | "cosmetic" | "title" | "spendableXP" | "discordRole";

export interface MeterMilestoneConfig {
  id: string;
  /** Threshold as a fraction of the meter's total goal (0-1), so tuning the goal doesn't require re-writing thresholds. */
  thresholdPct: number;
  label: string;
  rewardDescription: string;
  rewardType: MeterRewardType;
  /** Flat spendable XP granted to every active participant when this milestone unlocks, if rewardType is spendableXP or as a bonus alongside pack/cosmetic rewards. */
  spendableXPGrant?: number;
  /** Pack config id granted to every active participant, if rewardType is "pack". */
  packConfigId?: string;
}

// ---------------------------------------------------------------------------
// Feature 1: Community Season Meter
// ---------------------------------------------------------------------------

/** Fraction of each awardActivityXP() payout that also feeds the community-wide Season Meter. */
export const SEASON_METER_XP_CONTRIBUTION_RATE = 0.1;

/** Weekly XP goal for the Season Meter (tune to your active player base). */
export const SEASON_METER_WEEKLY_GOAL_XP = 500_000;

export const SEASON_METER_MILESTONES: MeterMilestoneConfig[] = [
  {
    id: "season_meter_25",
    thresholdPct: 0.25,
    label: "Milestone 1: Community Surge",
    rewardDescription: "+250 Spendable XP for every active Raider this week",
    rewardType: "spendableXP",
    spendableXPGrant: 250,
  },
  {
    id: "season_meter_50",
    thresholdPct: 0.5,
    label: "Milestone 2: Halfway Cache",
    rewardDescription: "Free Common/Uncommon Pack for every active Raider this week",
    rewardType: "pack",
    packConfigId: "pack_raider",
  },
  {
    id: "season_meter_75",
    thresholdPct: 0.75,
    label: "Milestone 3: Limited Cosmetic",
    rewardDescription: "Exclusive week-only cosmetic for every active Raider this week",
    rewardType: "cosmetic",
  },
  {
    id: "season_meter_100",
    thresholdPct: 1.0,
    label: "Milestone 4: Mythic Airdrop Pack",
    rewardDescription: "Rare Pack + exclusive weekly Discord role for every active Raider",
    rewardType: "pack",
    packConfigId: "pack_specialist",
  },
];

// ---------------------------------------------------------------------------
// Feature 3: Warchest Meter
// ---------------------------------------------------------------------------

/** Weekly unit goal for the Warchest Meter. 1 unit = 1 verified boost or donation event (count-based, not $-denominated). */
export const WARCHEST_METER_WEEKLY_GOAL_UNITS = 30;

export const WARCHEST_METER_MILESTONES: MeterMilestoneConfig[] = [
  {
    id: "warchest_meter_5",
    thresholdPct: 5 / WARCHEST_METER_WEEKLY_GOAL_UNITS,
    label: "Milestone 1: Warchest Ignition",
    rewardDescription: "+150 Spendable XP for every active Raider this week",
    rewardType: "spendableXP",
    spendableXPGrant: 150,
  },
  {
    id: "warchest_meter_12",
    thresholdPct: 12 / WARCHEST_METER_WEEKLY_GOAL_UNITS,
    label: "Milestone 2: Community Airdrop Pack",
    rewardDescription: "Free Common/Uncommon Pack for every active Raider this week",
    rewardType: "pack",
    packConfigId: "pack_raider",
  },
  {
    id: "warchest_meter_20",
    thresholdPct: 20 / WARCHEST_METER_WEEKLY_GOAL_UNITS,
    label: "Milestone 3: Trendsetter Cosmetic",
    rewardDescription: "Limited 'Trendsetter' cosmetic for every active Raider this week",
    rewardType: "cosmetic",
  },
  {
    id: "warchest_meter_30",
    thresholdPct: 1.0,
    label: "Milestone 4: Warchest Payload",
    rewardDescription: "Rare Pack + time-limited Discord role for every active Raider",
    rewardType: "pack",
    packConfigId: "pack_specialist",
  },
];

/** Minimum XP a player must have earned this week to count as an "active participant" eligible for milestone rewards. */
export const METER_ACTIVE_PARTICIPANT_MIN_XP = 1;

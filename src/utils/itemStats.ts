import type { Item, Rarity } from "@/types/game";
import {
  computeStatValue,
  ClampStatToMatrix,
  STAT_RANGE_MATRIX,
  STAT_META,
  BASE_84_ITEMS,
  SET_CATALOGUE_BIBLE,
  type BibleStatKey,
} from "@/services/economyEngineBible";

export { ClampStatToMatrix };

export interface Standard6Stats {
  generalXP: number;
  raidXP: number;
  ctoXP: number;
  missionsXP: number;
  graphicXP: number;
  luck: number;
}

export interface StatBadge {
  label: string;
  shortLabel?: string;
  value: string;
  color: string;
  icon: string;
  statKey: keyof Standard6Stats;
  type?: "PRIMARY" | "SECONDARY";
}

export interface DetailedItemStat {
  key: BibleStatKey;
  label: string;
  shortLabel: string;
  icon: string;
  type: "PRIMARY" | "SECONDARY";
  value_pct: number;
  formatted: string;
}

export const STAT_SHORT_LABELS: Record<BibleStatKey, string> = {
  general_xp: "Gen",
  raid_xp: "Raid",
  cto_xp: "CTO",
  mission_xp: "Mission",
  meme_xp: "Meme",
  luck: "Luck",
};

function normalizeRarity(
  r?: string,
): "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic" {
  if (!r) return "Common";
  const lower = r.toLowerCase();
  if (lower === "mythic") return "Mythic";
  if (lower === "legendary") return "Legendary";
  if (lower === "epic") return "Epic";
  if (lower === "rare") return "Rare";
  if (lower === "uncommon") return "Uncommon";
  return "Common";
}

/**
 * Resolves base metadata from the 84-item bible catalog or infers from slot & set.
 */
export function resolveItemBaseMetadata(item: Partial<Item>) {
  if (!item) return null;

  const rawMeta = item.metadata as Record<string, unknown> | undefined;

  // If explicit primary_stat is defined in metadata (e.g. after identity swap), prioritize it
  if (rawMeta?.primary_stat && typeof rawMeta.primary_stat === "string") {
    const pKey = rawMeta.primary_stat as BibleStatKey;
    const secPool = (
      Array.isArray(rawMeta.secondary_stats_pool)
        ? rawMeta.secondary_stats_pool
        : ["general_xp", "luck", "raid_xp"]
    ) as BibleStatKey[];

    return {
      item_id: item.templateId || item.id || "custom_item",
      base_name: (rawMeta.base_name as string) || item.name || "Custom Equipment",
      set_id: (rawMeta.set_id as string) || item.set || "set_season",
      slot: item.slot ? item.slot.toUpperCase() : "HAT",
      primary_stat: pKey,
      secondary_stats_pool: secPool,
    };
  }

  // Exact ID or templateId match
  const matched = BASE_84_ITEMS.find(
    (b) =>
      b.item_id === item.id ||
      b.item_id === item.templateId ||
      b.base_name.toLowerCase() === (item.name ?? "").toLowerCase(),
  );
  if (matched) return matched;

  // Infer primary stat from set or slot
  const setName = (item.set ?? "").toLowerCase();
  let primary_stat: BibleStatKey = "general_xp";
  let secondary_pool: BibleStatKey[] = ["raid_xp", "luck", "cto_xp"];

  if (setName.includes("raid")) {
    primary_stat = "raid_xp";
    secondary_pool = ["general_xp", "luck", "cto_xp"];
  } else if (setName.includes("cto") || setName.includes("dev")) {
    primary_stat = "cto_xp";
    secondary_pool = ["general_xp", "luck", "mission_xp"];
  } else if (setName.includes("meme") || setName.includes("jester")) {
    primary_stat = "meme_xp";
    secondary_pool = ["general_xp", "luck", "raid_xp"];
  } else if (setName.includes("video") || setName.includes("stream")) {
    primary_stat = "meme_xp";
    secondary_pool = ["general_xp", "luck", "mission_xp"];
  } else if (setName.includes("mission") || setName.includes("quest")) {
    primary_stat = "mission_xp";
    secondary_pool = ["general_xp", "luck", "raid_xp"];
  } else {
    // Infer from slot
    if (item.slot === "head" || item.slot === "powerItem") primary_stat = "raid_xp";
    else if (item.slot === "body") primary_stat = "cto_xp";
    else if (item.slot === "shorts" || item.slot === "feet") primary_stat = "mission_xp";
    else if (item.slot === "pet") primary_stat = "meme_xp";
    else if (item.slot === "back") primary_stat = "luck";
    else primary_stat = "general_xp";
  }

  return {
    item_id: item.templateId || item.id || "custom_item",
    base_name: item.name || "Custom Equipment",
    set_id: item.set || "set_season",
    slot: item.slot ? item.slot.toUpperCase() : "HAT",
    primary_stat,
    secondary_stats_pool: secondary_pool,
  };
}

/**
 * Computes structured primary and secondary stats according to Economy Design Bible v3.1.
 * Enforces ClampStatToMatrix on all calculated values.
 */
export function getDetailedItemStats(item: Partial<Item>): {
  primary: DetailedItemStat;
  secondaries: DetailedItemStat[];
  all: DetailedItemStat[];
  qualityPct: number;
} {
  if (!item) {
    const defaultStat: DetailedItemStat = {
      key: "general_xp",
      label: "General XP",
      shortLabel: "Gen",
      icon: "🚀",
      type: "PRIMARY",
      value_pct: 0.05,
      formatted: "+0.05%",
    };
    return {
      primary: defaultStat,
      secondaries: [],
      all: [defaultStat],
      qualityPct: 0.95,
    };
  }

  const rarityName = normalizeRarity(item.rarity);
  const matrix = STAT_RANGE_MATRIX[rarityName] || STAT_RANGE_MATRIX.Common;
  const level = Math.max(1, Math.min(10, item.level ?? 1));

  // Determine quality roll % (default 95% if not set, clamped between 80% and 100%)
  const rawMeta = item.metadata as Record<string, unknown> | undefined;
  const rawStats = item.stats as Record<string, unknown> | undefined;
  const qualityRollRaw =
    (typeof rawMeta?.quality_roll_pct === "number" && rawMeta.quality_roll_pct) ||
    (typeof rawMeta?.reroll_quality_pct === "number" && rawMeta.reroll_quality_pct) ||
    (typeof rawStats?.qualityRoll === "number" && rawStats.qualityRoll) ||
    0.95;

  const qualityPct = Math.max(
    0.8,
    Math.min(1.0, qualityRollRaw > 1 ? qualityRollRaw / 100 : qualityRollRaw),
  );

  const baseMeta = resolveItemBaseMetadata(item);
  const primaryKey = baseMeta?.primary_stat ?? "general_xp";
  const primaryMeta = STAT_META[primaryKey] ?? { label: "General XP", icon: "🚀" };

  // Run through ClampStatToMatrix
  const clampedPrimary = ClampStatToMatrix(item, primaryKey, false);
  const primaryStat: DetailedItemStat = {
    key: primaryKey,
    label: primaryMeta.label,
    shortLabel: STAT_SHORT_LABELS[primaryKey] || "Gen",
    icon: primaryMeta.icon,
    type: "PRIMARY",
    value_pct: clampedPrimary.value_pct,
    formatted: clampedPrimary.formatted,
  };

  const secondaryCount = matrix.secondary_slots;
  const secondaries: DetailedItemStat[] = [];
  const secPool = baseMeta?.secondary_stats_pool ?? ["luck", "general_xp", "raid_xp"];

  for (let i = 0; i < secondaryCount; i++) {
    const secKey = secPool[i] || (i === 0 ? "luck" : "general_xp");
    const secMeta = STAT_META[secKey] ?? { label: "Luck", icon: "🍀" };
    const clampedSec = ClampStatToMatrix(item, secKey, true);

    secondaries.push({
      key: secKey,
      label: secMeta.label,
      shortLabel: STAT_SHORT_LABELS[secKey] || "Luck",
      icon: secMeta.icon,
      type: "SECONDARY",
      value_pct: clampedSec.value_pct,
      formatted: clampedSec.formatted,
    });
  }

  return {
    primary: primaryStat,
    secondaries,
    all: [primaryStat, ...secondaries],
    qualityPct,
  };
}

/**
 * Normalizes an item's stats into the standardized 6-Stat Schema.
 */
export function getItem6Stats(item: Partial<Item>): Standard6Stats {
  const detailed = getDetailedItemStats(item);
  const totals: Standard6Stats = {
    generalXP: 0,
    raidXP: 0,
    ctoXP: 0,
    missionsXP: 0,
    graphicXP: 0,
    luck: 0,
  };

  for (const s of detailed.all) {
    if (s.key === "general_xp") totals.generalXP += s.value_pct;
    else if (s.key === "raid_xp") totals.raidXP += s.value_pct;
    else if (s.key === "cto_xp") totals.ctoXP += s.value_pct;
    else if (s.key === "mission_xp") totals.missionsXP += s.value_pct;
    else if (s.key === "meme_xp") totals.graphicXP += s.value_pct;
    else if (s.key === "luck") totals.luck += s.value_pct;
  }

  return totals;
}

/**
 * Calculates total active 6-stat multipliers across a set of equipped items.
 * Applies the canonical +10.0% equipment passive gear cap rule.
 */
export function calculateActive6Stats(equippedItems: Partial<Item>[]): Standard6Stats & {
  isCapped: boolean;
  totalGearBonus: number;
} {
  const totals: Standard6Stats = {
    generalXP: 0,
    raidXP: 0,
    ctoXP: 0,
    missionsXP: 0,
    graphicXP: 0,
    luck: 0,
  };

  let rawTotal = 0;
  for (const item of equippedItems) {
    if (!item) continue;
    const stats = getItem6Stats(item);
    totals.generalXP += stats.generalXP;
    totals.raidXP += stats.raidXP;
    totals.ctoXP += stats.ctoXP;
    totals.missionsXP += stats.missionsXP;
    totals.graphicXP += stats.graphicXP;
    totals.luck += stats.luck;
  }

  rawTotal =
    totals.generalXP +
    totals.raidXP +
    totals.ctoXP +
    totals.missionsXP +
    totals.graphicXP +
    totals.luck;

  const isCapped = rawTotal > 10.0;
  const scaling = isCapped ? 10.0 / rawTotal : 1.0;

  return {
    generalXP: Number((totals.generalXP * scaling).toFixed(2)),
    raidXP: Number((totals.raidXP * scaling).toFixed(2)),
    ctoXP: Number((totals.ctoXP * scaling).toFixed(2)),
    missionsXP: Number((totals.missionsXP * scaling).toFixed(2)),
    graphicXP: Number((totals.graphicXP * scaling).toFixed(2)),
    luck: Number((totals.luck * scaling).toFixed(2)),
    isCapped,
    totalGearBonus: Number(Math.min(10.0, rawTotal).toFixed(2)),
  };
}

/**
 * Returns formatted stat badges for an item adhering strictly to the 6-stat schema.
 */
export function getItem6StatBadges(item: Partial<Item>): StatBadge[] {
  const detailed = getDetailedItemStats(item);
  return detailed.all.map((st) => {
    let color = "text-amber-300 bg-amber-500/20 border-amber-500/30";
    let statKey: keyof Standard6Stats = "generalXP";

    if (st.key === "general_xp") {
      color = "text-amber-300 bg-amber-500/20 border-amber-500/30";
      statKey = "generalXP";
    } else if (st.key === "raid_xp") {
      color = "text-red-300 bg-red-500/20 border-red-500/30";
      statKey = "raidXP";
    } else if (st.key === "cto_xp") {
      color = "text-sky-300 bg-sky-500/20 border-sky-500/30";
      statKey = "ctoXP";
    } else if (st.key === "mission_xp") {
      color = "text-emerald-300 bg-emerald-500/20 border-emerald-500/30";
      statKey = "missionsXP";
    } else if (st.key === "meme_xp") {
      color = "text-purple-300 bg-purple-500/20 border-purple-500/30";
      statKey = "graphicXP";
    } else if (st.key === "luck") {
      color = "text-yellow-300 bg-yellow-500/20 border-yellow-500/30";
      statKey = "luck";
    }

    return {
      label: st.label,
      shortLabel: st.shortLabel,
      value: st.formatted,
      color,
      icon: st.icon,
      statKey,
      type: st.type,
    };
  });
}

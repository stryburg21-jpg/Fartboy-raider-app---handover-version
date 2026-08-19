export interface LevelDefinition {
  level: number;
  xpRequiredForLevel: number;
  cumulativeXP: number;
  rankTitle: string;
}

export const MAX_RAIDER_LEVEL = 80;

/**
 * Evaluates the Economy Design Bible v3.1 FINAL cumulative Lifetime XP formula:
 * XP Required = round(250 × L^2.15, -2)
 *
 * This formula represents the TOTAL cumulative Lifetime XP required to reach Level L from Level 0.
 * It is NOT summed across levels.
 */
export function calculateCumulativeXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round((250 * Math.pow(level, 2.15)) / 100) * 100;
}

export function getTitleForLevel(level: number): string {
  if (level >= 80) return "Eternal Fart Legend";
  if (level >= 70) return "Stench Warlord";
  if (level >= 60) return "Wind Warlord";
  if (level >= 50) return "Gassy Commander";
  if (level >= 40) return "Raid Vanguard";
  if (level >= 30) return "Stench Sergeant";
  if (level >= 20) return "Toot Tactician";
  if (level >= 10) return "Fart Recruit";
  return "Gas Cadet";
}

export const LEVEL_TABLE: LevelDefinition[] = (() => {
  const table: LevelDefinition[] = [];

  for (let l = 1; l <= MAX_RAIDER_LEVEL; l++) {
    const cumXP = calculateCumulativeXPForLevel(l);
    const prevCumXP = calculateCumulativeXPForLevel(l - 1);
    const xpReqForLevel = l === 1 ? 0 : cumXP - prevCumXP;

    table.push({
      level: l,
      xpRequiredForLevel: xpReqForLevel,
      cumulativeXP: cumXP,
      rankTitle: getTitleForLevel(l),
    });
  }
  return table;
})();

export function getLevelInfoFromLifetimeXP(lifetimeXP: number = 0): {
  level: number;
  xpInCurrentLevel: number;
  xpRequiredForCurrentLevel: number;
  progressPct: number;
  rankTitle: string;
  lifetimeXP: number;
} {
  const safeLT = Math.max(0, lifetimeXP);

  let calculatedLevel = 1;
  for (let l = 1; l <= MAX_RAIDER_LEVEL; l++) {
    if (safeLT >= LEVEL_TABLE[l - 1].cumulativeXP) {
      calculatedLevel = l;
    } else {
      break;
    }
  }

  if (calculatedLevel >= MAX_RAIDER_LEVEL) {
    const currentCum = LEVEL_TABLE[MAX_RAIDER_LEVEL - 1].cumulativeXP;
    const prevCum = LEVEL_TABLE[MAX_RAIDER_LEVEL - 2].cumulativeXP;
    const levelSpan = currentCum - prevCum;
    return {
      level: MAX_RAIDER_LEVEL,
      xpInCurrentLevel: levelSpan,
      xpRequiredForCurrentLevel: levelSpan,
      progressPct: 100,
      rankTitle: getTitleForLevel(MAX_RAIDER_LEVEL),
      lifetimeXP: safeLT,
    };
  }

  const currentCum = LEVEL_TABLE[calculatedLevel - 1].cumulativeXP;
  const nextCum = LEVEL_TABLE[calculatedLevel].cumulativeXP;
  const xpInCurrentLevel = safeLT - currentCum;
  const xpRequiredForCurrentLevel = nextCum - currentCum;
  const progressPct = Math.min(
    100,
    Math.max(0, Math.floor((xpInCurrentLevel / xpRequiredForCurrentLevel) * 100)),
  );

  return {
    level: calculatedLevel,
    xpInCurrentLevel,
    xpRequiredForCurrentLevel,
    progressPct,
    rankTitle: getTitleForLevel(calculatedLevel),
    lifetimeXP: safeLT,
  };
}

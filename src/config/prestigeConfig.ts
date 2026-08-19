export interface PrestigeDivisionConfig {
  id: string;
  name: string;
  percentileThreshold: number; // e.g. 0.001 for top 0.1%
  maxPlayers?: number; // e.g. max 100
  badgeIcon: string;
  color: string;
  titleReward?: {
    id: string;
    name: string;
  };
  cosmeticRewards?: Array<{
    id: string;
    type: "crown" | "border" | "nameplate" | "frame" | "badge" | "trophy";
    name: string;
  }>;
}

export const PRESTIGE_DIVISIONS: PrestigeDivisionConfig[] = [
  {
    id: "eternal_fart_legend",
    name: "Eternal Fart Legend",
    percentileThreshold: 0.001, // Top 0.1%
    maxPlayers: 100,
    badgeIcon: "👑",
    color: "from-yellow-400 via-amber-300 to-amber-500",
    titleReward: {
      id: "t_eternal_fart_legend",
      name: "Eternal Fart Legend",
    },
    cosmeticRewards: [
      { id: "crown_eternal_fart_legend", type: "crown", name: "Animated Mythic Crown" },
      { id: "trophy_eternal_legend", type: "trophy", name: "Hall of Fame Trophy" },
    ],
  },
  {
    id: "stench_warlord",
    name: "Stench Warlord",
    percentileThreshold: 0.01, // Top 1%
    badgeIcon: "⚔️",
    color: "from-purple-500 via-fuchsia-400 to-indigo-500",
    titleReward: {
      id: "t_stench_warlord",
      name: "Stench Warlord",
    },
    cosmeticRewards: [{ id: "border_stench_warlord", type: "border", name: "Legendary Border" }],
  },
  {
    id: "raid_commander",
    name: "Raid Commander",
    percentileThreshold: 0.05, // Top 5%
    badgeIcon: "🎯",
    color: "from-emerald-400 via-teal-400 to-cyan-500",
    titleReward: {
      id: "t_raid_commander",
      name: "Raid Commander",
    },
    cosmeticRewards: [
      { id: "nameplate_raid_commander", type: "nameplate", name: "Custom Nameplate" },
    ],
  },
  {
    id: "vanguard_specialist",
    name: "Vanguard Specialist",
    percentileThreshold: 0.15, // Top 15%
    badgeIcon: "🛡️",
    color: "from-blue-400 via-sky-400 to-cyan-400",
    titleReward: {
      id: "t_vanguard_specialist",
      name: "Vanguard Specialist",
    },
  },
  {
    id: "gas_cadet",
    name: "Gas Cadet",
    percentileThreshold: 0.5, // Top 50%
    badgeIcon: "💨",
    color: "from-amber-400 via-yellow-400 to-lime-400",
    titleReward: {
      id: "t_gas_cadet",
      name: "Gas Cadet",
    },
    cosmeticRewards: [{ id: "frame_gas_cadet", type: "frame", name: "Seasonal Profile Frame" }],
  },
  {
    id: "unranked",
    name: "Unranked",
    percentileThreshold: 1.0, // Bottom 50%
    badgeIcon: "🔰",
    color: "from-gray-400 to-slate-500",
    cosmeticRewards: [
      { id: "badge_season_1_participant", type: "badge", name: "Participation Badge" },
    ],
  },
];

export interface WeeklySprintRewardBracket {
  minRank: number;
  maxRank: number;
  percentileLimit?: number; // e.g. Top 10%
  description: string;
  packReward?: {
    packId: string;
    count: number;
    name: string;
  };
  xpReward: number;
  titleReward?: {
    id: string;
    name: string;
  };
}

export const WEEKLY_SPRINT_REWARDS: WeeklySprintRewardBracket[] = [
  {
    minRank: 1,
    maxRank: 3,
    description: "Ranks 1 - 3 (Podium Champions)",
    packReward: {
      packId: "pack_legendary_raider",
      count: 3,
      name: "3x Legendary Packs",
    },
    xpReward: 25000,
    titleReward: {
      id: "t_weekly_mvp",
      name: "Weekly MVP",
    },
  },
  {
    minRank: 4,
    maxRank: 10,
    description: "Ranks 4 - 10 (Top Contenders)",
    packReward: {
      packId: "pack_legendary_raider",
      count: 2,
      name: "2x Legendary Packs",
    },
    xpReward: 15000,
  },
  {
    minRank: 11,
    maxRank: 50,
    description: "Ranks 11 - 50 (High Raiders)",
    packReward: {
      packId: "pack_specialist",
      count: 2,
      name: "2x Specialist Packs",
    },
    xpReward: 7500,
  },
  {
    minRank: 51,
    maxRank: 100,
    description: "Ranks 51 - 100 (Sprint Elite)",
    packReward: {
      packId: "pack_specialist",
      count: 1,
      name: "1x Specialist Pack",
    },
    xpReward: 3500,
  },
  {
    minRank: 101,
    maxRank: 999999,
    percentileLimit: 0.1, // Top 10%
    description: "Top 10% Weekly Participants",
    packReward: {
      packId: "pack_raider",
      count: 1,
      name: "1x Raider Pack",
    },
    xpReward: 1500,
  },
];

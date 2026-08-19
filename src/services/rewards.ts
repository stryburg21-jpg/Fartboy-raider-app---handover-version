import type { Rarity } from "@/types/game";

export interface RewardEntry {
  id: string;
  kind: "xp" | "pack" | "item" | "cosmetic";
  name: string;
  detail: string;
  icon: string;
  rarity?: Rarity;
  earnedAt: string;
}

// TODO(backend): GET /api/players/:id/rewards/recent
const now = Date.now();
const mock: RewardEntry[] = [
  {
    id: "r1",
    kind: "xp",
    name: "+150 XP",
    detail: "Daily mission bonus",
    icon: "⚡",
    earnedAt: new Date(now - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "r2",
    kind: "pack",
    name: "Specialist Pack",
    detail: "Season tier reward",
    icon: "🎯",
    rarity: "epic",
    earnedAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "r3",
    kind: "item",
    name: "Raid Specialist Cape",
    detail: "Legendary cape",
    icon: "🦸",
    rarity: "legendary",
    earnedAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "r4",
    kind: "cosmetic",
    name: "Toxic Aura",
    detail: "Profile flair",
    icon: "✨",
    rarity: "rare",
    earnedAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "r5",
    kind: "xp",
    name: "+800 XP",
    detail: "Weekly streak bonus",
    icon: "⚡",
    earnedAt: new Date(now - 1000 * 60 * 60 * 30).toISOString(),
  },
];

export async function getLatestRewards(): Promise<RewardEntry[]> {
  return mock;
}

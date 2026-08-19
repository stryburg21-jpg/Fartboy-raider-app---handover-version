export interface ActivityEntry {
  id: string;
  kind: "pack" | "mission" | "level" | "item" | "raid";
  title: string;
  detail: string;
  icon: string;
  createdAt: string;
}

// TODO(backend): GET /api/players/:id/activity
const now = Date.now();
const mock: ActivityEntry[] = [
  {
    id: "a1",
    kind: "pack",
    title: "Opened Rare Pack",
    detail: "Pulled 3 items including 1 rare",
    icon: "🎁",
    createdAt: new Date(now - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "a2",
    kind: "mission",
    title: "Completed Mission",
    detail: "Post 1 Meme · +150 XP",
    icon: "🎯",
    createdAt: new Date(now - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "a3",
    kind: "level",
    title: "Reached Level 27",
    detail: "New title unlocked: Raid Captain",
    icon: "⬆️",
    createdAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "a4",
    kind: "item",
    title: "Collected New Item",
    detail: "Stinky Veil (Legendary)",
    icon: "🦸",
    createdAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "a5",
    kind: "raid",
    title: "Raided #general",
    detail: "+50 XP · Streak bonus applied",
    icon: "⚔️",
    createdAt: new Date(now - 1000 * 60 * 60 * 20).toISOString(),
  },
];

export async function getRecentActivity(): Promise<ActivityEntry[]> {
  return mock;
}

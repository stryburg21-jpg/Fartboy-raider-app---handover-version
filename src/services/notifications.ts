import type { Notification } from "@/types/game";

// TODO(backend): GET /api/notifications
const mock: Notification[] = [
  {
    id: "n1",
    title: "Daily Mission Complete",
    message: "You posted a meme. +150 XP",
    createdAt: new Date().toISOString(),
    read: false,
    kind: "reward",
  },
  {
    id: "n2",
    title: "New Season Tier",
    message: "You reached Tier 18 of Toxic Bloom.",
    createdAt: new Date().toISOString(),
    read: false,
    kind: "info",
  },
  {
    id: "n3",
    title: "Raid Ping",
    message: "The community is raiding #general — join in!",
    createdAt: new Date().toISOString(),
    read: false,
    kind: "raid",
  },
];

export async function getNotifications(): Promise<Notification[]> {
  return mock;
}

export async function markRead(_id: string): Promise<void> {
  // TODO(backend): PATCH /api/notifications/:id
}

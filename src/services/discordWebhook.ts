// Outbound Discord webhook posting — the one genuinely new piece of infra called for
// in the spec (communityLinks.ts is read-only static URLs; discordMissions.ts is
// claim-based, it never posts *into* Discord on its own).
//
// TODO backend: these should be server-side secrets (webhook URLs let anyone post to
// the channel). For a real deployment, move broadcastRareDrop / postMeterMilestone
// behind an API route and call that route from the client instead of hitting Discord
// directly from the browser. Left as client-side calls here to match this app's
// existing mock-service pattern; swap the fetch target for your API route when ready.

import type { Item, Player } from "@/types/game";
import type { MeterMilestoneConfig } from "@/config/communityMeters";
import { safeStorage } from "@/lib/storage";

const RARE_DROP_WEBHOOK_URL = import.meta.env.VITE_DISCORD_RARE_DROP_WEBHOOK_URL as
  string | undefined;
const MILESTONE_WEBHOOK_URL = (import.meta.env.VITE_DISCORD_MILESTONE_WEBHOOK_URL ||
  RARE_DROP_WEBHOOK_URL) as string | undefined;

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  thumbnail?: { url: string };
  footer?: { text: string };
}

async function postDiscordEmbed(
  webhookUrl: string | undefined,
  embed: DiscordEmbed,
): Promise<void> {
  if (!webhookUrl) {
    // No webhook configured (e.g. local dev) — log instead of failing silently.
    console.log("[Discord webhook] (not configured) would post:", embed);
    return;
  }
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (e) {
    // Never let a failed webhook post break the pack-opening / meter flow.
    console.error("[Discord webhook] post failed", e);
  }
}

const RARITY_OPT_OUT_STORAGE_KEY = "fartboy_broadcast_opt_out_v1";

/** Player setting: exclude their name from public rare-drop broadcasts. Default: opted in (visible). */
export function getBroadcastOptOut(): boolean {
  try {
    return safeStorage.getItem(RARITY_OPT_OUT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setBroadcastOptOut(optOut: boolean): void {
  try {
    safeStorage.setItem(RARITY_OPT_OUT_STORAGE_KEY, optOut ? "1" : "0");
  } catch {
    // ignore
  }
}

/**
 * Feature 2: Public Rare-Drop Broadcasts.
 * Fires after a pack/pull resolves — reads the already-computed rarity result,
 * doesn't recompute anything.
 */
export async function broadcastRareDrop(player: Player, item: Item): Promise<void> {
  if (item.rarity !== "legendary" && item.rarity !== "mythic") return;

  const optedOut = getBroadcastOptOut();
  const displayName = optedOut ? "A Raider" : player.username;

  await postDiscordEmbed(RARE_DROP_WEBHOOK_URL, {
    title: item.rarity === "mythic" ? "🌟 MYTHIC PULL!" : "🟣 LEGENDARY PULL!",
    description: `**${displayName}** just pulled **${item.name}**!`,
    thumbnail: item.image ? { url: item.image } : undefined,
    color: item.rarity === "mythic" ? 0xffd700 : 0x9b30ff,
  });
}

/**
 * Milestone unlock announcement, shared by the Season Meter and Warchest Meter.
 * `creditUsername` is optional — used by the Warchest Meter to name-credit whoever's
 * contribution pushed the meter over the threshold.
 */
export async function postMeterMilestoneAnnouncement(
  meterLabel: string,
  milestone: MeterMilestoneConfig,
  creditUsername?: string,
): Promise<void> {
  const creditLine = creditUsername
    ? `Thanks to **${creditUsername}**'s contribution, the community just unlocked this milestone!\n\n`
    : "";

  await postDiscordEmbed(MILESTONE_WEBHOOK_URL, {
    title: `🎉 ${meterLabel} — ${milestone.label}`,
    description: `${creditLine}${milestone.rewardDescription}\n\nEveryone active this week gets the reward — check your inventory!`,
    color: 0x34d399,
    footer: { text: "Resets weekly · fartboy.io" },
  });
}

import { awardActivityXP } from "@/services/xpEngine";
import { trackMissionEvent } from "@/services/missions";
import { useGameStore } from "@/store/gameStore";
import { getActiveProfileData } from "@/services/profiles";
import { safeStorage } from "@/lib/storage";

export type DiscordRoomTab =
  "cto_sniper" | "personal_social" | "memes_video" | "discord_chat" | "milestones";

export interface DiscordRoomMissionDef {
  id: string;
  tab: DiscordRoomTab;
  title: string;
  roomTag: string;
  actionRequirements: string;
  baseRewardXP: number;
  multiplierText?: string;
  dailyCap: number;
  requiresModApproval: boolean;
  discordUrl: string;
  rules: string[];
}

export const DISCORD_ROOM_MISSIONS: DiscordRoomMissionDef[] = [
  // 1. CTO & SNIPER ROOM
  {
    id: "cto_official_post",
    tab: "cto_sniper",
    title: "CTO Official Post Raid",
    roomTag: "#cto-official-post",
    actionRequirements: "Like + Comment + Bookmark on X",
    baseRewardXP: 500,
    dailyCap: 3,
    requiresModApproval: false,
    discordUrl: "https://discord.gg/fartboy",
    rules: [
      "Navigate to #cto-official-post on Discord to locate the latest active raid target.",
      "Execute all 3 required actions on X/Twitter: Like, Comment (min 5 words), and Bookmark.",
      "Click 'CLAIM GREEN TICK' to verify raid execution and credit 500 XP directly to your spendable balance.",
      "Maximum 3 claims per 24h daily reset window (1,500 XP daily cap).",
    ],
  },
  {
    id: "cto_snipe_partner",
    tab: "cto_sniper",
    title: "CTO Snipe / Partner Engagement",
    roomTag: "#cto-snipe-targets",
    actionRequirements: "Post link to partner thread & execute reply/retweet",
    baseRewardXP: 600,
    dailyCap: 5,
    requiresModApproval: false,
    discordUrl: "https://discord.gg/fartboy",
    rules: [
      "Check #cto-snipe-targets on Discord for priority partner thread alerts.",
      "Reply with high-value community banter, meme graphics, or $FARTBOY bullish analysis.",
      "Paste your tweet/reply link or click verify to receive a Green Tick.",
      "Earn 600 XP per verified snipe up to 5 times per day (3,000 XP daily cap).",
    ],
  },
  {
    id: "sniper_team_engagement",
    tab: "cto_sniper",
    title: "Sniper Team Engagement",
    roomTag: "#sniper-squad-raids",
    actionRequirements: "Rapid response engagement within 15 mins of target ping",
    baseRewardXP: 300,
    dailyCap: 10,
    requiresModApproval: false,
    discordUrl: "https://discord.gg/fartboy",
    rules: [
      "Join the #sniper-squad-raids channel and enable notifications for instant raid pings.",
      "Engage on X within 15 minutes of target announcement for maximum algorithm impact.",
      "Each rapid response awards 300 XP + Green Tick verification.",
      "Maximum 10 rapid snipes permitted daily (3,000 XP daily cap).",
    ],
  },

  // 2. PERSONAL & SOCIAL
  {
    id: "personal_fartboy_post",
    tab: "personal_social",
    title: "Personal Fartboy Post / Engagement",
    roomTag: "#personal-fartboy-posts",
    actionRequirements: "Share personal original post tagging @Fartboy or $FARTBOY hashtag",
    baseRewardXP: 150,
    dailyCap: 20,
    requiresModApproval: false,
    discordUrl: "https://discord.gg/fartboy",
    rules: [
      "Publish an original tweet on X/Twitter mentioning @Fartboy or $FARTBOY.",
      "Share the link in #personal-fartboy-posts to encourage squad engagement.",
      "Earn 150 XP per registered personal post.",
      "Daily limit of 20 posts per 24h reset window (3,000 XP max daily potential).",
    ],
  },

  // 3. MEMES & VIDEO
  {
    id: "meme_channel_submission",
    tab: "memes_video",
    title: "Meme Channel Submission",
    roomTag: "#memes-submission",
    actionRequirements: "Submit original high-effort meme image or GIF",
    baseRewardXP: 2000,
    multiplierText: "Quality Multiplier 1.0x - 2.5x",
    dailyCap: 2,
    requiresModApproval: true,
    discordUrl: "https://discord.gg/fartboy",
    rules: [
      "Create high-quality original memes or animated GIFs related to $FARTBOY.",
      "Upload your meme in #memes-submission on Discord.",
      "Green Tick Moderator Approval is required for payout verification.",
      "Base reward: 2,000 XP. Top-tier creative memes receive up to 2.5x quality multiplier (5,000 XP).",
      "Maximum 2 approved meme submissions daily.",
    ],
  },
  {
    id: "video_channel_submission",
    tab: "memes_video",
    title: "Video Channel Submission",
    roomTag: "#video-reels-submission",
    actionRequirements: "Upload TikTok / Reel / YouTube Short (Min 15 sec)",
    baseRewardXP: 5000,
    multiplierText: "Quality Multiplier 1.0x - 3.0x",
    dailyCap: 1,
    requiresModApproval: true,
    discordUrl: "https://discord.gg/fartboy",
    rules: [
      "Produce a short vertical video (TikTok, Instagram Reel, YouTube Short) featuring Fartboy branding or lore.",
      "Minimum video duration: 15 seconds.",
      "Submit video link in #video-reels-submission for Green Tick Moderator Review.",
      "Base reward: 5,000 XP. Viral/High-effort videos receive up to 3.0x multiplier (15,000 XP max).",
      "Maximum 1 video submission per day.",
    ],
  },

  // 4. DISCORD CHAT
  {
    id: "discord_community_activity",
    tab: "discord_chat",
    title: "Discord Community Activity",
    roomTag: "#general-chat",
    actionRequirements: "Chat and participate in active community conversations",
    baseRewardXP: 15,
    multiplierText: "15 XP / message • 300 XP Daily Max",
    dailyCap: 20, // 20 * 15 = 300 XP
    requiresModApproval: false,
    discordUrl: "https://discord.gg/fartboy",
    rules: [
      "Participate in active text channels like #general-chat, #raid-discussion, and #memes.",
      "Each meaningful chat interaction logs 15 XP directly to your daily cap counter.",
      "Track real-time progress on the activity progress bar up to the 300 XP daily max (20 interactions).",
      "Resets every day at 00:00 UTC.",
    ],
  },
];

const DISCORD_MISSIONS_STORAGE_KEY = "fartboy_discord_room_missions_v3";

interface StoredRoomState {
  dateUtc: string;
  counts: Record<string, number>; // missionId -> completedCount
  greenTicks: Record<string, boolean>; // missionId -> hasGreenTick
}

function getTodayUtc(): string {
  return new Date().toISOString().split("T")[0];
}

function loadRoomState(): StoredRoomState {
  const today = getTodayUtc();
  try {
    const raw = safeStorage.getItem(DISCORD_MISSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredRoomState;
      if (parsed.dateUtc === today) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed loading discord room state", e);
  }

  return {
    dateUtc: today,
    counts: {},
    greenTicks: {},
  };
}

function saveRoomState(state: StoredRoomState): void {
  try {
    safeStorage.setItem(DISCORD_MISSIONS_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed saving discord room state", e);
  }
}

export function getRoomMissionCompletedCount(missionId: string): number {
  const state = loadRoomState();
  return state.counts[missionId] || 0;
}

export function getRoomMissionGreenTick(missionId: string): boolean {
  const state = loadRoomState();
  return !!state.greenTicks[missionId];
}

export async function executeDiscordRoomMission(
  missionId: string,
  linkInput?: string,
): Promise<{ success: boolean; message: string; xpEarned: number; newCount: number }> {
  const def = DISCORD_ROOM_MISSIONS.find((m) => m.id === missionId);
  if (!def) {
    return { success: false, message: "Mission definition not found.", xpEarned: 0, newCount: 0 };
  }

  const state = loadRoomState();
  const currentCount = state.counts[missionId] || 0;

  if (currentCount >= def.dailyCap) {
    return {
      success: false,
      message: `Daily cap reached (${def.dailyCap}/${def.dailyCap}). Resets at 00:00 UTC!`,
      xpEarned: 0,
      newCount: currentCount,
    };
  }

  const nextCount = currentCount + 1;
  state.counts[missionId] = nextCount;
  if (nextCount >= def.dailyCap || def.requiresModApproval) {
    state.greenTicks[missionId] = true;
  }
  saveRoomState(state);

  // Award XP via awardActivityXP
  const xpRes = await awardActivityXP({
    activityType:
      def.tab === "memes_video"
        ? "content_meme_graphic"
        : def.tab === "cto_sniper"
          ? "social_raid_like_rt"
          : "social_raid_post",
    customBaseXP: def.baseRewardXP,
    note: `Discord Room Mission: ${def.title} (${def.roomTag})`,
  });

  // Track event in mission engine
  if (def.tab === "cto_sniper") {
    await trackMissionEvent("raid_verified", 1);
  } else if (def.tab === "memes_video") {
    await trackMissionEvent("content_approved", 1);
  } else if (def.tab === "discord_chat") {
    await trackMissionEvent("discord_activity_played", 1);
  }

  // Update GameStore player state
  const profile = getActiveProfileData();
  useGameStore.getState().setPlayer({ ...profile.player });

  const xpEarned = xpRes.netXPAwarded || def.baseRewardXP;
  const modNote = def.requiresModApproval ? " (Pending Green Tick Mod Approval)" : "";
  const msg = `✓ Green Tick Action Registered! Earned +${xpEarned.toLocaleString()} XP (${nextCount}/${def.dailyCap} daily)${modNote}`;

  return {
    success: true,
    message: msg,
    xpEarned,
    newCount: nextCount,
  };
}

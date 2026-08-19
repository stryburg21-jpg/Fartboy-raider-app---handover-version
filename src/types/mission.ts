export type VerificationType = "discord_emoji_check" | "api_sync" | "manual";
export type MissionStatus =
  | "unsealed"
  | "in_progress"
  | "pending_bot_sync"
  | "claimable"
  | "claimed"
  | "unstarted"
  | "verifying"
  | "verified";
export type MissionRarity = "common" | "rare" | "epic" | "legendary";

export interface MissionItemReward {
  id: string;
  name: string;
  rarity: MissionRarity;
  image: string;
}

export interface Mission {
  id: string; // Unique slug ID, e.g., "frontline-scout"
  title: string;
  description: string;
  xpReward: number;
  itemReward?: MissionItemReward;
  category: "daily" | "weekly" | "season" | "milestones";
  rarity: MissionRarity;

  // Backend & Discord Bot Integration Fields
  discordChannel: string; // e.g., "#cto-official-post"
  discordChannelId?: string; // Target channel ID for bot checking
  verificationType: VerificationType;
  apiEndpoint: string; // e.g., "/api/v1/missions/verify/frontline-scout"

  // Progress Tracking
  progress: number;
  maxProgress: number;
  status: MissionStatus;
  canReroll?: boolean;
}

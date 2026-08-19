export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";

export type EquipmentSlot =
  | "head"
  | "body"
  | "shorts"
  | "feet"
  | "back"
  | "pet"
  | "powerItem"
  | "avatar"
  | "frame"
  | "background"
  | "cosmeticTheme";

export type ItemStatKey =
  "generalXP" | "raidXP" | "ctoXP" | "missionsXP" | "graphicXP" | "videoXP" | "luck";
export type CapeStatKey = "packLuck" | "legendaryChance" | "rareChance" | "rerollChance";

export interface ItemStats {
  generalXP?: number;
  raidXP?: number;
  ctoXP?: number;
  missionsXP?: number;
  graphicXP?: number;
  videoXP?: number;
  luck?: number;
  // Legacy aliases
  activity?: number;
  consistency?: number;
  streak?: number;
}

export interface CapeStats {
  packLuck?: number;
  legendaryChance?: number;
  rareChance?: number;
  rerollChance?: number;
}

export interface Item {
  id: string;
  itemId?: string;
  templateId?: string;
  name: string;
  slot: EquipmentSlot;
  slotName?: string;
  rarity: Rarity;
  image: string;
  thumbnail?: string;
  description: string;
  flavourText?: string;
  set: string;
  specialistSet?: string;
  raidPower?: number;
  bonusXP: number;
  collectionNumber: number;
  season: number;
  forgeable: boolean;
  rerollable: boolean;
  dropRate: number;
  stats?: ItemStats;
  capeStats?: CapeStats;
  level?: number;
  maxLevel?: number;
  statRerollVersion?: number;
  duplicateCount?: number;
  owned?: boolean;
  equipped?: boolean;
  /** Transparent overlay PNG URL for Paperdoll Equipment Stacking System */
  overlayUrl?: string;
  /** Cosmetic theme assets (only populated on cosmeticTheme slot items) */
  themeAssets?: {
    borderImage: string;
    hqImage: string;
    hqVideo: string;
    forgeImage: string;
    forgeVideo: string;
  };
  /**
   * Character HQ frame assets (only populated on "frame" slot items). The frame
   * wraps the OUTSIDE of the Character HQ display stage as an unlockable cosmetic —
   * swapping the equipped frame item changes the border, no code changes needed.
   * `video` should have a transparent/black center (rendered with mix-blend-mode:
   * screen) so only the frame artwork is visible, never a solid rectangle.
   */
  frameAsset?: {
    /** Looping video (black "hole" center) composited with mix-blend-mode: screen */
    video: string;
    /** Static transparent PNG fallback/poster for 2D mode and thumbnails */
    image: string;
  };
  /**
   * Full-stage ambient effect (only populated on "powerItem" slot cosmetics that
   * opt out of the small circular equip-badge treatment). Unlike `overlayUrl`
   * (a small badge rendered at the item's TARGET_NODE position, same as pet
   * cosmetics), this asset is stretched across the ENTIRE character canvas,
   * layered behind the character render so it reads as an ambient effect
   * (lightning, aura, etc.) surrounding the raider without ever covering the
   * character artwork itself. Accepts a static image or an animated GIF/APNG.
   */
  fullFrameEffect?: string;
  /** Whether this item was unboxed/manipulated in tutorial sandbox mode and should not persist */
  isTutorialAsset?: boolean;
  /** Extensible item metadata for custom backend tags, artwork variants, or season IDs */
  metadata?: Record<string, unknown>;
}

export interface Pack {
  id: string;
  name: string;
  rarity: Rarity;
  description: string;
  image: string;
  /** Pool of items the pack can contain. */
  contents: string[];
  /** Rarity -> probability. Sums to 1. */
  probabilities: Record<Rarity, number>;
  configId?: string;
  cost?: number;
  badge?: string;
  targetSetName?: string;
}

export interface ItemSet {
  name: string;
  category?: string;
  specialistIdentity?: string;
  description: string;
  bonusDescription: string;
  fullSetReward?: string;
  /** Exactly 7 item ids form a complete set. */
  requiredItemIds: string[];
  ownedItemIds: string[];
  completed: boolean;
}

export type MissionType = "daily" | "weekly" | "seasonal" | "community" | "special";

export interface MissionReward {
  xp?: number;
  reputation?: number;
  itemId?: string;
  packId?: string;
  description?: string;
}

export interface Mission {
  id: string;
  type: MissionType;
  category?: MissionType;
  title: string;
  description: string;
  requirement: number;
  progress: number;
  reward: MissionReward;
  artwork?: string;
  status?: "available" | "in_progress" | "completed" | "claimed";
  expiry?: string;
  completed: boolean;
}

export interface AchievementRewardPack {
  type: string;
  qty: number;
}

export interface AchievementRewardMaterial {
  type: string;
  qty: number;
}

export interface AchievementReward {
  xp?: number;
  title?: string;
  discordTag?: string;
  item?: string;
  badge?: string;
  packs?: AchievementRewardPack[];
  materials?: AchievementRewardMaterial[];
}

export interface MissionDossier {
  dossierNumber: string;
  dept: string;
  title: string;
  targetChannel: string;
  externalUrl: string;
  actionButtonText: string;
  xpBounty: number;
  itemReward?: string;
  rarity: string;
  brief: {
    step1: string;
    step2: string;
    step3: string;
  };
  verificationType: string;
  verificationNote: string;
}

export interface Achievement {
  id: string;
  name: string;
  title?: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
  rarity?: Rarity;
  tier?: "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC" | string;
  category?: string;
  type?: string;
  targetValue?: number;
  discordTag?: string;
  reward?: AchievementReward;
  rewards?: AchievementReward;
  /** locked = not yet available; unlocked = available/in progress; completed = fully earned. */
  state?: "locked" | "unlocked" | "completed";
  progress?: number;
  requirement?: number;
  dossierNumber?: string;
  dept?: string;
  targetChannel?: string;
  externalUrl?: string;
  actionButtonText?: string;
  xpBounty?: number;
  itemReward?: string;
  brief?: {
    step1: string;
    step2: string;
    step3: string;
  };
  verificationType?: string;
  verificationNote?: string;
  dossier?: MissionDossier;
}

export interface Title {
  id: string;
  name: string;
  equipped: boolean;
  unlocked?: boolean;
  description?: string;
}

export interface DiscordRole {
  id: string;
  label: string;
  icon: string;
  color: string;
  earned: boolean;
  type: "Game Role" | "Contributor Rank" | "Title" | "Discord Role";
  description?: string;
}

export interface PlayerContributionStats {
  raidsCompleted: number;
  memesCreated: number;
  videosCreated: number;
  postsSupported?: number;
  ctoContributions?: number;
  missionContributions?: number;
  lastUpdated?: string;
}

export interface LifetimeStats {
  raids: number;
  memes: number;
  videos: number;
  packsOpened: number;
  itemsCollected: number;
  legendaryItemsFound?: number;
}

export interface SeasonProgress {
  seasonId: string;
  seasonName: string;
  currentTier: number;
  totalTiers: number;
  xpIntoTier: number;
  xpPerTier: number;
  /**
   * Contributor Track Access (Non-P2W: cosmetic & spendable XP rewards only).
   * Restricts access to the secondary/premium tier reward branch ONLY to users with an active Contributor Rank.
   */
  contributorTierUnlocked?: boolean;
  /** Backward compatibility alias for contributorTierUnlocked */
  premium: boolean;
}

export interface Player {
  id: string;
  username: string;
  avatar: string;
  level: number;
  lifetimeXP: number;
  spendableXP: number;
  xp: number;
  xpToNext: number;
  reputation: number;
  raidCount: number;
  equipped: Partial<Record<EquipmentSlot, string>>;
  contributorRank: string;
  supporterRank: string;
  achievements: string[];
  titles: Title[];
  seasonProgress: SeasonProgress;
  lifetimeStats: LifetimeStats;
  loginStreak: number;
  notificationCount: number;
  /** Player-selected showcase picks — surfaced on Character & public profile. */
  favoriteItemId?: string;
  favoriteTitleId?: string;
  favoriteAchievementId?: string;
  hasCompletedTutorial?: boolean;
  pityState?: {
    epicPityCounter: number;
    legendaryPityCounter: number;
    totalPacksOpened: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  avatar: string;
  level?: number;
  specialistIdentity?: string;
  contributorTitle?: string;
  titleXPBoostPct?: number;
  lifetimeXP: number;
  xp: number;
  seasonXP?: number;
  raidCount: number;
  memesCount?: number;
  videosCount?: number;
  equippedItemIcons?: string[];
  reputation?: number;
}

export interface PlayerPositionData {
  mode: "season" | "lifetime";
  rank: number;
  totalPlayers: number;
  seasonXP: number;
  lifetimeXP: number;
  currentTitle: string;
  specialistIdentity: string;
  currentBracketLabel: string;
  nextTierName: string;
  placesAwayFromNextTier: number;
  xpNeededForNextTier: number;
  activeRewards: {
    titleReward?: string;
    packReward?: string;
    xpBoostPct?: number;
    badge?: string;
  };
  modeDescription: string;
}

export interface PlacementRewardBracket {
  id: string;
  placementLabel: string;
  badge: string;
  titleReward?: string;
  packReward?: string;
  xpBonus?: number;
  nextSeasonXPBoostPct?: number;
  description: string;
  highlighted?: boolean;
  tierColor?:
    | "gold"
    | "silver"
    | "bronze"
    | "purple"
    | "cyan"
    | "emerald"
    | "amber"
    | "slate"
    | "default"
    | string;
}

export type SeasonRewardTier = PlacementRewardBracket;

export interface SeasonDetails {
  id: string;
  name: string;
  seasonNumber: number;
  endDate: string;
  daysRemaining: number;
  hoursRemaining: number;
  status: "active" | "ended" | "upcoming";
  previousSeasonWinner?: {
    username: string;
    avatar: string;
    title: string;
    seasonXP: number;
  };
  nextSeasonPreview?: {
    name: string;
    theme: string;
    startDate: string;
  };
}

export interface SeasonTier {
  tier: number;
  freeReward?: MissionReward;
  /**
   * Contributor Track Reward (Cosmetic / Spendable XP only, non-pay-to-win).
   * Accessible exclusively when contributorTierUnlocked is true (active Contributor Rank).
   */
  contributorReward?: MissionReward;
  /** Backward compatibility alias for contributorReward */
  premiumReward?: MissionReward;
  unlocked: boolean;
}

export interface ShopListing {
  id: string;
  kind: "pack" | "item" | "cosmetic";
  refId: string;
  name: string;
  image: string;
  iconEmoji?: string;
  priceXP?: number;
  originalPriceXP?: number;
  currencyType?: "XP" | "rep";
  discountBadge?: string;
  description: string;
  rarity?: Rarity;
  category?: string;
  categoryGroup?: "Season 1 Packs" | "Cosmetics" | "Item Offers";
  featured?: boolean;
  packGrantId?: string;
  itemGrantId?: string;
  slot?: EquipmentSlot;
  specialistSet?: string;
  rewardPreview?: string;
  availability?: string;
  probabilities?: Record<Rarity, number>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  kind: "info" | "reward" | "system" | "raid";
}

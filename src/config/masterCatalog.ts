import type { EquipmentSlot, Item, ItemSet, Rarity } from "@/types/game";

export interface SlotConfig {
  key: EquipmentSlot;
  label: string;
  icon: string;
  emptyHelp: string;
}

export const SEASON_1_SLOTS: SlotConfig[] = [
  { key: "head", label: "Hat", icon: "🪖", emptyHelp: "Head-based cosmetics and bonuses" },
  { key: "body", label: "Top", icon: "👕", emptyHelp: "Shirts, jackets, armour, clothing" },
  { key: "shorts", label: "Shorts", icon: "🩳", emptyHelp: "Lower-body equipment" },
  { key: "feet", label: "Boots", icon: "🥾", emptyHelp: "Movement/support equipment" },
  { key: "back", label: "Cape", icon: "🦸", emptyHelp: "Prestige and legendary equipment slot" },
  { key: "pet", label: "Pet", icon: "🐾", emptyHelp: "Companion-based items" },
  {
    key: "powerItem",
    label: "Power Item",
    icon: "⚡",
    emptyHelp: "Special utility equipment",
  },
];

export interface RarityConfig {
  label: string;
  raidPower: number;
  bonusXP: number;
  dropRate: number;
  forgeable: boolean;
  rerollable: boolean;
}

export const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
  common: {
    label: "Common",
    raidPower: 10,
    bonusXP: 2,
    dropRate: 0.5,
    forgeable: true,
    rerollable: false,
  },
  uncommon: {
    label: "Uncommon",
    raidPower: 15,
    bonusXP: 5,
    dropRate: 0.25,
    forgeable: true,
    rerollable: false,
  },
  rare: {
    label: "Rare",
    raidPower: 25,
    bonusXP: 10,
    dropRate: 0.15,
    forgeable: true,
    rerollable: true,
  },
  epic: {
    label: "Epic",
    raidPower: 45,
    bonusXP: 20,
    dropRate: 0.06,
    forgeable: true,
    rerollable: true,
  },
  legendary: {
    label: "Legendary",
    raidPower: 85,
    bonusXP: 40,
    dropRate: 0.03,
    forgeable: true,
    rerollable: true,
  },
  mythic: {
    label: "Mythic",
    raidPower: 120,
    bonusXP: 60,
    dropRate: 0.01,
    forgeable: false,
    rerollable: true,
  },
};

export interface SetDefinition {
  name: string;
  category: string;
  specialistIdentity: string;
  description: string;
  bonusDescription: string;
  fullSetReward: string;
  icon: string;
}

export const SEASON_1_SETS: SetDefinition[] = [
  {
    name: "Raid Specialist",
    category: "Raid Specialist",
    specialistIdentity: "Community Vanguard",
    description:
      "Built for tactical raid commanders storming high-priority social media campaigns.",
    bonusDescription: "+15% Raid XP on X Raids & Snipes when full set is equipped.",
    fullSetReward: "Title: 'Raid Commander' + 1,000 Spendable XP",
    icon: "⚡",
  },
  {
    name: "CTO Specialist",
    category: "CTO Specialist",
    specialistIdentity: "Community Takeover Lead",
    description: "Engineered for community takeover architects leading project revive missions.",
    bonusDescription:
      "+15% CTO XP on CTO Raids, Snipes & Suggested Posts when full set is equipped.",
    fullSetReward: "Title: 'CTO Architect' + Golden Telegram Key",
    icon: "🏛️",
  },
  {
    name: "Meme Specialist",
    category: "Meme Specialist",
    specialistIdentity: "Viral Architect",
    description:
      "Crafted for creative meme creators whose viral jokes trend across timeline feeds.",
    bonusDescription: "+15% Meme XP on Meme & Graphic submissions when full set is equipped.",
    fullSetReward: "Title: 'Meme Lord' + Holographic Pepe Cape",
    icon: "🐸",
  },
  {
    name: "Video Specialist",
    category: "Video Specialist",
    specialistIdentity: "Production Director",
    description: "Tailored for video creators, editors, streamers, and studio production leads.",
    bonusDescription: "+15% Video XP on Short Video & Reel submissions when full set is equipped.",
    fullSetReward: "Title: 'Studio Director' + Golden Mic Trophy",
    icon: "🎬",
  },
  {
    name: "Mission Specialist",
    category: "Mission Specialist",
    specialistIdentity: "Vault Hoarder",
    description: "Designed for pack crackers and treasure collectors seeking rare vault drops.",
    bonusDescription:
      "+1 Daily Mission Slot & 20% Mission Cooldown Reduction when full set is equipped (Flat Mission XP enforced).",
    fullSetReward: "Title: 'Goblin King' + Midas Gold Vault Key",
    icon: "👺",
  },
  {
    name: "Season Specialist",
    category: "Season Specialist",
    specialistIdentity: "Seasoned Veteran",
    description:
      "All-around tactical gear providing balanced progression across every raider activity.",
    bonusDescription: "+10% General XP boost across all activities when full set is equipped.",
    fullSetReward: "Title: 'Season 1 Veteran' + Master Season Trophy",
    icon: "🎖️",
  },
];

// Helper to ensure valid EquipmentSlot
export function normalizeSlot(slot: string | undefined | null): EquipmentSlot {
  if (!slot) return "head";
  const lower = slot.toLowerCase();
  if (lower === "theme" || lower === "cosmetictheme") return "cosmeticTheme";
  if (lower === "frame" || lower === "hqframe") return "frame";
  if (lower === "hat") return "head";
  if (lower === "top") return "body";
  if (lower === "boots" || lower === "socks") return "feet";
  if (lower === "cape") return "back";
  return lower as EquipmentSlot;
}

// Structured Item Naming Dictionary for 6 Sets x 7 Slots x 6 Rarities (252 Items)
const ITEM_DEFINITIONS: Record<
  string, // set
  Record<
    string,
    Record<Rarity, { name: string; image: string; description: string; flavourText: string }>
  >
> = {
  "Raid Specialist": {
    head: {
      common: {
        name: "Tactical Raid Bandana",
        image: "🧢",
        description: "Standard tactical sweatband for long raids.",
        flavourText: "Keeps the sweat out of your eyes while spamming raid triggers.",
      },
      uncommon: {
        name: "Vanguard Gas Helmet",
        image: "🪖",
        description: "Reinforced helmet fitted with anti-fume vents.",
        flavourText: "Smells like victory and stale energy drinks.",
      },
      rare: {
        name: "Commando Tactical Visor",
        image: "🥽",
        description: "HUD overlay showing target channel activity.",
        flavourText: "Locks onto low-engagement tweets instantly.",
      },
      epic: {
        name: "Raid Specialist Crown",
        image: "👑",
        description: "Regal headpiece radiating commander authority.",
        flavourText: "Worn by those who lead 100+ raiders into battle.",
      },
      legendary: {
        name: "Overlord Methane Helm",
        image: "🐲",
        description: "Heavy titanium helm surging with toxic energy.",
        flavourText: "Breathes concentrated hype into community channels.",
      },
      mythic: {
        name: "Apex Raid Specialist Halo",
        image: "🌟",
        description: "Golden celestial halo of the ultimate raid god.",
        flavourText: "Legends say a single whiff can rally an entire blockchain.",
      },
    },
    body: {
      common: {
        name: "Scout Kevlar Vest",
        image: "👕",
        description: "Light armor offering protection against comment FUD.",
        flavourText: "Deflects minor insults and basic bot attacks.",
      },
      uncommon: {
        name: "Vanguard Heavy Chestplate",
        image: "🛡️",
        description: "Thick plated chestpiece for front-line raids.",
        flavourText: "Built to withstand toxic thread onslaughts.",
      },
      rare: {
        name: "Commando Tactical Rig",
        image: "🥋",
        description: "Utility vest stacked with quick-deploy raid macros.",
        flavourText: "Every pouch holds a fresh set of reaction memes.",
      },
      epic: {
        name: "Raid Specialist Cuirass",
        image: "🥇",
        description: "Gleaming armor infused with community momentum.",
        flavourText: "Radiates unyielding confidence under heavy ratio fires.",
      },
      legendary: {
        name: "Overlord Bio-Suit Top",
        image: "☣️",
        description: "Full environmental suit housing high-compression gas.",
        flavourText: "Sealed tight to contain dangerous levels of hype.",
      },
      mythic: {
        name: "Apex Raid Sovereign Plate",
        image: "✨",
        description: "Celestial armor forged in the fires of viral raids.",
        flavourText: "Imbues the wearer with infinite campaign stamina.",
      },
    },
    shorts: {
      common: {
        name: "Scout Cargo Shorts",
        image: "🩳",
        description: "Durable tactical shorts with deep storage pockets.",
        flavourText: "Holds enough energy chews for a 12-hour raid.",
      },
      uncommon: {
        name: "Vanguard Reinforced Shorts",
        image: "🩳",
        description: "Padded tactical shorts engineered for endurance.",
        flavourText: "Stitching reinforced against intense desktop sessions.",
      },
      rare: {
        name: "Commando Camo Shorts",
        image: "🩳",
        description: "Patterned combat shorts designed for undercover raids.",
        flavourText: "Blends seamlessly into timeline comment threads.",
      },
      epic: {
        name: "Raid Specialist Greaves",
        image: "🩳",
        description: "Armored legwear forged for elite front-line marshals.",
        flavourText: "Heavy plating for stomping out rival fud.",
      },
      legendary: {
        name: "Overlord Methane Shorts",
        image: "🩳",
        description: "Toxic-insulated shorts pulsing with biohazard aura.",
        flavourText: "Leaves a trail of green fumes behind every step.",
      },
      mythic: {
        name: "Apex Raid Celestial Kilt",
        image: "🩳",
        description: "Mythic ceremonial kilts woven with golden ether.",
        flavourText: "Worn by commanders commanding global trend blitzes.",
      },
    },
    feet: {
      common: {
        name: "Rookie Combat Boots",
        image: "🥾",
        description: "Standard issue boots for treaded timeline navigation.",
        flavourText: "Solid grip on slippery sentiment trends.",
      },
      uncommon: {
        name: "Vanguard Stompers",
        image: "👞",
        description: "Steel-toed boots built to squash bear narratives.",
        flavourText: "Leaves deep prints in hostile comment sections.",
      },
      rare: {
        name: "Commando Mag-Boots",
        image: "👟",
        description: "Magnetic boots sticking firmly to high-traffic threads.",
        flavourText: "Never lose traction during market volatility.",
      },
      epic: {
        name: "Raid Specialist Sabatons",
        image: "🥾",
        description: "Heavy metallic sabatons vibrating with raid boost energy.",
        flavourText: "Stomps ratio records into digital dust.",
      },
      legendary: {
        name: "Overlord Vapor Treaders",
        image: "🥾",
        description: "Boots hovering on cushion jets of concentrated methane.",
        flavourText: "Walks above the toxic noise without touching ground.",
      },
      mythic: {
        name: "Apex Raid Striders",
        image: "👟",
        description: "Celestial boots allowing instant cross-platform traversal.",
        flavourText: "Step from Telegram to X in a single heartbeat.",
      },
    },
    back: {
      common: {
        name: "Scout Tactical Cape",
        image: "🦸",
        description: "Simple cloth cape displaying the raid emblem.",
        flavourText: "Flutters dramatically during intense raid blitzes.",
      },
      uncommon: {
        name: "Vanguard Battle Banner",
        image: "🚩",
        description: "Rigid back-mounted banner signaling rally points.",
        flavourText: "Visible across congested social feeds.",
      },
      rare: {
        name: "Commando Vapor Wings",
        image: "🪽",
        description: "Glider wings channeling exhaust fumes for extra mobility.",
        flavourText: "Soars over comment section clutter.",
      },
      epic: {
        name: "Raid Specialist Cape",
        image: "🦸",
        description: "Heavy velvet cape trim with gold-embroidered runes.",
        flavourText: "Grants +20% Pack Luck on all vault pulls.",
      },
      legendary: {
        name: "Overlord Methane Cloak",
        image: "🥻",
        description: "Cloak woven from dark vapor and bioluminescent gas.",
        flavourText: "Increases Legendary drop rates significantly.",
      },
      mythic: {
        name: "Apex Raid Sovereign Wings",
        image: "🌟",
        description: "Radiant wings forged from pure viral momentum.",
        flavourText: "Guarantees reroll luck and max luck stats.",
      },
    },
    pet: {
      common: {
        name: "Raid Hound Puppy",
        image: "🐕",
        description: "Loyal canine scout barking at incoming target posts.",
        flavourText: "Sniffs out viral tweets before they hit the feed.",
      },
      uncommon: {
        name: "Vanguard Falcon",
        image: "🦅",
        description: "Recon bird carrying raid trigger notifications.",
        flavourText: "Pings targets with high precision speed.",
      },
      rare: {
        name: "Commando Cyber Lynx",
        image: "🐱",
        description: "Agile cybernetic feline hunting low-engagement threads.",
        flavourText: "Pounces on target posts within 3 seconds.",
      },
      epic: {
        name: "Raid Specialist Griffin",
        image: "🦁",
        description: "Majestic mythical beast roaring encouragement during raids.",
        flavourText: "Rallies entire battalions into comment sections.",
      },
      legendary: {
        name: "Overlord Bio-Drake",
        image: "🐲",
        description: "Miniature gas-breathing dragon spewing hype fumes.",
        flavourText: "Ignites comment sections with green flames.",
      },
      mythic: {
        name: "Apex Celestial Phoenix",
        image: "🦚",
        description: "Immortal avian creature rebirthing dead raid targets.",
        flavourText: "Revives engagement on stale posts effortlessly.",
      },
    },
    powerItem: {
      common: {
        name: "Scout Signal Flare",
        image: "🔦",
        description: "Basic illumination flare highlighting raid links.",
        flavourText: "Casts bright light on active campaign threads.",
      },
      uncommon: {
        name: "Vanguard Raid Siren",
        image: "📢",
        description: "Acoustic megaphone amplifying raid notifications.",
        flavourText: "Wakes up idle squad members instantly.",
      },
      rare: {
        name: "Commando Auto-Pinger",
        image: "📡",
        description: "Automated transmitter routing raid triggers to Discord.",
        flavourText: "Never miss a high-priority snipe target.",
      },
      epic: {
        name: "Raid Specialist Core",
        image: "⚡",
        description: "Pulsing power cell overclocking raid XP output.",
        flavourText: "Surges energy directly into your raider stats.",
      },
      legendary: {
        name: "Overlord Gas Cannon",
        image: "🔫",
        description: "Heavy ordnance firing concentrated hype gas canisters.",
        flavourText: "Blasts target posts into trending algorithms.",
      },
      mythic: {
        name: "Apex Raid Quantum Matrix",
        image: "🔮",
        description: "Infinite energy core manipulating social media feeds.",
        flavourText: "Holds the raw power of 1,000 viral campaigns.",
      },
    },
  },
  "CTO Specialist": {
    head: {
      common: {
        name: "Rookie Takeover Cap",
        image: "🧢",
        description: "Simple visor worn by community revive volunteers.",
        flavourText: "Keeping cool while taking back project control.",
      },
      uncommon: {
        name: "CTO Architect Visor",
        image: "🥽",
        description: "Digital visor tracking liquidity and chart revivals.",
        flavourText: "Monitors pump curves in real-time.",
      },
      rare: {
        name: "Takeover Commander Helm",
        image: "🪖",
        description: "Tactical helmet for leads steering community takeovers.",
        flavourText: "Shields against rug pull despair.",
      },
      epic: {
        name: "CTO Specialist Crown",
        image: "👑",
        description: "Gold crown awarded to successful project resurrectors.",
        flavourText: "Symbol of project revival excellence.",
      },
      legendary: {
        name: "Revival Overlord Mask",
        image: "🎭",
        description: "Mythic mask worn by elite CTO architects.",
        flavourText: "Commands instant respect across Telegram channels.",
      },
      mythic: {
        name: "Apex CTO Sovereign Halo",
        image: "🌟",
        description: "Celestial halo glowing with green candle energy.",
        flavourText: "Brings dead projects back to life with a single wave.",
      },
    },
    body: {
      common: {
        name: "Volunteer Work Shirt",
        image: "👕",
        description: "Durable shirt worn during early takeover organization.",
        flavourText: "Sweat equity woven directly into fabric.",
      },
      uncommon: {
        name: "CTO Architect Hoodie",
        image: "🧥",
        description: "Comfortable hoodie for late night code & raid sessions.",
        flavourText: "Essential apparel for 3 AM Telegram spaces.",
      },
      rare: {
        name: "Takeover Kevlar Vest",
        image: "🥋",
        description: "Protected vest built for high-stakes chart battles.",
        flavourText: "Deflects FUD during critical migration phases.",
      },
      epic: {
        name: "CTO Specialist Jacket",
        image: "🥼",
        description: "Executive jacket tailored for community council leads.",
        flavourText: "Exudes authority and structural stability.",
      },
      legendary: {
        name: "Revival Overlord Armor",
        image: "🛡️",
        description: "Heavy titan armor forged from community vault reserves.",
        flavourText: "Unbreakable defense for community treasuries.",
      },
      mythic: {
        name: "Apex CTO Sovereign Robes",
        image: "✨",
        description: "Radiant robes shimmered with blockchain smart contracts.",
        flavourText: "Gives supreme authority over project revivals.",
      },
    },
    shorts: {
      common: {
        name: "Volunteer Work Shorts",
        image: "🩳",
        description: "Basic shorts for long shifts organizing community drives.",
        flavourText: "Built for non-stop grind sessions.",
      },
      uncommon: {
        name: "CTO Architect Shorts",
        image: "🩳",
        description: "Techwear shorts with dedicated pockets for hardware keys.",
        flavourText: "Keeps private seed phrases close.",
      },
      rare: {
        name: "Takeover Tactical Shorts",
        image: "🩳",
        description: "Reinforced shorts fitted with utility belts.",
        flavourText: "Holds everything needed for a smooth migration.",
      },
      epic: {
        name: "CTO Specialist Greaves",
        image: "🩳",
        description: "Armored legwear forged for lead takeover directors.",
        flavourText: "Stands firm against chart dips.",
      },
      legendary: {
        name: "Revival Overlord Shorts",
        image: "🩳",
        description: "Titanium shorts infused with golden chart energy.",
        flavourText: "Pumps confidence with every stride.",
      },
      mythic: {
        name: "Apex CTO Celestial Kilt",
        image: "🩳",
        description: "Mythic ceremonial kilt worn by legendary project revive gods.",
        flavourText: "Turns red charts into green vertical lines.",
      },
    },
    feet: {
      common: {
        name: "Rookie Grind Sneakers",
        image: "👟",
        description: "Standard sneakers for running community campaigns.",
        flavourText: "Comfortable for all-day Telegram moderation.",
      },
      uncommon: {
        name: "CTO Architect Boots",
        image: "🥾",
        description: "Sturdy boots engineered for rugged market conditions.",
        flavourText: "Navigates bear markets without slipping.",
      },
      rare: {
        name: "Takeover Mag-Sneakers",
        image: "👟",
        description: "High-top sneakers with magnetic soles.",
        flavourText: "Locks onto green candles firmly.",
      },
      epic: {
        name: "CTO Specialist Sabatons",
        image: "👞",
        description: "Polished steel sabatons for executive raiders.",
        flavourText: "Leaves a mark on successful takeover milestones.",
      },
      legendary: {
        name: "Revival Overlord Striders",
        image: "🥾",
        description: "Gold-plated boots surging with liquidity energy.",
        flavourText: "Steps straight to the top of trending lists.",
      },
      mythic: {
        name: "Apex CTO Sovereign Treads",
        image: "👟",
        description: "Celestial boots leaving glowing chart footprints.",
        flavourText: "Walks on air during god candle pumps.",
      },
    },
    back: {
      common: {
        name: "Volunteer Banner Cape",
        image: "🦸",
        description: "Simple cape bearing the community takeover emblem.",
        flavourText: "Signals hope to weary token holders.",
      },
      uncommon: {
        name: "CTO Architect Back-Pack",
        image: "🎒",
        description: "High-capacity pack holding server backups & graphics.",
        flavourText: "Contains all assets needed for a brand refresh.",
      },
      rare: {
        name: "Takeover Banner Wings",
        image: "🪽",
        description: "Glider wings decorated with green chart vectors.",
        flavourText: "Flies above community drama.",
      },
      epic: {
        name: "CTO Specialist Cape",
        image: "🦸",
        description: "Silken cape embroidered with golden contract lines.",
        flavourText: "Grants +20% Pack Luck on all vault pulls.",
      },
      legendary: {
        name: "Revival Overlord Cloak",
        image: "🥻",
        description: "Heavy mantle woven from community treasury threads.",
        flavourText: "Boosts Legendary item drop rates.",
      },
      mythic: {
        name: "Apex CTO Sovereign Wings",
        image: "🌟",
        description: "Radiant wings glowing with green candle light.",
        flavourText: "Guarantees max luck on all pack openings.",
      },
    },
    pet: {
      common: {
        name: "Takeover Kitten",
        image: "🐱",
        description: "Cute kitten keeping morale high in Telegram chats.",
        flavourText: "Purrs smoothly during long market slumps.",
      },
      uncommon: {
        name: "CTO Owl",
        image: "🦉",
        description: "Wise owl watching chart movements 24/7.",
        flavourText: "Alerts the team to sudden volume spikes.",
      },
      rare: {
        name: "Takeover Cyber Bull",
        image: "🐂",
        description: "Miniature mechanical bull charging at red candles.",
        flavourText: "Gores bear market sentiment.",
      },
      epic: {
        name: "CTO Specialist Dragon",
        image: "🐲",
        description: "Noble dragon protecting the community multi-sig wallet.",
        flavourText: "Guards treasury funds with fiery passion.",
      },
      legendary: {
        name: "Revival Phoenix",
        image: "🦚",
        description: "Fiery phoenix embodying the spirit of project rebirth.",
        flavourText: "Rises stronger from any market drop.",
      },
      mythic: {
        name: "Apex CTO Celestial Whale",
        image: "🐋",
        description: "Floating celestial whale bringing massive liquidity.",
        flavourText: "Swims gracefully through green candle seas.",
      },
    },
    powerItem: {
      common: {
        name: "Volunteer Megaphone",
        image: "📢",
        description: "Handheld bullhorn for rallying holders.",
        flavourText: "Spreads takeover updates far and wide.",
      },
      uncommon: {
        name: "CTO Telegram Key",
        image: "🔑",
        description: "Golden key unlocking group admin permissions.",
        flavourText: "Restores order to chaotic channels.",
      },
      rare: {
        name: "Takeover Multi-Sig Terminal",
        image: "💻",
        description: "Portable hardware terminal managing treasury funds.",
        flavourText: "Ensures transparent community governance.",
      },
      epic: {
        name: "CTO Specialist Core",
        image: "⚡",
        description: "Power core overclocking CTO raid XP.",
        flavourText: "Drives intense engagement during revives.",
      },
      legendary: {
        name: "Revival Liquidity Cannon",
        image: "🔫",
        description: "Energy weapon blasting liquidity into pool reserves.",
        flavourText: "Creates instant chart buy pressure.",
      },
      mythic: {
        name: "Apex CTO God Candle Matrix",
        image: "🔮",
        description: "Ancient artifact capable of spawning god candles.",
        flavourText: "The ultimate power tool of community architects.",
      },
    },
  },
  "Meme Specialist": {
    head: {
      common: {
        name: "Paper Dank Cap",
        image: "🧢",
        description: "Folded paper cap printed with classic memes.",
        flavourText: "Retro dankness from 2012.",
      },
      uncommon: {
        name: "Frog Pattern Bucket Hat",
        image: "👒",
        description: "Bucket hat covered in Pepe facial expressions.",
        flavourText: "Protects your brain from boring posts.",
      },
      rare: {
        name: "Pepe Crown",
        image: "🐸",
        description: "An iconic green headpiece for true meme lords.",
        flavourText: "Feels good man.",
      },
      epic: {
        name: "Royal Memer Tiara",
        image: "👑",
        description: "Jeweled tiara glittering with reaction GIFs.",
        flavourText: "Crowned by the viral lords.",
      },
      legendary: {
        name: "Holographic Meme Crown",
        image: "🌈",
        description: "Shimmers with animated 60fps meme loops.",
        flavourText: "Every angle reveals a different meme.",
      },
      mythic: {
        name: "God of Dank Memes Mask",
        image: "🎭",
        description: "Divine mask worn by the primordial Memer.",
        flavourText: "Spawns 10,000 retweets upon sight.",
      },
    },
    body: {
      common: {
        name: "Dank Pepe Hoodie",
        image: "🧥",
        description: "Cozy green hoodie printed with rare Pepe faces.",
        flavourText: "Stained with coffee and viral ideas.",
      },
      uncommon: {
        name: "Shiba Print Sweater",
        image: "👕",
        description: "Knit sweater featuring Doge expressions.",
        flavourText: "Much warm. Very comfort. Wow.",
      },
      rare: {
        name: "GigaChad Suit Jacket",
        image: "🧥",
        description: "Tailored jacket exuding unshakeable confidence.",
        flavourText: "Yes, I post memes. How could you tell?",
      },
      epic: {
        name: "Viral Crafter Robe",
        image: "🥼",
        description: "Silken robe woven with trending hashtag threads.",
        flavourText: "Flows gracefully as you edit dank templates.",
      },
      legendary: {
        name: "Meme Lord Tuxedo",
        image: "🤵",
        description: "Dapper suit adorned with neon rainbow lapels.",
        flavourText: "Formalwear for the meme awards gala.",
      },
      mythic: {
        name: "Apex Viral Sovereign Armor",
        image: "✨",
        description: "Mythic plate shining with pure internet culture.",
        flavourText: "The ultimate fashion statement of meme royalty.",
      },
    },
    shorts: {
      common: {
        name: "Dank Meme Shorts",
        image: "🩳",
        description: "Comfy shorts printed with viral reaction icons.",
        flavourText: "Maximum breathability while crafting memes.",
      },
      uncommon: {
        name: "Shiba Pattern Shorts",
        image: "🩳",
        description: "Yellow shorts covered in Doge faces.",
        flavourText: "Very stylish. Such shorts.",
      },
      rare: {
        name: "GigaChad Speed Shorts",
        image: "🩳",
        description: "Athletic shorts engineered for high-velocity meme posting.",
        flavourText: "Built for speed and raw aesthetic power.",
      },
      epic: {
        name: "Viral Crafter Greaves",
        image: "🩳",
        description: "Padded legwear for all-night meme editing sessions.",
        flavourText: "Protects against leg cramps during viral streaks.",
      },
      legendary: {
        name: "Meme Lord Rainbow Shorts",
        image: "🩳",
        description: "Animated shorts shifting colors like a GIF.",
        flavourText: "Blinds haters with 60fps dankness.",
      },
      mythic: {
        name: "Apex Viral Sovereign Kilt",
        image: "🩳",
        description: "Celestial kilt radiating pure humor energy.",
        flavourText: "Makes every post go instantly viral.",
      },
    },
    feet: {
      common: {
        name: "Pepe Slippers",
        image: "🥿",
        description: "Soft green slippers shaped like frogs.",
        flavourText: "Comfy footwear for desktop meme editing.",
      },
      uncommon: {
        name: "Doge Crocs",
        image: "👟",
        description: "Yellow crocs adorned with Doge charms.",
        flavourText: "Put them in sport mode for faster posting.",
      },
      rare: {
        name: "GigaChad Boots",
        image: "👞",
        description: "Heavy leather boots with steel toes.",
        flavourText: "Walks over bad memes without looking back.",
      },
      epic: {
        name: "Viral Crafter Kicks",
        image: "👟",
        description: "Neon sneakers glowing with RGB lights.",
        flavourText: "Light up the timeline with every step.",
      },
      legendary: {
        name: "Meme Lord Floating Striders",
        image: "🥾",
        description: "Hover sneakers powered by viral laughter.",
        flavourText: "Never touch boring ground again.",
      },
      mythic: {
        name: "Apex Viral Sovereign Treads",
        image: "👟",
        description: "Celestial footwear leaving glowing meme trails.",
        flavourText: "Steps directly onto the global trending tab.",
      },
    },
    back: {
      common: {
        name: "Dank Paper Cape",
        image: "🦸",
        description: "Simple cape made from printed meme templates.",
        flavourText: "Lightweight and surprisingly durable.",
      },
      uncommon: {
        name: "Rainbow Nyan Banner",
        image: "🌈",
        description: "Back banner trailing a pop-tart cat rainbow.",
        flavourText: "Plays 8-bit music as you move.",
      },
      rare: {
        name: "GigaChad Cape",
        image: "🦸",
        description: "Heavy black cape lined with gold trim.",
        flavourText: "Flaps heroically in the timeline wind.",
      },
      epic: {
        name: "Holographic Pepe Cape",
        image: "🥻",
        description: "Shimmering cape displaying animated Pepe GIFs.",
        flavourText: "Grants +20% Pack Luck on all vault pulls.",
      },
      legendary: {
        name: "Meme Lord Rainbow Wings",
        image: "🪽",
        description: "Prismatic wings emitting neon particle trails.",
        flavourText: "Boosts Legendary item drop rates.",
      },
      mythic: {
        name: "Apex Viral Sovereign Cloak",
        image: "🌟",
        description: "Celestial mantle holding the entire history of internet memes.",
        flavourText: "Guarantees max luck on all pack pulls.",
      },
    },
    pet: {
      common: {
        name: "Pet Pepe Frog",
        image: "🐸",
        description: "Small green frog sitting on your shoulder.",
        flavourText: "Ribbits happily when your meme gets liked.",
      },
      uncommon: {
        name: "Doge Puppy",
        image: "🐕",
        description: "Cute Shiba Inu puppy wearing a tiny party hat.",
        flavourText: "Barks in comic sans font.",
      },
      rare: {
        name: "GigaChad Cat",
        image: "🐱",
        description: "Chiseled feline with an impeccably square jaw.",
        flavourText: "Refuses to elaborate, leaves.",
      },
      epic: {
        name: "Pepe the King Frog",
        image: "🐸",
        description: "Royal frog wearing a tiny golden crown.",
        flavourText: "Rules over the dankest meme channels.",
      },
      legendary: {
        name: "Nyan Rainbow Cat",
        image: "🐱",
        description: "Space-faring pop-tart feline leaving rainbow trails.",
        flavourText: "Flies endlessly through digital space.",
      },
      mythic: {
        name: "Apex Celestial Pepe God",
        image: "🌟",
        description: "Divine green entity radiating infinite dankness.",
        flavourText: "Turns any text into an instant viral hit.",
      },
    },
    powerItem: {
      common: {
        name: "Meme Template USB",
        image: "💾",
        description: "Flash drive loaded with 1,000 meme templates.",
        flavourText: "The essential starter kit for any memer.",
      },
      uncommon: {
        name: "Photoshop Stylus Pen",
        image: "✏️",
        description: "Precision digital pen for cutting out PNGs.",
        flavourText: "Pixel-perfect cutout precision.",
      },
      rare: {
        name: "Deep-Fryer Laser Pistol",
        image: "🔫",
        description: "Handgun firing high-contrast deep-fry filters.",
        flavourText: "Adds 500% noise and red lens flare.",
      },
      epic: {
        name: "Meme Specialist Core",
        image: "⚡",
        description: "Power core overclocking meme XP generation.",
        flavourText: "Surges viral energy into every submission.",
      },
      legendary: {
        name: "Viral Trending Ray",
        image: "📡",
        description: "Satellite dish beaming memes straight to the front page.",
        flavourText: "Guarantees front-page placement.",
      },
      mythic: {
        name: "Apex Meme Quantum Generator",
        image: "🔮",
        description: "Reality-warping device generating infinite memes per second.",
        flavourText: "The ultimate power tool of viral architects.",
      },
    },
  },
  "Video Specialist": {
    head: {
      common: {
        name: "Director Visor Cap",
        image: "🧢",
        description: "Classic director cap for studio shooting.",
        flavourText: "Keep the studio lights out of your eyes.",
      },
      uncommon: {
        name: "Studio Headset Visor",
        image: "🎧",
        description: "High-fidelity audio headset with flip-down monitor.",
        flavourText: "Monitors audio levels while editing reels.",
      },
      rare: {
        name: "Streamer RGB Helmet",
        image: "🪖",
        description: "Futuristic helmet with customizable RGB lighting.",
        flavourText: "Syncs lighting with stream chat triggers.",
      },
      epic: {
        name: "Video Specialist Crown",
        image: "👑",
        description: "Golden crown awarded to viral video directors.",
        flavourText: "Symbol of cinematic production mastery.",
      },
      legendary: {
        name: "Cinema Overlord Helm",
        image: "🎭",
        description: "Heavy titanium helm with built-in 4K HUD camera.",
        flavourText: "Records everything in glorious high definition.",
      },
      mythic: {
        name: "Apex Studio Sovereign Halo",
        image: "🌟",
        description: "Celestial halo shining with studio key lights.",
        flavourText: "Illuminates every scene with divine production value.",
      },
    },
    body: {
      common: {
        name: "Studio Crew T-Shirt",
        image: "👕",
        description: "Black t-shirt worn by camera crew members.",
        flavourText: "Blends into dark studio backgrounds.",
      },
      uncommon: {
        name: "Editor Comfort Hoodie",
        image: "🧥",
        description: "Extra-soft hoodie for long timeline editing marathons.",
        flavourText: "Warmth for late-night render waiting.",
      },
      rare: {
        name: "Streamer Tactical Vest",
        image: "🥋",
        description: "Utility vest holding mic packs and capture cards.",
        flavourText: "Every cable has its designated pocket.",
      },
      epic: {
        name: "Video Specialist Blazer",
        image: "🥼",
        description: "Executive suit jacket for award-winning directors.",
        flavourText: "Worn when accepting best video awards.",
      },
      legendary: {
        name: "Cinema Overlord Armor",
        image: "🛡️",
        description: "Heavy armor housing render acceleration engines.",
        flavourText: "Renders 8K video in zero seconds.",
      },
      mythic: {
        name: "Apex Studio Sovereign Robes",
        image: "✨",
        description: "Radiant robes woven with fiber-optic light threads.",
        flavourText: "Gives supreme control over digital media streams.",
      },
    },
    shorts: {
      common: {
        name: "Studio Crew Shorts",
        image: "🩳",
        description: "Flexible cargo shorts for camera operators on set.",
        flavourText: "Pockets big enough for lens caps and cables.",
      },
      uncommon: {
        name: "Editor Jogger Shorts",
        image: "🩳",
        description: "Comfy fleece shorts designed for sitting at edit bays.",
        flavourText: "Zero restriction during 10-hour edit sessions.",
      },
      rare: {
        name: "Streamer RGB Shorts",
        image: "🩳",
        description: "Shorts with embedded LED strips syncing to audio beats.",
        flavourText: "Pulse with the music during live streams.",
      },
      epic: {
        name: "Video Specialist Greaves",
        image: "🩳",
        description: "Armored legwear forged for lead production directors.",
        flavourText: "Stands firm on chaotic film sets.",
      },
      legendary: {
        name: "Cinema Overlord Shorts",
        image: "🩳",
        description: "Titanium shorts infused with golden video energy.",
        flavourText: "Overclocks video editing workflow.",
      },
      mythic: {
        name: "Apex Studio Celestial Kilt",
        image: "🩳",
        description: "Mythic ceremonial kilt worn by legendary video gods.",
        flavourText: "Turns any clip into a viral masterpiece.",
      },
    },
    feet: {
      common: {
        name: "Set Runner Sneakers",
        image: "👟",
        description: "Lightweight sneakers for running errands on set.",
        flavourText: "Quiet soles that won't ruin audio recordings.",
      },
      uncommon: {
        name: "Studio Crew Boots",
        image: "🥾",
        description: "Durable boots protecting feet from heavy equipment.",
        flavourText: "Padded steel toes for set safety.",
      },
      rare: {
        name: "Streamer Light-Up Kicks",
        image: "👟",
        description: "High-top sneakers with neon glowing soles.",
        flavourText: "Flashy footwear for webcam camera angles.",
      },
      epic: {
        name: "Video Specialist Sabatons",
        image: "👞",
        description: "Polished metallic sabatons for director leads.",
        flavourText: "Leaves a solid footprint in media history.",
      },
      legendary: {
        name: "Cinema Overlord Striders",
        image: "🥾",
        description: "Gold-plated boots floating on cushion thrusters.",
        flavourText: "Glide smoothly across studio floors.",
      },
      mythic: {
        name: "Apex Studio Sovereign Treads",
        image: "👟",
        description: "Celestial boots leaving glowing video reel trails.",
        flavourText: "Walks effortlessly through viral media algorithms.",
      },
    },
    back: {
      common: {
        name: "Studio Cable Backpack",
        image: "🎒",
        description: "Heavy-duty backpack holding extension cords and adapters.",
        flavourText: "Never get caught without the right cable.",
      },
      uncommon: {
        name: "Camera Rig Harness",
        image: "🎒",
        description: "Ergonomic back harness supporting heavy steady-cam rigs.",
        flavourText: "Takes the strain off your spine during long shots.",
      },
      rare: {
        name: "Streamer LED Wings",
        image: "🪽",
        description: "Back-mounted wing rig lined with RGB light panels.",
        flavourText: "Creates instant studio lighting behind you.",
      },
      epic: {
        name: "Video Specialist Cape",
        image: "🦸",
        description: "Velvet cloak trim with golden film reel embroidery.",
        flavourText: "Grants +20% Pack Luck on all vault pulls.",
      },
      legendary: {
        name: "Cinema Overlord Cloak",
        image: "🥻",
        description: "Heavy mantle woven from film reel celluloid.",
        flavourText: "Boosts Legendary item drop rates.",
      },
      mythic: {
        name: "Apex Studio Sovereign Wings",
        image: "🌟",
        description: "Radiant wings glowing with golden spotlight beams.",
        flavourText: "Guarantees max luck on all pack openings.",
      },
    },
    pet: {
      common: {
        name: "Clapperboard Parrot",
        image: "🦜",
        description: "Clever parrot squawking 'Action!' before every scene.",
        flavourText: "Keeps the studio energy high.",
      },
      uncommon: {
        name: "Studio Mascot Dog",
        image: "🐕",
        description: "Friendly golden retriever hanging out in the edit suite.",
        flavourText: "Moral support during rendering crashes.",
      },
      rare: {
        name: "Streamer Cyber Cat",
        image: "🐱",
        description: "Robotic cat sitting on top of your studio camera.",
        flavourText: "Meows whenever chat sends a donation.",
      },
      epic: {
        name: "Video Specialist Griffin",
        image: "🦁",
        description: "Majestic griffin holding a golden microphone.",
        flavourText: "Roars with broadcast-quality audio clarity.",
      },
      legendary: {
        name: "Cinema Dragon",
        image: "🐲",
        description: "Fire-breathing dragon lighting up studio stage sets.",
        flavourText: "Creates dramatic natural lighting effects.",
      },
      mythic: {
        name: "Apex Studio Celestial Phoenix",
        image: "🦚",
        description: "Golden phoenix bringing eternal creative inspiration.",
        flavourText: "Ensures every video reaches 1M+ views.",
      },
    },
    powerItem: {
      common: {
        name: "Clapperboard Slate",
        image: "🎬",
        description: "Classic wooden slate for syncing video and audio.",
        flavourText: "Snap! Take one, scene one.",
      },
      uncommon: {
        name: "Wireless Studio Mic",
        image: "🎙️",
        description: "Broadcast-grade microphone capturing crisp audio.",
        flavourText: "Filters out background noise effortlessly.",
      },
      rare: {
        name: "4K Cinema Camera",
        image: "🎥",
        description: "High-end camera recording at 120fps raw format.",
        flavourText: "Captures every frame in crystal clear detail.",
      },
      epic: {
        name: "Video Specialist Core",
        image: "⚡",
        description: "Power core overclocking video production XP.",
        flavourText: "Accelerates video creation rewards.",
      },
      legendary: {
        name: "Render Farm Supercomputer",
        image: "💻",
        description: "Server rack processing 3D effects in real-time.",
        flavourText: "Zero render times guaranteed.",
      },
      mythic: {
        name: "Apex Studio Quantum Director Matrix",
        image: "🔮",
        description: "Celestial artifact controlling all digital video feeds.",
        flavourText: "The ultimate power tool of production directors.",
      },
    },
  },
  "Mission Specialist": {
    head: {
      common: {
        name: "Scout Quest Cap",
        image: "🧢",
        description: "Simple cloth cap worn by entry mission hunters.",
        flavourText: "Protects against sun while hunting daily objectives.",
      },
      uncommon: {
        name: "Hoarder Gas Visor",
        image: "🥽",
        description: "Reinforced visor scanning vault crates for loot.",
        flavourText: "Highlights hidden chest rewards.",
      },
      rare: {
        name: "Mission Commander Helm",
        image: "🪖",
        description: "Tactical helmet for leads tracking weekly milestones.",
        flavourText: "Monitors mission progress in real-time.",
      },
      epic: {
        name: "Mission Specialist Crown",
        image: "👑",
        description: "Gold crown awarded to master quest completers.",
        flavourText: "Symbol of relentless mission dedication.",
      },
      legendary: {
        name: "Vault Goblin King Helm",
        image: "👺",
        description: "Ornate goblin helmet forged from gold vault coins.",
        flavourText: "Worn by those who open 1,000+ packs.",
      },
      mythic: {
        name: "Apex Mission Sovereign Halo",
        image: "🌟",
        description: "Celestial halo shining with golden quest stars.",
        flavourText: "Completes objectives with divine efficiency.",
      },
    },
    body: {
      common: {
        name: "Scout Utility Vest",
        image: "👕",
        description: "Lightweight vest with pockets for quest trackers.",
        flavourText: "Keeps daily mission logs organized.",
      },
      uncommon: {
        name: "Hoarder Leather Jacket",
        image: "🧥",
        description: "Durable coat lined with extra stash pockets.",
        flavourText: "Built to hold extra pack loot.",
      },
      rare: {
        name: "Mission Commander Armor",
        image: "🛡️",
        description: "Heavy chestplate protecting against quest fatigue.",
        flavourText: "Maintains stamina through weekly grinds.",
      },
      epic: {
        name: "Mission Specialist Cuirass",
        image: "🥇",
        description: "Gleaming armor infused with milestone rewards.",
        flavourText: "Radiates victory after completing campaign goals.",
      },
      legendary: {
        name: "Vault Goblin King Plate",
        image: "☣️",
        description: "Gold-encrusted armor glowing with vault treasure energy.",
        flavourText: "Heavy with the weight of rare collectibles.",
      },
      mythic: {
        name: "Apex Mission Sovereign Robes",
        image: "✨",
        description: "Radiant robes woven from golden quest threads.",
        flavourText: "Gives supreme mastery over all campaign missions.",
      },
    },
    shorts: {
      common: {
        name: "Scout Cargo Shorts",
        image: "🩳",
        description: "Comfortable shorts for long mission journeys.",
        flavourText: "Pockets packed with daily quest notes.",
      },
      uncommon: {
        name: "Hoarder Padded Shorts",
        image: "🩳",
        description: "Reinforced shorts fitted with coin pouches.",
        flavourText: "Never run out of pocket space for loot.",
      },
      rare: {
        name: "Mission Commander Shorts",
        image: "🩳",
        description: "Tactical shorts engineered for strenuous quest runs.",
        flavourText: "Withstands all weather conditions.",
      },
      epic: {
        name: "Mission Specialist Greaves",
        image: "🩳",
        description: "Armored legwear forged for quest leads.",
        flavourText: "Marches through long weekly campaigns.",
      },
      legendary: {
        name: "Vault Goblin King Shorts",
        image: "🩳",
        description: "Golden shorts shimmering with precious gems.",
        flavourText: "Leaves gold dust wherever you walk.",
      },
      mythic: {
        name: "Apex Mission Celestial Kilt",
        image: "🩳",
        description: "Mythic ceremonial kilt worn by quest gods.",
        flavourText: "Instantly fulfills mission milestones.",
      },
    },
    feet: {
      common: {
        name: "Scout Trail Boots",
        image: "🥾",
        description: "Standard boots for trekking to mission targets.",
        flavourText: "Durable soles for long-distance quests.",
      },
      uncommon: {
        name: "Hoarder Stash Boots",
        image: "🥾",
        description: "Boots featuring hidden heel compartments for keys.",
        flavourText: "Keep spare vault keys safe.",
      },
      rare: {
        name: "Mission Commander Mag-Boots",
        image: "👟",
        description: "Magnetic boots sticking to high-value quest areas.",
        flavourText: "Locks onto mission objectives.",
      },
      epic: {
        name: "Mission Specialist Sabatons",
        image: "👞",
        description: "Polished steel sabatons for elite quest raiders.",
        flavourText: "Leaves a bold impression on leaderboard ranks.",
      },
      legendary: {
        name: "Vault Goblin King Striders",
        image: "🥾",
        description: "Golden boots hovering on treasure energy jets.",
        flavourText: "Walks straight into the richest vault rooms.",
      },
      mythic: {
        name: "Apex Mission Sovereign Treads",
        image: "👟",
        description: "Celestial boots leaving glowing quest path footprints.",
        flavourText: "Leads the way to legendary achievements.",
      },
    },
    back: {
      common: {
        name: "Scout Quest Bag",
        image: "🎒",
        description: "Simple canvas pack holding daily quest supplies.",
        flavourText: "Essential gear for early raiders.",
      },
      uncommon: {
        name: "Hoarder Treasure Backpack",
        image: "🎒",
        description: "High-capacity pack bursting with vault crates.",
        flavourText: "Always room for one more pack drop.",
      },
      rare: {
        name: "Mission Commander Banner",
        image: "🚩",
        description: "Back-mounted flag displaying mission milestones.",
        flavourText: "Signals mission completion to the team.",
      },
      epic: {
        name: "Mission Specialist Cape",
        image: "🦸",
        description: "Velvet cape trim with gold quest star embroidery.",
        flavourText: "Grants +20% Pack Luck on all vault pulls.",
      },
      legendary: {
        name: "Vault Goblin King Cloak",
        image: "🥻",
        description: "Heavy mantle woven from solid gold thread.",
        flavourText: "Boosts Legendary item drop rates.",
      },
      mythic: {
        name: "Apex Mission Sovereign Wings",
        image: "🌟",
        description: "Radiant wings glowing with golden quest energy.",
        flavourText: "Guarantees max luck on all pack openings.",
      },
    },
    pet: {
      common: {
        name: "Quest Scout Pup",
        image: "🐕",
        description: "Eager puppy digging up buried quest items.",
        flavourText: "Sniffs out hidden daily rewards.",
      },
      uncommon: {
        name: "Vault Goblin Helper",
        image: "👺",
        description: "Miniature goblin helping carry pack loot.",
        flavourText: "Giggles whenever rare loot drops.",
      },
      rare: {
        name: "Mission Cyber Falcon",
        image: "🦅",
        description: "Recon bird scouting weekly objective locations.",
        flavourText: "Finds fast paths to mission goals.",
      },
      epic: {
        name: "Mission Specialist Griffin",
        image: "🦁",
        description: "Noble beast carrying heavy quest chest rewards.",
        flavourText: "Guards mission trophies proudly.",
      },
      legendary: {
        name: "Midas Gold Dragon",
        image: "🐲",
        description: "Golden dragon turning regular loot into gold.",
        flavourText: "Breathes golden flames onto vault chests.",
      },
      mythic: {
        name: "Apex Celestial Quest Phoenix",
        image: "🦚",
        description: "Divine bird instantly completing quest goals.",
        flavourText: "Brings eternal bonus XP rewards.",
      },
    },
    powerItem: {
      common: {
        name: "Scout Quest Map",
        image: "🗺️",
        description: "Paper map marking daily mission locations.",
        flavourText: "Points the way to easy XP.",
      },
      uncommon: {
        name: "Hoarder Lockpick Set",
        image: "🗝️",
        description: "Precision tools opening stubborn vault boxes.",
        flavourText: "Cracks open pack locks with ease.",
      },
      rare: {
        name: "Mission Tracker Device",
        image: "📱",
        description: "Digital PDA tracking daily & weekly objective progress.",
        flavourText: "Pings when a mission is ready to claim.",
      },
      epic: {
        name: "Mission Specialist Core",
        image: "⚡",
        description: "Power core overclocking mission XP rewards.",
        flavourText: "Surges bonus XP into every quest.",
      },
      legendary: {
        name: "Midas Gold Vault Key",
        image: "🔑",
        description: "Master key granting access to elite vault rewards.",
        flavourText: "Unlocks the highest tier pack drops.",
      },
      mythic: {
        name: "Apex Mission Quantum Quest Generator",
        image: "🔮",
        description: "Celestial artifact generating infinite high-XP missions.",
        flavourText: "The ultimate power tool of vault hoarders.",
      },
    },
  },
  "Season Specialist": {
    head: {
      common: {
        name: "Veteran Rookie Cap",
        image: "🧢",
        description: "Standard cap issued to Season 1 participants.",
        flavourText: "Welcome to Season 1 of Fartboy Raid 2.0.",
      },
      uncommon: {
        name: "Season Veteran Visor",
        image: "🥽",
        description: "Tactical visor tracking seasonal prestige levels.",
        flavourText: "Monitors overall seasonal progression.",
      },
      rare: {
        name: "Season Commander Helm",
        image: "🪖",
        description: "Heavy helmet for raiders climbing seasonal ranks.",
        flavourText: "Built for enduring 90-day campaigns.",
      },
      epic: {
        name: "Season Specialist Crown",
        image: "👑",
        description: "Golden crown awarded to elite seasonal raiders.",
        flavourText: "Symbol of seasonal dominance.",
      },
      legendary: {
        name: "Season Overlord Helm",
        image: "🎭",
        description: "Prestige titanium helm worn by top seasonal marshals.",
        flavourText: "Commands respect across the entire season.",
      },
      mythic: {
        name: "Apex Season Sovereign Halo",
        image: "🌟",
        description: "Celestial halo glowing with golden season trophy light.",
        flavourText: "The ultimate mark of Season 1 completion.",
      },
    },
    body: {
      common: {
        name: "Veteran Battle Shirt",
        image: "👕",
        description: "Durable shirt worn throughout Season 1 raids.",
        flavourText: "Bears the official Season 1 insignia.",
      },
      uncommon: {
        name: "Season Veteran Hoodie",
        image: "🧥",
        description: "Heavy hoodie built for all-weather seasonal raiding.",
        flavourText: "Comfortable through all 90 days.",
      },
      rare: {
        name: "Season Commander Chestplate",
        image: "🛡️",
        description: "Armored chestpiece offering balanced stat boosts.",
        flavourText: "Provides solid defense across all activities.",
      },
      epic: {
        name: "Season Specialist Cuirass",
        image: "🥇",
        description: "Gleaming armor infused with season milestone energy.",
        flavourText: "Radiates pride of seasonal achievements.",
      },
      legendary: {
        name: "Season Overlord Armor",
        image: "☣️",
        description: "Prestige armor forged from seasonal victory medals.",
        flavourText: "Heavy with the glory of seasonal campaigns.",
      },
      mythic: {
        name: "Apex Season Sovereign Robes",
        image: "✨",
        description: "Radiant robes woven from golden season trophy threads.",
        flavourText: "Gives supreme prestige across the ecosystem.",
      },
    },
    shorts: {
      common: {
        name: "Veteran Cargo Shorts",
        image: "🩳",
        description: "Standard shorts issued to Season 1 contenders.",
        flavourText: "Built for endurance throughout the season.",
      },
      uncommon: {
        name: "Season Veteran Shorts",
        image: "🩳",
        description: "Reinforced shorts with seasonal badge patches.",
        flavourText: "Displays season progress proudly.",
      },
      rare: {
        name: "Season Commander Shorts",
        image: "🩳",
        description: "Tactical shorts engineered for high seasonal XP gains.",
        flavourText: "Stands strong through competitive weeks.",
      },
      epic: {
        name: "Season Specialist Greaves",
        image: "🩳",
        description: "Armored legwear forged for seasonal raiders.",
        flavourText: "Marches steadily toward Prestige ranks.",
      },
      legendary: {
        name: "Season Overlord Shorts",
        image: "🩳",
        description: "Golden shorts glowing with seasonal aura.",
        flavourText: "Leaves a trail of seasonal prestige behind.",
      },
      mythic: {
        name: "Apex Season Celestial Kilt",
        image: "🩳",
        description: "Mythic ceremonial kilt worn by Season 1 gods.",
        flavourText: "Marks total mastery over Season 1.",
      },
    },
    feet: {
      common: {
        name: "Veteran Combat Boots",
        image: "🥾",
        description: "Standard issue boots for Season 1 raiders.",
        flavourText: "Reliable footgear for daily activities.",
      },
      uncommon: {
        name: "Season Veteran Stompers",
        image: "👞",
        description: "Sturdy boots designed for long seasonal campaigns.",
        flavourText: "Never wears down during 90-day runs.",
      },
      rare: {
        name: "Season Commander Mag-Boots",
        image: "👟",
        description: "Magnetic boots giving traction on leaderboard ranks.",
        flavourText: "Climbs seasonal rankings firmly.",
      },
      epic: {
        name: "Season Specialist Sabatons",
        image: "🥾",
        description: "Heavy metallic sabatons vibrating with prestige power.",
        flavourText: "Leaves deep footprints on seasonal leaderboards.",
      },
      legendary: {
        name: "Season Overlord Striders",
        image: "🥾",
        description: "Gold-plated boots floating on seasonal momentum.",
        flavourText: "Steps straight into top seasonal brackets.",
      },
      mythic: {
        name: "Apex Season Sovereign Striders",
        image: "👟",
        description: "Celestial boots leaving glowing Season 1 trophy trails.",
        flavourText: "Traverses all seasonal milestones effortlessly.",
      },
    },
    back: {
      common: {
        name: "Veteran Battle Cape",
        image: "🦸",
        description: "Simple cape featuring the Season 1 logo.",
        flavourText: "Flutters proudly during daily raids.",
      },
      uncommon: {
        name: "Season Veteran Banner",
        image: "🚩",
        description: "Back-mounted flag showing overall seasonal level.",
        flavourText: "Visible to all community members.",
      },
      rare: {
        name: "Season Commander Wings",
        image: "🪽",
        description: "Glider wings channeling seasonal XP momentum.",
        flavourText: "Soars through seasonal tier milestones.",
      },
      epic: {
        name: "Season Specialist Cape",
        image: "🦸",
        description: "Velvet cape embroidered with golden Season 1 runes.",
        flavourText: "Grants +20% Pack Luck on all vault pulls.",
      },
      legendary: {
        name: "Season Overlord Cloak",
        image: "🥻",
        description: "Heavy mantle woven from pure seasonal prestige.",
        flavourText: "Boosts Legendary item drop rates.",
      },
      mythic: {
        name: "Apex Season Sovereign Wings",
        image: "🌟",
        description: "Radiant wings glowing with golden Master Trophy light.",
        flavourText: "Guarantees max luck on all pack openings.",
      },
    },
    pet: {
      common: {
        name: "Season Mascot Mascot",
        image: "🐕",
        description: "Loyal puppy cheering your seasonal progress.",
        flavourText: "Barks encouragement during long grinds.",
      },
      uncommon: {
        name: "Season Veteran Eagle",
        image: "🦅",
        description: "Eagle soaring high above seasonal battlegrounds.",
        flavourText: "Monitors overall seasonal leaderboards.",
      },
      rare: {
        name: "Season Commander Cyber Lion",
        image: "🦁",
        description: "Majestic mechanical lion roaring victory.",
        flavourText: "Rallies seasonal energy for the team.",
      },
      epic: {
        name: "Season Specialist Griffin",
        image: "🦁",
        description: "Noble griffin guarding seasonal trophy rewards.",
        flavourText: "Protects seasonal prestige points.",
      },
      legendary: {
        name: "Master Season Dragon",
        image: "🐲",
        description: "Golden dragon breathing seasonal hype flames.",
        flavourText: "Symbol of top-tier seasonal excellence.",
      },
      mythic: {
        name: "Apex Celestial Season Phoenix",
        image: "🦚",
        description: "Divine phoenix crowning the ultimate Season 1 victor.",
        flavourText: "Brings eternal seasonal glory.",
      },
    },
    powerItem: {
      common: {
        name: "Veteran Season Badge",
        image: "🏷️",
        description: "Official badge recognizing Season 1 entry.",
        flavourText: "Proof of participation in Season 1.",
      },
      uncommon: {
        name: "Season XP Booster",
        image: "🔋",
        description: "Portable battery providing steady XP boosts.",
        flavourText: "Keeps XP gains flowing smoothly.",
      },
      rare: {
        name: "Season Commander Terminal",
        image: "💻",
        description: "High-tech terminal managing seasonal activities.",
        flavourText: "Optimizes daily and weekly XP routes.",
      },
      epic: {
        name: "Season Specialist Core",
        image: "⚡",
        description: "Power core overclocking general XP gains (+10%).",
        flavourText: "Surges energy into every single raider activity.",
      },
      legendary: {
        name: "Master Season Trophy",
        image: "🏆",
        description: "Golden trophy awarded for elite seasonal dominance.",
        flavourText: "Priceless symbol of Season 1 mastery.",
      },
      mythic: {
        name: "Apex Season Quantum Matrix",
        image: "🔮",
        description: "Celestial artifact holding the entire legacy of Season 1.",
        flavourText: "The ultimate power tool of Season 1 veterans.",
      },
    },
  },
};

export const ITEM_LEVEL_UPGRADE_COSTS: Record<number, number> = {
  1: 2500,
  2: 5000,
  3: 10000,
  4: 20000,
  5: 35000,
  6: 50000,
  7: 75000,
  8: 100000,
  9: 150000,
};

export function getItemLevelUpgradeCost(currentLevel: number): number {
  return ITEM_LEVEL_UPGRADE_COSTS[currentLevel] ?? 0;
}

export function generateMasterCatalog(): Item[] {
  const items: Item[] = [];
  let collectionNumber = 1;

  for (const setDef of SEASON_1_SETS) {
    const setName = setDef.name;
    const setNameSlug = setName.toLowerCase().replace(/\s+/g, "_");

    for (const slotObj of SEASON_1_SLOTS) {
      const slotKey = slotObj.key;
      const slotName = slotObj.label;

      for (let variant = 1; variant <= 2; variant++) {
        const id = `s1_${setNameSlug}_${slotKey}_${variant}`;
        const baseDef = ITEM_DEFINITIONS[setName]?.[slotKey]?.common;

        const name =
          variant === 1
            ? (baseDef?.name ?? `${setName} ${slotName} Alpha`)
            : `${setName} ${slotName} Beta`;

        items.push({
          id,
          itemId: id,
          templateId: id,
          name,
          slot: slotKey,
          slotName,
          rarity: "common",
          image: baseDef?.image ?? slotObj.icon,
          thumbnail: baseDef?.image ?? slotObj.icon,
          overlayUrl:
            slotKey === "head"
              ? variant === 1
                ? "/assets/items/overlays/hat_a.svg"
                : "/assets/items/overlays/hat_b.svg"
              : slotKey === "body"
                ? variant === 1
                  ? "/assets/items/overlays/top_a.svg"
                  : "/assets/items/overlays/top_b.svg"
                : slotKey === "shorts"
                  ? variant === 1
                    ? "/assets/items/overlays/shorts_a.svg"
                    : "/assets/items/overlays/shorts_b.svg"
                  : slotKey === "feet"
                    ? variant === 1
                      ? "/assets/items/overlays/boots_a.svg"
                      : "/assets/items/overlays/boots_b.svg"
                    : slotKey === "back"
                      ? variant === 1
                        ? "/assets/items/overlays/cape_a.svg"
                        : "/assets/items/overlays/cape_b.svg"
                      : slotKey === "pet"
                        ? variant === 1
                          ? "/assets/items/overlays/pet_a.svg"
                          : "/assets/items/overlays/pet_b.svg"
                        : slotKey === "powerItem"
                          ? variant === 1
                            ? "/assets/items/overlays/power_a.svg"
                            : "/assets/items/overlays/power_b.svg"
                          : undefined,
          description: baseDef?.description ?? `Season 1 item for ${setName}.`,
          flavourText: baseDef?.flavourText ?? `Official S1 collectible #${collectionNumber}.`,
          set: setName,
          specialistSet: setName,
          raidPower: RARITY_CONFIG.common.raidPower,
          bonusXP: RARITY_CONFIG.common.bonusXP,
          collectionNumber,
          season: 1,
          forgeable: true,
          rerollable: true,
          dropRate: RARITY_CONFIG.common.dropRate,
          stats:
            slotKey !== "back"
              ? {
                  activity: 4,
                  consistency: 3,
                  streak: 2,
                }
              : undefined,
          capeStats:
            slotKey === "back"
              ? {
                  packLuck: 1,
                  legendaryChance: 1,
                  rareChance: 1,
                  rerollChance: 1,
                }
              : undefined,
          level: 1,
          maxLevel: 10,
        });

        collectionNumber++;
      }
    }
  }

  return items;
}

export const EXAMPLE_THEME_ITEM: Item = {
  id: "theme_example_01",
  templateId: "theme_example_01",
  name: "Cyber Neon Theme",
  slot: "cosmeticTheme",
  slotName: "Theme",
  rarity: "legendary",
  image: "🎨",
  description:
    "A cosmic cyber theme replacing character HQ & Forge environments with animated sci-fi visuals.",
  flavourText: "Forged in neon light and quantum pulse.",
  set: "Cosmetics",
  raidPower: 50,
  bonusXP: 25,
  collectionNumber: 999,
  season: 1,
  forgeable: false,
  rerollable: false,
  dropRate: 0.01,
  level: 1,
  maxLevel: 10,
  themeAssets: {
    borderImage: "/assets/themes/example/border.png",
    hqImage: "/assets/themes/example/hq.png",
    hqVideo: "/assets/themes/example/hq.mp4",
    forgeImage: "/assets/themes/example/forge.png",
    forgeVideo: "/assets/themes/example/forge.mp4",
  },
};

// Default/starter Character HQ theme — every raider owns and starts equipped
// with this one, so the HQ pedestal always has *something* showing even
// before any cosmetic theme has been unlocked. Video + picture are the same
// linked pair (image_41a.png / Video_01a.mp4) so 3D Motion vs 2D Frame never
// shows mismatched art. Swap to a different owned theme via the Theme
// button; equipping this one back is always available since it's never
// removed from inventory.
export const THEME_FARTBOY_DEFAULT_ITEM: Item = {
  id: "theme_fartboy_default_01",
  templateId: "theme_fartboy_default_01",
  name: "Fartboy Classic",
  slot: "cosmeticTheme",
  slotName: "Theme",
  rarity: "common",
  image: "🧢",
  description: "The original Fartboy HQ backdrop. Everyone starts equipped with this.",
  flavourText: "Some raiders never change out of their starting gear.",
  set: "Cosmetics",
  raidPower: 0,
  bonusXP: 0,
  collectionNumber: 1000,
  season: 1,
  forgeable: false,
  rerollable: false,
  dropRate: 1,
  level: 1,
  maxLevel: 1,
  themeAssets: {
    borderImage: "",
    hqImage: "/assets/themes/image_41a.png",
    hqVideo: "/assets/themes/Video_01a.mp4",
    forgeImage: "/assets/themes/image_41a.png",
    forgeVideo: "/assets/themes/Video_01a.mp4",
  },
};

// Example Pet cosmetic — demonstrates the pet slot's companion art rendering
// at its fixed calibrated position (see TARGET_NODES "pet" node) instead of
// just the small equip badge. Swap `overlayUrl` for any future pet's art;
// no code changes needed elsewhere.
export const PET_DOG_EXAMPLE_ITEM: Item = {
  id: "pet_dog_example_01",
  templateId: "pet_dog_example_01",
  name: "Golden Raid Runner",
  slot: "pet",
  slotName: "Pet",
  rarity: "legendary",
  image: "/assets/items/overlays/pet_dog_example.webp",
  thumbnail: "/assets/items/overlays/pet_dog_example.webp",
  overlayUrl: "/assets/items/overlays/pet_dog_example.webp",
  description: "A loyal golden companion who trots alongside you into every raid.",
  flavourText: "Never misses a raid. Never stops running.",
  set: "Cosmetics",
  raidPower: 15,
  bonusXP: 10,
  collectionNumber: 1001,
  season: 1,
  forgeable: false,
  rerollable: false,
  dropRate: 0.02,
  level: 1,
  maxLevel: 10,
};

// Example Power Item cosmetic — sibling to PET_DOG_EXAMPLE_ITEM above, but for
// the "powerItem" slot. Rather than the small circular equip-badge every other
// slot (including pet) gets, this uses `fullFrameEffect` to stretch its art
// across the WHOLE character canvas, layered behind the character render —
// see AvatarStage's "POWER ITEM FULL-FRAME AMBIENT EFFECT" block. That keeps
// the effect from ever covering the character artwork while still reading as
// a full-stage effect instead of a corner badge. Contributor-exclusive, same
// as the pet cosmetic. Swap `fullFrameEffect` for any future power item's art;
// no code changes needed elsewhere.
export const POWER_LIGHTNING_EXAMPLE_ITEM: Item = {
  id: "power_lightning_example_01",
  templateId: "power_lightning_example_01",
  name: "Stormcaller's Charge",
  slot: "powerItem",
  slotName: "Power Item",
  rarity: "legendary",
  image: "/assets/items/effects/power_lightning_01.gif",
  thumbnail: "/assets/items/effects/power_lightning_01.gif",
  fullFrameEffect: "/assets/items/effects/power_lightning_01.gif",
  description: "Crackling storm energy that arcs across the whole raid stage around you.",
  flavourText: "The sky itself fights on your side.",
  set: "Cosmetics",
  raidPower: 15,
  bonusXP: 10,
  collectionNumber: 1002,
  season: 1,
  forgeable: false,
  rerollable: false,
  dropRate: 0.02,
  level: 1,
  maxLevel: 10,
};

// Character HQ Frame items — cosmetic border that wraps the OUTSIDE of the
// Character HQ display stage. Unlocking/owning a different frame item and
// equipping it into the "frame" slot swaps the border, e.g. Frame A -> Frame B.
export const FRAME_DRAGON_ITEM: Item = {
  id: "frame_dragon_gold_01",
  templateId: "frame_dragon_gold_01",
  name: "Dragon Sentinel Frame",
  slot: "frame",
  slotName: "Frame",
  rarity: "legendary",
  image: "🐉",
  description:
    "An animated gilded frame guarded by twin runed dragons, wraps the outside of your Character HQ display.",
  flavourText: "Forged by vault-keepers to ward the raider's likeness.",
  set: "Cosmetics",
  raidPower: 0,
  bonusXP: 0,
  collectionNumber: 998,
  season: 1,
  forgeable: false,
  rerollable: false,
  dropRate: 0.01,
  level: 1,
  maxLevel: 1,
  frameAsset: {
    video: "/assets/frames/frame-a-dragon.mp4",
    image: "/assets/frames/frame-a-dragon-border.png",
  },
};

export const FRAME_CYBER_ITEM: Item = {
  id: "frame_cyber_neon_01",
  templateId: "frame_cyber_neon_01",
  name: "Cyber Neon Frame",
  slot: "frame",
  slotName: "Frame",
  rarity: "epic",
  image: "🌐",
  description: "A high-tech holographic neon cybernetic frame with glowing circuit conduits.",
  flavourText: "Powered by raw raider frequency data.",
  set: "Cosmetics",
  raidPower: 0,
  bonusXP: 0,
  collectionNumber: 999,
  season: 1,
  forgeable: false,
  rerollable: false,
  dropRate: 0.05,
  level: 1,
  maxLevel: 1,
  frameAsset: {
    video: "/assets/frames/frame-cyber.mp4",
    image: "/assets/frames/frame-cyber-border.png",
  },
};

export const FRAME_GOLDEN_ITEM: Item = {
  id: "frame_golden_aegis_01",
  templateId: "frame_golden_aegis_01",
  name: "Golden Aegis Frame",
  slot: "frame",
  slotName: "Frame",
  rarity: "mythic",
  image: "🛡️",
  description: "An ornate radiant golden crest frame encrusted with ancient vault jewels.",
  flavourText: "Forged for champion raiders of the highest echelon.",
  set: "Cosmetics",
  raidPower: 0,
  bonusXP: 0,
  collectionNumber: 1000,
  season: 1,
  forgeable: false,
  rerollable: false,
  dropRate: 0.005,
  level: 1,
  maxLevel: 1,
  frameAsset: {
    video: "/assets/frames/frame-gold.mp4",
    image: "/assets/frames/frame-gold-border.png",
  },
};

// Master Catalogue constant instance
export const SEASON_1_CATALOG: Item[] = [
  ...generateMasterCatalog(),
  EXAMPLE_THEME_ITEM,
  THEME_FARTBOY_DEFAULT_ITEM,
  PET_DOG_EXAMPLE_ITEM,
  POWER_LIGHTNING_EXAMPLE_ITEM,
  FRAME_DRAGON_ITEM,
  FRAME_CYBER_ITEM,
  FRAME_GOLDEN_ITEM,
];

// Quick lookup map for performance with fallback Proxy for legacy/variant item IDs
const baseCatalogMap: Record<string, Item> = SEASON_1_CATALOG.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<string, Item>,
);

const RARITY_LIST: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary", "mythic"];

export const SEASON_1_CATALOG_MAP: Record<string, Item> = new Proxy(baseCatalogMap, {
  get(target, prop: string) {
    if (typeof prop !== "string") return Reflect.get(target, prop);
    if (prop in target) return target[prop];

    // Check if prop matches legacy rarity pattern (e.g. s1_meme_specialist_body_common or s1_meme_specialist_body_epic_e1)
    for (const r of RARITY_LIST) {
      if (prop.includes(`_${r}`)) {
        const baseKeyPrefix = prop.split(`_${r}`)[0];
        const baseItem = target[`${baseKeyPrefix}_1`] || target[`${baseKeyPrefix}_2`];
        const foundBase =
          baseItem ||
          SEASON_1_CATALOG.find((cat) => cat.id.startsWith(baseKeyPrefix)) ||
          SEASON_1_CATALOG[0];

        if (foundBase) {
          const rarityData = RARITY_CONFIG[r];
          const virtualItem: Item = {
            ...foundBase,
            id: prop,
            templateId: foundBase.id,
            rarity: r,
            raidPower: rarityData.raidPower,
            bonusXP: rarityData.bonusXP,
            forgeable: rarityData.forgeable,
            rerollable: rarityData.rerollable,
            dropRate: rarityData.dropRate,
          };
          target[prop] = virtualItem;
          return virtualItem;
        }
      }
    }

    // Try finding by prefix match in SEASON_1_CATALOG
    const matchedBase = SEASON_1_CATALOG.find(
      (cat) => prop.startsWith(cat.id) || cat.id.startsWith(prop),
    );
    if (matchedBase) {
      target[prop] = matchedBase;
      return matchedBase;
    }

    // Ultimate fallback: return first catalog item rather than undefined
    if (SEASON_1_CATALOG.length > 0) {
      return SEASON_1_CATALOG[0];
    }

    return undefined;
  },
});

import { calculateActive6Stats } from "@/utils/itemStats";

/**
 * Calculates total General XP Boost % from a player's equipped items map and inventory.
 */
export function calculateTotalRaidPower(
  equippedMap: Partial<Record<EquipmentSlot, string>> = {},
  inventory: Item[] = [],
): number {
  const equippedIds = Object.values(equippedMap).filter(Boolean);
  const equippedItems = equippedIds
    .map((id) => inventory.find((i) => i.id === id) || SEASON_1_CATALOG_MAP[id || ""])
    .filter(Boolean) as Item[];

  const activeStats = calculateActive6Stats(equippedItems);
  return activeStats.generalXP;
}

/**
 * Collection Stats calculation for master catalogue
 */
export interface MasterCollectionStats {
  totalItems: number; // 252
  ownedCount: number;
  missingCount: number;
  completionPercentage: number;
  bySet: Record<string, { total: number; owned: number; percentage: number }>;
  bySlot: Record<string, { total: number; owned: number; percentage: number }>;
  byRarity: Record<Rarity, { total: number; owned: number; percentage: number }>;
}

export function getMasterCollectionStats(inventory: Item[] = []): MasterCollectionStats {
  const ownedCatalogIds = new Set<string>();

  // Match items in inventory by ID, templateId, or canonical catalog match
  for (const invItem of inventory) {
    if (SEASON_1_CATALOG_MAP[invItem.id]) {
      ownedCatalogIds.add(invItem.id);
    } else if (invItem.templateId && SEASON_1_CATALOG_MAP[invItem.templateId]) {
      ownedCatalogIds.add(invItem.templateId);
    } else {
      const match = SEASON_1_CATALOG.find(
        (c) => c.name.toLowerCase() === invItem.name.toLowerCase(),
      );
      if (match) ownedCatalogIds.add(match.id);
    }
  }

  const totalItems = SEASON_1_CATALOG.length; // 252
  const ownedCount = ownedCatalogIds.size;
  const missingCount = totalItems - ownedCount;
  const completionPercentage = totalItems ? Math.round((ownedCount / totalItems) * 100) : 0;

  const bySet: Record<string, { total: number; owned: number; percentage: number }> = {};
  for (const setDef of SEASON_1_SETS) {
    bySet[setDef.name] = { total: 0, owned: 0, percentage: 0 };
  }

  const bySlot: Record<string, { total: number; owned: number; percentage: number }> = {};
  for (const slotObj of SEASON_1_SLOTS) {
    bySlot[slotObj.label] = { total: 0, owned: 0, percentage: 0 };
  }

  const rarities: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary", "mythic"];
  const byRarity: Record<Rarity, { total: number; owned: number; percentage: number }> = {
    common: { total: 0, owned: 0, percentage: 0 },
    uncommon: { total: 0, owned: 0, percentage: 0 },
    rare: { total: 0, owned: 0, percentage: 0 },
    epic: { total: 0, owned: 0, percentage: 0 },
    legendary: { total: 0, owned: 0, percentage: 0 },
    mythic: { total: 0, owned: 0, percentage: 0 },
  };

  for (const item of SEASON_1_CATALOG) {
    const isOwned = ownedCatalogIds.has(item.id);

    // By Set
    if (bySet[item.set]) {
      bySet[item.set].total++;
      if (isOwned) bySet[item.set].owned++;
    }

    // By Slot
    const slotLabel = item.slotName || item.slot;
    if (bySlot[slotLabel]) {
      bySlot[slotLabel].total++;
      if (isOwned) bySlot[slotLabel].owned++;
    }

    // By Rarity
    if (byRarity[item.rarity]) {
      byRarity[item.rarity].total++;
      if (isOwned) byRarity[item.rarity].owned++;
    }
  }

  // Calculate percentages
  for (const key of Object.keys(bySet)) {
    bySet[key].percentage = bySet[key].total
      ? Math.round((bySet[key].owned / bySet[key].total) * 100)
      : 0;
  }
  for (const key of Object.keys(bySlot)) {
    bySlot[key].percentage = bySlot[key].total
      ? Math.round((bySlot[key].owned / bySlot[key].total) * 100)
      : 0;
  }
  for (const r of rarities) {
    byRarity[r].percentage = byRarity[r].total
      ? Math.round((byRarity[r].owned / byRarity[r].total) * 100)
      : 0;
  }

  return {
    totalItems,
    ownedCount,
    missingCount,
    completionPercentage,
    bySet,
    bySlot,
    byRarity,
  };
}

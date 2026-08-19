import {
  Hammer,
  Target,
  Video,
  Flame,
  Wrench,
  Sparkles,
  Shield,
  Coins,
  Radio,
  Share2,
  type LucideIcon,
} from "lucide-react";

export type MissionPillar = "FORGE_ARMORY" | "TACTICAL_RAIDS" | "PSYOP_CONTENT" | "WARCHEST_BOOSTS";

export interface PillarMetadata {
  id: MissionPillar;
  label: string;
  shortLabel: string;
  code: string;
  icon: LucideIcon;
  badgeClass: string;
  borderClass: string;
  bgGradient: string;
  accentColor: string;
  description: string;
}

export const MISSION_PILLARS: Record<MissionPillar, PillarMetadata> = {
  FORGE_ARMORY: {
    id: "FORGE_ARMORY",
    label: "ARMORY & FORGE",
    shortLabel: "ARMORY & FORGE",
    code: "SEC-01",
    icon: Hammer,
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-400/40",
    borderClass: "border-amber-500/40",
    bgGradient: "from-amber-950/40 via-slate-900/90 to-slate-950",
    accentColor: "#F59E0B",
    description: "Forge actions, item upgrades, pack openings, and dismantling",
  },
  TACTICAL_RAIDS: {
    id: "TACTICAL_RAIDS",
    label: "TACTICAL RAIDS",
    shortLabel: "TACTICAL RAIDS",
    code: "SEC-02",
    icon: Target,
    badgeClass: "bg-red-500/20 text-red-300 border-red-400/40",
    borderClass: "border-red-500/40",
    bgGradient: "from-red-950/40 via-slate-900/90 to-slate-950",
    accentColor: "#EF4444",
    description: "Discord raids, target alerts (#sniper-targets), and channel verification",
  },
  PSYOP_CONTENT: {
    id: "PSYOP_CONTENT",
    label: "PSY-OP CONTENT",
    shortLabel: "PSY-OP CONTENT",
    code: "SEC-03",
    icon: Video,
    badgeClass: "bg-purple-500/20 text-purple-300 border-purple-400/40",
    borderClass: "border-purple-500/40",
    bgGradient: "from-purple-950/40 via-slate-900/90 to-slate-950",
    accentColor: "#A855F7",
    description:
      "Meme creation, social sharing, and content submissions (#content-creation, #memes)",
  },
  WARCHEST_BOOSTS: {
    id: "WARCHEST_BOOSTS",
    label: "WAR CHEST & BOOSTS",
    shortLabel: "WAR CHEST & BOOSTS",
    code: "SEC-04",
    icon: Flame,
    badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
    borderClass: "border-emerald-500/40",
    bgGradient: "from-emerald-950/40 via-slate-900/90 to-slate-950",
    accentColor: "#10B981",
    description: "Treasury donations, platform voting (DexScreener/CMC), and app logins",
  },
};

export function getMissionPillar(
  missionId: string,
  category?: string,
  roomTag?: string,
): MissionPillar {
  const id = (missionId || "").toLowerCase();
  const cat = (category || "").toLowerCase();
  const room = (roomTag || "").toLowerCase();

  // 1. FORGE & ARMORY OPS
  if (
    id.includes("forge") ||
    id.includes("armory") ||
    id.includes("pack") ||
    id.includes("scrap") ||
    id.includes("dismantle") ||
    id.includes("craft") ||
    id.includes("equip") ||
    id.includes("item") ||
    cat === "game_forge" ||
    room.includes("forge") ||
    room.includes("armory")
  ) {
    return "FORGE_ARMORY";
  }

  // 2. PSY-OP CONTENT
  if (
    id.includes("meme") ||
    id.includes("content") ||
    id.includes("loud") ||
    id.includes("asset") ||
    id.includes("propaganda") ||
    id.includes("personal") ||
    id.includes("share") ||
    id.includes("affiliate") ||
    id.includes("video") ||
    id.includes("graphic") ||
    id.includes("architect") ||
    cat === "memes" ||
    cat === "videos" ||
    cat === "socials" ||
    room.includes("content-creation") ||
    room.includes("asset-match") ||
    room.includes("personal-shares") ||
    room.includes("cto-suggestions")
  ) {
    return "PSYOP_CONTENT";
  }

  // 3. WAR CHEST & BOOSTS
  if (
    id.includes("war_chest") ||
    id.includes("warchest") ||
    id.includes("boost") ||
    id.includes("crypto") ||
    id.includes("checkin") ||
    id.includes("check_in") ||
    id.includes("donation") ||
    id.includes("treasury") ||
    id.includes("shield") ||
    id.includes("dexscreener") ||
    id.includes("vote") ||
    cat === "external" ||
    room.includes("external-proof") ||
    room.includes("war-chest") ||
    room.includes("app-game")
  ) {
    return "WARCHEST_BOOSTS";
  }

  // 4. TACTICAL RAIDS (Default for CTO raids, sniper targets, general Discord ops)
  return "TACTICAL_RAIDS";
}

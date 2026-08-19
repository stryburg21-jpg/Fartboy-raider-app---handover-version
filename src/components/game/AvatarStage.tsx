import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Sparkles,
  Camera,
  RotateCcw,
  Layers,
  Image as ImageIcon,
  Film,
  Palette,
  Lock,
  Target,
  ClipboardCopy,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { EquipmentSlot, Item, Player } from "@/types/game";
import { useGameStore } from "@/store/gameStore";
import { resolveEquippedItemsMap, resolveItemById } from "@/lib/equipmentResolver";
import { checkIsContributor } from "@/utils/contributorGating";
import { safeStorage } from "@/lib/storage";
import { EquipmentVFXSystem } from "./EquipmentVFXSystem";
import { EquipmentSelectorModal } from "./EquipmentSelectorModal";
import { FullSetRarityFoilEffect } from "./FullSetRarityFoilEffect";

/* ========================================================================== */
/* 1. GLOBAL RARITY STYLES & COLOR CONFIGURATION (unchanged)                  */
/* ========================================================================== */
export interface RarityThemeConfig {
  name: string;
  color: string;
  rgb: string;
  borderClass: string;
  textClass: string;
  glowShadow: string;
  badgeBg: string;
  pulseDuration: number;
}

export const RARITY_THEMES: Record<string, RarityThemeConfig> = {
  common: {
    name: "Common",
    color: "#06b6d4",
    rgb: "6, 182, 212",
    borderClass: "border-cyan-400/80",
    textClass: "text-cyan-400",
    glowShadow: "shadow-[0_0_18px_rgba(6,182,212,0.85)]",
    badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    pulseDuration: 3.0,
  },
  uncommon: {
    name: "Uncommon",
    color: "#10b981",
    rgb: "16, 185, 129",
    borderClass: "border-emerald-400/80",
    textClass: "text-emerald-400",
    glowShadow: "shadow-[0_0_18px_rgba(16,185,129,0.85)]",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    pulseDuration: 2.5,
  },
  rare: {
    name: "Rare",
    color: "#3b82f6",
    rgb: "59, 130, 246",
    borderClass: "border-blue-400/90",
    textClass: "text-blue-400",
    glowShadow: "shadow-[0_0_22px_rgba(59,130,246,0.9)]",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    pulseDuration: 2.0,
  },
  epic: {
    name: "Epic",
    color: "#a855f7",
    rgb: "168, 85, 247",
    borderClass: "border-purple-400/90",
    textClass: "text-purple-400",
    glowShadow: "shadow-[0_0_24px_rgba(168,85,247,0.95)]",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    pulseDuration: 1.8,
  },
  legendary: {
    name: "Legendary",
    color: "#f59e0b",
    rgb: "245, 158, 11",
    borderClass: "border-amber-400",
    textClass: "text-amber-400",
    glowShadow: "shadow-[0_0_28px_rgba(245,158,11,1)]",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    pulseDuration: 1.4,
  },
  mythic: {
    name: "Mythic",
    color: "#ef4444",
    rgb: "239, 68, 68",
    borderClass: "border-rose-500",
    textClass: "text-rose-400",
    glowShadow: "shadow-[0_0_32px_rgba(239,68,68,1)]",
    badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    pulseDuration: 1.0,
  },
};

export function getRarityTheme(rarity?: string): RarityThemeConfig {
  const r = (rarity || "common").toLowerCase();
  return RARITY_THEMES[r] || RARITY_THEMES.common;
}

/* ========================================================================== */
/* 2. TARGET NODE DEFINITIONS                                                 */
/* Positions are plain % coordinates on the 3:4 canvas now, not Tailwind      */
/* arbitrary classes — this is what the calibration mode below tunes.         */
/* `premium: true` marks slots that will later be paid-cosmetic-only.        */
/*                                                                            */
/* NOTE: socks get TWO nodes (left/right foot) since the character art shows */
/* a sock on each foot, but they both point at the single "socks" equipment  */
/* slot — equipping one sock item lights up both nodes together.             */
/* ========================================================================== */
export interface TargetNodeDef {
  key: string;
  label: string;
  slotAliases: string[];
  top: number; // % from top of the canvas
  left: number; // % from left of the canvas
  premium?: boolean;
}

// NOTE: these numbers are a starting guess, tuned against the framed card artwork
// (the illustration has its own top/bottom rune border eating ~10-12% of the canvas
// on each end, so nodes shouldn't be spread edge-to-edge). They will NOT be pixel-perfect
// for your actual asset — open Calibrate Slots, drag each one onto the real render, and
// paste the generated array back in here. That's the reliable way to close this out,
// not another round of guessing from a screenshot.
export const TARGET_NODES: TargetNodeDef[] = [
  { key: "head", label: "HAT", slotAliases: ["head", "hat"], top: 20, left: 50 },
  { key: "back", label: "CAPE", slotAliases: ["back", "cape"], top: 54, left: 78 },
  { key: "body", label: "TOP", slotAliases: ["body", "top", "shirt"], top: 44, left: 51 },
  {
    key: "shorts",
    label: "SHORTS",
    slotAliases: ["shorts", "trousers", "bottoms"],
    top: 60,
    left: 50,
  },
  { key: "socksLeft", label: "SOCKS", slotAliases: ["socks"], top: 76, left: 42 },
  { key: "socksRight", label: "SOCKS", slotAliases: ["socks"], top: 77, left: 61 },
  {
    key: "powerItem",
    label: "POWER",
    slotAliases: ["power", "poweritem", "power_item", "hand", "hands"],
    top: 55,
    left: 22,
    premium: true, // paid cosmetic — locked until unlocked or equipped
  },
  {
    key: "pet",
    label: "PET",
    slotAliases: ["pet"],
    top: 64,
    left: 80,
    premium: true, // paid cosmetic — locked until unlocked or equipped
  },
];

// Particle Config for Ambient Atmospheric Fog Effect
const PARTICLES = Array.from({ length: 16 }).map((_, i) => ({
  id: i,
  left: `${10 + ((i * 6) % 80)}%`,
  size: 3 + (i % 3) * 2,
  color: i % 2 === 0 ? "bg-emerald-400" : "bg-amber-400",
  shadow:
    i % 2 === 0 ? "shadow-[0_0_8px_rgba(34,197,94,0.9)]" : "shadow-[0_0_8px_rgba(245,158,11,0.9)]",
  duration: 2.5 + (i % 4) * 0.6,
  delay: (i * 0.3) % 2.5,
  drift: i % 2 === 0 ? 16 : -16,
}));

export interface AvatarStageProps {
  player: Player;
  itemsById?: Record<string, Item>;
  size?: number;
  className?: string;
  onSlotClick?: (slotKey: string) => void;
  hoveredSlot?: string | null;
  activeSlot?: string | null;
  onSlotHover?: (slotKey: string | null) => void;
  /** Slot keys the current player is entitled to use (unlocks `premium` nodes). */
  unlockedPremiumSlots?: string[];
  /** Called instead of onSlotClick when a locked premium slot is tapped — wire this to your paywall/upsell flow. */
  onPremiumSlotClick?: (slotKey: string) => void;
  /** Which mode this avatar render is being used for.
   *  "edit" — the loadout/customization screen: full interactive equip nodes.
   *  "display" — profile cards, showcases, leaderboards: clean character render, no overlay nodes.
   *  Defaults to "edit" to preserve existing behavior at call sites that haven't opted in yet —
   *  pass mode="display" anywhere this avatar is just being shown off, not edited. */
  mode?: "display" | "edit";
  /** Show the drag-to-place calibration toggle in the footer. Default true — flip off for production builds. */
  enableCalibration?: boolean;
  /** Show debug footer controls below avatar stage. Default false. */
  showFooterControls?: boolean;
  /** Explicitly toggle 3D animation mode vs static picture mode */
  is3DMode?: boolean;
}

export function AvatarStage({
  player,
  itemsById = {},
  size = 400,
  className = "",
  onSlotClick,
  hoveredSlot,
  activeSlot,
  onSlotHover,
  unlockedPremiumSlots = [],
  onPremiumSlotClick,
  mode = "edit",
  enableCalibration = false,
  showFooterControls = false,
  is3DMode,
}: AvatarStageProps) {
  const inventory = useGameStore((s) => s.inventory);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Local state for custom base artwork stored in safeStorage
  const [customBaseImage, setCustomBaseImage] = useState<string>(() => {
    return safeStorage.getItem("hq_raider_base_image") || "";
  });

  const [hoveredNodeKey, setHoveredNodeKey] = useState<string | null>(null);
  const [flashingSlots, setFlashingSlots] = useState<Record<string, boolean>>({});
  const [videoError, setVideoError] = useState(false);
  const [internalThemeModalOpen, setInternalThemeModalOpen] = useState(false);
  const prevEquippedRef = useRef<Record<string, string>>({});

  /* ------------------------------------------------------------------ */
  /* CALIBRATION MODE: drag nodes onto the real art, then copy the      */
  /* generated TARGET_NODES array back into this file. Dev-only helper. */
  /* ------------------------------------------------------------------ */
  const [calibrating, setCalibrating] = useState(false);
  const [livePositions, setLivePositions] = useState<Record<string, { top: number; left: number }>>(
    () => Object.fromEntries(TARGET_NODES.map((n) => [n.key, { top: n.top, left: n.left }])),
  );
  const [justCopied, setJustCopied] = useState(false);

  const handleNodePointerDown = useCallback(
    (key: string) => (e: React.PointerEvent) => {
      if (!calibrating) return;
      e.preventDefault();
      e.stopPropagation();
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();

      const move = (ev: PointerEvent) => {
        const left = ((ev.clientX - rect.left) / rect.width) * 100;
        const top = ((ev.clientY - rect.top) / rect.height) * 100;
        setLivePositions((p) => ({
          ...p,
          [key]: {
            top: Math.round(Math.max(0, Math.min(100, top))),
            left: Math.round(Math.max(0, Math.min(100, left))),
          },
        }));
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [calibrating],
  );

  const copyPositionsToClipboard = useCallback(() => {
    const code = TARGET_NODES.map((n) => {
      const pos = livePositions[n.key];
      const aliases = n.slotAliases.map((a) => `"${a}"`).join(", ");
      return `  { key: "${n.key}", label: "${n.label}", slotAliases: [${aliases}], top: ${pos.top}, left: ${pos.left}${n.premium ? ", premium: true" : ""} },`;
    }).join("\n");
    const snippet = `export const TARGET_NODES: TargetNodeDef[] = [\n${code}\n];`;
    console.log(snippet);
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(snippet).catch(() => {});
    }
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1500);
  }, [livePositions]);

  const handleThemeClick = () => {
    if (onSlotClick) {
      onSlotClick("cosmeticTheme");
    } else {
      setInternalThemeModalOpen(true);
    }
  };

  // Use the shared Contributor check (handles contributorRank === "free"/"none",
  // and the localStorage donation/Contributor Pass fallbacks) so this component's
  // gating always agrees with the rest of the app (equip modal, upgrade prompts, etc).
  const isContributor = checkIsContributor(player);

  // Contributor preference: show the looping Animation, or the static Picture
  const [useAnimation, setUseAnimation] = useState<boolean>(() => {
    try {
      const saved = safeStorage.getItem("hq_use_animation");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleUseAnimation = () => {
    const next = !useAnimation;
    setUseAnimation(next);
    try {
      safeStorage.setItem("hq_use_animation", JSON.stringify(next));
    } catch (e) {
      // Storage quota / privacy mode fallback - ignore
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          try {
            safeStorage.setItem("hq_raider_base_image", result);
          } catch {
            // Storage quota fallback
          }
          setCustomBaseImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetImage = () => {
    try {
      safeStorage.removeItem("hq_raider_base_image");
    } catch {
      // Ignore storage errors
    }
    setCustomBaseImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Resolve equipped items map
  const resolvedEquippedMap = resolveEquippedItemsMap(player.equipped ?? {}, inventory, itemsById);

  // Combine with raw player.equipped keys if present to support all slot aliases
  const allEquippedItems: Record<string, Item | undefined> = { ...resolvedEquippedMap };
  if (player.equipped) {
    for (const [rawSlot, itemId] of Object.entries(player.equipped)) {
      if (itemId && !allEquippedItems[rawSlot]) {
        const resolved = resolveItemById(itemId, inventory, itemsById);
        if (resolved) {
          allEquippedItems[rawSlot] = resolved;
        }
      }
    }
  }

  // Detect newly equipped items to trigger 0.5s Radial Light Flash
  useEffect(() => {
    const currentEquipped: Record<string, string> = {};
    for (const [slot, item] of Object.entries(allEquippedItems)) {
      if (item) currentEquipped[slot] = item.id;
    }

    const prev = prevEquippedRef.current;
    const newFlashes: Record<string, boolean> = {};

    for (const [slot, id] of Object.entries(currentEquipped)) {
      if (id && prev[slot] !== id) {
        newFlashes[slot] = true;
      }
    }

    if (Object.keys(newFlashes).length > 0) {
      setFlashingSlots((f) => ({ ...f, ...newFlashes }));
      const timer = setTimeout(() => {
        setFlashingSlots({});
      }, 500);
      prevEquippedRef.current = currentEquipped;
      return () => clearTimeout(timer);
    }

    prevEquippedRef.current = currentEquipped;
  }, [allEquippedItems]);

  // Count equipped gear items
  const equippedCount = Object.keys(player.equipped ?? {}).filter(
    (k) => !!player.equipped[k],
  ).length;

  // Primary Base Character Image: ensure robust fallback chain
  const effectiveBaseImage =
    customBaseImage ||
    (player as { characterImage?: string })?.characterImage ||
    player?.avatar ||
    "/assets/character/base_model.png";

  // Resolve equipped cosmetic theme item & assets if present. Contributor-only:
  // a non-contributor always sees the default base picture, never a custom
  // Artwork theme, even if stale equip state has one set (e.g. a lapsed pass).
  const equippedThemeItem = allEquippedItems["cosmeticTheme"] || allEquippedItems["theme"];
  const themeAssets = isContributor ? equippedThemeItem?.themeAssets : undefined;

  // Resolve equipped Power Item & its full-area scene effect. Independent
  // of edit/display `mode` so the effect loads across the full card area everywhere
  // the character renders behind the character/video layer.
  const equippedPowerItem = allEquippedItems["powerItem"] || allEquippedItems["power"];
  const powerVisualSrc =
    equippedPowerItem?.fullFrameEffect ||
    (equippedPowerItem?.image &&
    (equippedPowerItem.image.startsWith("/") ||
      equippedPowerItem.image.startsWith("http") ||
      equippedPowerItem.image.includes("."))
      ? equippedPowerItem.image
      : null);

  const effectiveVideoSrc = themeAssets?.hqVideo || "/assets/video/Video_01.mp4";
  const effectiveImageSrc =
    themeAssets?.hqImage ||
    themeAssets?.forgeImage ||
    effectiveBaseImage ||
    "/assets/avatar/base/fartboy-3d-raider.png";

  // Give the video a fresh attempt whenever its source changes (new theme
  // equipped) or the player explicitly turns 3D Motion back on — otherwise a
  // single failed/interrupted load would permanently stick showVideo to
  // false and the button would look like it does nothing.
  useEffect(() => {
    setVideoError(false);
  }, [effectiveVideoSrc]);

  useEffect(() => {
    if (is3DMode) setVideoError(false);
  }, [is3DMode]);

  // Helper to resolve an item for a given target node definition
  const getItemForNode = (nodeDef: TargetNodeDef): Item | undefined => {
    for (const alias of nodeDef.slotAliases) {
      if (allEquippedItems[alias]) return allEquippedItems[alias];
    }
    return undefined;
  };

  // If every equipped item shares the same rarity, the whole card glows that
  // rarity's color (e.g. an all-Legendary loadout makes the frame glow amber).
  // Locked premium slots with nothing equipped don't count either way.
  const equippedRarities = TARGET_NODES.map((n) => getItemForNode(n)?.rarity).filter(
    (r): r is string => Boolean(r),
  );
  const allSameRarity =
    equippedRarities.length > 0 && equippedRarities.every((r) => r === equippedRarities[0]);
  const uniformRarityTheme = allSameRarity ? getRarityTheme(equippedRarities[0]) : null;

  // Helper to check if a slot is highlighted from hover or active props
  const isNodeHighlighted = (nodeDef: TargetNodeDef) => {
    const target = (hoveredSlot || activeSlot || hoveredNodeKey || "").toLowerCase().trim();
    if (!target) return false;
    if (nodeDef.key.toLowerCase() === target) return true;
    return nodeDef.slotAliases.some((alias) => alias.toLowerCase() === target);
  };

  const handleMouseEnterNode = (nodeDef: TargetNodeDef) => {
    setHoveredNodeKey(nodeDef.key);
    onSlotHover?.(nodeDef.key);
  };

  const handleMouseLeaveNode = () => {
    setHoveredNodeKey(null);
    onSlotHover?.(null);
  };

  // All equipment and cosmetic slots are unlocked and interactive
  const isSlotLocked = (_nodeDef: TargetNodeDef, _equippedItem?: Item) => false;

  const handleNodeClick = (nodeDef: TargetNodeDef, equippedItem?: Item) => {
    if (isSlotLocked(nodeDef, equippedItem)) {
      if (onPremiumSlotClick) {
        onPremiumSlotClick(nodeDef.key);
      } else {
        onSlotClick?.(nodeDef.key);
      }
      return;
    }
    onSlotClick?.(nodeDef.key);
  };

  // 3D Motion only ever plays for Contributors — everyone else always sees the
  // linked static picture half of the equipped theme, even with the toggle on.
  // The picture is unconditionally rendered underneath (see effectiveImageSrc
  // <img> below), so something is always showing; the video is just an
  // optional overlay on top of it.
  const showVideo =
    (is3DMode !== undefined ? is3DMode : useAnimation) && isContributor && !videoError;

  return (
    <div
      ref={stageRef}
      className={`relative select-none flex flex-col items-center justify-center p-0 w-full h-full aspect-[3/4] rounded-2xl overflow-hidden bg-slate-950 group transition-colors duration-700 box-border ${className}`}
      style={{
        width: "100%",
        height: "100%",
        maxWidth: size ? (typeof size === "number" ? `${size}px` : size) : "100%",
      }}
      aria-label={`${player.username} Tactical HUD Character Canvas`}
      data-avatar-stage="true"
    >
      {/* DEEP DARK STONE / FORGE GRADIENT */}
      <div className="absolute inset-0 z-0 bg-[#07090E] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/90 via-[#0a0d14] to-[#040508] pointer-events-none" />

      {/* SUBTLE RUNIC / STONE MESH GRID TEXTURE */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* STATIC AMBIENT SPOTLIGHT BEHIND HEAD & PEDESTAL */}
      <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl opacity-40" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl opacity-35" />

      {/* STATIC ILLUMINATED PEDESTAL BENEATH FEET */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center justify-center z-[2]">
        <div className="relative flex items-center justify-center">
          <div className="w-60 h-12 rounded-[100%] border border-emerald-400/40 bg-emerald-500/10 flex items-center justify-center">
            <div className="w-48 h-8 rounded-[100%] border border-dashed border-amber-400/40" />
          </div>

          <div className="absolute inset-2 rounded-[100%] border border-amber-500/40 bg-gradient-to-r from-emerald-500/15 via-amber-500/20 to-emerald-500/15 backdrop-blur-xs" />
        </div>
        <div className="w-56 h-5 bg-black/90 blur-md rounded-full -mt-2" />
      </div>

      {/* SUBTLE VIGNETTE GRADIENT MASK */}
      <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-[#07090E] via-transparent to-[#07090E]/50" />

      {/* POWER ITEM FULL-AREA BACKGROUND / SCENE EFFECT —
          Loads across the FULL available character/card area and sits BEHIND the
          character/video (z-[10]), behaving as an environmental effect without any circular marker. */}
      {equippedPowerItem && (
        <div className="absolute inset-0 z-[6] w-full h-full overflow-hidden pointer-events-none select-none">
          {powerVisualSrc ? (
            <img
              key={powerVisualSrc}
              src={powerVisualSrc}
              alt={`${equippedPowerItem.name} Power Effect`}
              className="absolute inset-0 w-full h-full object-cover opacity-85 mix-blend-screen"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="absolute inset-0 opacity-40 mix-blend-screen animate-holographic-glitter"
              style={{
                background: `radial-gradient(ellipse at center, rgba(${getRarityTheme(equippedPowerItem.rarity).rgb}, 0.35) 0%, rgba(${getRarityTheme(equippedPowerItem.rarity).rgb}, 0.1) 45%, transparent 80%)`,
              }}
            />
          )}
        </div>
      )}

      {/* 2. UNIFIED EQUIPMENT VFX SYSTEM */}
      <EquipmentVFXSystem equippedMap={allEquippedItems} />

      {/* 3. PERMANENT CLEAN BASE CHARACTER BODY (NO OVERLAY PNGs) */}
      <div className="relative w-full h-full flex items-center justify-center z-[10] overflow-hidden bg-transparent">
        {/* Base Character Fallback Image (always present in DOM to prevent purple flash) */}
        <img
          src={effectiveImageSrc}
          alt="Base Character Fallback"
          className="w-full h-full object-contain absolute inset-0 z-0 pointer-events-none select-none filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (
              !target.src.includes("/assets/character/image_41.png") &&
              !target.src.includes("raider_base") &&
              !target.src.includes("fartboy")
            ) {
              target.src = "/assets/character/image_41.png";
            } else if (!target.src.includes("raider_base") && !target.src.includes("fartboy")) {
              target.src = "/assets/character/raider_base.png";
            } else if (!target.src.includes("fartboy-default")) {
              target.src = "/assets/avatar/base/fartboy-default.png";
            }
          }}
        />

        {showVideo && (
          <video
            key={effectiveVideoSrc}
            src={effectiveVideoSrc}
            poster={effectiveImageSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain relative z-10 pointer-events-none select-none filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.9)]"
            onError={() => setVideoError(true)}
          />
        )}

        {isContributor && themeAssets?.borderImage && (
          <img
            src={themeAssets.borderImage}
            alt="Cosmetic Theme Border"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-[20]"
            referrerPolicy="no-referrer"
          />
        )}

        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-5 bg-black/90 blur-md rounded-full pointer-events-none z-0" />
      </div>

      {/* FULL RARITY SET HOLOGRAPHIC FOIL EFFECT (Trading Card Shimmer) —
          Activates ONLY when all 7 required slots share the exact same rarity. */}
      <FullSetRarityFoilEffect player={player} inventory={inventory} itemsById={itemsById} />

      {/* CALIBRATION GRID OVERLAY (only visible while calibrating, edit mode only) */}
      {mode === "edit" && calibrating && (
        <div className="absolute inset-0 z-[39] pointer-events-none opacity-40 bg-[linear-gradient(to_right,#f59e0b_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b_1px,transparent_1px)] bg-[size:10%_10%]" />
      )}

      {/* 4. INTERACTIVE TARGET NODES SYSTEM — edit mode only. In "display" mode this is
            skipped entirely: profile cards / showcases / leaderboards just show the clean
            character render with no equip pins. */}
      {mode === "edit" && (
        <div className="absolute inset-0 z-[40] pointer-events-auto">
          {TARGET_NODES.map((nodeDef) => {
            const pos = livePositions[nodeDef.key] ?? { top: nodeDef.top, left: nodeDef.left };
            const item = getItemForNode(nodeDef);
            const isHighlighted = isNodeHighlighted(nodeDef);
            const isEquipped = Boolean(item);
            const rarityTheme = getRarityTheme(item?.rarity);
            const isFlashing = nodeDef.slotAliases.some((s) => flashingSlots[s]);
            const isLocked = isSlotLocked(nodeDef, item);

            // Power items render as a full-area scene effect behind the character,
            // so they do not render an equipped badge/marker on the avatar.
            if (nodeDef.key === "powerItem" && isEquipped) {
              return null;
            }

            const isPet = nodeDef.key === "pet";

            return (
              <div
                key={nodeDef.key}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-40 transition-transform duration-200 group/node min-h-[48px] min-w-[48px] p-2 flex items-center justify-center touch-manipulation ${
                  calibrating
                    ? "cursor-grab active:cursor-grabbing"
                    : "cursor-pointer active:scale-95"
                }`}
                style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                onPointerDown={handleNodePointerDown(nodeDef.key)}
                onMouseEnter={() => !calibrating && handleMouseEnterNode(nodeDef)}
                onMouseLeave={() => !calibrating && handleMouseLeaveNode()}
                onClick={() => !calibrating && handleNodeClick(nodeDef, item)}
              >
                {/* CALIBRATION LABEL */}
                {calibrating && (
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold text-emerald-300 bg-black/80 px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none">
                    {nodeDef.key} · {pos.top},{pos.left}
                  </span>
                )}

                {/* EQUIP FLASH: 0.5s radial light burst */}
                <AnimatePresence>
                  {isFlashing && !isLocked && (
                    <motion.div
                      initial={{ scale: 0.2, opacity: 1 }}
                      animate={{ scale: 3.5, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full pointer-events-none z-50"
                      style={{
                        background: `radial-gradient(circle, ${rarityTheme.color} 0%, transparent 70%)`,
                        boxShadow: `0 0 35px ${rarityTheme.color}`,
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* NODE DISPLAY: LOCKED / EMPTY / EQUIPPED COSMETIC / EQUIPPED GEAR */}
                {isLocked ? (
                  /* PREMIUM-LOCKED SLOT */
                  <div
                    className="relative w-7 h-7 rounded-full border border-slate-500/60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center opacity-75 transition-all duration-200 group-hover/node:opacity-100 group-hover/node:scale-110 group-hover/node:border-amber-400/70"
                    title={`${nodeDef.label} — Premium cosmetic (locked)`}
                  >
                    <Lock className="h-3 w-3 text-slate-400 group-hover/node:text-amber-300" />
                  </div>
                ) : !isEquipped ? (
                  /* EMPTY SLOT INDICATOR — subtle glow point */
                  <div
                    className="relative w-1 h-1 rounded-full transition-all duration-200 group-hover/node:scale-150"
                    style={{
                      boxShadow: isHighlighted
                        ? "0 0 16px 4px rgba(245,158,11,0.85)"
                        : "0 0 9px 2px rgba(245,158,11,0.28)",
                    }}
                    title={`Equip ${nodeDef.label}`}
                  />
                ) : isPet ? (
                  /* EQUIPPED PET COSMETIC — Natural companion sprite with enhanced visual scale */
                  <motion.div
                    whileHover={{ scale: 1.06 }}
                    animate={{ scale: isHighlighted ? 1.06 : 1 }}
                    className={`relative w-38 h-36 sm:w-38 sm:h-36 md:w-44 md:h-44 flex items-center justify-center transition-all duration-200 pointer-events-auto ${
                      isHighlighted ? "z-30 drop-shadow-[0_0_16px_rgba(245,158,11,0.7)]" : ""
                    }`}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.85)] select-none pointer-events-none"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex items-center justify-center text-4xl sm:text-5xl leading-none select-none drop-shadow-md">
                        {item.icon ?? "🐾"}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* EQUIPPED GEAR SLOT — Clean, minimal hotspot without circular background rings */
                  <div
                    className="relative w-1 h-1 transition-all duration-200"
                    style={{
                      boxShadow: isHighlighted
                        ? `0 0 16px 3px rgba(${rarityTheme.rgb}, 0.8)`
                        : `0 0 8px 1px rgba(${rarityTheme.rgb}, 0.4)`,
                    }}
                  />
                )}

                {/* HOLOGRAPHIC TOOLTIP ON HOVER (skip while locked or calibrating) */}
                <AnimatePresence>
                  {!calibrating &&
                    !isLocked &&
                    (isHighlighted || hoveredNodeKey === nodeDef.key) &&
                    isEquipped &&
                    item && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.92 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-52 p-3 rounded-xl border border-amber-500/50 bg-[#0B0E14]/95 text-left shadow-[0_0_25px_rgba(0,0,0,0.9)] backdrop-blur-md text-foreground pointer-events-none"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1 border-b border-amber-500/20 pb-1">
                          <span className="font-mono text-[9px] font-black uppercase text-amber-400 tracking-wider">
                            {nodeDef.label} SLOT
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${rarityTheme.badgeBg}`}
                          >
                            {rarityTheme.name.toUpperCase()}
                          </span>
                        </div>

                        <div className="font-display font-bold text-xs text-slate-100 truncate">
                          {item.name}
                        </div>

                        <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-amber-300">
                          <span>Lv +{item.level ?? 1}</span>
                          <span className="text-emerald-400">+{item.bonusXP ?? 5}% XP Boost</span>
                        </div>

                        {item.description && (
                          <div className="mt-1 text-[9px] text-slate-400 line-clamp-2 italic">
                            "{item.description}"
                          </div>
                        )}
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER BADGES & DEV/ADMIN CONTROLS (only rendered when showFooterControls is true) */}
      {showFooterControls && (
        <div className="mt-3 flex flex-col items-center gap-2 z-30 w-full max-w-[400px]">
          {/* 1. 3D FARTBOY RAIDER LEVEL BADGE */}
          <div className="rounded-full border border-amber-400/80 bg-slate-950/95 backdrop-blur-md px-4 py-1.5 text-[11px] font-mono font-black text-amber-300 shadow-2xl flex items-center gap-2">
            <Sparkles
              className="h-3.5 w-3.5 text-amber-400 animate-spin"
              style={{ animationDuration: "6s" }}
            />
            <span>3D FARTBOY RAIDER</span>
            <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-200">
              LVL {player.level}
            </span>
          </div>

          {/* 2. GEAR PIECES EQUIPPED PILL */}
          <div className="rounded-full border border-amber-400/60 bg-slate-950/90 px-4 py-1 font-mono text-[11px] font-black text-amber-300 shadow-xl flex items-center gap-1.5 backdrop-blur-md">
            <Layers className="h-3.5 w-3.5 text-amber-400" />
            {equippedCount} / {TARGET_NODES.length} Gear Pieces Equipped
          </div>

          {/* 2b. COSMETIC THEME EQUIPPABLE BUTTON */}
          <button
            onClick={handleThemeClick}
            className={`rounded-full border px-3.5 py-1.5 font-mono text-[10px] font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer ${
              equippedThemeItem
                ? `${RARITY_THEMES[equippedThemeItem.rarity]?.borderClass || "border-amber-400"} bg-slate-950/90 ${RARITY_THEMES[equippedThemeItem.rarity]?.textClass || "text-amber-300"} hover:border-amber-300`
                : "border-amber-500/60 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 text-amber-300 hover:border-amber-400"
            }`}
            title="Equip or change Cosmetic Theme"
          >
            <Palette
              className={`h-3.5 w-3.5 ${equippedThemeItem ? RARITY_THEMES[equippedThemeItem.rarity]?.textClass || "text-amber-400" : "text-amber-400"}`}
            />
            <span>
              {equippedThemeItem
                ? `${equippedThemeItem.image || "🎨"} ${equippedThemeItem.name}`
                : "🎨 Theme: Default"}
            </span>
          </button>

          {/* 2c. CONTRIBUTOR PICTURE / ANIMATION TOGGLE */}
          {isContributor && (
            <button
              onClick={toggleUseAnimation}
              className="rounded-full border border-amber-500/60 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 px-3.5 py-1.5 font-mono text-[10px] font-bold text-amber-300 shadow-lg hover:scale-105 hover:border-amber-400 transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer"
              title="Switch between Picture and Animation"
            >
              {useAnimation ? (
                <>
                  <Film className="h-3.5 w-3.5 text-amber-400" />
                  <span>Display Picture</span>
                </>
              ) : (
                <>
                  <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
                  <span>Display Animation</span>
                </>
              )}
            </button>
          )}

          {/* 3. DEV/ADMIN IMAGE UPLOAD & LOCAL STORAGE RE-UPLOAD BUTTON */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-amber-500/60 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 px-3.5 py-1.5 font-mono text-[10px] font-bold text-amber-300 shadow-lg hover:scale-105 hover:border-amber-400 transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer"
              title="Upload custom base artwork directly from browser"
            >
              <Camera className="h-3.5 w-3.5 text-amber-400" />
              <span>📷 SWAP BASE ARTWORK</span>
            </button>

            {customBaseImage && (
              <button
                onClick={handleResetImage}
                className="rounded-full border border-red-500/40 bg-slate-950/90 px-3 py-1.5 font-mono text-[10px] font-semibold text-red-300 shadow-md hover:bg-red-950/40 hover:border-red-400 transition-all flex items-center gap-1 cursor-pointer"
                title="Reset base artwork to default"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* 4. DEV-ONLY NODE CALIBRATION CONTROLS — drag nodes onto the art, then copy */}
          {mode === "edit" && enableCalibration && (
            <div className="flex items-center gap-2 pt-0.5">
              <button
                onClick={() => setCalibrating((c) => !c)}
                className={`rounded-full border px-3 py-1.5 font-mono text-[10px] font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  calibrating
                    ? "border-emerald-400 bg-emerald-950/60 text-emerald-300"
                    : "border-slate-600/60 bg-slate-950/80 text-slate-400 hover:border-slate-400 hover:text-slate-200"
                }`}
                title="Drag each node onto its correct spot on the art"
              >
                <Target className="h-3.5 w-3.5" />
                <span>{calibrating ? "Exit Calibration" : "Calibrate Slots"}</span>
              </button>

              {calibrating && (
                <button
                  onClick={copyPositionsToClipboard}
                  className="rounded-full border border-amber-500/60 bg-slate-950/80 px-3 py-1.5 font-mono text-[10px] font-bold text-amber-300 shadow-md hover:border-amber-400 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Copy the updated TARGET_NODES array to your clipboard and console"
                >
                  <ClipboardCopy className="h-3.5 w-3.5" />
                  <span>{justCopied ? "Copied!" : "Copy Positions"}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* STANDALONE COSMETIC THEME SELECTOR MODAL IF USED OUTSIDE HERO HUB */}
      {internalThemeModalOpen && (
        <EquipmentSelectorModal
          slot="cosmeticTheme"
          open={internalThemeModalOpen}
          onClose={() => setInternalThemeModalOpen(false)}
        />
      )}
    </div>
  );
}

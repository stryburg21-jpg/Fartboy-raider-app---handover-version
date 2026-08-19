import { useState, useEffect, useRef, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  Hammer,
  Zap,
  Sparkles,
  ShoppingBag,
  ArrowRightLeft,
  Trash2,
  AlertTriangle,
  Shuffle,
  ShieldAlert,
  Wrench,
  CheckCircle2,
  X,
  Plus,
} from "lucide-react";
import { AppShell } from "@/components/game/AppShell";
import { RarityBadge } from "@/components/game/RarityBadge";
import { ForgeItemPickerModal } from "@/components/game/ForgeItemPickerModal";
import { ItemSwapCarouselOverlay } from "@/components/game/ItemSwapCarouselOverlay";
import { RoadmapModal } from "@/components/game/RoadmapModal";
import { Button } from "@/components/ui/button";
import { isImageUrl } from "@/components/game/RaiderAvatar";
import { useGameStore } from "@/store/gameStore";
import { audio } from "@/services/audio";
import { SEASON_1_CATALOG, RARITY_CONFIG } from "@/config/masterCatalog";
import type { Rarity, Item, Player } from "@/types/game";
import {
  getForgeRequirement,
  getDismantleRefundXP,
  getLevelUpCostXP,
  MAX_ITEM_LEVEL,
  FORGE_REROLL_RULES,
  getPlayerForgeModifiers,
  calculateForgeDiscount,
  SECONDARY_SLOTS_BY_RARITY,
} from "@/config/forgeConfig";
import { setMockInventory } from "@/services/inventory";
import { setMockPlayer } from "@/services/player";
import { recordCustomXPTransaction } from "@/services/xpEngine";
import { trackMissionEvent } from "@/services/missions";
import { executeForgeActionPayload, getFusionCandidates } from "@/services/forge";
import {
  getActiveProfileId,
  DEMO_PROFILES,
  subscribeToProfileChanges,
  updateActiveProfileState,
  type ProfileId,
} from "@/services/profiles";
import {
  getDetailedItemStats,
  getItem6Stats,
  calculateActive6Stats,
  type DetailedItemStat,
} from "@/utils/itemStats";

export const Route = createFileRoute("/forge")({
  validateSearch: (search: Record<string, unknown>): { itemId?: string } => ({
    itemId: typeof search.itemId === "string" ? search.itemId : undefined,
  }),
  component: ForgePage,
});

type ForgeSection = "rarity" | "level" | "reroll" | "dismantle";

/**
 * Animated Floating Embers for Blacksmith Atmosphere
 */
function FloatingEmbers() {
  const embers = Array.from({ length: 12 });
  const colors = ["#f59e0b", "#ef4444", "#fbbf24", "#d97706", "#f43f5e"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {embers.map((_, i) => {
        const color = colors[i % colors.length];
        const size = (i % 3) + 2;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              boxShadow: `0 0 ${size * 3}px ${color}`,
              willChange: "transform, opacity",
            }}
            initial={{
              x: `${(i * 8.3 + 3) % 94}%`,
              y: "105%",
              scale: Math.random() * 0.8 + 0.4,
              opacity: Math.random() * 0.7 + 0.3,
            }}
            animate={{
              y: "-10%",
              x: [
                `${(i * 8.3 + 3) % 94}%`,
                `${((i * 8.3 + 3) % 94) + (i % 2 === 0 ? 8 : -8)}%`,
                `${((i * 8.3 + 3) % 94) + (i % 2 === 0 ? -4 : 4)}%`,
              ],
              opacity: [0, 0.9, 1, 0.4, 0],
              scale: [0.6, 1.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3.4 + (i % 4) * 0.9,
              repeat: Infinity,
              delay: (i * 0.25) % 3,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * High-Energy Spark Strike Burst Overlay (Inside Media Box)
 */
function AnvilStrikeBurst({ trigger, color }: { trigger: number; color: string }) {
  if (!trigger) return null;
  const particles = Array.from({ length: 14 });

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden">
      {/* Central Impact Flash */}
      <motion.div
        key={`flash-${trigger}`}
        initial={{ scale: 0.1, opacity: 1 }}
        animate={{ scale: 2.2, opacity: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="absolute h-32 w-32 rounded-full"
        style={{
          background: `radial-gradient(circle, #ffffff 0%, ${color} 45%, transparent 80%)`,
          boxShadow: `0 0 50px ${color}`,
        }}
      />
      {/* Shockwave Ring */}
      <motion.div
        key={`ring-${trigger}`}
        initial={{ scale: 0.2, opacity: 1, borderWidth: "6px" }}
        animate={{ scale: 2.2, opacity: 0, borderWidth: "0px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute h-40 w-40 rounded-full border-2"
        style={{ borderColor: color, boxShadow: `0 0 25px ${color}` }}
      />
      {/* Radial Spark Trails */}
      {particles.map((_, i) => {
        const angle = (i / particles.length) * 360;
        const rad = (angle * Math.PI) / 180;
        const distance = 70 + (i % 3) * 20;
        const tx = Math.cos(rad) * distance;
        const ty = Math.sin(rad) * distance;

        return (
          <motion.div
            key={`spark-${trigger}-${i}`}
            initial={{ x: 0, y: 0, scale: 1.2, opacity: 1 }}
            animate={{ x: tx, y: ty, scale: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: (i % 3) * 0.015 }}
            className="absolute h-2 w-2 rounded-full"
            style={{
              backgroundColor: i % 2 === 0 ? "#ffffff" : color,
              boxShadow: `0 0 10px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Compact Stat Row for Right Column (Highlights green when upgrading)
 */
function CompactStatRow({
  stat,
  isHighlightGreen,
  isRolling,
}: {
  stat: DetailedItemStat;
  isHighlightGreen: boolean;
  isRolling?: boolean;
}) {
  const [displayVal, setDisplayVal] = useState<number>(stat.value_pct);

  useEffect(() => {
    if (!isRolling) {
      setDisplayVal(stat.value_pct);
      return;
    }
    const interval = setInterval(() => {
      const sim = Number((Math.random() * 1.5 + 0.1).toFixed(2));
      setDisplayVal(sim);
    }, 50);
    return () => clearInterval(interval);
  }, [isRolling, stat.value_pct]);

  return (
    <div
      className={`relative overflow-hidden rounded px-1.5 py-0.5 border transition-all duration-300 flex items-center justify-between gap-1 ${
        isHighlightGreen
          ? "border-emerald-400 bg-emerald-950/80 shadow-[0_0_8px_rgba(52,211,153,0.4)] scale-[1.02]"
          : "border-slate-800/80 bg-black/60"
      }`}
    >
      <div className="flex items-center gap-1 min-w-0">
        <span className="text-[9px] shrink-0">{stat.icon}</span>
        <span className="text-[8px] font-mono font-bold uppercase tracking-tight text-slate-300 truncate">
          {stat.label}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span
          className={`font-mono font-black text-[9px] leading-none ${
            isHighlightGreen
              ? "text-emerald-400 animate-pulse"
              : stat.type === "PRIMARY"
                ? "text-amber-300"
                : "text-sky-300"
          }`}
        >
          +{isRolling ? displayVal.toFixed(2) : stat.value_pct.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

/**
 * Rarity Visual Theme Mapping
 */
const rarityAnvilTheme: Record<
  Rarity,
  { border: string; glow: string; text: string; bg: string; spark: string }
> = {
  common: {
    border: "border-slate-500/60",
    glow: "shadow-[0_0_20px_rgba(148,163,184,0.2)]",
    text: "text-slate-300",
    bg: "from-slate-900/90 via-slate-950 to-black",
    spark: "#94a3b8",
  },
  uncommon: {
    border: "border-emerald-400/70",
    glow: "shadow-[0_0_25px_rgba(52,211,153,0.3)]",
    text: "text-emerald-300",
    bg: "from-emerald-950/40 via-slate-950 to-black",
    spark: "#34d399",
  },
  rare: {
    border: "border-sky-400/80",
    glow: "shadow-[0_0_30px_rgba(56,189,248,0.35)]",
    text: "text-sky-300",
    bg: "from-sky-950/40 via-slate-950 to-black",
    spark: "#38bdf8",
  },
  epic: {
    border: "border-purple-400/80",
    glow: "shadow-[0_0_35px_rgba(192,132,252,0.4)]",
    text: "text-purple-300",
    bg: "from-purple-950/50 via-slate-950 to-black",
    spark: "#c084fc",
  },
  legendary: {
    border: "border-amber-400/90",
    glow: "shadow-[0_0_40px_rgba(245,158,11,0.45)]",
    text: "text-amber-300",
    bg: "from-amber-950/60 via-slate-950 to-black",
    spark: "#f59e0b",
  },
  mythic: {
    border: "border-rose-400",
    glow: "shadow-[0_0_50px_rgba(244,63,94,0.55)]",
    text: "text-rose-300",
    bg: "from-rose-950/60 via-amber-950/40 to-black",
    spark: "#f43f5e",
  },
};

export function ForgePage() {
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const queryItemId = searchParams?.itemId;
  const inventory = useGameStore((s) => s.inventory);
  const player = useGameStore((s) => s.player);

  const equippedThemeId = player?.equipped?.cosmeticTheme || player?.equipped?.theme;
  const equippedThemeItem = inventory.find(
    (i) => i.id === equippedThemeId || i.templateId === equippedThemeId,
  );
  const themeAssets = equippedThemeItem?.themeAssets;

  const forgeVideoSrc = "/assets/forge/Anvil.mp4";
  const forgeImageSrc = themeAssets?.forgeImage || "/assets/forge/Anvil.png";

  const [useAnimation] = useState<boolean>(true);
  const [videoError, setVideoError] = useState(false);
  const [isDevMenuOpen, setIsDevMenuOpen] = useState(false);
  const [isDevModeActive, setIsDevModeActive] = useState(false);

  const setInventory = useGameStore((s) => s.setInventory);
  const setPlayer = useGameStore((s) => s.setPlayer);
  const setNotifications = useGameStore((s) => s.setNotifications);
  const notifications = useGameStore((s) => s.notifications);

  const [activeProfileId, setActiveProfileId] = useState<ProfileId>(getActiveProfileId());

  useEffect(() => {
    return subscribeToProfileChanges(() => {
      setActiveProfileId(getActiveProfileId());
    });
  }, []);

  const profileInventory = DEMO_PROFILES[activeProfileId]?.inventory || inventory;

  const [activeSection, setActiveSection] = useState<ForgeSection>("rarity");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const hasInitializedSelection = useRef(false);

  // If queryItemId passed from Unboxing / Vault handoff, prioritize and select it
  useEffect(() => {
    if (queryItemId && inventory.some((i) => i.id === queryItemId)) {
      setSelectedItemId(queryItemId);
      hasInitializedSelection.current = true;
    }
  }, [queryItemId, inventory]);

  // Pick first inventory item on initial mount if none selected
  useEffect(() => {
    if (!hasInitializedSelection.current && !selectedItemId && inventory.length > 0) {
      hasInitializedSelection.current = true;
      setSelectedItemId(inventory[0].id);
    }
  }, [inventory, selectedItemId]);

  // Purge selected item if no longer in inventory
  useEffect(() => {
    if (selectedItemId && !inventory.some((i) => i.id === selectedItemId)) {
      setSelectedItemId(null);
      setSelectedDuplicateIds([]);
    }
  }, [inventory, selectedItemId]);

  const activeProfileItem = selectedItemId
    ? (profileInventory.find((i) => i.id === selectedItemId) ??
      inventory.find((i) => i.id === selectedItemId) ??
      null)
    : null;

  const selectedItem = activeProfileItem;
  const [isItemPickerOpen, setIsItemPickerOpen] = useState(false);
  const [roadmapModalOpen, setRoadmapModalOpen] = useState(false);

  // Fusion tab state
  const [selectedDuplicateIds, setSelectedDuplicateIds] = useState<string[]>([]);
  const [isFusingAnimation, setIsFusingAnimation] = useState(false);

  // Upgrade animation state
  const [isUpgradingAnimation, setIsUpgradingAnimation] = useState(false);

  // Reroll animation state
  const [isStatRerolling, setIsStatRerolling] = useState(false);
  const [isIdentityRerolling, setIsIdentityRerolling] = useState(false);
  const [carouselState, setCarouselState] = useState<{
    open: boolean;
    finalItem: Item | null;
    candidates: Item[];
  }>({
    open: false,
    finalItem: null,
    candidates: [],
  });

  const isAnyActionActive =
    isFusingAnimation ||
    isUpgradingAnimation ||
    isStatRerolling ||
    isIdentityRerolling ||
    carouselState.open;

  // Green Stat Highlight State
  const [highlightGreenStats, setHighlightGreenStats] = useState(false);

  // Dismantle state
  const [isDismantling, setIsDismantling] = useState(false);
  const [isDismantlingMelt, setIsDismantlingMelt] = useState(false);

  // FX animation states
  const [anvilStrikeTrigger, setAnvilStrikeTrigger] = useState(0);
  const [screenShakeTrigger, setScreenShakeTrigger] = useState(0);
  const [floatingGainText, setFloatingGainText] = useState<{ id: string; text: string } | null>(
    null,
  );
  const [floatingAnnouncement, setFloatingAnnouncement] = useState<{
    id: string;
    type: "levelup" | "fusion" | "reroll" | "dismantle" | "autoforge";
    mainText: string;
    subText?: string;
  } | null>(null);

  // Completion modal state
  const [completionModal, setCompletionModal] = useState<{
    open: boolean;
    actionType?: "levelup" | "fusion" | "reroll" | "identity_swap" | "dismantle" | "autoforge";
    title: string;
    subtitle: string;
    details: string;
    icon?: string;
    item?: Item | null;
    prevLevel?: number;
    newLevel?: number;
    prevRarity?: Rarity;
    newRarity?: Rarity;
    prevPrimaryPct?: number;
    newPrimaryPct?: number;
    statDelta?: number;
    statLabel?: string;
    refundXP?: number;
    totalXPSpent?: number;
    slotsUnlocked?: number;
  }>({
    open: false,
    title: "",
    subtitle: "",
    details: "",
    icon: "✨",
  });

  const handleCloseCompletionModal = () => {
    const isDismantle = completionModal.actionType === "dismantle";
    setCompletionModal({
      open: false,
      title: "",
      subtitle: "",
      details: "",
      icon: "✨",
      actionType: undefined,
      refundXP: undefined,
      totalXPSpent: undefined,
      slotsUnlocked: undefined,
      item: null,
      prevLevel: undefined,
      newLevel: undefined,
      prevRarity: undefined,
      newRarity: undefined,
      prevPrimaryPct: undefined,
      newPrimaryPct: undefined,
      statDelta: undefined,
      statLabel: undefined,
    });
    if (isDismantle) {
      setTimeout(() => {
        setIsItemPickerOpen(true);
      }, 150);
    }
  };

  const handleSectionChange = (section: ForgeSection) => {
    setActiveSection(section);
    audio.play("button.click");
  };

  // Compute canonical stats, active passive gear cap, & active player Forge modifiers
  const detailedStats = useMemo(() => {
    return getDetailedItemStats(selectedItem ?? {});
  }, [selectedItem]);

  const equippedItems = useMemo(() => {
    return inventory.filter((i) => i.equipped);
  }, [inventory]);

  const activeGearCap = useMemo(() => {
    return calculateActive6Stats(equippedItems);
  }, [equippedItems]);

  const forgeModifiers = useMemo(() => {
    return getPlayerForgeModifiers(player, inventory);
  }, [player, inventory]);

  const currentLevel = Math.max(1, Math.min(MAX_ITEM_LEVEL, selectedItem?.level ?? 1));
  const isMaxLevel = currentLevel >= MAX_ITEM_LEVEL;
  const nextLevel = isMaxLevel ? MAX_ITEM_LEVEL : currentLevel + 1;

  // Level Up cost with Forge Efficiency discount
  const baseNextLevelCostXP = isDevModeActive ? 0 : getLevelUpCostXP(currentLevel);
  const levelUpDiscount = useMemo(() => {
    return calculateForgeDiscount(baseNextLevelCostXP, forgeModifiers.forgeEfficiencyPct);
  }, [baseNextLevelCostXP, forgeModifiers.forgeEfficiencyPct]);
  const nextLevelCostXP = isDevModeActive ? 0 : levelUpDiscount.discountedCost;

  // Fusion Requirements with Forge Efficiency discount
  const requirement = getForgeRequirement(selectedItem?.rarity ?? "common");
  const neededDuplicates = isDevModeActive ? 0 : requirement.neededDuplicates;
  const baseFusionCostXP = isDevModeActive ? 0 : requirement.costXP;
  const fusionDiscount = useMemo(() => {
    return calculateForgeDiscount(baseFusionCostXP, forgeModifiers.forgeEfficiencyPct);
  }, [baseFusionCostXP, forgeModifiers.forgeEfficiencyPct]);
  const fusionXPCost = isDevModeActive ? 0 : fusionDiscount.discountedCost;

  // Luck Floor for Stat Rerolls
  const luckFloorPct = Math.round(forgeModifiers.rerollQualityFloor * 100);

  // Available candidate duplicates for selected item (strictly synchronous and memoized to eliminate race conditions)
  const duplicateCandidates = useMemo(() => {
    if (!selectedItem || selectedItem.rarity === "mythic") return [];
    return inventory.filter((item) => {
      if (item.id === selectedItem.id) return false;
      if (item.equipped) return false;
      if (item.slot !== selectedItem.slot || item.rarity !== selectedItem.rarity) return false;
      const isSameTemplate = item.templateId
        ? item.templateId === (selectedItem.templateId || selectedItem.id)
        : item.name === selectedItem.name;
      return isSameTemplate;
    });
  }, [selectedItem, inventory]);

  const handleSelectItem = (item: Item) => {
    setSelectedItemId(item.id);
    setSelectedDuplicateIds([]);
  };

  const handleToggleDuplicate = (id: string) => {
    if (selectedDuplicateIds.includes(id)) {
      setSelectedDuplicateIds((prev) => prev.filter((d) => d !== id));
      audio.play("button.click");
    } else {
      if (selectedDuplicateIds.length < neededDuplicates) {
        setSelectedDuplicateIds((prev) => [...prev, id]);
        audio.play("button.click");
      }
    }
  };

  const handleAutoSelectDuplicates = () => {
    if (!selectedItem) return;
    const curInv = useGameStore.getState().inventory;
    const matching = curInv.filter((item) => {
      if (item.id === selectedItem.id) return false;
      if (item.equipped) return false;
      if (item.slot !== selectedItem.slot || item.rarity !== selectedItem.rarity) return false;
      const isSameTemplate = item.templateId
        ? item.templateId === (selectedItem.templateId || selectedItem.id)
        : item.name === selectedItem.name;
      return isSameTemplate;
    });

    if (matching.length === 0) {
      triggerNotification(
        "No Duplicates Found",
        `No matching duplicate copies available in bag for ${selectedItem.name}.`,
      );
      return;
    }

    const toSelect = matching.slice(0, neededDuplicates).map((d) => d.id);
    setSelectedDuplicateIds(toSelect);
    audio.play("button.click");
    triggerNotification(
      "Duplicates Auto-Selected",
      `Auto-selected ${toSelect.length} / ${neededDuplicates} duplicate copies for ${selectedItem.name}.`,
    );
  };

  const triggerNotification = (title: string, message: string) => {
    setNotifications([
      {
        id: `notif_forge_${Date.now()}`,
        title,
        message,
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...notifications,
    ]);
  };

  // Dev Mode Handlers
  const handleDevAddXP = () => {
    useGameStore.getState().addXp(50000);
    const updatedP = useGameStore.getState().player;
    const currentInv = useGameStore.getState().inventory;
    if (updatedP) {
      setPlayer({ ...updatedP });
      updateActiveProfileState(updatedP, currentInv);
    }
    audio.play("button.click");
    triggerNotification("Dev Mode", "+50,000 Spendable XP granted!");
  };

  const handleDevGrantDuplicates = () => {
    if (!selectedItem) return;
    const dup1: Item = {
      ...selectedItem,
      id: `${selectedItem.id}_dup_${Date.now()}_1`,
      equipped: false,
      level: 1,
    };
    const dup2: Item = {
      ...selectedItem,
      id: `${selectedItem.id}_dup_${Date.now()}_2`,
      equipped: false,
      level: 1,
    };
    const currentInv = useGameStore.getState().inventory;
    const newInv = [...currentInv, dup1, dup2];
    setInventory(newInv);
    setMockInventory(newInv);
    const p = useGameStore.getState().player;
    if (p) updateActiveProfileState(p, newInv);
    audio.play("button.click");
    triggerNotification("Dev Mode", `Granted 2x duplicates for ${selectedItem.name}!`);
  };

  // 1. Level Upgrade Handler
  const handleUpgradeAction = async () => {
    if (!selectedItem) return;
    if (!isDevModeActive && isMaxLevel) return;

    const currentXP = player?.spendableXP ?? player?.xp ?? 0;
    if (!isDevModeActive && currentXP < nextLevelCostXP) {
      triggerNotification("Upgrade Error", "Insufficient Spendable XP for level upgrade.");
      return;
    }

    const prevPrimary = detailedStats.primary.value_pct;

    setIsUpgradingAnimation(true);
    setHighlightGreenStats(true);
    setAnvilStrikeTrigger((prev) => prev + 1);
    audio.play("button.click");

    setFloatingAnnouncement({
      id: String(Date.now()),
      type: "levelup",
      mainText: `🔥 LEVEL UP! LV ${nextLevel}`,
      subText: `STATS BOOSTED!`,
    });
    setTimeout(() => setFloatingAnnouncement(null), 2500);

    setTimeout(async () => {
      const res = await executeForgeActionPayload("levelup", selectedItem.id, {
        targetLevel: nextLevel,
        costXP: nextLevelCostXP,
        isDevMode: isDevModeActive,
      });
      setIsUpgradingAnimation(false);

      if (res.success && res.item) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.5 },
        });

        if (res.updatedInventory) setInventory([...res.updatedInventory]);
        if (res.updatedPlayer) setPlayer({ ...res.updatedPlayer });
        updateActiveProfileState(res.updatedPlayer, res.updatedInventory);

        const newDetailed = getDetailedItemStats(res.item);
        const newPrimary = newDetailed.primary.value_pct;
        const delta = Number((newPrimary - prevPrimary).toFixed(2));

        setTimeout(() => setHighlightGreenStats(false), 2000);

        setCompletionModal({
          open: true,
          actionType: "levelup",
          title: "🔥 LEVEL UP SUCCESSFUL!",
          subtitle: `${selectedItem.name} reached Level ${nextLevel} / ${MAX_ITEM_LEVEL}!`,
          details: `Primary and secondary stats dynamically scaled to Level ${nextLevel} potential.`,
          icon: "🔨",
          item: res.item,
          prevLevel: currentLevel,
          newLevel: nextLevel,
          prevPrimaryPct: prevPrimary,
          newPrimaryPct: newPrimary,
          statDelta: delta,
          statLabel: newDetailed.primary.label,
        });
      } else {
        setHighlightGreenStats(false);
        triggerNotification("Upgrade Failed", res.error ?? "Failed to upgrade level.");
      }
    }, 1200);
  };

  // 2. Rarity Fusion Handler
  const handleFusionAction = async () => {
    if (!selectedItem) return;

    if (!isDevModeActive && (!requirement.allowForge || !requirement.targetRarity)) {
      triggerNotification("Fusion Error", "Mythic items cannot be forged.");
      return;
    }

    if (!isDevModeActive && selectedDuplicateIds.length < neededDuplicates) {
      triggerNotification(
        "Fusion Error",
        `Requires ${neededDuplicates} duplicate copies selected.`,
      );
      return;
    }

    const currentXP = player?.spendableXP ?? player?.xp ?? 0;
    if (!isDevModeActive && currentXP < fusionXPCost) {
      triggerNotification(
        "Fusion Error",
        `Requires ${fusionXPCost.toLocaleString()} Spendable XP.`,
      );
      return;
    }

    const prevPrimary = detailedStats.primary.value_pct;
    const prevRarity = selectedItem.rarity;
    const targetR = requirement.targetRarity || "legendary";

    setIsFusingAnimation(true);
    setHighlightGreenStats(true);
    setAnvilStrikeTrigger((prev) => prev + 1);
    audio.play("button.click");

    setFloatingAnnouncement({
      id: String(Date.now()),
      type: "fusion",
      mainText: `🔥 FORGE SUCCESSFUL!`,
      subText: `[${selectedItem.rarity.toUpperCase()} ➔ ${targetR.toUpperCase()}]`,
    });
    setTimeout(() => setFloatingAnnouncement(null), 2500);

    setTimeout(async () => {
      const res = await executeForgeActionPayload("fusion", selectedItem.id, {
        sacrificeItemIds: selectedDuplicateIds,
        costXP: fusionXPCost,
        isDevMode: isDevModeActive,
      });
      setIsFusingAnimation(false);

      if (res.success && res.newItem) {
        confetti({
          particleCount: 75,
          spread: 75,
          origin: { y: 0.5 },
        });

        const nextR = res.newItem.rarity.toUpperCase();
        if (res.updatedInventory) setInventory([...res.updatedInventory]);
        if (res.updatedPlayer) setPlayer({ ...res.updatedPlayer });
        updateActiveProfileState(res.updatedPlayer, res.updatedInventory);

        const newDetailed = getDetailedItemStats(res.newItem);
        const newPrimary = newDetailed.primary.value_pct;
        const delta = Number((newPrimary - prevPrimary).toFixed(2));

        setTimeout(() => setHighlightGreenStats(false), 2000);

        setCompletionModal({
          open: true,
          actionType: "fusion",
          title: "🔥 FORGE SUCCESSFUL!",
          subtitle: `Forged New ${nextR} Gear!`,
          details: `Successfully evolved ${res.newItem.name} to ${nextR} rarity (preserves Level ${res.newItem.level ?? 1} and unlocks secondary stat slots).`,
          icon: "🔥",
          item: res.newItem,
          prevRarity,
          newRarity: res.newItem.rarity,
          prevPrimaryPct: prevPrimary,
          newPrimaryPct: newPrimary,
          statDelta: delta,
          statLabel: newDetailed.primary.label,
        });
        setSelectedDuplicateIds([]);
        setSelectedItemId(res.newItem.id);
      } else {
        setHighlightGreenStats(false);
        triggerNotification("Fusion Failed", res.error ?? "Failed to fuse items.");
      }
    }, 1200);
  };

  // 3. Tab-Specific Auto-Forge Handlers
  // 3a. Auto-Forge Rarity: Auto-selects duplicates and executes upgrades sequentially up to highest affordable tier in one batch
  const handleAutoForgeRarityAction = async () => {
    if (!selectedItem || isFusingAnimation || isUpgradingAnimation) return;

    const startRarity = selectedItem.rarity;
    let currentItem: Item = { ...selectedItem };
    const currentInv = [...useGameStore.getState().inventory];
    const curP = useGameStore.getState().player;
    let currentSpXP = isDevModeActive ? 999999999 : (curP?.spendableXP ?? curP?.xp ?? 0);

    let totalXPSpent = 0;
    let fusionsPerformed = 0;
    const sacrificedIds: string[] = [];

    // While loop running all eligible sequential rarity tiers
    while (currentItem.rarity !== "mythic") {
      const req = getForgeRequirement(currentItem.rarity);
      if (!req.allowForge || !req.targetRarity) break;

      const fusionCost = isDevModeActive
        ? 0
        : calculateForgeDiscount(req.costXP, forgeModifiers.forgeEfficiencyPct);

      // Find candidates matching the current rarity & slot
      const candidates = currentInv.filter(
        (item) =>
          item.id !== currentItem.id &&
          !item.equipped &&
          !sacrificedIds.includes(item.id) &&
          item.slot === currentItem.slot &&
          item.rarity === currentItem.rarity &&
          (item.templateId
            ? item.templateId === (currentItem.templateId || currentItem.id)
            : item.name === currentItem.name),
      );

      if (
        (!isDevModeActive && currentSpXP < fusionCost) ||
        (!isDevModeActive && candidates.length < req.neededDuplicates)
      ) {
        break;
      }

      const dupsToSacrifice = candidates.slice(0, req.neededDuplicates);
      dupsToSacrifice.forEach((d) => sacrificedIds.push(d.id));
      currentSpXP -= isDevModeActive ? 0 : fusionCost;
      totalXPSpent += isDevModeActive ? 0 : fusionCost;

      const nextRarity = req.targetRarity;
      currentItem = {
        ...currentItem,
        rarity: nextRarity,
        forgeable: nextRarity !== "mythic",
        rerollable: true,
        raidPower: Math.max(
          RARITY_CONFIG[nextRarity]?.raidPower || 10,
          (currentItem.raidPower || 10) + 15,
        ),
        bonusXP: RARITY_CONFIG[nextRarity]?.bonusXP ?? currentItem.bonusXP + 5,
      };
      fusionsPerformed++;
    }

    if (fusionsPerformed === 0) {
      if (startRarity === "mythic" || !getForgeRequirement(startRarity).allowForge) {
        triggerNotification(
          "Auto-Forge Maxed",
          "This gear piece is already at maximum rarity (Mythic)!",
        );
      } else {
        triggerNotification(
          "Auto-Forge Unavailable",
          "Insufficient duplicate items or Spendable XP to upgrade rarity tier.",
        );
      }
      return;
    }

    const targetRarity = currentItem.rarity;
    setIsFusingAnimation(true);
    setHighlightGreenStats(true);
    setAnvilStrikeTrigger((prev) => prev + 1);
    audio.play("button.click");

    setFloatingAnnouncement({
      id: String(Date.now()),
      type: "autoforge",
      mainText: `⚡ AUTO-FORGE RARITY!`,
      subText: `EVOLVED TO ${targetRarity.toUpperCase()} TIER`,
    });
    setTimeout(() => setFloatingAnnouncement(null), 2500);

    setTimeout(async () => {
      setIsFusingAnimation(false);

      const rawMeta = currentItem.metadata as Record<string, unknown> | undefined;
      const qualityRoll =
        (typeof rawMeta?.quality_roll_pct === "number" && rawMeta.quality_roll_pct) ||
        (typeof rawMeta?.reroll_quality_pct === "number" && rawMeta.reroll_quality_pct) ||
        0.95;

      const intermediateItem: Item = {
        ...currentItem,
        level: selectedItem.level ?? 1,
        maxLevel: MAX_ITEM_LEVEL,
        metadata: {
          ...(selectedItem.metadata || {}),
          quality_roll_pct: qualityRoll,
        },
      };

      const stats6 = getItem6Stats(intermediateItem);
      const updatedItem: Item = {
        ...intermediateItem,
        stats: {
          generalXP: stats6.generalXP,
          raidXP: stats6.raidXP,
          ctoXP: stats6.ctoXP,
          missionsXP: stats6.missionsXP,
          graphicXP: stats6.graphicXP,
          luck: stats6.luck,
        },
      };

      const newInv = currentInv
        .filter((i) => !sacrificedIds.includes(i.id))
        .map((i) => (i.id === selectedItem.id ? updatedItem : i));

      const actualCurrentSpXP = curP?.spendableXP ?? curP?.xp ?? 0;
      const newSpendableXP = Math.max(0, actualCurrentSpXP - (isDevModeActive ? 0 : totalXPSpent));

      const newPlayer: Player = {
        ...(curP as Player),
        spendableXP: newSpendableXP,
        xp: newSpendableXP,
        equipped: selectedItem.equipped
          ? { ...(curP?.equipped ?? {}), [selectedItem.slot]: updatedItem.id }
          : (curP?.equipped ?? {}),
      };

      setInventory(newInv);
      setPlayer(newPlayer);
      setMockInventory(newInv);
      setMockPlayer(newPlayer);
      updateActiveProfileState(newPlayer, newInv);
      useGameStore.setState({ player: newPlayer, inventory: newInv });

      recordCustomXPTransaction({
        activityName: "Auto-Forge Rarity Upgrade",
        netXPAwarded: -totalXPSpent,
        spXpBefore: actualCurrentSpXP,
        spXpAfter: newSpendableXP,
        ltXpBefore: curP?.lifetimeXP ?? curP?.xp ?? 0,
        ltXpAfter: curP?.lifetimeXP ?? curP?.xp ?? 0,
        note: `Auto-Forged ${updatedItem.name} to ${targetRarity.toUpperCase()}`,
      });

      trackMissionEvent("item_forged", fusionsPerformed);
      if (targetRarity === "epic" || targetRarity === "legendary") {
        trackMissionEvent("epic_item_crafted", 1);
      }

      // Suppress all modals during Auto-Forge
      setCompletionModal((prev) => ({ ...prev, open: false }));
      setTimeout(() => setHighlightGreenStats(false), 2000);

      const capRarity = targetRarity.charAt(0).toUpperCase() + targetRarity.slice(1);
      triggerNotification(
        "⚡ Auto-Forge Complete",
        `Auto-Forged to ${capRarity} (Level ${updatedItem.level ?? 1})! -${totalXPSpent.toLocaleString()} XP`,
      );

      setSelectedDuplicateIds([]);
      setSelectedItemId(updatedItem.id);
    }, 1200);
  };

  // 3b. Auto-Forge Level: Calculates max affordable level and instantly levels up in one batch
  const handleAutoForgeLevelAction = async () => {
    if (!selectedItem || isUpgradingAnimation) return;

    const startLevel = selectedItem.level ?? 1;
    if (startLevel >= MAX_ITEM_LEVEL) {
      triggerNotification(
        "Auto-Forge Maxed",
        "This gear piece is already at maximum level (10/10)!",
      );
      return;
    }

    let currentLevel = startLevel;
    const curP = useGameStore.getState().player;
    let currentSpXP = isDevModeActive ? 999999999 : (curP?.spendableXP ?? curP?.xp ?? 0);

    let totalXPSpent = 0;
    let totalLevelsGained = 0;

    while (currentLevel < MAX_ITEM_LEVEL) {
      const rawCost = getLevelUpCostXP(currentLevel);
      const discountedCost = isDevModeActive
        ? 0
        : calculateForgeDiscount(rawCost, forgeModifiers.forgeEfficiencyPct);

      if (isDevModeActive || currentSpXP >= discountedCost) {
        currentSpXP -= isDevModeActive ? 0 : discountedCost;
        totalXPSpent += isDevModeActive ? 0 : discountedCost;
        currentLevel++;
        totalLevelsGained++;
      } else {
        break;
      }
    }

    if (totalLevelsGained === 0) {
      triggerNotification("Auto-Forge Unavailable", "Insufficient Spendable XP to level up item.");
      return;
    }

    const finalLevel = currentLevel;
    setIsUpgradingAnimation(true);
    setHighlightGreenStats(true);
    setAnvilStrikeTrigger((prev) => prev + 1);
    audio.play("button.click");

    setFloatingAnnouncement({
      id: String(Date.now()),
      type: "autoforge",
      mainText: `⚡ AUTO-FORGE LEVEL!`,
      subText: `MAXIMIZED TO LEVEL ${finalLevel} / ${MAX_ITEM_LEVEL}`,
    });
    setTimeout(() => setFloatingAnnouncement(null), 2500);

    setTimeout(async () => {
      setIsUpgradingAnimation(false);

      const intermediateItem: Item = {
        ...selectedItem,
        level: finalLevel,
        maxLevel: MAX_ITEM_LEVEL,
      };

      const stats6 = getItem6Stats(intermediateItem);
      const updatedItem: Item = {
        ...intermediateItem,
        stats: {
          generalXP: stats6.generalXP,
          raidXP: stats6.raidXP,
          ctoXP: stats6.ctoXP,
          missionsXP: stats6.missionsXP,
          graphicXP: stats6.graphicXP,
          luck: stats6.luck,
        },
      };

      const currentInv = [...useGameStore.getState().inventory];
      const newInv = currentInv.map((i) => (i.id === selectedItem.id ? updatedItem : i));

      const actualCurrentSpXP = curP?.spendableXP ?? curP?.xp ?? 0;
      const newSpendableXP = Math.max(0, actualCurrentSpXP - (isDevModeActive ? 0 : totalXPSpent));

      const newPlayer: Player = {
        ...(curP as Player),
        spendableXP: newSpendableXP,
        xp: newSpendableXP,
        equipped: selectedItem.equipped
          ? { ...(curP?.equipped ?? {}), [selectedItem.slot]: updatedItem.id }
          : (curP?.equipped ?? {}),
      };

      setInventory(newInv);
      setPlayer(newPlayer);
      setMockInventory(newInv);
      setMockPlayer(newPlayer);
      updateActiveProfileState(newPlayer, newInv);
      useGameStore.setState({ player: newPlayer, inventory: newInv });

      recordCustomXPTransaction({
        activityName: "Auto-Forge Level Upgrade",
        netXPAwarded: -totalXPSpent,
        spXpBefore: actualCurrentSpXP,
        spXpAfter: newSpendableXP,
        ltXpBefore: curP?.lifetimeXP ?? curP?.xp ?? 0,
        ltXpAfter: curP?.lifetimeXP ?? curP?.xp ?? 0,
        note: `Auto-Forged ${updatedItem.name} to Level ${finalLevel}`,
      });

      trackMissionEvent("item_level_up", totalLevelsGained);

      // Suppress all modals during Auto-Forge
      setCompletionModal((prev) => ({ ...prev, open: false }));
      setTimeout(() => setHighlightGreenStats(false), 2000);

      const capRarity = selectedItem.rarity.charAt(0).toUpperCase() + selectedItem.rarity.slice(1);
      triggerNotification(
        "⚡ Auto-Forge Complete",
        `Auto-Forged to ${capRarity} (Level ${finalLevel})! -${totalXPSpent.toLocaleString()} XP`,
      );

      setSelectedItemId(updatedItem.id);
    }, 1200);
  };

  // 4. Stat Value Reroll Handler
  const handleStatRerollAction = async () => {
    if (!selectedItem || isStatRerolling) return;

    const currentXP = player?.spendableXP ?? player?.xp ?? 0;
    const cost = isDevModeActive ? 0 : FORGE_REROLL_RULES.statReroll.costXP;

    if (!isDevModeActive && currentXP < cost) {
      triggerNotification("Reroll Error", `Requires ${cost.toLocaleString()} Spendable XP.`);
      return;
    }

    const prevPrimary = detailedStats.primary.value_pct;

    setIsStatRerolling(true);
    setHighlightGreenStats(true);
    setAnvilStrikeTrigger((prev) => prev + 1);
    audio.play("button.click");

    setTimeout(async () => {
      const res = await executeForgeActionPayload("reroll", selectedItem.id, {
        isDevMode: isDevModeActive,
      });
      setIsStatRerolling(false);

      if (res.success && res.item) {
        if (res.updatedInventory) setInventory([...res.updatedInventory]);
        if (res.updatedPlayer) setPlayer({ ...res.updatedPlayer });
        updateActiveProfileState(res.updatedPlayer, res.updatedInventory);
        setSelectedItemId(res.item.id);

        const pct = Math.round((res.qualityRoll ?? 0.95) * 100);
        const floorPct = Math.round((res.luckFloor ?? forgeModifiers.rerollQualityFloor) * 100);
        const newDetailed = getDetailedItemStats(res.item);
        const newPrimary = newDetailed.primary.value_pct;
        const delta = Number((newPrimary - prevPrimary).toFixed(2));

        setFloatingAnnouncement({
          id: String(Date.now()),
          type: "reroll",
          mainText: `🎲 STAT REROLL SUCCESSFUL!`,
          subText: `(${pct}% ROLL • MIN ${floorPct}% FLOOR)`,
        });
        setTimeout(() => setFloatingAnnouncement(null), 2500);

        setTimeout(() => setHighlightGreenStats(false), 2000);

        setCompletionModal({
          open: true,
          actionType: "reroll",
          title: "🎲 STAT REROLL SUCCESSFUL!",
          subtitle: `Quality Roll: ${pct}% Max Potential!`,
          details: `Stat quality for ${res.item.name} was successfully rerolled (${pct}% roll with guaranteed ${floorPct}% Luck floor). Equipment stats updated.`,
          icon: "🎲",
          item: res.item,
          prevPrimaryPct: prevPrimary,
          newPrimaryPct: newPrimary,
          statDelta: delta,
          statLabel: newDetailed.primary.label,
        });
      } else {
        setHighlightGreenStats(false);
        triggerNotification("Reroll Failed", res.error ?? "Could not reroll stats.");
      }
    }, 1200);
  };

  // 5. Identity Swap Reroll Handler
  const handleIdentitySwapAction = async () => {
    if (!selectedItem || isIdentityRerolling || carouselState.open) return;

    const currentXP = player?.spendableXP ?? player?.xp ?? 0;
    const cost = isDevModeActive ? 0 : FORGE_REROLL_RULES.identityReroll.costXP;

    if (!isDevModeActive && currentXP < cost) {
      triggerNotification("Reroll Error", `Requires ${cost.toLocaleString()} Spendable XP.`);
      return;
    }

    setIsIdentityRerolling(true);
    setAnvilStrikeTrigger((prev) => prev + 1);
    audio.play("button.click");

    const res = await executeForgeActionPayload("identity_swap", selectedItem.id, {
      isDevMode: isDevModeActive,
    });
    setIsIdentityRerolling(false);

    if (res.success && res.newItem) {
      // Pick matching slot candidates from master catalog for the spin sequence
      const sameSlotCandidates = SEASON_1_CATALOG.filter(
        (it) => it.slot === selectedItem.slot && it.id !== selectedItem.id,
      ).slice(0, 10);

      // Open dynamic 3D-style horizontal carousel slot animation directly over 75% video viewport
      setCarouselState({
        open: true,
        finalItem: res.newItem,
        candidates: sameSlotCandidates.length > 0 ? sameSlotCandidates : [res.newItem],
      });

      if (res.updatedInventory) setInventory([...res.updatedInventory]);
      if (res.updatedPlayer) setPlayer({ ...res.updatedPlayer });
      updateActiveProfileState(res.updatedPlayer, res.updatedInventory);
      setSelectedItemId(res.newItem.id);

      setFloatingAnnouncement({
        id: String(Date.now()),
        type: "reroll",
        mainText: `🔀 IDENTITY SWAP SUCCESSFUL!`,
        subText: res.newItem.name,
      });
      setTimeout(() => setFloatingAnnouncement(null), 3000);
    } else {
      triggerNotification("Swap Failed", res.error ?? "Could not swap identity.");
    }
  };

  // 6. Dismantle Handler
  const handleDismantleAction = async () => {
    if (!selectedItem || isDismantling) return;

    if (!isDevModeActive && selectedItem.equipped) {
      triggerNotification("Dismantle Error", "Equipped items cannot be dismantled.");
      return;
    }

    const refundXP = getDismantleRefundXP(selectedItem.rarity);
    const itemName = selectedItem.name;

    setIsDismantlingMelt(true);
    setAnvilStrikeTrigger((prev) => prev + 1);
    audio.play("button.click");

    setTimeout(async () => {
      setIsDismantling(true);

      const res = await executeForgeActionPayload("dismantle", selectedItem.id);
      setIsDismantling(false);
      setIsDismantlingMelt(false);

      if (res.success) {
        if (res.updatedInventory) setInventory([...res.updatedInventory]);
        if (res.updatedPlayer) setPlayer({ ...res.updatedPlayer });
        updateActiveProfileState(res.updatedPlayer, res.updatedInventory);

        setSelectedItemId(null);
        setSelectedDuplicateIds([]);

        setFloatingAnnouncement({
          id: String(Date.now()),
          type: "dismantle",
          mainText: `💥 ITEM DISMANTLED!`,
          subText: `+${refundXP.toLocaleString()} XP CREDITED`,
        });
        setTimeout(() => setFloatingAnnouncement(null), 2500);

        // Instantly return interface to Item Selection / Armory screen
        setIsItemPickerOpen(true);
        triggerNotification(
          "💥 Item Scrapped",
          `Dismantled ${itemName} and received +${refundXP.toLocaleString()} Spendable XP!`,
        );
      } else {
        triggerNotification("Dismantle Failed", res.error ?? "Could not dismantle item.");
      }
    }, 600);
  };

  const theme = selectedItem ? rarityAnvilTheme[selectedItem.rarity] : rarityAnvilTheme.common;
  const currentXP = player?.spendableXP ?? player?.xp ?? 0;

  return (
    <AppShell>
      {/* ─────────────────────────────────────────────────────────────
          SINGLE NON-SCROLLING MOBILE VIEWPORT CONTAINER
      ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-lg mx-auto h-[calc(100dvh-3.5rem-4.5rem)] sm:h-[calc(100vh-4.5rem)] max-h-[820px] flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-950/25 via-slate-950 to-black p-2 sm:p-2.5 shadow-[0_0_50px_rgba(245,158,11,0.15)] select-none">
        {/* Floating Atmosphere Embers */}
        <FloatingEmbers />

        {/* Ambient Furnace Glow */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [0.98, 1.04, 0.98],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-700/20 via-amber-950/10 to-transparent blur-2xl"
        />

        {/* ─────────────────────────────────────────────────────────────
            1. EXPANDED TOP BAR & CURRENCY DISPLAY (VERTICALLY STACKED)
            - Top Nav Tabs: [THE FORGE] | [RAID SHOP]
            - Row 1: Prominent Spendable XP balance + Switch Gear + Dev controls
            - Row 2: Live status indicators, workbench bonuses & luck stats (fully visible, no scrollbars)
        ───────────────────────────────────────────────────────────── */}
        <div className="relative z-10 w-full shrink-0 flex flex-col gap-1">
          {/* PINNED TOP NAV TABS: [THE FORGE] | [RAID SHOP] */}
          <div className="grid grid-cols-2 gap-1 p-0.5 rounded-xl bg-black/90 border border-amber-500/30 backdrop-blur-md shadow-md">
            <button
              type="button"
              onClick={() => audio.play("button.click")}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-mono text-[11px] sm:text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-black border border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)] cursor-pointer"
            >
              <Hammer className="h-3.5 w-3.5 fill-black text-black" />
              <span>THE FORGE</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audio.play("button.click");
                navigate({ to: "/shop" });
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30 transition-all cursor-pointer"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
              <span>RAID SHOP</span>
            </button>
          </div>

          {/* ROADMAP HERO BANNER ENTRY */}
          <button
            type="button"
            onClick={() => {
              audio.play("button.click");
              setRoadmapModalOpen(true);
            }}
            className="w-full group flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-950/80 via-purple-950/70 to-slate-950/90 border border-indigo-500/40 hover:border-indigo-400/80 text-indigo-200 transition-all cursor-pointer shadow-md hover:shadow-indigo-500/20 active:scale-[0.99]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs shrink-0 animate-pulse">🚀</span>
              <span className="font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-indigo-300 group-hover:text-indigo-200 truncate">
                UPCOMING FEATURES &amp; ROADMAP
              </span>
            </div>
            <span className="font-mono text-[9px] font-black text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0 flex items-center gap-0.5 bg-indigo-900/60 px-1.5 py-0.5 rounded border border-indigo-400/30">
              VIEW ➔
            </span>
          </button>

          {/* EXPANDED VERTICALLY STACKED HEADER (ROW 1 + ROW 2) */}
          <header className="w-full flex flex-col gap-1 rounded-xl border border-amber-500/40 bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-950 p-1.5 sm:p-2 shadow-md backdrop-blur-md font-mono">
            {/* ROW 1: SPENDABLE XP DISPLAY & GEAR CONTROLS */}
            <div className="flex items-center justify-between gap-1.5 border-b border-amber-500/20 pb-1">
              {/* Prominent Spendable XP */}
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shadow-sm shrink-0">
                  <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-300 fill-amber-300 animate-pulse" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-wider text-amber-400/80 leading-none">
                    SPENDABLE XP
                  </span>
                  <span className="font-mono font-black text-xs sm:text-sm text-amber-300 tracking-tight drop-shadow-[0_0_6px_rgba(245,158,11,0.5)] truncate">
                    {currentXP.toLocaleString()} XP
                  </span>
                </div>
              </div>

              {/* Right Controls: Switch Gear & Dev */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    audio.play("button.click");
                    setIsItemPickerOpen(true);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-amber-400/80 bg-gradient-to-r from-amber-500/20 to-amber-600/30 hover:bg-amber-500/40 text-amber-300 font-mono font-black text-[8.5px] sm:text-[9.5px] uppercase tracking-wider px-2 py-1 shadow-sm active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                >
                  <ArrowRightLeft className="h-3 w-3 text-amber-300" />
                  <span>SWITCH GEAR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDevMenuOpen((prev) => !prev)}
                  className={`p-1 rounded-lg border text-[8.5px] font-mono transition-all cursor-pointer ${
                    isDevModeActive
                      ? "bg-amber-400 text-black border-amber-200"
                      : "bg-slate-900/80 text-slate-400 border-slate-700 hover:text-amber-300"
                  }`}
                  title="Toggle Dev Sandbox"
                >
                  <Wrench className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* ROW 2: LIVE STATUS INDICATORS & WORKBENCH BONUSES (CLEAN, NO SCROLLBAR, FULL VISIBILITY) */}
            <div className="grid grid-cols-3 gap-1 pt-0.5">
              {/* Efficiency Discount */}
              <div
                className="flex items-center justify-center gap-1 bg-slate-900/90 px-1.5 py-0.5 rounded-lg border border-amber-500/30 text-[8px] sm:text-[9px] font-mono text-amber-300"
                title="Equipped Forge Efficiency Discount"
              >
                <Hammer className="h-2.5 w-2.5 text-amber-400 shrink-0" />
                <span className="text-slate-400 hidden min-[360px]:inline text-[7.5px]">
                  Discount:
                </span>
                <span className="font-black">
                  {forgeModifiers.forgeEfficiencyPct > 0
                    ? `-${forgeModifiers.forgeEfficiencyPct}%`
                    : "0%"}
                </span>
              </div>

              {/* Passive 6-Stat Cap Boost */}
              <div
                className="flex items-center justify-center gap-1 bg-slate-900/90 px-1.5 py-0.5 rounded-lg border border-slate-700/80 text-[8px] sm:text-[9px] font-mono"
                title="Passive 6-Stat Boost Cap"
              >
                <span className="text-slate-400 hidden min-[360px]:inline text-[7.5px] uppercase">
                  Cap:
                </span>
                <span
                  className={`font-black ${activeGearCap.isCapped ? "text-amber-400" : "text-emerald-400"}`}
                >
                  +{activeGearCap.totalGearBonus.toFixed(1)}%
                </span>
              </div>

              {/* Luck Floor */}
              <div
                className="flex items-center justify-center gap-1 bg-purple-950/80 px-1.5 py-0.5 rounded-lg border border-purple-500/30 text-[8px] sm:text-[9px] font-mono text-purple-200"
                title="Luck Quality Floor on Rerolls"
              >
                <Sparkles className="h-2.5 w-2.5 text-purple-300 shrink-0" />
                <span className="text-purple-300/80 hidden min-[360px]:inline text-[7.5px]">
                  Luck:
                </span>
                <span className="font-black">
                  {forgeModifiers.luckPct > 0 ? `+${forgeModifiers.luckPct}%` : "0%"}
                </span>
              </div>
            </div>
          </header>
        </div>

        {/* DEV MENU DROPDOWN (COMPACT OVERLAY) */}
        <AnimatePresence>
          {isDevMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="relative z-30 rounded-xl border border-amber-500/40 bg-slate-950/95 p-1.5 shadow-xl flex items-center justify-between gap-1 text-[8.5px] font-mono shrink-0 my-0.5"
            >
              <button
                type="button"
                onClick={() => setIsDevModeActive((prev) => !prev)}
                className={`px-2 py-0.5 rounded font-black uppercase cursor-pointer ${
                  isDevModeActive ? "bg-amber-400 text-black" : "bg-slate-900 text-slate-300"
                }`}
              >
                {isDevModeActive ? "DEV: ON" : "DEV: OFF"}
              </button>
              <button
                type="button"
                onClick={handleDevAddXP}
                className="px-2 py-0.5 rounded bg-emerald-500 text-black font-black uppercase cursor-pointer active:scale-[0.98]"
              >
                +50k XP
              </button>
              <button
                type="button"
                onClick={handleDevGrantDuplicates}
                className="px-2 py-0.5 rounded bg-sky-500 text-black font-black uppercase cursor-pointer active:scale-[0.98]"
              >
                +2 Dups
              </button>
              <button
                type="button"
                onClick={() => setIsDevMenuOpen(false)}
                className="p-0.5 rounded text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─────────────────────────────────────────────────────────────
            2 & 3. ADJUSTED HERO SPLIT PANEL (75% / 25%)
            - LEFT COLUMN (75%): Main Forge media viewport (aspect-ratio: 9/16, object-fit: contain, width/height: 100%, no cropping)
            - RIGHT COLUMN (25%): Item Stat Card (Upper) + Duplicate Selection/Milestones (Lower)
        ───────────────────────────────────────────────────────────── */}
        <div className="relative z-10 grid grid-cols-4 gap-1.5 flex-1 min-h-0 my-1 items-stretch">
          {/* ─────────────────────────────────────────────────────────
              LEFT COLUMN (75% WIDTH - COL-SPAN-3): MEDIA VIEWPORT
          ───────────────────────────────────────────────────────── */}
          <div className="col-span-3 relative h-full flex flex-col justify-center items-center overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-b from-black via-slate-950 to-black p-1 shadow-inner group">
            {/* Screen Shake & Glowing Aura Frame Container */}
            <motion.div
              key={`shake-${screenShakeTrigger}`}
              animate={
                screenShakeTrigger > 0
                  ? {
                      x: [0, -5, 5, -4, 4, -2, 2, 0],
                      y: [0, 3, -3, 2, -2, 1, -1, 0],
                    }
                  : {}
              }
              transition={{ duration: 0.45, ease: "easeOut" }}
              className={`relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg bg-black transition-all duration-300 ${
                isAnyActionActive
                  ? "ring-2 ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.6)]"
                  : "border border-slate-900"
              } ${carouselState.open ? "filter blur-sm brightness-75 scale-[0.98]" : ""}`}
            >
              {useAnimation && !videoError ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  onError={() => setVideoError(true)}
                  style={{
                    aspectRatio: "9/16",
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                  className="pointer-events-none rounded-lg"
                  src={forgeVideoSrc}
                />
              ) : (
                <img
                  src={forgeImageSrc}
                  alt="The Anvil"
                  style={{
                    aspectRatio: "9/16",
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                  className="pointer-events-none rounded-lg"
                />
              )}

              {/* High-Energy Spark Strike Burst */}
              <AnvilStrikeBurst trigger={anvilStrikeTrigger} color={theme.spark} />

              {/* In-Line Anvil Item Pedestal: Positioned directly above the physical anvil */}
              {selectedItem && !carouselState.open && (
                <div className="absolute bottom-[52%] sm:bottom-[52%] left-[84%] -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center">
                  {/* Radiant Anvil Energy Base */}
                  <div
                    className={`absolute -bottom-1 h-1 w-4 rounded-full blur-md opacity-80 ${theme.glow}`}
                    style={{
                      background: `radial-gradient(circle, ${theme.spark} 0%, transparent 80%)`,
                    }}
                  />

                  {/* Floating Pedestal Icon Card */}
                  <motion.div
                    animate={
                      isAnyActionActive
                        ? { scale: [1, 1.25, 0.95, 1.15, 1], rotate: [0, -6, 6, -3, 0] }
                        : { y: [0, -3, 0] }
                    }
                    transition={{
                      duration: isAnyActionActive ? 0.7 : 3,
                      repeat: isAnyActionActive ? 0 : Infinity,
                      ease: "easeInOut",
                    }}
                    className={`relative flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl border-2 bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.glow} shadow-2xl backdrop-blur-md`}
                  >
                    {isImageUrl(selectedItem.icon) ? (
                      <img
                        src={selectedItem.icon}
                        alt={selectedItem.name}
                        className="h-6 w-6 sm:h-7 sm:w-7 object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
                      />
                    ) : (
                      <span className="text-base sm:text-lg filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                        {selectedItem.icon || "⚔️"}
                      </span>
                    )}

                    {/* Level Flame Badge on Item */}
                    <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 bg-gradient-to-r from-amber-500 to-orange-600 px-1.5 py-0.2 rounded-full border border-yellow-300 text-[7px] sm:text-[7.5px] font-mono font-black text-black shadow-md">
                      <span>LV</span>
                      <span>{currentLevel}</span>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Floating Stat Gain Particle Indicator */}
              <AnimatePresence>
                {floatingGainText && (
                  <motion.div
                    key={floatingGainText.id}
                    initial={{ opacity: 0, y: 0, scale: 0.7 }}
                    animate={{ opacity: 1, y: -45, scale: 1.1 }}
                    exit={{ opacity: 0, y: -70, scale: 0.9 }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                    className="absolute bottom-[30%] left-1/2 -translate-x-1/2 z-30 px-2.5 py-1 rounded-full bg-emerald-500/90 text-black border border-emerald-300 font-mono font-black text-[9px] sm:text-[10px] shadow-[0_0_20px_rgba(16,185,129,0.8)] pointer-events-none whitespace-nowrap"
                  >
                    {floatingGainText.text}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* In-Frame Status Announcement Banner */}
              <AnimatePresence>
                {floatingAnnouncement && !carouselState.open && (
                  <motion.div
                    key={floatingAnnouncement.id}
                    initial={{ opacity: 0, scale: 0.8, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="absolute bottom-2 z-20 mx-auto px-3 py-1 rounded-lg bg-black/85 border border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)] backdrop-blur-md flex flex-col items-center justify-center text-center max-w-[90%]"
                  >
                    <span className="font-display font-black text-[10px] sm:text-xs text-amber-300 uppercase tracking-wide">
                      {floatingAnnouncement.mainText}
                    </span>
                    {floatingAnnouncement.subText && (
                      <span className="font-mono font-bold text-[8px] sm:text-[9px] text-white/90">
                        {floatingAnnouncement.subText}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* 3D-Style Horizontal Item Swap Carousel Slot Animation Overlay */}
            <ItemSwapCarouselOverlay
              isOpen={carouselState.open}
              onClose={() => setCarouselState((prev) => ({ ...prev, open: false }))}
              candidateItems={carouselState.candidates}
              finalItem={carouselState.finalItem}
              onAnimationComplete={(newItem) => {
                setCompletionModal({
                  open: true,
                  actionType: "identity_swap",
                  title: "🔀 IDENTITY SWAP SUCCESSFUL!",
                  subtitle: `Transformed into ${newItem.name}!`,
                  details: `Successfully transformed item into ${newItem.name} (${newItem.rarity.toUpperCase()} ${newItem.slot.toUpperCase()}). Preserved Level ${newItem.level ?? 1} and quality roll while adapting stats!`,
                  icon: "🔀",
                  item: newItem,
                });
              }}
            />
          </div>

          {/* ─────────────────────────────────────────────────────────
              RIGHT COLUMN (25% WIDTH - COL-SPAN-1): CONSOLIDATED PANEL
              - UPPER BLOCK: Item Stat Card (Name, Level/Rarity, Stats)
              - LOWER BLOCK: Contextual Panel (Duplicate Selection / Milestones / Luck Floor)
          ───────────────────────────────────────────────────────── */}
          <div className="col-span-1 h-full flex flex-col justify-between gap-1 overflow-hidden">
            {/* UPPER BLOCK: ITEM STAT CARD */}
            <div className="flex flex-col gap-0.5 rounded-xl border border-slate-800 bg-slate-950/90 p-1.5 shadow-md">
              {selectedItem ? (
                <>
                  {/* Gear Name */}
                  <h3
                    className={`font-display font-black text-[9px] sm:text-[10px] uppercase truncate tracking-tight leading-tight ${theme.text}`}
                    title={selectedItem.name}
                  >
                    {selectedItem.name}
                  </h3>

                  {/* Level & Rarity Badges */}
                  <div className="flex items-center justify-between gap-0.5">
                    <RarityBadge rarity={selectedItem.rarity} size="xs" />
                    <span className="text-[7.5px] font-mono font-bold text-amber-400 bg-amber-500/20 px-1 py-0.2 rounded border border-amber-400/40">
                      LV {currentLevel}
                    </span>
                  </div>

                  {/* Dynamic Stats List (Highlights green on upgrade) */}
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <CompactStatRow
                      stat={detailedStats.primary}
                      isHighlightGreen={highlightGreenStats}
                      isRolling={isStatRerolling}
                    />
                    {detailedStats.secondaries.slice(0, 2).map((sec, idx) => (
                      <CompactStatRow
                        key={idx}
                        stat={sec}
                        isHighlightGreen={highlightGreenStats}
                        isRolling={isStatRerolling}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-4 text-center text-slate-500 text-[8px] font-mono">
                  NO GEAR SELECTED
                </div>
              )}
            </div>

            {/* LOWER BLOCK: CONTEXTUAL PANEL */}
            <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-slate-800/90 bg-slate-950/80 p-1.5 overflow-hidden">
              {activeSection === "rarity" && (
                <div className="h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1">
                    <span className="text-[8px] font-mono font-bold text-amber-300 uppercase tracking-tight">
                      DUPLICATE SLOTS
                    </span>
                    <span
                      className={`text-[8px] font-mono font-black px-1.5 py-0.2 rounded transition-all ${
                        selectedDuplicateIds.length >= neededDuplicates && neededDuplicates > 0
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                          : "bg-slate-900 text-slate-400 border border-slate-800"
                      }`}
                    >
                      {selectedDuplicateIds.length}/{neededDuplicates}
                    </span>
                  </div>

                  {/* FULL-WIDTH AUTO-SELECT ALL DUPLICATES BUTTON */}
                  <button
                    type="button"
                    onClick={handleAutoSelectDuplicates}
                    disabled={
                      duplicateCandidates.length === 0 ||
                      (neededDuplicates > 0 && selectedDuplicateIds.length >= neededDuplicates)
                    }
                    className={`w-full mb-1 py-1.5 px-2 rounded-lg font-mono text-[7.5px] min-[380px]:text-[8.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 border shadow-sm ${
                      selectedDuplicateIds.length >= neededDuplicates && neededDuplicates > 0
                        ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.3)] cursor-default"
                        : duplicateCandidates.length === 0
                          ? "bg-slate-900/60 text-slate-500 border-slate-800 cursor-not-allowed"
                          : "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black border border-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.5)] active:scale-[0.98] cursor-pointer hover:brightness-105"
                    }`}
                  >
                    <Sparkles
                      className={`h-3 w-3 shrink-0 ${
                        selectedDuplicateIds.length >= neededDuplicates && neededDuplicates > 0
                          ? "text-emerald-400"
                          : "text-black fill-black"
                      }`}
                    />
                    <span className="whitespace-nowrap">
                      {selectedDuplicateIds.length >= neededDuplicates && neededDuplicates > 0
                        ? "DUPLICATES FILLED"
                        : "AUTO-SELECT ALL DUPLICATES"}
                    </span>
                  </button>

                  {/* Vertical Duplicate Cards List (NO horizontal scrollbar) */}
                  <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-1">
                    {duplicateCandidates.length > 0 ? (
                      duplicateCandidates.map((dup) => {
                        const isSelected = selectedDuplicateIds.includes(dup.id);
                        return (
                          <button
                            key={dup.id}
                            type="button"
                            onClick={() => handleToggleDuplicate(dup.id)}
                            className={`w-full flex items-center justify-between p-1 rounded border transition-all cursor-pointer text-left ${
                              isSelected
                                ? "bg-amber-500/20 border-amber-400 shadow-sm"
                                : "bg-black/50 border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="text-xs shrink-0">{dup.icon || "⚔️"}</span>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[7.5px] font-mono font-bold text-slate-200 truncate">
                                  {dup.name}
                                </span>
                                <span className="text-[6.5px] font-mono text-amber-400">
                                  LV {dup.level ?? 1}
                                </span>
                              </div>
                            </div>
                            <div
                              className={`h-3 w-3 rounded-full flex items-center justify-center border shrink-0 ${
                                isSelected
                                  ? "bg-amber-400 border-amber-300 text-black"
                                  : "border-slate-700 bg-slate-900"
                              }`}
                            >
                              {isSelected && <CheckCircle2 className="h-2.5 w-2.5 fill-black" />}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-1">
                        <span className="text-[7.5px] font-mono text-slate-500 leading-tight">
                          No duplicate copies in bag.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSection === "level" && (
                <div className="h-full flex flex-col justify-between p-0.5 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-0.5">
                    <span className="text-[7.5px] font-mono font-bold text-amber-300 uppercase">
                      LEVEL TRACK
                    </span>
                    <span className="text-[7.5px] font-mono font-bold text-slate-400">
                      LV {currentLevel}/{MAX_ITEM_LEVEL}
                    </span>
                  </div>

                  {/* 10-Step Visual Milestone Grid */}
                  <div className="grid grid-cols-5 gap-0.5 my-auto">
                    {Array.from({ length: MAX_ITEM_LEVEL }).map((_, idx) => {
                      const lvl = idx + 1;
                      const isCurrent = lvl === currentLevel;
                      const isPassed = lvl < currentLevel;
                      const isMax = lvl === MAX_ITEM_LEVEL;

                      return (
                        <div
                          key={lvl}
                          className={`flex flex-col items-center justify-center py-0.5 px-0.2 rounded border text-center transition-all ${
                            isCurrent
                              ? "bg-amber-500 text-black border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.6)] font-black"
                              : isPassed
                                ? "bg-amber-950/70 text-amber-300 border-amber-600/40 font-bold"
                                : "bg-slate-900/60 text-slate-500 border-slate-800"
                          }`}
                        >
                          <span className="text-[6.5px] font-mono leading-none">
                            {isMax ? "MAX" : `L${lvl}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-0.5 rounded bg-black/50 border border-slate-800/80 text-center">
                    <span className="text-[6.5px] font-mono text-slate-300 leading-none">
                      {isMaxLevel ? "🌟 MAX LEVEL" : `NEXT: LV ${nextLevel}`}
                    </span>
                  </div>
                </div>
              )}

              {activeSection === "reroll" && (
                <div className="h-full flex flex-col justify-between text-center p-0.5">
                  <span className="text-[7.5px] font-mono font-bold text-purple-300 uppercase border-b border-slate-800 pb-0.5">
                    LUCK FLOOR
                  </span>
                  <div className="flex flex-col items-center justify-center my-auto">
                    <span className="text-base font-display font-black text-purple-300">
                      MIN {luckFloorPct}%
                    </span>
                    <span className="text-[7px] font-mono text-slate-400 mt-0.5">
                      GUARANTEED QUALITY ROLL
                    </span>
                  </div>
                </div>
              )}

              {activeSection === "dismantle" && (
                <div className="h-full flex flex-col justify-between text-center p-0.5">
                  <span className="text-[7.5px] font-mono font-bold text-rose-300 uppercase border-b border-slate-800 pb-0.5">
                    DISMANTLE XP
                  </span>
                  <div className="flex flex-col items-center justify-center my-auto">
                    <span className="text-sm font-display font-black text-rose-400">
                      +
                      {selectedItem
                        ? getDismantleRefundXP(selectedItem.rarity).toLocaleString()
                        : 0}{" "}
                      XP
                    </span>
                    <span className="text-[7px] font-mono text-slate-400 mt-0.5">
                      INSTANT SPENDABLE XP
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. ACTION CONTROLS & BEFORE/AFTER STAT PREVIEW
            - Mode tabs: [RARITY] [LEVEL] [REROLL] [DISMANTLE] in a single tight row
            - Stat Preview Strip right above action CTA
            - Active Tab Primary Action Button directly below with full width and clear contrast (min 48px height)
            - Pinned Auto-Forge Max Button
        ───────────────────────────────────────────────────────────── */}
        <div className="relative z-10 w-full shrink-0 flex flex-col gap-1 mt-0.5">
          {/* MODE TABS ROW: [RARITY] [LEVEL] [REROLL] [DISMANTLE] - HIGH VISIBILITY ILLUMINATED NEON CONTAINER */}
          <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-black/95 border-2 border-amber-500/60 shadow-[0_0_24px_rgba(245,158,11,0.35)] backdrop-blur-xl ring-1 ring-amber-400/40">
            <button
              type="button"
              onClick={() => handleSectionChange("rarity")}
              className={`py-1.5 px-1 rounded-lg font-mono text-[9px] sm:text-[10px] uppercase tracking-wider transition-all cursor-pointer text-center ${
                activeSection === "rarity"
                  ? "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-300 text-black font-black border-2 border-amber-200 shadow-[0_0_22px_rgba(245,158,11,0.95),inset_0_0_10px_rgba(255,255,255,0.7)] ring-2 ring-amber-400/80 scale-[1.03] z-10"
                  : "bg-slate-950/80 text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800 font-bold hover:border-slate-700"
              }`}
            >
              RARITY
            </button>

            <button
              type="button"
              onClick={() => handleSectionChange("level")}
              className={`py-1.5 px-1 rounded-lg font-mono text-[9px] sm:text-[10px] uppercase tracking-wider transition-all cursor-pointer text-center ${
                activeSection === "level"
                  ? "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-300 text-black font-black border-2 border-amber-200 shadow-[0_0_22px_rgba(245,158,11,0.95),inset_0_0_10px_rgba(255,255,255,0.7)] ring-2 ring-amber-400/80 scale-[1.03] z-10"
                  : "bg-slate-950/80 text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800 font-bold hover:border-slate-700"
              }`}
            >
              LEVEL
            </button>

            <button
              type="button"
              onClick={() => handleSectionChange("reroll")}
              className={`py-1.5 px-1 rounded-lg font-mono text-[9px] sm:text-[10px] uppercase tracking-wider transition-all cursor-pointer text-center ${
                activeSection === "reroll"
                  ? "bg-gradient-to-r from-purple-400 via-purple-500 to-indigo-400 text-black font-black border-2 border-purple-200 shadow-[0_0_22px_rgba(168,85,247,0.95),inset_0_0_10px_rgba(255,255,255,0.7)] ring-2 ring-purple-400/80 scale-[1.03] z-10"
                  : "bg-slate-950/80 text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800 font-bold hover:border-slate-700"
              }`}
            >
              REROLL
            </button>

            <button
              type="button"
              onClick={() => handleSectionChange("dismantle")}
              className={`py-1.5 px-1 rounded-lg font-mono text-[9px] sm:text-[10px] uppercase tracking-wider transition-all cursor-pointer text-center ${
                activeSection === "dismantle"
                  ? "bg-gradient-to-r from-rose-500 via-red-500 to-rose-400 text-white font-black border-2 border-rose-200 shadow-[0_0_22px_rgba(244,63,94,0.95),inset_0_0_10px_rgba(255,255,255,0.5)] ring-2 ring-rose-400/80 scale-[1.03] z-10"
                  : "bg-slate-950/80 text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800 font-bold hover:border-slate-700"
              }`}
            >
              DISMANTLE
            </button>
          </div>

          {/* STAT PREVIEW STRIP (BEFORE ➔ AFTER COMPARISON) */}
          {selectedItem && (
            <div className="w-full rounded-lg bg-slate-950/90 border border-amber-500/30 px-2 py-1 shadow-sm font-mono flex items-center justify-between text-[8px] sm:text-[9px]">
              {activeSection === "rarity" && (
                <>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 uppercase">Tier:</span>
                    <span className="font-black uppercase text-amber-300">
                      {selectedItem.rarity}
                    </span>
                    <span className="text-slate-400">➔</span>
                    <span className="font-black uppercase text-emerald-400">
                      {requirement.targetRarity || "MYTHIC"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 uppercase">SLOTS:</span>
                    <span
                      className={`font-mono font-black transition-all px-1.5 py-0.5 rounded ${
                        selectedDuplicateIds.length >= neededDuplicates && neededDuplicates > 0
                          ? "text-emerald-300 bg-emerald-950/90 border border-emerald-400/70 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                          : selectedDuplicateIds.length > 0
                            ? "text-amber-300 bg-amber-950/50 border border-amber-500/40"
                            : "text-slate-300 bg-slate-900/60 border border-slate-800"
                      }`}
                    >
                      {selectedDuplicateIds.length} ➔ {neededDuplicates}
                    </span>
                  </div>
                </>
              )}

              {activeSection === "level" && (
                <>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 uppercase">Primary:</span>
                    <span className="font-black text-amber-300">
                      {detailedStats.primary.formatted}
                    </span>
                    <span className="text-slate-400">➔</span>
                    <span className="font-black text-emerald-400">
                      {isMaxLevel
                        ? detailedStats.primary.formatted
                        : `+${(detailedStats.primary.value_pct + 0.05).toFixed(2)}%`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 uppercase">Rank:</span>
                    <span className="font-bold text-amber-300">
                      LV {currentLevel} ➔ {isMaxLevel ? "MAX" : nextLevel}
                    </span>
                  </div>
                </>
              )}

              {activeSection === "reroll" && (
                <>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 uppercase">Luck Floor:</span>
                    <span className="font-black text-purple-300">≥ {luckFloorPct}% Guaranteed</span>
                  </div>
                  <div className="text-slate-400">Rolls: 80-100% Quality</div>
                </>
              )}

              {activeSection === "dismantle" && (
                <>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 uppercase">Instant XP Gain:</span>
                    <span className="font-black text-rose-400">
                      +{getDismantleRefundXP(selectedItem.rarity).toLocaleString()} XP
                    </span>
                  </div>
                  <div className="text-rose-400 font-bold">DESTROY GEAR</div>
                </>
              )}
            </div>
          )}

          {/* ACTIVE PRIMARY ACTION BUTTON (FULL WIDTH, MIN 48PX HEIGHT, HIGH CONTRAST) */}
          <div className="w-full">
            {activeSection === "rarity" && (
              <Button
                size="lg"
                disabled={
                  !selectedItem ||
                  isFusingAnimation ||
                  (!isDevModeActive &&
                    (selectedDuplicateIds.length < neededDuplicates ||
                      currentXP < fusionXPCost ||
                      selectedItem.rarity === "mythic"))
                }
                onClick={handleFusionAction}
                className={`w-full min-h-[46px] h-11 sm:h-12 rounded-xl font-mono text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] ${
                  selectedItem?.rarity === "mythic"
                    ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                    : selectedDuplicateIds.length >= neededDuplicates && currentXP >= fusionXPCost
                      ? "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-black border border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                      : "bg-amber-500/30 text-amber-300/60 border border-amber-500/20"
                }`}
              >
                <Hammer className="h-4 w-4 shrink-0" />
                <span>
                  {selectedItem?.rarity === "mythic"
                    ? "MAX RARITY (MYTHIC)"
                    : isFusingAnimation
                      ? "FORGING..."
                      : `UPGRADE RARITY • ${fusionXPCost.toLocaleString()} XP`}
                </span>
              </Button>
            )}

            {activeSection === "level" && (
              <Button
                size="lg"
                disabled={
                  !selectedItem ||
                  isUpgradingAnimation ||
                  (!isDevModeActive && (isMaxLevel || currentXP < nextLevelCostXP))
                }
                onClick={handleUpgradeAction}
                className={`w-full min-h-[46px] h-11 sm:h-12 rounded-xl font-mono text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] ${
                  isMaxLevel
                    ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                    : currentXP >= nextLevelCostXP
                      ? "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-black border border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                      : "bg-amber-500/30 text-amber-300/60 border border-amber-500/20"
                }`}
              >
                <Zap className="h-4 w-4 shrink-0" />
                <span>
                  {isMaxLevel
                    ? "MAX LEVEL REACHED"
                    : isUpgradingAnimation
                      ? "UPGRADING..."
                      : `LEVEL UP (LV ${nextLevel}) • ${nextLevelCostXP.toLocaleString()} XP`}
                </span>
              </Button>
            )}

            {activeSection === "reroll" && (
              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  size="lg"
                  disabled={
                    !selectedItem ||
                    isStatRerolling ||
                    (!isDevModeActive && currentXP < FORGE_REROLL_RULES.statReroll.costXP)
                  }
                  onClick={handleStatRerollAction}
                  className="w-full min-h-[46px] h-11 sm:h-12 rounded-xl font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider bg-gradient-to-r from-purple-500 to-indigo-500 text-white border border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:brightness-110 active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  <span>
                    REROLL STATS (
                    {isDevModeActive ? "FREE" : `${FORGE_REROLL_RULES.statReroll.costXP} XP`})
                  </span>
                </Button>

                <Button
                  size="lg"
                  disabled={
                    !selectedItem ||
                    isIdentityRerolling ||
                    (!isDevModeActive && currentXP < FORGE_REROLL_RULES.identityReroll.costXP)
                  }
                  onClick={handleIdentitySwapAction}
                  className="w-full min-h-[46px] h-11 sm:h-12 rounded-xl font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-black border border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-[0.98] cursor-pointer"
                >
                  <Shuffle className="h-3.5 w-3.5 mr-1" />
                  <span>
                    SWAP ITEM (
                    {isDevModeActive ? "FREE" : `${FORGE_REROLL_RULES.identityReroll.costXP} XP`})
                  </span>
                </Button>
              </div>
            )}

            {activeSection === "dismantle" && (
              <Button
                size="lg"
                disabled={!selectedItem || selectedItem.equipped || isDismantling}
                onClick={handleDismantleAction}
                className="w-full min-h-[46px] h-11 sm:h-12 rounded-xl font-mono text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white border border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>
                  {selectedItem?.equipped
                    ? "CANNOT DISMANTLE (EQUIPPED)"
                    : isDismantling
                      ? "DISMANTLING..."
                      : `DISMANTLE ITEM (+${selectedItem ? getDismantleRefundXP(selectedItem.rarity).toLocaleString() : 0} XP)`}
                </span>
              </Button>
            )}
          </div>

          {/* PINNED AUTO-FORGE FULL-WIDTH BOTTOM CTA - ONLY SHOWN UNDER RARITY & LEVEL TABS */}
          {(activeSection === "rarity" || activeSection === "level") && (
            <button
              type="button"
              onClick={
                activeSection === "rarity"
                  ? handleAutoForgeRarityAction
                  : handleAutoForgeLevelAction
              }
              className="w-full px-4 py-2 text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis rounded-lg border border-amber-400/80 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-black font-mono uppercase tracking-wider shadow-[0_0_18px_rgba(245,158,11,0.5)] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:brightness-105"
            >
              <Zap className="h-3.5 w-3.5 fill-black text-black shrink-0" />
              <span className="truncate">
                {activeSection === "rarity"
                  ? "⚡ AUTO-FORGE RARITY (MAX TIER)"
                  : "⚡ AUTO-FORGE LEVEL (MAX LVL)"}
              </span>
            </button>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            MODALS WITH CENTERED FLEX & BACKDROP BLUR
        ───────────────────────────────────────────────────────────── */}
        {/* ITEM PICKER MODAL */}
        <ForgeItemPickerModal
          open={isItemPickerOpen}
          onOpenChange={setIsItemPickerOpen}
          items={profileInventory}
          selectedItemId={selectedItemId}
          onSelectItem={handleSelectItem}
        />

        {/* FORGE COMPLETION SUCCESS MODAL */}
        <AnimatePresence>
          {completionModal.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
              <motion.div
                initial={{ scale: 0.7, opacity: 0, y: 25 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                className="relative w-full max-w-sm rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-slate-950 via-slate-900 to-black p-5 shadow-[0_0_60px_rgba(245,158,11,0.4)] text-center space-y-4 overflow-hidden"
              >
                {/* Radiant Backdrop Aura */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-36 w-36 rounded-full bg-amber-500/30 blur-2xl pointer-events-none" />

                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}
                  className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 border-2 border-yellow-200 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(245,158,11,0.8)]"
                >
                  {completionModal.icon || "✨"}
                </motion.div>

                <div className="space-y-1 relative z-10">
                  <h3 className="font-display font-black text-xl text-amber-300 uppercase tracking-wide drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">
                    {completionModal.title}
                  </h3>
                  <p className="font-mono text-xs font-black text-white">
                    {completionModal.subtitle}
                  </p>
                  <p className="font-mono text-[11px] text-slate-300 leading-relaxed">
                    {completionModal.details}
                  </p>
                </div>

                {completionModal.statDelta !== undefined && completionModal.statDelta > 0 && (
                  <div className="relative z-10 p-2 rounded-xl bg-emerald-950/80 border border-emerald-400 text-emerald-300 font-mono text-xs font-black shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                    +{completionModal.statDelta}% {completionModal.statLabel ?? "Stat"} Upgrade!
                  </div>
                )}

                <Button
                  onClick={handleCloseCompletionModal}
                  className="relative z-10 w-full min-h-[46px] h-11 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:brightness-110 text-black font-mono text-xs font-black uppercase tracking-wider cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-[0.98]"
                >
                  Continue Forging
                </Button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <RoadmapModal open={roadmapModalOpen} onOpenChange={setRoadmapModalOpen} />
    </AppShell>
  );
}

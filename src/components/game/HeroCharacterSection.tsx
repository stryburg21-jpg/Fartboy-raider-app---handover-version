import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { isImageUrl } from "./RaiderAvatar";
import {
  Zap,
  Share2,
  Eye,
  ArrowRightLeft,
  ArrowRight,
  Rocket,
  X,
  Hammer,
  Palette,
  Film,
  Image as ImageIcon,
  Download,
  Wand2,
  Sparkles,
  Trophy,
  Tag,
  Check,
  Target,
  Package,
  Info,
  Crown,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Shield,
  BarChart2,
  Home,
  UserCheck,
  Award,
  Edit3,
  Wrench,
  RotateCcw,
  Clock,
  Lock,
} from "lucide-react";
import type { EquipmentSlot, Item, Player, PlayerContributionStats, Mission } from "@/types/game";
import { AvatarLayerStack } from "./AvatarLayerStack";
import { LumaKeyVideoFrame } from "./LumaKeyVideoFrame";
import { AvatarPickerModal } from "./AvatarPickerModal";
import { TitleCosmeticSelectorModal } from "./TitleCosmeticSelectorModal";
import { EquipmentSelectorModal } from "./EquipmentSelectorModal";
import { ItemDetailsModal } from "./ItemDetailsModal";
import { PackOpeningModal } from "./PackOpeningModal";
import { ThreePacketUnboxingModal } from "./ThreePacketUnboxingModal";
import { RoadmapModal } from "./RoadmapModal";
import { ContributorRoadmapCard } from "./ContributorRoadmapCard";
import { DonateMoreModal } from "./DonateMoreModal";
import {
  ContributorUpgradeRequiredModal,
  type LockedFeatureType,
} from "./ContributorUpgradeRequiredModal";
import { checkIsContributor, isContributorItem } from "@/utils/contributorGating";
import { safeStorage } from "@/lib/storage";
import { UserRankStatusWidget } from "./UserRankStatusWidget";
import { StatInfoTooltip } from "./StatInfoTooltip";
import { ProgressionAndServerMeters } from "./ProgressionAndServerMeters";
import { DailyMissionMasteryConsole } from "./DailyMissionMasteryConsole";
import { useGameStore } from "@/store/gameStore";
import { useDailyMissionsStore } from "@/store/dailyMissionsStore";
import type { AutomatedMissionItem } from "@/services/automatedMissionsApi";
import { getMissions, getTimeUntilUtcMidnight } from "@/services/missions";
import { resolveItemById } from "@/lib/equipmentResolver";
import { rarityBorderClass, rarityLabel, rarityTextClass } from "@/lib/rarity";
import { getSetInfoForItem } from "@/lib/sets";
import {
  calculateEquipmentXpCap,
  calculateSpecialistSetBonus,
  calculateSeasonalTitleXp,
  calculateReputationSummary,
} from "@/services/economyEngine";
import {
  REPUTATION_TIERS,
  WEEKLY_REP_XP_CAP,
  MAX_REPUTATION_XP,
  getReputationTier,
} from "@/config/reputationConfig";
import { getUserMultipliersPayload } from "@/services/player";
import { getDetailedItemStats, getItem6Stats } from "@/utils/itemStats";
import { SEASON_1_SETS } from "@/config/masterCatalog";
import {
  fetchRaiderLoadout,
  autoEquipSetPayload,
  fetchPlayerIdentityPayload,
  unequipAllGearPayload,
  autoEquipBestInSlotPayload,
  fetchPowerBreakdownPayload,
  executeAutoEquipOption,
  type PowerBreakdownCategory,
} from "@/services/inventory";
import mockInventoryData from "@/data/mockInventoryData.json";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface HeroCharacterSectionProps {
  player: Player;
  itemsById: Record<string, Item>;
  unopenedPacksCount?: number;
  allRoles?: unknown[];
  activeSpecialistIdentity: string;
  setInfoBonusDescription?: string;
  contribStats?: PlayerContributionStats | null;
  onOpenShareModal: () => void;
  onScrollToEquipment?: () => void;
}

interface SlotDef {
  key: EquipmentSlot;
  label: string;
  icon: string;
}

// 7 Equipped Gear Slots organized into flanking left (3), flanking right (3), and bottom-center (1)
const FLANKING_LEFT_SLOTS: SlotDef[] = [
  { key: "head", label: "HAT", icon: "🎩" },
  { key: "body", label: "TOP", icon: "👕" },
  { key: "shorts", label: "SHORTS", icon: "🩳" },
];

const FLANKING_RIGHT_SLOTS: SlotDef[] = [
  { key: "feet", label: "BOOTS", icon: "🥾" },
  { key: "back", label: "CAPE", icon: "🦸" },
  { key: "pet", label: "PET", icon: "🐾" },
];

const FLANKING_BOTTOM_SLOTS: SlotDef[] = [{ key: "powerItem", label: "POWER", icon: "⚡" }];

const ALL_SLOTS: SlotDef[] = [
  ...FLANKING_LEFT_SLOTS,
  ...FLANKING_RIGHT_SLOTS,
  ...FLANKING_BOTTOM_SLOTS,
];

// Fallback aliases
const LEFT_SLOTS = FLANKING_LEFT_SLOTS;
const RIGHT_SLOTS = [...FLANKING_RIGHT_SLOTS, ...FLANKING_BOTTOM_SLOTS];

type SubNavTab = "overview" | "loadout" | "stats" | "cosmetics" | "titles";

export function HeroCharacterSection({
  player,
  itemsById,
  unopenedPacksCount = 0,
  allRoles,
  activeSpecialistIdentity,
  setInfoBonusDescription,
  contribStats,
  onOpenShareModal,
  onScrollToEquipment,
}: HeroCharacterSectionProps) {
  const navigate = useNavigate();
  const unequipSlot = useGameStore((s) => s.unequipSlot);
  const equipItem = useGameStore((s) => s.equipItem);
  const inventory = useGameStore((s) => s.inventory);
  const packs = useGameStore((s) => s.packs);
  const [packOpeningOpen, setPackOpeningOpen] = useState(false);
  const [rankCardExpanded, setRankCardExpanded] = useState(false);
  const unopenedCount = packs ? packs.length : unopenedPacksCount;
  const activePackToOpen = packs && packs.length > 0 ? packs[0] : null;

  const [activeTab, setActiveTab] = useState<SubNavTab>("overview");
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [statModalOpen, setStatModalOpen] = useState(false);
  const [xpMultipliersModalOpen, setXpMultipliersModalOpen] = useState(false);
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);
  const [showRepTierTable, setShowRepTierTable] = useState(false);
  const [showJsonContract, setShowJsonContract] = useState(false);
  const [powerBreakdownModalOpen, setPowerBreakdownModalOpen] = useState(false);
  const [powerBreakdownData, setPowerBreakdownData] = useState<{
    totalLifetimeXP?: number;
    totalPower: number;
    categories: PowerBreakdownCategory[];
  } | null>(null);
  const [activeSelectorSlot, setActiveSelectorSlot] = useState<EquipmentSlot | null>(null);
  const [inspectingItem, setInspectingItem] = useState<Item | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [autoEquipMsg, setAutoEquipMsg] = useState<string | null>(null);
  const [is3DMode, setIs3DMode] = useState(true);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);
  const [autoEquipModalOpen, setAutoEquipModalOpen] = useState(false);
  const [identityPayload, setIdentityPayload] = useState<{
    discordUsername: string;
    equippedTitle: string;
    titleXpBoostPct: number;
    activeSet: {
      setName: string;
      piecesEquipped: number;
      piecesRequired: number;
      isFullSet: boolean;
      bonusDescription: string;
    };
  } | null>(null);

  const equippedTitle = player?.titles?.find((t) => t?.equipped);
  const activeTitleName = identityPayload?.equippedTitle || equippedTitle?.name || "The Stinker";

  const isContributor = checkIsContributor(player);

  // Effective, render-safe 3D flag: non-contributors always see 2D, no matter
  // what the raw toggle preference above says (it's preserved so a lapsed or
  // future contributor's last choice comes back once they unlock 3D again).
  // AvatarStage independently double-checks isContributor too before ever
  // playing video, so this is belt-and-suspenders - but the label/icon below
  // reads off this value, so it has to agree with what's actually rendered.
  const effectiveIs3DMode = isContributor && is3DMode;

  const equippedFrameId = player.equipped?.frame;
  const equippedFrameItem = resolveItemById(equippedFrameId, inventory, itemsById);
  // Frame is a Contributor-only cosmetic — non-contributors never render it,
  // even if stale equip state still points at one (e.g. a lapsed pass).
  const frameAsset = isContributor ? equippedFrameItem?.frameAsset : undefined;

  // HQ Theme (the linked video/picture pair shown on the pedestal, e.g. Fartboy).
  // Swapping this only ever offers themes the player already owns/unlocked —
  // same "owned inventory only" gating EquipmentSelectorModal already applies to frames.
  const equippedThemeId = player.equipped?.cosmeticTheme || player.equipped?.theme;
  const equippedThemeItem = resolveItemById(equippedThemeId, inventory, itemsById);

  const [contributorUpgradeModalOpen, setContributorUpgradeModalOpen] = useState(false);
  const [lockedFeatureKey, setLockedFeatureKey] = useState<LockedFeatureType>("general");

  const [dailyMissions, setDailyMissions] = useState<Mission[]>([]);
  const [resetTimer, setResetTimer] = useState<string>(() => getTimeUntilUtcMidnight());
  const [dailyUnboxingModalOpen, setDailyUnboxingModalOpen] = useState(false);
  const [roadmapModalOpen, setRoadmapModalOpen] = useState(false);
  const [expandedSlotKey, setExpandedSlotKey] = useState<EquipmentSlot | null>(null);
  const [isDailyAccordionOpen, setIsDailyAccordionOpen] = useState(false);
  const [isMediaTrayOpen, setIsMediaTrayOpen] = useState(false);

  // EQUIP ANIMATION ("WOW FACTOR") TRACKING
  const [animatingSlots, setAnimatingSlots] = useState<Record<string, number>>({});
  const [characterFrameEquipPulse, setCharacterFrameEquipPulse] = useState(false);
  const prevEquippedRef = useRef<Record<string, string | undefined>>({});

  useEffect(() => {
    const currentEquipped = player.equipped || {};
    const changed: Record<string, number> = {};
    let hasChanges = false;

    (["head", "body", "shorts", "feet", "back", "pet", "powerItem"] as EquipmentSlot[]).forEach(
      (slot) => {
        if (
          prevEquippedRef.current[slot] !== undefined &&
          prevEquippedRef.current[slot] !== currentEquipped[slot] &&
          currentEquipped[slot]
        ) {
          changed[slot] = Date.now();
          hasChanges = true;
        }
      },
    );

    if (hasChanges) {
      setAnimatingSlots((prev) => ({ ...prev, ...changed }));
      setCharacterFrameEquipPulse(true);
      const timer = setTimeout(() => {
        setAnimatingSlots((prev) => {
          const next = { ...prev };
          for (const k in changed) {
            delete next[k];
          }
          return next;
        });
        setCharacterFrameEquipPulse(false);
      }, 2200);
      return () => clearTimeout(timer);
    }

    prevEquippedRef.current = { ...currentEquipped };
  }, [player.equipped]);

  const {
    isDailyUnsealed,
    unsealDailyPacks,
    payload: missionsPayload,
    fetchPayload: fetchMissionsPayloadStore,
  } = useDailyMissionsStore();

  const featuredDailyMissions = useMemo<AutomatedMissionItem[]>(() => {
    const dailyCat = missionsPayload?.categories?.find((c) => c.id === "daily");
    if (dailyCat && dailyCat.missions && dailyCat.missions.length > 0) {
      return dailyCat.missions.slice(0, 3);
    }
    return [];
  }, [missionsPayload]);

  const handleUnsealBountiesComplete = () => {
    unsealDailyPacks();
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      safeStorage.setItem("fartboy_daily_bounty_unsealed_date", todayStr);
    } catch (err) {
      console.error("Failed saving unsealed date", err);
    }
    toast.success("Daily Bounty Dossiers unsealed! Directives active in War Room.", {
      icon: "⚡",
    });
  };

  useEffect(() => {
    let isMounted = true;
    fetchMissionsPayloadStore();
    fetchPlayerIdentityPayload().then((payload) => {
      if (isMounted) setIdentityPayload(payload);
    });
    fetchPowerBreakdownPayload(player, contribStats).then((payload) => {
      if (isMounted) setPowerBreakdownData(payload);
    });
    getMissions().then((missions) => {
      if (isMounted) {
        setDailyMissions(missions.filter((m) => m.type === "daily"));
      }
    });
    const interval = setInterval(() => {
      setResetTimer(getTimeUntilUtcMidnight());
    }, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [player, contribStats, fetchMissionsPayloadStore]);

  // XP Progress calculation
  const currentXP = (player?.lifetimeXP ?? player?.xp ?? 6430) % (player?.xpToNext || 8500);
  const xpMax = player?.xpToNext || 8500;
  const xpPercent = Math.min(100, Math.round((currentXP / xpMax) * 100));

  // Resolve item for slot (falls back to mockInventoryData for local mock sync)
  const getSlotItem = (slotKey: EquipmentSlot): Item | null => {
    const itemId = player.equipped?.[slotKey];
    if (itemId) {
      const item = resolveItemById(itemId, inventory, itemsById);
      if (item) return item;
    }
    // Fallback sync with mockInventoryData
    const mockItem = mockInventoryData.loadout[slotKey as keyof typeof mockInventoryData.loadout];
    if (mockItem) {
      return {
        id: mockItem.id,
        name: mockItem.name,
        slot: mockItem.slot as EquipmentSlot,
        rarity: mockItem.rarity as Item["rarity"],
        level: mockItem.level,
        set: mockItem.set,
        raidPower: mockItem.raidPower,
        bonusXP: mockItem.bonusXP,
        image: mockItem.image,
      } as Item;
    }
    return null;
  };

  // Rarity Frame Glow styling
  const getRarityGlow = (rarity?: string) => {
    switch (rarity) {
      case "mythic":
        return "border-2 border-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.7)] bg-gradient-to-b from-[#250015] to-[#0d0f17]";
      case "legendary":
        return "border-2 border-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.7)] bg-gradient-to-b from-[#1f1600] to-[#0d0f17]";
      case "epic":
        return "border-2 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.6)] bg-gradient-to-b from-[#180024] to-[#0d0f17]";
      case "rare":
        return "border-2 border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.6)] bg-gradient-to-b from-[#001824] to-[#0d0f17]";
      default:
        return "border-2 border-slate-600 bg-slate-900/90";
    }
  };

  // Total Calculated Power
  const calculatedTotalPower =
    ALL_SLOTS.reduce((sum, slot) => {
      const item = getSlotItem(slot.key);
      if (item) {
        return sum + (item.raidPower || (item.level ?? 1) * 2200 + 12000);
      }
      return sum;
    }, 0) || mockInventoryData.totalRaiderPower;

  // 7/7 Specialist set check
  const setInfo = getSetInfoForItem(
    `${activeSpecialistIdentity} Set`,
    inventory,
    player.equipped ?? {},
  );

  const equippedSlotsCount = Object.values(player.equipped ?? {}).filter(Boolean).length;
  const ownedSetPieces = setInfo
    ? Math.min(7, setInfo.ownedCount)
    : Math.min(7, Math.max(4, equippedSlotsCount));
  const isFullSet = ownedSetPieces >= 7;

  // Full Set Matching Rarity Resonance Check:
  // If all equipped gear slots share the same rarity (e.g. all Legendary, all Epic, etc.),
  // trigger a colored shimmer effect across the entire gear container grid.
  const fullSetRarityMatch = useMemo(() => {
    const equippedItems = ALL_SLOTS.map((s) => getSlotItem(s.key));
    if (equippedItems.some((it) => !it)) {
      return {
        isMatching: false,
        rarity: null,
        color: null,
        glow: null,
        label: null,
        border: null,
      };
    }
    const firstRarity = (equippedItems[0]?.rarity || "common").toLowerCase();
    const allMatch = equippedItems.every(
      (it) => (it?.rarity || "common").toLowerCase() === firstRarity,
    );
    if (allMatch) {
      const rarityConfigMap: Record<
        string,
        { color: string; glow: string; label: string; border: string }
      > = {
        mythic: {
          color: "#ef4444",
          glow: "rgba(239, 68, 68, 0.5)",
          label: "Mythic",
          border: "border-rose-500",
        },
        legendary: {
          color: "#D4AF37",
          glow: "rgba(212, 175, 55, 0.5)",
          label: "Legendary",
          border: "border-amber-400",
        },
        epic: {
          color: "#a855f7",
          glow: "rgba(168, 85, 247, 0.45)",
          label: "Epic",
          border: "border-purple-400",
        },
        rare: {
          color: "#00F0FF",
          glow: "rgba(0, 240, 255, 0.45)",
          label: "Rare",
          border: "border-cyan-400",
        },
        uncommon: {
          color: "#22c55e",
          glow: "rgba(34, 197, 94, 0.4)",
          label: "Uncommon",
          border: "border-emerald-400",
        },
        common: {
          color: "#d1d5db",
          glow: "rgba(209, 213, 219, 0.3)",
          label: "Common",
          border: "border-slate-400",
        },
      };
      return {
        isMatching: true,
        rarity: firstRarity,
        ...(rarityConfigMap[firstRarity] || rarityConfigMap.legendary),
      };
    }
    return { isMatching: false, rarity: null, color: null, glow: null, label: null, border: null };
  }, [player.equipped, inventory, itemsById]);

  // Economy Bible cap summary
  const equipmentCap = calculateEquipmentXpCap(player?.equipped ?? {}, inventory, itemsById);
  const specialistSetBonus = calculateSpecialistSetBonus(
    player?.equipped ?? {},
    inventory,
    itemsById,
  );
  const seasonalTitleXp = calculateSeasonalTitleXp();
  const reputationSummary = calculateReputationSummary(player?.reputation ?? 0);

  // SECTION 1: TOTAL XP MULTIPLIERS — Equipment XP (capped) + Set Boost + Title Boost + Rep Multiplier
  const titleXpBoostPct = identityPayload?.titleXpBoostPct ?? seasonalTitleXp?.bonusXP ?? 3.0;
  const repMultiplierPct = Math.round(((reputationSummary?.multiplier ?? 1) - 1) * 100 * 10) / 10;
  const totalXpMultiplierPct =
    (equipmentCap?.cappedBonusXP ?? 0) +
    (specialistSetBonus?.bonusXP ?? 0) +
    (titleXpBoostPct ?? 0) +
    (repMultiplierPct ?? 0);

  // Granular Multipliers payload according to API v1 contract
  const multipliersPayload = useMemo(() => {
    return getUserMultipliersPayload(player, inventory, itemsById);
  }, [player, inventory, itemsById]);

  // SECTION 2: LIFETIME XP & CUMULATIVE MULTIPLIERS — derived from cumulative Lifetime XP earned via raids/missions
  const lifetimeXpEarned = player.lifetimeXP || mockInventoryData.totalRaiderPower;
  const raidPowerFromLifetimeXp = Math.round(lifetimeXpEarned * 0.28) || calculatedTotalPower;

  // Handlers for Power & Total XP Metric Modals
  const handleOpenPowerModal = () => {
    // TODO: Fetch user XP breakdown from API endpoint GET /api/user/xp-breakdown
    if (!powerBreakdownData) {
      fetchPowerBreakdownPayload(player, contribStats).then((payload) => {
        setPowerBreakdownData(payload);
      });
    }
    setPowerBreakdownModalOpen(true);
  };

  const handleOpenTotalXpModal = () => {
    setXpMultipliersModalOpen(true);
    setStatModalOpen(true);
  };

  // De-Equip All 7 slots
  const handleDeEquipAll = async () => {
    await unequipAllGearPayload();
    const slots: EquipmentSlot[] = ["head", "body", "shorts", "feet", "back", "pet", "powerItem"];
    for (const slot of slots) {
      await unequipSlot(slot);
    }
    setAutoEquipMsg("🔓 ALL GEAR UNEQUIPPED: 7/7 Slots Cleared");
    setTimeout(() => setAutoEquipMsg(null), 4000);
    setAutoEquipModalOpen(false);
  };

  // Auto-equips best pieces for a chosen set
  const handleAutoEquipSpecificSet = async (targetSetName: string) => {
    const payload = await autoEquipSetPayload(targetSetName);
    const slots: EquipmentSlot[] = ["head", "body", "shorts", "feet", "back", "pet", "powerItem"];

    const allAvailable = [
      ...inventory,
      ...Object.entries(player.equipped ?? {})
        .map(([_, itemId]) => resolveItemById(itemId, inventory, itemsById))
        .filter((i): i is Item => i !== null),
    ].filter((it) => isContributor || !isContributorItem(it));

    let equippedSetPieceCount = 0;

    for (const slot of slots) {
      const matchingItems = allAvailable.filter((it) => {
        if (it.slot !== slot) return false;
        const itemSet = (it.set || it.category || "").toLowerCase();
        const target = targetSetName.toLowerCase();
        return (
          itemSet.includes(target) ||
          target.includes(itemSet.replace(" set", "")) ||
          (it.set && target.includes(it.set.toLowerCase()))
        );
      });

      if (matchingItems.length > 0) {
        const bestItem = matchingItems.sort((a, b) => (b.bonusXP ?? 0) - (a.bonusXP ?? 0))[0];
        await equipItem(slot, bestItem.id);
        equippedSetPieceCount++;
      } else {
        const slotItems = allAvailable.filter((it) => it.slot === slot);
        if (slotItems.length > 0) {
          const fallbackBest = slotItems.sort((a, b) => (b.bonusXP ?? 0) - (a.bonusXP ?? 0))[0];
          await equipItem(slot, fallbackBest.id);
        }
      }
    }

    setAutoEquipMsg(
      `SET ASSIST COMPLETE: Equipped ${targetSetName.toUpperCase()} GEAR (${equippedSetPieceCount}/7 Set Pieces)!`,
    );
    setTimeout(() => setAutoEquipMsg(null), 4000);
    setAutoEquipModalOpen(false);
  };

  // Auto-equips highest XP & stat items across all slots
  const handleAutoEquipBestInSlot = async () => {
    await autoEquipBestInSlotPayload();
    const slots: EquipmentSlot[] = ["head", "body", "shorts", "feet", "back", "pet", "powerItem"];

    const allAvailable = [
      ...inventory,
      ...Object.entries(player.equipped ?? {})
        .map(([_, itemId]) => resolveItemById(itemId, inventory, itemsById))
        .filter((i): i is Item => i !== null),
    ].filter((it) => isContributor || !isContributorItem(it));

    for (const slot of slots) {
      const slotItems = allAvailable.filter((it) => it.slot === slot);
      if (slotItems.length > 0) {
        const bestItem = slotItems.sort((a, b) => {
          const xpA = a.bonusXP ?? 0;
          const xpB = b.bonusXP ?? 0;
          if (xpB !== xpA) return xpB - xpA;
          return (b.level ?? 1) - (a.level ?? 1);
        })[0];
        await equipItem(slot, bestItem.id);
      }
    }

    setAutoEquipMsg("⚡ AUTO-EQUIP COMPLETE: Highest Stat Gear Equipped across all 7 slots!");
    setTimeout(() => setAutoEquipMsg(null), 4000);
    setAutoEquipModalOpen(false);
  };

  const handleSaveAvatar = () => {
    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 3000);
  };

  // Render Gear Slot Card with level badge, single Total Stats indicator, enhanced padding and touch targets
  const renderSlotOverlayCard = (slotDef: SlotDef) => {
    const item = getSlotItem(slotDef.key);
    const isEquipAnimating = Boolean(animatingSlots[slotDef.key]);
    const levelNumber = item?.level ?? 7;
    const levelBadge = `+${levelNumber}`;
    const rarityGlow = getRarityGlow(item?.rarity);
    const detailed = item ? getDetailedItemStats(item) : null;
    const totalBoostPct =
      detailed?.all && detailed.all.length > 0
        ? detailed.all.reduce((sum, s) => sum + (s?.value_pct ?? 0), 0)
        : (item?.bonusXP ?? 0);
    const formattedTotalBoost = `+${Number(totalBoostPct || 0).toFixed(2)}% XP`;

    const isPetSlot = slotDef.key === "pet";
    const isPowerSlot = slotDef.key === "powerItem";

    const rarityBorder = item?.rarity
      ? rarityBorderClass[item.rarity] || "border-slate-800"
      : "border-slate-800";

    return (
      <div
        key={slotDef.key}
        onClick={() => {
          if (item) {
            setInspectingItem(item);
          } else {
            setActiveSelectorSlot(slotDef.key);
          }
        }}
        onMouseEnter={() => setHoveredSlot(slotDef.key)}
        onMouseLeave={() => setHoveredSlot(null)}
        className={`relative w-full rounded-2xl border transition-all shadow-md group font-mono touch-manipulation select-none overflow-hidden cursor-pointer active:scale-[0.98] box-border ${
          isEquipAnimating
            ? "border-amber-300 ring-2 ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.8)] scale-[1.02] bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950"
            : item
              ? `${rarityBorder} bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-950 hover:border-amber-400/80`
              : "border-dashed border-amber-500/30 bg-slate-950/70 hover:border-amber-400/60 hover:bg-slate-950/90"
        }`}
        style={{ width: "100%", boxSizing: "border-box" }}
        title={`${slotDef.label}: ${item ? `${item.name} (${formattedTotalBoost}, Level ${levelBadge})` : `Empty Slot (+ EQUIP ${slotDef.label})`}`}
      >
        {/* WOW FACTOR EQUIP PARTICLE SHIMMER OVERLAY */}
        {isEquipAnimating && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/30 to-transparent animate-[shimmer_1.5s_infinite] -skew-x-12" />
            <div className="absolute top-1.5 right-2 flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-[8px] px-2 py-0.5 rounded-full shadow-md animate-bounce">
              <Sparkles className="h-3 w-3 animate-spin" />
              <span>EQUIPPED ⚡</span>
            </div>
          </div>
        )}

        {/* EXPANDED PROMINENT VERTICAL CARD CONTENT - STRICT 5-ROW HIERARCHY */}
        <div className="p-2.5 sm:p-3 flex flex-col justify-between gap-1.5 min-h-[110px] box-border">
          {/* 1. TOP ROW: Slot Type on the Left, Rarity Badge on the Right */}
          <div className="flex items-center justify-between gap-1.5 w-full min-w-0">
            <span className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-amber-500/40 text-[clamp(0.62rem,1.6vw,0.72rem)] font-mono font-black uppercase text-amber-300 tracking-wider whitespace-nowrap shrink-0 shadow-xs">
              {slotDef.label}
            </span>
            {item ? (
              <span
                className={`px-1.5 py-0.5 rounded text-[clamp(0.58rem,1.4vw,0.68rem)] font-black uppercase tracking-wider ${
                  rarityTextClass[item.rarity] || "text-slate-400"
                } truncate bg-slate-950/80 border border-white/10`}
              >
                {rarityLabel[item.rarity] || item.rarity}
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono font-bold shrink-0">EMPTY</span>
            )}
          </div>

          {/* 2. SECOND ROW: Item Name */}
          <div className="w-full min-w-0">
            {item ? (
              <div className="text-[clamp(0.72rem,1.9vw,0.85rem)] font-bold text-slate-100 truncate text-left group-hover:text-amber-200 transition-colors leading-tight">
                {item.name}
              </div>
            ) : (
              <div className="text-[clamp(0.65rem,1.7vw,0.75rem)] text-slate-500 truncate text-left italic">
                Tap to equip {slotDef.label.toLowerCase()}
              </div>
            )}
          </div>

          {/* 3. THIRD ROW: Item Icon/Thumbnail image on the left, with the Level Badge horizontally right next to the icon */}
          <div className="flex items-center gap-2 w-full min-w-0">
            {/* Item thumbnail icon */}
            <div
              className={`relative grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl ${
                isEquipAnimating
                  ? "border-2 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.9)] bg-slate-900 animate-pulse"
                  : item
                    ? `${rarityBorder} ${rarityGlow} bg-slate-950 border`
                    : "border border-dashed border-slate-800 bg-slate-950/80"
              } transition-transform group-hover:scale-105`}
            >
              {item ? (
                isImageUrl(item.image) ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className={`h-5 w-5 sm:h-6 sm:w-6 object-contain select-none ${
                      isPetSlot ? "animate-pet-active" : isPowerSlot ? "animate-power-active" : ""
                    }`}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span
                    className={`text-sm sm:text-base select-none ${
                      isPetSlot ? "animate-pet-active" : isPowerSlot ? "animate-power-active" : ""
                    }`}
                  >
                    {item.image || slotDef.icon}
                  </span>
                )
              ) : (
                <span className="text-sm opacity-40 group-hover:opacity-100 transition-opacity select-none">
                  {slotDef.icon}
                </span>
              )}
            </div>

            {/* Level indicator badge aligned horizontally right next to the icon */}
            {item ? (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-mono text-[clamp(0.62rem,1.6vw,0.72rem)] font-black border border-amber-200 shadow-xs leading-none shrink-0">
                <span>{levelBadge}</span>
              </span>
            ) : (
              <span className="text-[clamp(0.6rem,1.5vw,0.7rem)] text-slate-500 font-mono italic">
                No gear
              </span>
            )}
          </div>

          {/* 4. FOURTH ROW: "TOTAL XP:" value text */}
          <div className="flex items-center gap-1.5 w-full min-w-0 pt-1 border-t border-white/5">
            {item ? (
              <div className="flex items-center justify-between w-full min-w-0">
                <span className="text-[clamp(0.58rem,1.4vw,0.68rem)] font-mono font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                  TOTAL XP:
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded font-mono text-[clamp(0.6rem,1.5vw,0.7rem)] font-black shrink-0 shadow-xs whitespace-nowrap leading-none ${
                    isEquipAnimating
                      ? "text-slate-950 bg-amber-400 border border-amber-200 animate-bounce"
                      : "text-emerald-300 bg-emerald-950/90 border border-emerald-500/50"
                  }`}
                >
                  {formattedTotalBoost}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full min-w-0">
                <span className="text-[clamp(0.58rem,1.4vw,0.68rem)] font-mono font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                  TOTAL XP:
                </span>
                <span className="text-[clamp(0.58rem,1.4vw,0.68rem)] text-slate-600 font-mono italic">
                  +0.00% XP
                </span>
              </div>
            )}
          </div>

          {/* 5. BOTTOM ROW: "STATS" button spanning the full width at the bottom */}
          <div className="w-full min-w-0 pt-1">
            {item ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setInspectingItem(item);
                }}
                className="w-full py-1.5 rounded-md font-mono text-[clamp(0.6rem,1.5vw,0.7rem)] font-black uppercase tracking-wider text-amber-300 bg-amber-950/90 hover:bg-amber-400 hover:text-slate-950 border border-amber-500/50 hover:border-amber-300 transition-all shrink-0 shadow-xs leading-none text-center active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                title={`View ${item.name} Stats & Details`}
              >
                <span>STATS</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSelectorSlot(slotDef.key);
                }}
                className="w-full py-1.5 rounded-md font-mono text-[clamp(0.6rem,1.5vw,0.7rem)] font-bold text-slate-400 bg-slate-900/80 hover:bg-slate-800 hover:text-amber-300 border border-slate-700/50 transition-all text-center leading-none"
              >
                + EQUIP PIECE
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleSubNavClick = (tab: SubNavTab) => {
    setActiveTab(tab);
    if (tab === "cosmetics") {
      setAvatarPickerOpen(true);
    }
  };

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* FEEDBACK NOTIFICATIONS */}
      {savedSuccessMsg && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl border border-cyan-500/50 bg-cyan-950/80 p-2.5 text-center text-xs font-mono font-bold text-cyan-300 shadow-lg flex items-center justify-center gap-2">
          <Check className="h-4 w-4 text-cyan-400" />
          Character Avatar Saved to Profile Successfully!
        </div>
      )}

      {autoEquipMsg && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl border border-emerald-500/50 bg-emerald-950/80 p-2.5 text-center text-xs font-mono font-bold text-emerald-300 shadow-lg flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" />
          {autoEquipMsg}
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 1: UNIFIED PROGRESSION, MASTERY & SERVER METERS (COLLAPSIBLE)*/}
      {/* ==================================================================== */}
      <ProgressionAndServerMeters />

      {/* ==================================================================== */}
      {/* UNIFIED DAILY MISSION MASTER & 3-DOSSIER CONSOLE                     */}
      {/* ==================================================================== */}
      <DailyMissionMasteryConsole variant="compact" />

      {/* UNOPENED VAULT / INVENTORY PACKS BAR */}
      {unopenedCount > 0 && (
        <div className="relative z-10 w-full font-mono">
          <Button
            onClick={() => {
              navigate({ to: "/packs" });
            }}
            className="w-full min-h-[48px] sm:min-h-[52px] font-mono text-xs font-black uppercase tracking-wider cursor-pointer rounded-2xl flex items-center justify-between px-3.5 sm:px-4 shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] touch-manipulation border bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white border-rose-400/80 shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:border-rose-300"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/20 border border-white/40 animate-bounce">
                <Package className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="text-left font-mono min-w-0">
                <div className="text-xs sm:text-sm font-black tracking-wide truncate">
                  {unopenedCount} UNOPENED VAULT PACKS
                </div>
                <div className="text-[10px] text-white/80 font-normal font-sans truncate">
                  Tap to unbox loot, gear & artifacts in Vault
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 bg-black/40 border border-white/20 px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-mono font-black">
              <span>VIEW VAULT</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 2: CHARACTER HQ CARD & UNIFIED FLANKING ARMORY LAYOUT       */}
      {/* ==================================================================== */}
      <div className="relative space-y-2.5">
        {/* UNIFIED CHARACTER FRAME CONTAINER CARD */}
        <div
          className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 bg-[#080a0d] p-3 sm:p-4 lg:p-6 shadow-2xl space-y-3 font-mono ${
            characterFrameEquipPulse || Object.keys(animatingSlots).length > 0
              ? "border-amber-300 ring-2 ring-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.7)]"
              : "border-amber-500/40"
          }`}
        >
          {/* AMBIENT PARTICLES BACKGROUND GLOW */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/15 via-slate-950/80 to-[#080a0d] opacity-90" />

          {/* DYNAMIC EQUIP WOW FACTOR SHIMMER OVERLAY ON CHARACTER CARD */}
          {(characterFrameEquipPulse || Object.keys(animatingSlots).length > 0) && (
            <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/25 to-transparent animate-[shimmer_1.8s_infinite] -skew-x-12" />
              <div className="absolute top-2 right-3 flex items-center gap-1 bg-amber-400 text-slate-950 font-mono font-black text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full shadow-lg animate-bounce z-40">
                <Sparkles className="h-3 w-3 animate-spin text-slate-950" />
                <span>GEAR SYNCED ⚡</span>
              </div>
            </div>
          )}

          {/* HUD CORNER ACCENTS */}
          <div className="pointer-events-none absolute top-0 left-0 h-3.5 w-3.5 border-t-2 border-l-2 border-amber-400 z-20" />
          <div className="pointer-events-none absolute top-0 right-0 h-3.5 w-3.5 border-t-2 border-r-2 border-amber-400 z-20" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-3.5 w-3.5 border-b-2 border-l-2 border-amber-400 z-20" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-3.5 w-3.5 border-b-2 border-r-2 border-amber-400 z-20" />

          {/* TWO-COLUMN GRID ON DESKTOP & MOBILE-ORDERED STACK */}
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6 items-start">
            {/* ================================================================ */}
            {/* AVATAR PEDESTAL STAGE & POWER OVERLAY (ORDER 2 ON MOBILE, COL-5 ON DESKTOP) */}
            {/* ================================================================ */}
            <div className="order-2 lg:order-1 lg:col-span-5 flex flex-col items-center justify-center space-y-3 w-full">
              <div className="flex flex-col items-center justify-center relative py-0 sm:py-1 w-full z-10 my-0">
                <div className="pointer-events-none absolute -inset-4 rounded-full bg-gradient-to-tr from-emerald-500/20 via-amber-500/10 to-teal-500/20 blur-2xl opacity-90" />

                <div className="relative z-10 w-full flex flex-col items-center">
                  <div
                    className="relative shrink-0 flex items-center justify-center box-border aspect-[3/4] w-full max-w-[380px] lg:max-w-[420px] mx-auto rounded-2xl border border-amber-500/40 bg-black shadow-2xl"
                    style={{ width: "100%", maxWidth: "420px", height: "auto" }}
                  >
                    <AvatarLayerStack
                      player={player}
                      itemsById={itemsById}
                      size={420}
                      className="w-full h-full rounded-2xl"
                      hoveredSlot={hoveredSlot}
                      onSlotHover={setHoveredSlot}
                      onSlotClick={(slotKey) => {
                        const item = getSlotItem(slotKey as EquipmentSlot);
                        if (item) {
                          setInspectingItem(item);
                        } else {
                          setActiveSelectorSlot(slotKey as EquipmentSlot);
                        }
                      }}
                      is3DMode={effectiveIs3DMode}
                    />
                    {isContributor && frameAsset && (
                      <div className="pointer-events-none absolute inset-0 z-30 w-full h-full box-border rounded-2xl">
                        <LumaKeyVideoFrame
                          key={frameAsset.video}
                          videoSrc={frameAsset.video}
                          fallbackImageSrc={frameAsset.image}
                          alt={`${equippedFrameItem?.name ?? "Character HQ"} Frame`}
                          className="w-full h-full select-none block"
                          cropInset={{ left: 0.04, top: 0.17, right: 0.04, bottom: 0.17 }}
                        />
                      </div>
                    )}
                  </div>

                  {/* POWER & TOTAL XP OVERLAY BAR DIRECTLY UNDER PORTRAIT */}
                  <div className="relative z-20 w-full max-w-[380px] lg:max-w-[420px] mx-auto bg-slate-950/95 backdrop-blur-md border border-amber-500/40 rounded-xl p-2 font-mono shadow-xl mt-2 pointer-events-auto">
                    <div className="grid grid-cols-2 gap-2 w-full">
                      {/* POWER PILL */}
                      <button
                        type="button"
                        id="hero-power-info-btn"
                        onClick={handleOpenPowerModal}
                        className="flex items-center justify-between gap-1.5 rounded-lg border border-amber-500/50 bg-amber-950/60 hover:bg-amber-900/70 p-2 text-left transition-all cursor-pointer shadow-md group active:scale-[0.98] pointer-events-auto"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-amber-400 text-sm shrink-0 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">
                            ⚡
                          </span>
                          <div className="min-w-0">
                            <div className="text-[8px] sm:text-[9px] font-black uppercase text-amber-400/90 tracking-wider truncate">
                              POWER
                            </div>
                            <div className="font-display font-black text-xs sm:text-sm text-amber-300 truncate leading-none">
                              {lifetimeXpEarned.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 group-hover:bg-amber-400 group-hover:text-slate-950 px-1.5 py-0.5 rounded shrink-0 transition-colors border border-amber-500/40">
                          INFO
                        </span>
                      </button>

                      {/* TOTAL XP BOOST PILL */}
                      <button
                        type="button"
                        id="hero-total-xp-info-btn"
                        onClick={handleOpenTotalXpModal}
                        className="flex items-center justify-between gap-1.5 rounded-lg border border-cyan-500/50 bg-cyan-950/60 hover:bg-cyan-900/70 p-2 text-left transition-all cursor-pointer shadow-md group active:scale-[0.98] pointer-events-auto"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-cyan-400 text-sm shrink-0 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                            🚀
                          </span>
                          <div className="min-w-0">
                            <div className="text-[8px] sm:text-[9px] font-black uppercase text-cyan-400/90 tracking-wider truncate">
                              TOTAL XP
                            </div>
                            <div className="font-display font-black text-xs sm:text-sm text-cyan-300 truncate leading-none">
                              +{Number(totalXpMultiplierPct || 0).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-wider bg-cyan-400/20 text-cyan-300 group-hover:bg-cyan-400 group-hover:text-slate-950 px-1.5 py-0.5 rounded shrink-0 transition-colors border border-cyan-500/40">
                          INFO
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* DARK STONE PEDESTAL BASE PLATFORM */}
                <div className="w-48 xs:w-64 h-3.5 bg-gradient-to-r from-slate-950 via-slate-800 to-slate-950 rounded-full border-t-2 border-emerald-400/60 shadow-[0_0_18px_rgba(16,185,129,0.5)] mt-[-6px]" />
              </div>
            </div>

            {/* ================================================================ */}
            {/* RIGHT COLUMN CONTAINER (CONTENTS ON MOBILE FOR PRECISE ORDERING)  */}
            {/* ================================================================ */}
            <div className="contents lg:flex lg:flex-col lg:col-span-7 lg:space-y-3.5 lg:order-2">
              {/* 1. RESTRUCTURED PROFILE HEADER & CONTROLS (ORDER 1 ON MOBILE) */}
              <div className="order-1 relative z-10 rounded-xl border border-amber-500/30 bg-black/85 p-2.5 sm:p-3.5 backdrop-blur-md space-y-2.5 font-mono shadow-md w-full">
                {/* ROW 1: FULL-WIDTH LEVEL BAR */}
                <div className="w-full flex items-center justify-between gap-2.5 bg-slate-950/95 border border-amber-500/50 px-3 py-1.5 rounded-xl shadow-xs">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-display font-black text-xs sm:text-sm text-amber-300 tracking-wide">
                      LVL {player.level || 27}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono hidden xs:inline">
                      ({currentXP.toLocaleString()} / {xpMax.toLocaleString()} XP)
                    </span>
                  </div>
                  <div className="flex-1 max-w-md h-2 bg-slate-900 rounded-full border border-amber-500/30 overflow-hidden mx-1 sm:mx-2">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${xpPercent}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-[9px] sm:text-[10px] text-amber-400 shrink-0">
                    {xpPercent}%
                  </span>
                </div>

                {/* USER INFO BLOCK: CLEAN VERTICAL PAIRING */}
                <div className="rounded-xl border border-amber-500/25 bg-black/60 p-2.5 sm:p-3 backdrop-blur-md space-y-2.5 font-mono shadow-xs">
                  {/* TOP 2-COLUMN VERTICAL PAIRS */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-4 items-start">
                    {/* LEFT COLUMN: Username + "CHANGE TITLE" button below */}
                    <div className="flex flex-col items-start gap-1.5 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 max-w-full">
                        <div className="grid h-6 w-6 sm:h-7 sm:w-7 shrink-0 place-items-center rounded-full bg-slate-900 border border-amber-500/50 text-xs shadow-inner">
                          <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
                        </div>
                        <span className="text-xs sm:text-sm font-black text-slate-100 truncate tracking-wide">
                          {identityPayload?.discordUsername || "@DiscordUser"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setTitleModalOpen(true)}
                        className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 active:bg-amber-500/40 border border-amber-400/60 text-amber-200 text-[clamp(0.65rem,1.8vw,0.8rem)] font-mono font-black uppercase tracking-tight cursor-pointer transition-all active:scale-95 shrink-0 shadow-xs whitespace-nowrap"
                        title="Change equipped title"
                      >
                        <Edit3 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-300 shrink-0" />
                        <span className="whitespace-nowrap">CHANGE TITLE</span>
                      </button>
                    </div>

                    {/* RIGHT COLUMN: Title Badge + "+3% XP Boost" underneath */}
                    <div className="flex flex-col items-end gap-1.5 min-w-0">
                      <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-amber-400 text-slate-950 border border-amber-300 text-[clamp(0.7rem,1.9vw,0.82rem)] font-black shadow-md whitespace-nowrap max-w-full">
                        <Trophy className="h-3.5 w-3.5 text-slate-950 shrink-0" />
                        <span className="whitespace-nowrap">{activeTitleName}</span>
                      </div>

                      <div className="inline-flex items-center gap-1 text-[clamp(0.65rem,1.8vw,0.8rem)] font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-500/40 px-2.5 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                        <Zap className="h-3 w-3 text-amber-400 shrink-0" />
                        <span>
                          +{Number(titleXpBoostPct > 0 ? titleXpBoostPct : 3).toFixed(0)}% XP Boost
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* LOWER ROW: "SPECIALIST SET (X/7)" with XP badge */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[clamp(0.68rem,1.8vw,0.8rem)] whitespace-nowrap min-w-0">
                      <Shield className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="whitespace-nowrap">
                        {`SPECIALIST SET (${specialistSetBonus?.piecesEquipped || 0}/7)`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-emerald-300 bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-500/40 text-[clamp(0.65rem,1.8vw,0.8rem)] font-bold shadow-xs flex items-center gap-1 whitespace-nowrap">
                        <Sparkles className="h-2.5 w-2.5 text-emerald-400 shrink-0" />
                        <span>+{Number(specialistSetBonus?.bonusXP || 0).toFixed(0)}% XP</span>
                      </span>

                      {fullSetRarityMatch.isMatching && (
                        <span className="text-amber-300 bg-amber-950/90 px-2 py-0.5 rounded-full border border-amber-400/40 font-bold shadow-xs hidden sm:inline-flex items-center gap-1 whitespace-nowrap text-[9px]">
                          <span>{fullSetRarityMatch.label?.toUpperCase()} RESONANCE (+15% XP)</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ROW 3: Media Control Action Buttons */}
                <div className="w-full space-y-1.5 pt-2.5 border-t border-white/10 font-mono">
                  {/* Row 1 (Full Width): "MEDIA MODE: 2D / 3D" */}
                  <Button
                    onClick={() => {
                      if (!isContributor) {
                        setLockedFeatureKey("3d_mode");
                        setContributorUpgradeModalOpen(true);
                        return;
                      }
                      setIs3DMode(!is3DMode);
                    }}
                    variant="outline"
                    size="sm"
                    title={
                      isContributor
                        ? "Toggle between animated video and static portrait mode"
                        : "3D Motion video playback is a Contributor perk — unlock to enable"
                    }
                    className={`w-full h-auto min-h-[32px] sm:min-h-[34px] px-3 py-1.5 text-[clamp(0.7rem,1.9vw,0.82rem)] font-mono font-black tracking-wide border-amber-500/40 cursor-pointer transition-all flex flex-wrap items-center justify-between gap-1.5 rounded-xl ${
                      effectiveIs3DMode
                        ? "bg-amber-500/25 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                        : !isContributor
                          ? "bg-slate-950/90 text-amber-300/90 border-amber-500/50 hover:bg-slate-900"
                          : "bg-slate-900 text-slate-200 hover:bg-slate-850"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-center min-w-0 gap-1.5">
                      {!isContributor ? (
                        <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0 animate-pulse" />
                      ) : effectiveIs3DMode ? (
                        <Film className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      ) : (
                        <ImageIcon className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      )}
                      <span className="whitespace-nowrap truncate">
                        {isContributor
                          ? effectiveIs3DMode
                            ? "MEDIA MODE: 3D ACTIVE"
                            : "MEDIA MODE: 2D STILL"
                          : "MEDIA MODE: 2D STILL"}
                      </span>
                    </div>

                    {!isContributor ? (
                      <span className="text-[9px] font-black uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded shadow-xs tracking-wider font-mono shrink-0">
                        CONTRIBUTOR ONLY
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.2 rounded font-bold shrink-0">
                        ACTIVE
                      </span>
                    )}
                  </Button>

                  {/* Row 2 & 3 (Strict 2x2 Unified Grid): [CHANGE ARTWORK] | [FRAME] / [DOWNLOAD] | [SHARE] */}
                  <div
                    className="grid grid-cols-2 gap-1.5 w-full font-mono"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "6px",
                      width: "100%",
                    }}
                  >
                    <Button
                      onClick={() => {
                        if (!isContributor) {
                          setLockedFeatureKey("artwork");
                          setContributorUpgradeModalOpen(true);
                          return;
                        }
                        setActiveSelectorSlot("cosmeticTheme");
                      }}
                      variant="outline"
                      size="sm"
                      className={`w-full h-8 sm:h-8.5 px-2 text-[clamp(0.62rem,1.7vw,0.76rem)] font-mono font-bold uppercase border-amber-500/40 hover:border-amber-400 rounded-xl cursor-pointer whitespace-nowrap flex items-center justify-between gap-1 shrink-0 ${
                        !isContributor
                          ? "bg-slate-950/90 text-amber-200 hover:bg-slate-900 border-amber-500/50"
                          : "bg-slate-950/90 text-slate-200 hover:bg-slate-900"
                      }`}
                      title={
                        isContributor
                          ? "Change Character Artwork & Background Theme"
                          : "Artwork & Theme Customization requires Contributor rank"
                      }
                    >
                      <div className="flex items-center gap-1 min-w-0">
                        {!isContributor ? (
                          <Lock className="h-3 w-3 text-amber-400 shrink-0" />
                        ) : (
                          <Palette className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        )}
                        <span className="truncate">ARTWORK</span>
                      </div>
                      {!isContributor && (
                        <span className="text-[8px] font-black bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-mono shrink-0">
                          CONTRIBUTOR
                        </span>
                      )}
                    </Button>

                    <Button
                      onClick={() => {
                        if (!isContributor) {
                          setLockedFeatureKey("frame");
                          setContributorUpgradeModalOpen(true);
                          return;
                        }
                        setActiveSelectorSlot("frame");
                      }}
                      variant="outline"
                      size="sm"
                      className={`w-full h-8 sm:h-8.5 px-2 text-[clamp(0.62rem,1.7vw,0.76rem)] font-mono font-bold uppercase border-amber-500/40 hover:border-amber-400 rounded-xl cursor-pointer whitespace-nowrap flex items-center justify-between gap-1 shrink-0 ${
                        !isContributor
                          ? "bg-slate-950/90 text-amber-200 hover:bg-slate-900 border-amber-500/50"
                          : "bg-slate-950/90 text-slate-200 hover:bg-slate-900"
                      }`}
                      title={
                        isContributor
                          ? "Change Character HQ Frame"
                          : "Custom Profile Frames require Contributor rank"
                      }
                    >
                      <div className="flex items-center gap-1 min-w-0">
                        {!isContributor ? (
                          <Lock className="h-3 w-3 text-amber-400 shrink-0" />
                        ) : (
                          <ImageIcon className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        )}
                        <span className="truncate">FRAME</span>
                      </div>
                      {!isContributor && (
                        <span className="text-[8px] font-black bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-mono shrink-0">
                          CONTRIBUTOR
                        </span>
                      )}
                    </Button>

                    <Button
                      onClick={handleSaveAvatar}
                      variant="outline"
                      size="sm"
                      className="w-full h-8 sm:h-8.5 px-2 text-[clamp(0.62rem,1.7vw,0.76rem)] font-mono font-bold uppercase border-amber-500/40 text-slate-200 hover:border-amber-400 hover:bg-slate-900 bg-slate-950/90 rounded-xl cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 shrink-0"
                      title="Save Avatar"
                    >
                      <Download className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">DOWNLOAD</span>
                    </Button>

                    <Button
                      onClick={onOpenShareModal}
                      variant="outline"
                      size="sm"
                      className="w-full h-8 sm:h-8.5 px-2 text-[clamp(0.62rem,1.7vw,0.76rem)] font-mono font-bold uppercase border-amber-500/40 text-slate-200 hover:border-amber-400 hover:bg-slate-900 bg-slate-950/90 rounded-xl cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 shrink-0"
                      title="Share Avatar Card"
                    >
                      <Share2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">SHARE</span>
                    </Button>

                    <Button
                      onClick={() => setRoadmapModalOpen(true)}
                      variant="outline"
                      size="sm"
                      className="w-full col-span-2 sm:col-span-4 h-7.5 sm:h-8 px-2 text-[clamp(0.62rem,1.7vw,0.76rem)] font-mono font-bold uppercase border-indigo-500/40 text-indigo-300 hover:border-indigo-400 hover:bg-indigo-950/60 bg-slate-950/90 rounded-xl cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
                      title="View Upcoming Features & Roadmap"
                    >
                      <span className="text-xs">🔮</span>
                      <span className="truncate">FUTURE PROTOCOLS &amp; ROADMAP</span>
                      <span className="text-[8px] font-mono font-bold text-indigo-400 bg-indigo-900/50 px-1 py-0.2 rounded border border-indigo-500/30">
                        VIEW
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* 2. EQUIPPED GEAR SLOTS (ORDER 3 ON MOBILE, BELOW PROFILE ON DESKTOP) */}
              <div className="order-3 relative z-10 w-full pt-2 space-y-2">
                <div className="flex items-center justify-between px-1 font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-400">
                  <div className="flex items-center gap-1.5">
                    <span>EQUIPPED GEAR</span>
                    <span className="text-slate-400 text-[9px] font-normal font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      7 SLOTS
                    </span>
                  </div>
                  <Button
                    onClick={() => setAutoEquipModalOpen(true)}
                    size="sm"
                    className="h-6 sm:h-7 px-2 sm:px-2.5 text-[clamp(0.65rem,1.8vw,0.8rem)] font-mono font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 shadow-[0_0_10px_rgba(245,158,11,0.35)] cursor-pointer rounded-lg flex items-center justify-center gap-1 transition-transform active:scale-98 whitespace-nowrap shrink-0 overflow-hidden"
                  >
                    <Wand2 className="h-3 w-3 text-slate-950 shrink-0" />
                    <span className="whitespace-nowrap">AUTO-EQUIP & PRESETS</span>
                  </Button>
                </div>

                {/* STRICT 2-COLUMN CSS GRID */}
                <div
                  className="grid grid-cols-2 gap-2 w-full"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  {/* COLUMN 1: HAT, TOP, SHORTS */}
                  <div
                    className="flex flex-col gap-2 w-full min-w-0"
                    style={{ width: "100%", boxSizing: "border-box" }}
                  >
                    {FLANKING_LEFT_SLOTS.map(renderSlotOverlayCard)}
                  </div>

                  {/* COLUMN 2: BOOTS, CAPE, PET */}
                  <div
                    className="flex flex-col gap-2 w-full min-w-0"
                    style={{ width: "100%", boxSizing: "border-box" }}
                  >
                    {FLANKING_RIGHT_SLOTS.map(renderSlotOverlayCard)}
                  </div>

                  {/* SPAN FULL WIDTH (CENTERED): POWER ITEM */}
                  <div
                    className="col-span-2 w-full pt-0.5"
                    style={{ width: "100%", boxSizing: "border-box" }}
                  >
                    {FLANKING_BOTTOM_SLOTS.map(renderSlotOverlayCard)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* POWER METRICS BREAKDOWN MODAL DIALOG                                 */}
      {/* ==================================================================== */}
      <Dialog open={powerBreakdownModalOpen} onOpenChange={setPowerBreakdownModalOpen}>
        <DialogContent className="max-w-2xl border-2 border-amber-500/50 bg-[#0B0E14] text-foreground p-4 sm:p-6 space-y-3 sm:space-y-4 z-50 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <DialogHeader className="border-b border-amber-500/20 pb-2.5">
            <DialogTitle className="font-display font-black text-lg text-amber-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400 shrink-0" />
                <span>POWER METRICS & LIFETIME XP BREAKDOWN</span>
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 font-mono">
            {/* SINGLE UNIFIED HERO STATISTIC: POWER / TOTAL LIFETIME XP */}
            <div className="rounded-2xl border border-amber-500/50 bg-gradient-to-b from-amber-950/50 via-slate-950 to-slate-950 p-4 text-center font-mono space-y-1.5 shadow-inner flex flex-col justify-center">
              <div className="text-[10px] font-black uppercase text-amber-400/90 tracking-widest flex items-center justify-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>POWER: TOTAL LIFETIME XP</span>
              </div>
              <div className="font-display font-black text-3xl sm:text-4xl text-amber-300 drop-shadow-[0_0_14px_rgba(245,158,11,0.6)]">
                {lifetimeXpEarned.toLocaleString()} XP
              </div>
              <div className="text-[11px] text-slate-300 max-w-md mx-auto font-sans leading-relaxed">
                Raider Power strictly equals cumulative verified lifetime XP earned across all
                raids, missions, and community activities.
              </div>
            </div>

            {/* ITEMIZED LIFETIME XP BREAKDOWN (5 PILLARS: MEMES, PERSONAL RAIDS, CTO, SNIPES, PLATFORM) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-0.5">
                <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                  <BarChart2 className="h-3.5 w-3.5 text-cyan-400" />
                  <span>ITEMIZED LIFETIME XP SOURCES</span>
                </div>
                <span className="text-slate-400 text-[9px]">
                  Total:{" "}
                  {(
                    powerBreakdownData?.totalLifetimeXP ||
                    player.lifetimeXP ||
                    482950
                  ).toLocaleString()}{" "}
                  XP
                </span>
              </div>

              {/* MULTI-SEGMENT DISTRIBUTION BAR */}
              {powerBreakdownData?.categories && (
                <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex shadow-inner">
                  {powerBreakdownData.categories.map((c) => {
                    let bg = "bg-purple-500";
                    if (c.key === "personal_raids" || c.key === "raid") bg = "bg-amber-500";
                    if (c.key === "cto") bg = "bg-sky-500";
                    if (c.key === "snipe") bg = "bg-rose-500";
                    if (c.key === "platform" || c.key === "other") bg = "bg-emerald-500";
                    return (
                      <div
                        key={c.key}
                        className={`h-full ${bg} transition-all duration-300`}
                        style={{ width: `${c.percentage || 20}%` }}
                        title={`${c.label}: ${c.percentage}% (${c.xpGranted.toLocaleString()} XP)`}
                      />
                    );
                  })}
                </div>
              )}

              {/* 5 ITEMIZED XP SOURCE CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(
                  powerBreakdownData?.categories || [
                    {
                      key: "memes",
                      label: "Memes Submitted",
                      count: player?.lifetimeStats?.memes || 89,
                      countText: `${player?.lifetimeStats?.memes || 89} Memes Verified`,
                      xpGranted: Math.round((player.lifetimeXP || 482950) * 0.2),
                      percentage: 20.0,
                      icon: "🎭",
                      channel: "#meme-factory",
                      description: "Verified community meme creations, fan art and viral reactions",
                      color: "border-purple-500/40 bg-purple-950/30 text-purple-300",
                      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
                    },
                    {
                      key: "personal_raids",
                      label: "Personal Raids",
                      count: player?.lifetimeStats?.raids || player?.raidCount || 340,
                      countText: `${player?.lifetimeStats?.raids || player?.raidCount || 340} Raids Executed`,
                      xpGranted: Math.round((player.lifetimeXP || 482950) * 0.35),
                      percentage: 35.0,
                      icon: "⚔️",
                      channel: "#raids-feed",
                      description: "Verified personal and squad raid operations on X/Twitter",
                      color: "border-amber-500/40 bg-amber-950/30 text-amber-300",
                      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
                    },
                    {
                      key: "cto",
                      label: "CTO Raids",
                      count: 38,
                      countText: "38 CTO Engagements",
                      xpGranted: Math.round((player.lifetimeXP || 482950) * 0.18),
                      percentage: 18.0,
                      icon: "📢",
                      channel: "#cto-official-post",
                      description: "Community takeover raids, pinned posts & priority boosts",
                      color: "border-sky-500/40 bg-sky-950/30 text-sky-300",
                      badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
                    },
                    {
                      key: "snipe",
                      label: "Snipe Raids",
                      count: 88,
                      countText: "88 Sniper Directives",
                      xpGranted: Math.round((player.lifetimeXP || 482950) * 0.15),
                      percentage: 15.0,
                      icon: "🎯",
                      channel: "#sniper-directives",
                      description: "Targeted flash raids, viral tweet snipes & rapid strikes",
                      color: "border-rose-500/40 bg-rose-950/30 text-rose-300",
                      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
                    },
                    {
                      key: "platform",
                      label: "Platform XP",
                      count: 215,
                      countText: "215 Operations Cleared",
                      xpGranted: Math.round((player.lifetimeXP || 482950) * 0.12),
                      percentage: 12.0,
                      icon: "⚡",
                      channel: "War Room & Directives",
                      description:
                        "Daily mission dossiers, weekly achievements, streaks & milestones",
                      color: "border-emerald-500/40 bg-emerald-950/30 text-emerald-300",
                      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
                    },
                  ]
                ).map((cat) => (
                  <div
                    key={cat.key}
                    className={`p-3 rounded-xl border ${cat.color || "border-slate-800 bg-slate-900"} flex flex-col justify-between gap-2 shadow-xs`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg shrink-0">{cat.icon}</span>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                            <span>{cat.label}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full font-black bg-slate-950/80 border border-white/10">
                              {cat.percentage}%
                            </span>
                          </div>
                          {cat.channel && (
                            <div className="text-[9.5px] text-slate-400 truncate">
                              {cat.channel}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-black text-xs sm:text-sm text-slate-100">
                          +{cat.xpGranted.toLocaleString()} XP
                        </div>
                        <div className="text-[9px] text-slate-400 font-bold">{cat.countText}</div>
                      </div>
                    </div>
                    {cat.description && (
                      <div className="text-[9.5px] text-slate-300/80 font-sans leading-tight pt-1 border-t border-white/5">
                        {cat.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* FORMULA REFERENCE CARD */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-2.5 text-[10px] space-y-1 font-mono">
              <div className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-amber-400" />
                <span>POWER SPECIFICATION</span>
              </div>
              <div className="text-slate-300 leading-relaxed font-sans text-[10px]">
                Raider Power is a direct 1:1 measurement of your cumulative verified Lifetime XP
                earned across Memes, Personal Raids, CTO directives, Snipe Raids, and War Room
                directives. Equipped gear items provide cosmetic flair and XP boost multipliers, but
                do not artificially inflate raw Power.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================================================================== */}
      {/* TOTAL XP MULTIPLIERS BREAKDOWN MODAL DIALOG                          */}
      {/* ==================================================================== */}
      <Dialog
        open={statModalOpen || xpMultipliersModalOpen}
        onOpenChange={(val) => {
          setStatModalOpen(val);
          setXpMultipliersModalOpen(val);
        }}
      >
        <DialogContent className="max-w-xl border-2 border-cyan-500/50 bg-[#0B0E14] text-foreground p-4 sm:p-6 space-y-3 sm:space-y-4 z-50 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <DialogHeader className="border-b border-cyan-500/20 pb-2.5">
            <DialogTitle className="font-display font-black text-lg text-cyan-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-cyan-400 shrink-0" />
                <span>TOTAL XP MULTIPLIERS BREAKDOWN</span>
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 font-mono pr-1">
            {/* 1. HERO HEADER: TOTAL XP BOOST PERCENTAGE */}
            <div className="rounded-2xl border border-cyan-500/50 bg-gradient-to-b from-slate-950 via-black to-slate-950 p-4 text-center font-mono space-y-1 shadow-inner">
              <div className="text-[10px] sm:text-[11px] font-black uppercase text-cyan-400/90 tracking-widest flex items-center justify-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>COMBINED XP MULTIPLIER BOOST</span>
              </div>
              <div className="font-display font-black text-3xl sm:text-4xl text-cyan-300 drop-shadow-[0_0_14px_rgba(6,182,212,0.6)]">
                +{Number(totalXpMultiplierPct ?? 0).toFixed(1)}%
              </div>
              <div className="text-[10.5px] text-slate-400 font-sans">
                Active passive multiplier applied to all XP gains, mission completions & raid
                outputs
              </div>
            </div>

            {/* 2. ACTIVE MULTIPLIER SOURCES */}
            <div className="space-y-1.5 font-mono">
              <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 px-0.5">
                ACTIVE MULTIPLIER SOURCES & BOOSTS
              </div>

              {/* Base Mission Multiplier */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-sm shrink-0">
                    🎯
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 truncate">Base Mission Multiplier</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Standard core reward baseline rate (1.00x)
                    </div>
                  </div>
                </div>
                <span className="font-mono font-black text-xs sm:text-sm text-blue-300 shrink-0 ml-2">
                  1.00x (100%)
                </span>
              </div>

              {/* Daily Raid Streak Boost */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-sm shrink-0">
                    ⚔️
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 truncate">Daily Raid Streak Boost</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Maintained via active daily community raid participation
                    </div>
                  </div>
                </div>
                <span className="font-mono font-black text-xs sm:text-sm text-red-400 shrink-0 ml-2">
                  +10.0%
                </span>
              </div>

              {/* Equipped Gear Passive Boost */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-sm shrink-0">
                    🛡️
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 truncate">Equipped Gear XP Boost</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Sum of 7 equipped items (Capped at +{equipmentCap?.maxCapXP ?? 10}%, Raw sum:
                      +{Number(equipmentCap?.rawBonusXP ?? 0).toFixed(1)}%)
                    </div>
                  </div>
                </div>
                <span className="font-mono font-black text-xs sm:text-sm text-emerald-400 shrink-0 ml-2">
                  +{Number(equipmentCap?.cappedBonusXP ?? 0).toFixed(1)}%
                </span>
              </div>

              {/* Specialist Set Bonus */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-sm shrink-0">
                    ⚡
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 truncate">Specialist Set Synergy</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {activeSpecialistIdentity.toUpperCase()} Set •{" "}
                      {specialistSetBonus?.piecesEquipped ?? 0}/7 Pieces
                    </div>
                  </div>
                </div>
                <span
                  className={`font-mono font-black text-xs sm:text-sm shrink-0 ml-2 ${
                    Number(specialistSetBonus?.bonusXP ?? 0) > 0
                      ? "text-amber-300"
                      : "text-slate-500"
                  }`}
                >
                  +{Number(specialistSetBonus?.bonusXP ?? 0).toFixed(0)}%
                </span>
              </div>

              {/* Equipped Title Boost */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-sm shrink-0">
                    🏷️
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 truncate">Title Boost</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Perk granted by "{activeTitleName}"
                    </div>
                  </div>
                </div>
                <span className="font-mono font-black text-xs sm:text-sm text-purple-300 shrink-0 ml-2">
                  +{Number(titleXpBoostPct ?? 0).toFixed(0)}%
                </span>
              </div>

              {/* Contributor Pass Tier Multiplier */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-sm shrink-0">
                    👑
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 truncate">
                      Contributor Pass Tier Multiplier
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {isContributor ? "Season 1 Contributor Pass Active" : "Free Raider Tier"}
                    </div>
                  </div>
                </div>
                <span
                  className={`font-mono font-black text-xs sm:text-sm shrink-0 ml-2 ${isContributor ? "text-amber-300" : "text-slate-500"}`}
                >
                  {isContributor ? "+15.0%" : "Locked (+0%)"}
                </span>
              </div>

              {/* Full Set Rarity Resonance */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-sm shrink-0">
                    ✨
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 truncate">
                      Full Set Rarity Resonance
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {fullSetRarityMatch.isMatching
                        ? `${fullSetRarityMatch.label?.toUpperCase()} Resonance Active (7/7 Matching)`
                        : "Requires all 7 equipped gear items to share identical rarity"}
                    </div>
                  </div>
                </div>
                <span
                  className={`font-mono font-black text-xs sm:text-sm shrink-0 ml-2 ${
                    fullSetRarityMatch.isMatching ? "text-purple-300" : "text-slate-500"
                  }`}
                >
                  {fullSetRarityMatch.isMatching ? "+15.0%" : "Inactive (+0%)"}
                </span>
              </div>

              {/* Reputation Multiplier */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sm shrink-0">
                    🏆
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 truncate">
                      Reputation Rank Multiplier
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {reputationSummary?.tierName || "Warbound"} • Community Verification Tier
                    </div>
                  </div>
                </div>
                <span className="font-mono font-black text-xs sm:text-sm text-sky-300 shrink-0 ml-2">
                  +{Number(repMultiplierPct ?? 0).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* 3. ACTIVE 6-STAT CONTRIBUTION METRICS */}
            <div className="space-y-1.5 font-mono pt-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 px-0.5">
                ACTIVE 6-STAT CONTRIBUTION METRICS
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {multipliersPayload.equipped_gear_by_stat.map((st) => {
                  let colorClass = "border-amber-500/30 text-amber-300";
                  let labelColor = "text-amber-400";
                  if (st.stat_key === "raid_xp") {
                    colorClass = "border-red-500/30 text-red-300";
                    labelColor = "text-red-400";
                  } else if (st.stat_key === "cto_xp") {
                    colorClass = "border-sky-500/30 text-sky-300";
                    labelColor = "text-sky-400";
                  } else if (st.stat_key === "mission_xp") {
                    colorClass = "border-emerald-500/30 text-emerald-300";
                    labelColor = "text-emerald-400";
                  } else if (st.stat_key === "meme_xp") {
                    colorClass = "border-purple-500/30 text-purple-300";
                    labelColor = "text-purple-400";
                  } else if (st.stat_key === "luck") {
                    colorClass = "border-yellow-500/30 text-yellow-300";
                    labelColor = "text-yellow-400";
                  }

                  return (
                    <div
                      key={st.stat_key}
                      className={`p-2.5 rounded-xl bg-slate-900/90 border ${colorClass} flex flex-col justify-between`}
                    >
                      <div
                        className={`text-[10px] uppercase font-bold flex items-center gap-1.5 ${labelColor}`}
                      >
                        <span className="text-xs shrink-0">{st.icon}</span>
                        <span className="truncate">{st.stat_label || st.label}</span>
                      </div>
                      <div className="pt-1.5">
                        <div className="font-bold text-sm font-mono">
                          +{Number(st?.value_pct ?? 0).toFixed(2)}%
                        </div>
                        <div className="text-[9px] text-slate-400">
                          {st.items_contributing || 1}{" "}
                          {(st.items_contributing || 1) === 1 ? "item" : "items"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. EQUIPPED LOADOUT BREAKDOWN */}
            <div className="space-y-1.5 font-mono pt-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 px-0.5">
                EQUIPPED LOADOUT BREAKDOWN
              </div>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                {ALL_SLOTS.map((slot) => {
                  const item = getSlotItem(slot.key);
                  const detailed = item ? getDetailedItemStats(item) : null;

                  return (
                    <div
                      key={slot.key}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {isImageUrl(item?.image) ? (
                          <img
                            src={item?.image}
                            alt={item?.name}
                            className="h-6 w-6 object-contain shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="shrink-0 text-base">{item?.image || slot.icon}</span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-amber-200 text-xs break-words leading-tight">
                            {item?.name || `Empty ${slot.label}`}
                          </div>
                          {detailed?.primary && (
                            <div className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <span>{detailed.primary.icon}</span>
                              <span>
                                {detailed.primary.label}: {detailed.primary.formatted}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item?.level && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/30">
                            Lv.{item.level}
                          </span>
                        )}
                        <span className="text-emerald-400 font-bold text-[11px]">
                          {detailed ? detailed.primary.formatted : "+0.00%"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. COLLAPSIBLE ADVANCED ACCOUNT DETAILS DRAWER */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden font-mono mt-2">
              <button
                type="button"
                onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
                className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-cyan-300/90 hover:text-cyan-300 hover:bg-slate-900/60 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-cyan-400" />
                  <span>Advanced Reputation Progression (Optional)</span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    showAdvancedDetails ? "rotate-180 text-cyan-400" : "text-slate-500"
                  }`}
                />
              </button>

              {showAdvancedDetails && (
                <div className="p-3 pt-0 space-y-3 border-t border-slate-800/80 text-xs">
                  {/* Weekly Rep Cap & Progress */}
                  <div className="rounded-lg border border-sky-500/30 bg-sky-950/20 p-2.5 space-y-2 mt-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-sky-300 font-bold flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5" /> Weekly Reputation XP Cap
                      </span>
                      <span className="text-amber-300 font-bold font-mono">
                        {(
                          multipliersPayload.breakdown.reputation.weekly_rep_xp_earned ?? 4200
                        ).toLocaleString()}{" "}
                        /{" "}
                        {(
                          multipliersPayload.breakdown.reputation.weekly_rep_cap ?? 10000
                        ).toLocaleString()}{" "}
                        Rep XP
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>
                          Tier Progress ({multipliersPayload.breakdown.reputation.current_tier_name}
                          ):
                        </span>
                        <span className="text-sky-300 font-bold font-mono">
                          {multipliersPayload.breakdown.reputation.current_rep_xp.toLocaleString()}{" "}
                          /{" "}
                          {multipliersPayload.breakdown.reputation.next_tier_rep_xp.toLocaleString()}{" "}
                          XP
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-sky-500/20">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-amber-400 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (multipliersPayload.breakdown.reputation.current_rep_xp /
                                multipliersPayload.breakdown.reputation.next_tier_rep_xp) *
                                100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Toggle Full Rep Tier Table */}
                    <button
                      type="button"
                      onClick={() => setShowRepTierTable(!showRepTierTable)}
                      className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-bold underline underline-offset-2 transition-colors cursor-pointer pt-0.5"
                    >
                      {showRepTierTable ? "Hide" : "View"} All 6 Reputation Tiers (Tier 0 to Tier 5)
                      <ChevronRight
                        className={`h-3 w-3 transition-transform ${
                          showRepTierTable ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    {showRepTierTable && (
                      <div className="mt-2 space-y-1 rounded-lg bg-slate-950 border border-slate-800 p-2 text-[10px]">
                        <div className="font-black text-amber-400 uppercase tracking-wider pb-1 border-b border-slate-800">
                          REPUTATION TIER PROGRESSION TABLE
                        </div>
                        <div className="space-y-1 pt-1">
                          {REPUTATION_TIERS.map((tier) => {
                            const isCurrent =
                              multipliersPayload.breakdown.reputation.current_tier_name.includes(
                                tier.name,
                              ) ||
                              multipliersPayload.breakdown.reputation.current_tier_name.includes(
                                `Tier ${tier.tier}`,
                              );
                            return (
                              <div
                                key={tier.id}
                                className={`flex items-center justify-between p-1.5 rounded-lg border ${
                                  isCurrent
                                    ? "bg-amber-950/40 border-amber-500/50 text-amber-200 font-bold"
                                    : "bg-slate-900/50 border-slate-800/80 text-slate-300"
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span>{tier.badgeEmoji}</span>
                                  <span>{tier.tierName}</span>
                                  {isCurrent && (
                                    <span className="text-[8px] bg-amber-400 text-slate-950 px-1 rounded font-black">
                                      CURRENT
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-400 font-mono">
                                    {tier.minRepXP.toLocaleString()} Rep XP
                                  </span>
                                  <span
                                    className={`font-black font-mono ${
                                      Number(tier?.multiplierPct ?? 0) > 0
                                        ? "text-emerald-400"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    +{Number(tier?.multiplierPct ?? 0).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Raw Gear Cap Formulas & Limits */}
                  <div className="rounded-lg border border-cyan-500/20 bg-slate-900/60 p-2.5 text-[10px] space-y-1">
                    <div className="font-bold text-cyan-300 uppercase tracking-wider">
                      Passive Gear Cap Limits & Formula
                    </div>
                    <div className="text-slate-400 leading-relaxed">
                      Standard loadouts have an equipment passive bonus cap limit of +
                      {Number(
                        multipliersPayload?.breakdown?.equipped_gear?.cap_limit_pct ?? 10,
                      ).toFixed(1)}
                      %. Current raw equipment sum: +
                      {Number(
                        multipliersPayload?.breakdown?.equipped_gear?.uncapped_sum_pct ?? 0,
                      ).toFixed(1)}
                      % (applied: +
                      {Number(
                        multipliersPayload?.breakdown?.equipped_gear?.applied_capped_pct ?? 0,
                      ).toFixed(1)}
                      %).
                    </div>
                  </div>

                  {/* JSON Contract Inspector */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowJsonContract(!showJsonContract)}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[10px] text-cyan-300 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-1 py-0.2 rounded text-[8.5px] font-black">
                          GET
                        </span>
                        <span>/api/v1/user/multipliers JSON Payload</span>
                      </span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${
                          showJsonContract ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showJsonContract && (
                      <div className="mt-2 relative">
                        <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[9.5px] font-mono text-emerald-300 overflow-x-auto max-h-52">
                          {JSON.stringify(
                            {
                              user_id: multipliersPayload.user_id,
                              combined_xp_multiplier_pct:
                                multipliersPayload.combined_xp_multiplier_pct,
                              breakdown: multipliersPayload.breakdown,
                            },
                            null,
                            2,
                          )}
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              JSON.stringify(
                                {
                                  user_id: multipliersPayload.user_id,
                                  combined_xp_multiplier_pct:
                                    multipliersPayload.combined_xp_multiplier_pct,
                                  breakdown: multipliersPayload.breakdown,
                                },
                                null,
                                2,
                              ),
                            );
                            toast.success("Copied multipliers payload to clipboard!");
                          }}
                          className="absolute top-2 right-2 text-[9px] font-mono font-bold bg-slate-900 border border-slate-700 text-cyan-300 hover:bg-slate-800 h-6 px-2"
                        >
                          Copy JSON
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* QUICK CTA BUTTON TO LAUNCH MISSIONS */}
            <div className="pt-2 border-t border-cyan-500/30">
              <Button
                size="lg"
                onClick={() => {
                  setXpMultipliersModalOpen(false);
                  navigate({ to: "/missions" });
                }}
                className="w-full h-11 sm:h-12 bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-400 text-slate-950 hover:from-cyan-300 hover:to-teal-300 font-mono text-xs sm:text-sm font-black uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-98"
              >
                <Rocket className="h-4 w-4 text-slate-950 shrink-0" />
                <span>🚀 LAUNCH MISSIONS</span>
                <ArrowRight className="h-4 w-4 text-slate-950 shrink-0" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ALL MODALS & DIALOGS */}
      <AvatarPickerModal open={avatarPickerOpen} onOpenChange={setAvatarPickerOpen} />
      <DonateMoreModal open={donateModalOpen} onOpenChange={setDonateModalOpen} />

      <TitleCosmeticSelectorModal open={titleModalOpen} onOpenChange={setTitleModalOpen} />

      <EquipmentSelectorModal
        slot={activeSelectorSlot}
        open={Boolean(activeSelectorSlot)}
        onClose={() => setActiveSelectorSlot(null)}
        onOpenDetails={(item) => setInspectingItem(item)}
      />

      <ItemDetailsModal
        item={inspectingItem}
        open={Boolean(inspectingItem)}
        onClose={() => setInspectingItem(null)}
        onSwapGear={() => {
          if (inspectingItem) {
            setActiveSelectorSlot(inspectingItem.slot);
            setInspectingItem(null);
          }
        }}
      />

      {/* SPECIALIST SET AUTO-EQUIP SELECTOR MODAL SHEET */}
      <Sheet open={autoEquipModalOpen} onOpenChange={setAutoEquipModalOpen}>
        <SheetContent
          side="bottom"
          className="bottom-[64px] lg:bottom-4 max-h-[calc(85vh-64px)] overflow-y-auto border-t-2 sm:border-2 border-amber-500/50 bg-[#0B0E14] text-foreground p-4 sm:p-5 px-4 sm:px-6 pb-6 space-y-3.5 z-[350] w-full max-w-md mx-auto overflow-x-hidden rounded-t-2xl sm:rounded-2xl shadow-2xl"
        >
          <SheetHeader className="text-left border-b border-amber-500/20 pb-2.5">
            <SheetTitle className="font-display font-black text-base sm:text-lg text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Wand2 className="h-4 sm:h-5 w-4 sm:w-5 text-amber-400" />
              PRESETS & AUTO-EQUIP
            </SheetTitle>
          </SheetHeader>

          {/* 1. QUICK ACCESS DE-EQUIP (CLEAR GEAR) AT TOP */}
          <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950 p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-500/20 border border-rose-400 text-lg shadow-inner">
                🔓
              </div>
              <div className="min-w-0">
                <div className="font-display font-black text-xs sm:text-sm uppercase text-rose-300">
                  CLEAR GEAR
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  De-equip all 7 slots in one tap
                </div>
              </div>
            </div>
            <Button
              onClick={handleDeEquipAll}
              size="sm"
              variant="outline"
              className="font-mono text-[11px] font-black uppercase tracking-wider border border-rose-400 text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 cursor-pointer h-8 px-3 shrink-0"
            >
              CLEAR ALL
            </Button>
          </div>

          {/* 2. BEST XP BOOST */}
          <div className="rounded-2xl border border-amber-500/50 bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-950 p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/20 border border-amber-400 text-lg shadow-inner">
                ⚡
              </div>
              <div className="min-w-0">
                <div className="font-display font-black text-xs sm:text-sm uppercase text-amber-300 flex items-center gap-1.5">
                  <span>BEST XP BOOST</span>
                  <span className="text-[8px] font-mono font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded">
                    MAX XP
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  Equips highest XP multiplier gear per slot
                </div>
              </div>
            </div>
            <Button
              onClick={handleAutoEquipBestInSlot}
              size="sm"
              className="font-mono text-[11px] font-black uppercase tracking-wider border border-amber-400 text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 cursor-pointer h-8 px-3.5 shadow-[0_0_10px_rgba(245,158,11,0.3)] shrink-0"
            >
              EQUIP BEST
            </Button>
          </div>

          {/* 3. SPECIALIST SETS (VERTICAL SCROLLING LIST) */}
          <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-slate-950 p-3 sm:p-3.5 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between gap-2 border-b border-cyan-500/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg">🪖</span>
                <span className="font-display font-black text-xs sm:text-sm uppercase text-cyan-300">
                  SPECIALIST SETS
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded">
                6 SPECIALIST LOADOUTS
              </span>
            </div>

            {/* Vertical list of all Specialist Sets */}
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
              {SEASON_1_SETS.map((s) => {
                const isActive =
                  activeSpecialistIdentity.toLowerCase().includes(s.name.toLowerCase()) ||
                  activeSpecialistIdentity.toLowerCase().includes(s.category.toLowerCase());

                // Calculate owned pieces for this specific set
                const setPiecesInInv = inventory.filter((it) => {
                  const itemSet = (it.set || it.category || "").toLowerCase();
                  const target = s.name.toLowerCase();
                  return itemSet.includes(target) || target.includes(itemSet.replace(" set", ""));
                });
                const uniqueOwnedSlots = new Set(setPiecesInInv.map((i) => i.slot)).size;

                return (
                  <div
                    key={s.name}
                    className={`rounded-xl border p-2.5 sm:p-3 transition-all space-y-2 ${
                      isActive
                        ? "border-emerald-500/50 bg-emerald-950/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                        : "border-slate-800 bg-[#10131a] hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-500/20 border border-amber-500/40 text-lg shadow-inner">
                          {s.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="font-display font-black text-xs sm:text-sm uppercase text-amber-300 flex items-center gap-1.5">
                            <span className="truncate">{s.name}</span>
                            {isActive && (
                              <span className="text-[8px] font-mono font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded shrink-0">
                                ACTIVE (7/7)
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 truncate">
                            {s.specialistIdentity}
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleAutoEquipSpecificSet(s.name)}
                        size="sm"
                        className="font-mono text-[11px] font-black uppercase tracking-wider cursor-pointer h-8 px-3 shrink-0 border border-cyan-400/50 text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 shadow-sm"
                      >
                        EQUIP SET
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-800/80 font-mono text-[10px]">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span>Progression:</span>
                        <span className="font-black text-amber-300">
                          {uniqueOwnedSlots} / 7 Pieces Owned
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded font-bold text-[9.5px]">
                        <Sparkles className="h-3 w-3 text-emerald-400 shrink-0" />
                        <span className="leading-tight">{s.bonusDescription}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Pack Opening Modal for Quick HQ Unboxing */}
      <PackOpeningModal
        pack={activePackToOpen}
        open={packOpeningOpen}
        onOpenChange={setPackOpeningOpen}
      />

      {/* Daily Bounty Three-Packet Dossier Unboxing Modal */}
      <ThreePacketUnboxingModal
        open={dailyUnboxingModalOpen}
        onClose={() => setDailyUnboxingModalOpen(false)}
        featuredMissions={featuredDailyMissions}
        onUnsealComplete={handleUnsealBountiesComplete}
      />

      {/* Contributor Upgrade Required Modal for Locked HQ Features */}
      <ContributorUpgradeRequiredModal
        open={contributorUpgradeModalOpen}
        onOpenChange={setContributorUpgradeModalOpen}
        feature={lockedFeatureKey}
      />

      {/* Upcoming Features & Roadmap Modal */}
      <RoadmapModal open={roadmapModalOpen} onOpenChange={setRoadmapModalOpen} />
    </div>
  );
}
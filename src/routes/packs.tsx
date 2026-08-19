import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Gift,
  Package,
  Layers,
  ShoppingCart,
  CheckCircle2,
  Lock,
  Award,
  Zap,
  Search,
  Filter,
  ArrowUpDown,
  Grid,
  List,
  Check,
  Unlock,
  Box,
  ChevronDown,
  ChevronUp,
  Info,
  BarChart2,
  Sparkles,
  HelpCircle,
  X,
  Shield,
  Eye,
  Hammer,
} from "lucide-react";
import { AppShell } from "@/components/game/AppShell";
import { PageHeader } from "@/components/game/PageHeader";
import { ArmoryHeaderTabs, ArmorySwipeContainer } from "@/components/game/ArmoryHeaderTabs";
import { Pack3DChest } from "@/components/game/Pack3DChest";
import { PackOpeningModal } from "@/components/game/PackOpeningModal";
import { PackDetailsModal } from "@/components/game/PackDetailsModal";
import { ItemDetailsModal } from "@/components/game/ItemDetailsModal";
import { isImageUrl } from "@/components/game/RaiderAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGameStore } from "@/store/gameStore";
import { fetchVaultCatalogPayload, type VaultCatalogPayload } from "@/services/vault";
import { season1CatalogPacks } from "@/services/packs";
import { getPackPityCounters } from "@/services/pityService";
import { audio } from "@/services/audio";
import { rarityLabel, rarityTextClass, rarityBorderClass } from "@/lib/rarity";
import type { EquipmentSlot, Item, Pack, Rarity } from "@/types/game";

export const Route = createFileRoute("/packs")({ component: VaultPage });

function getDiscoveryPathForItem(item: Item): string {
  if (item.metadata?.discoveryPath && typeof item.metadata.discoveryPath === "string") {
    return item.metadata.discoveryPath;
  }
  const setName = item.set?.toLowerCase() ?? "";
  if (setName.includes("raid")) return "Available from Raider Packs & Community Raids";
  if (setName.includes("cto")) return "Available from Specialist Packs (CTO Set)";
  if (setName.includes("meme")) return "Available from Specialist Packs (Meme Set)";
  if (setName.includes("video")) return "Available from Specialist Packs (Video Set)";
  if (setName.includes("mission")) return "Available from Specialist Packs (Mission Set)";
  if (setName.includes("season")) return "Available from Specialist Packs (Season Set)";
  if (item.rarity === "legendary" || item.rarity === "mythic")
    return "Available from Legendary Packs & The Forge";
  return "Available from Season 1 Raider & Specialist Packs";
}

export function VaultPage() {
  const location = useRouterState({ select: (s) => s.location });
  const navigate = useNavigate();
  const searchParams = useMemo(() => new URLSearchParams(location.searchStr), [location.searchStr]);
  const activeTab = searchParams.get("tab") === "vault" ? "vault" : "stash";
  const highlightPackParam = searchParams.get("highlightPack");
  const [highlightedStackKey, setHighlightedStackKey] = useState<string | null>(null);

  useEffect(() => {
    if (!highlightPackParam) return;

    let targetKey = "raider";
    if (highlightPackParam.includes("specialist")) targetKey = "specialist";
    else if (highlightPackParam.includes("legendary")) targetKey = "legendary";
    else targetKey = "raider";

    setHighlightedStackKey(targetKey);

    const timer = setTimeout(() => {
      const el = document.getElementById(`pack-stack-${targetKey}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 200);

    const clearTimer = setTimeout(() => {
      setHighlightedStackKey(null);
    }, 4500);

    return () => {
      clearTimeout(timer);
      clearTimeout(clearTimer);
    };
  }, [highlightPackParam]);

  const packs = useGameStore((s) => s.packs);
  const inventory = useGameStore((s) => s.inventory);
  const sets = useGameStore((s) => s.collection);
  const player = useGameStore((s) => s.player);
  const spendableXP = player?.spendableXP ?? player?.xp ?? 0;

  const [catalogPayload, setCatalogPayload] = useState<VaultCatalogPayload | null>(null);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [infoPack, setInfoPack] = useState<Pack | null>(null);
  const [isBatchOpening, setIsBatchOpening] = useState<boolean>(false);
  const [batchPacksList, setBatchPacksList] = useState<Pack[]>([]);
  const [inspectingItem, setInspectingItem] = useState<Item | null>(null);
  const [lockedItemIds] = useState<Set<string>>(new Set());
  const [favoriteItemIds] = useState<Set<string>>(
    new Set(player?.favoriteItemId ? [player.favoriteItemId] : []),
  );

  // Filters state for Section 3 (Item Collection Catalogue)
  const [ownershipTab, setOwnershipTab] = useState<"owned" | "locked" | "all">("owned");
  const [slotFilter, setSlotFilter] = useState<string>("all");
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rarity" | "level" | "name" | "set">("rarity");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filters state for Section 2 (Specialist Set Progression)
  const [specialistSetOwnershipTab, setSpecialistSetOwnershipTab] = useState<
    "owned" | "locked" | "all"
  >("owned");
  const [setCategoryFilter, setSetCategoryFilter] = useState<string>("All Sets");
  const [collapsedSets, setCollapsedSets] = useState<Record<string, boolean>>({});
  const [expandedSetInfo, setExpandedSetInfo] = useState<Record<string, boolean>>({});

  // Local Viewport Toggle state (Specialist Sets vs All Catalogue)
  const [vaultSection, setVaultSection] = useState<"sets" | "catalogue">("sets");

  // Inspecting Slot Variant Modal state
  const [inspectingSlot, setInspectingSlot] = useState<{
    setName: string;
    slotDef: { slot: EquipmentSlot; label: string; icon: string };
    varA: Item;
    varB: Item;
    isVarAOwned: boolean;
    isVarBOwned: boolean;
  } | null>(null);

  // Load catalog items via fetchVaultCatalogPayload async execution hook
  useEffect(() => {
    fetchVaultCatalogPayload().then((payload) => {
      setCatalogPayload(payload);
    });
  }, [packs, inventory, player]);

  // Owned item counts mapped by canonical catalog template ID
  const ownedItemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of inventory) {
      const canonicalId = item.templateId || item.id;
      counts[canonicalId] = (counts[canonicalId] || 0) + 1;
    }
    return counts;
  }, [inventory]);

  const ownedItemIdsSet = useMemo(() => {
    const set = new Set<string>();
    for (const item of inventory) {
      set.add(item.id);
      if (item.templateId) set.add(item.templateId);
    }
    return set;
  }, [inventory]);

  // Master Catalogue Items (Strictly 86 items)
  const master86CatalogItems = useMemo(() => {
    if (catalogPayload?.catalogItems && catalogPayload.catalogItems.length > 0) {
      return catalogPayload.catalogItems.slice(0, 86);
    }
    return (useGameStore.getState().inventory || []).slice(0, 86);
  }, [catalogPayload]);

  // Unified Vault Items with Player Discovery State
  const unifiedVaultItems = useMemo(() => {
    return master86CatalogItems.map((item) => {
      const isOwned = ownedItemIdsSet.has(item.id);
      const duplicateCount = ownedItemCounts[item.id] ?? 0;
      const isEquipped =
        player?.equipped[item.slot] === item.id ||
        (player?.equipped[item.slot] &&
          inventory.some(
            (invItem) =>
              invItem.id === player.equipped[item.slot] &&
              (invItem.templateId || invItem.id) === item.id,
          ));
      return {
        ...item,
        isOwned,
        duplicateCount,
        isEquipped,
        discoveryPath: getDiscoveryPathForItem(item),
      };
    });
  }, [master86CatalogItems, inventory, ownedItemIdsSet, ownedItemCounts, player?.equipped]);

  // Filtered Catalogue Items
  const filteredVaultItems = useMemo(() => {
    return unifiedVaultItems
      .filter((item) => {
        if (ownershipTab === "owned" && !item.isOwned) return false;
        if (ownershipTab === "locked" && item.isOwned) return false;

        if (
          search &&
          !item.name.toLowerCase().includes(search.toLowerCase()) &&
          !(item.set && item.set.toLowerCase().includes(search.toLowerCase()))
        ) {
          return false;
        }

        if (slotFilter !== "all") {
          if (slotFilter === "duplicates") {
            if (item.duplicateCount <= 1) return false;
          } else if (slotFilter === "favorites") {
            if (!favoriteItemIds.has(item.id)) return false;
          } else if (slotFilter === "locked") {
            if (!lockedItemIds.has(item.id)) return false;
          } else if (item.slot !== slotFilter) {
            return false;
          }
        }

        if (rarityFilter !== "all" && item.rarity !== rarityFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "rarity") {
          const rank: Record<Rarity, number> = {
            mythic: 6,
            legendary: 5,
            epic: 4,
            rare: 3,
            uncommon: 2,
            common: 1,
          };
          return (rank[b.rarity] || 0) - (rank[a.rarity] || 0);
        }
        if (sortBy === "level") {
          return (b.level ?? 1) - (a.level ?? 1);
        }
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "set") {
          return (a.set ?? "").localeCompare(b.set ?? "");
        }
        return 0;
      });
  }, [
    unifiedVaultItems,
    ownershipTab,
    search,
    slotFilter,
    rarityFilter,
    sortBy,
    favoriteItemIds,
    lockedItemIds,
  ]);

  // Overall Vault Metrics
  const totalCatalogCount = 86;
  const discoveredCount = unifiedVaultItems.filter((i) => i.isOwned).length;
  const discoveryPercentage = Math.round((discoveredCount / totalCatalogCount) * 100);

  // Owned Pack Counts
  const raiderPacksCount = useMemo(() => {
    return packs.filter(
      (p) => p.configId === "pack_raider" || p.id.includes("raider") || p.name.includes("Raider"),
    ).length;
  }, [packs]);

  const specialistPacksCount = useMemo(() => {
    return packs.filter(
      (p) =>
        (p.configId === "pack_specialist" ||
          p.id.includes("specialist") ||
          p.name.includes("Specialist")) &&
        !p.name.includes("Legendary"),
    ).length;
  }, [packs]);

  const legendaryPacksCount = useMemo(() => {
    return packs.filter(
      (p) =>
        p.configId === "pack_legendary_raider" ||
        p.id.includes("legendary") ||
        p.name.includes("Legendary"),
    ).length;
  }, [packs]);

  const handleInspectPackByTier = (packConfigId: string) => {
    const matchingOwnedPack = packs.find(
      (p) =>
        p.configId === packConfigId ||
        p.id.includes(packConfigId.replace("pack_", "")) ||
        (packConfigId.includes("raider") && p.name.includes("Raider")) ||
        (packConfigId.includes("specialist") && p.name.includes("Specialist")) ||
        (packConfigId.includes("legendary") && p.name.includes("Legendary")),
    );

    if (matchingOwnedPack) {
      setInfoPack(matchingOwnedPack);
    } else {
      const catalogPack =
        season1CatalogPacks.find((p) => p.configId === packConfigId || p.id === packConfigId) ||
        season1CatalogPacks[0];
      setInfoPack(catalogPack);
    }
  };

  const handleOpenPackByTier = (packConfigId: string) => {
    audio.play("pack.burst");
    setIsBatchOpening(false);
    setBatchPacksList([]);
    const matchingOwnedPack = packs.find(
      (p) =>
        p.configId === packConfigId ||
        p.id.includes(packConfigId.replace("pack_", "")) ||
        (packConfigId.includes("raider") && p.name.includes("Raider")) ||
        (packConfigId.includes("specialist") && p.name.includes("Specialist")) ||
        (packConfigId.includes("legendary") && p.name.includes("Legendary")),
    );

    if (matchingOwnedPack) {
      setSelectedPack(matchingOwnedPack);
    } else {
      const catalogPack =
        season1CatalogPacks.find((p) => p.configId === packConfigId || p.id === packConfigId) ||
        season1CatalogPacks[0];
      setSelectedPack(catalogPack);
    }
  };

  const handleOpenAllPacks = () => {
    if (packs.length === 0) return;
    audio.play("pack.burst");
    setBatchPacksList([...packs]);
    setIsBatchOpening(true);
    setSelectedPack(packs[0]);
  };

  const slotTabs: Array<{ id: string; label: string; icon: string }> = [
    { id: "all", label: "All Gear", icon: "📦" },
    { id: "head", label: "Hat", icon: "🎩" },
    { id: "body", label: "Top", icon: "👕" },
    { id: "shorts", label: "Shorts", icon: "🩳" },
    { id: "feet", label: "Boots", icon: "🥾" },
    { id: "back", label: "Cape", icon: "🦸" },
    { id: "pet", label: "Pet", icon: "🐾" },
    { id: "powerItem", label: "Power Item", icon: "⚡" },
    { id: "avatar", label: "Avatar Model", icon: "👤" },
    { id: "frame", label: "Card Frame", icon: "🖼️" },
    { id: "background", label: "Stage Artwork", icon: "🎨" },
    { id: "duplicates", label: "Duplicates", icon: "♻️" },
    { id: "favorites", label: "Favorites", icon: "⭐" },
  ];

  const setCategories = [
    "All Sets",
    "Raid Specialist",
    "CTO Specialist",
    "Meme Specialist",
    "Video Specialist",
    "Season Specialist",
  ];

  const setsWithProgress = useMemo(() => {
    const slotDefinitions: Array<{
      slot: EquipmentSlot;
      label: string;
      icon: string;
    }> = [
      { slot: "head", label: "Hat", icon: "🪖" },
      { slot: "body", label: "Top", icon: "👕" },
      { slot: "shorts", label: "Shorts", icon: "🩳" },
      { slot: "feet", label: "Boots", icon: "🥾" },
      { slot: "back", label: "Cape", icon: "🦸" },
      { slot: "pet", label: "Pet", icon: "🐾" },
      { slot: "powerItem", label: "Power Item", icon: "⚡" },
    ];

    return sets.map((set) => {
      const setItems = unifiedVaultItems.filter(
        (i) =>
          i.set === set.name ||
          i.specialistSet === set.name ||
          i.set?.toLowerCase() === set.name.toLowerCase(),
      );

      const slotPairs = slotDefinitions.map((def) => {
        const matchingInSlot = setItems.filter((i) => i.slot === def.slot);
        const varA = matchingInSlot[0] || {
          id: `set_${set.name.toLowerCase().replace(/\s+/g, "_")}_${def.slot}_a`,
          name: `${set.name.replace("Set", "")} ${def.label} (Var A)`,
          slot: def.slot,
          rarity: "rare" as Rarity,
          image: def.icon,
          set: set.name,
        };
        const varB = matchingInSlot[1] || {
          id: `set_${set.name.toLowerCase().replace(/\s+/g, "_")}_${def.slot}_b`,
          name: `${set.name.replace("Set", "")} Prime ${def.label} (Var B)`,
          slot: def.slot,
          rarity: "epic" as Rarity,
          image: def.icon,
          set: set.name,
        };

        const isVarAOwned =
          inventory.some(
            (inv) => inv.id === varA.id || inv.name === varA.name || inv.templateId === varA.id,
          ) || set.ownedItemIds.includes(varA.id);
        const isVarBOwned =
          inventory.some(
            (inv) => inv.id === varB.id || inv.name === varB.name || inv.templateId === varB.id,
          ) || set.ownedItemIds.includes(varB.id);

        return {
          slotDef: def,
          varA,
          varB,
          isVarAOwned,
          isVarBOwned,
        };
      });

      let itemsDiscoveredCount = 0;
      slotPairs.forEach((pair) => {
        if (pair.isVarAOwned) itemsDiscoveredCount++;
        if (pair.isVarBOwned) itemsDiscoveredCount++;
      });

      if (itemsDiscoveredCount < set.ownedItemIds.length) {
        itemsDiscoveredCount = set.ownedItemIds.length;
      }

      const totalSetItems = 14;
      const setPct = Math.round((itemsDiscoveredCount / totalSetItems) * 100);
      const isComplete = itemsDiscoveredCount >= totalSetItems;

      return {
        ...set,
        slotPairs,
        itemsDiscoveredCount,
        totalSetItems,
        setPct,
        isComplete,
      };
    });
  }, [sets, unifiedVaultItems, inventory]);

  const ownedSetsCount = useMemo(() => {
    return setsWithProgress.filter((s) => s.itemsDiscoveredCount > 0).length;
  }, [setsWithProgress]);

  const lockedSetsCount = setsWithProgress.length - ownedSetsCount;

  const filteredAndSortedSets = useMemo(() => {
    return setsWithProgress
      .filter((s) => {
        if (specialistSetOwnershipTab === "owned" && s.itemsDiscoveredCount === 0) return false;
        if (specialistSetOwnershipTab === "locked" && s.itemsDiscoveredCount > 0) return false;
        if (setCategoryFilter !== "All Sets") {
          if (s.category !== setCategoryFilter && !s.name.includes(setCategoryFilter)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Sort sets by highest completion percentage first (e.g. 50% at top)
        if (b.setPct !== a.setPct) {
          return b.setPct - a.setPct;
        }
        if (b.itemsDiscoveredCount !== a.itemsDiscoveredCount) {
          return b.itemsDiscoveredCount - a.itemsDiscoveredCount;
        }
        return a.name.localeCompare(b.name);
      });
  }, [setsWithProgress, specialistSetOwnershipTab, setCategoryFilter]);

  return (
    <AppShell>
      <div className="space-y-4 max-w-7xl mx-auto pb-[90px]">
        <PageHeader title="PACK VAULT" />
        <ArmorySwipeContainer>
          <div className="space-y-4 font-mono">
            {/* STANDARDIZED EQUAL-WIDTH SUB-TOGGLE PILL BAR (PACK STASH vs COLLECTION VAULT) */}
            <div className="bg-slate-900/80 border border-amber-500/20 p-1 rounded-2xl w-full grid grid-cols-2 gap-2 shadow-lg backdrop-blur-sm">
              <button
                type="button"
                onClick={() => {
                  audio.play("button.click");
                  navigate({ search: { tab: "stash" } });
                }}
                className={`w-full min-w-0 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-mono text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer select-none active:scale-[0.98] whitespace-nowrap ${
                  activeTab === "stash"
                    ? "bg-amber-400 text-black font-bold shadow-md"
                    : "text-slate-400 hover:text-amber-200"
                }`}
              >
                <Box
                  className={`h-4 w-4 shrink-0 ${activeTab === "stash" ? "text-black" : "text-amber-400"}`}
                />
                <span className="truncate">PACK STASH</span>
                {packs.length > 0 && (
                  <span
                    className={`ml-1 bg-black/30 px-2 py-0.5 rounded-full text-xs font-black shrink-0 ${
                      activeTab === "stash" ? "text-black" : "text-amber-300"
                    }`}
                  >
                    {packs.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  audio.play("button.click");
                  navigate({ search: { tab: "vault" } });
                }}
                className={`w-full min-w-0 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-mono text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer select-none active:scale-[0.98] whitespace-nowrap ${
                  activeTab === "vault"
                    ? "bg-amber-400 text-black font-bold shadow-md"
                    : "text-slate-400 hover:text-amber-200"
                }`}
              >
                <Layers
                  className={`h-4 w-4 shrink-0 ${activeTab === "vault" ? "text-black" : "text-amber-400"}`}
                />
                <span className="truncate">
                  <span className="hidden xs:inline">COLLECTION </span>VAULT
                </span>
                <span
                  className={`ml-1 bg-black/30 px-2 py-0.5 rounded-full text-xs font-black shrink-0 ${
                    activeTab === "vault" ? "text-black" : "text-slate-300"
                  }`}
                >
                  {discoveredCount}/86
                </span>
              </button>
            </div>

            {/* ========================================================================================= */}
            {/* VIEW A: DEDICATED PACK STASH & UNBOXING INVENTORY                                          */}
            {/* ========================================================================================= */}
            {activeTab === "stash" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* 1. COMPACT SINGLE-LINE STATUS BADGE FOR DISCORD MINI-APP EMBED */}
                <div className="rounded-xl border border-amber-500/30 bg-slate-900/90 p-3 sm:px-3.5 sm:py-2.5 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1 font-black text-amber-300 border border-amber-500/40 shadow-sm">
                      <Box className="h-4 w-4 text-amber-400" />
                      <span>
                        📦 {packs.length} {packs.length === 1 ? "Pack" : "Packs"} Ready to Open
                      </span>
                    </span>
                    <span className="text-slate-600 font-bold hidden sm:inline">|</span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-3 py-1 font-bold text-slate-300 border border-slate-700">
                      <Layers className="h-4 w-4 text-cyan-400" />
                      <span>Collection Vault: {discoveredCount}/86</span>
                    </span>
                  </div>

                  {packs.length > 0 && (
                    <Button
                      size="sm"
                      onClick={handleOpenAllPacks}
                      className="font-mono text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20 px-4 h-9 cursor-pointer rounded-lg shrink-0 w-full sm:w-auto"
                    >
                      <Zap className="mr-1.5 h-3.5 w-3.5 fill-slate-950" /> ⚡ OPEN ALL PACKS (
                      {packs.length})
                    </Button>
                  )}
                </div>

                {/* UNOPENED PACK STACKS GRID */}
                <section className="space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <Box className="h-5 w-5 text-amber-400" />
                      <h2 className="font-display text-lg sm:text-xl font-black uppercase tracking-wide text-white">
                        Stored Pack Stacks
                      </h2>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer border border-slate-700/60 ml-0.5"
                              aria-label="Pity System Info"
                            >
                              <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="bg-slate-900 border border-amber-500/30 text-slate-200 text-xs font-sans max-w-xs p-2.5 shadow-xl"
                          >
                            <p>
                              <strong className="text-amber-400 font-mono">
                                Pity System Active:
                              </strong>{" "}
                              Opening packs without a high-tier drop increases your pity counter.
                              Reaching max threshold guarantees the item!
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* PACK STACKS GRID (ONLY RENDER CONTAINERS WITH ACTIVE PACK COUNT > 0) */}
                  {packs.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* STACK 1: RAIDER PACK */}
                      {raiderPacksCount > 0 &&
                        (() => {
                          const pity = getPackPityCounters(player?.pityState, "pack_raider");
                          const epicRem = Math.max(0, pity.epicThreshold - pity.epicPityCounter);
                          const legRem = Math.max(
                            0,
                            pity.legendaryThreshold - pity.legendaryPityCounter,
                          );
                          const epicPct = Math.min(
                            100,
                            Math.round((pity.epicPityCounter / pity.epicThreshold) * 100),
                          );
                          const legPct = Math.min(
                            100,
                            Math.round((pity.legendaryPityCounter / pity.legendaryThreshold) * 100),
                          );

                          const isHighlighted = highlightedStackKey === "raider";

                          return (
                            <div
                              id="pack-stack-raider"
                              className={`group relative overflow-hidden rounded-2xl border-2 bg-gradient-to-b from-cyan-950/40 via-slate-900 to-slate-950 p-5 shadow-2xl transition-all duration-300 flex flex-col items-center text-center ${
                                isHighlighted
                                  ? "border-cyan-300 shadow-[0_0_45px_rgba(6,182,212,0.6)] ring-4 ring-cyan-400/50 scale-[1.03]"
                                  : "border-cyan-500/50 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]"
                              }`}
                            >
                              <div className="w-full flex items-center justify-between gap-2 mb-2">
                                <span className="inline-flex items-center gap-1 rounded-full shrink-0 px-3 py-1 font-mono text-xs font-black uppercase shadow-lg border bg-cyan-500/20 text-cyan-300 border-cyan-500/50 whitespace-nowrap animate-pulse">
                                  📦{" "}
                                  {raiderPacksCount === 1
                                    ? "1 Pack Ready"
                                    : `${raiderPacksCount} Packs Ready`}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleInspectPackByTier("pack_raider")}
                                  title="View Drop Rates & Pity Probabilities"
                                  className="flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-950/80 hover:bg-cyan-900 shrink-0 px-3 py-1 text-xs font-mono font-black text-cyan-300 whitespace-nowrap transition-all cursor-pointer shadow-sm active:scale-95 hover:border-cyan-400"
                                >
                                  <BarChart2 className="h-3 w-3" />
                                  <span>ODDS & RATES</span>
                                </button>
                              </div>

                              {/* 3D Chest with Floating Idle Animation & Aura */}
                              <div className="relative my-2 py-1 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl animate-aura-cyan pointer-events-none" />
                                <div className="animate-pack-idle relative z-10">
                                  <Pack3DChest
                                    packId="shop_pack_raider"
                                    rarity="common"
                                    size="lg"
                                    floating={false}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1 mb-3">
                                <h3 className="font-display text-lg font-black text-white group-hover:text-cyan-400 transition-colors">
                                  Raider Pack Stack
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed px-2">
                                  Standard Season 1 supply pack. Contains 3 gear pieces with
                                  anti-clustering.
                                </p>
                              </div>

                              {/* Progress Mini-Bars for Pity */}
                              <div className="w-full rounded-xl bg-black/60 border border-cyan-500/30 p-2.5 mb-3.5 space-y-2 text-left">
                                {/* Epic Pity Bar */}
                                <div>
                                  <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                                    <span className="text-purple-400 flex items-center gap-1">
                                      <Sparkles className="h-3 w-3" />
                                      {epicRem === 0
                                        ? "EPIC GUARANTEED NOW!"
                                        : `GUARANTEED EPIC IN ${epicRem} PACKS`}
                                    </span>
                                    <span className="text-slate-400 font-normal">
                                      {pity.epicPityCounter}/{pity.epicThreshold}
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                                    <div
                                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500 rounded-full"
                                      style={{ width: `${epicPct}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Legendary Pity Bar */}
                                <div>
                                  <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                                    <span className="text-amber-400 flex items-center gap-1">
                                      <Sparkles className="h-3 w-3" />
                                      {legRem === 0
                                        ? "LEGENDARY GUARANTEED NOW!"
                                        : `GUARANTEED LEGENDARY IN ${legRem} PACKS`}
                                    </span>
                                    <span className="text-slate-400 font-normal">
                                      {pity.legendaryPityCounter}/{pity.legendaryThreshold}
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                                    <div
                                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 rounded-full"
                                      style={{ width: `${legPct}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              <Button
                                onClick={() => handleOpenPackByTier("pack_raider")}
                                className="w-full mt-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider py-2.5 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] cursor-pointer rounded-xl"
                              >
                                <Unlock className="mr-1.5 h-3.5 w-3.5" /> OPEN PACK NOW
                              </Button>
                            </div>
                          );
                        })()}

                      {/* STACK 2: SPECIALIST PACK */}
                      {specialistPacksCount > 0 &&
                        (() => {
                          const pity = getPackPityCounters(player?.pityState, "pack_specialist");
                          const epicRem = Math.max(0, pity.epicThreshold - pity.epicPityCounter);
                          const legRem = Math.max(
                            0,
                            pity.legendaryThreshold - pity.legendaryPityCounter,
                          );
                          const epicPct = Math.min(
                            100,
                            Math.round((pity.epicPityCounter / pity.epicThreshold) * 100),
                          );
                          const legPct = Math.min(
                            100,
                            Math.round((pity.legendaryPityCounter / pity.legendaryThreshold) * 100),
                          );

                          const isHighlighted = highlightedStackKey === "specialist";

                          return (
                            <div
                              id="pack-stack-specialist"
                              onMouseEnter={() => audio.play("pack.inspect.epic")}
                              className={`group relative overflow-hidden rounded-2xl border-2 bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-950 p-5 shadow-2xl transition-all duration-300 flex flex-col items-center text-center ${
                                isHighlighted
                                  ? "border-purple-300 shadow-[0_0_45px_rgba(168,85,247,0.6)] ring-4 ring-purple-400/50 scale-[1.03]"
                                  : "border-purple-500/50 hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]"
                              }`}
                            >
                              <div className="w-full flex items-center justify-between gap-2 mb-2">
                                <span className="inline-flex items-center gap-1 rounded-full shrink-0 px-3 py-1 font-mono text-xs font-black uppercase shadow-lg border bg-purple-500/20 text-purple-300 border-purple-500/50 whitespace-nowrap animate-pulse">
                                  🎯{" "}
                                  {specialistPacksCount === 1
                                    ? "1 Pack Ready"
                                    : `${specialistPacksCount} Packs Ready`}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleInspectPackByTier("pack_specialist")}
                                  title="View Drop Rates & Pity Probabilities"
                                  className="flex items-center gap-1 rounded-lg border border-purple-500/40 bg-purple-950/80 hover:bg-purple-900 shrink-0 px-3 py-1 text-xs font-mono font-black text-purple-300 whitespace-nowrap transition-all cursor-pointer shadow-sm active:scale-95 hover:border-purple-400"
                                >
                                  <BarChart2 className="h-3 w-3" />
                                  <span>ODDS & RATES</span>
                                </button>
                              </div>

                              {/* 3D Chest with Floating Idle Animation & Purple Aura */}
                              <div className="relative my-2 py-1 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full bg-purple-500/10 blur-xl animate-aura-purple pointer-events-none" />
                                <div className="animate-pack-idle relative z-10">
                                  <Pack3DChest
                                    packId="shop_pack_specialist"
                                    rarity="epic"
                                    size="lg"
                                    floating={false}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1 mb-3">
                                <h3 className="font-display text-lg font-black text-white group-hover:text-purple-400 transition-colors">
                                  Specialist Pack Stack
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed px-2">
                                  Targeted set completion pack with +150% drop boost for missing set
                                  items.
                                </p>
                              </div>

                              {/* Progress Mini-Bars for Pity */}
                              <div className="w-full rounded-xl bg-black/60 border border-purple-500/30 p-2.5 mb-3.5 space-y-2 text-left">
                                {/* Epic Pity Bar */}
                                <div>
                                  <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                                    <span className="text-purple-400 flex items-center gap-1">
                                      <Sparkles className="h-3 w-3" />
                                      {epicRem === 0
                                        ? "EPIC GUARANTEED NOW!"
                                        : `GUARANTEED EPIC IN ${epicRem} PACKS`}
                                    </span>
                                    <span className="text-slate-400 font-normal">
                                      {pity.epicPityCounter}/{pity.epicThreshold}
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                                    <div
                                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500 rounded-full"
                                      style={{ width: `${epicPct}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Legendary Pity Bar */}
                                <div>
                                  <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                                    <span className="text-amber-400 flex items-center gap-1">
                                      <Sparkles className="h-3 w-3" />
                                      {legRem === 0
                                        ? "LEGENDARY GUARANTEED NOW!"
                                        : `GUARANTEED LEGENDARY IN ${legRem} PACKS`}
                                    </span>
                                    <span className="text-slate-400 font-normal">
                                      {pity.legendaryPityCounter}/{pity.legendaryThreshold}
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                                    <div
                                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 rounded-full"
                                      style={{ width: `${legPct}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              <Button
                                onClick={() => handleOpenPackByTier("pack_specialist")}
                                className="w-full mt-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider py-2.5 shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] cursor-pointer rounded-xl"
                              >
                                <Unlock className="mr-1.5 h-3.5 w-3.5" /> OPEN PACK NOW
                              </Button>
                            </div>
                          );
                        })()}

                      {/* STACK 3: LEGENDARY PACK */}
                      {legendaryPacksCount > 0 &&
                        (() => {
                          const pity = getPackPityCounters(
                            player?.pityState,
                            "pack_legendary_raider",
                          );
                          const legRem = Math.max(
                            0,
                            pity.legendaryThreshold - pity.legendaryPityCounter,
                          );
                          const legPct = Math.min(
                            100,
                            Math.round((pity.legendaryPityCounter / pity.legendaryThreshold) * 100),
                          );

                          const isHighlighted = highlightedStackKey === "legendary";

                          return (
                            <div
                              id="pack-stack-legendary"
                              onMouseEnter={() => audio.play("pack.inspect.legendary")}
                              className={`group relative overflow-hidden rounded-2xl border-2 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 p-5 shadow-2xl transition-all duration-300 flex flex-col items-center text-center ${
                                isHighlighted
                                  ? "border-amber-300 shadow-[0_0_45px_rgba(245,158,11,0.6)] ring-4 ring-amber-400/50 scale-[1.03]"
                                  : "border-amber-500/50 hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]"
                              }`}
                            >
                              <div className="w-full flex items-center justify-between gap-2 mb-2">
                                <span className="inline-flex items-center gap-1 rounded-full shrink-0 px-3 py-1 font-mono text-xs font-black uppercase shadow-lg border bg-amber-500/20 text-amber-300 border-amber-500/50 whitespace-nowrap animate-pulse">
                                  👑{" "}
                                  {legendaryPacksCount === 1
                                    ? "1 Pack Ready"
                                    : `${legendaryPacksCount} Packs Ready`}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleInspectPackByTier("pack_legendary_raider")}
                                  title="View Drop Rates & Pity Probabilities"
                                  className="flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-950/80 hover:bg-amber-900 shrink-0 px-3 py-1 text-xs font-mono font-black text-amber-300 whitespace-nowrap transition-all cursor-pointer shadow-sm active:scale-95 hover:border-amber-400"
                                >
                                  <BarChart2 className="h-3 w-3" />
                                  <span>ODDS & RATES</span>
                                </button>
                              </div>

                              {/* 3D Chest with Floating Idle Animation & Gold Aura */}
                              <div className="relative my-2 py-1 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl animate-aura-gold pointer-events-none" />
                                <div className="animate-pack-idle relative z-10">
                                  <Pack3DChest
                                    packId="shop_pack_legendary_raider"
                                    rarity="legendary"
                                    size="lg"
                                    floating={false}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1 mb-3">
                                <h3 className="font-display text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                                  Legendary Pack Stack
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed px-2">
                                  End-game chase pack with guaranteed Rare+ loot and mythic roll
                                  chances.
                                </p>
                              </div>

                              {/* Progress Mini-Bars for Pity */}
                              <div className="w-full rounded-xl bg-black/60 border border-amber-500/30 p-2.5 mb-3.5 space-y-2 text-left">
                                {/* Guaranteed Rare+ Tier Feature */}
                                <div className="flex items-center justify-between text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1 text-amber-300">
                                  <span className="flex items-center gap-1">
                                    <Sparkles className="h-3 w-3 text-amber-400" />
                                    RARE+ GUARANTEED
                                  </span>
                                  <span className="text-emerald-400 font-black uppercase text-[9px]">
                                    EVERY PULL
                                  </span>
                                </div>

                                {/* Legendary Pity Bar */}
                                <div>
                                  <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                                    <span className="text-amber-400 flex items-center gap-1">
                                      <Sparkles className="h-3 w-3" />
                                      {legRem === 0
                                        ? "LEGENDARY GUARANTEED NOW!"
                                        : `GUARANTEED LEGENDARY IN ${legRem} PACKS`}
                                    </span>
                                    <span className="text-slate-400 font-normal">
                                      {pity.legendaryPityCounter}/{pity.legendaryThreshold}
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                                    <div
                                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 rounded-full"
                                      style={{ width: `${legPct}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              <Button
                                onClick={() => handleOpenPackByTier("pack_legendary_raider")}
                                className="w-full mt-auto bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider py-2.5 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] cursor-pointer rounded-xl"
                              >
                                <Unlock className="mr-1.5 h-3.5 w-3.5" /> OPEN PACK NOW
                              </Button>
                            </div>
                          );
                        })()}
                    </div>
                  )}

                  {/* SHOP ACQUISITION CALLOUT */}
                  <div className="rounded-2xl border border-cyan-500/40 bg-slate-900/90 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-3 text-left">
                      <div className="h-10 w-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-display text-sm font-extrabold text-white">
                          {packs.length === 0
                            ? "No Unopened Packs Remaining in Stash"
                            : "Acquire More Supply Packs"}
                        </h4>
                        <p className="text-xs text-slate-400">
                          Spend community XP in the Raider Shop to store Raider, Specialist, or
                          Legendary Packs in your inventory.
                        </p>
                      </div>
                    </div>
                    <Link to="/shop" className="shrink-0 w-full sm:w-auto">
                      <Button className="w-full sm:w-auto font-mono text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 border border-amber-400/50 shadow-lg px-5 py-2.5 transition-all hover:scale-[1.02] cursor-pointer rounded-xl">
                        🛒 ACQUIRE PACKS IN RAIDER SHOP →
                      </Button>
                    </Link>
                  </div>
                </section>
              </div>
            )}

            {/* ========================================================================================= */}
            {/* VIEW B: PURE STATIC COLLECTION VAULT (NO ACTIVE UNBOXING CLUTTER)                          */}
            {/* ========================================================================================= */}
            {activeTab === "vault" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* 1. COMPACT COLLECTION VAULT HERO BANNER (REDUCED 60% HEIGHT, SINGLE ROW STATS COUNTER) */}
                <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-3 sm:p-4 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-amber-500/20 px-2 py-0.5 font-mono text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider text-amber-400 border border-amber-500/40">
                      VAULT
                    </span>
                    <h1 className="font-display text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                      COLLECTION VAULT
                    </h1>
                  </div>

                  {/* Compact Single-Row Stats Counter: [ Sets: 7 ] | [ Items: 2/86 Discovered ] */}
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-2.5 sm:px-3 py-1.5 shadow-inner">
                      <Award className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="text-slate-400 font-bold">Sets:</span>
                      <span className="font-black text-emerald-300">{sets.length}</span>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-2.5 sm:px-3 py-1.5 shadow-inner">
                      <Layers className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="text-slate-400 font-bold">Items:</span>
                      <span className="font-black text-amber-300">
                        {discoveredCount}/{totalCatalogCount} Discovered
                      </span>
                      <span className="text-amber-400/70 text-[10px] hidden xs:inline">
                        ({discoveryPercentage}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. LOCAL VIEWPORT SEGMENTED TOGGLE (ELIMINATE DUAL-PAGE SCROLLING) */}
                <div className="bg-slate-900/80 border border-amber-500/20 p-1 rounded-full flex gap-1 w-full max-w-xl mx-auto shadow-lg backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => {
                      audio.play("button.click");
                      setVaultSection("sets");
                    }}
                    className={`flex-1 shrink min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full font-mono text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer select-none active:scale-[0.98] whitespace-nowrap ${
                      vaultSection === "sets"
                        ? "bg-amber-400 text-black font-bold rounded-full shadow-md transition-all duration-200"
                        : "text-slate-400 hover:text-amber-200 px-3 sm:px-4 py-2 rounded-full"
                    }`}
                  >
                    <span className="text-sm shrink-0">🛡️</span>
                    <span className="truncate">SPECIALIST SETS</span>
                    <span
                      className={`ml-1 bg-black/30 px-2 py-0.5 rounded-full text-xs font-black shrink-0 ${
                        vaultSection === "sets" ? "text-black" : "text-slate-300"
                      }`}
                    >
                      {sets.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      audio.play("button.click");
                      setVaultSection("catalogue");
                    }}
                    className={`flex-1 shrink min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full font-mono text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer select-none active:scale-[0.98] whitespace-nowrap ${
                      vaultSection === "catalogue"
                        ? "bg-amber-400 text-black font-bold rounded-full shadow-md transition-all duration-200"
                        : "text-slate-400 hover:text-amber-200 px-3 sm:px-4 py-2 rounded-full"
                    }`}
                  >
                    <span className="text-sm shrink-0">🎒</span>
                    <span className="truncate">ALL CATALOGUE</span>
                    <span
                      className={`ml-1 bg-black/30 px-2 py-0.5 rounded-full text-xs font-black shrink-0 ${
                        vaultSection === "catalogue" ? "text-black" : "text-slate-300"
                      }`}
                    >
                      {totalCatalogCount}
                    </span>
                  </button>
                </div>

                {/* ========================================================================================= */}
                {/* SUB-VIEW 1: SPECIALIST SET PROGRESSION                                                    */}
                {/* ========================================================================================= */}
                {vaultSection === "sets" && (
                  <section className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-emerald-400" />
                        <h2 className="font-display text-base font-black uppercase tracking-wide text-white">
                          7 Specialist Equipment Sets
                        </h2>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Accordion Toggle: Expand All / Collapse All */}
                        <Button
                          type="button"
                          onClick={() => {
                            const allAreCollapsed = sets.every((s) =>
                              collapsedSets[s.name] !== undefined ? collapsedSets[s.name] : true,
                            );
                            if (allAreCollapsed) {
                              const map: Record<string, boolean> = {};
                              sets.forEach((s) => (map[s.name] = false));
                              setCollapsedSets(map);
                            } else {
                              const map: Record<string, boolean> = {};
                              sets.forEach((s) => (map[s.name] = true));
                              setCollapsedSets(map);
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="font-mono text-[11px] font-bold border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 cursor-pointer rounded-xl h-7.5 px-2.5"
                        >
                          {sets.every((s) =>
                            collapsedSets[s.name] !== undefined ? collapsedSets[s.name] : true,
                          ) ? (
                            <>
                              <ChevronDown className="mr-1 h-3 w-3 text-amber-400" />
                              Expand All
                            </>
                          ) : (
                            <>
                              <ChevronUp className="mr-1 h-3 w-3 text-amber-400" />
                              Collapse All
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Set Status Filter Tabs & Category Filter Chips */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                      {/* Set Status Tabs (Default to OWNED) */}
                      <div className="flex rounded-xl bg-slate-900 p-0.5 shrink-0 font-mono text-xs border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setSpecialistSetOwnershipTab("owned")}
                          className={`rounded-lg px-2.5 sm:px-3 py-1 font-black uppercase tracking-wider transition-all cursor-pointer ${
                            specialistSetOwnershipTab === "owned"
                              ? "bg-emerald-500 text-slate-950 shadow"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Owned ({ownedSetsCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setSpecialistSetOwnershipTab("locked")}
                          className={`rounded-lg px-2.5 sm:px-3 py-1 font-black uppercase tracking-wider transition-all cursor-pointer ${
                            specialistSetOwnershipTab === "locked"
                              ? "bg-emerald-500 text-slate-950 shadow"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Unowned / Locked ({lockedSetsCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setSpecialistSetOwnershipTab("all")}
                          className={`rounded-lg px-2.5 sm:px-3 py-1 font-black uppercase tracking-wider transition-all cursor-pointer ${
                            specialistSetOwnershipTab === "all"
                              ? "bg-emerald-500 text-slate-950 shadow"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          All Sets ({sets.length})
                        </button>
                      </div>

                      {/* Category Filter Chips */}
                      <div className="no-scrollbar flex overflow-x-auto gap-1.5 pb-1">
                        {setCategories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSetCategoryFilter(cat)}
                            className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-mono font-bold transition-all cursor-pointer ${
                              setCategoryFilter === cat
                                ? "bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                                : "border border-slate-800 bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Set Cards List (Sorted by highest completion % first) */}
                    {filteredAndSortedSets.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 shadow-inner">
                        <Award className="h-10 w-10 text-slate-600 opacity-50 mb-2" />
                        <h3 className="font-display text-sm font-bold text-white">
                          No Specialist Sets Found
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">
                          No equipment sets match your active status or category filter settings.
                        </p>
                        <Button
                          type="button"
                          onClick={() => {
                            setSpecialistSetOwnershipTab("all");
                            setSetCategoryFilter("All Sets");
                          }}
                          className="mt-3 font-mono text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer rounded-xl h-8"
                        >
                          Show All Sets
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredAndSortedSets.map((set) => {
                          const slotPairs = set.slotPairs;
                          const itemsDiscoveredCount = set.itemsDiscoveredCount;
                          const totalSetItems = set.totalSetItems;
                          const setPct = set.setPct;
                          const isComplete = set.isComplete;
                          const isCollapsed =
                            collapsedSets[set.name] !== undefined ? collapsedSets[set.name] : true;
                          const isBonusExpanded = !!expandedSetInfo[set.name];

                          const toggleCollapse = () => {
                            setCollapsedSets((prev) => ({
                              ...prev,
                              [set.name]: !(prev[set.name] !== undefined ? prev[set.name] : true),
                            }));
                          };

                          const toggleBonusInfo = (e: React.MouseEvent) => {
                            e.stopPropagation();
                            setExpandedSetInfo((prev) => ({
                              ...prev,
                              [set.name]: !prev[set.name],
                            }));
                          };

                          return (
                            <div
                              key={set.name}
                              className={`relative overflow-hidden rounded-2xl border bg-slate-900/90 p-3.5 sm:p-4 shadow-lg transition-all ${
                                isComplete
                                  ? "border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                                  : "border-slate-800 hover:border-emerald-500/40"
                              }`}
                            >
                              {/* COMPACT SUMMARY HEADER */}
                              <div
                                onClick={toggleCollapse}
                                className="flex items-center justify-between gap-2 cursor-pointer group select-none"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[9px] font-black uppercase text-emerald-400 border border-emerald-500/30 shrink-0">
                                    {set.category || "SPECIALIST"}
                                  </span>
                                  <h3 className="font-display text-sm sm:text-base font-black text-white truncate group-hover:text-amber-300 transition-colors">
                                    {set.name}
                                  </h3>
                                  {isComplete && (
                                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[8px] font-mono font-black text-emerald-300 border border-emerald-500/40 shrink-0 hidden xs:inline">
                                      MASTERED
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2.5 shrink-0">
                                  <span className="font-mono text-xs font-black text-emerald-400">
                                    {itemsDiscoveredCount}/{totalSetItems} ({setPct}%)
                                  </span>
                                  <div className="p-1 rounded-lg bg-slate-800 group-hover:bg-slate-700 transition text-amber-400">
                                    {isCollapsed ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronUp className="h-4 w-4" />
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* EXPANDED SET DETAILS */}
                              {!isCollapsed && (
                                <div className="mt-3.5 space-y-3 pt-3 border-t border-slate-800/80">
                                  {/* Progress Bar */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between font-mono text-[10px] font-bold text-slate-400">
                                      <span>Set Progress</span>
                                      <span>
                                        {itemsDiscoveredCount}/14 Collected ({setPct}%)
                                      </span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-950 border border-slate-800">
                                      <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          isComplete
                                            ? "bg-emerald-400 shadow-[0_0_10px_#34d399]"
                                            : "bg-gradient-to-r from-emerald-500 to-teal-400"
                                        }`}
                                        style={{ width: `${setPct}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Bonus Info Dropdown Toggle */}
                                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                                    <button
                                      type="button"
                                      onClick={toggleBonusInfo}
                                      className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-mono font-bold text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-900 transition cursor-pointer"
                                    >
                                      <span className="flex items-center gap-1.5 text-cyan-300">
                                        <Zap className="h-3 w-3 text-cyan-400" />
                                        <span>INFO & SET BONUSES</span>
                                      </span>
                                      <div className="flex items-center gap-1 text-[9px] text-slate-400">
                                        <span>{isBonusExpanded ? "Hide" : "Expand"}</span>
                                        <ChevronDown
                                          className={`h-3 w-3 transition-transform duration-200 ${
                                            isBonusExpanded ? "rotate-180 text-cyan-300" : ""
                                          }`}
                                        />
                                      </div>
                                    </button>

                                    {isBonusExpanded && (
                                      <div className="p-3 space-y-2 text-xs font-mono border-t border-slate-800/80 bg-slate-950/90">
                                        <p className="text-[11px] text-slate-400 leading-relaxed">
                                          {set.description}
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800/70 text-[10.5px]">
                                          <div className="flex items-center gap-1.5">
                                            <Zap className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                            <div>
                                              <span className="text-slate-400">Set Bonus: </span>
                                              <strong className="text-emerald-300">
                                                {set.bonusDescription || "+15% XP Boost"}
                                              </strong>
                                            </div>
                                          </div>
                                          {set.fullSetReward && (
                                            <div className="flex items-center gap-1.5">
                                              <Award className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                                              <div>
                                                <span className="text-slate-400">
                                                  Reward Title:{" "}
                                                </span>
                                                <strong className="text-amber-300">
                                                  {set.fullSetReward}
                                                </strong>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* 7 Gear Slot Micro-Cards (Clean and Uncluttered) */}
                                  <div className="space-y-1.5">
                                    <div className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                                      <span>7 Equipment Slots (Tap slot to inspect variants)</span>
                                      <span className="text-cyan-400">Var A / Var B</span>
                                    </div>

                                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                                      {slotPairs.map((pair, idx) => {
                                        const slotUnlockedCount =
                                          (pair.isVarAOwned ? 1 : 0) + (pair.isVarBOwned ? 1 : 0);
                                        const isSlotFullyMastered = slotUnlockedCount === 2;
                                        const isSlotPartial = slotUnlockedCount === 1;

                                        return (
                                          <div
                                            key={`${set.name}_slot_${pair.slotDef.slot}_${idx}`}
                                            onClick={() =>
                                              setInspectingSlot({
                                                setName: set.name,
                                                slotDef: pair.slotDef,
                                                varA: pair.varA as unknown as Item,
                                                varB: pair.varB as unknown as Item,
                                                isVarAOwned: pair.isVarAOwned,
                                                isVarBOwned: pair.isVarBOwned,
                                              })
                                            }
                                            role="button"
                                            tabIndex={0}
                                            className={`rounded-xl border p-2.5 flex flex-col items-center justify-between text-center cursor-pointer transition-all active:scale-95 shadow-sm min-h-[90px] select-none ${
                                              isSlotFullyMastered
                                                ? "border-emerald-500/60 bg-emerald-950/20 hover:border-emerald-400"
                                                : isSlotPartial
                                                  ? "border-amber-500/50 bg-amber-950/20 hover:border-amber-400"
                                                  : "border-slate-800 bg-slate-950/80 opacity-70 hover:opacity-100 hover:border-slate-600"
                                            }`}
                                          >
                                            <div className="text-2xl mb-1">{pair.slotDef.icon}</div>
                                            <div className="font-display text-[11px] font-bold text-white truncate w-full">
                                              {pair.slotDef.label}
                                            </div>
                                            <div className="mt-1">
                                              {isSlotFullyMastered ? (
                                                <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/20 px-1.5 py-0.2 text-[8.5px] font-mono font-black text-emerald-300 border border-emerald-500/40">
                                                  <Check className="h-2.5 w-2.5" /> 2/2
                                                </span>
                                              ) : isSlotPartial ? (
                                                <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/20 px-1.5 py-0.2 text-[8.5px] font-mono font-black text-amber-300 border border-amber-500/40">
                                                  1/2
                                                </span>
                                              ) : (
                                                <span className="inline-flex items-center gap-0.5 rounded bg-slate-800 px-1.5 py-0.2 text-[8.5px] font-mono font-bold text-slate-400">
                                                  <Lock className="h-2.5 w-2.5" /> 0/2
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                )}

                {/* ========================================================================================= */}
                {/* SUB-VIEW 2: ITEM COLLECTION CATALOGUE (86 ITEMS)                                          */}
                {/* ========================================================================================= */}
                {vaultSection === "catalogue" && (
                  <section className="space-y-4 animate-in fade-in duration-200">
                    {/* TOOLBAR */}
                    <div className="sticky top-14 sm:top-14 z-30 -mx-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl border border-amber-500/30 bg-slate-950/95 backdrop-blur-md shadow-2xl space-y-2.5">
                      {/* Row 1: Filter Pills (OWNED, UNOWNED / LOCKED, ALL ITEMS) + Search Bar + View Mode */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                        <div className="flex rounded-xl bg-slate-900 p-0.5 shrink-0 font-mono text-xs border border-slate-800">
                          {/* 1. OWNED (DEFAULT ACTIVE TAB) */}
                          <button
                            type="button"
                            onClick={() => setOwnershipTab("owned")}
                            className={`rounded-lg px-2.5 sm:px-3 py-1 font-black uppercase tracking-wider transition-all cursor-pointer ${
                              ownershipTab === "owned"
                                ? "bg-amber-400 text-slate-950 shadow"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            Owned ({discoveredCount})
                          </button>
                          {/* 2. UNOWNED / LOCKED */}
                          <button
                            type="button"
                            onClick={() => setOwnershipTab("locked")}
                            className={`rounded-lg px-2.5 sm:px-3 py-1 font-black uppercase tracking-wider transition-all cursor-pointer ${
                              ownershipTab === "locked"
                                ? "bg-amber-400 text-slate-950 shadow"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            Unowned / Locked ({totalCatalogCount - discoveredCount})
                          </button>
                          {/* 3. ALL ITEMS */}
                          <button
                            type="button"
                            onClick={() => setOwnershipTab("all")}
                            className={`rounded-lg px-2.5 sm:px-3 py-1 font-black uppercase tracking-wider transition-all cursor-pointer ${
                              ownershipTab === "all"
                                ? "bg-amber-400 text-slate-950 shadow"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            All Items ({totalCatalogCount})
                          </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-md">
                          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                          <Input
                            placeholder="Search 86 items by name, slot, or set..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8.5 text-xs h-8.5 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 font-mono focus:border-amber-400"
                          />
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 p-0.5 shrink-0 self-end md:self-auto">
                          <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={`rounded-lg p-1 transition cursor-pointer ${
                              viewMode === "grid"
                                ? "bg-slate-800 text-white shadow"
                                : "text-slate-400"
                            }`}
                            title="Grid View"
                          >
                            <Grid className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewMode("list")}
                            className={`rounded-lg p-1 transition cursor-pointer ${
                              viewMode === "list"
                                ? "bg-slate-800 text-white shadow"
                                : "text-slate-400"
                            }`}
                            title="List View"
                          >
                            <List className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Row 2: Slot Filter Pills + Rarity / Sort Dropdowns */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="no-scrollbar flex gap-1 overflow-x-auto pb-1 max-w-full font-mono touch-pan-x">
                          {slotTabs.map((tab) => {
                            const active = slotFilter === tab.id;
                            return (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => setSlotFilter(tab.id)}
                                className={`flex shrink-0 items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer select-none active:scale-95 ${
                                  active
                                    ? "bg-amber-400 text-slate-950 shadow-md"
                                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`}
                              >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 font-mono">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7.5 text-[11px] font-bold bg-slate-900 border-slate-800 hover:border-amber-400/50 text-white cursor-pointer active:scale-95 transition-transform px-2"
                              >
                                <Filter className="mr-1 h-3 w-3 text-amber-400" />
                                Rarity:{" "}
                                {rarityFilter === "all"
                                  ? "All"
                                  : rarityLabel[rarityFilter as Rarity]}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-slate-900 border-slate-800"
                            >
                              <DropdownMenuItem onClick={() => setRarityFilter("all")}>
                                All Rarities
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setRarityFilter("common")}>
                                Common
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setRarityFilter("uncommon")}>
                                Uncommon
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setRarityFilter("rare")}>
                                Rare
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setRarityFilter("epic")}>
                                Epic
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setRarityFilter("legendary")}>
                                Legendary
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setRarityFilter("mythic")}>
                                Mythic
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7.5 text-[11px] font-bold bg-slate-900 border-slate-800 hover:border-cyan-400/50 text-white cursor-pointer active:scale-95 transition-transform px-2"
                              >
                                <ArrowUpDown className="mr-1 h-3 w-3 text-cyan-400" />
                                Sort: {sortBy.toUpperCase()}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-slate-900 border-slate-800"
                            >
                              <DropdownMenuItem onClick={() => setSortBy("rarity")}>
                                Rarity (High to Low)
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSortBy("level")}>
                                Item Level
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSortBy("name")}>
                                Item Name
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSortBy("set")}>
                                Specialist Set
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>

                    {/* CATALOGUE COMPACT 3-COLUMN MICRO-CARD GRID */}
                    {filteredVaultItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 shadow-inner">
                        <Package className="h-10 w-10 text-slate-600 opacity-50 mb-2" />
                        <h3 className="font-display text-sm font-bold text-white">
                          No Items Found
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">
                          No equipment cards match your active filter settings.
                        </p>
                        <Button
                          onClick={() => {
                            setOwnershipTab("all");
                            setSlotFilter("all");
                            setRarityFilter("all");
                            setSearch("");
                          }}
                          className="mt-3 font-mono text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer rounded-xl h-8"
                        >
                          Reset Filters
                        </Button>
                      </div>
                    ) : viewMode === "grid" ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-2.5">
                        {filteredVaultItems.map((item) => {
                          const borderClass = rarityBorderClass[item.rarity];
                          const textClass = rarityTextClass[item.rarity];

                          return (
                            <div
                              key={item.id}
                              onClick={() => setInspectingItem(item)}
                              role="button"
                              tabIndex={0}
                              className={`group relative flex flex-col justify-between rounded-xl border-2 bg-slate-900/90 p-2 sm:p-2.5 min-h-[115px] sm:min-h-[135px] select-none transition-all duration-150 cursor-pointer shadow-md hover:scale-[1.03] active:scale-[0.96] ${
                                item.isOwned
                                  ? `${borderClass} hover:shadow-[0_0_15px_rgba(6,182,212,0.25)]`
                                  : "border-slate-800 bg-slate-950/80 opacity-65 hover:opacity-100 hover:border-slate-600"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="font-mono text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-950/80 px-1 py-0.2 rounded border border-slate-800 truncate max-w-[60px]">
                                  {item.slot}
                                </span>

                                {item.isOwned ? (
                                  <span className="inline-flex items-center rounded-full bg-emerald-500/20 p-0.5 text-emerald-300">
                                    <Check className="h-2.5 w-2.5" />
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-full bg-slate-800/80 p-0.5 text-slate-500">
                                    <Lock className="h-2.5 w-2.5" />
                                  </span>
                                )}
                              </div>

                              <div className="my-1 flex justify-center text-3xl sm:text-4xl drop-shadow-md group-hover:scale-110 transition-transform">
                                {isImageUrl(item.image) ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  item.image
                                )}
                              </div>

                              <div className="mt-auto space-y-0.5">
                                <h4 className="font-display text-[10px] sm:text-[11px] font-extrabold text-slate-100 leading-tight truncate group-hover:text-amber-300">
                                  {item.name}
                                </h4>

                                <div className="flex items-center justify-between text-[8.5px] sm:text-[9.5px] font-mono">
                                  <span className={`font-bold uppercase ${textClass}`}>
                                    {rarityLabel[item.rarity]}
                                  </span>
                                  {item.duplicateCount > 1 && (
                                    <span className="rounded bg-amber-500/20 px-1 text-[8px] font-bold text-amber-300">
                                      x{item.duplicateCount}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {filteredVaultItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setInspectingItem(item)}
                            role="button"
                            tabIndex={0}
                            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 min-h-[50px] hover:bg-slate-800 cursor-pointer select-none transition-all duration-150 active:scale-[0.98]"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {isImageUrl(item.image) ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-7 w-7 sm:h-8 sm:w-8 object-contain shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span className="text-2xl shrink-0">{item.image}</span>
                              )}
                              <div className="min-w-0">
                                <h4 className="font-display text-xs font-extrabold text-slate-100 leading-tight truncate">
                                  {item.name}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                                  <span className={rarityTextClass[item.rarity]}>
                                    {rarityLabel[item.rarity]}
                                  </span>
                                  <span>•</span>
                                  <span className="uppercase">{item.slot}</span>
                                  {item.set && (
                                    <>
                                      <span>•</span>
                                      <span className="text-amber-400 truncate">{item.set}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {item.isOwned ? (
                                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10.5px] font-mono font-black text-emerald-300 border border-emerald-500/30">
                                  <Check className="h-2.5 w-2.5" /> UNLOCKED
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10.5px] font-mono font-bold text-slate-400 border border-slate-700">
                                  <Lock className="h-2.5 w-2.5" /> LOCKED
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </div>
            )}
          </div>

          {/* MODAL: GEAR SLOT VARIANT INSPECTOR */}
          {inspectingSlot && (
            <div
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 pb-24 overflow-y-auto"
              onClick={() => setInspectingSlot(null)}
            >
              <div
                className="relative w-full max-w-md bg-slate-950 border-2 border-cyan-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-5 pb-8 shadow-2xl space-y-3.5 max-h-[85vh] overflow-y-auto custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setInspectingSlot(null)}
                  className="absolute right-3 top-3 z-20 rounded-full bg-slate-900 border border-slate-700 p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Modal Header */}
                <div className="border-b border-slate-800 pb-2.5 pr-8">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{inspectingSlot.slotDef.icon}</span>
                    <div>
                      <div className="font-mono text-[9px] font-black uppercase text-cyan-400">
                        {inspectingSlot.setName}
                      </div>
                      <h3 className="font-display text-base font-black text-white">
                        {inspectingSlot.slotDef.label} Slot Variants
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Variants List */}
                <div className="space-y-2.5">
                  {/* Variant A */}
                  <div
                    className={`rounded-xl border-2 p-3 transition-all ${
                      inspectingSlot.isVarAOwned
                        ? `${rarityBorderClass[inspectingSlot.varA.rarity || "rare"]} bg-slate-900/90`
                        : "border-slate-800 bg-slate-950/80 opacity-85"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-900 border border-slate-700 text-2xl shrink-0 overflow-hidden">
                          {isImageUrl(inspectingSlot.varA.image) ? (
                            <img
                              src={inspectingSlot.varA.image}
                              alt={inspectingSlot.varA.name}
                              className="h-full w-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            inspectingSlot.varA.image
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-mono text-[8.5px] font-black uppercase text-slate-400">
                            VARIANT A
                          </div>
                          <h4 className="font-display text-xs sm:text-sm font-bold text-white truncate">
                            {inspectingSlot.varA.name}
                          </h4>
                          <div className="font-mono text-[9.5px] font-bold text-amber-400">
                            {rarityLabel[inspectingSlot.varA.rarity || "rare"]} •{" "}
                            {inspectingSlot.slotDef.label}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {inspectingSlot.isVarAOwned ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-mono font-black text-emerald-300 border border-emerald-500/40">
                            <Check className="h-2.5 w-2.5" /> UNLOCKED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[9px] font-mono font-bold text-slate-400 border border-slate-700">
                            <Lock className="h-2.5 w-2.5" /> LOCKED
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          setInspectingSlot(null);
                          setInspectingItem(inspectingSlot.varA);
                        }}
                        size="sm"
                        className="flex-1 font-mono text-[10px] font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer h-7.5 rounded-lg"
                      >
                        Inspect Stats
                      </Button>
                      {!inspectingSlot.isVarAOwned && (
                        <Link to="/shop" onClick={() => setInspectingSlot(null)} className="flex-1">
                          <Button
                            size="sm"
                            className="w-full font-mono text-[10px] font-black uppercase tracking-wider bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 cursor-pointer h-7.5 rounded-lg"
                          >
                            Find in Packs →
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Variant B */}
                  <div
                    className={`rounded-xl border-2 p-3 transition-all ${
                      inspectingSlot.isVarBOwned
                        ? `${rarityBorderClass[inspectingSlot.varB.rarity || "epic"]} bg-slate-900/90`
                        : "border-slate-800 bg-slate-950/80 opacity-85"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-900 border border-slate-700 text-2xl shrink-0 overflow-hidden">
                          {isImageUrl(inspectingSlot.varB.image) ? (
                            <img
                              src={inspectingSlot.varB.image}
                              alt={inspectingSlot.varB.name}
                              className="h-full w-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            inspectingSlot.varB.image
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-mono text-[8.5px] font-black uppercase text-slate-400">
                            VARIANT B
                          </div>
                          <h4 className="font-display text-xs sm:text-sm font-bold text-white truncate">
                            {inspectingSlot.varB.name}
                          </h4>
                          <div className="font-mono text-[9.5px] font-bold text-purple-400">
                            {rarityLabel[inspectingSlot.varB.rarity || "epic"]} •{" "}
                            {inspectingSlot.slotDef.label}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {inspectingSlot.isVarBOwned ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-mono font-black text-emerald-300 border border-emerald-500/40">
                            <Check className="h-2.5 w-2.5" /> UNLOCKED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[9px] font-mono font-bold text-slate-400 border border-slate-700">
                            <Lock className="h-2.5 w-2.5" /> LOCKED
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          setInspectingSlot(null);
                          setInspectingItem(inspectingSlot.varB);
                        }}
                        size="sm"
                        className="flex-1 font-mono text-[10px] font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer h-7.5 rounded-lg"
                      >
                        Inspect Stats
                      </Button>
                      {!inspectingSlot.isVarBOwned && (
                        <Link to="/shop" onClick={() => setInspectingSlot(null)} className="flex-1">
                          <Button
                            size="sm"
                            className="w-full font-mono text-[10px] font-black uppercase tracking-wider bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 cursor-pointer h-7.5 rounded-lg"
                          >
                            Find in Packs →
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setInspectingSlot(null)}
                  className="w-full font-mono text-xs font-bold text-slate-400 hover:text-white border border-slate-800 mt-2 h-7.5 rounded-xl cursor-pointer"
                >
                  CLOSE
                </Button>
              </div>
            </div>
          )}

          {/* MODAL: PACK OPENING FLOW */}
          <PackOpeningModal
            pack={selectedPack}
            open={!!selectedPack}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedPack(null);
                setIsBatchOpening(false);
                setBatchPacksList([]);
              }
            }}
            isBatch={isBatchOpening}
            batchPacks={batchPacksList}
            batchPacksCount={batchPacksList.length}
            directOpen={true}
            onFinished={() => {
              fetchVaultCatalogPayload().then((payload) => {
                setCatalogPayload(payload);
              });
            }}
          />

          {/* MODAL: PACK DETAILS & DROP RATES */}
          <PackDetailsModal
            pack={infoPack}
            open={!!infoPack}
            onOpenChange={(open) => !open && setInfoPack(null)}
            onOpen={() => {
              if (!infoPack) return;
              const p = infoPack;
              setInfoPack(null);
              setIsBatchOpening(false);
              setBatchPacksList([]);
              setSelectedPack(p);
            }}
          />

          {/* MODAL: ITEM DETAILS / INSPECTION */}
          <ItemDetailsModal
            item={inspectingItem}
            open={!!inspectingItem}
            onOpenChange={(open) => !open && setInspectingItem(null)}
          />
        </ArmorySwipeContainer>
      </div>
    </AppShell>
  );
}

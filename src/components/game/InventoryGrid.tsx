import { useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { EquipmentSlot, Item, Rarity } from "@/types/game";
import { rarityBorderClass, rarityLabel, rarityTextClass } from "@/lib/rarity";
import { getSetInfoForItem } from "@/lib/sets";
import { useGameStore } from "@/store/gameStore";
import { ItemDetailsModal } from "./ItemDetailsModal";
import { isImageUrl } from "./RaiderAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  ArrowUpDown,
  Grid,
  List,
  Check,
  X,
  Lock,
  Star,
  Hammer,
  ArrowRightLeft,
  Eye,
  Layers,
  Sparkles,
  Package,
} from "lucide-react";

export function InventoryGrid({
  items,
  equippedIds = [],
}: {
  items: Item[];
  equippedIds?: string[];
}) {
  const navigate = useNavigate();
  const player = useGameStore((s) => s.player);
  const equipItem = useGameStore((s) => s.equipItem);
  const unequipSlot = useGameStore((s) => s.unequipSlot);

  // Filters & Sorting state
  const [slotFilter, setSlotFilter] = useState<string>("all");
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rarity" | "level" | "name" | "set">("rarity");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Selection & Lock / Favorite state
  const [inspectingItem, setInspectingItem] = useState<Item | null>(null);
  const [comparingItem, setComparingItem] = useState<Item | null>(null);
  const [lockedItemIds, setLockedItemIds] = useState<Set<string>>(new Set());
  const [favoriteItemIds, setFavoriteItemIds] = useState<Set<string>>(
    new Set(player?.favoriteItemId ? [player.favoriteItemId] : []),
  );
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Count duplicates
  const itemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const it of items) {
      counts[it.id] = (counts[it.id] || 0) + 1;
    }
    return counts;
  }, [items]);

  // Unique list of items with duplicate count attached
  const uniqueItems = useMemo(() => {
    const seen = new Set<string>();
    const list: Item[] = [];
    for (const item of items) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        list.push(item);
      }
    }
    return list;
  }, [items]);

  // Filter & Sort
  const filteredItems = useMemo(() => {
    return uniqueItems
      .filter((item) => {
        // Search filter
        if (
          search &&
          !item.name.toLowerCase().includes(search.toLowerCase()) &&
          !(item.set && item.set.toLowerCase().includes(search.toLowerCase()))
        ) {
          return false;
        }

        // Slot filter
        if (slotFilter !== "all") {
          if (slotFilter === "duplicates") {
            if ((itemCounts[item.id] ?? 0) <= 1) return false;
          } else if (slotFilter === "favorites") {
            if (!favoriteItemIds.has(item.id)) return false;
          } else if (slotFilter === "locked") {
            if (!lockedItemIds.has(item.id)) return false;
          } else if (item.slot !== slotFilter) {
            return false;
          }
        }

        // Rarity filter
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
    uniqueItems,
    search,
    slotFilter,
    rarityFilter,
    sortBy,
    itemCounts,
    favoriteItemIds,
    lockedItemIds,
  ]);

  const toggleLock = (itemId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLockedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const toggleFavorite = (itemId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavoriteItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const toggleSelect = (itemId: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const slotTabs: Array<{ id: string; label: string; icon: string }> = [
    { id: "all", label: "All Items", icon: "📦" },
    { id: "hat", label: "Hats", icon: "🎩" },
    { id: "top", label: "Tops", icon: "👕" },
    { id: "trousers", label: "Trousers", icon: "👖" },
    { id: "socks", label: "Socks", icon: "🧦" },
    { id: "cape", label: "Capes", icon: "🦸" },
    { id: "pet", label: "Pets", icon: "🐾" },
    { id: "power", label: "Powers", icon: "⚡" },
    { id: "duplicates", label: "Duplicates", icon: "♻️" },
    { id: "favorites", label: "Favorites", icon: "⭐" },
  ];

  return (
    <div className="space-y-4">
      {/* Control Bar: Slot Filters, Search, Sort, View Toggle */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        {/* Slot Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {slotTabs.map((tab) => {
            const active = slotFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSlotFilter(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow"
                    : "bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter / Sort / Search controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/60">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by item name or set..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Rarity Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs font-semibold">
                  <Filter className="mr-1.5 h-3.5 w-3.5" />
                  Rarity: {rarityFilter === "all" ? "All" : rarityLabel[rarityFilter as Rarity]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-surface-1">
                <DropdownMenuItem onClick={() => setRarityFilter("all")}>
                  All Rarities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRarityFilter("common")}>
                  Common
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRarityFilter("uncommon")}>
                  Uncommon
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRarityFilter("rare")}>Rare</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRarityFilter("epic")}>Epic</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRarityFilter("legendary")}>
                  Legendary
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRarityFilter("mythic")}>
                  Mythic
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs font-semibold">
                  <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
                  Sort: {sortBy.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-surface-1">
                <DropdownMenuItem onClick={() => setSortBy("rarity")}>
                  Rarity (High to Low)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("level")}>Item Level</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name")}>Item Name</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("set")}>Specialist Set</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-border bg-surface-2 p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-md p-1.5 ${viewMode === "grid" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-md p-1.5 ${viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Items Count Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div>
          Showing <span className="font-bold text-foreground">{filteredItems.length}</span> unique
          items ({items.length} total in vault)
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/forge"
            className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <Hammer className="h-3.5 w-3.5" /> Open Forge to fuse duplicates
          </Link>
        </div>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-border bg-surface-1/40 p-8">
          <Package className="h-12 w-12 text-muted-foreground opacity-50 mb-3" />
          <h3 className="font-display text-base font-bold">No Items Match Filter</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Try resetting your search or filter options to browse all owned Raider gear.
          </p>
          <Button
            onClick={() => {
              setSlotFilter("all");
              setRarityFilter("all");
              setSearch("");
            }}
            variant="outline"
            size="sm"
            className="mt-4 text-xs"
          >
            Reset Filters
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredItems.map((item, idx) => {
            const isEquipped =
              player?.equipped[item.slot] === item.id || equippedIds.includes(item.id);
            const count = itemCounts[item.id] ?? 1;
            const isFavorite = favoriteItemIds.has(item.id);
            const isLocked = lockedItemIds.has(item.id);

            return (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => setInspectingItem(item)}
                className={`group relative flex flex-col justify-between rounded-xl border-2 bg-card p-3 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl ${rarityBorderClass[item.rarity]}`}
              >
                {/* Header status tags */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider ${rarityTextClass[item.rarity]}`}
                  >
                    {rarityLabel[item.rarity]}
                  </span>
                  <div className="flex items-center gap-1">
                    {isLocked && <Lock className="h-3 w-3 text-amber-400" />}
                    {isFavorite && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                    {isEquipped && (
                      <span className="rounded bg-primary px-1.5 py-0.5 text-[8px] font-bold uppercase text-primary-foreground shadow">
                        Equipped
                      </span>
                    )}
                  </div>
                </div>

                {/* Artwork */}
                <div className="relative my-1 grid h-20 w-full place-items-center rounded-lg bg-surface-3 text-4xl shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
                  {isImageUrl(item.image) ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    item.image
                  )}
                  {count > 1 && (
                    <span className="absolute bottom-1 right-1 rounded-md bg-amber-500/90 px-1.5 py-0.5 font-mono text-[9px] font-bold text-black shadow">
                      ×{count}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="mt-2 min-w-0">
                  <h4 className="font-display text-xs font-bold truncate text-foreground">
                    {item.name}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
                    <span className="uppercase font-mono">{item.slot}</span>
                    <span className="font-mono text-primary font-bold">Lv {item.level ?? 1}</span>
                  </div>
                  {item.set && (
                    <div className="text-[9px] text-accent font-semibold truncate mt-0.5">
                      {item.set}
                    </div>
                  )}
                </div>

                {/* Quick actions overlay footer */}
                <div className="mt-3 border-t border-border/40 pt-2 flex items-center justify-between">
                  <button
                    onClick={(e) => toggleFavorite(item.id, e)}
                    className="p-1 text-muted-foreground hover:text-amber-400 transition"
                    title="Toggle Favorite"
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${isFavorite ? "fill-amber-400 text-amber-400" : ""}`}
                    />
                  </button>
                  <button
                    onClick={(e) => toggleLock(item.id, e)}
                    className="p-1 text-muted-foreground hover:text-amber-400 transition"
                    title="Toggle Lock"
                  >
                    <Lock className={`h-3.5 w-3.5 ${isLocked ? "text-amber-400" : ""}`} />
                  </button>
                  <Button
                    size="sm"
                    variant={isEquipped ? "secondary" : "default"}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isEquipped) unequipSlot(item.slot);
                      else equipItem(item.slot, item.id);
                    }}
                    className="h-6 px-2 text-[9px] font-bold uppercase tracking-wider"
                  >
                    {isEquipped ? "Unequip" : "Equip"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-2">
          {filteredItems.map((item, idx) => {
            const isEquipped =
              player?.equipped[item.slot] === item.id || equippedIds.includes(item.id);
            const count = itemCounts[item.id] ?? 1;
            const isFavorite = favoriteItemIds.has(item.id);
            const isLocked = lockedItemIds.has(item.id);

            return (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => setInspectingItem(item)}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border-2 bg-card p-3 cursor-pointer transition-all hover:bg-surface-2/60 ${rarityBorderClass[item.rarity]}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-surface-3 text-2xl border border-border/60 overflow-hidden">
                    {isImageUrl(item.image) ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      item.image
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-sm font-bold truncate">{item.name}</h4>
                      {isEquipped && (
                        <span className="rounded bg-primary px-1.5 py-0.5 text-[8px] font-bold uppercase text-primary-foreground">
                          Equipped
                        </span>
                      )}
                      {count > 1 && (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">
                          ×{count} Copies
                        </span>
                      )}
                    </div>

                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px]">
                      <span className={`font-bold uppercase ${rarityTextClass[item.rarity]}`}>
                        {rarityLabel[item.rarity]}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="font-mono text-muted-foreground uppercase">{item.slot}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="font-mono text-primary font-bold">
                        Level {item.level ?? 1}
                      </span>
                      {item.set && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-accent font-semibold">{item.set}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => toggleFavorite(item.id, e)}
                    className="p-1 text-muted-foreground hover:text-amber-400"
                  >
                    <Star
                      className={`h-4 w-4 ${isFavorite ? "fill-amber-400 text-amber-400" : ""}`}
                    />
                  </button>
                  <button
                    onClick={(e) => toggleLock(item.id, e)}
                    className="p-1 text-muted-foreground hover:text-amber-400"
                  >
                    <Lock className={`h-4 w-4 ${isLocked ? "text-amber-400" : ""}`} />
                  </button>
                  <Button
                    size="sm"
                    variant={isEquipped ? "secondary" : "default"}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isEquipped) unequipSlot(item.slot);
                      else equipItem(item.slot, item.id);
                    }}
                    className="h-8 font-bold uppercase text-xs"
                  >
                    {isEquipped ? "Unequip" : "Equip"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspecting Item Details Modal */}
      {inspectingItem && (
        <ItemDetailsModal item={inspectingItem} onClose={() => setInspectingItem(null)} />
      )}
    </div>
  );
}

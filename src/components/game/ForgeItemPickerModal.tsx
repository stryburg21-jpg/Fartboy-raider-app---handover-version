import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGameStore } from "@/store/gameStore";
import { audio } from "@/services/audio";
import type { EquipmentSlot, Item, Rarity } from "@/types/game";
import { RarityBadge } from "./RarityBadge";
import { isImageUrl } from "./RaiderAvatar";
import { Search, Check, Package, Anvil, Filter, ShieldAlert } from "lucide-react";

export interface ForgeItemPickerModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  onSelectItem: (item: Item) => void;
  selectedItemId?: string | null;
  items?: Item[];
  filterDismantlableOnly?: boolean;
}

const SLOT_FILTERS: { id: EquipmentSlot | "all"; label: string; icon: string }[] = [
  { id: "all", label: "All Gear", icon: "🎒" },
  { id: "head", label: "Hat", icon: "🎩" },
  { id: "body", label: "Top", icon: "👕" },
  { id: "shorts", label: "Shorts", icon: "🩳" },
  { id: "feet", label: "Boots", icon: "🥾" },
  { id: "back", label: "Cape", icon: "🦸" },
  { id: "pet", label: "Pet", icon: "🐾" },
  { id: "powerItem", label: "Specialist Item", icon: "⚡" },
];

const RARITY_FILTERS: { id: Rarity | "all"; label: string }[] = [
  { id: "all", label: "All Rarities" },
  { id: "common", label: "Common" },
  { id: "uncommon", label: "Uncommon" },
  { id: "rare", label: "Rare" },
  { id: "epic", label: "Epic" },
  { id: "legendary", label: "Legendary" },
  { id: "mythic", label: "Mythic" },
];

const itemRarityCardTheme: Record<
  Rarity,
  { border: string; glow: string; text: string; bg: string }
> = {
  common: {
    border: "border-slate-500/50",
    glow: "hover:shadow-[0_0_15px_rgba(148,163,184,0.3)] hover:border-slate-400",
    text: "text-slate-300",
    bg: "bg-slate-950/80",
  },
  uncommon: {
    border: "border-emerald-500/60",
    glow: "hover:shadow-[0_0_20px_rgba(52,211,153,0.35)] hover:border-emerald-400",
    text: "text-emerald-300",
    bg: "bg-emerald-950/20",
  },
  rare: {
    border: "border-sky-400/70",
    glow: "hover:shadow-[0_0_22px_rgba(56,189,248,0.4)] hover:border-sky-300",
    text: "text-sky-300",
    bg: "bg-sky-950/20",
  },
  epic: {
    border: "border-purple-400/80",
    glow: "hover:shadow-[0_0_25px_rgba(192,132,252,0.45)] hover:border-purple-300",
    text: "text-purple-300",
    bg: "bg-purple-950/25",
  },
  legendary: {
    border: "border-amber-400/80",
    glow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:border-amber-300",
    text: "text-amber-300",
    bg: "bg-amber-950/30",
  },
  mythic: {
    border: "border-rose-400",
    glow: "hover:shadow-[0_0_35px_rgba(244,63,94,0.6)] hover:border-rose-300",
    text: "text-rose-300",
    bg: "bg-rose-950/30",
  },
};

export function ForgeItemPickerModal({
  open,
  isOpen,
  onClose,
  onSelectItem,
  selectedItemId,
  items: itemsProp,
  filterDismantlableOnly = false,
}: ForgeItemPickerModalProps) {
  const storeInventory = useGameStore((s) => s.inventory);
  const player = useGameStore((s) => s.player);

  const inventory = itemsProp && itemsProp.length > 0 ? itemsProp : storeInventory;
  const isModalOpen = open ?? isOpen ?? false;

  const [search, setSearch] = useState("");
  const [slotFilter, setSlotFilter] = useState<EquipmentSlot | "all">("all");
  const [rarityFilter, setRarityFilter] = useState<Rarity | "all">("all");

  // Deduplicate items for selection display
  const uniqueItems = inventory.filter(
    (item, index, self) => self.findIndex((i) => i.id === item.id) === index,
  );

  const filteredItems = uniqueItems.filter((item) => {
    const isEquipped = item.equipped || Object.values(player?.equipped ?? {}).includes(item.id);
    if (filterDismantlableOnly && isEquipped) return false;

    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.set && item.set.toLowerCase().includes(search.toLowerCase()));
    const matchesSlot = slotFilter === "all" || item.slot === slotFilter;
    const matchesRarity = rarityFilter === "all" || item.rarity === rarityFilter;
    return matchesSearch && matchesSlot && matchesRarity;
  });

  const handlePick = (item: Item) => {
    audio.play("button.click");
    onSelectItem(item);
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-2xl border-2 border-amber-500/40 bg-slate-950 p-4 sm:p-6 max-h-[80vh] max-h-[80dvh] flex flex-col shadow-[0_0_60px_rgba(245,158,11,0.25)] rounded-3xl text-foreground relative overflow-hidden my-auto">
        {/* Chamfered decorative corner accents */}
        <div className="absolute top-3 left-3 h-2 w-2 rounded-full bg-amber-500/60 border border-amber-300 shadow-[0_0_5px_rgba(245,158,11,0.8)] pointer-events-none" />
        <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-amber-500/60 border border-amber-300 shadow-[0_0_5px_rgba(245,158,11,0.8)] pointer-events-none" />
        <div className="absolute bottom-3 left-3 h-2 w-2 rounded-full bg-amber-500/60 border border-amber-300 shadow-[0_0_5px_rgba(245,158,11,0.8)] pointer-events-none" />
        <div className="absolute bottom-3 right-3 h-2 w-2 rounded-full bg-amber-500/60 border border-amber-300 shadow-[0_0_5px_rgba(245,158,11,0.8)] pointer-events-none" />

        {/* Header - Fixed shrink-0 */}
        <DialogHeader className="pb-2 border-b border-amber-500/30 shrink-0 text-left">
          <DialogTitle className="w-full flex items-center gap-2 text-xs xs:text-sm sm:text-base font-display font-black uppercase tracking-wide text-amber-200 leading-snug pr-7">
            <Anvil className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 animate-pulse shrink-0" />
            <span>Select Raider Gear for Forge</span>
          </DialogTitle>
          <DialogDescription className="w-full text-xs leading-[1.3] mb-1 font-mono text-muted-foreground mt-0.5 text-left">
            Choose an owned gear piece from your armory deck to load onto the blacksmith anvil.
          </DialogDescription>
        </DialogHeader>

        {/* Filter Bar - Fixed shrink-0 */}
        <div className="space-y-2 py-2 border-b border-amber-500/20 shrink-0">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-amber-400/70" />
            <Input
              placeholder="Search by equipment name or set..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs font-mono bg-black/80 border-amber-500/30 focus-visible:ring-amber-400 text-amber-100 placeholder:text-muted-foreground/60 rounded-xl h-8 sm:h-9 w-full"
            />
          </div>

          {/* Slot pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 px-0.5 no-scrollbar">
            {SLOT_FILTERS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  audio.play("button.click");
                  setSlotFilter(s.id);
                }}
                className={`flex items-center gap-1 shrink-0 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-mono font-black uppercase transition-all cursor-pointer ${
                  slotFilter === s.id
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)] border border-amber-200"
                    : "bg-slate-900/80 text-muted-foreground border border-amber-500/20 hover:border-amber-400/50 hover:text-amber-200"
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Rarity selector */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 px-0.5 no-scrollbar text-[9px] sm:text-[10px]">
            <span className="font-mono font-black uppercase tracking-wider text-amber-300/80 flex items-center gap-1 pr-1 shrink-0">
              <Filter className="h-2.5 w-2.5 text-amber-400" /> Rarity:
            </span>
            {RARITY_FILTERS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  audio.play("button.click");
                  setRarityFilter(r.id);
                }}
                className={`rounded-md sm:rounded-lg px-2 py-0.5 sm:py-1 font-mono font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                  rarityFilter === r.id
                    ? "bg-amber-400 text-black shadow-sm"
                    : "bg-slate-900/60 text-muted-foreground border border-amber-500/15 hover:border-amber-400/40 hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid - Scrollable with min-h-0 */}
        <div className="flex-1 overflow-y-auto min-h-0 py-2 sm:py-3 space-y-2 px-0.5 overscroll-contain">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center rounded-2xl border border-dashed border-amber-500/30 bg-black/60 p-4 sm:p-6">
              <Package className="h-8 w-8 sm:h-10 sm:w-10 text-amber-400/40 mb-2 animate-bounce" />
              <h4 className="font-display text-sm sm:text-base font-black uppercase text-amber-200">
                No Equipment Found
              </h4>
              <p className="mt-1 text-[11px] sm:text-xs font-mono text-muted-foreground max-w-xs">
                No gear in your armory matches your active filter criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {filteredItems.map((item, idx) => {
                const isSelected = selectedItemId === item.id;
                const copiesCount = inventory.filter((i) => i.id === item.id).length;
                const isEquipped =
                  item.equipped || Object.values(player?.equipped ?? {}).includes(item.id);
                const itemTheme = itemRarityCardTheme[item.rarity] ?? itemRarityCardTheme.common;

                return (
                  <button
                    key={`${item.id}-${idx}`}
                    type="button"
                    onClick={() => handlePick(item)}
                    className={`flex items-center gap-2.5 sm:gap-3 rounded-2xl border-2 p-2.5 sm:p-3 text-left transition-all duration-200 group cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? "border-amber-400 bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/60"
                        : `${itemTheme.border} ${itemTheme.bg} ${itemTheme.glow}`
                    }`}
                  >
                    {/* Item icon pedestal */}
                    <div className="relative grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-xl bg-black/80 text-2xl sm:text-3xl shadow-inner border border-amber-500/30 group-hover:scale-105 transition-transform overflow-hidden">
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
                      <span className="absolute -bottom-1 -right-1 rounded bg-gradient-to-r from-amber-400 to-amber-500 px-1 py-0.2 font-mono text-[8px] sm:text-[9px] font-black text-black shadow-md border border-amber-200 leading-none">
                        Lv.{item.level ?? 1}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-display text-xs sm:text-sm font-black text-foreground truncate group-hover:text-amber-200 transition-colors">
                          {item.name}
                        </span>
                        {copiesCount > 1 && (
                          <span className="font-mono text-[8.5px] sm:text-[9px] font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-400/30 shrink-0">
                            x{copiesCount}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <RarityBadge rarity={item.rarity} />
                        {isEquipped && (
                          <span className="font-mono text-[8px] sm:text-[9px] font-black text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-400/40 flex items-center gap-0.5 shadow-[0_0_6px_rgba(52,211,153,0.3)]">
                            <ShieldAlert className="h-2.5 w-2.5" /> EQUIPPED
                          </span>
                        )}
                      </div>

                      <div className="font-mono text-[9px] sm:text-[10px] text-muted-foreground truncate font-semibold">
                        +{item.bonusXP ?? 10}% XP Boost · Level {item.level ?? 1}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="grid h-6 w-6 sm:h-7 sm:w-7 shrink-0 place-items-center rounded-full bg-amber-400 text-black shadow-[0_0_10px_rgba(245,158,11,0.8)] border border-amber-200">
                        <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Fixed shrink-0 */}
        <div className="pt-2 sm:pt-2.5 border-t border-amber-500/30 flex flex-col items-center justify-center shrink-0">
          <div className="w-full whitespace-normal text-center mb-2 text-xs font-mono text-amber-300/90 font-bold">
            Armory: {filteredItems.length} gear pieces available
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="w-full font-mono text-xs font-black uppercase border-amber-500/40 text-amber-300 bg-black/70 hover:bg-amber-500/20 hover:border-amber-400 cursor-pointer h-9 shrink-0"
          >
            Close Armory
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
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
import { rarityBorderClass, rarityLabel, rarityTextClass } from "@/lib/rarity";
import { getSetInfoForItem, getSetComparisonForEquip } from "@/lib/sets";
import { audio } from "@/services/audio";
import { normalizeSlot } from "@/config/masterCatalog";
import type { EquipmentSlot, Item } from "@/types/game";
import { isImageUrl } from "./RaiderAvatar";
import {
  Check,
  X,
  Search,
  Sparkles,
  Package,
  ArrowRightLeft,
  Hammer,
  Rocket,
  Zap,
  Lock,
  Eye,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { getItem6StatBadges } from "@/utils/itemStats";
import { checkIsContributor, isContributorItem } from "@/utils/contributorGating";
import { ContributorUpgradeRequiredModal } from "./ContributorUpgradeRequiredModal";

export interface EquipmentSelectorModalProps {
  slot: EquipmentSlot | null;
  open: boolean;
  onClose: () => void;
  onOpenDetails?: (item: Item) => void;
}

const SLOT_NAMES: Record<EquipmentSlot, { label: string; icon: string; description: string }> = {
  head: {
    label: "Hat",
    icon: "🎩",
    description: "Hat equipment granting Raid XP & General XP bonuses.",
  },
  body: { label: "Top", icon: "👕", description: "Top apparel boosting CTO XP multiplier." },
  shorts: { label: "Shorts", icon: "🩳", description: "Shorts enhancing Missions XP & agility." },
  feet: {
    label: "Boots",
    icon: "🥾",
    description: "Boots & Footwear boosting Luck & Missions XP.",
  },
  back: {
    label: "Cape",
    icon: "🦸",
    description: "Prestige Capes granting Luck & drop multipliers.",
  },
  pet: { label: "Pet", icon: "🐾", description: "Companions boosting Graphic XP & Luck." },
  powerItem: {
    label: "Specialist Item",
    icon: "⚡",
    description: "Special relics empowering active raid abilities across all 6 stats.",
  },
  cosmeticTheme: {
    label: "Theme",
    icon: "🎨",
    description: "Cosmetic themes that customize character HQ & Forge background environments.",
  },
  frame: {
    label: "Frame",
    icon: "🖼️",
    description: "Cosmetic frames that wrap the outside of your Character HQ display.",
  },
  // Canonical Aliases
  hat: {
    label: "Hat",
    icon: "🎩",
    description: "Hat equipment granting Raid XP & General XP bonuses.",
  },
  top: { label: "Top", icon: "👕", description: "Top apparel boosting CTO XP multiplier." },
  trousers: { label: "Shorts", icon: "🩳", description: "Shorts enhancing Missions XP & agility." },
  socks: {
    label: "Boots",
    icon: "🥾",
    description: "Boots & Footwear boosting Luck & Missions XP.",
  },
  cape: {
    label: "Cape",
    icon: "🦸",
    description: "Prestige Capes granting Luck & drop multipliers.",
  },
  power: {
    label: "Specialist Item",
    icon: "⚡",
    description: "Special relics empowering active raid abilities across all 6 stats.",
  },
  face: {
    label: "Hat",
    icon: "🎩",
    description: "Hat equipment granting Raid XP & General XP bonuses.",
  },
  hands: { label: "Top", icon: "👕", description: "Top apparel boosting CTO XP multiplier." },
  accessory: {
    label: "Pet",
    icon: "🐾",
    description: "Companions boosting Graphic XP & Luck.",
  },
};

export function EquipmentSelectorModal({
  slot,
  open,
  onClose,
  onOpenDetails,
}: EquipmentSelectorModalProps) {
  const navigate = useNavigate();
  const player = useGameStore((s) => s.player);
  const inventory = useGameStore((s) => s.inventory);
  const equipItem = useGameStore((s) => s.equipItem);
  const unequipSlot = useGameStore((s) => s.unequipSlot);

  const [search, setSearch] = useState("");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedContributorItem, setSelectedContributorItem] = useState<Item | null>(null);

  const isContributor = checkIsContributor(player);

  if (!slot) return null;

  const targetNormalizedSlot = normalizeSlot(slot);
  const slotMeta = SLOT_NAMES[targetNormalizedSlot] || SLOT_NAMES[slot];
  const currentlyEquippedId =
    player?.equipped[slot] ||
    player?.equipped[targetNormalizedSlot] ||
    (targetNormalizedSlot === "cosmeticTheme"
      ? player?.equipped?.["theme"] || player?.equipped?.["cosmeticTheme"]
      : undefined);

  // Filter inventory items matching the selected slot (deduplicated by item ID)
  const compatibleItems = inventory.filter(
    (item) => normalizeSlot(item.slot) === targetNormalizedSlot,
  );
  const uniqueCompatibleItems = compatibleItems.filter(
    (item, index, self) => self.findIndex((i) => i.id === item.id) === index,
  );
  const filteredItems = uniqueCompatibleItems.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.set && item.set.toLowerCase().includes(search.toLowerCase())),
  );

  // Sort items: Put currently equipped item at the top, then preserve order
  const sortedFilteredItems = [...filteredItems].sort((a, b) => {
    const aEquipped = a.id === currentlyEquippedId;
    const bEquipped = b.id === currentlyEquippedId;
    if (aEquipped && !bEquipped) return -1;
    if (!aEquipped && bEquipped) return 1;
    return 0;
  });

  const handleEquip = (item: Item) => {
    const itemIsLocked = isContributorItem(item) && !isContributor;
    if (itemIsLocked) {
      setSelectedContributorItem(item);
      toast.error("Contributor Tier Required to display custom 3D/Cosmetic items.", {
        description: "Support ecosystem liquidity to equip prestige frames & animated cosmetics.",
        duration: 5000,
        action: {
          label: "UPGRADE →",
          onClick: () => setUpgradeModalOpen(true),
        },
      });
      setUpgradeModalOpen(true);
      return;
    }

    equipItem(slot, item.id);
    audio.play("button.click");
    onClose();
  };

  const handlePreviewOnCharacter = (item: Item) => {
    toast.info(`Previewing ${item.name} on character`, {
      description: "Contributor status required to permanently equip and save cosmetic loadout.",
      duration: 4000,
      action: {
        label: "BECOME CONTRIBUTOR",
        onClick: () => {
          setSelectedContributorItem(item);
          setUpgradeModalOpen(true);
        },
      },
    });
  };

  const handleUnequip = () => {
    unequipSlot(slot);
    audio.play("button.click");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent
        style={{ zIndex: 100, backdropFilter: "blur(8px)" }}
        className="max-w-xl border-amber-500/40 bg-slate-950/95 text-foreground p-3.5 sm:p-5 max-h-[80vh] flex flex-col z-[100] backdrop-blur-[8px] shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden"
      >
        <DialogHeader className="pb-2.5 sm:pb-3 border-b border-border/60 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-display font-bold">
            <span className="text-xl sm:text-2xl">{slotMeta.icon}</span>
            <span>Select {slotMeta.label} Gear</span>
          </DialogTitle>
          <DialogDescription className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1">
            {slotMeta.description} Choose an item from your storage to equip immediately.
          </DialogDescription>
        </DialogHeader>

        {/* Search bar if multiple compatible items exist */}
        {compatibleItems.length > 3 && (
          <div className="relative my-2 shrink-0">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={`Search owned ${slotMeta.label}s...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-8.5 rounded-xl bg-slate-900/80 border-slate-700/60"
            />
          </div>
        )}

        {/* Compatible items list or Empty state */}
        <div
          style={{ paddingTop: "12px" }}
          className="flex-1 overflow-y-auto pt-3 pb-3 space-y-2.5 min-h-0 pr-0.5 custom-scrollbar"
        >
          {compatibleItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center rounded-xl border border-dashed border-border bg-surface-2/40 p-4 sm:p-6">
              <div className="text-4xl sm:text-5xl mb-2 sm:mb-3 opacity-60">{slotMeta.icon}</div>
              <h4 className="font-display text-sm sm:text-base font-bold text-foreground">
                No {slotMeta.label} Owned Yet
              </h4>
              <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground max-w-xs">
                Open Packs in the Pack Vault to discover a {slotMeta.label} for your Raider loadout.
              </p>

              {/* EMPTY SLOT ACTION CUE */}
              <div className="mt-2.5 rounded-xl border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-center font-mono text-[10px] sm:text-[11px] font-bold text-amber-300 shadow-xs flex items-center justify-center gap-1.5 max-w-sm">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Complete Daily Bounties in Missions to earn new Gear Packs!</span>
              </div>

              <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2">
                <Button
                  onClick={() => {
                    onClose();
                    navigate({ to: "/missions" });
                  }}
                  className="font-mono text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 hover:from-amber-300 hover:to-yellow-300 shadow-md cursor-pointer px-3 sm:px-4 py-2 rounded-xl h-8.5"
                >
                  <Rocket className="mr-1.5 h-3.5 w-3.5" /> MISSIONS
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    navigate({ to: "/packs" });
                  }}
                  variant="outline"
                  className="font-mono text-xs font-black uppercase tracking-wider border-sky-500/50 text-sky-300 bg-sky-950/30 hover:bg-sky-500/20 cursor-pointer px-3 sm:px-4 py-2 rounded-xl h-8.5"
                >
                  <Package className="mr-1.5 h-3.5 w-3.5" /> OPEN PACKS
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    navigate({ to: "/forge" });
                  }}
                  variant="outline"
                  className="font-mono text-xs font-black uppercase tracking-wider border-amber-500/50 text-amber-300 bg-amber-950/30 hover:bg-amber-500/20 cursor-pointer px-3 sm:px-4 py-2 rounded-xl h-8.5"
                >
                  <Hammer className="mr-1.5 h-3.5 w-3.5" /> FORGE
                </Button>
              </div>
            </div>
          ) : sortedFilteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No items matching "{search}".
            </div>
          ) : (
            sortedFilteredItems.map((item, idx) => {
              const isEquipped = currentlyEquippedId === item.id;
              const duplicateCount = inventory.filter((i) => i.id === item.id).length;
              const isLockedContributorItem = isContributorItem(item) && !isContributor;

              return (
                <div
                  key={`${item.id}-${idx}`}
                  className={`flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 sm:gap-3 rounded-xl border-2 bg-card p-2.5 sm:p-3 transition-all ${
                    isEquipped
                      ? "border-emerald-500/80 bg-emerald-950/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50"
                      : isLockedContributorItem
                        ? "border-amber-500/50 bg-amber-950/20"
                        : rarityBorderClass[item.rarity]
                  }`}
                >
                  <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className="relative grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-lg bg-surface-3 text-2xl sm:text-3xl border border-border/60 overflow-hidden">
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
                      {isEquipped && (
                        <span className="absolute -bottom-1.5 rounded-full bg-emerald-500 px-1.5 py-0.2 text-[7.5px] sm:text-[8px] font-mono font-black uppercase text-slate-950 shadow-md border border-emerald-300 tracking-wider">
                          EQUIPPED
                        </span>
                      )}
                      {isLockedContributorItem && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                          <Lock className="h-4 w-4 text-amber-400 animate-pulse" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-display text-xs sm:text-sm font-bold truncate">
                          {item.name}
                        </h4>
                        {isEquipped && (
                          <span className="rounded-full bg-emerald-500/25 border border-emerald-500/60 px-2 py-0.5 text-[8.5px] sm:text-[9px] font-mono font-black text-emerald-300 shadow-sm flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            EQUIPPED
                          </span>
                        )}
                        {isLockedContributorItem && (
                          <span className="rounded-full bg-amber-400 text-slate-950 px-2 py-0.5 text-[8.5px] sm:text-[9px] font-mono font-black shadow-xs flex items-center gap-1">
                            <Lock className="h-2.5 w-2.5" />
                            CONTRIBUTOR ONLY
                          </span>
                        )}
                        {duplicateCount > 1 && (
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[8.5px] sm:text-[9px] font-bold text-amber-400">
                            ×{duplicateCount} Copies
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[9.5px] sm:text-[10px]">
                        <span className={`font-bold uppercase ${rarityTextClass[item.rarity]}`}>
                          {rarityLabel[item.rarity]}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="font-mono text-primary font-semibold">
                          Level {item.level ?? 1}/{item.maxLevel ?? 10}
                        </span>
                        {item.set && (
                          <>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-accent font-semibold truncate max-w-[120px]">
                              {item.set}
                            </span>
                          </>
                        )}
                      </div>

                      {/* 6-Stat Multipliers summary */}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {getItem6StatBadges(item)
                          .slice(0, 3)
                          .map((badge, bIdx) => (
                            <span
                              key={bIdx}
                              className={`rounded px-1.5 py-0.2 text-[8.5px] sm:text-[9px] font-mono border font-bold flex items-center gap-0.5 ${badge.color}`}
                            >
                              <span>{badge.icon}</span>
                              <span>
                                {badge.label}: {badge.value}
                              </span>
                            </span>
                          ))}
                      </div>

                      {/* SET CONTRIBUTION & COMPARISON BREAKDOWN */}
                      {(() => {
                        const comp = getSetComparisonForEquip(
                          slot,
                          item,
                          player?.equipped ?? {},
                          inventory,
                        );
                        if (!comp.candidateSet) return null;
                        return (
                          <div className="mt-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-1.5 text-[10px] sm:text-[11px] font-mono space-y-0.5">
                            <div className="flex items-center justify-between font-bold text-amber-300">
                              <span>Set: {comp.candidateSet}</span>
                              <span className="text-[9.5px] bg-amber-500/20 px-1 py-0.2 rounded border border-amber-500/40">
                                {comp.currentSetCount}/{comp.totalRequired} →{" "}
                                <strong className="text-white">
                                  {comp.afterEquipSetCount}/{comp.totalRequired}
                                </strong>
                              </span>
                            </div>
                            <div className="text-[9.5px] text-muted-foreground flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                              <span
                                className={
                                  comp.isFullSetAfterEquip
                                    ? "text-emerald-300 font-bold"
                                    : "text-amber-200"
                                }
                              >
                                {comp.nextUnlockBonus}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end xs:self-center">
                    {onOpenDetails && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          onClose();
                          onOpenDetails(item);
                        }}
                        className="h-8 text-xs font-semibold px-2 cursor-pointer"
                      >
                        Details
                      </Button>
                    )}

                    {isEquipped ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="h-8 text-xs font-mono font-black text-emerald-300 border-emerald-500/50 bg-emerald-950/60 px-3 opacity-90 cursor-not-allowed shadow-inner"
                      >
                        <Check className="mr-1 h-3.5 w-3.5 text-emerald-400" /> EQUIPPED
                      </Button>
                    ) : isLockedContributorItem ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreviewOnCharacter(item)}
                          className="h-8 text-[10px] font-mono font-bold uppercase border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 px-2 cursor-pointer"
                          title="Preview on character loadout"
                        >
                          <Eye className="mr-1 h-3 w-3 text-cyan-400" />
                          PREVIEW
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleEquip(item)}
                          className="h-8 text-[10px] font-mono font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 px-2.5 cursor-pointer shadow-md active:scale-95 transition-all flex items-center gap-1"
                        >
                          <Lock className="h-3 w-3" />
                          UNLOCK
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleEquip(item)}
                        className="h-8 text-xs font-mono font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 px-3 cursor-pointer shadow-md active:scale-95 transition-all"
                      >
                        EQUIP
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PROGRESSION HINT FOOTER BANNER */}
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-amber-950/40 px-3 py-1.5 text-center shrink-0">
          <div className="flex items-center justify-center gap-1.5 font-mono text-[9.5px] sm:text-[10.5px] font-bold text-amber-300">
            <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
            <span>Complete Daily Bounties in Missions to earn new Gear Packs!</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2.5 sm:pt-3 border-t border-border/60 flex items-center justify-between gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs min-h-[44px] sm:min-h-[48px] px-4 cursor-pointer touch-manipulation"
          >
            Close
          </Button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link to="/forge" onClick={onClose}>
              <Button
                variant="outline"
                size="sm"
                className="text-[11px] sm:text-xs font-semibold text-amber-300 border-amber-500/40 min-h-[44px] sm:min-h-[48px] px-3 sm:px-4 cursor-pointer whitespace-nowrap touch-manipulation"
              >
                <Hammer className="mr-1 h-3.5 w-3.5 shrink-0" /> Forge
              </Button>
            </Link>
            <Link to="/packs" search={{ tab: "owned" }} onClick={onClose}>
              <Button
                variant="outline"
                size="sm"
                className="text-[11px] sm:text-xs font-semibold text-sky-300 border-sky-500/40 min-h-[44px] sm:min-h-[48px] px-3 sm:px-4 cursor-pointer whitespace-nowrap touch-manipulation"
              >
                <Package className="mr-1 h-3.5 w-3.5 shrink-0" /> Vault
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>

      <ContributorUpgradeRequiredModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        feature={
          targetNormalizedSlot === "frame"
            ? "frame"
            : targetNormalizedSlot === "cosmeticTheme"
              ? "artwork"
              : "cosmetic_item"
        }
        customFeatureName={
          selectedContributorItem ? `Unlock ${selectedContributorItem.name}` : undefined
        }
        customFeatureDescription={
          selectedContributorItem
            ? `Equipping ${selectedContributorItem.name} (${selectedContributorItem.rarity.toUpperCase()} Cosmetic) requires Contributor status.`
            : undefined
        }
      />
    </Dialog>
  );
}

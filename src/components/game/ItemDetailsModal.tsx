import { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Hammer,
  RefreshCw,
  Layers,
  ChevronDown,
  Info,
  ShieldOff,
  Lock,
  Crown,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import type { Item } from "@/types/game";
import { rarityBorderClass, rarityLabel, rarityTextClass } from "@/lib/rarity";
import { useGameStore } from "@/store/gameStore";
import { getSetInfoForItem } from "@/lib/sets";
import { normalizeSlot } from "@/config/masterCatalog";
import { isImageUrl } from "./RaiderAvatar";
import { Button } from "@/components/ui/button";
import { audio } from "@/services/audio";
import { getDetailedItemStats, getItem6StatBadges } from "@/utils/itemStats";
import { checkIsContributor, isContributorItem } from "@/utils/contributorGating";

export interface ItemDetailsModalProps {
  item: Item | null;
  open?: boolean;
  onClose: () => void;
  onSwapGear?: () => void;
  onUnequip?: () => void;
}

export function getItemStatBreakdown(
  item: Item,
): Array<{ label: string; value: string; icon: string; color: string; isPrimary?: boolean }> {
  const badges = getItem6StatBadges(item);
  return badges.map((b) => ({
    label: b.label,
    value: b.value,
    icon: b.icon,
    color: b.color,
    isPrimary: b.type === "PRIMARY",
  }));
}

export function ItemDetailsModal({
  item,
  open = true,
  onClose,
  onSwapGear,
  onUnequip,
}: ItemDetailsModalProps) {
  const player = useGameStore((s) => s.player);
  const inventory = useGameStore((s) => s.inventory);
  const unequipSlot = useGameStore((s) => s.unequipSlot);

  const [showFullBreakdown, setShowFullBreakdown] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showFormulaLogs, setShowFormulaLogs] = useState(false);

  const isOpen = Boolean(item && open);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!item || !open) return null;

  const normalizedSlot = normalizeSlot(item.slot);
  const isEquipped =
    player?.equipped[item.slot] === item.id || player?.equipped[normalizedSlot] === item.id;
  const duplicateCount = inventory.filter((i) => i.id === item.id).length;
  const setInfo = getSetInfoForItem(item, inventory, player?.equipped ?? {});
  const detailedStats = getDetailedItemStats(item);
  const statBreakdown = getItemStatBreakdown(item);

  const primaryStat = detailedStats.primary;
  const secondaryStats = detailedStats.secondaries;

  // Calculate Total XP Boost from all combined stats on this item
  const totalItemXpBoost =
    detailedStats.all.reduce((sum, s) => sum + s.value_pct, 0) || (item.bonusXP ?? 0);

  const handleDirectUnequip = () => {
    audio.play("button.click");
    unequipSlot(normalizedSlot);
    if (item.slot !== normalizedSlot) {
      unequipSlot(item.slot);
    }
    onUnequip?.();
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 pb-24 sm:pb-8 overflow-y-auto touch-pan-y"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={`relative w-full max-w-sm sm:max-w-md mx-auto overflow-x-hidden bg-zinc-950 border border-amber-500/30 rounded-2xl sm:rounded-3xl p-3 sm:p-4 pb-20 shadow-2xl space-y-2 sm:space-y-2.5 max-h-[88vh] overflow-y-auto overscroll-contain touch-pan-y text-foreground custom-scrollbar ${rarityBorderClass[item.rarity]}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button with min 48x48px touch target */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute right-2 top-2 sm:right-3 sm:top-3 z-30 w-12 h-12 rounded-full bg-slate-900/90 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-amber-400/50 hover:bg-slate-800 transition cursor-pointer active:scale-90 touch-manipulation"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col gap-1.5 sm:gap-2.5">
            {/* HEADER CARD: PREVIEW, NAME, BADGES */}
            <div className="relative flex flex-col items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 py-2 sm:py-2.5 px-2 sm:px-3 text-center border border-slate-800">
              {/* ITEM PREVIEW IMAGE WITH LEVEL BADGE OVERLAY */}
              <div className="relative mb-1 sm:mb-1.5 grid h-12 w-12 sm:h-16 sm:w-16 place-items-center rounded-xl bg-slate-900 border-2 border-amber-500/40 text-2xl sm:text-4xl shadow-inner overflow-hidden">
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
                <span className="absolute -top-1 -right-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 px-1.5 py-0.2 font-mono text-[8.5px] sm:text-[9.5px] font-black shadow-[0_0_8px_rgba(245,158,11,0.8)] border border-amber-200">
                  +{item.level ?? 1}
                </span>
                {isEquipped && (
                  <span className="absolute -bottom-1.5 rounded-full bg-emerald-500 text-slate-950 px-1.5 py-0.2 font-mono text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-wider shadow">
                    EQUIPPED
                  </span>
                )}
              </div>

              {/* FULL ITEM NAME */}
              <h3 className="font-display text-xs sm:text-base font-black text-amber-300 uppercase tracking-tight px-2 leading-tight">
                {item.name}
              </h3>

              {/* BADGE ROW: INLINE FLEX WRAP ROW (RARITY + SLOT + LEVEL) */}
              <div className="mt-1 flex flex-wrap items-center justify-center gap-1 font-mono">
                <span
                  className={`rounded-md border px-2 py-0.5 text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-wider whitespace-nowrap ${rarityTextClass[item.rarity]} bg-slate-900/90 border-amber-500/30 shadow-xs`}
                >
                  {rarityLabel[item.rarity]}
                </span>
                <span className="rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider text-slate-300 whitespace-nowrap">
                  SLOT: {item.slot.toUpperCase()}
                </span>
                <span className="rounded-md border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[8.5px] sm:text-[9.5px] font-black text-amber-300 whitespace-nowrap">
                  LVL +{item.level ?? 1}/{item.maxLevel ?? 10}
                </span>
                {isContributorItem(item) && (
                  <span className="rounded-md border border-amber-400 bg-amber-400 text-slate-950 px-2 py-0.5 text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5" />
                    CONTRIBUTOR ONLY
                  </span>
                )}
              </div>
            </div>

            {/* 1. CLEAN DEFAULT "TOTAL XP BOOST" SUMMARY */}
            <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-slate-950 p-2.5 sm:p-3.5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-lg sm:text-xl shrink-0 shadow-inner">
                  🚀
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[10px] font-mono uppercase font-black tracking-wider text-emerald-400">
                    TOTAL XP BOOST
                  </div>
                  <div className="text-xs sm:text-sm font-display font-bold text-slate-200 truncate">
                    {primaryStat?.label ? `${primaryStat.label} Active` : "Passive Multiplier"}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono font-black text-lg sm:text-xl text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                  +{totalItemXpBoost.toFixed(2)}%
                </span>
                <div className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">
                  Overall Boost
                </div>
              </div>
            </div>

            {/* 2. PROGRESSIVE DISCLOSURE: VIEW BREAKDOWN TOGGLE */}
            <div className="rounded-xl border border-amber-500/30 bg-slate-900/60 overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setShowFullBreakdown(!showFullBreakdown)}
                className="w-full flex items-center justify-between px-3 py-2 text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-wider text-amber-300 bg-slate-900/90 hover:bg-amber-500/10 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>View Breakdown ({statBreakdown.length} Stats)</span>
                </span>
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-400 font-bold">
                  <span>{showFullBreakdown ? "Hide" : "Expand"}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      showFullBreakdown ? "rotate-180 text-amber-300" : ""
                    }`}
                  />
                </div>
              </button>

              {showFullBreakdown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-2.5 pt-1 space-y-1.5 border-t border-slate-800/80"
                >
                  <div className="grid grid-cols-1 gap-1.5 font-mono text-xs">
                    {statBreakdown.map((b, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 ${b.color}`}
                      >
                        <span className="font-bold flex items-center gap-1.5 text-[10.5px] sm:text-[11.5px]">
                          <span className="text-sm leading-none">{b.icon}</span>
                          <span className="text-slate-200">{b.label}:</span>
                        </span>
                        <span className="font-mono font-black text-[11px] sm:text-xs tracking-tight">
                          {b.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* 3. OPTIONAL "MORE DETAILS" ACCORDION FOR DEEP STAT FORMULAS & RAW LOGS */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setShowFormulaLogs(!showFormulaLogs)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[9.5px] sm:text-[10.5px] font-mono font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Info className="h-3 w-3 text-cyan-400" />
                  <span>More Details (Formulas & Logs)</span>
                </span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${
                    showFormulaLogs ? "rotate-180 text-cyan-300" : ""
                  }`}
                />
              </button>

              {showFormulaLogs && (
                <div className="p-2.5 pt-1 space-y-2 border-t border-slate-800/70 text-[10px] font-mono text-slate-300 bg-slate-950/80">
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Base Stat Value:</span>
                      <span className="font-bold text-slate-200">{item.bonusXP ?? 0.05}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Level Scaling Formula:</span>
                      <span className="font-bold text-amber-300">
                        Base × (1 + Lv.{item.level ?? 1} × 0.10)
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Slot Multiplier Weight:</span>
                      <span className="font-bold text-cyan-300">1.0x Active</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Raid Power Equivalence:</span>
                      <span className="font-bold text-emerald-400">
                        {((item.level ?? 1) * 2200 + 12000).toLocaleString()} Power
                      </span>
                    </div>
                  </div>
                  {item.description && (
                    <div className="pt-1.5 border-t border-slate-800 text-[9.5px] text-slate-400 leading-relaxed italic">
                      "{item.description}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. PROGRESSIVE DISCLOSURE: VAULT STORAGE & SET BONUS */}
            <div className="flex flex-col gap-1.5">
              {/* Vault Storage Row */}
              <div className="flex items-center justify-between rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10px] sm:text-[11px] font-mono font-bold border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Layers className="h-3 w-3 text-amber-400" /> Vault Storage:
                </div>
                <span className="text-foreground font-extrabold">
                  {duplicateCount > 1 ? (
                    <span className="text-amber-400">×{duplicateCount} Copies Owned</span>
                  ) : duplicateCount === 1 ? (
                    <span className="text-emerald-400">1 Copy Owned</span>
                  ) : (
                    <span className="text-slate-500">Not Owned</span>
                  )}
                </span>
              </div>

              {/* Set Progress Highlight */}
              {setInfo && (
                <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 px-2.5 py-1.5 space-y-0.5 font-mono text-[10px] sm:text-[11px]">
                  <div className="flex items-center justify-between font-bold text-cyan-300">
                    <span className="truncate">Set: {setInfo.setName}</span>
                    <span className="rounded bg-cyan-500/20 px-1.5 py-0.2 text-[8.5px] sm:text-[9.5px] font-extrabold text-cyan-300 border border-cyan-500/40 shrink-0">
                      {setInfo.ownedCount} / {setInfo.totalRequired} Pieces
                    </span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-slate-300 leading-tight">
                    {setInfo.bonusDescription}
                  </div>
                </div>
              )}

              {/* PROGRESSION ACTION CUE */}
              <div className="rounded-lg border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-amber-950/40 px-2.5 py-1.5 text-center">
                <div className="flex items-center justify-center gap-1.5 font-mono text-[9px] sm:text-[10px] font-bold text-amber-300">
                  <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                  <span>Complete Daily Bounties in Missions to earn new Gear Packs!</span>
                </div>
              </div>
            </div>

            {/* ACTION CONTROLS: STANDARDIZED ACTION BAR */}
            <div className="flex flex-col gap-1.5 pt-1 font-mono pb-1">
              {isEquipped ? (
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full">
                  {/* 1. UNEQUIP */}
                  <Button
                    type="button"
                    onClick={handleDirectUnequip}
                    variant="outline"
                    className="w-full font-mono font-black uppercase text-[9.5px] sm:text-xs tracking-wider border-rose-500/50 text-rose-300 bg-rose-950/40 hover:bg-rose-500/20 hover:text-white cursor-pointer h-8 sm:h-9 px-1 sm:px-2 active:scale-95 transition-all duration-150 flex items-center justify-center gap-1 shadow-sm"
                  >
                    <ShieldOff className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                    <span className="whitespace-nowrap truncate">UNEQUIP</span>
                  </Button>

                  {/* 2. FORGE */}
                  <Link to="/forge" onClick={onClose} className="w-full">
                    <Button
                      type="button"
                      className="w-full font-mono font-black uppercase text-[9.5px] sm:text-xs tracking-wider bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.4)] border border-amber-200 cursor-pointer h-8 sm:h-9 px-1 sm:px-2 active:scale-95 transition-all duration-150 flex items-center justify-center gap-1"
                    >
                      <Hammer className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                      <span className="whitespace-nowrap truncate">
                        {duplicateCount > 1 ? "FUSE" : "FORGE"}
                      </span>
                    </Button>
                  </Link>

                  {/* 3. SWAP */}
                  <Button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSwapGear?.();
                    }}
                    className="w-full font-mono font-black uppercase text-[9.5px] sm:text-xs tracking-wider bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)] border border-cyan-200 cursor-pointer h-8 sm:h-9 px-1 sm:px-2 active:scale-95 transition-all duration-150 flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                    <span className="whitespace-nowrap truncate">SWAP</span>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full">
                  {/* 1. FORGE */}
                  <Link to="/forge" onClick={onClose} className="w-full">
                    <Button
                      type="button"
                      className="w-full font-mono font-black uppercase text-[10px] sm:text-xs tracking-wider bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.4)] border border-amber-200 cursor-pointer h-8.5 sm:h-9.5 px-2 sm:px-3 active:scale-95 transition-all duration-150 flex items-center justify-center gap-1.5"
                    >
                      <Hammer className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <span className="whitespace-nowrap">
                        {duplicateCount > 1 ? "FUSE" : "FORGE"}
                      </span>
                    </Button>
                  </Link>

                  {/* 2. SWAP / EQUIP */}
                  <Button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSwapGear?.();
                    }}
                    className="w-full font-mono font-black uppercase text-[10px] sm:text-xs tracking-wider bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)] border border-cyan-200 cursor-pointer h-8.5 sm:h-9.5 px-2 sm:px-3 active:scale-95 transition-all duration-150 flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="whitespace-nowrap">EQUIP / SWAP</span>
                  </Button>
                </div>
              )}

              {/* Close Dismiss Button */}
              <Button
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-full font-mono font-black uppercase text-xs text-slate-400 hover:text-white hover:bg-slate-900/90 h-8 sm:h-9 cursor-pointer mt-1 border border-slate-800/80 active:scale-95 transition-all shadow-xs"
              >
                CLOSE
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

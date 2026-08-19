import { useEffect, useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { RarityBadge } from "@/components/game/RarityBadge";
import { ItemRevealCard } from "@/components/game/ItemRevealCard";
import { RarityCelebration } from "@/components/game/RarityCelebration";
import { ItemDetailsModal } from "@/components/game/ItemDetailsModal";
import { Pack3DChest } from "@/components/game/Pack3DChest";
import { isImageUrl } from "@/components/game/RaiderAvatar";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";
import { rarityBorderClass, rarityTextClass, rarityLabel } from "@/lib/rarity";
import { tierFor } from "@/lib/packTier";
import { audio } from "@/services/audio";
import { SEASON_1_SETS } from "@/config/masterCatalog";
import { SEASON_1_PACKS_MAP } from "@/config/packs";
import { getPackPityCounters } from "@/services/pityService";
import { executePackTearAndUnboxPayload } from "@/services/vault";
import { setMockInventory } from "@/services/inventory";
import type { Item, Pack, Rarity } from "@/types/game";
import {
  Sparkles,
  Check,
  Share2,
  Hammer,
  FastForward,
  PackageOpen,
  Trophy,
  Package,
  Shield,
  Target,
  Zap,
  Clover,
  Trash2,
  Lock,
} from "lucide-react";

export type FlowStage = "presentation" | "opening" | "reveal" | "summary";

const DISMANTLE_XP_MAP: Record<Rarity, number> = {
  common: 250,
  uncommon: 600,
  rare: 1500,
  epic: 3500,
  legendary: 8000,
  mythic: 20000,
};

export interface PackOpeningModalProps {
  pack: Pack | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinished?: (items: Item[]) => void;
  directOpen?: boolean;
  isBatch?: boolean;
  batchPacks?: Pack[];
  batchPacksCount?: number;
}

export function PackOpeningModal({
  pack,
  open,
  onOpenChange,
  onFinished,
  directOpen = true,
  isBatch = false,
  batchPacks = [],
  batchPacksCount,
}: PackOpeningModalProps) {
  const navigate = useNavigate();
  const equipItem = useGameStore((s) => s.equipItem);
  const inventory = useGameStore((s) => s.inventory);
  const player = useGameStore((s) => s.player);
  const setNotifications = useGameStore((s) => s.setNotifications);
  const notifications = useGameStore((s) => s.notifications);

  const [stage, setStage] = useState<FlowStage>("presentation");
  const [pulledItems, setPulledItems] = useState<Item[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [celebratingItem, setCelebratingItem] = useState<Item | null>(null);
  const [comparedItem, setComparedItem] = useState<Item | null>(null);
  const [equippedItemIds, setEquippedItemIds] = useState<Set<string>>(new Set());
  const [dismantledItemIds, setDismantledItemIds] = useState<Set<string>>(new Set());

  // Target Set selection for Specialist Pack
  const [selectedTargetSet, setSelectedTargetSet] = useState<string>("Raid Specialist Set");
  const [slotAntiClustering, setSlotAntiClustering] = useState<boolean>(false);
  const [boostCount, setBoostCount] = useState<number>(0);
  const [epicPityTriggered, setEpicPityTriggered] = useState<boolean>(false);
  const [legendaryPityTriggered, setLegendaryPityTriggered] = useState<boolean>(false);
  const [luckAppliedPct, setLuckAppliedPct] = useState<number>(0);
  const [tearStage, setTearStage] = useState<"tear_reveal" | "tearing" | "loot_roll">(
    "tear_reveal",
  );
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });
  const [showTearFlash, setShowTearFlash] = useState(false);

  // Keep ref of unboxing in flight for instant skip handling
  const pendingRewardsRef = useRef<Item[] | null>(null);
  const isSkipRequestedRef = useRef<boolean>(false);

  // Pre-load all item artwork during the tear sequence to eliminate any black card placeholders
  const preloadItemArtwork = async (items: Item[]): Promise<void> => {
    if (!items || items.length === 0) return;
    const promises = items.map((item) => {
      if (
        !item.image ||
        (!item.image.startsWith("http") &&
          !item.image.startsWith("/") &&
          !item.image.startsWith("data:"))
      ) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = item.image;
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => {
            if ("decode" in img) {
              img
                .decode()
                .then(() => resolve())
                .catch(() => resolve());
            } else {
              resolve();
            }
          };
          img.onerror = () => resolve();
        }
      });
    });

    // Up to 600ms preload race
    await Promise.race([Promise.all(promises), new Promise((res) => setTimeout(res, 600))]);
  };

  const isTutorialMode = useGameStore((s) => s.isTutorialMode);
  const sandboxXP = useGameStore((s) => s.sandboxXP);

  // Lock page body scrolling while modal is active
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  // Handle open trigger (Direct Unboxing or Batch Unboxing)
  useEffect(() => {
    if (!open || !pack) return;

    setError(null);
    setCelebratingItem(null);
    setComparedItem(null);
    setEquippedItemIds(new Set());
    setDismantledItemIds(new Set());
    setSlotAntiClustering(false);
    setBoostCount(0);
    setCurrentIndex(0);
    setPulledItems([]);
    pendingRewardsRef.current = null;
    isSkipRequestedRef.current = false;

    if (isBatch && batchPacks && batchPacks.length > 0) {
      // Execute fast-forward Batch Opening flow
      executeBatchOpening(batchPacks);
    } else if (directOpen) {
      // Streamlined direct unboxing: Start immediately at opening / physical foil tear
      setStage("opening");
      setTearStage("tearing");
      triggerDirectUnboxingFlow(pack);
    } else {
      setStage("presentation");
      setTearStage("tear_reveal");
    }
  }, [open, pack, isBatch, directOpen]);

  const triggerDirectUnboxingFlow = async (targetPack: Pack) => {
    audio.play("pack.open");

    try {
      const unboxPromise = executePackTearAndUnboxPayload(targetPack.id, selectedTargetSet);

      // Eagerly prefetch & decode all 3 item artwork sprites in the background immediately
      unboxPromise.then((res) => {
        if (res.success && res.rewards?.length) {
          preloadItemArtwork(res.rewards);
        }
      });

      // Play the physical left-to-right horizontal foil peel and packet split sequence (~1050ms)
      setTimeout(async () => {
        setTearStage("loot_roll");
        const res = await unboxPromise;
        if (!res.success) {
          setError(res.error || "Failed to open pack");
          setStage("presentation");
          setTearStage("tear_reveal");
          return;
        }

        pendingRewardsRef.current = res.rewards;
        setSlotAntiClustering(Boolean(res.slotAntiClusteringApplied));
        setBoostCount(res.missingItemBoostsAppliedCount || 0);
        setEpicPityTriggered(Boolean(res.epicPityTriggered));
        setLegendaryPityTriggered(Boolean(res.legendaryPityTriggered));
        setLuckAppliedPct(res.luckAppliedPct || 0);

        // Preload all item artwork during the tear phase
        await preloadItemArtwork(res.rewards);

        // If user already tapped 'Skip All' while opening was resolving
        if (isSkipRequestedRef.current) {
          setPulledItems(res.rewards);
          setStage("summary");
          if (onFinished && res.rewards.length > 0) {
            onFinished(res.rewards);
          }
          return;
        }

        // Quick light flash immediately before Item 1 displays
        setShowTearFlash(true);
        audio.play("card.flip");

        setTimeout(() => {
          setShowTearFlash(false);
          setPulledItems(res.rewards);
          if (!isSkipRequestedRef.current) {
            setStage("reveal");
            setCurrentIndex(0);
          } else {
            setStage("summary");
            if (onFinished && res.rewards.length > 0) {
              onFinished(res.rewards);
            }
          }
        }, 220);
      }, 1050);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to open pack");
      setStage("presentation");
      setTearStage("tear_reveal");
    }
  };

  const executeBatchOpening = async (packsToOpen: Pack[]) => {
    setStage("opening");
    setTearStage("loot_roll");
    setBatchProgress({ current: 0, total: packsToOpen.length });
    audio.play("pack.open");

    const allRewards: Item[] = [];

    for (let i = 0; i < packsToOpen.length; i++) {
      const p = packsToOpen[i];
      setBatchProgress({ current: i + 1, total: packsToOpen.length });
      try {
        const res = await executePackTearAndUnboxPayload(p.id);
        if (res.success && res.rewards) {
          preloadItemArtwork(res.rewards);
          allRewards.push(...res.rewards);
        }
      } catch (e) {
        console.error("Batch open error on pack:", p.id, e);
      }
    }

    pendingRewardsRef.current = allRewards;
    setShowTearFlash(true);
    audio.play("celebration");

    setTimeout(() => {
      setShowTearFlash(false);
      setPulledItems(allRewards);
      setStage("summary");
      if (onFinished && allRewards.length > 0) {
        onFinished(allRewards);
      }
    }, 300);
  };

  // Immediate Skip All Action - Pinned to Top-Right Header
  const handleSkipAll = () => {
    isSkipRequestedRef.current = true;
    audio.play("button.click");

    if (pulledItems.length > 0) {
      setStage("summary");
      if (onFinished) {
        onFinished(pulledItems);
      }
    } else if (pendingRewardsRef.current && pendingRewardsRef.current.length > 0) {
      setPulledItems(pendingRewardsRef.current);
      setStage("summary");
      if (onFinished) {
        onFinished(pendingRewardsRef.current);
      }
    } else {
      // Still opening in background, mark skipped so resolve handler jumps straight to summary
      setTearStage("loot_roll");
    }
  };

  if (!pack) return null;

  const packConfig = SEASON_1_PACKS_MAP[pack.id] ||
    SEASON_1_PACKS_MAP[pack.configId || ""] || {
      id: pack.id,
      name: pack.name,
      cost: pack.cost || 5000,
      itemsPerPack: 3,
      rarityWeights: pack.probabilities || {
        common: 0.55,
        uncommon: 0.25,
        rare: 0.12,
        epic: 0.06,
        legendary: 0.018,
        mythic: 0.002,
      },
    };

  const currentItem = pulledItems[currentIndex];
  const isLast = currentIndex >= pulledItems.length - 1;

  const spendableXP = isTutorialMode
    ? sandboxXP || 99999
    : (player?.spendableXP ?? player?.xp ?? 0);
  const cost = packConfig.cost || 5000;
  const isOwnedInInventory = (useGameStore.getState().packs || []).some((p) => p.id === pack.id);
  const hasEnoughXP =
    isTutorialMode ||
    isOwnedInInventory ||
    spendableXP >= cost ||
    pack.id === "pack_raider" ||
    pack.id === "pack_starter";

  const tier = tierFor(pack.rarity);
  const accent = tier ? tier.accent : `var(--rarity-${pack.rarity ?? "common"})`;

  const handleStartOpening = async () => {
    if (!hasEnoughXP) {
      setError(
        `Insufficient Spendable XP. Need ${cost.toLocaleString()} XP, but you have ${spendableXP.toLocaleString()} XP.`,
      );
      return;
    }

    setStage("opening");
    setTearStage("tearing");
    triggerDirectUnboxingFlow(pack);
  };

  const handleCardRevealed = () => {
    if (currentItem) {
      if (currentItem.rarity === "legendary" || currentItem.rarity === "mythic") {
        setCelebratingItem(currentItem);
      }
    }
  };

  const handleNextCard = () => {
    if (isLast) {
      setStage("summary");
      if (onFinished && pulledItems.length > 0) {
        onFinished(pulledItems);
      }
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleEquipPull = (item: Item) => {
    audio.play("button.click");
    equipItem(item.slot, item.id);
    setEquippedItemIds((prev) => new Set([...prev, item.id]));
    setNotifications([
      {
        id: `notif_${Date.now()}`,
        title: "Item Equipped!",
        message: `Equipped ${item.name} to your ${item.slot} slot.`,
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...notifications,
    ]);
  };

  const handleDismantlePull = (item: Item) => {
    if (dismantledItemIds.has(item.id)) return;
    audio.play("button.click");

    const xpAmount = DISMANTLE_XP_MAP[item.rarity] || 250;
    const store = useGameStore.getState();

    // Remove from inventory
    const updatedInventory = store.inventory.filter((i) => i.id !== item.id);
    store.setInventory(updatedInventory);
    setMockInventory(updatedInventory);

    // Add XP to player spendable balance
    store.addXp(xpAmount);

    // Update dismantled state for feedback
    setDismantledItemIds((prev) => new Set([...prev, item.id]));

    setNotifications([
      {
        id: `notif_${Date.now()}`,
        title: "Item Dismantled",
        message: `Dismantled ${item.name} for +${xpAmount.toLocaleString()} XP!`,
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...notifications,
    ]);
  };

  const handleSendToForge = (item: Item) => {
    setNotifications([
      {
        id: `notif_${Date.now()}`,
        title: "Sent to Forge",
        message: `${item.name} selected for Forge refinement or fusion.`,
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...notifications,
    ]);
  };

  const handleSharePull = () => {
    const itemNames = pulledItems.map((i) => `${i.name} (${i.rarity})`).join(", ");
    navigator.clipboard?.writeText?.(
      `🔥 I just opened ${isBatch ? `${batchPacks.length} packs` : `a ${pack.name}`} in Fartboy Raid 2.0 and pulled: ${itemNames}!`,
    );
    setNotifications([
      {
        id: `notif_${Date.now()}`,
        title: "Pull Shared!",
        message: "Pack pull results copied to clipboard for Discord!",
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...notifications,
    ]);
  };

  const pityInfo = getPackPityCounters(player?.pityState, pack.id);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          id="pack-opening-modal-dialog"
          className="max-w-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto border-2 border-amber-500/30 bg-slate-950 p-3 sm:p-5 shadow-2xl text-slate-100 rounded-3xl z-[100]"
        >
          <VisuallyHidden>
            <DialogTitle>Pack Unboxing Experience</DialogTitle>
            <DialogDescription>
              Interactive foil pack opening and gear reveal sequence
            </DialogDescription>
          </VisuallyHidden>

          {/* SOLID MODAL HEADER BAR WITH PINNED GOLD 'SKIP ALL' BUTTON */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-border/50 shrink-0">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <RarityBadge rarity={pack.rarity} />
              <span className="font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-400 truncate">
                {isBatch
                  ? `BATCH UNBOXING • ${batchPacks.length || batchPacksCount || 1} PACKS`
                  : `${pack.name.toUpperCase()} UNBOXING`}
              </span>
            </div>

            {/* PINNED GOLD '⏩ SKIP & VIEW ALL PULLS' BUTTON */}
            {(stage === "opening" || stage === "reveal") && (
              <button
                id="btn-skip-unboxing-all"
                type="button"
                onClick={handleSkipAll}
                className="group self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.45)] hover:shadow-[0_0_25px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 border border-amber-200"
                title="Immediately skip all animations and view all items"
              >
                <FastForward className="h-3.5 w-3.5 fill-slate-950 group-hover:translate-x-0.5 transition-transform" />
                <span>⏩ SKIP & VIEW ALL PULLS</span>
              </button>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs font-mono text-destructive mb-3">
              {error}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 1: PRESENTATION (FALLBACK IF OPENED VIA MANUAL DETAILS)             */}
          {/* ========================================================================= */}
          {stage === "presentation" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col items-center justify-center gap-3">
                <div
                  className="relative flex h-40 w-40 items-center justify-center rounded-2xl p-4 overflow-hidden border border-border/40 shadow-inner"
                  style={{
                    background: `radial-gradient(circle at 50% 42%, color-mix(in oklab, ${accent} 28%, transparent), var(--surface-3) 72%)`,
                  }}
                >
                  {tier?.godrays && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute h-[220%] w-[220%] animate-godray opacity-30"
                      style={{
                        background: `conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, ${accent} 55%, transparent) 8deg, transparent 20deg, transparent 40deg, color-mix(in oklab, ${accent} 55%, transparent) 48deg, transparent 60deg, transparent 80deg, color-mix(in oklab, ${accent} 55%, transparent) 88deg, transparent 100deg)`,
                      }}
                    />
                  )}
                  {tier?.rings && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute h-28 w-28 rounded-full border animate-ring-burst opacity-40"
                      style={{ borderColor: accent }}
                    />
                  )}
                  <Pack3DChest packId={pack.id} rarity={pack.rarity} size="lg" floating={true} />
                </div>

                <div className="space-y-1 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <RarityBadge rarity={pack.rarity} />
                    <span className="font-mono text-xs uppercase text-muted-foreground">
                      Season 1 Stash Pack
                    </span>
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold">{pack.name}</h2>
                  <p className="max-w-md text-xs text-muted-foreground">{pack.description}</p>
                </div>
              </div>

              {/* Specialist Set Focus Selector */}
              {pack.id.includes("specialist") && (
                <div className="rounded-xl border border-primary/40 bg-primary/10 p-3 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary flex items-center gap-1.5">
                      <Target className="h-4 w-4" /> Targeted Set Focus (+150% Missing Drop Boost)
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      Select Priority
                    </span>
                  </div>
                  <select
                    value={selectedTargetSet}
                    onChange={(e) => setSelectedTargetSet(e.target.value)}
                    className="w-full rounded-lg bg-surface-2 border border-border px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                  >
                    {SEASON_1_SETS.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.pieces.length} Pieces)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Pity Stats */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                <div className="rounded-lg bg-surface-2 p-2 border border-border/40">
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Epic Pity
                  </span>
                  <span className="font-bold text-purple-400">
                    {pityInfo.epicPityCounter} / {pityInfo.epicThreshold}
                  </span>
                </div>
                <div className="rounded-lg bg-surface-2 p-2 border border-border/40">
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Legendary Pity
                  </span>
                  <span className="font-bold text-amber-400">
                    {pityInfo.legendaryPityCounter} / {pityInfo.legendaryThreshold}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button
                  size="default"
                  onClick={handleStartOpening}
                  className="font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/25 cursor-pointer px-6"
                >
                  <Zap className="mr-2 h-4 w-4 fill-slate-950" /> OPEN PACK NOW
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 2: PHYSICAL FOIL TEAR & UNBOXING ANIMATION                          */}
          {/* ========================================================================= */}
          {stage === "opening" && (
            <div className="relative flex flex-col items-center justify-center gap-6 py-6 sm:py-8 px-2 overflow-visible min-h-[380px] sm:min-h-[420px] animate-in fade-in duration-200">
              {/* Quick light flash immediately before Item 1 displays */}
              {showTearFlash && (
                <div
                  aria-hidden
                  className="pointer-events-none fixed inset-0 z-50 animate-out fade-out duration-300 bg-[radial-gradient(circle,rgba(255,255,255,0.95)_0%,rgba(34,211,238,0.8)_40%,transparent_80%)]"
                />
              )}

              {/* Full-width dynamic light streaks and laser tear effect */}
              <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
                <div
                  className="absolute h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse shadow-[0_0_35px_#22d3ee]"
                  style={{
                    backgroundColor: accent,
                    boxShadow: `0 0 35px ${accent}`,
                  }}
                />
                <div
                  className="absolute h-48 w-48 rounded-full blur-3xl animate-ping"
                  style={{
                    backgroundColor: `color-mix(in oklab, ${accent} 30%, transparent)`,
                  }}
                />
                <div
                  className="absolute h-72 w-72 rounded-full border animate-ring-burst"
                  style={{ borderColor: accent }}
                />
                <div
                  className="absolute h-88 w-88 rounded-full border animate-ring-burst [animation-delay:220ms]"
                  style={{ borderColor: "#f59e0b" }}
                />
              </div>

              {/* Sparks & Dynamic Particle Scatter along Cut Line */}
              <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
                {Array.from({ length: 28 }).map((_, i) => (
                  <span
                    key={i}
                    className="absolute text-xs animate-spark-scatter font-black drop-shadow-[0_0_8px_#38bdf8]"
                    style={{
                      left: `${15 + ((i * 11) % 70)}%`,
                      top: `${15 + ((i * 13) % 70)}%`,
                      animationDuration: `${0.45 + (i % 4) * 0.15}s`,
                      animationDelay: `${(i % 6) * 60}ms`,
                      color: i % 2 === 0 ? "#38bdf8" : i % 3 === 0 ? "#fbbf24" : "#f43f5e",
                      // @ts-expect-error CSS variable for spark trajectory
                      "--spark-x": `${(i % 2 === 0 ? 1 : -1) * (25 + ((i * 7) % 55))}px`,
                      "--spark-y": `${(i % 3 === 0 ? -1 : 1) * (25 + ((i * 9) % 55))}px`,
                    }}
                  >
                    {i % 4 === 0 ? "⚡" : i % 3 === 0 ? "✦" : i % 2 === 0 ? "★" : "✨"}
                  </span>
                ))}
              </div>

              {/* Central Pack 3D Chest with Suspense Rumble, Horizontal Foil Tear & Laser Light Rays */}
              <div className="relative z-20 flex flex-col items-center justify-center gap-6 animate-suspense-rumble">
                <div
                  className="relative flex items-center justify-center h-56 w-52 sm:h-60 sm:w-56 rounded-3xl bg-slate-950/90 border-2 shadow-[0_0_70px_rgba(6,182,212,0.5)] p-3 backdrop-blur-md overflow-hidden shrink-0"
                  style={{
                    borderColor: accent,
                    boxShadow: `0 0 70px color-mix(in oklab, ${accent} 55%, transparent)`,
                  }}
                >
                  {/* High-Resolution 3D Pack Render */}
                  <div className="relative z-10 scale-100 transition-transform flex items-center justify-center">
                    <Pack3DChest packId={pack.id} rarity={pack.rarity} size="lg" floating={false} />
                  </div>

                  {/* ========================================================= */}
                  {/* PHYSICAL TOP FOIL STRIP OVERLAY & HORIZONTAL TEAR EFFECT */}
                  {/* ========================================================= */}

                  {/* 1. Splitting Top Packet Opening Foil Cap */}
                  <div className="pointer-events-none absolute top-0 inset-x-0 h-16 z-30 animate-packet-split flex flex-col justify-start overflow-hidden">
                    <div
                      className="w-full h-12 bg-gradient-to-b from-slate-200/40 via-amber-200/30 to-transparent border-b-2 shadow-lg backdrop-blur-xs"
                      style={{ borderColor: accent }}
                    >
                      {/* Metallic Crimping Notches */}
                      <div className="w-full h-3.5 bg-[repeating-linear-gradient(90deg,transparent,transparent_3px,rgba(255,255,255,0.4)_4px,transparent_5px)] opacity-80" />
                    </div>
                  </div>

                  {/* 2. Top Foil Strip Peeling Horizontally from Left to Right */}
                  <div className="pointer-events-none absolute top-3 inset-x-0 h-10 z-35 animate-foil-tear-horizontal overflow-hidden">
                    <div
                      className="w-full h-full bg-gradient-to-r from-amber-300 via-yellow-100 to-cyan-300 shadow-[0_0_20px_#fde047] border-y border-white/80 flex items-center justify-between px-2"
                      style={{
                        clipPath: "polygon(0 0, 100% 0, 95% 100%, 0 100%)",
                      }}
                    >
                      <span className="font-mono text-[9px] font-black uppercase tracking-widest text-slate-950">
                        PULL TO OPEN ▶▶
                      </span>
                      <span className="text-xs">⚡</span>
                    </div>
                  </div>

                  {/* 3. Horizontal Slicing Laser Seam (Left to Right Sweep) */}
                  <div className="pointer-events-none absolute top-10 inset-x-0 z-40 h-2 flex items-center">
                    <div className="absolute h-1.5 w-24 bg-gradient-to-r from-transparent via-white to-cyan-300 shadow-[0_0_30px_#22d3ee,0_0_60px_#ffffff] rounded-full animate-foil-slice-sweep" />
                  </div>

                  {/* 4. Radiant Light Beams Bursting from Inside Split Packet */}
                  <div className="pointer-events-none absolute top-6 inset-x-0 z-25 flex justify-center">
                    <div
                      className="h-32 w-32 rounded-full blur-xl animate-ping"
                      style={{
                        backgroundColor: `color-mix(in oklab, ${accent} 70%, #ffffff)`,
                      }}
                    />
                    <div className="absolute -top-4 h-24 w-1.5 bg-white shadow-[0_0_25px_#ffffff] rotate-12 animate-pulse" />
                    <div className="absolute -top-4 h-24 w-1.5 bg-amber-300 shadow-[0_0_25px_#fbbf24] -rotate-12 animate-pulse [animation-delay:100ms]" />
                    <div className="absolute -top-6 h-28 w-2 bg-cyan-300 shadow-[0_0_35px_#38bdf8] rotate-0 animate-pulse [animation-delay:200ms]" />
                  </div>

                  {/* 5. Horizontal Spark Embers Streaming Along Tear Line */}
                  <div className="pointer-events-none absolute top-8 inset-x-0 z-45 h-12 overflow-visible">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <span
                        key={i}
                        className="absolute text-xs animate-spark-stream font-black drop-shadow-[0_0_10px_#38bdf8]"
                        style={{
                          left: `${5 + i * 6}%`,
                          top: `${(i % 3) * 4}px`,
                          animationDelay: `${i * 50}ms`,
                          color: i % 2 === 0 ? "#38bdf8" : i % 3 === 0 ? "#fbbf24" : "#ffffff",
                          // @ts-expect-error dynamic spark trajectory
                          "--spark-x": `${20 + (i % 5) * 15}px`,
                          "--spark-y": `${-15 - (i % 4) * 10}px`,
                        }}
                      >
                        {i % 3 === 0 ? "✦" : i % 2 === 0 ? "⚡" : "✨"}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 text-center z-20 mt-3 sm:mt-4 px-2 max-w-md w-full">
                  <div
                    className="inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] backdrop-blur-md bg-slate-950/90 max-w-full"
                    style={{ borderColor: accent }}
                  >
                    <Sparkles className="h-4 w-4 text-cyan-300 shrink-0 animate-spin" />
                    <span className="font-display font-black text-xs sm:text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-amber-200 uppercase leading-snug">
                      {isBatch
                        ? `UNBOXING PACK ${batchProgress.current}/${batchProgress.total}...`
                        : "TEARING FOIL PACK & UNLEASHING LOOT"}
                    </span>
                    <Zap className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0 animate-bounce" />
                  </div>

                  <p className="font-mono text-[11px] sm:text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                    {isBatch
                      ? "Fast-forwarding batch unboxing sequence with roll anti-clustering..."
                      : "Slicing foil seam, loading item artworks & calculating drop rolls..."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 3: CARD REVEALS (ONE BY ONE WITH SMOOTH 200MS TRANSITION)           */}
          {/* ========================================================================= */}
          {stage === "reveal" && currentItem && (
            <div className="flex flex-col items-center gap-4 pt-1 animate-in fade-in duration-200">
              <div className="flex items-center justify-between w-full border-b border-border/40 pb-2.5 mb-1">
                <span className="font-mono text-xs sm:text-sm font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Item {currentIndex + 1} of{" "}
                  {pulledItems.length}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground uppercase">
                  {isLast ? "Final Item" : "Tap Next to Reveal"}
                </span>
              </div>

              <div className="py-2 w-full">
                <ItemRevealCard
                  item={currentItem}
                  index={currentIndex}
                  total={pulledItems.length}
                  revealed={true}
                  onRevealed={handleCardRevealed}
                />
              </div>

              <div className="flex items-center justify-center gap-2 w-full pt-2">
                <Button
                  size="default"
                  onClick={handleNextCard}
                  className="font-mono text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-amber-400 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/25 px-8 cursor-pointer rounded-xl h-10 transition-all hover:scale-105 active:scale-95"
                >
                  {isLast ? "View All Pulls »" : "Reveal Next Item »"}
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 4: UNIFIED SUMMARY SCREEN ('Your Season Pulls')                      */}
          {/* ========================================================================= */}
          {stage === "summary" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {/* Summary Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                <div>
                  <h3 className="font-display text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    {isBatch ? "Your Combined Pulls" : "Your Season 1 Pulls"}
                  </h3>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    {isBatch
                      ? `⚡ ${batchPacks.length || batchPacksCount || Math.ceil(pulledItems.length / 3)} packs unboxed • ${pulledItems.length} items acquired`
                      : `Successfully unboxed ${pulledItems.length} gear items`}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {epicPityTriggered && (
                    <span className="rounded-md bg-purple-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-300 border border-purple-500/40">
                      ⚡ Epic Pity Triggered
                    </span>
                  )}
                  {legendaryPityTriggered && (
                    <span className="rounded-md bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300 border border-amber-500/40">
                      👑 Legendary Pity Triggered
                    </span>
                  )}
                  <span className="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-300 border border-slate-700">
                    📦 {pulledItems.length} Drops
                  </span>
                </div>
              </div>

              {/* Pulls Grid & Action Chips with explicit 8px gap */}
              <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-h-[58vh] overflow-y-auto pr-1">
                {pulledItems.map((item, idx) => {
                  const isEquipped =
                    player?.equipped[item.slot] === item.id || equippedItemIds.has(item.id);
                  const isDismantled = dismantledItemIds.has(item.id);
                  const dismantleVal = DISMANTLE_XP_MAP[item.rarity] || 250;

                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      className={`flex flex-col justify-between rounded-xl border-2 bg-surface-2/90 px-3 py-2.5 shadow-sm transition-all ${
                        isDismantled
                          ? "opacity-40 grayscale border-slate-800"
                          : rarityBorderClass[item.rarity]
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Artwork Icon */}
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-surface-3 text-2xl overflow-hidden border border-border/40">
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

                        {/* Item Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-display text-xs sm:text-sm font-bold truncate text-foreground">
                              {item.name}
                            </h4>
                            {isEquipped && (
                              <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-1 py-0.2 font-mono text-[8px] font-black uppercase text-emerald-300 shrink-0">
                                EQ
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1 text-[9px] font-mono text-muted-foreground">
                            <span className={`font-bold uppercase ${rarityTextClass[item.rarity]}`}>
                              {rarityLabel[item.rarity]}
                            </span>
                            <span>•</span>
                            <span className="uppercase">{item.slot}</span>
                            <span>•</span>
                            <span className="text-primary font-bold">Lv {item.level ?? 1}</span>
                          </div>
                          {item.set && (
                            <div className="text-[9px] text-amber-400 font-semibold truncate max-w-[130px]">
                              {item.set}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ACTION ROW: display: flex; gap: 8px; justify-content: flex-end; align-items: center; */}
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "flex-end",
                          alignItems: "center",
                        }}
                        className="mt-2.5 border-t border-border/40 pt-2"
                      >
                        {/* Chip 1: EQUIP */}
                        <button
                          type="button"
                          disabled={isEquipped || isDismantled}
                          onClick={() => handleEquipPull(item)}
                          className={`h-6 px-2.5 rounded-md font-mono text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                            isEquipped
                              ? "bg-slate-800 text-slate-400 cursor-not-allowed opacity-75"
                              : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 active:scale-95"
                          }`}
                        >
                          <Check className="h-2.5 w-2.5" />
                          <span>{isEquipped ? "EQUIPPED" : "EQUIP"}</span>
                        </button>

                        {/* Chip 2: FORGE */}
                        <button
                          type="button"
                          disabled={isDismantled}
                          onClick={() => {
                            handleSendToForge(item);
                            onOpenChange(false);
                            navigate({ to: "/forge", search: { itemId: item.id } });
                          }}
                          className="h-6 px-2.5 rounded-md font-mono text-[9px] font-black uppercase tracking-wider flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 active:scale-95 transition-all cursor-pointer"
                        >
                          <Hammer className="h-2.5 w-2.5 text-amber-400" />
                          <span>FORGE</span>
                        </button>

                        {/* Chip 3: XP BONUS / DISMANTLE */}
                        <button
                          type="button"
                          disabled={isDismantled}
                          onClick={() => handleDismantlePull(item)}
                          className={`h-6 px-2 rounded-md font-mono text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                            isDismantled
                              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                              : "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 active:scale-95"
                          }`}
                        >
                          <Trash2 className="h-2.5 w-2.5 text-rose-400" />
                          <span>
                            {isDismantled
                              ? "DONE"
                              : `+${dismantleVal >= 1000 ? `${dismantleVal / 1000}k` : dismantleVal} XP`}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Bottom Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSharePull}
                  className="font-mono text-[11px] uppercase h-8 cursor-pointer"
                >
                  <Share2 className="mr-1.5 h-3 w-3" /> Share Pull
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => onOpenChange(false)}
                    className="font-mono font-black uppercase tracking-wider text-xs bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-md px-4 py-2 cursor-pointer rounded-xl h-8"
                  >
                    <Check className="mr-1 h-3.5 w-3.5" /> KEEP ALL & CLOSE
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rarity celebration modal overlay for high tier drops */}
      {celebratingItem && (
        <RarityCelebration item={celebratingItem} onClose={() => setCelebratingItem(null)} />
      )}

      {/* Item details compare modal */}
      {comparedItem && (
        <ItemDetailsModal item={comparedItem} onClose={() => setComparedItem(null)} />
      )}
    </>
  );
}

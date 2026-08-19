import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RarityBadge } from "@/components/game/RarityBadge";
import { Pack3DChest } from "@/components/game/Pack3DChest";
import { PackProbabilityGrid } from "@/components/game/PackProbabilityGrid";
import { PackPityProgressSection } from "@/components/game/PackPityProgressSection";
import { PackPotentialDropsCarousel } from "@/components/game/PackPotentialDropsCarousel";
import { isImageUrl } from "@/components/game/RaiderAvatar";
import { tierFor } from "@/lib/packTier";
import { confirmPackPurchasePayload, type ConfirmPackPurchaseResult } from "@/services/shop";
import { audio } from "@/services/audio";
import { useGameStore } from "@/store/gameStore";
import type { ShopListing } from "@/types/game";
import {
  Sparkles,
  Zap,
  ShoppingBag,
  CheckCircle2,
  Unlock,
  Gift,
  Loader2,
  ArrowRight,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface ProductDetailsModalProps {
  item: ShopListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseSuccess?: (quantity: number) => void;
}

export function ProductDetailsModal({
  item,
  open,
  onOpenChange,
  onPurchaseSuccess,
}: ProductDetailsModalProps) {
  const [step, setStep] = useState<"inspect" | "success">("inspect");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<ConfirmPackPurchaseResult | null>(null);
  const [shakeTrigger, setShakeTrigger] = useState(false);

  // Trigger low-tier rumble / atmospheric hum when inspecting high-tier packs
  useEffect(() => {
    if (open && item) {
      if (
        item.rarity === "legendary" ||
        item.rarity === "mythic" ||
        item.id.includes("legendary")
      ) {
        audio.play("pack.inspect.legendary");
      } else if (item.rarity === "epic" || item.id.includes("specialist")) {
        audio.play("pack.inspect.epic");
      }
    }
  }, [open, item]);

  // Lock body scroll during open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setStep("inspect");
      setPurchaseResult(null);
      setIsPurchasing(false);
    }
  }, [open, item]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-2xl border-2 border-border bg-slate-950 p-0 shadow-2xl max-h-[90dvh] sm:max-h-[90vh] flex flex-col overflow-hidden rounded-3xl z-[100] ${shakeTrigger ? "animate-[bounce_0.25s_ease-in-out]" : ""}`}
      >
        {item ? (
          step === "inspect" ? (
            <InspectStep
              item={item}
              isPurchasing={isPurchasing}
              onConfirmPurchase={async (quantity: number) => {
                setIsPurchasing(true);
                try {
                  const priceXP = item.priceXP ?? 5000;
                  const res = await confirmPackPurchasePayload(item.id, priceXP, quantity);
                  if (res.success) {
                    // Trigger sound & screen shake impact
                    audio.play("shop.purchase");
                    setShakeTrigger(true);
                    setTimeout(() => setShakeTrigger(false), 300);

                    // Trigger celebratory confetti pop
                    confetti({
                      particleCount: 95,
                      spread: 80,
                      origin: { y: 0.6 },
                      colors: ["#06b6d4", "#a855f7", "#f59e0b", "#10b981", "#ec4899"],
                    });
                    setPurchaseResult(res);
                    setStep("success");
                    onPurchaseSuccess?.(quantity);
                  } else {
                    toast.error(
                      res.message ||
                        "Not enough Spendable XP! Complete Daily Missions to earn more.",
                      { duration: 1500, position: "bottom-center" },
                    );
                  }
                } catch (_err) {
                  toast.error("An error occurred during purchase.", {
                    duration: 1500,
                    position: "bottom-center",
                  });
                } finally {
                  setIsPurchasing(false);
                }
              }}
            />
          ) : (
            <SuccessStep
              item={item}
              result={purchaseResult}
              onOpenVault={() => {
                onOpenChange(false);
              }}
              onContinueShopping={() => {
                onOpenChange(false);
                setStep("inspect");
              }}
            />
          )
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function InspectStep({
  item,
  isPurchasing,
  onConfirmPurchase,
}: {
  item: ShopListing;
  isPurchasing: boolean;
  onConfirmPurchase: (quantity: number) => void;
}) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const icon = item.iconEmoji ?? item.image;
  const probs = item.probabilities;
  const isPack = item.kind === "pack" || !!item.packGrantId;

  const player = useGameStore((s) => s.player);
  const spendableXP = player?.spendableXP ?? player?.xp ?? 0;
  const basePriceXP = item.priceXP ?? 5000;
  const totalCost = basePriceXP * quantity;
  const hasEnoughXP = spendableXP >= totalCost;
  const neededXP = Math.max(0, totalCost - spendableXP);

  // Maximum affordable quantity (at least 1, max 99)
  const maxAffordable = Math.max(1, Math.min(99, Math.floor(spendableXP / basePriceXP) || 1));

  // Packs use the shared vault tier accent (cyan/purple/gold)
  const tier = isPack ? tierFor(item.rarity) : null;
  const accent = tier ? tier.accent : `var(--rarity-${item.rarity ?? "common"})`;

  return (
    <div className="flex flex-col max-h-[90dvh] sm:max-h-[90vh] overflow-hidden bg-slate-950">
      {/* SOLID OPAQUE HEADER OVERLAY */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-amber-500/20 bg-slate-950 px-4 sm:px-6 pt-[max(0.875rem,env(safe-area-inset-top))] pb-3.5 shrink-0 shadow-md">
        <div className="flex items-center gap-2 pr-12 min-w-0">
          {item.rarity && <RarityBadge rarity={item.rarity} />}
          <span className="font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-amber-400 truncate">
            {isPack ? "VAULT PACK INSPECTION" : `${item.category ?? item.kind} INSPECTION`}
          </span>
        </div>
      </div>

      {/* Scrollable interior content area */}
      <div
        className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-[240px_1fr] p-4 sm:p-6 gap-5 sm:gap-6"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Artwork stage — 3D Pack Art with interactive wobble & ambient background glow */}
        <div
          className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl p-6 md:aspect-auto min-h-[220px] sm:min-h-[240px] border border-border/40 shadow-inner group"
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

          {/* Wobble / Tilt Motion Container */}
          <motion.div
            whileHover={{ scale: 1.06, rotate: [-1, 1.5, -1, 0] }}
            transition={{ duration: 0.35 }}
            className="relative z-10 cursor-pointer"
          >
            {isPack ? (
              <Pack3DChest packId={item.id} rarity={item.rarity} size="lg" floating={true} />
            ) : isImageUrl(icon) ? (
              <img
                src={icon}
                alt={item.name}
                className="relative h-28 w-28 object-contain drop-shadow-xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="relative text-8xl drop-shadow-lg">{icon}</span>
            )}
          </motion.div>

          {item.discountBadge && (
            <span
              className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold text-white shadow-md z-20"
              style={{ background: `color-mix(in oklab, ${accent} 85%, black)` }}
            >
              {item.discountBadge}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <DialogHeader className="space-y-1.5 text-left">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9.5px] uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                {item.category ?? item.kind}
              </span>
              {item.specialistSet && (
                <span className="font-semibold text-amber-300 font-mono text-xs">
                  Set: {item.specialistSet}
                </span>
              )}
              {item.availability && (
                <span className="text-muted-foreground text-xs font-mono">
                  • {item.availability}
                </span>
              )}
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              {item.name}
            </DialogTitle>
            <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </DialogHeader>

          {/* POTENTIAL HIGH-TIER DROPS 3D CAROUSEL */}
          {isPack && <PackPotentialDropsCarousel packId={item.id} rarity={item.rarity} />}

          {/* Standardized Drop Probabilities Breakdown if Pack */}
          {isPack && probs && (
            <PackProbabilityGrid
              probabilities={probs}
              accentColor={accent}
              title="PACK DROP PROBABILITIES"
              subtitle="3 Items per Pack"
            />
          )}

          {/* Standardized Pity Counters and System Guarantees */}
          {isPack && (
            <PackPityProgressSection
              packId={item.packGrantId || item.id}
              isSpecialist={item.id === "shop_pack_specialist" || item.rarity === "epic"}
              accentColor={accent}
            />
          )}
        </div>
      </div>

      {/* Sticky Bottom Action Bar with responsive CTA Button & Multi-Buy Selector */}
      <div className="sticky bottom-0 z-30 border-t border-border/80 bg-slate-950/95 backdrop-blur-md p-3.5 sm:p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl shrink-0 space-y-3">
        {/* MULTI-BUY QUANTITY SELECTOR FOR PACKS */}
        {isPack && (
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/90 border border-amber-500/30">
            {/* Step Controls (- / +) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300">
                Qty:
              </span>
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg p-0.5">
                <button
                  type="button"
                  disabled={quantity <= 1 || isPurchasing}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-black text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-8 sm:w-9 text-center font-mono font-black text-xs sm:text-sm text-white">
                  {quantity}x
                </span>
                <button
                  type="button"
                  disabled={quantity >= 99 || isPurchasing}
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-black text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick Quantity Presets (1x, 5x, 10x, MAX) */}
            <div className="flex items-center flex-wrap gap-1 shrink-0 ml-auto sm:ml-0">
              {[1, 5, 10].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  disabled={isPurchasing}
                  onClick={() => setQuantity(qty)}
                  className={`px-2 sm:px-2.5 py-1 rounded-md font-mono text-[10px] sm:text-[11px] font-bold uppercase transition-all cursor-pointer ${
                    quantity === qty
                      ? "bg-amber-400 text-slate-950 shadow-md font-black"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {qty}x
                </button>
              ))}
              {maxAffordable > 1 && (
                <button
                  type="button"
                  disabled={isPurchasing}
                  onClick={() => setQuantity(maxAffordable)}
                  className={`px-2 sm:px-2.5 py-1 rounded-md font-mono text-[10px] sm:text-[11px] font-bold uppercase transition-all cursor-pointer ${
                    quantity === maxAffordable
                      ? "bg-cyan-400 text-slate-950 shadow-md font-black"
                      : "bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/80"
                  }`}
                >
                  MAX
                </button>
              )}
            </div>
          </div>
        )}

        {/* PRICE DISPLAY & UNLOCK CTA / FLUID NEED MORE XP ROUTING */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Cost:
            </span>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 shrink-0" style={{ color: accent }} />
              <span
                className="font-mono text-xl sm:text-2xl font-black tabular-nums"
                style={{ color: accent }}
              >
                {totalCost.toLocaleString()}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                XP
              </span>
            </div>
          </div>

          {hasEnoughXP ? (
            <Button
              size="lg"
              disabled={isPurchasing}
              onClick={() => onConfirmPurchase(quantity)}
              className="relative overflow-hidden font-mono font-black uppercase tracking-wider text-[11px] sm:text-xs h-auto min-h-[44px] py-2.5 sm:py-3 px-4 sm:px-6 bg-gradient-to-r from-cyan-500 to-amber-400 hover:from-cyan-400 hover:to-amber-300 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer whitespace-normal sm:whitespace-nowrap flex items-center justify-center gap-2 leading-tight"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  <span>
                    UNLOCKING {quantity}x PACK{quantity > 1 ? "S" : ""}...
                  </span>
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 shrink-0" />
                  <span className="text-center">
                    UNLOCK {quantity > 1 ? `${quantity}x ` : ""}PACK{quantity > 1 ? "S" : ""} (
                    {totalCost.toLocaleString()} XP)
                  </span>
                </>
              )}
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => navigate({ to: "/missions" })}
              className="font-mono font-black uppercase tracking-wider text-[11px] sm:text-xs h-auto min-h-[44px] py-2.5 sm:py-3 px-4 sm:px-5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-normal sm:whitespace-nowrap flex items-center justify-center gap-1.5 leading-tight"
            >
              <Flame className="h-4 w-4 fill-black text-black shrink-0 animate-bounce" />
              <span>EARN {neededXP.toLocaleString()} XP IN MISSIONS</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function SuccessStep({
  item,
  result,
  onOpenVault,
  onContinueShopping,
}: {
  item: ShopListing;
  result: ConfirmPackPurchaseResult | null;
  onOpenVault: () => void;
  onContinueShopping: () => void;
}) {
  const navigate = useNavigate();
  const isPack = item.kind === "pack" || !!item.packGrantId;
  const qty = result?.quantityPurchased ?? 1;
  const [openingTransition, setOpeningTransition] = useState(false);

  const handleGoToVault = () => {
    // Trigger bursting tear audio + radiant screen flash before handoff
    audio.play("pack.burst");
    setOpeningTransition(true);

    setTimeout(() => {
      onOpenVault();
      const targetPackId = item.packGrantId || item.id;
      navigate({
        to: "/packs",
        search: {
          tab: "stash",
          highlightPack: targetPackId,
        },
      });
    }, 450);
  };

  return (
    <div
      className="relative p-6 md:p-8 space-y-6 text-center max-h-[90dvh] sm:max-h-[90vh] overflow-y-auto pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Radiant Screen Flash & Scale-In Burst on Open Vault */}
      <AnimatePresence>
        {openingTransition && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[150] bg-gradient-to-r from-amber-400/90 via-yellow-200 to-white flex items-center justify-center pointer-events-none"
          >
            <div className="font-display font-black text-3xl sm:text-5xl text-black uppercase tracking-widest animate-ping">
              OPENING VAULT...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Green Checkmark Badge */}
      <DialogHeader className="space-y-2.5 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xl shadow-emerald-500/20 animate-bounce">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        </div>
        <DialogTitle className="font-display text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          Purchase Successful!
        </DialogTitle>
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs sm:text-sm font-bold shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>Transaction Confirmed • {qty}x Acquired</span>
          </span>
        </div>
      </DialogHeader>

      {/* Acquired Item Summary */}
      <div className="rounded-xl border border-amber-500/40 bg-slate-800/80 p-4 flex items-center gap-4 text-left shadow-md">
        <div className="shrink-0 w-16 h-16 flex items-center justify-center bg-slate-900/80 rounded-lg border border-border/60">
          {isPack ? (
            <Pack3DChest packId={item.id} rarity={item.rarity} size="sm" floating={false} />
          ) : (
            <span className="text-3xl">{item.iconEmoji ?? item.image ?? "🎁"}</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <span className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
            {isPack
              ? qty > 1
                ? `${qty}x Vault Packs Acquired`
                : "Vault Pack Acquired"
              : "Item Acquired"}
          </span>
          <h4 className="font-display text-base font-extrabold text-foreground truncate">
            {qty > 1 ? `${qty}x ${item.name}` : item.name}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-tight">
            {item.description}
          </p>
        </div>
      </div>

      {/* Remaining Spendable XP Pill */}
      {result?.remainingBalance !== undefined && (
        <div className="flex items-center justify-between rounded-lg bg-slate-950/80 px-4 py-3 font-mono text-xs border border-border/60 shadow-inner">
          <span className="text-muted-foreground font-semibold">Remaining Spendable XP:</span>
          <span className="font-black text-amber-300 text-sm">
            {result.remainingBalance.toLocaleString()} XP
          </span>
        </div>
      )}

      {/* Clarifying Text */}
      <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
        {isPack
          ? qty > 1
            ? `${qty}x new packs have been delivered directly to your Pack Vault and are ready to open!`
            : "Your new pack has been delivered directly to your Pack Vault and is ready to open!"
          : "Your item has been placed into your equipment storage and is ready to equip."}
      </p>

      {/* Bottom Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {isPack ? (
          <Button
            onClick={handleGoToVault}
            className="w-full bg-gradient-to-r from-cyan-400 via-amber-400 to-yellow-300 hover:brightness-110 text-slate-950 font-mono text-xs font-black uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.5)] py-3.5 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <Gift className="mr-2 h-4 w-4" /> 🎁 OPEN VAULT ({result?.unopenedPacksCount ?? qty})
          </Button>
        ) : (
          <Button
            onClick={() => {
              onOpenVault();
              navigate({ to: "/character" });
            }}
            className="w-full bg-primary text-primary-foreground font-mono text-xs font-black uppercase tracking-wider shadow-lg py-3 cursor-pointer"
          >
            <ShoppingBag className="mr-2 h-4 w-4" /> EQUIP IN HQ
          </Button>
        )}

        <Button
          variant="outline"
          onClick={onContinueShopping}
          className="w-full font-mono text-xs font-bold uppercase tracking-wider border-slate-700 hover:bg-slate-800 text-foreground py-3 cursor-pointer"
        >
          CONTINUE SHOPPING
        </Button>
      </div>
    </div>
  );
}

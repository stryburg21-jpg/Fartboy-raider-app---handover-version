import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/game/AppShell";
import { PageHeader } from "@/components/game/PageHeader";
import { MarketHeaderControl } from "@/components/game/MarketHub";
import { ArmorySwipeContainer } from "@/components/game/ArmoryHeaderTabs";
import { ProductDetailsModal } from "@/components/game/ProductDetailsModal";
import { ContributorPassPromoBanner } from "@/components/game/ContributorPassPromoBanner";
import { Pack3DChest } from "@/components/game/Pack3DChest";
import { Button } from "@/components/ui/button";
import { getShopListings, confirmPackPurchasePayload } from "@/services/shop";
import { audio } from "@/services/audio";
import { useGameStore } from "@/store/gameStore";
import type { ShopListing } from "@/types/game";
import {
  Sparkles,
  Gift,
  CheckCircle2,
  ChevronDown,
  Zap,
  Loader2,
  Lock,
  Flame,
  Clock,
  ArrowRight,
  ShieldAlert,
  Trophy,
  Crown,
  Rocket,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { toast } from "sonner";

export const Route = createFileRoute("/shop")({ component: ShopPage });

// Live Countdown Timer Hook
function useSeasonCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 8,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    // Fixed target: 14 days from initial load
    const target = Date.now() + (14 * 86400 + 8 * 3600 + 32 * 60 + 45) * 1000;
    const interval = setInterval(() => {
      const remaining = Math.max(0, target - Date.now());
      const totalSec = Math.floor(remaining / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

function FeaturedHeroBanner({
  item,
  onInspect,
  onQuickBuy,
  isPurchasingThis,
}: {
  item: ShopListing;
  onInspect: (item: ShopListing) => void;
  onQuickBuy: (item: ShopListing) => void;
  isPurchasingThis?: boolean;
}) {
  const navigate = useNavigate();
  const player = useGameStore((s) => s.player);
  const spendableXP = player?.spendableXP ?? player?.xp ?? 0;
  const priceXP = item.priceXP ?? 15000;
  const canAfford = spendableXP >= priceXP;
  const neededXP = Math.max(0, priceXP - spendableXP);
  const { days, hours, minutes, seconds } = useSeasonCountdown();

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/60 bg-gradient-to-br from-amber-950/70 via-slate-950 to-slate-900 p-5 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.35)] transition-all">
      {/* Background Animated Godrays & Sparkle Embers */}
      <div className="absolute -inset-24 pointer-events-none opacity-30 animate-[spin_40s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_30deg,rgba(245,158,11,0.4)_30deg_60deg,transparent_60deg_90deg,rgba(245,158,11,0.4)_90deg_120deg,transparent_120deg_150deg,rgba(245,158,11,0.4)_150deg_180deg,transparent_180deg_210deg,rgba(245,158,11,0.4)_210deg_240deg,transparent_240deg_270deg,rgba(245,158,11,0.4)_270deg_300deg,transparent_300deg_330deg,rgba(245,158,11,0.4)_330deg_360deg)]" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Sparks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Sparkles className="absolute top-4 right-12 h-5 w-5 text-amber-300/80 animate-pulse" />
        <Sparkles className="absolute bottom-6 left-1/4 h-4 w-4 text-amber-400/90 animate-bounce" />
        <div className="absolute top-1/2 right-1/3 w-2 h-2 rounded-full bg-amber-300/80 blur-[1px] animate-ping" />
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_260px] lg:grid-cols-[1fr_300px] gap-6 items-center">
        {/* Left Info Column */}
        <div className="space-y-4 text-left">
          {/* Top Badges Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white font-mono text-[10.5px] font-black uppercase tracking-wider shadow-md border border-rose-300/40">
              <Flame className="h-3.5 w-3.5 fill-white animate-bounce" />
              <span>SEASON 1 SPOTLIGHT</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[10.5px] font-bold uppercase tracking-wider">
              <Crown className="h-3 w-3 text-amber-400" />
              <span>GUARANTEED EPIC+</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono text-[10.5px] font-bold uppercase tracking-wider">
              <ShieldAlert className="h-3 w-3 text-cyan-400" />
              <span>NO COMMON DROPS</span>
            </span>
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5">
            <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]">
              {item.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {item.description} Contains 3 high-tier gear drops with boosted rates for Apex
              Specialist and Overlord Titan armaments.
            </p>
          </div>

          {/* Live Urgency Countdown Clock */}
          <div className="flex flex-wrap items-center gap-3 p-2.5 rounded-2xl bg-black/60 border border-amber-500/30 backdrop-blur-sm max-w-md">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-300 uppercase tracking-wider pl-1">
              <Clock
                className="h-4 w-4 text-amber-400 animate-spin"
                style={{ animationDuration: "8s" }}
              />
              <span>ENDS IN:</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-black text-white">
              <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-md text-amber-400">
                {days}d
              </span>
              <span className="text-slate-500">:</span>
              <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-md text-amber-400">
                {String(hours).padStart(2, "0")}h
              </span>
              <span className="text-slate-500">:</span>
              <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-md text-amber-400">
                {String(minutes).padStart(2, "0")}m
              </span>
              <span className="text-slate-500">:</span>
              <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-md text-amber-400 tabular-nums">
                {String(seconds).padStart(2, "0")}s
              </span>
            </div>
          </div>

          {/* Action CTAs & Price */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 pr-2">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-400">
                Price:
              </span>
              <span className="text-amber-300 font-mono font-black text-xl sm:text-2xl drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] flex items-center gap-1">
                <Zap className="h-5 w-5 fill-amber-400 text-amber-400" />
                {priceXP.toLocaleString()} XP
              </span>
            </div>

            <Button
              size="lg"
              variant="outline"
              onClick={() => onInspect(item)}
              className="font-mono text-xs uppercase tracking-wider font-extrabold cursor-pointer border-amber-500/40 bg-slate-900/80 text-amber-300 hover:bg-amber-950/60 hover:text-white py-2.5 px-4 rounded-xl transition-all"
            >
              <Trophy className="h-4 w-4 mr-1.5 text-amber-400" />
              INSPECT DROPS
            </Button>

            {canAfford ? (
              <Button
                size="lg"
                disabled={isPurchasingThis}
                onClick={() => onQuickBuy(item)}
                className="font-mono text-xs uppercase tracking-wider font-black cursor-pointer bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.6)] py-2.5 px-6 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                {isPurchasingThis ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="h-4 w-4 fill-slate-950 shrink-0" />
                    <span>UNLOCK NOW</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => navigate({ to: "/missions" })}
                className="font-mono text-xs uppercase tracking-wider font-black cursor-pointer bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)] py-2.5 px-5 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <Flame className="h-4 w-4 fill-black text-black shrink-0 animate-bounce" />
                <span>GET {neededXP.toLocaleString()} XP IN RAIDS</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Button>
            )}
          </div>
        </div>

        {/* Right 3D Pack Stage */}
        <motion.div
          whileHover={{ scale: 1.08, rotate: [-1, 2, -1, 0] }}
          transition={{ duration: 0.35 }}
          onClick={() => onInspect(item)}
          className="relative flex aspect-square md:aspect-auto md:h-64 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-black border-2 border-amber-500/40 p-4 shadow-inner cursor-pointer group"
        >
          <div className="absolute inset-0 bg-amber-500/10 rounded-2xl animate-pulse pointer-events-none" />
          <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
            <Pack3DChest packId={item.id} rarity={item.rarity} size="lg" floating={true} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function PackCard({
  item,
  onInspect,
  onQuickBuy,
  isPurchasingThis,
}: {
  item: ShopListing;
  onInspect: (item: ShopListing) => void;
  onQuickBuy: (item: ShopListing) => void;
  isPurchasingThis?: boolean;
}) {
  const navigate = useNavigate();
  const isRaider = item.id === "shop_pack_raider" || item.rarity === "common";
  const isSpecialist = item.id === "shop_pack_specialist" || item.rarity === "epic";
  const isLegendary = item.id === "shop_pack_legendary_raider" || item.rarity === "legendary";

  const player = useGameStore((s) => s.player);
  const spendableXP = player?.spendableXP ?? player?.xp ?? 0;
  const priceXP = item.priceXP ?? 5000;
  const canAfford = spendableXP >= priceXP;
  const neededXP = Math.max(0, priceXP - spendableXP);

  // Determine rarity border, asset container border, and button styling
  let cardBorderClass = "border-slate-800 hover:border-slate-600";
  let assetBorderClass = "border-slate-800";
  let inspectBtnStyle =
    "bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white";
  let quickBuyStyle =
    "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]";

  if (isRaider) {
    cardBorderClass =
      "border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.35)]";
    assetBorderClass = "border-cyan-500/30 group-hover:border-cyan-400/60";
    inspectBtnStyle = "bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/60";
    quickBuyStyle =
      "bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]";
  } else if (isSpecialist) {
    cardBorderClass =
      "border-purple-500/50 hover:border-purple-400 hover:shadow-[0_0_35px_rgba(168,85,247,0.45)]";
    assetBorderClass = "border-purple-500/40 group-hover:border-purple-400/70";
    inspectBtnStyle =
      "bg-slate-900 border border-purple-500/40 text-purple-300 hover:bg-purple-950/60";
    quickBuyStyle =
      "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-[0_0_18px_rgba(168,85,247,0.4)]";
  } else if (isLegendary) {
    cardBorderClass =
      "border-amber-500/60 hover:border-amber-400 hover:shadow-[0_0_45px_rgba(245,158,11,0.55)]";
    assetBorderClass = "border-amber-500/40 group-hover:border-amber-400/80";
    inspectBtnStyle =
      "bg-slate-900 border border-amber-500/40 text-amber-300 hover:bg-amber-950/60";
    quickBuyStyle =
      "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)]";
  }

  // Top Ribbon Badge
  let ribbonText = item.discountBadge;
  if (!ribbonText) {
    if (isSpecialist) ribbonText = "BEST VALUE";
    else if (isLegendary) ribbonText = "NO COMMON DROPS";
  }

  const isBestValue = ribbonText === "BEST VALUE";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex flex-col justify-between rounded-2xl bg-slate-900/80 backdrop-blur-md border transition-all p-4 sm:p-5 shadow-xl overflow-hidden ${cardBorderClass}`}
    >
      {/* Top Ribbon */}
      {ribbonText && (
        <div
          className={`absolute -top-0.5 right-4 z-20 flex items-center gap-1 rounded-b-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
            isBestValue
              ? "bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)] border-x border-b border-emerald-300/40"
              : "bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.8)] border-x border-b border-rose-300/40"
          }`}
        >
          <span>{ribbonText}</span>
        </div>
      )}

      <div>
        {/* Asset Display Container (3D Alcove Stage) with Interactive Wobble */}
        <motion.div
          whileHover={{ scale: 1.04, rotate: [-0.5, 1, -0.5, 0] }}
          transition={{ duration: 0.3 }}
          onClick={() => onInspect(item)}
          className={`relative flex h-48 sm:h-52 w-full cursor-pointer items-center justify-center pt-8 rounded-xl bg-gradient-to-b from-slate-950 via-slate-900 to-black border shadow-inner overflow-hidden transition-all duration-300 ${assetBorderClass}`}
        >
          {/* Cyan Soft Spotlight & Runic Floor for Raider Pack */}
          {isRaider && (
            <>
              <div className="absolute top-0 w-32 h-20 bg-cyan-500/10 blur-xl pointer-events-none" />
              <div className="absolute bottom-2 w-32 h-6 bg-cyan-500/20 rounded-full blur-md pointer-events-none" />
            </>
          )}

          {/* Swirling Purple Ambient Aura & Floating Particles for Specialist Pack */}
          {isSpecialist && (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-purple-950/30 to-purple-600/20 animate-pulse pointer-events-none" />
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-purple-300/80 blur-[0.5px] animate-bounce" />
                <div className="absolute top-3/4 right-1/3 w-2 h-2 rounded-full bg-purple-400/70 blur-[1px] animate-[pulse_2s_infinite]" />
                <div className="absolute bottom-1/4 left-2/3 w-1 h-1 rounded-full bg-purple-200/90 animate-[ping_3s_infinite]" />
              </div>
            </>
          )}

          {/* Radiating Golden Sunburst Rays & Sparkles for Legendary Pack */}
          {isLegendary && (
            <>
              <div className="absolute -inset-20 pointer-events-none opacity-30 animate-[spin_25s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_30deg,rgba(245,158,11,0.5)_30deg_60deg,transparent_60deg_90deg,rgba(245,158,11,0.5)_90deg_120deg,transparent_120deg_150deg,rgba(245,158,11,0.5)_150deg_180deg,transparent_180deg_210deg,rgba(245,158,11,0.5)_210deg_240deg,transparent_240deg_270deg,rgba(245,158,11,0.5)_270deg_300deg,transparent_300deg_330deg,rgba(245,158,11,0.5)_330deg_360deg)]" />
              <div className="absolute bottom-2 w-36 h-6 bg-amber-500/30 rounded-full blur-md pointer-events-none" />
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <Sparkles className="absolute top-3 left-4 h-4 w-4 text-amber-300/80 animate-pulse" />
                <Sparkles className="absolute bottom-4 right-5 h-5 w-5 text-amber-400/90 animate-[bounce_2s_infinite]" />
              </div>
            </>
          )}

          {/* Rarity Badge in top-left */}
          {item.rarity && (
            <div className="absolute top-2.5 left-2.5 z-20">
              <span
                className={`inline-flex items-center rounded border backdrop-blur-md bg-slate-950/80 text-[9.5px] px-2 py-0.5 font-bold uppercase tracking-wider ${
                  item.rarity === "common"
                    ? "text-cyan-400 border-cyan-500/40"
                    : item.rarity === "epic"
                      ? "text-purple-400 border-purple-500/40"
                      : item.rarity === "legendary"
                        ? "text-amber-400 border-amber-500/40"
                        : "text-slate-300 border-slate-700"
                }`}
              >
                {item.rarity}
              </span>
            </div>
          )}

          {/* 3D Chest Container Asset */}
          <div className="relative z-10 transition-transform duration-300 group-hover:scale-105">
            <Pack3DChest packId={item.id} rarity={item.rarity} size="md" floating={true} />
          </div>
        </motion.div>

        {/* Item Information */}
        <div className="mt-3.5 space-y-1">
          <h3
            onClick={() => onInspect(item)}
            className="cursor-pointer font-display font-black text-lg sm:text-xl text-slate-100 hover:text-amber-400 transition-colors tracking-tight"
          >
            {item.name}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed min-h-[2.5rem] line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>

      {/* Card Footer: XP Cost & Action CTA Buttons */}
      <div className="mt-4 border-t border-slate-800/80 pt-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Price:</span>
          <div className="flex items-center gap-1.5">
            {item.originalPriceXP && (
              <span className="text-slate-500 line-through text-xs font-mono font-semibold">
                {item.originalPriceXP.toLocaleString()} XP
              </span>
            )}
            <span className="text-amber-400 font-bold text-sm sm:text-base flex items-center gap-1 font-mono drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
              <Zap className="h-3.5 w-3.5 fill-amber-400" />
              <span>{item.priceXP?.toLocaleString()} XP</span>
            </span>
          </div>
        </div>

        {/* Dual Actions: [ INSPECT ] and [ QUICK BUY / GET MORE XP ] */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onInspect(item)}
            className={`font-mono text-[11px] uppercase tracking-wider font-extrabold cursor-pointer py-2 rounded-lg transition-all ${inspectBtnStyle}`}
          >
            INSPECT
          </Button>

          {canAfford ? (
            <Button
              size="sm"
              disabled={isPurchasingThis}
              onClick={() => onQuickBuy(item)}
              className={`font-mono text-[11px] uppercase tracking-wider font-black cursor-pointer py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${quickBuyStyle}`}
            >
              {isPurchasingThis ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Zap className="h-3 w-3 fill-current shrink-0" />
                  <span>QUICK BUY</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => navigate({ to: "/missions" })}
              className="font-mono text-[10.5px] uppercase tracking-wider font-black cursor-pointer py-2 rounded-lg transition-all bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-md flex items-center justify-center gap-1"
            >
              <Flame className="h-3 w-3 fill-black text-black shrink-0 animate-bounce" />
              <span>GET XP</span>
              <ArrowRight className="h-3 w-3 shrink-0" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ShopPage() {
  const navigate = useNavigate();
  const { data: listings } = useQuery({
    queryKey: ["shop"],
    queryFn: getShopListings,
  });

  const player = useGameStore((s) => s.player);

  const [selectedItem, setSelectedItem] = useState<ShopListing | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [purchasingItemId, setPurchasingItemId] = useState<string | null>(null);
  const [purchaseSuccessBanner, setPurchaseSuccessBanner] = useState<{
    name: string;
    isPack: boolean;
    quantity: number;
  } | null>(null);
  const [screenShake, setScreenShake] = useState(false);

  // Expandable Season Accordion States (Season 1 expanded by default)
  const [season1Expanded, setSeason1Expanded] = useState<boolean>(true);
  const [season2Expanded, setSeason2Expanded] = useState<boolean>(false);

  const [sort, setSort] = useState<string>("price-asc");

  const spendableXP = player?.spendableXP ?? player?.xp ?? 0;

  const packListings = (listings ?? []).filter(
    (item) => item.kind === "pack" || !!item.packGrantId,
  );

  // Identify featured pack (Legendary Raider or highest price pack)
  const featuredPack =
    packListings.find((p) => p.id === "shop_pack_legendary_raider" || p.rarity === "legendary") ||
    packListings[packListings.length - 1];

  const sortedListings = [...packListings].sort((a, b) => {
    if (sort === "price-asc") {
      const priceA = a.priceXP ?? 0;
      const priceB = b.priceXP ?? 0;
      return priceA - priceB;
    }
    if (sort === "price-desc") {
      const priceA = a.priceXP ?? 0;
      const priceB = b.priceXP ?? 0;
      return priceB - priceA;
    }
    if (sort === "name-asc") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  const handleInspect = (item: ShopListing) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleQuickBuy = async (item: ShopListing) => {
    const priceXP = item.priceXP ?? 5000;
    if (spendableXP < priceXP) {
      toast.error(`Not enough Spendable XP! You need ${priceXP.toLocaleString()} XP.`);
      return;
    }

    setPurchasingItemId(item.id);
    try {
      const res = await confirmPackPurchasePayload(item.id, priceXP, 1);
      if (res.success) {
        // Trigger audio & screen shake
        audio.play("shop.purchase");
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 300);

        // Pop Confetti
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.6 },
          colors: ["#06b6d4", "#a855f7", "#f59e0b", "#10b981", "#ec4899"],
        });

        toast.success(`Purchased 1x ${item.name}! Added to your Pack Vault.`, {
          duration: 1500,
          position: "bottom-center",
        });
        setPurchaseSuccessBanner({
          name: item.name,
          isPack: true,
          quantity: 1,
        });
      } else {
        toast.error(res.message || "Failed to complete quick purchase.", {
          duration: 1500,
          position: "bottom-center",
        });
      }
    } catch (_err) {
      toast.error("An error occurred during quick purchase.", {
        duration: 1500,
        position: "bottom-center",
      });
    } finally {
      setPurchasingItemId(null);
    }
  };

  return (
    <AppShell>
      {/* ATMOSPHERIC DARK FANTASY DUNGEON OVERLAY BACKGROUND */}
      <div
        className={`relative min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/90 via-[#07090e]/95 to-[#040508] -m-6 p-6 sm:-m-8 sm:p-8 ${screenShake ? "animate-[bounce_0.25s_ease-in-out]" : ""}`}
      >
        {/* Floating Ambient Energy Embers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          <div className="absolute top-10 left-1/6 w-2 h-2 rounded-full bg-amber-400/80 blur-[1px] animate-[ping_4s_infinite]" />
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-cyan-400/80 blur-[0.5px] animate-bounce" />
          <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 rounded-full bg-purple-400/70 blur-[1px] animate-[pulse_3s_infinite]" />
          <div className="absolute top-2/3 right-1/6 w-1 h-1 rounded-full bg-amber-300/90 animate-[ping_5s_infinite]" />
        </div>

        <div className="space-y-4 max-w-7xl mx-auto pb-[90px] relative z-10">
          <PageHeader title="MARKET" />
          {/* STREAMLINED SINGLE-BAR HEADER WITH SPENDABLE XP PARITY */}
          <MarketHeaderControl
            activeTab="shop"
            onTabChange={(tab) => {
              if (tab === "forge") navigate({ to: "/forge" });
            }}
          />

          <ArmorySwipeContainer>
            {/* PURCHASE SUCCESS BANNER */}
            {purchaseSuccessBanner && (
              <div className="rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-3 sm:p-4 shadow-md flex items-center justify-between gap-3 sm:gap-4 animate-in slide-in-from-top-2 mb-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="font-display font-bold text-xs sm:text-sm text-emerald-300">
                      {purchaseSuccessBanner.quantity > 1
                        ? `${purchaseSuccessBanner.quantity}x ${purchaseSuccessBanner.name}`
                        : purchaseSuccessBanner.name}{" "}
                      Acquired!
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      {purchaseSuccessBanner.isPack
                        ? "Pack delivered to your Pack Vault. Ready to open."
                        : "Item added directly to your Raider equipment storage."}
                    </p>
                  </div>
                </div>

                {purchaseSuccessBanner.isPack ? (
                  <Link to="/packs">
                    <Button
                      size="sm"
                      className="bg-emerald-500 text-black hover:bg-emerald-400 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0"
                    >
                      <Gift className="mr-1.5 h-3.5 w-3.5" /> Open Vault
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPurchaseSuccessBanner(null)}
                    className="text-xs text-slate-400 cursor-pointer shrink-0"
                  >
                    Dismiss
                  </Button>
                )}
              </div>
            )}

            {/* DYNAMIC FEATURED HERO BANNER */}
            {featuredPack && (
              <div className="mb-4">
                <FeaturedHeroBanner
                  item={featuredPack}
                  onInspect={handleInspect}
                  onQuickBuy={handleQuickBuy}
                  isPurchasingThis={purchasingItemId === featuredPack.id}
                />
              </div>
            )}

            {/* STREAMLINED CONTRIBUTOR PERK COMPACT BANNER */}
            <div className="mb-4">
              <ContributorPassPromoBanner
                variant="compact"
                headline="FREE MONTHLY VAULT PACKS"
                subtext="Supporters receive monthly pack allocations & exclusive loot."
              />
            </div>

            {/* EXPANDABLE SEASON 1 ACCORDION CONTAINER */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-950/60 backdrop-blur-md overflow-hidden shadow-xl mb-4">
              {/* Accordion Header Bar */}
              <div
                onClick={() => setSeason1Expanded((prev) => !prev)}
                className="w-full flex items-center justify-between p-3.5 sm:p-4 bg-slate-900/80 hover:bg-slate-900 border-b border-slate-800/80 cursor-pointer transition-colors select-none"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display font-black text-sm sm:text-base tracking-wider text-slate-100 uppercase">
                      SEASON 1 VAULT PACKS
                    </h2>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      LIVE NOW
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort Dropdown */}
                  <div onClick={(e) => e.stopPropagation()} className="hidden xs:block">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                    >
                      <option value="price-asc">PRICE: LOW TO HIGH</option>
                      <option value="price-desc">PRICE: HIGH TO LOW</option>
                      <option value="name-asc">NAME</option>
                    </select>
                  </div>

                  <motion.div
                    animate={{ rotate: season1Expanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </div>
              </div>

              {/* Accordion Collapsible Content Area */}
              <AnimatePresence initial={false}>
                {season1Expanded && (
                  <motion.div
                    key="season1-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-3.5 sm:p-5">
                      {/* LOOT PACK CARDS GRID */}
                      <div className="grid gap-3.5 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {sortedListings.map((l) => (
                          <PackCard
                            key={l.id}
                            item={l}
                            onInspect={handleInspect}
                            onQuickBuy={handleQuickBuy}
                            isPurchasingThis={purchasingItemId === l.id}
                          />
                        ))}
                      </div>

                      {sortedListings.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/60 p-8 text-center font-mono text-sm text-slate-400">
                          No packs currently available.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* UPCOMING SEASON 2 ACCORDION TEASER */}
            <div className="rounded-2xl border border-slate-800/50 bg-slate-950/40 overflow-hidden">
              <div
                onClick={() => setSeason2Expanded((prev) => !prev)}
                className="w-full flex items-center justify-between p-3.5 sm:p-4 bg-slate-900/40 hover:bg-slate-900/60 cursor-pointer transition-colors select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-xs sm:text-sm tracking-wider text-slate-400 uppercase">
                      SEASON 2: DEEP PROTOCOLS
                    </h3>
                    <span className="font-mono text-[9px] font-bold px-2 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      COMING SOON
                    </span>
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: season2Expanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-6 h-6 rounded-md bg-slate-800/50 flex items-center justify-center text-slate-500"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </motion.div>
              </div>

              <AnimatePresence initial={false}>
                {season2Expanded && (
                  <motion.div
                    key="season2-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 text-center font-mono text-xs text-slate-400 bg-slate-900/20 border-t border-slate-800/40">
                      Season 2 Vault Packs, exclusive Specialist Gear sets, and advanced drop
                      matrices will be unlocked in the next major patch.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ROADMAP PROMO BANNER */}
            <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-900/90 p-4 sm:p-6 shadow-xl space-y-3 font-mono">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-400 uppercase tracking-wider bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    <Rocket className="h-3.5 w-3.5" />
                    <span>LIVING ROADMAP</span>
                  </div>
                  <h3 className="font-display font-black text-base sm:text-lg text-white tracking-wide">
                    COMING SOON: EXPANDED FEATURES & RAID ECOSYSTEM
                  </h3>
                  <p className="text-slate-300 text-xs font-sans leading-relaxed">
                    Curious what is brewing for Fartboy Raid? Check our living roadmap for upcoming
                    items, cosmetic crafting, and war room expansions!
                  </p>
                </div>

                {/* // TODO: Connect roadmap to live feature voting API POST /api/roadmap/vote */}
                <Link to="/roadmap" className="shrink-0 w-full sm:w-auto">
                  <Button
                    type="button"
                    className="w-full sm:w-auto font-mono text-xs font-black uppercase text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 border border-amber-300 gap-2 rounded-xl cursor-pointer shadow-md active:scale-95 transition-all px-4 py-2.5"
                  >
                    <Rocket className="h-4 w-4 fill-slate-950" />
                    <span>🚀 VIEW ROADMAP</span>
                  </Button>
                </Link>
              </div>
            </div>
          </ArmorySwipeContainer>
        </div>

        {/* MODALS */}
        <ProductDetailsModal
          item={selectedItem}
          open={modalOpen}
          onOpenChange={setModalOpen}
          onPurchaseSuccess={(qty = 1) => {
            if (selectedItem) {
              setPurchaseSuccessBanner({
                name: selectedItem.name,
                isPack: true,
                quantity: qty,
              });
            }
          }}
        />
      </div>
    </AppShell>
  );
}

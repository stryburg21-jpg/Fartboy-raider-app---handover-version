import { useState, useEffect } from "react";
import { Sparkles, Star, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Rarity } from "@/types/game";

export interface ShowcaseDropItem {
  id: string;
  name: string;
  slot: string;
  rarity: Rarity;
  icon: string;
  powerBonus: string;
  dropRate: string;
  description: string;
}

export const SPOTLIGHT_DROPS_BY_PACK: Record<string, ShowcaseDropItem[]> = {
  shop_pack_legendary_raider: [
    {
      id: "drop_apex_halo",
      name: "Apex Raid Specialist Halo",
      slot: "Hat",
      rarity: "mythic",
      icon: "🌟",
      powerBonus: "+120 Power • +60% XP",
      dropRate: "0.5%",
      description: "Celestial gold ring granting supreme raid dominance and legendary aura.",
    },
    {
      id: "drop_apex_plate",
      name: "Apex Raid Sovereign Plate",
      slot: "Top",
      rarity: "mythic",
      icon: "✨",
      powerBonus: "+120 Power • +60% XP",
      dropRate: "0.5%",
      description: "Infused with pristine astral ether that shatters social media ratios.",
    },
    {
      id: "drop_overlord_helm",
      name: "Overlord Methane Helm",
      slot: "Hat",
      rarity: "legendary",
      icon: "🐲",
      powerBonus: "+85 Power • +40% XP",
      dropRate: "4.5%",
      description: "Heavy titanium helm surging with toxic hype and raid aggression.",
    },
    {
      id: "drop_overlord_suit",
      name: "Overlord Bio-Suit Top",
      slot: "Top",
      rarity: "legendary",
      icon: "☣️",
      powerBonus: "+85 Power • +40% XP",
      dropRate: "4.5%",
      description: "Hermetically sealed armor retaining concentrated hyper-engagement.",
    },
    {
      id: "drop_dragon_wings",
      name: "Golden Dragon Wings",
      slot: "Cape",
      rarity: "legendary",
      icon: "🐉",
      powerBonus: "+85 Power • +40% XP",
      dropRate: "3.8%",
      description: "Shimmering mythical wings that inspire maximum community momentum.",
    },
    {
      id: "drop_chrono_boots",
      name: "Quantum Chrono Boots",
      slot: "Boots",
      rarity: "legendary",
      icon: "⚡",
      powerBonus: "+85 Power • +40% XP",
      dropRate: "4.2%",
      description: "Enables instant reaction sniping before feeds can refresh.",
    },
  ],
  shop_pack_specialist: [
    {
      id: "drop_spec_crown",
      name: "Raid Specialist Crown",
      slot: "Hat",
      rarity: "epic",
      icon: "👑",
      powerBonus: "+45 Power • +20% XP",
      dropRate: "12.0%",
      description: "Worn by field commanders who rally hundreds of raiders simultaneously.",
    },
    {
      id: "drop_spec_cuirass",
      name: "Raid Specialist Cuirass",
      slot: "Top",
      rarity: "epic",
      icon: "🥇",
      powerBonus: "+45 Power • +20% XP",
      dropRate: "12.0%",
      description: "Gleaming tactical armor tuned specifically to social campaign algorithms.",
    },
    {
      id: "drop_meme_lord_cape",
      name: "Holographic Pepe Cape",
      slot: "Cape",
      rarity: "epic",
      icon: "🐸",
      powerBonus: "+45 Power • +20% XP",
      dropRate: "10.5%",
      description: "Radiates viral energy that multiplies graphic and meme engagement.",
    },
    {
      id: "drop_overlord_helm_spec",
      name: "Overlord Methane Helm",
      slot: "Hat",
      rarity: "legendary",
      icon: "🐲",
      powerBonus: "+85 Power • +40% XP",
      dropRate: "2.5%",
      description: "Heavy titanium helm surging with toxic hype and raid aggression.",
    },
  ],
  shop_pack_raider: [
    {
      id: "drop_commando_visor",
      name: "Commando Tactical Visor",
      slot: "Hat",
      rarity: "rare",
      icon: "🥽",
      powerBonus: "+25 Power • +10% XP",
      dropRate: "18.0%",
      description: "HUD overlay tracking active raiding channels and engagement spikes.",
    },
    {
      id: "drop_commando_rig",
      name: "Commando Tactical Rig",
      slot: "Top",
      rarity: "rare",
      icon: "🥋",
      powerBonus: "+25 Power • +10% XP",
      dropRate: "18.0%",
      description: "Stacked with quick-deploy raid macros and reply arsenal.",
    },
    {
      id: "drop_spec_crown_raider",
      name: "Raid Specialist Crown",
      slot: "Hat",
      rarity: "epic",
      icon: "👑",
      powerBonus: "+45 Power • +20% XP",
      dropRate: "6.0%",
      description: "Worn by field commanders who rally hundreds of raiders simultaneously.",
    },
    {
      id: "drop_overlord_helm_raider",
      name: "Overlord Methane Helm",
      slot: "Hat",
      rarity: "legendary",
      icon: "🐲",
      powerBonus: "+85 Power • +40% XP",
      dropRate: "2.0%",
      description: "Heavy titanium helm surging with toxic hype and raid aggression.",
    },
  ],
};

export function PackPotentialDropsCarousel({
  packId,
  rarity = "epic",
}: {
  packId: string;
  rarity?: Rarity | string;
}) {
  const drops =
    SPOTLIGHT_DROPS_BY_PACK[packId] ||
    (rarity === "legendary"
      ? SPOTLIGHT_DROPS_BY_PACK.shop_pack_legendary_raider
      : rarity === "epic"
        ? SPOTLIGHT_DROPS_BY_PACK.shop_pack_specialist
        : SPOTLIGHT_DROPS_BY_PACK.shop_pack_raider);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Autoplay rotation every 3.2s
  useEffect(() => {
    if (!isAutoPlaying || drops.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % drops.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isAutoPlaying, drops.length]);

  const currentItem = drops[activeIndex] || drops[0];

  const getRarityTheme = (r: Rarity) => {
    switch (r) {
      case "mythic":
        return {
          badge: "bg-pink-500/20 text-pink-300 border-pink-500/40",
          border: "border-pink-500/50",
          glow: "shadow-[0_0_20px_rgba(236,72,153,0.35)]",
          text: "text-pink-400",
          bg: "from-pink-950/50 via-slate-900 to-black",
        };
      case "legendary":
        return {
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          border: "border-amber-500/50",
          glow: "shadow-[0_0_20px_rgba(245,158,11,0.35)]",
          text: "text-amber-400",
          bg: "from-amber-950/50 via-slate-900 to-black",
        };
      case "epic":
        return {
          badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
          border: "border-purple-500/50",
          glow: "shadow-[0_0_20px_rgba(168,85,247,0.35)]",
          text: "text-purple-400",
          bg: "from-purple-950/50 via-slate-900 to-black",
        };
      default:
        return {
          badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
          border: "border-cyan-500/50",
          glow: "shadow-[0_0_20px_rgba(6,182,212,0.35)]",
          text: "text-cyan-400",
          bg: "from-cyan-950/50 via-slate-900 to-black",
        };
    }
  };

  const theme = getRarityTheme(currentItem.rarity);

  return (
    <div
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      className="rounded-2xl border border-amber-500/30 bg-slate-950/80 p-3.5 space-y-3 shadow-xl overflow-hidden relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between font-mono text-[10.5px]">
        <div className="flex items-center gap-1.5 font-black uppercase text-amber-300 tracking-wider">
          <Trophy className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
          <span>POTENTIAL HIGH-TIER DROPS</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev - 1 + drops.length) % drops.length)}
            className="w-5 h-5 rounded flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            aria-label="Previous drop preview"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-slate-400 font-bold text-[9.5px]">
            {activeIndex + 1}/{drops.length}
          </span>
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev + 1) % drops.length)}
            className="w-5 h-5 rounded flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            aria-label="Next drop preview"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Showcase Stage Card */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-black p-3 shadow-inner">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, x: 20, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex items-center gap-3.5"
          >
            {/* 3D Item Icon Box */}
            <div
              className={`relative shrink-0 w-16 h-16 rounded-xl border flex items-center justify-center bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.glow}`}
            >
              <div className="absolute inset-0 bg-white/5 rounded-xl animate-pulse pointer-events-none" />
              <span className="text-3xl filter drop-shadow-md select-none transform transition-transform hover:scale-110">
                {currentItem.icon}
              </span>
              <span
                className={`absolute -top-1.5 -right-1.5 text-[8px] font-mono font-black uppercase px-1 rounded border shadow ${theme.badge}`}
              >
                {currentItem.rarity}
              </span>
            </div>

            {/* Info Section */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-1">
                <h4 className="font-display font-black text-xs sm:text-sm text-white truncate tracking-tight">
                  {currentItem.name}
                </h4>
                <span className="font-mono text-[9.5px] font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 shrink-0">
                  {currentItem.slot}
                </span>
              </div>

              <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1 leading-snug">
                {currentItem.description}
              </p>

              <div className="flex items-center justify-between pt-0.5 font-mono text-[9.5px]">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {currentItem.powerBonus}
                </span>
                <span className="text-slate-400 font-semibold">
                  Est. Rate: <strong className="text-white">{currentItem.dropRate}</strong>
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mini Thumbnails Selector Strip */}
      <div className="flex items-center justify-center gap-1.5 pt-0.5">
        {drops.map((d, idx) => {
          const isSelected = idx === activeIndex;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`h-7 w-7 rounded-lg border text-sm flex items-center justify-center transition-all cursor-pointer select-none ${
                isSelected
                  ? "border-amber-400 bg-amber-500/20 scale-110 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  : "border-slate-800 bg-slate-900/60 opacity-60 hover:opacity-100 hover:border-slate-700"
              }`}
              title={d.name}
            >
              {d.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { useState, useRef } from "react";
import {
  Rocket,
  ArrowLeft,
  Sparkles,
  Shield,
  Layers,
  Swords,
  Users2,
  Castle,
  Shirt,
  Bot,
  Flame,
  CheckCircle2,
  Clock,
  Compass,
  Zap,
  Target,
  Trophy,
  Package,
  Award,
  Crown,
  Share2,
  ChevronDown,
  Sparkle,
  Dices,
  Eye,
  Handshake,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { RaiderAvatar } from "@/components/game/RaiderAvatar";
import { useGameStore } from "@/store/gameStore";
import { toast } from "sonner";

interface FutureIdeasViewProps {
  onBack?: () => void;
  isModal?: boolean;
}

type SectionKey = "roadmap" | "gameplay" | "guilds" | "powers";

interface MicroCardItem {
  icon: string | React.ElementType;
  title: string;
  subtext: string;
  badge?: string;
  color?: "cyan" | "indigo" | "emerald" | "amber" | "fuchsia" | "purple";
}

export function FutureIdeasView({ onBack }: FutureIdeasViewProps) {
  const player = useGameStore((s) => s.player);

  // Accordion open/collapsed state — ALL COLLAPSED BY DEFAULT as requested
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    roadmap: false,
    gameplay: false,
    guilds: false,
    powers: false,
  });

  const [activeJumpSection, setActiveJumpSection] = useState<SectionKey>("roadmap");

  // Section refs for smooth scrolling
  const roadmapRef = useRef<HTMLDivElement>(null);
  const gameplayRef = useRef<HTMLDivElement>(null);
  const guildsRef = useRef<HTMLDivElement>(null);
  const powersRef = useRef<HTMLDivElement>(null);

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleJumpToSection = (key: SectionKey) => {
    setActiveJumpSection(key);
    // Ensure section is opened
    setOpenSections((prev) => ({
      ...prev,
      [key]: true,
    }));

    setTimeout(() => {
      const refMap: Record<SectionKey, React.RefObject<HTMLDivElement | null>> = {
        roadmap: roadmapRef,
        gameplay: gameplayRef,
        guilds: guildsRef,
        powers: powersRef,
      };
      const target = refMap[key]?.current;
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  const handleShareVision = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Vision link copied to clipboard!");
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 font-mono pb-[90px] max-w-5xl mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          1. NAVIGATION & TOP BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="group flex items-center gap-2 font-mono text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/50 hover:bg-cyan-950/90 border border-cyan-500/30 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>RETURN TO SEASON PASS</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-400">
            <Rocket className="h-4 w-4 text-cyan-400" />
            <span>FARTBOY RAID VISION</span>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleShareVision}
          className="font-mono text-[11px] font-bold border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/60 rounded-xl h-8 px-3"
        >
          <Share2 className="h-3.5 w-3.5 mr-1.5" />
          <span>Share</span>
        </Button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. COMPACT HERO BANNER
      ───────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/90 via-slate-950 to-indigo-950/90 p-4 sm:p-6 shadow-xl space-y-2.5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-500/15 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-36 w-36 rounded-full bg-indigo-500/15 blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 px-2.5 py-0.5 font-mono text-[10px] font-black text-cyan-300">
              <Sparkles className="h-3 w-3 text-cyan-400 animate-spin" />
              <span>LONG-TERM GAME ROADMAP</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>FUTURE IDEAS</span>
              <span>🚀</span>
            </h1>
            <p className="font-mono text-xs sm:text-sm font-semibold text-cyan-300">
              Where could Fartboy Raid go next? Explore the multi-season blueprint.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-slate-950/80 border border-amber-500/30 px-3 py-2 shrink-0">
            <Shield className="h-4 w-4 text-amber-400 shrink-0" />
            <div className="text-[10px] text-slate-300 font-sans leading-tight">
              <span className="font-bold text-amber-300 block font-mono">SEASON-BY-SEASON</span>
              Ideas evolve with community demand & dev capacity.
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. STICKY TOP JUMP-NAV BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 -mx-1 px-1 py-1.5 bg-slate-950/90 backdrop-blur-md border-y border-cyan-500/20 shadow-md">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { key: "roadmap" as SectionKey, label: "🚀 Roadmap", name: "Roadmap" },
            { key: "gameplay" as SectionKey, label: "⚔️ Gameplay", name: "Gameplay" },
            { key: "guilds" as SectionKey, label: "🛡️ Guilds", name: "Guilds" },
            { key: "powers" as SectionKey, label: "⚡ Powers", name: "Powers" },
          ].map((tab) => {
            const isOpen = openSections[tab.key];
            const isJumpActive = activeJumpSection === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleJumpToSection(tab.key)}
                className={`flex-1 shrink-0 min-w-[90px] sm:min-w-0 py-1.5 px-2.5 rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider text-center transition-all cursor-pointer select-none active:scale-95 whitespace-nowrap border ${
                  isJumpActive || isOpen
                    ? "bg-[#FFC700] text-black border-[#FFC700] shadow-[0_0_10px_rgba(255,199,0,0.35)] font-black"
                    : "bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. ACCORDION 1: 🚀 FUTURE IDEAS & ROADMAP
      ───────────────────────────────────────────────────────────── */}
      <div
        ref={roadmapRef}
        className="rounded-2xl border border-cyan-500/30 bg-slate-950/90 overflow-hidden shadow-lg scroll-mt-14"
      >
        <button
          type="button"
          onClick={() => toggleSection("roadmap")}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-950 hover:bg-cyan-950/80 transition-colors text-left cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-500/20 border border-cyan-400 text-lg shadow-inner">
              🚀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm sm:text-base text-white uppercase tracking-wide">
                  FUTURE IDEAS & ROADMAP
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Collectibles & Web3
                </span>
              </div>
              <p className="font-mono text-[11px] text-cyan-300/80">
                More to Collect, Cosmetics & The Web3 Evolution
              </p>
            </div>
          </div>

          <ChevronDown
            className={`h-5 w-5 text-cyan-400 transition-transform duration-200 shrink-0 ${
              openSections.roadmap ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {openSections.roadmap && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-cyan-500/20 p-4 space-y-4 bg-[#0A0E17]"
            >
              {/* SUB-SECTION A: MORE TO COLLECT (2-COLUMN MICRO-CARDS) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[11px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                    <span>🧑‍🚀</span>
                    <span>MORE TO COLLECT</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">10 Expansion Tracks</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      icon: Users2,
                      title: "More Characters",
                      subtext: "Diverse archetypes, base models & raid classes",
                      badge: "Roster",
                    },
                    {
                      icon: Shirt,
                      title: "More Equipment",
                      subtext: "Visors, specialized armor, boots & backpieces",
                      badge: "Arsenal",
                    },
                    {
                      icon: Layers,
                      title: "More Item Sets",
                      subtext: "Synergy set bonuses & unique passive loadouts",
                      badge: "Synergy",
                    },
                    {
                      icon: Crown,
                      title: "More Rarities",
                      subtext: "Mythic, Relic, and Celestial tier gear classes",
                      badge: "Tiers",
                    },
                    {
                      icon: Package,
                      title: "More Packs",
                      subtext: "Seasonal thematic loot unboxings & event crates",
                      badge: "Crates",
                    },
                    {
                      icon: Zap,
                      title: "More Stats",
                      subtext: "Speed, Critical Strike, Luck, and Raid Power",
                      badge: "Attributes",
                    },
                    {
                      icon: Award,
                      title: "More Achievements",
                      subtext: "Prestige milestone badges & progressive titles",
                      badge: "Prestige",
                    },
                    {
                      icon: Compass,
                      title: "Mastery Progression",
                      subtext: "Class mastery trees & permanent perk unlocks",
                      badge: "Talents",
                    },
                    {
                      icon: Sparkles,
                      title: "Visual VFX & Auras",
                      subtext: "Equipped cosmic particles, trails & sound effects",
                      badge: "Cosmetics",
                    },
                    {
                      icon: Trophy,
                      title: "Collection Vaults",
                      subtext: "Comprehensive gear showcases & trophy rooms",
                      badge: "Vaults",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 flex items-center justify-between gap-2.5 hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <item.icon className="h-4 w-4 text-cyan-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="font-display font-black text-xs text-white block truncate">
                            {item.title}
                          </span>
                          <span className="font-sans text-[11px] text-slate-400 block truncate">
                            {item.subtext}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-[9px] font-bold text-cyan-300 bg-cyan-950 border border-cyan-500/30 px-1.5 py-0.5 rounded shrink-0">
                        {item.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SUB-SECTION B: THE WEB3 EVOLUTION (2-COLUMN MICRO-CARDS) */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[11px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                    <span>🔗</span>
                    <span>THE WEB3 EVOLUTION</span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-300">True Player Custody</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      icon: "💎",
                      title: "On-Chain Assets",
                      subtext: "Mint high-tier items into genuine digital collectibles.",
                    },
                    {
                      icon: "🔐",
                      title: "Digital Ownership",
                      subtext: "True custody without centralized walls or lockout.",
                    },
                    {
                      icon: "⚖️",
                      title: "Trading & Marketplace",
                      subtext: "Community barter to trade rare cosmetics with players.",
                    },
                    {
                      icon: "🚀",
                      title: "Cross-Season Utility",
                      subtext: "Carry prestige value forward across future game releases.",
                    },
                  ].map((card, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-indigo-500/30 bg-slate-950/80 p-2.5 flex items-center gap-2.5 hover:border-indigo-400 transition-colors"
                    >
                      <span className="text-xl shrink-0">{card.icon}</span>
                      <div className="min-w-0">
                        <span className="font-display font-black text-xs text-white block truncate">
                          {card.title}
                        </span>
                        <span className="font-sans text-[11px] text-slate-300 block truncate">
                          {card.subtext}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. ACCORDION 2: ⚔️ GAMEPLAY SYSTEMS
      ───────────────────────────────────────────────────────────── */}
      <div
        ref={gameplayRef}
        className="rounded-2xl border border-emerald-500/30 bg-slate-950/90 overflow-hidden shadow-lg scroll-mt-14"
      >
        <button
          type="button"
          onClick={() => toggleSection("gameplay")}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 hover:bg-emerald-950/80 transition-colors text-left cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/20 border border-emerald-400 text-lg shadow-inner">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm sm:text-base text-white uppercase tracking-wide">
                  GAMEPLAY SYSTEMS
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Combat & Raids
                </span>
              </div>
              <p className="font-mono text-[11px] text-emerald-300/80">
                Daily Battles, Weekly Raids, World Bosses & Dynamic Gear
              </p>
            </div>
          </div>

          <ChevronDown
            className={`h-5 w-5 text-emerald-400 transition-transform duration-200 shrink-0 ${
              openSections.gameplay ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {openSections.gameplay && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-emerald-500/20 p-4 space-y-4 bg-[#0A0E17]"
            >
              <div className="space-y-2">
                <div className="font-mono text-[11px] font-black uppercase text-emerald-400 tracking-wider">
                  ENCOUNTER TIERS & BATTLES
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      icon: "👾",
                      title: "Daily Battles",
                      subtext: "Fast-paced daily monsters & bonus loot cache claims.",
                      badge: "Daily",
                    },
                    {
                      icon: "🐉",
                      title: "Weekly Raids",
                      subtext: "Tiered multi-phase encounters with escalating difficulty.",
                      badge: "Weekly",
                    },
                    {
                      icon: "💀",
                      title: "World Bosses",
                      subtext: "Server-wide multi-million HP behemoths chipped together.",
                      badge: "Epic",
                    },
                    {
                      icon: "⚡",
                      title: "Combat Loadouts",
                      subtext: "Gear stats directly determine damage, defense & speed.",
                      badge: "Stats",
                    },
                  ].map((card, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-emerald-500/30 bg-slate-950/80 p-3 flex items-center justify-between gap-2.5 hover:border-emerald-400 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0">{card.icon}</span>
                        <div className="min-w-0">
                          <span className="font-display font-black text-xs text-white block truncate">
                            {card.title}
                          </span>
                          <span className="font-sans text-[11px] text-slate-300 block truncate">
                            {card.subtext}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-[9px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-500/30 px-1.5 py-0.5 rounded shrink-0">
                        {card.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DYNAMIC GEAR VISUAL ENGINE */}
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-500/20 border border-cyan-400 text-lg">
                    🎭
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-display font-black text-xs text-white block">
                      DYNAMIC VISUAL IDENTITY
                    </span>
                    <span className="font-sans text-[11px] text-cyan-200 block">
                      Every helmet, cape, and mythic item visibly alters your live avatar across
                      raids.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <RaiderAvatar
                    avatar={player?.avatar || "/assets/avatar/base/fartboy-3d-raider.png"}
                    username={player?.username || "Raider"}
                    sizeClassName="h-10 w-10 border border-cyan-400"
                  />
                  <div className="text-[10px] font-mono text-cyan-300">
                    <span className="font-bold block">{player?.username || "Raider"}</span>
                    <span className="text-slate-400">Lv. {player?.level ?? 42}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. ACCORDION 3: 🛡️ GUILDS & COMMUNITY
      ───────────────────────────────────────────────────────────── */}
      <div
        ref={guildsRef}
        className="rounded-2xl border border-amber-500/30 bg-slate-950/90 overflow-hidden shadow-lg scroll-mt-14"
      >
        <button
          type="button"
          onClick={() => toggleSection("guilds")}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 hover:bg-amber-950/80 transition-colors text-left cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/20 border border-amber-400 text-lg shadow-inner">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm sm:text-base text-white uppercase tracking-wide">
                  GUILDS & COMMUNITY
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Social Warfare
                </span>
              </div>
              <p className="font-mono text-[11px] text-amber-300/80">
                Guilds & Squads, Shared Vaults & Cooperative Army
              </p>
            </div>
          </div>

          <ChevronDown
            className={`h-5 w-5 text-amber-400 transition-transform duration-200 shrink-0 ${
              openSections.guilds ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {openSections.guilds && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-amber-500/20 p-4 space-y-4 bg-[#0A0E17]"
            >
              <div className="space-y-2">
                <div className="font-mono text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <span>🏰</span>
                  <span>GUILD SYSTEMS & SQUADS</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      icon: "🤝",
                      title: "Create or Join Guilds",
                      subtext: "Custom banners, squad roles, officer rank permissions.",
                    },
                    {
                      icon: "🎯",
                      title: "Shared Guild Objectives",
                      subtext: "Co-op mega-tier season goals and shared progression.",
                    },
                    {
                      icon: "⚡",
                      title: "Guild Missions & Raids",
                      subtext: "Exclusive squad raids tailored for synchronized teams.",
                    },
                    {
                      icon: "👹",
                      title: "Cooperative Bosses",
                      subtext: "Multi-player boss encounters requiring mixed gear roles.",
                    },
                    {
                      icon: "🏆",
                      title: "Guild Hall Trophies",
                      subtext: "Permanent badges & achievement display for the squad.",
                    },
                    {
                      icon: "⚔️",
                      title: "Guild-vs-Guild War",
                      subtext: "Seasonal leaderboard warfare for ultimate prestige.",
                    },
                  ].map((g, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 flex items-center gap-2.5 hover:border-amber-500/40 transition-colors"
                    >
                      <span className="text-lg shrink-0">{g.icon}</span>
                      <div className="min-w-0">
                        <span className="font-display font-black text-xs text-white block truncate">
                          {g.title}
                        </span>
                        <span className="font-sans text-[11px] text-slate-400 block truncate">
                          {g.subtext}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* THE COMMUNITY IS THE ARMY HIGHLIGHT */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-center space-y-1">
                <span className="font-display font-black text-xs text-amber-300 uppercase tracking-wider block">
                  "THE COMMUNITY IS THE ARMY"
                </span>
                <p className="font-sans text-[11px] text-slate-300">
                  Shared objectives, group rewards, and community-wide milestones power the
                  progression of all players.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          7. ACCORDION 4: ⚡ SPECIAL POWERS & TRANSPARENCY
      ───────────────────────────────────────────────────────────── */}
      <div
        ref={powersRef}
        className="rounded-2xl border border-fuchsia-500/30 bg-slate-950/90 overflow-hidden shadow-lg scroll-mt-14"
      >
        <button
          type="button"
          onClick={() => toggleSection("powers")}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-fuchsia-950/60 via-slate-900 to-slate-950 hover:bg-fuchsia-950/80 transition-colors text-left cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-fuchsia-500/20 border border-fuchsia-400 text-lg shadow-inner">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm sm:text-base text-white uppercase tracking-wide">
                  SPECIAL POWERS & TRANSPARENCY
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                  Meta & Dev Note
                </span>
              </div>
              <p className="font-mono text-[11px] text-fuchsia-300/80">
                Discord Bot Commands, Meta-Abilities & Dev Commitment
              </p>
            </div>
          </div>

          <ChevronDown
            className={`h-5 w-5 text-fuchsia-400 transition-transform duration-200 shrink-0 ${
              openSections.powers ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {openSections.powers && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-fuchsia-500/20 p-4 space-y-4 bg-[#0A0E17]"
            >
              <div className="space-y-2">
                <div className="font-mono text-[11px] font-black uppercase text-fuchsia-400 tracking-wider flex items-center gap-1.5">
                  <span>🤖</span>
                  <span>DISCORD & META-ABILITIES</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      icon: "💬",
                      title: "Discord Roles & Reactions",
                      subtext: "Gear unlocks custom Discord roles & reaction tags.",
                    },
                    {
                      icon: "🔮",
                      title: "Mythic Global Powers",
                      subtext: "Game-wide raid victory alerts broadcasted to all.",
                    },
                    {
                      icon: "🤖",
                      title: "Special Bot Commands",
                      subtext: "Summon the Raid Bot with exclusive squad commands.",
                    },
                    {
                      icon: "✨",
                      title: "Custom Unboxing VFX",
                      subtext: "Celebratory animations & sound triggers upon opening.",
                    },
                    {
                      icon: "💥",
                      title: "Community Multipliers",
                      subtext: "Global drop rate buffs triggered on milestone clears.",
                    },
                    {
                      icon: "🛡️",
                      title: "Live Verified Tags",
                      subtext: "Live-synced Telegram & Discord verified armory badges.",
                    },
                  ].map((p, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-fuchsia-500/30 bg-slate-950/80 p-2.5 flex items-center gap-2.5 hover:border-fuchsia-400 transition-colors"
                    >
                      <span className="text-lg shrink-0">{p.icon}</span>
                      <div className="min-w-0">
                        <span className="font-display font-black text-xs text-white block truncate">
                          {p.title}
                        </span>
                        <span className="font-sans text-[11px] text-slate-300 block truncate">
                          {p.subtext}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DEV COMMITMENT & TRANSPARENCY NOTICE */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 font-mono font-bold text-xs text-slate-200">
                  <Shield className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>TRANSPARENT DEVELOPMENT COMMITMENT</span>
                </div>
                <p className="font-sans text-[11px] text-slate-400 leading-relaxed">
                  We're building step-by-step alongside the community. Some features arrive sooner,
                  some evolve, and dev priorities align with community engagement and resource
                  capacity.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          8. FOOTER ACTION & BACK BUTTON (PADDING SAFE)
      ───────────────────────────────────────────────────────────── */}
      {onBack && (
        <div className="pt-3 flex justify-center">
          <Button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto font-mono text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 hover:from-cyan-300 hover:to-emerald-300 px-8 py-3 rounded-xl cursor-pointer shadow-lg active:scale-95 transition-all"
          >
            ← Return to Season Pass
          </Button>
        </div>
      )}
    </div>
  );
}

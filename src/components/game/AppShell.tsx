import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Package,
  ShoppingBag,
  Target,
  Trophy,
  User,
  Settings,
  Menu,
  X,
  LogOut,
  Sparkles,
  Award,
  HeartHandshake,
  Palette,
  Check,
  Rocket,
  FlaskConical,
  BookOpen,
  Globe,
  Disc,
} from "lucide-react";
import { useEffect, useState, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/hooks/use-auth";
import { logout } from "@/services/auth";
import { AuthLoading } from "@/components/auth/AuthStates";
import { useGameStore } from "@/store/gameStore";
import { Breadcrumbs } from "./Breadcrumbs";
import { LevelUpCelebrationModal } from "./LevelUpCelebrationModal";
import { AvatarPickerModal } from "@/components/game/AvatarPickerModal";
import { DevToolsModal } from "@/components/game/DevToolsModal";
import { HowToPlayModal } from "@/components/game/HowToPlayModal";
import { SocialCommunityModal } from "@/components/game/SocialCommunityModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  HeaderLeaderboardModal,
  HeaderContributorModal,
} from "@/components/game/HeaderUtilityModals";

const primaryNavItems = [
  {
    to: "/hq",
    label: "Character HQ",
    mobileLabel: "HQ",
    icon: Sparkles,
    matchPrefixes: ["/", "/hq", "/character"],
  },
  {
    to: "/missions",
    label: "Missions & Raids",
    mobileLabel: "Missions",
    icon: Target,
    matchPrefixes: ["/missions", "/season-pass"],
  },
  {
    to: "/forge",
    label: "Market Hub",
    mobileLabel: "Market",
    icon: ShoppingBag,
    matchPrefixes: ["/shop", "/forge", "/market"],
  },
  {
    to: "/packs",
    label: "Vault & Stash",
    mobileLabel: "Vault",
    icon: Package,
    hasVaultBadge: true,
    matchPrefixes: ["/packs", "/collection", "/vault", "/inventory", "/armory"],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false);
  const [contributorModalOpen, setContributorModalOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [paintModalOpen, setPaintModalOpen] = useState(false);
  const [devToolsModalOpen, setDevToolsModalOpen] = useState(false);
  const [howToPlayModalOpen, setHowToPlayModalOpen] = useState(false);
  const [socialModalOpen, setSocialModalOpen] = useState(false);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { status } = useAuth();
  const player = useGameStore((s) => s.player);
  const packs = useGameStore((s) => s.packs);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLAnchorElement>(null);

  const unopenedPacksCount = packs ? packs.length : 3;

  useEffect(() => {
    if (status === "unauthenticated") {
      navigate({ to: "/login", replace: true });
    }
  }, [status, navigate]);

  // Close drawers on navigation
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Global back action: press Escape to close topmost drawer or modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (drawerOpen) {
          setDrawerOpen(false);
        } else if (avatarModalOpen) {
          setAvatarModalOpen(false);
        } else if (leaderboardModalOpen) {
          setLeaderboardModalOpen(false);
        } else if (contributorModalOpen) {
          setContributorModalOpen(false);
        } else if (devToolsModalOpen) {
          setDevToolsModalOpen(false);
        } else if (howToPlayModalOpen) {
          setHowToPlayModalOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    drawerOpen,
    avatarModalOpen,
    leaderboardModalOpen,
    contributorModalOpen,
    devToolsModalOpen,
    howToPlayModalOpen,
  ]);

  // Auto-scroll active tab into view on mobile bottom bar
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [pathname]);

  if (status !== "authenticated") {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <AuthLoading label={status === "loading" ? "Loading your deck…" : "Redirecting…"} />
      </div>
    );
  }

  const handleSignOut = async () => {
    await logout();
    navigate({ to: "/login", replace: true });
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground touch-pan-y">
      {/* ─────────────────────────────────────────────────────────────
          EXPANDED RESPONSIVE SINGLE-ROW TOP HEADER
          Container: display: flex; align-items: center; gap: 6px; padding: 0 12px; overflow-x: auto; scrollbar-width: none
          Badges: padding: 6px 10px; flex-shrink: 0; white-space: nowrap
          On <390px: converts to icon-only badges automatically
      ───────────────────────────────────────────────────────────── */}
      <header
        id="global-top-header"
        className="fixed top-0 inset-x-0 z-[500] h-14 w-full bg-slate-950/95 backdrop-blur-md border-b border-amber-500/25 shadow-md flex items-center"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "0 12px",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
          className="flex items-center gap-[6px] px-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full max-w-7xl mx-auto h-14 select-none flex-nowrap"
        >
          {/* TARGET 1: [👤 Profile / Level Badge] (Left-aligned) */}
          <button
            type="button"
            id="top-bar-profile-btn"
            onClick={() => setAvatarModalOpen(true)}
            style={{ padding: "6px 10px", flexShrink: 0, whiteSpace: "nowrap" }}
            className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 rounded-xl transition-all shrink-0 shadow-sm cursor-pointer whitespace-nowrap active:scale-95 group"
            title={`${player?.username ?? "Raider"} (Level ${player?.level ?? 1}) - Customize Profile & Avatar`}
            aria-label="Raider Profile and Level"
          >
            <img
              src={player?.avatar || "/assets/avatar/base/fartboy-default.png"}
              alt={player?.username || "Raider"}
              className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg border border-amber-400/60 object-cover shrink-0 group-hover:scale-105 transition-transform"
            />
            <div className="flex items-center gap-1.5 text-left">
              <span className="font-mono text-[9.5px] sm:text-[10.5px] font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-400/40 shrink-0">
                LVL {player?.level ?? 1}
              </span>
              <span className="hidden md:inline font-bold text-slate-200 text-xs truncate max-w-[90px]">
                {player?.username ?? "Raider"}
              </span>
            </div>
          </button>

          {/* TARGET 2: [🏆 Leaderboard] */}
          <button
            type="button"
            id="top-bar-leaderboard-btn"
            onClick={() => setLeaderboardModalOpen(true)}
            style={{ padding: "6px 10px", flexShrink: 0, whiteSpace: "nowrap" }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400/60 text-amber-300 hover:text-amber-200 font-mono text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap shrink-0"
            title="View Global Raider Leaderboards"
            aria-label="Leaderboard"
          >
            <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="hidden min-[380px]:inline font-display font-black tracking-tight text-xs">
              Leaderboard
            </span>
          </button>

          {/* TARGET 3: [🤝 Contributors] */}
          <button
            type="button"
            id="top-bar-contributors-btn"
            onClick={() => setContributorModalOpen(true)}
            style={{ padding: "6px 10px", flexShrink: 0, whiteSpace: "nowrap" }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-yellow-500/30 hover:border-yellow-400/60 text-yellow-300 hover:text-yellow-200 font-mono text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap shrink-0"
            title="Contributor Pass & Supporter Status"
            aria-label="Contributors"
          >
            <HeartHandshake className="h-4 w-4 text-yellow-400 shrink-0" />
            <span className="hidden min-[380px]:inline font-display font-black tracking-tight text-xs">
              Contributors
            </span>
          </button>

          {/* TARGET 4: [🛠️ Dev Tools] */}
          <button
            type="button"
            id="top-bar-devtools-btn"
            onClick={() => setDevToolsModalOpen(true)}
            style={{ padding: "6px 10px", flexShrink: 0, whiteSpace: "nowrap" }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-400/60 text-emerald-300 hover:text-emerald-200 font-mono text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap shrink-0"
            title="Open Developer & Debug Utilities"
            aria-label="Dev Tools"
          >
            <FlaskConical className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="hidden min-[380px]:inline font-display font-black tracking-tight text-xs">
              Dev Tools
            </span>
          </button>

          {/* TARGET 5: [☰ More] (Right-aligned, opens Side Drawer) */}
          <button
            type="button"
            id="top-bar-more-btn"
            onClick={() => setDrawerOpen(true)}
            style={{ padding: "6px 10px", flexShrink: 0, whiteSpace: "nowrap" }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400/60 text-amber-300 hover:text-amber-200 font-mono text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap shrink-0 ml-auto"
            aria-label="Open More Menu"
            title="Open Side Menu & More Options"
          >
            <Menu className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="font-display font-black tracking-tight text-xs">More</span>
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT LAYOUT (With pt-14 offset for fixed 56px header)
      ───────────────────────────────────────────────────────────── */}
      <div className="mx-auto flex max-w-7xl pt-14">
        {/* Desktop sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r border-amber-500/25 bg-slate-950/90 p-4 lg:block shadow-xl overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <NavList
            pathname={pathname}
            onNavigate={() => {}}
            onSignOut={handleSignOut}
            onOpenLeaderboard={() => setLeaderboardModalOpen(true)}
            onOpenContributor={() => setContributorModalOpen(true)}
            onOpenPaint={() => setPaintModalOpen(true)}
            onOpenDevTools={() => setDevToolsModalOpen(true)}
            onOpenHowToPlay={() => setHowToPlayModalOpen(true)}
            onOpenSocial={() => setSocialModalOpen(true)}
          />
        </aside>

        {/* SIDE DRAWER MENU ('☰ MORE' TRIGGER, z-index: 600) */}
        {drawerOpen && (
          <div className="fixed inset-0 z-[600]" onClick={() => setDrawerOpen(false)}>
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" />
            <aside
              id="side-drawer-menu"
              className="absolute right-0 top-0 bottom-0 h-full w-84 max-w-[88vw] border-l border-amber-500/30 bg-slate-950 p-4 sm:p-5 shadow-2xl animate-in slide-in-from-right duration-200 flex flex-col z-[610]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-amber-400 text-black font-display font-black text-xs shadow">
                    ☰
                  </div>
                  <div>
                    <span className="font-display font-black text-sm text-amber-300 tracking-tight">
                      RAIDER MENU
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Non-essential tools &amp; links
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-slate-900 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                {/* 1. CORE GAME */}
                <div className="space-y-1.5">
                  <div className="px-2 text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>Core Game Systems</span>
                  </div>

                  <ul className="space-y-1 font-mono text-xs">
                    <li>
                      <Link
                        to="/hq"
                        onClick={() => setDrawerOpen(false)}
                        className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 font-bold transition-all ${
                          pathname === "/" || pathname === "/hq" || pathname === "/character"
                            ? "bg-amber-950/60 border border-amber-400/50 text-amber-300 shadow-sm"
                            : "bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Sparkles className="h-4 w-4 shrink-0 text-amber-400 group-hover:scale-110 transition-transform" />
                          <span className="truncate">Character HQ</span>
                        </div>
                        <span className="text-[9px] font-mono text-amber-400 bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.5 rounded">
                          HQ
                        </span>
                      </Link>
                    </li>

                    <li>
                      <Link
                        to="/missions"
                        onClick={() => setDrawerOpen(false)}
                        className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 font-bold transition-all ${
                          pathname === "/missions" && !window.location.search.includes("roadmap")
                            ? "bg-amber-950/60 border border-amber-400/50 text-amber-300 shadow-sm"
                            : "bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Target className="h-4 w-4 shrink-0 text-amber-400 group-hover:scale-110 transition-transform" />
                          <span className="truncate">Missions &amp; Daily Raids</span>
                        </div>
                        <span className="text-[9px] font-mono text-amber-400 bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.5 rounded">
                          RAIDS
                        </span>
                      </Link>
                    </li>

                    <li>
                      <Link
                        to="/forge"
                        onClick={() => setDrawerOpen(false)}
                        className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 font-bold transition-all ${
                          pathname === "/forge" || pathname.startsWith("/forge/")
                            ? "bg-amber-950/60 border border-amber-400/50 text-amber-300 shadow-sm"
                            : "bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ShoppingBag className="h-4 w-4 shrink-0 text-amber-400 group-hover:scale-110 transition-transform" />
                          <span className="truncate">Market (Forge &amp; Shop)</span>
                        </div>
                        <span className="text-[9px] font-mono text-amber-400 bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.5 rounded">
                          MARKET
                        </span>
                      </Link>
                    </li>

                    <li>
                      <Link
                        to="/packs"
                        onClick={() => setDrawerOpen(false)}
                        className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 font-bold transition-all ${
                          pathname === "/packs" || pathname.startsWith("/packs/")
                            ? "bg-amber-950/60 border border-amber-400/50 text-amber-300 shadow-sm"
                            : "bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Package className="h-4 w-4 shrink-0 text-amber-400 group-hover:scale-110 transition-transform" />
                          <span className="truncate">Pack Stash &amp; Vault</span>
                        </div>
                        {unopenedPacksCount > 0 ? (
                          <span className="grid h-4 min-w-[16px] place-items-center rounded-full bg-red-600 text-[9px] font-mono font-black text-white px-1 shadow">
                            {unopenedPacksCount}
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-amber-400 bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.5 rounded">
                            VAULT
                          </span>
                        )}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* 2. EXPLORE */}
                <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
                  <div className="px-2 text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                    <span>🚀</span>
                    <span>Explore &amp; Utilities</span>
                  </div>

                  <ul className="space-y-1 font-mono text-xs">
                    {/* 🚀 Game Vision & Roadmap */}
                    <li>
                      <Link
                        to="/missions"
                        search={{ view: "roadmap" }}
                        onClick={() => setDrawerOpen(false)}
                        className="group flex items-center justify-between rounded-xl px-3.5 py-2 font-bold bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-300 transition-all cursor-pointer shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Rocket className="h-4 w-4 shrink-0 text-cyan-400 group-hover:scale-110 transition-transform" />
                          <span className="truncate">Game Vision &amp; Roadmap</span>
                        </div>
                        <span className="text-[9px] font-black uppercase bg-cyan-900/60 text-cyan-300 border border-cyan-400/30 px-1.5 py-0.2 rounded shrink-0">
                          ROADMAP
                        </span>
                      </Link>
                    </li>

                    {/* 📜 How to Play & Game Rules */}
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setDrawerOpen(false);
                          setHowToPlayModalOpen(true);
                        }}
                        className="w-full group flex items-center justify-between rounded-xl px-3.5 py-2 font-bold bg-amber-950/20 hover:bg-amber-950/40 border border-amber-500/30 hover:border-amber-400/60 text-amber-300 transition-all cursor-pointer text-left shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <BookOpen className="h-4 w-4 shrink-0 text-amber-400 group-hover:scale-110 transition-transform" />
                          <span className="truncate">How to Play &amp; Guides</span>
                        </div>
                        <span className="text-[9px] font-black uppercase bg-amber-900/60 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded shrink-0">
                          GUIDES
                        </span>
                      </button>
                    </li>

                    {/* 🌐 Social Links & Discord */}
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setDrawerOpen(false);
                          setSocialModalOpen(true);
                        }}
                        className="w-full group flex items-center justify-between rounded-xl px-3.5 py-2 font-bold bg-indigo-950/30 hover:bg-indigo-950/60 border border-indigo-500/30 hover:border-indigo-400/60 text-indigo-300 transition-all cursor-pointer text-left shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Disc className="h-4 w-4 shrink-0 text-indigo-400 group-hover:scale-110 transition-transform" />
                          <span className="truncate">Social Links &amp; Discord</span>
                        </div>
                        <span className="text-[9px] font-black uppercase bg-indigo-900/60 text-indigo-300 border border-indigo-400/30 px-1.5 py-0.2 rounded shrink-0">
                          COMMUNITY
                        </span>
                      </button>
                    </li>

                    {/* 🏆 Global Leaderboards */}
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setDrawerOpen(false);
                          setLeaderboardModalOpen(true);
                        }}
                        className="w-full group flex items-center justify-between rounded-xl px-3.5 py-2 font-bold bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/30 hover:border-amber-400/60 text-amber-300 transition-all cursor-pointer text-left shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Trophy className="h-4 w-4 shrink-0 text-amber-400 group-hover:scale-110 transition-transform" />
                          <span className="truncate">Global Leaderboards</span>
                        </div>
                        <span className="text-[9px] font-black uppercase bg-amber-900/60 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded shrink-0">
                          RANKS
                        </span>
                      </button>
                    </li>

                    {/* 🤝 Contributor Pass */}
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setDrawerOpen(false);
                          setContributorModalOpen(true);
                        }}
                        className="w-full group flex items-center justify-between rounded-xl px-3.5 py-2 font-bold bg-yellow-950/30 hover:bg-yellow-950/50 border border-yellow-500/30 hover:border-yellow-400/60 text-yellow-300 transition-all cursor-pointer text-left shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <HeartHandshake className="h-4 w-4 shrink-0 text-yellow-400 group-hover:scale-110 transition-transform" />
                          <span className="truncate">Contributor Pass</span>
                        </div>
                        <span className="text-[9px] font-black uppercase bg-yellow-900/60 text-yellow-300 border border-yellow-400/30 px-1.5 py-0.2 rounded shrink-0">
                          PASS
                        </span>
                      </button>
                    </li>

                    {/* 🏅 Achievements */}
                    <li>
                      <Link
                        to="/achievements"
                        onClick={() => setDrawerOpen(false)}
                        className="group flex items-center justify-between rounded-xl px-3.5 py-2 font-bold bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-200 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Award className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-amber-300" />
                          <span className="truncate">Achievements</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                          TROPHIES
                        </span>
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* 3. PROFILE & SETTINGS */}
                <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
                  <div className="px-2 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                    Profile &amp; Settings
                  </div>
                  <ul className="space-y-1 font-mono text-xs">
                    <li>
                      <Link
                        to="/profile"
                        onClick={() => setDrawerOpen(false)}
                        className="group flex items-center gap-3 rounded-xl px-3.5 py-2 font-semibold text-slate-300 hover:bg-slate-900/60 hover:text-amber-200 transition-colors"
                      >
                        <User className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-amber-300" />
                        <span className="truncate">Raider Profile &amp; Badges</span>
                      </Link>
                    </li>

                    {/* RAIDER PAINT STUDIO */}
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setDrawerOpen(false);
                          setPaintModalOpen(true);
                        }}
                        className="w-full group flex items-center justify-between rounded-xl px-3.5 py-2 font-semibold text-purple-300 hover:text-purple-200 hover:bg-purple-950/30 transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Palette className="h-4 w-4 shrink-0 text-purple-400 group-hover:scale-110 transition-transform" />
                          <span className="truncate">Raider Paint / Customization Studio</span>
                        </div>
                        <span className="text-[9px] font-black uppercase bg-purple-900/50 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded shrink-0">
                          STUDIO
                        </span>
                      </button>
                    </li>

                    <li>
                      <Link
                        to="/settings"
                        onClick={() => setDrawerOpen(false)}
                        className="group flex items-center gap-3 rounded-xl px-3.5 py-2 font-semibold text-slate-300 hover:bg-slate-900/60 hover:text-amber-200 transition-colors"
                      >
                        <Settings className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-amber-300" />
                        <span className="truncate">Settings</span>
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* 4. DEVELOPER */}
                <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
                  <div className="px-2 text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                    <FlaskConical className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Developer</span>
                  </div>
                  <ul className="space-y-1 font-mono text-xs">
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setDrawerOpen(false);
                          setDevToolsModalOpen(true);
                        }}
                        className="w-full group flex items-center justify-between rounded-xl px-3.5 py-2.5 font-bold bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-500/30 hover:border-emerald-400/60 text-emerald-300 transition-all cursor-pointer text-left shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FlaskConical className="h-4 w-4 shrink-0 text-emerald-400 group-hover:scale-110 transition-transform" />
                          <span className="truncate">Dev Tools / Debug &amp; Personas</span>
                        </div>
                        <span className="text-[9px] font-black uppercase bg-emerald-900/80 text-emerald-300 border border-emerald-400/40 px-1.5 py-0.5 rounded shrink-0">
                          DEBUG
                        </span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Drawer Footer with Sign Out */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    handleSignOut();
                  }}
                  className="w-full group flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 font-mono text-xs font-semibold text-red-400/80 hover:text-red-300 hover:bg-red-950/30 transition-colors cursor-pointer border border-red-500/20"
                >
                  <LogOut className="h-4 w-4 shrink-0 text-red-400/70 group-hover:text-red-400" />
                  <span>Sign Out</span>
                </button>
                <div className="text-center font-mono text-[9px] text-slate-500">
                  Fartboy Raid v2.0 • S1: Season of Gas
                </div>
              </div>
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 px-3 sm:px-4 py-3 pb-[calc(68px+max(env(safe-area-inset-bottom,0px),var(--discord-safe-area-inset-bottom,0px)))] lg:pb-8 touch-pan-y">
          <Breadcrumbs />
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (Strict 4 Core Hubs: [ HQ ], [ MISSIONS ], [ MARKET ], [ VAULT ]) */}
      <nav className="fixed inset-x-0 bottom-0 z-[400] border-t border-amber-500/30 bg-slate-950/95 backdrop-blur-md lg:hidden shadow-2xl pb-[max(env(safe-area-inset-bottom,0px),var(--discord-safe-area-inset-bottom,0px))]">
        <div
          ref={navContainerRef}
          className="mx-auto flex max-w-md items-stretch py-1.5 px-2 gap-1"
        >
          {primaryNavItems.map((n) => {
            const Icon = n.icon;
            const active =
              n.to === "/hq"
                ? pathname === "/" || pathname === "/hq" || pathname === "/character"
                : n.matchPrefixes
                  ? n.matchPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))
                  : pathname === n.to || pathname.startsWith(`${n.to}/`);

            return (
              <Link
                key={n.to}
                to={n.to}
                ref={active ? activeTabRef : undefined}
                className={`relative flex flex-1 flex-col items-center justify-center min-h-[44px] py-1 px-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all duration-150 rounded-lg cursor-pointer active:scale-95 touch-manipulation ${
                  active
                    ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.5)] border border-amber-200"
                    : "text-amber-200/60 hover:text-amber-100 hover:bg-slate-900/60 active:bg-slate-900/80"
                }`}
              >
                <div className="relative flex items-center justify-center gap-1">
                  <div className="relative inline-flex items-center justify-center">
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 ${active ? "text-slate-950" : "text-amber-400"}`}
                    />
                    {n.hasVaultBadge && unopenedPacksCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 grid h-3.5 min-w-[14px] place-items-center rounded-full bg-red-600 text-[8px] font-mono font-black text-white px-1 shadow-[0_0_6px_rgba(220,38,38,0.8)] border border-slate-950 z-10">
                        {unopenedPacksCount}
                      </span>
                    )}
                  </div>
                  <span>{n.mobileLabel}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Header & Side Menu Modals */}
      <AvatarPickerModal open={avatarModalOpen} onOpenChange={setAvatarModalOpen} />
      <HeaderLeaderboardModal open={leaderboardModalOpen} onOpenChange={setLeaderboardModalOpen} />
      <HeaderContributorModal open={contributorModalOpen} onOpenChange={setContributorModalOpen} />
      <DevToolsModal open={devToolsModalOpen} onOpenChange={setDevToolsModalOpen} />
      <HowToPlayModal open={howToPlayModalOpen} onOpenChange={setHowToPlayModalOpen} />
      <SocialCommunityModal open={socialModalOpen} onOpenChange={setSocialModalOpen} />

      {/* Dedicated Paint / Raider Customization Studio Preview Modal */}
      <Dialog open={paintModalOpen} onOpenChange={setPaintModalOpen}>
        <DialogContent className="max-w-md bg-slate-950 border border-purple-500/40 text-foreground p-5 sm:p-6 rounded-2xl shadow-2xl space-y-4 font-mono">
          <DialogHeader className="border-b border-purple-500/20 pb-3">
            <DialogTitle className="flex items-center gap-2 font-display text-lg sm:text-xl font-black text-purple-300">
              <Palette className="h-5 w-5 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
              <span>PAINT &amp; RAIDER CUSTOMIZATION</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-sans">
              Upcoming feature studio for Fartboy Raid cosmetics and armor personalization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1 text-xs">
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 space-y-1.5">
              <div className="font-mono text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping" />
                <span>Feature in Active Development</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">
                The Raider Paint &amp; Customization Studio is scheduled to launch in an upcoming
                season update!
              </p>
            </div>

            <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                Planned Customization Features:
              </div>
              <ul className="space-y-1 text-slate-300 font-mono text-[11px]">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Custom Armor Dyes &amp; Chroma Palettes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Raider Skin Tone &amp; Facial Expression Swaps</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Raid Aura &amp; Particle VFX Tinting</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Discord Activity Embedded Glow Profiles</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              onClick={() => setPaintModalOpen(false)}
              className="bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold px-4 py-2 rounded-xl"
            >
              GOT IT
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Global Level Up Celebration Overlay */}
      <LevelUpCelebrationModal />
    </div>
  );
}

interface NavListProps {
  pathname: string;
  onNavigate: () => void;
  onSignOut?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenContributor?: () => void;
  onOpenPaint?: () => void;
  onOpenDevTools?: () => void;
  onOpenHowToPlay?: () => void;
  onOpenSocial?: () => void;
}

function NavList({
  pathname,
  onNavigate,
  onSignOut,
  onOpenLeaderboard,
  onOpenContributor,
  onOpenPaint,
  onOpenDevTools,
  onOpenHowToPlay,
  onOpenSocial,
}: NavListProps) {
  const packs = useGameStore((s) => s.packs);
  const unopenedPacksCount = packs ? packs.length : 3;

  return (
    <div className="flex flex-col gap-5 text-xs font-mono">
      {/* 1. CORE HUBS */}
      <div className="flex flex-col gap-1.5">
        <div className="px-3 text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>Core Game Systems</span>
        </div>
        <ul className="flex flex-col gap-1">
          {[
            { to: "/hq", label: "Character HQ", icon: Sparkles },
            { to: "/missions", label: "Missions & Daily Raids", icon: Target },
            { to: "/forge", label: "Market (Forge & Shop)", icon: ShoppingBag },
            {
              to: "/packs",
              label: "Pack Stash & Vault",
              icon: Package,
              badge: unopenedPacksCount > 0 ? `${unopenedPacksCount}` : undefined,
              badgeColor: "bg-red-600",
            },
          ].map((n) => {
            const Icon = n.icon;
            const active =
              n.to === "/hq"
                ? pathname === "/" || pathname === "/hq" || pathname === "/character"
                : pathname === n.to || pathname.startsWith(`${n.to}/`);
            return (
              <li key={n.to}>
                <Link
                  to={n.to}
                  onClick={onNavigate}
                  className={`group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 font-bold transition-all ${
                    active
                      ? "bg-amber-950/50 border-l-2 border-amber-400 text-amber-300 font-extrabold shadow-[inset_0_0_12px_rgba(245,158,11,0.15)]"
                      : "text-slate-300 hover:text-white hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                        active ? "text-amber-400" : "text-amber-400/70 group-hover:text-amber-300"
                      }`}
                    />
                    <span className="truncate">{n.label}</span>
                  </div>

                  {n.badge && (
                    <span
                      className={`rounded-full ${n.badgeColor || "bg-amber-500"} text-white text-[10px] font-bold px-2 py-0.2 shadow`}
                    >
                      {n.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Sections 2–4 (Explore & Utilities, Profile & Settings, Sandbox &
          Diagnostics) intentionally omitted from this persistent desktop
          sidebar — Core Game Systems is the only menu here. Everything else
          stays reachable via the top header buttons and the "☰ More" side
          drawer. */}
    </div>
  );
}

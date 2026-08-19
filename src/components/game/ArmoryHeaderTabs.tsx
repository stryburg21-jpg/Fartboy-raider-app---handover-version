import { useRef, useState, useEffect, type ReactNode } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { Package, ShoppingBag, Hammer, Box, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useGameStore } from "@/store/gameStore";
import { audio } from "@/services/audio";

export const ARMORY_TABS = [
  {
    to: "/packs?tab=stash",
    matchTab: "stash",
    label: "Pack Stash & Inventory",
    shortLabel: "Stash",
    icon: Box,
    headerTitle: "Pack Stash & Inventory",
    subtitle:
      "Dedicated holding area for unopened supply packs. Select card stacks & unbox equipment.",
    hasBadge: true,
  },
  {
    to: "/packs?tab=vault",
    matchTab: "vault",
    label: "Collection Vault",
    shortLabel: "Vault",
    icon: Layers,
    headerTitle: "Collection Vault",
    subtitle:
      "Pure static showcase: track overall collection %, assemble 7-piece specialist sets & inspect discovered items.",
    hasBadge: false,
  },
  {
    to: "/forge",
    label: "The Raider Forge",
    shortLabel: "Forge",
    icon: Hammer,
    headerTitle: "The Raider Forge",
    subtitle: "Upgrade gear stats, craft high-tier equipment, reroll stats & dismantle duplicates.",
    hasBadge: false,
  },
  {
    to: "/shop",
    label: "Raider Shop",
    shortLabel: "Shop",
    icon: ShoppingBag,
    headerTitle: "Raider Shop",
    subtitle: "Spend community XP on supply packs, specialist set pieces & prestige items.",
    hasBadge: false,
  },
];

// In-memory scroll position map for instant sub-tab scroll preservation
const subTabScrollMap: Record<string, number> = {};

export function ArmoryHeaderTabs() {
  const location = useRouterState({ select: (s) => s.location });
  const navigate = useNavigate();
  const packs = useGameStore((s) => s.packs);
  const unopenedPacksCount = packs ? packs.length : 0;

  const pathname = location.pathname;
  const searchTab = new URLSearchParams(location.searchStr).get("tab");

  // Local optimistic state for zero-latency active visual feedback
  const [optimisticTab, setOptimisticTab] = useState<string | null>(null);

  useEffect(() => {
    setOptimisticTab(null);
  }, [location.href]);

  // Restore scroll position on sub-tab navigation
  useEffect(() => {
    const savedY = subTabScrollMap[location.href];
    if (typeof savedY === "number") {
      requestAnimationFrame(() => {
        window.scrollTo({ top: savedY, behavior: "instant" });
      });
    }
  }, [location.href]);

  const activeHref = optimisticTab || location.href;

  const handleTabClick = (to: string) => {
    if (location.href === to) return;
    audio.play("button.click");
    // Save current scroll Y before navigation
    subTabScrollMap[location.href] = window.scrollY;
    // Set optimistic tab state for instant visual feedback
    setOptimisticTab(to);
    navigate({ to });
  };

  return (
    <div className="w-full space-y-3 font-mono shrink-0">
      {/* 1. TOP STICKY PILL NAVIGATION BAR WITH INSTANT VISUAL FEEDBACK */}
      <div className="sticky top-0 z-30 w-full h-12 bg-slate-950/95 border border-amber-500/40 rounded-2xl p-1.5 backdrop-blur-md shadow-2xl flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 w-full h-full relative">
          {ARMORY_TABS.map((tab) => {
            const Icon = tab.icon;

            let isActive = false;
            if (tab.to.includes("tab=stash")) {
              isActive = pathname === "/packs" && (searchTab === "stash" || !searchTab);
            } else if (tab.to.includes("tab=vault")) {
              isActive = pathname === "/packs" && searchTab === "vault";
            } else {
              isActive = pathname.startsWith(tab.to.split("?")[0]);
            }

            if (optimisticTab) {
              isActive = optimisticTab === tab.to;
            }

            const badge = tab.hasBadge && unopenedPacksCount > 0 ? unopenedPacksCount : undefined;

            return (
              <button
                key={tab.to}
                type="button"
                onClick={() => handleTabClick(tab.to)}
                className={`relative flex-1 shrink min-w-0 h-full flex items-center justify-center gap-0.5 min-[400px]:gap-1 sm:gap-1.5 px-1 min-[400px]:px-1.5 sm:px-3 rounded-xl text-[10px] min-[400px]:text-[11px] sm:text-xs font-black uppercase tracking-wider transition-colors duration-100 cursor-pointer active:scale-95 whitespace-nowrap z-10 ${
                  isActive
                    ? "text-slate-950"
                    : "text-amber-200/60 hover:text-amber-100 hover:bg-slate-900/60"
                }`}
              >
                {/* Instant animated glowing pill background via Framer Motion layoutId */}
                {isActive && (
                  <motion.div
                    layoutId="armory-active-pill-glow"
                    className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-xl shadow-[0_0_18px_rgba(245,158,11,0.6)] border border-amber-200 -z-10"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}

                <Icon
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 transition-colors ${
                    isActive ? "text-slate-950" : "text-amber-400"
                  }`}
                />
                <span className="hidden lg:inline">{tab.label}</span>
                <span className="inline lg:hidden truncate">{tab.shortLabel}</span>

                {badge !== undefined && (
                  <span
                    className={`ml-0.5 sm:ml-1 rounded-full text-[8.5px] min-[400px]:text-[9px] font-mono font-black px-1.5 py-0.2 shadow-sm shrink-0 whitespace-nowrap ${
                      isActive
                        ? "bg-slate-950 text-amber-300"
                        : "bg-red-600 text-white animate-pulse"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Dynamic Title Header for Armory sub-views.
 * Always matches the active sub-tab:
 * Vault -> "Pack Vault & Collection"
 * Forge -> "The Raider Forge"
 * Shop -> "Raider Shop"
 */
export function ArmoryDynamicHeaderTitle({
  titleOverride,
  subtitleOverride,
  rightContent,
}: {
  titleOverride?: string;
  subtitleOverride?: string;
  rightContent?: ReactNode;
}) {
  const location = useRouterState({ select: (s) => s.location });
  const pathname = location.pathname;
  const searchTab = new URLSearchParams(location.searchStr).get("tab");

  let title = "Pack Stash & Inventory";
  let subtitle =
    "Dedicated holding area for unopened supply packs. Select card stacks & unbox equipment.";

  if (pathname === "/packs" && searchTab === "vault") {
    title = "Collection Vault";
    subtitle =
      "Pure static showcase: track overall collection %, assemble 7-piece specialist sets & inspect discovered items.";
  } else if (pathname.startsWith("/forge")) {
    title = "The Raider Forge";
    subtitle = "Upgrade gear stats, craft high-tier equipment & enhance specialist abilities.";
  } else if (pathname.startsWith("/shop")) {
    title = "Raider Shop";
    subtitle = "Spend community XP on reward packs, set pieces & prestige items.";
  }

  const displayTitle = titleOverride || title;
  const displaySubtitle = subtitleOverride || subtitle;

  return (
    <div className="rounded-2xl border-2 border-amber-500/30 bg-slate-900/90 p-4 sm:p-5 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-400 border border-amber-500/40">
            ARMORY HUB
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2 drop-shadow-[0_0_12px_rgba(245,158,11,0.25)]">
            {displayTitle}
          </h1>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl">{displaySubtitle}</p>
      </div>

      {rightContent && <div className="shrink-0 flex items-center gap-2">{rightContent}</div>}
    </div>
  );
}

/**
 * Mobile touch swipe wrapper for Armory view.
 * Swiping left navigates to the next tab, swiping right navigates to the previous tab.
 */
export function ArmorySwipeContainer({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Detect horizontal swipe above threshold (e.g. 50px)
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      const routes = ARMORY_TABS.map((t) => t.to);
      const currentIndex = routes.findIndex((r) => pathname === r || pathname.startsWith(`${r}/`));

      if (currentIndex !== -1) {
        if (deltaX < 0 && currentIndex < routes.length - 1) {
          // Swipe Left -> Next Tab
          audio.play("button.click");
          subTabScrollMap[pathname] = window.scrollY;
          navigate({ to: routes[currentIndex + 1] });
        } else if (deltaX > 0 && currentIndex > 0) {
          // Swipe Right -> Prev Tab
          audio.play("button.click");
          subTabScrollMap[pathname] = window.scrollY;
          navigate({ to: routes[currentIndex - 1] });
        }
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.16, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

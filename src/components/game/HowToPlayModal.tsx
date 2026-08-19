import React, { useState } from "react";
import {
  BookOpen,
  Zap,
  Package,
  Shield,
  Sparkles,
  Trophy,
  Hammer,
  Gift,
  CheckCircle2,
  Rocket,
  Crown,
  ChevronRight,
  Flame,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HowToPlayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HowToPlayModal({ open, onOpenChange }: HowToPlayModalProps) {
  const [selectedSection, setSelectedSection] = useState<
    "loop" | "economy" | "gear" | "seasons" | "faq"
  >("loop");

  const navItems = [
    { id: "loop", label: "Core Gameplay Loop", icon: Zap },
    { id: "economy", label: "XP & Currency", icon: Sparkles },
    { id: "gear", label: "Gear, Sets & Forge", icon: Hammer },
    { id: "seasons", label: "Seasons & Leaderboards", icon: Trophy },
    { id: "faq", label: "Tips & FAQs", icon: BookOpen },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-amber-500/40 text-foreground p-4 sm:p-6 rounded-2xl shadow-2xl space-y-4 font-mono z-[400]">
        <DialogHeader className="border-b border-amber-500/20 pb-3 pr-10">
          <DialogTitle className="flex items-center gap-2 font-display text-xl sm:text-2xl font-black text-amber-300">
            <BookOpen className="h-6 w-6 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <span>HOW TO PLAY: RAIDER FIELD MANUAL</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 font-sans">
            Complete guide to progression loops, item rarities, XP multipliers, and seasonal
            prestige.
          </DialogDescription>
        </DialogHeader>

        {/* SECTION NAV PILLS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = selectedSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedSection(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none ${
                  active
                    ? "bg-amber-400 text-slate-950 shadow-md font-black"
                    : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? "text-slate-950" : "text-amber-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* SECTION CONTENT */}
        <div className="py-2 text-xs font-sans space-y-4 min-h-[300px]">
          {/* 1. CORE LOOP */}
          {selectedSection === "loop" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 space-y-1">
                <div className="font-mono text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>The 5-Step Raider Loop</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Fartboy Raid is a seasonal loot &amp; progression RPG connected directly to
                  community raid events and Discord activities.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono">
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-xs">
                    <div className="grid h-5 w-5 place-items-center rounded-md bg-amber-400/20 text-amber-300 text-[10px]">
                      1
                    </div>
                    <span>Complete Missions</span>
                  </div>
                  <p className="text-slate-400 font-sans text-[11.5px] leading-relaxed">
                    Tackle Daily Bounties, Weekly Raids, and Discord milestones to earn Lifetime XP
                    and Spendable XP (SP-XP).
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-red-400 font-black text-xs">
                    <div className="grid h-5 w-5 place-items-center rounded-md bg-red-500/20 text-red-300 text-[10px]">
                      2
                    </div>
                    <span>Unseal Supply Packs</span>
                  </div>
                  <p className="text-slate-400 font-sans text-[11.5px] leading-relaxed">
                    Claim your 3 Daily Mastery Packs and purchase high-tier crates in the Pack Vault
                    to discover rare digital loot.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400 font-black text-xs">
                    <div className="grid h-5 w-5 place-items-center rounded-md bg-cyan-500/20 text-cyan-300 text-[10px]">
                      3
                    </div>
                    <span>Equip &amp; Synergize</span>
                  </div>
                  <p className="text-slate-400 font-sans text-[11.5px] leading-relaxed">
                    Equip weapons, armor, helmets, and auras in Character HQ to boost your passive
                    XP Multipliers and Luck stats.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-purple-400 font-black text-xs">
                    <div className="grid h-5 w-5 place-items-center rounded-md bg-purple-500/20 text-purple-300 text-[10px]">
                      4
                    </div>
                    <span>Forge &amp; Ascend</span>
                  </div>
                  <p className="text-slate-400 font-sans text-[11.5px] leading-relaxed">
                    Take duplicate items to The Forge to fuse them into higher rarity tiers (Common
                    ➔ Mythic) and dismantle extras for XP.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-mono font-black text-xs">
                  <Crown className="h-4 w-4 text-emerald-400" />
                  <span>5. Climb the Seasonal Leaderboard</span>
                </div>
                <p className="text-slate-300 text-[11.5px] leading-relaxed">
                  All total XP earned propels you up the seasonal standings. Top rankers earn
                  prestigious titles, contributor medals, and permanent next-season XP perks!
                </p>
              </div>
            </div>
          )}

          {/* 2. ECONOMY */}
          {selectedSection === "economy" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-mono font-black text-sm">
                    <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span>Spendable XP (SP-XP)</span>
                  </div>
                  <p className="text-slate-300 text-[11.5px] leading-relaxed">
                    The active crafting and shopping currency. Spend it in the Pack Vault to buy new
                    crates, or in The Forge to level up and fuse duplicate gear.
                  </p>
                  <div className="text-[10px] font-mono text-amber-400/90 bg-slate-950/60 p-2 rounded-lg border border-amber-500/20">
                    💡 <strong>Pro Tip:</strong> Up to 50,000 SP-XP carries over between seasons.
                  </div>
                </div>

                <div className="rounded-xl border border-yellow-500/40 bg-yellow-950/30 p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-yellow-300 font-mono font-black text-sm">
                    <Crown className="h-4 w-4 text-yellow-400" />
                    <span>Lifetime XP &amp; Levels</span>
                  </div>
                  <p className="text-slate-300 text-[11.5px] leading-relaxed">
                    Lifetime XP measures your Raider's permanent career progression. Every time your
                    bar fills, your Raider Level increases, granting SP-XP bonuses and prestige.
                  </p>
                  <div className="text-[10px] font-mono text-yellow-400/90 bg-slate-950/60 p-2 rounded-lg border border-yellow-500/20">
                    👑 <strong>Permanent:</strong> Lifetime XP and Level never reset.
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 space-y-2">
                <div className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Currency Earning Sources
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-[10.5px]">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="text-amber-400 font-black">+250-1,000 XP</div>
                    <div className="text-slate-400 text-[9.5px]">Daily Missions</div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="text-amber-400 font-black">+5,000 XP</div>
                    <div className="text-slate-400 text-[9.5px]">Weekly Mastery</div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="text-amber-400 font-black">+500-2,500 XP</div>
                    <div className="text-slate-400 text-[9.5px]">Discord Raids</div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="text-amber-400 font-black">+100-2,000 XP</div>
                    <div className="text-slate-400 text-[9.5px]">Dismantling Gear</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. GEAR & FORGE */}
          {selectedSection === "gear" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="rounded-xl border border-purple-500/40 bg-purple-950/30 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-mono font-black text-sm">
                  <Hammer className="h-4 w-4 text-purple-400" />
                  <span>The Forge: Upgrades &amp; Rarities</span>
                </div>
                <p className="text-slate-300 text-[11.5px] leading-relaxed">
                  Gear items exist across 6 standard rarities. Duplicate items can be combined in
                  The Forge to ascend them to higher tiers, enhancing their XP Multipliers and Luck
                  boosts.
                </p>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-bold text-slate-300">⚪ Common (LV 1-10)</span>
                  <span className="text-slate-400">+1% - +3% XP Boost</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                  <span className="font-bold text-emerald-300">🟢 Rare (LV 1-15)</span>
                  <span className="text-emerald-400">+3% - +6% XP Boost</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-purple-950/40 border border-purple-500/30">
                  <span className="font-bold text-purple-300">🟣 Epic (LV 1-20)</span>
                  <span className="text-purple-400">+6% - +10% XP Boost</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/40 border border-amber-500/30">
                  <span className="font-bold text-amber-300">🟡 Legendary (LV 1-25)</span>
                  <span className="text-amber-400">+10% - +18% XP Boost</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-rose-950/40 border border-rose-500/30">
                  <span className="font-bold text-rose-300">🔴 Mythic / Celestial (LV 1-30)</span>
                  <span className="text-rose-400">+20%+ XP Boost &amp; Special VFX</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. SEASONS */}
          {selectedSection === "seasons" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-mono font-black text-sm">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span>90-Day Seasonal Cycle</span>
                </div>
                <p className="text-slate-300 text-[11.5px] leading-relaxed">
                  Every 90 days, a new competitive season begins. Your seasonal leaderboard rank
                  resets, giving all raiders a fresh, equal opportunity to claim the top spots.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-1">
                  <div className="text-emerald-400 font-bold">What Stays with You:</div>
                  <ul className="text-slate-300 font-sans text-[11px] space-y-0.5 list-disc list-inside">
                    <li>All unlocked gear &amp; weapons</li>
                    <li>Raider Level &amp; Lifetime XP</li>
                    <li>Up to 50,000 Spendable XP</li>
                    <li>Earned titles &amp; contributor badges</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-1">
                  <div className="text-amber-400 font-bold">What Resets Each Season:</div>
                  <ul className="text-slate-300 font-sans text-[11px] space-y-0.5 list-disc list-inside">
                    <li>Seasonal Leaderboard Standings</li>
                    <li>Seasonal Quest / Pass Progression</li>
                    <li>Active seasonal bounties</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 5. FAQS */}
          {selectedSection === "faq" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="space-y-2">
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 space-y-1">
                  <div className="font-mono text-xs font-bold text-amber-300">
                    Q: How do I get more Spendable XP fast?
                  </div>
                  <p className="text-slate-300 text-[11.5px] leading-relaxed font-sans">
                    A: Complete all 3 daily missions every day to claim the +1,000 SP-XP mastery
                    bonus, equip items with XP Multipliers, and participate in Discord raids.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 space-y-1">
                  <div className="font-mono text-xs font-bold text-amber-300">
                    Q: Can I lose my equipped items?
                  </div>
                  <p className="text-slate-300 text-[11.5px] leading-relaxed font-sans">
                    A: Never! Items are permanent digital assets in your collection vault. You can
                    switch equipment at any time in Character HQ.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 space-y-1">
                  <div className="font-mono text-xs font-bold text-amber-300">
                    Q: What are Set Bonuses?
                  </div>
                  <p className="text-slate-300 text-[11.5px] leading-relaxed font-sans">
                    A: Equipping 2 or 4 items from the same named gear set (e.g. "Toxic Vanguard" or
                    "Neon Overlord") activates special synergy perks that boost XP and luck.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-between items-center border-t border-slate-800">
          <span className="text-[10px] text-slate-500 font-mono">
            Fartboy Raid Manual v2.0 • Updated for Season 1
          </span>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono text-xs font-black px-5 py-2 rounded-xl cursor-pointer"
          >
            LET'S RAID
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState } from "react";
import { Info, Zap, Trophy, Sparkles, Crown, ShieldCheck, Package, Hammer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export type StatType =
  | "spendable_xp"
  | "season_rank"
  | "xp_boost"
  | "level"
  | "reputation"
  | "packs"
  | "forge_efficiency"
  | "luck";

interface StatMeta {
  title: string;
  category: string;
  icon: React.ElementType;
  iconColor: string;
  summary: string;
  howToEarn: string;
  howToUse: string;
}

const STAT_REGISTRY: Record<StatType, StatMeta> = {
  spendable_xp: {
    title: "Spendable XP (SP-XP)",
    category: "Game Economy Currency",
    icon: Zap,
    iconColor: "text-amber-400 fill-amber-400",
    summary:
      "Your primary spendable balance in Fartboy Raid. Unlike Lifetime XP (which only determines Level), SP-XP is spent when purchasing and crafting.",
    howToEarn:
      "Complete Daily Missions & Weekly Bounties, conquer Raid targets, dismantle duplicate items in the Forge, or level up your Raider.",
    howToUse:
      "Purchase new Supply Packs in the Market/Vault, fuse and upgrade items in the Forge, and reroll gear substats.",
  },
  season_rank: {
    title: "Seasonal Rank & Leaderboard",
    category: "Competitive Standing",
    icon: Trophy,
    iconColor: "text-amber-400",
    summary:
      "Your global competitive ranking in the current 90-day season, measured by total Seasonal XP gained across all activities.",
    howToEarn:
      "Earn XP actively through Discord community raids, daily missions, and gear-boosted quests before the season countdown expires.",
    howToUse:
      "Finishing in higher rank brackets unlocks exclusive Seasonal Titles, Commemorative Contributor Badges, and permanent rollover XP perks for the next season.",
  },
  xp_boost: {
    title: "XP Multiplier Boost %",
    category: "Equipment Multiplier",
    icon: Sparkles,
    iconColor: "text-cyan-400",
    summary:
      "A passive multiplier that amplifies all XP gained from missions, bounties, and Discord raids.",
    howToEarn:
      "Equip high-tier Weapons, Helmets, Armor, Rings, and Auras. Complete 2-piece and 4-piece Gear Set bonuses and activate Contributor Pass tiers.",
    howToUse:
      "Automatically applies to every XP transaction in real time, accelerating your level progression and seasonal leaderboard climb.",
  },
  level: {
    title: "Raider Level & Lifetime XP",
    category: "Character Progression",
    icon: Crown,
    iconColor: "text-yellow-400",
    summary:
      "Your permanent Raider Level reflects total Lifetime XP earned across all seasons and never resets.",
    howToEarn: "Gain XP from any in-game or Discord activity to fill your level progress bar.",
    howToUse:
      "Each level up grants instant Spendable XP bonuses (+100 SP-XP) and unlocks higher-tier Supply Crates in the Forge.",
  },
  reputation: {
    title: "Reputation & Raid Standing",
    category: "Social Verification",
    icon: ShieldCheck,
    iconColor: "text-emerald-400",
    summary:
      "Represents verified raid participation and Discord community standing within the Fartboy ecosystem.",
    howToEarn:
      "Participate in verified group raids, community events, and maintain a high mission completion streak.",
    howToUse:
      "Unlocks restricted Guild Raids and grants passive discounts on Forge item fusion costs.",
  },
  packs: {
    title: "Supply Packs & Stash",
    category: "Loot Crates",
    icon: Package,
    iconColor: "text-red-400",
    summary:
      "Digital loot containers containing 4 randomized cosmetic gear items, powers, badges, and companion items.",
    howToEarn:
      "Claim your 3 daily unsealed mastery packs, earn milestone bounty packs, or purchase additional packs with Spendable XP in the Shop.",
    howToUse:
      "Open packs in the Pack Vault to unlock new items for your Collection Catalog and discover Mythic/Celestial gear.",
  },
  forge_efficiency: {
    title: "Forge Efficiency & Discount",
    category: "Crafting Passive",
    icon: Hammer,
    iconColor: "text-purple-400",
    summary:
      "A passive discount percentage that reduces the Spendable XP required to fuse, upgrade, and reroll gear in The Forge.",
    howToEarn:
      "Equip specialized Crafting gear, complete Forge milestone achievements, and level up your Raider.",
    howToUse:
      "Automatically reduces SP-XP crafting costs when leveling up equipment or ascending item rarity tiers.",
  },
  luck: {
    title: "Pack Drop Luck %",
    category: "Drop Rate Multiplier",
    icon: Sparkles,
    iconColor: "text-emerald-400",
    summary:
      "Increases the weighted probability of pulling Epic, Legendary, Mythic, and Celestial tier items from Supply Packs.",
    howToEarn:
      "Equip Luck-oriented Ring and Charm accessories, activate high-tier Contributor perks, and complete weekly raid streaks.",
    howToUse: "Applied automatically during every pack unboxing roll in the Vault.",
  },
};

interface StatInfoTooltipProps {
  stat: StatType;
  className?: string;
  size?: "xs" | "sm" | "md";
}

export function StatInfoTooltip({ stat, className = "", size = "xs" }: StatInfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const data = STAT_REGISTRY[stat] ?? STAT_REGISTRY.spendable_xp;
  const Icon = data.icon;

  const iconSizes = {
    xs: "h-3 w-3",
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={`inline-flex items-center justify-center min-h-[48px] min-w-[48px] p-2 rounded-full text-slate-400 hover:text-amber-300 hover:bg-amber-400/20 active:bg-amber-400/30 transition-all cursor-pointer select-none active:scale-90 touch-manipulation -m-2 relative ${className}`}
        aria-label={`Info about ${data.title}`}
        title={`Click for info on ${data.title}`}
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-900/60 border border-slate-700/60">
          <Info className={`${iconSizes[size]} shrink-0`} />
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-md bg-slate-950 border border-amber-500/50 text-foreground p-5 sm:p-6 rounded-2xl shadow-2xl space-y-4 font-mono z-[400]"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader className="border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {data.category}
              </span>
            </div>
            <DialogTitle className="flex items-center gap-2 font-display text-lg sm:text-xl font-black text-amber-300">
              <Icon className={`h-5 w-5 ${data.iconColor} shrink-0`} />
              <span>{data.title}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
              {data.summary}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs font-sans">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-1">
              <div className="font-mono text-[10.5px] font-bold text-emerald-400 uppercase tracking-wider">
                ⚡ How to Earn / Increase:
              </div>
              <p className="text-slate-300 text-[11.5px] leading-relaxed">{data.howToEarn}</p>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 space-y-1">
              <div className="font-mono text-[10.5px] font-bold text-amber-300 uppercase tracking-wider">
                🎯 How to Use / Effect:
              </div>
              <p className="text-slate-300 text-[11.5px] leading-relaxed">{data.howToUse}</p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              GOT IT
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

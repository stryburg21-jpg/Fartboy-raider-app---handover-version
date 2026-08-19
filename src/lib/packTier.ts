import type { Rarity } from "@/types/game";

/**
 * Vault pack tier FX — keyed by the pack's own `rarity` field (common / epic / legendary
 * for the 3 Season 1 packs today, mythic left in for future top-tier packs).
 *
 * Note: "common" is branded cyan here rather than the neutral gray used for common
 * *items* elsewhere (inventory, reveals) — packs get their own tier identity so the
 * entry-level Raider Pack doesn't read as flat/dead sitting next to the others. Epic and
 * Legendary reuse the real rarity tokens (--rarity-epic / --rarity-legendary) so they stay
 * consistent with the rest of the app's rarity language.
 *
 * Imported by both src/routes/shop.tsx (grid + hero cards) and
 * ProductDetailsModal.tsx (Inspect modal) so every surface renders the same
 * accent color per tier — this file is the single source of truth for that.
 */
export const PACK_TIER: Record<
  string,
  {
    accent: string;
    ribbonClass: string;
    ctaClass: string;
    label: string;
    particles: number;
    rings: boolean;
    godrays: boolean;
  }
> = {
  common: {
    accent: "#22d3ee",
    ribbonClass: "bg-cyan-500/90 text-slate-950",
    ctaClass:
      "bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 hover:from-cyan-300 hover:to-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.35)]",
    label: "COMMON",
    particles: 3,
    rings: false,
    godrays: false,
  },
  epic: {
    accent: "var(--rarity-epic)",
    ribbonClass: "bg-purple-600/90 text-white animate-pulse",
    ctaClass:
      "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white hover:from-purple-400 hover:to-fuchsia-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]",
    label: "SPECIALIST",
    particles: 5,
    rings: true,
    godrays: false,
  },
  legendary: {
    accent: "var(--rarity-legendary)",
    ribbonClass: "bg-rose-600/90 text-white shadow-[0_0_12px_rgba(225,29,72,0.6)]",
    ctaClass:
      "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 hover:scale-[1.02] shadow-[0_0_28px_rgba(245,158,11,0.5)]",
    label: "LEGENDARY",
    particles: 7,
    rings: true,
    godrays: true,
  },
  mythic: {
    accent: "var(--rarity-mythic)",
    ribbonClass: "bg-rose-500/90 text-white",
    ctaClass:
      "bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-400 hover:to-rose-500 shadow-[0_0_28px_rgba(244,63,94,0.5)]",
    label: "MYTHIC",
    particles: 8,
    rings: true,
    godrays: true,
  },
};

/** Generic (non-pack) shop listing card borders — driven by item rarity, unchanged elsewhere. */
export const rarityCardStyle: Record<Rarity, string> = {
  common: "border-border/80 bg-slate-900/90 hover:border-primary/50",
  uncommon:
    "border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 via-slate-900/90 to-slate-900/90 hover:border-emerald-500/70",
  rare: "border-blue-500/50 bg-gradient-to-b from-blue-950/25 via-slate-900/90 to-slate-900/90 hover:border-blue-500/80 shadow-[0_0_12px_rgba(59,130,246,0.15)]",
  epic: "border-purple-500/60 bg-gradient-to-b from-purple-950/30 via-slate-900/90 to-slate-900/90 hover:border-purple-500/90 shadow-[0_0_15px_rgba(168,85,247,0.2)]",
  legendary:
    "border-amber-500/70 bg-gradient-to-b from-amber-950/35 via-slate-900/90 to-slate-900/90 hover:border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)]",
  mythic:
    "border-rose-500/80 bg-gradient-to-b from-rose-950/40 via-slate-900/90 to-slate-900/90 hover:border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.3)]",
};

export function tierFor(rarity?: Rarity) {
  return PACK_TIER[rarity ?? "common"] ?? PACK_TIER.common;
}

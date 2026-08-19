import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { RarityBadge } from "@/components/game/RarityBadge";
import { Button } from "@/components/ui/button";
import { PackProbabilityGrid } from "@/components/game/PackProbabilityGrid";
import { PackPityProgressSection } from "@/components/game/PackPityProgressSection";
import { Pack3DChest } from "@/components/game/Pack3DChest";
import { tierFor } from "@/lib/packTier";
import { SEASON_1_PACKS_MAP } from "@/config/packs";
import type { Pack, Rarity } from "@/types/game";
import { Zap, Sparkles } from "lucide-react";

export interface PackDetailsModalProps {
  pack: Pack | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpen?: () => void;
  quantity?: number;
}

export function PackDetailsModal({
  pack,
  open,
  onOpenChange,
  onOpen,
  quantity,
}: PackDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-2 border-cyan-500/40 bg-slate-950 p-0 overflow-hidden shadow-2xl rounded-3xl text-slate-100">
        <VisuallyHidden>
          <DialogTitle>Pack Odds & Rate Details</DialogTitle>
        </VisuallyHidden>
        {pack ? <PackDetailsBody pack={pack} quantity={quantity} onOpen={onOpen} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function PackDetailsBody({
  pack,
  quantity,
  onOpen,
}: {
  pack: Pack;
  quantity?: number;
  onOpen?: () => void;
}) {
  const tier = tierFor(pack.rarity);
  const accent = tier ? tier.accent : `var(--rarity-${pack.rarity ?? "common"})`;

  const defaultProbabilities: Record<Rarity, number> = {
    common: 0.5,
    uncommon: 0.3,
    rare: 0.12,
    epic: 0.06,
    legendary: 0.02,
    mythic: 0.0,
  };

  const packProbabilities =
    pack.probabilities ||
    SEASON_1_PACKS_MAP[pack.id]?.rarityWeights ||
    SEASON_1_PACKS_MAP[pack.configId || ""]?.rarityWeights ||
    defaultProbabilities;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
      {/* Pack Art Visual Box with Market-grade Radial Gradient, Godrays & Rings */}
      <div
        className="relative flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-800 overflow-hidden"
        style={{
          background: `radial-gradient(circle at 50% 45%, color-mix(in oklab, ${accent} 26%, transparent), #020617 75%)`,
        }}
      >
        {tier?.godrays && (
          <span
            aria-hidden
            className="pointer-events-none absolute h-[240%] w-[240%] animate-godray opacity-35"
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, ${accent} 60%, transparent) 8deg, transparent 20deg, transparent 40deg, color-mix(in oklab, ${accent} 60%, transparent) 48deg, transparent 60deg, transparent 80deg, color-mix(in oklab, ${accent} 60%, transparent) 88deg, transparent 100deg)`,
            }}
          />
        )}
        {tier?.rings && (
          <span
            aria-hidden
            className="pointer-events-none absolute h-32 w-32 rounded-full border animate-ring-burst opacity-40"
            style={{ borderColor: accent }}
          />
        )}

        <div className="relative my-auto flex items-center justify-center">
          <div
            className="absolute h-36 w-36 rounded-full blur-xl animate-pulse pointer-events-none"
            style={{
              backgroundColor: `color-mix(in oklab, ${accent} 30%, transparent)`,
            }}
          />
          <div className="animate-pack-idle relative z-10 scale-105">
            <Pack3DChest packId={pack.id} rarity={pack.rarity} size="md" floating={false} />
          </div>
        </div>

        {typeof quantity === "number" && (
          <span
            className="mt-4 rounded-full px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider border shadow-md relative z-10"
            style={{
              backgroundColor: `color-mix(in oklab, ${accent} 20%, #020617)`,
              borderColor: `color-mix(in oklab, ${accent} 50%, transparent)`,
              color: accent,
            }}
          >
            {quantity === 1 ? "1 Pack in Vault" : `${quantity} Packs in Vault`}
          </span>
        )}
      </div>

      {/* Details & Probabilities Content */}
      <div className="flex flex-col gap-3.5 p-5 max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <RarityBadge rarity={pack.rarity} />
            <span
              className="font-mono text-[10px] font-black uppercase tracking-widest"
              style={{ color: accent }}
            >
              ODDS & RATES MATRIX
            </span>
          </div>

          <DialogTitle className="text-xl font-display font-black tracking-tight text-white">
            {pack.name}
          </DialogTitle>
          <p className="text-xs text-slate-400 leading-relaxed">{pack.description}</p>
        </DialogHeader>

        {/* Standardized Drop Probabilities 3x2 Grid */}
        <PackProbabilityGrid
          probabilities={packProbabilities}
          accentColor={accent}
          title="PACK DROP PROBABILITIES"
          subtitle="3 Items per Pack"
        />

        {/* Standardized Pity Progression & Guarantees */}
        <PackPityProgressSection
          packId={pack.id}
          isSpecialist={pack.id.includes("specialist")}
          accentColor={accent}
        />

        {/* Footer Action */}
        <div className="mt-auto flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
          {onOpen && (
            <Button
              size="sm"
              onClick={onOpen}
              disabled={typeof quantity === "number" && quantity <= 0}
              className="font-bold font-mono text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 text-slate-950 hover:brightness-110 shadow-md shadow-cyan-500/20 cursor-pointer rounded-xl px-5 h-9"
            >
              <Zap className="mr-1.5 h-3.5 w-3.5 fill-slate-950" /> Open Pack (
              {typeof quantity === "number" ? quantity : 1})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

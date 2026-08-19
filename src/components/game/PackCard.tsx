import type { Pack } from "@/types/game";
import { rarityBorderClass, rarityLabel, rarityTextClass } from "@/lib/rarity";
import { Pack3DChest } from "@/components/game/Pack3DChest";
import { Sparkles, Gift, CheckCircle2, Info } from "lucide-react";

export function PackCard({
  pack,
  quantity = 1,
  onOpen,
  onInspect,
}: {
  pack: Pack;
  quantity?: number;
  onOpen?: () => void;
  onInspect?: () => void;
}) {
  // Determine specialist focus label based on pack name / id
  const packNameLower = pack.name.toLowerCase();
  let specialistTag = "🌟 Specialist Drops";
  if (packNameLower.includes("raid")) specialistTag = "⚔️ Raid Specialist Equipment";
  else if (packNameLower.includes("meme")) specialistTag = "🎨 Meme Specialist Drops";
  else if (packNameLower.includes("cto")) specialistTag = "🛠️ CTO Supporter Items";
  else if (packNameLower.includes("video")) specialistTag = "📹 Video Creator Gear";

  const isLegendary =
    pack.rarity === "legendary" || pack.rarity === "mythic" || pack.id.includes("legendary");
  const isSpecialist = !isLegendary && (pack.rarity === "epic" || pack.id.includes("specialist"));
  const isRaider = !isLegendary && !isSpecialist;

  const auraClass = isLegendary
    ? "animate-aura-gold"
    : isSpecialist
      ? "animate-aura-purple"
      : "animate-aura-cyan";

  const glowBgMap: Record<string, string> = {
    common: "from-cyan-500/20 to-surface-3",
    uncommon: "from-emerald-500/20 to-surface-3",
    rare: "from-sky-500/20 to-surface-3",
    epic: "from-purple-500/25 to-surface-3",
    legendary: "from-amber-500/30 to-surface-3",
    mythic: "from-rose-500/35 to-surface-3",
  };

  const isKnownPack3D =
    pack.id.includes("raider") ||
    pack.id.includes("specialist") ||
    pack.id.includes("legendary") ||
    pack.id.includes("starter") ||
    pack.id === "pack_raider" ||
    pack.id === "pack_specialist" ||
    pack.id === "pack_legendary_raider";

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 bg-card p-4 sm:p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${rarityBorderClass[pack.rarity]}`}
    >
      {/* Background radial glow effect with tier-matched aura */}
      <div
        className={`absolute -right-12 -top-12 h-44 w-44 rounded-full bg-gradient-radial ${glowBgMap[pack.rarity] || "from-primary/20 to-transparent"} blur-2xl opacity-60 transition-opacity group-hover:opacity-100 ${auraClass} pointer-events-none`}
      />

      <div className="relative z-10">
        {/* Quantity Badge, Rarity Tag & Secondary Info Button */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`rounded-full border border-border/60 bg-black/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${rarityTextClass[pack.rarity]}`}
            >
              {rarityLabel[pack.rarity]}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary shadow-sm border border-primary/30">
              <CheckCircle2 className="h-3 w-3" />
              <span>{quantity === 1 ? "1 Ready" : `${quantity} Ready`}</span>
            </span>
          </div>

          {onInspect && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onInspect();
              }}
              title="View Drop Rates & Pity Probabilities"
              className="h-6 w-6 rounded-md border border-border/60 bg-surface-2/80 hover:bg-surface-3 text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Artwork Display Box with Idle Shake & Floating Motion */}
        <div
          className={`relative flex h-32 sm:h-36 w-full items-center justify-center rounded-xl bg-gradient-to-b ${glowBgMap[pack.rarity] || "from-surface-2 to-surface-3"} border border-border/40 overflow-visible shadow-inner`}
        >
          <div className="animate-pack-shake flex items-center justify-center scale-90 overflow-visible">
            {isKnownPack3D ? (
              <Pack3DChest packId={pack.id} rarity={pack.rarity} size="md" floating={false} />
            ) : (
              <span className="text-6xl sm:text-7xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
                {pack.image}
              </span>
            )}
          </div>
        </div>

        {/* Pack Info */}
        <div className="mt-3">
          <div className="mb-1 inline-block rounded-md bg-surface-3 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            {specialistTag}
          </div>
          <h3 className="font-display text-base sm:text-lg font-bold text-foreground leading-tight">
            {pack.name}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {pack.description}
          </p>
        </div>

        {/* Reward hint */}
        <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-border/50 bg-surface-2/60 px-2.5 py-1.5 text-[10px] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="truncate">Contains 3 gear drops for sets & forge.</span>
        </div>
      </div>

      {/* Prominent Open Pack Button */}
      {onOpen && (
        <button
          onClick={onOpen}
          className="relative z-10 mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md transition-all duration-200 hover:brightness-110 hover:shadow-primary/20 active:scale-[0.98] cursor-pointer"
        >
          <Gift className="h-3.5 w-3.5" /> OPEN PACK NOW
        </button>
      )}
    </div>
  );
}

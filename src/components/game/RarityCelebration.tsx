import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { RarityBadge } from "@/components/game/RarityBadge";
import { Button } from "@/components/ui/button";
import { audio } from "@/services/audio";
import type { Item, Rarity } from "@/types/game";

const RARITY_HEX: Record<Rarity, string> = {
  common: "var(--rarity-common)",
  uncommon: "var(--rarity-uncommon)",
  rare: "var(--rarity-rare)",
  epic: "var(--rarity-epic)",
  legendary: "var(--rarity-legendary)",
  mythic: "var(--rarity-mythic)",
};

const SPARKS = Array.from({ length: 18 }, (_, i) => i);

export interface RarityCelebrationProps {
  item: Item;
  headline?: string;
  onContinue?: () => void;
  onClose?: () => void;
  autoDismissMs?: number;
}

export function RarityCelebration({
  item,
  headline,
  onContinue,
  onClose,
  autoDismissMs,
}: RarityCelebrationProps) {
  const handleDismiss = () => {
    audio.play("reward.claim");
    onContinue?.();
    onClose?.();
  };

  useEffect(() => {
    if (!item) return;
    audio.play(`celebration.${item.rarity}`);
    if (autoDismissMs) {
      const timer = setTimeout(() => {
        audio.play("reward.claim");
        onContinue?.();
        onClose?.();
      }, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [item, autoDismissMs, onContinue, onClose]);

  if (!item) return null;

  const hex = RARITY_HEX[item.rarity];
  const isMythic = item.rarity === "mythic";
  const isUrl =
    item.image.startsWith("http") || item.image.startsWith("/") || item.image.startsWith("data:");

  return (
    <div
      className="fixed inset-0 z-[60] flex animate-celebration-in flex-col items-center justify-center bg-black/80 px-4 text-center"
      role="dialog"
      aria-label={`${item.rarity} pull celebration`}
    >
      {/* Rotating god rays */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-godray opacity-60"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, ${hex} 30%, transparent) 12deg, transparent 24deg, transparent 36deg, color-mix(in oklab, ${hex} 22%, transparent) 48deg, transparent 60deg)`,
          maskImage: "radial-gradient(circle at center, black 10%, transparent 72%)",
        }}
      />

      {/* Falling sparks */}
      {SPARKS.map((i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute top-0 animate-spark-fall text-lg"
          style={{
            left: `${(i * 5.5 + 3) % 98}%`,
            animationDelay: `${(i % 7) * 260}ms`,
            animationDuration: `${2200 + (i % 5) * 420}ms`,
            color: `color-mix(in oklab, ${hex} 85%, white)`,
          }}
        >
          {isMythic ? "✷" : "✦"}
        </span>
      ))}

      {/* Expanding rings */}
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute h-64 w-64 animate-ring-burst rounded-full border-2"
          style={{
            borderColor: `color-mix(in oklab, ${hex} 70%, transparent)`,
            animationDelay: `${i * 260}ms`,
          }}
        />
      ))}

      <div className="relative flex flex-col items-center gap-4">
        <span
          className="font-mono text-[11px] font-bold uppercase tracking-[0.6em]"
          style={{ color: `color-mix(in oklab, ${hex} 85%, white)` }}
        >
          {headline ?? `${item.rarity} pull`}
        </span>

        <div
          className={cn(
            "relative flex flex-col items-center gap-3 rounded-2xl border px-8 py-8 animate-showcase-in",
          )}
          style={{
            borderColor: `color-mix(in oklab, ${hex} 75%, transparent)`,
            background: `radial-gradient(ellipse at center, color-mix(in oklab, ${hex} 28%, transparent), transparent 72%)`,
            boxShadow: `0 0 120px 0 color-mix(in oklab, ${hex} 65%, transparent)`,
          }}
        >
          {/* Sheen sweep */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-sheen-sweep bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)]"
          />

          {isUrl ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-28 w-28 object-contain drop-shadow-[0_10px_40px_rgba(0,0,0,0.7)] sm:h-36 sm:w-36"
            />
          ) : (
            <span className="text-[7rem] leading-none drop-shadow-[0_10px_40px_rgba(0,0,0,0.7)] sm:text-[9rem]">
              {item.image}
            </span>
          )}

          <span className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {item.name}
          </span>

          <RarityBadge rarity={item.rarity} />

          <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {item.slot ? <span>Slot: {item.slot}</span> : null}
            {item.set ? <span>· Set: {item.set}</span> : null}
          </div>

          {item.description ? (
            <p className="max-w-xs text-center text-xs text-muted-foreground">{item.description}</p>
          ) : null}
        </div>

        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Pack Opening → Vault Inventory
        </p>

        <Button
          onClick={handleDismiss}
          size="lg"
          className="min-w-32 font-bold uppercase tracking-wider"
        >
          Continue →
        </Button>
      </div>
    </div>
  );
}

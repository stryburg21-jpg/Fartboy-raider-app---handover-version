import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { RarityBadge } from "@/components/game/RarityBadge";
import { audio } from "@/services/audio";
import type { Item, Rarity } from "@/types/game";
import { getItem6StatBadges } from "@/utils/itemStats";
import { Sparkles, Zap, Star, Crown, Flame } from "lucide-react";

const RARITY_HEX: Record<Rarity, string> = {
  common: "#94a3b8",
  uncommon: "#22c55e",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f59e0b",
  mythic: "#ef4444",
};

const RARITY_RANK: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythic: 5,
};

/** Per-rarity reveal treatment — richer effects the higher the tier. */
const REVEAL_FX: Record<
  Rarity,
  {
    beams: number;
    rings: number;
    sheen: boolean;
    shake: boolean;
    flash: boolean;
    confetti: boolean;
    suspenseMs: number;
    flipMs: number;
  }
> = {
  common: {
    beams: 0,
    rings: 0,
    sheen: false,
    shake: false,
    flash: false,
    confetti: false,
    suspenseMs: 150,
    flipMs: 400,
  },
  uncommon: {
    beams: 2,
    rings: 0,
    sheen: true,
    shake: false,
    flash: false,
    confetti: false,
    suspenseMs: 200,
    flipMs: 450,
  },
  rare: {
    beams: 4,
    rings: 1,
    sheen: true,
    shake: false,
    flash: false,
    confetti: false,
    suspenseMs: 300,
    flipMs: 500,
  },
  epic: {
    beams: 8,
    rings: 2,
    sheen: true,
    shake: true,
    flash: true,
    confetti: false,
    suspenseMs: 650,
    flipMs: 550,
  },
  legendary: {
    beams: 12,
    rings: 4,
    sheen: true,
    shake: true,
    flash: true,
    confetti: true,
    suspenseMs: 1500,
    flipMs: 700,
  },
  mythic: {
    beams: 16,
    rings: 5,
    sheen: true,
    shake: true,
    flash: true,
    confetti: true,
    suspenseMs: 1600,
    flipMs: 800,
  },
};

const CONFETTI_PARTICLES = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  x: Math.cos((i * 11.25 * Math.PI) / 180) * (110 + (i % 4) * 30),
  y: Math.sin((i * 11.25 * Math.PI) / 180) * (110 + (i % 4) * 30),
  rot: i * 30,
  delay: (i % 8) * 35,
  color: i % 2 === 0 ? "#fbbf24" : i % 3 === 0 ? "#f43f5e" : "#38bdf8",
}));

export interface ItemRevealCardProps {
  item: Item;
  revealed?: boolean;
  index?: number;
  total?: number;
  isNew?: boolean;
  isDuplicate?: boolean;
  onReveal?: () => void;
  onRevealed?: () => void;
}

export function ItemRevealCard({
  item,
  revealed = true,
  index = 0,
  total = 1,
  isNew,
  isDuplicate,
  onReveal,
  onRevealed,
}: ItemRevealCardProps) {
  const [flipped, setFlipped] = useState(revealed);
  const [landed, setLanded] = useState(revealed);
  const [isRumbling, setIsRumbling] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const fx = REVEAL_FX[item.rarity] || REVEAL_FX.common;
  const rank = RARITY_RANK[item.rarity] || 0;
  const hex = RARITY_HEX[item.rarity] || "#94a3b8";
  const isHighTier = rank >= 4; // Legendary or Mythic

  // Pre-load image artwork immediately and decode
  useEffect(() => {
    if (
      item.image &&
      (item.image.startsWith("http") ||
        item.image.startsWith("/") ||
        item.image.startsWith("data:"))
    ) {
      const img = new Image();
      img.src = item.image;
      if ("decode" in img) {
        img.decode().catch(() => {});
      }
    }
  }, [item.image]);

  // Sequence triggering - when revealed is true, instantly present card
  useEffect(() => {
    if (revealed) {
      setFlipped(true);
      setLanded(true);
      setShowFlash(false);
      setShowBanner(false);
      setIsRumbling(false);

      // Play arrival audio immediately
      audio.play("card.land");
      audio.play(`card.reveal.${item.rarity}`);
      if (isDuplicate) audio.play("reward.duplicate");
      else if (isNew) audio.play("reward.new");
      onReveal?.();
      onRevealed?.();
      return;
    }

    setFlipped(false);
    setLanded(false);
    setShowFlash(false);
    setShowBanner(false);
    setIsRumbling(false);

    let flipTimer: ReturnType<typeof setTimeout> | null = null;
    let bannerTimer: ReturnType<typeof setTimeout> | null = null;

    if (isHighTier) {
      setIsRumbling(true);
      setShowBanner(true);
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 400);
      audio.play("pack.drumroll");

      bannerTimer = setTimeout(() => {
        setShowBanner(false);
        setIsRumbling(false);
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 600);
        audio.play("celebration");
        handlePerformFlip();
      }, 1200);
    } else if (rank === RARITY_RANK.epic) {
      setIsRumbling(true);
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 350);
      audio.play("pack.drumroll");
      flipTimer = setTimeout(() => {
        setIsRumbling(false);
        handlePerformFlip();
      }, fx.suspenseMs);
    } else {
      flipTimer = setTimeout(() => {
        handlePerformFlip();
      }, fx.suspenseMs);
    }

    return () => {
      if (flipTimer) clearTimeout(flipTimer);
      if (bannerTimer) clearTimeout(bannerTimer);
    };
  }, [item.id, index, revealed]);

  function handlePerformFlip() {
    setIsRumbling(false);
    setShowBanner(false);
    audio.play("card.flip");
    setFlipped(true);

    if (fx.flash) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 500);
    }

    setTimeout(() => {
      setLanded(true);
      audio.play("card.land");
      audio.play(`card.reveal.${item.rarity}`);
      if (isDuplicate) audio.play("reward.duplicate");
      else if (isNew) audio.play("reward.new");
      onReveal?.();
      onRevealed?.();
    }, fx.flipMs);
  }

  const isUrl =
    Boolean(item.image) &&
    (item.image.startsWith("http") || item.image.startsWith("/") || item.image.startsWith("data:"));

  // Collect XP Boost / Stat Badges
  const statBadges = getItem6StatBadges(item);

  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-sm [perspective:1400px]">
      {/* Full-screen cinematic dark tint for Legendary / Mythic suspense */}
      {(isRumbling || showBanner) && isHighTier && (
        <div
          aria-hidden
          className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md transition-opacity duration-700 pointer-events-none"
        />
      )}

      {/* Dramatic Banner Drop for Legendary / Mythic */}
      {showBanner && isHighTier && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-banner-drop w-full max-w-md px-4 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 shadow-2xl border-2 backdrop-blur-xl"
            style={{
              borderColor: hex,
              background: `linear-gradient(135deg, ${hex}40, rgba(0,0,0,0.9))`,
              boxShadow: `0 0 45px 5px ${hex}88`,
            }}
          >
            {item.rarity === "mythic" ? (
              <>
                <Flame className="h-6 w-6 text-rose-400 fill-rose-400 animate-bounce" />
                <span className="font-display font-black text-xl tracking-wider text-rose-300 uppercase drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]">
                  🔥 MYTHIC PULL! 🔥
                </span>
              </>
            ) : (
              <>
                <Crown className="h-6 w-6 text-amber-400 fill-amber-400 animate-bounce" />
                <span className="font-display font-black text-xl tracking-wider text-amber-300 uppercase drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]">
                  👑 LEGENDARY PULL!
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Intense screen / card flash for Epic / Legendary / Mythic */}
      {showFlash && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-50 animate-out fade-out duration-500"
          style={{
            background:
              rank >= 4
                ? "radial-gradient(circle, rgba(251, 191, 36, 0.5) 0%, rgba(255, 255, 255, 0.4) 40%, transparent 80%)"
                : "radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, rgba(255, 255, 255, 0.3) 40%, transparent 80%)",
          }}
        />
      )}

      {/* Per-rarity glowing light beams behind card */}
      {landed && fx.beams > 0 && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 h-full w-full flex items-center justify-center">
          {Array.from({ length: fx.beams }).map((_, i) => (
            <span
              key={`beam-${i}`}
              aria-hidden
              className="absolute h-[150%] w-10 origin-center animate-rarity-beam opacity-80"
              style={{
                transform: `rotate(${(360 / fx.beams) * i}deg)`,
                background: `linear-gradient(to top, transparent, ${hex}99, transparent)`,
                animationDelay: `${i * 60}ms`,
              }}
            />
          ))}
        </div>
      )}

      {/* Expanding impact shockwave rings */}
      {landed && fx.rings > 0 && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
          {Array.from({ length: fx.rings }).map((_, i) => (
            <span
              key={`ring-${i}`}
              aria-hidden
              className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 animate-ring-burst rounded-full border-2"
              style={{
                borderColor: hex,
                animationDelay: `${i * 160}ms`,
              }}
            />
          ))}
        </div>
      )}

      {/* Confetti Explosion for Legendary & Mythic */}
      {landed && fx.confetti && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          {CONFETTI_PARTICLES.map((p) => (
            <span
              key={`confetti-${p.id}`}
              className="absolute h-2.5 w-2.5 rounded-sm animate-ping"
              style={{
                transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`,
                backgroundColor: p.color,
                animationDuration: "1.4s",
                animationDelay: `${p.delay}ms`,
              }}
            />
          ))}
        </div>
      )}

      {/* Card Container with 3D Flip & Suspense Rumble */}
      <div
        className={cn(
          "relative min-h-[30rem] w-full [transform-style:preserve-3d]",
          isRumbling && "animate-suspense-rumble",
          landed && fx.shake && "animate-screen-shake",
        )}
        style={{
          transition: `transform ${fx.flipMs}ms cubic-bezier(0.22, 1.15, 0.36, 1)`,
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* BACK FACE — Face-down Card with Foil Pattern & Suspense Glow */}
        <div
          onClick={handlePerformFlip}
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border-2 [backface-visibility:hidden]",
            "bg-gradient-to-b from-slate-900 via-slate-950 to-black p-6 shadow-2xl transition-transform hover:scale-[1.02] cursor-pointer",
            isRumbling && isHighTier
              ? "border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.6)]"
              : isRumbling
                ? "border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                : "border-slate-700/80",
          )}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2 animate-sheen-sweep bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)]"
          />
          <div
            className={cn(
              "h-16 w-16 rounded-2xl border flex items-center justify-center shadow-inner transition-all",
              isRumbling && isHighTier
                ? "border-amber-400/80 bg-amber-500/20 animate-pulse scale-110"
                : isRumbling
                  ? "border-purple-400/80 bg-purple-500/20 animate-pulse scale-110"
                  : "border-cyan-500/40 bg-cyan-500/10",
            )}
          >
            {isHighTier ? (
              <Crown className="h-8 w-8 text-amber-400 animate-bounce" />
            ) : (
              <Sparkles className="h-8 w-8 text-cyan-400 animate-pulse" />
            )}
          </div>

          <span className="font-mono text-xs uppercase tracking-[0.4em] text-slate-400 font-bold">
            Item {index + 1} of {total}
          </span>

          <span
            className={cn(
              "font-mono text-6xl font-black transition-colors",
              isRumbling && isHighTier
                ? "text-amber-300 drop-shadow-[0_0_35px_rgba(251,191,36,0.8)] animate-pulse"
                : isRumbling
                  ? "text-purple-300 drop-shadow-[0_0_25px_rgba(168,85,247,0.7)] animate-pulse"
                  : "text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.5)] animate-bounce",
            )}
          >
            ?
          </span>

          <span
            className={cn(
              "font-mono text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full border transition-all",
              isRumbling && isHighTier
                ? "text-amber-300 bg-amber-950/80 border-amber-400/60 animate-pulse"
                : "text-cyan-400 bg-cyan-950/60 border-cyan-500/30",
            )}
          >
            {isRumbling ? "SUSPENSE BUILDING..." : "Tap or wait to reveal"}
          </span>
        </div>

        {/* FRONT FACE — Full High-Res Item Details */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-between overflow-y-auto custom-scrollbar touch-pan-y rounded-2xl border-2 p-4 sm:p-5 [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-2xl backdrop-blur-md",
          )}
          style={{
            borderColor: hex,
            background: `linear-gradient(180deg, ${hex}30 0%, rgba(15, 23, 42, 0.95) 45%, rgba(2, 6, 23, 0.98) 100%)`,
            boxShadow: `0 0 ${40 + rank * 18}px -5px ${hex}77`,
          }}
        >
          {/* Dynamic Light Sheen */}
          {fx.sheen && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-sheen-sweep bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)]"
            />
          )}

          {/* Top Status Header */}
          <div className="flex items-center justify-between gap-2 z-10">
            <div className="flex flex-wrap items-center gap-1.5">
              {isNew && (
                <span className="rounded-md bg-cyan-400 px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider text-slate-950 shadow-sm">
                  ✨ NEW PULL
                </span>
              )}
              {isDuplicate && (
                <span className="rounded-md border border-amber-500/60 bg-amber-500/20 px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider text-amber-300 shadow-sm">
                  DUPLICATE
                </span>
              )}
            </div>
            <span className="font-mono text-xs font-black tracking-wider text-slate-400 bg-slate-900/80 px-2.5 py-0.5 rounded-md border border-slate-700/60">
              {index + 1} / {total}
            </span>
          </div>

          {/* Centered High-Res Item Sprite / Icon */}
          <div className="relative my-2 flex flex-col items-center justify-center py-2 z-10">
            {/* Ambient Radial Glow matching Rarity */}
            <div
              aria-hidden
              className="absolute h-36 w-36 rounded-full blur-2xl opacity-80"
              style={{ background: hex }}
            />

            <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-slate-950/80 border-2 border-white/15 p-2 flex items-center justify-center shadow-2xl backdrop-blur-sm overflow-hidden">
              {isUrl ? (
                <>
                  <span aria-hidden className="absolute text-4xl opacity-30 select-none">
                    {item.slot === "head"
                      ? "🪖"
                      : item.slot === "body"
                        ? "👕"
                        : item.slot === "shorts"
                          ? "🩳"
                          : item.slot === "feet"
                            ? "🥾"
                            : item.slot === "back"
                              ? "🦸"
                              : item.slot === "pet"
                                ? "🐾"
                                : "⚡"}
                  </span>
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="eager"
                    decoding="sync"
                    className="relative z-10 h-20 w-20 sm:h-24 sm:w-24 object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)] animate-scale-in"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                </>
              ) : (
                <span className="text-6xl sm:text-7xl leading-none drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)] animate-scale-in">
                  {item.image || "⚔️"}
                </span>
              )}
            </div>
          </div>

          {/* Item Name & Identity Tags */}
          <div className="text-center space-y-1.5 z-10">
            <h3 className="text-lg sm:text-xl font-display font-black tracking-tight text-white line-clamp-1 drop-shadow-md">
              {item.name}
            </h3>

            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <RarityBadge rarity={item.rarity} />
              <span className="rounded-md border border-slate-700 bg-black/50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300">
                Slot: {item.slot}
              </span>
              <span className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] font-black text-cyan-300">
                Lv {item.level ?? 1}
              </span>

              {/* Quality % Roll */}
              {typeof item.metadata?.quality_roll_pct_display === "number" ? (
                <span className="rounded-md border border-amber-400/50 bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-black text-amber-300 flex items-center gap-1">
                  <Zap className="h-2.5 w-2.5 fill-amber-400" />{" "}
                  {item.metadata.quality_roll_pct_display}% Quality
                </span>
              ) : typeof item.metadata?.quality_roll_pct === "number" ? (
                <span className="rounded-md border border-amber-400/50 bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-black text-amber-300 flex items-center gap-1">
                  <Zap className="h-2.5 w-2.5 fill-amber-400" />{" "}
                  {((item.metadata.quality_roll_pct as number) * 100).toFixed(1)}% Quality
                </span>
              ) : null}
            </div>

            {item.description && (
              <p className="text-[11px] text-slate-300 line-clamp-2 px-2 leading-tight">
                {item.description}
              </p>
            )}
          </div>

          {/* Stat Multiplier Badges */}
          <div className="mt-2 rounded-xl bg-black/40 border border-white/10 p-2 z-10">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber-400/90 text-center font-black mb-1">
              Combat Multipliers & Boosts
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {statBadges.length > 0 ? (
                statBadges.slice(0, 4).map((badge, bIdx) => (
                  <span
                    key={bIdx}
                    className={`rounded-md border px-2 py-0.5 font-mono text-[10px] tracking-wider font-extrabold flex items-center gap-1 ${badge.color}`}
                  >
                    <span>{badge.icon}</span>
                    <span>
                      {badge.label}: {badge.value}
                    </span>
                  </span>
                ))
              ) : (
                <span className="font-mono text-[10px] text-slate-400">
                  Standard baseline loadout
                </span>
              )}
            </div>
          </div>

          {/* Set Affiliation / Bonus */}
          {item.set && (
            <div className="mt-1.5 z-10">
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-center font-mono text-[10px] font-black text-amber-300 flex items-center justify-center gap-1">
                <Star className="h-3 w-3 fill-amber-400" />
                <span>Part of {item.set} Set</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

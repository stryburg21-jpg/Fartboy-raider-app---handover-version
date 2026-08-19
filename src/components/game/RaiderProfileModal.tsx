import { motion, AnimatePresence } from "motion/react";
import { Link } from "@tanstack/react-router";
import {
  X,
  Shield,
  Award,
  Swords,
  Flame,
  Sparkles,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Video,
  Zap,
} from "lucide-react";
import type { LeaderboardEntry } from "@/types/game";
import { RarityBadge } from "./RarityBadge";
import { Button } from "@/components/ui/button";
import { RaiderAvatar } from "./RaiderAvatar";

interface RaiderProfileModalProps {
  player: LeaderboardEntry | null;
  onClose: () => void;
}

export function RaiderProfileModal({ player, onClose }: RaiderProfileModalProps) {
  if (!player) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-primary/40 bg-gradient-to-b from-surface-1 via-card to-surface-2 p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 rounded-full p-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* PLAYER HEADER & AVATAR */}
          <div className="flex items-start gap-3 sm:gap-4 pr-6">
            <div className="relative shrink-0">
              <RaiderAvatar
                avatar={player.avatar}
                username={player.username}
                sizeClassName="h-14 w-14 sm:h-20 sm:w-20 text-3xl sm:text-5xl"
                className="border-2 border-primary shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 rounded-md bg-primary px-1.5 sm:px-2 py-0.5 font-mono text-[10px] sm:text-xs font-extrabold text-primary-foreground shadow-md">
                LV {player.level ?? 1}
              </span>
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="font-mono text-[10px] sm:text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Rank #{player.rank}
                </span>
                <span className="font-mono text-[9px] sm:text-[10px] font-extrabold uppercase text-muted-foreground truncate">
                  {player.specialistIdentity ?? "Specialist Raider"}
                </span>
              </div>

              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-foreground truncate">
                {player.username}
              </h2>

              {player.contributorTitle && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold text-primary border border-primary/30 max-w-full truncate">
                  <Award className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">"{player.contributorTitle}"</span>
                </div>
              )}
            </div>
          </div>

          {/* XP & BOOST STATS BANNER */}
          <div className="rounded-2xl border border-border/80 bg-surface-2/60 p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="space-y-0.5">
              <span className="font-mono text-[9px] sm:text-[10px] uppercase text-muted-foreground font-extrabold">
                Season XP Earned
              </span>
              <div className="font-mono text-sm sm:text-base font-extrabold text-amber-400">
                ⚡ {(player.seasonXP ?? player.xp).toLocaleString()} XP
              </div>
            </div>

            {player.titleXPBoostPct && (
              <div className="text-right space-y-0.5">
                <span className="font-mono text-[9px] sm:text-[10px] uppercase text-muted-foreground font-extrabold">
                  Active Title XP Multiplier
                </span>
                <div className="font-mono text-[11px] sm:text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  +{player.titleXPBoostPct}% Next Season Boost
                </div>
              </div>
            )}
          </div>

          {/* EQUIPPED LOADOUT PREVIEW */}
          <div className="space-y-2">
            <span className="font-display text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary shrink-0" /> Equipped Raider Equipment
            </span>

            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 rounded-2xl border border-border/60 bg-surface-1 p-3">
              {(player.equippedItemIcons ?? ["👑", "🧪", "🥼", "⚡", "🦸", "🐉", "🔮"]).map(
                (icon, idx) => (
                  <div
                    key={idx}
                    className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-surface-3 text-lg sm:text-xl shadow-inner border border-border/80 shrink-0"
                  >
                    {icon}
                  </div>
                ),
              )}
            </div>
          </div>

          {/* CONTRIBUTION HISTORY STATS */}
          <div className="space-y-2">
            <span className="font-display text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Contribution History
            </span>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-surface-3/80 p-2.5 border border-border/50">
                <div className="flex items-center justify-center gap-1 text-[10px] font-mono uppercase text-muted-foreground font-bold">
                  <Swords className="h-3 w-3 text-sky-400" /> Raids
                </div>
                <div className="font-display text-sm font-extrabold text-foreground mt-0.5">
                  {player.raidCount.toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl bg-surface-3/80 p-2.5 border border-border/50">
                <div className="flex items-center justify-center gap-1 text-[10px] font-mono uppercase text-muted-foreground font-bold">
                  <ImageIcon className="h-3 w-3 text-purple-400" /> Memes
                </div>
                <div className="font-display text-sm font-extrabold text-foreground mt-0.5">
                  {player.memesCount ?? Math.floor(player.raidCount / 20)}
                </div>
              </div>

              <div className="rounded-xl bg-surface-3/80 p-2.5 border border-border/50">
                <div className="flex items-center justify-center gap-1 text-[10px] font-mono uppercase text-muted-foreground font-bold">
                  <Video className="h-3 w-3 text-emerald-400" /> Videos
                </div>
                <div className="font-display text-sm font-extrabold text-foreground mt-0.5">
                  {player.videosCount ?? Math.floor(player.raidCount / 50)}
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center gap-3 pt-2 border-t border-border/80">
            <Link
              to="/player/$id"
              params={{ id: player.playerId }}
              onClick={onClose}
              className="flex-1"
            >
              <Button className="w-full font-mono text-xs uppercase tracking-wider font-extrabold h-11 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2">
                Inspect Full Profile <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={onClose}
              className="font-mono text-xs uppercase tracking-wider font-bold h-11 px-5"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

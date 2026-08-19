import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PrestigeLeaderboardHub } from "@/components/game/PrestigeLeaderboardHub";
import { ContributorPassHub } from "@/components/game/ContributorPassHub";
import { useGameStore } from "@/store/gameStore";
import {
  Trophy,
  Star,
  Crown,
  Zap,
  Gift,
  Shield,
  CheckCircle2,
  ChevronRight,
  Award,
  Flame,
} from "lucide-react";

export function HeaderLeaderboardModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-amber-500/40 text-foreground p-4 sm:p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="border-b border-amber-500/20 pb-3 mb-4 pr-12">
          <DialogTitle className="flex items-center gap-2 font-display text-xl sm:text-2xl font-black text-amber-300">
            <Trophy className="h-6 w-6 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <span>GLOBAL POWER RANKINGS & RAID CONTRIBUTORS</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <PrestigeLeaderboardHub />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function HeaderContributorModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const player = useGameStore((s) => s.player);
  const supporterRank = player?.contributorRank || "Gold Supporter";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-amber-500/40 text-foreground p-4 sm:p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="border-b border-amber-500/20 pb-3 mb-4 pr-12">
          <DialogTitle className="flex items-center justify-between font-display text-xl sm:text-2xl font-black text-amber-300">
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              <span>CONTRIBUTOR GAMEPASS & TIER STATUS</span>
            </div>
            <span className="rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.5)] border border-amber-200">
              {supporterRank}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* TOP STATUS SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-amber-500/30 bg-slate-900/90 p-3.5 space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/80 flex items-center gap-1">
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              <span>Active Tier</span>
            </div>
            <div className="font-display font-black text-lg text-white">{supporterRank}</div>
            <p className="text-[10px] text-slate-400">Monthly Supporter Pass Tier</p>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-slate-900/90 p-3.5 space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/80 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Passive XP Boost</span>
            </div>
            <div className="font-display font-black text-lg text-amber-300">+15% XP MULTIPLIER</div>
            <p className="text-[10px] text-slate-400">Applies to all daily raids & missions</p>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-slate-900/90 p-3.5 space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/80 flex items-center gap-1">
              <Gift className="h-3.5 w-3.5 text-amber-400" />
              <span>Monthly Perks</span>
            </div>
            <div className="font-display font-black text-lg text-emerald-300">
              1x LEGENDARY PACK DROP
            </div>
            <p className="text-[10px] text-slate-400">Auto-allocated monthly on 1st</p>
          </div>
        </div>

        <div className="space-y-4">
          <ContributorPassHub />
        </div>
      </DialogContent>
    </Dialog>
  );
}

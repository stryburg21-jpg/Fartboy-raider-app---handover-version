import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Package, Zap, Lock, ArrowRight, Play, Film } from "lucide-react";
import type { AutomatedMissionItem } from "@/services/automatedMissionsApi";
import { audio } from "@/services/audio";

interface ThreePacketUnboxingModalProps {
  open: boolean;
  onClose: () => void;
  featuredMissions: AutomatedMissionItem[];
  onUnsealComplete: () => void;
}

export function ThreePacketUnboxingModal({
  open,
  onClose,
  featuredMissions,
  onUnsealComplete,
}: ThreePacketUnboxingModalProps) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [shockwaveActive, setShockwaveActive] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Lock page body scrolling while modal is active
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  const fallbackMissions: AutomatedMissionItem[] = [
    {
      id: "feat-default-0",
      title: "Frontline Scout",
      description: "Execute 3 Verified Raids in #cto-official-post channel",
      baseRewardXP: 750,
      rarity: "common",
      discordChannel: "#cto-official-post",
      completedCount: 0,
      totalRequired: 3,
      status: "unstarted",
      discordUrl: "https://discord.gg/fartboy",
      roomTag: "#cto-official-post",
      actionRequirements: "Execute 3 Verified Raids in #cto-official-post channel",
    },
    {
      id: "feat-default-1",
      title: "Sniper Duty",
      description: "Execute 1 Sniper Raid on priority partner alerts in #cto-snipe-targets",
      baseRewardXP: 500,
      rarity: "rare",
      discordChannel: "#cto-snipe-targets",
      completedCount: 0,
      totalRequired: 1,
      status: "unstarted",
      discordUrl: "https://discord.gg/fartboy",
      roomTag: "#cto-snipe-targets",
      actionRequirements: "Execute 1 Sniper Raid on priority partner alerts",
    },
    {
      id: "feat-default-2",
      title: "War Room Strategist",
      description: "Participate in daily raid briefing and share updates",
      baseRewardXP: 1000,
      rarity: "epic",
      discordChannel: "#war-room",
      completedCount: 0,
      totalRequired: 1,
      status: "unstarted",
      discordUrl: "https://discord.gg/fartboy",
      roomTag: "#war-room",
      actionRequirements: "Participate in daily raid briefing",
    },
  ];

  const displayMissions =
    featuredMissions && featuredMissions.length >= 3
      ? featuredMissions.slice(0, 3)
      : [
          ...(featuredMissions || []),
          ...fallbackMissions.slice(0, 3 - (featuredMissions?.length || 0)),
        ];

  const isAllRevealed =
    displayMissions.length > 0 &&
    displayMissions.every((m, idx) => revealed[m.id || `feat-${idx}`]);

  const triggerGlowBeamEffect = () => {
    setShockwaveActive(true);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 450);
    setTimeout(() => setShockwaveActive(false), 850);
  };

  const handleRevealPacket = (id: string) => {
    if (revealed[id]) return;
    audio.play("button.click");
    triggerGlowBeamEffect();

    setRevealed((prev) => ({ ...prev, [id]: true }));
  };

  const handleUnsealAll = () => {
    audio.play("button.click");
    triggerGlowBeamEffect();

    const allIds: Record<string, boolean> = {};
    displayMissions.forEach((m, idx) => {
      allIds[m.id || `feat-${idx}`] = true;
    });
    setRevealed(allIds);
  };

  const handleComplete = () => {
    audio.play("button.click");
    onUnsealComplete();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-2xl border-2 border-amber-500/60 bg-[#0A0D14]/98 text-foreground p-4 sm:p-6 max-h-[88vh] overflow-y-auto z-[9999] backdrop-blur-2xl shadow-[0_0_60px_rgba(245,158,11,0.35)] rounded-3xl relative overflow-hidden">
        {/* GLOW PULSE & ENERGY SHOCKWAVE BEAM EFFECT OVERLAY */}
        <AnimatePresence>
          {shockwaveActive && (
            <>
              {/* Central Cyan & Gold Radial Beam Wave */}
              <motion.div
                initial={{ scale: 0.1, opacity: 1 }}
                animate={{ scale: 2.2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-amber-400/40 via-cyan-400/30 to-amber-500/40 border-4 border-cyan-300 shadow-[0_0_80px_rgba(6,182,212,0.8)] pointer-events-none z-50"
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-cyan-300/25 to-yellow-400/20 pointer-events-none z-40"
              />
            </>
          )}
        </AnimatePresence>

        <DialogHeader className="text-center space-y-1.5 pb-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-400/50 px-3 py-0.5 text-[10px] font-mono font-black text-amber-300 mx-auto shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span>TACTICAL WAR ROOM BOUNTIES</span>
          </div>

          <DialogTitle className="font-display font-black text-xl sm:text-2xl tracking-tight text-white flex items-center justify-center gap-2">
            UNSEAL YOUR 3 FEATURED BOUNTY PACKETS ⚡
          </DialogTitle>

          <DialogDescription className="text-[11px] sm:text-xs text-slate-300 max-w-md mx-auto font-medium">
            Tap each foil pack or click "UNSEAL ALL PACKS" to reveal today's critical War Room
            mission briefs!
          </DialogDescription>
        </DialogHeader>

        {/* 16:9 RESPONSIVE DAILY CLAIM VIDEO SLOT MODULE */}
        <div className="relative z-10 w-full aspect-video rounded-2xl border-2 border-amber-500/40 bg-zinc-950/90 overflow-hidden flex flex-col items-center justify-center my-3 group shadow-[0_0_20px_rgba(0,0,0,0.8)]">
          {/* Tactical Overlay Grid & Radar Ambience */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-black/90 pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.4)_51%)] bg-[length:100%_4px] pointer-events-none opacity-30" />

          {/* Top Tactical Overlay HUD Bar */}
          <div className="absolute top-2.5 left-3.5 font-mono text-[9px] font-black text-amber-400/90 uppercase tracking-widest flex items-center gap-1.5 z-10">
            <Film className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>DAILY BRIEFING VIDEO STREAM</span>
          </div>
          <div className="absolute top-2.5 right-3.5 font-mono text-[9px] font-bold text-emerald-400/90 z-10 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>SIGNAL ACTIVE</span>
          </div>

          {/* Center Play Icon & Overlay Text */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-2 text-center p-4">
            <div className="h-12 w-12 rounded-full bg-amber-500/20 border-2 border-amber-400/70 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] group-hover:scale-110 group-hover:bg-amber-500/30 transition-all cursor-pointer">
              <Play className="h-6 w-6 fill-amber-400 text-amber-400 ml-0.5" />
            </div>
            <span className="font-mono text-xs sm:text-sm font-black text-amber-300 tracking-wider uppercase bg-amber-950/80 px-3.5 py-1 rounded-lg border border-amber-500/50 shadow-md">
              TACTICAL DIRECTIVE BRIEFING
            </span>
            <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>STREAM CHANNEL: DIRECT_FEED_HQ</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">1080P 60FPS</span>
            </span>
          </div>

          {/* HUD Corner Accents */}
          <div className="absolute bottom-2.5 left-3.5 font-mono text-[8px] text-zinc-500 font-bold z-10">
            SYS_REF: 0x99A4
          </div>
          <div className="absolute bottom-2.5 right-3.5 font-mono text-[8px] text-red-400 font-bold z-10 flex items-center gap-1">
            <span>REC</span>
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>00:00:00</span>
          </div>
        </div>

        {/* 3-PACKET HORIZONTAL SIDE-BY-SIDE GRID WITH SCREEN SHAKE */}
        <motion.div
          animate={isShaking ? { x: [-6, 6, -4, 4, -2, 2, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-3 gap-2 my-2 w-full max-w-md mx-auto relative z-10"
        >
          {displayMissions.map((item, index) => {
            const key = item.id || `feat-${index}`;
            const isFlipped = !!revealed[key];
            const packRarity = (item.rarity || "EPIC").toUpperCase();
            const xpVal = item.xpReward || item.baseRewardXP || 500;

            return (
              <div key={key} className="perspective-1000 min-h-[195px] sm:min-h-[235px]">
                <motion.div
                  initial={false}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.65, ease: "easeInOut" }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="relative w-full h-full min-h-[195px] sm:min-h-[235px] rounded-xl sm:rounded-2xl cursor-pointer select-none"
                  onClick={() => handleRevealPacket(key)}
                >
                  {/* FRONT SIDE: GOLD SEALED DOSSIER PACKET */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl border-2 border-[#6d4f2b] bg-gradient-to-br from-[#cbb288] via-[#bd9f71] to-[#aa8b5c] p-2.5 sm:p-3 flex flex-col justify-between items-center text-center shadow-xl group hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all overflow-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    {/* Metallic Holographic Foil Sheen Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-400/15 to-transparent pointer-events-none group-hover:via-amber-400/25" />

                    {/* TOP CLASSIFIED HEADER STRIP */}
                    <div className="w-full flex items-center justify-between border-b border-[#6d4f2b]/40 pb-1 text-[8px] sm:text-[9px] font-mono font-black text-[#3a2815] uppercase tracking-widest z-10">
                      <span className="flex items-center gap-1">
                        <Lock className="h-2.5 w-2.5 text-[#543b1e]" />
                        <span>DOSSIER #{String(index + 1).padStart(2, "0")} SEALED</span>
                      </span>
                      <span className="text-[7px] bg-[#3a2815]/15 text-[#3a2815] font-black px-1.5 py-0.2 rounded border border-[#6d4f2b]/30">
                        {packRarity}
                      </span>
                    </div>

                    {/* CENTER GOLD FOIL EMBLEM SEAL */}
                    <div className="my-auto py-1 flex flex-col items-center justify-center gap-1.5 z-10">
                      <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border-2 border-[#543b1e] shadow-md flex items-center justify-center text-amber-950 font-black group-hover:scale-110 transition-transform">
                        <Package className="h-6 w-6 text-amber-950 fill-amber-950/20" />
                      </div>
                      <span className="text-[8px] sm:text-[9px] font-mono font-black text-[#3b2716] uppercase tracking-widest">
                        HIGH COMMAND // SEALED
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-mono font-extrabold text-amber-950 bg-amber-400 px-2 py-0.5 rounded-full border border-[#543b1e]/40 shadow-xs animate-pulse">
                        TAP TO REVEAL ⚡
                      </span>
                    </div>

                    {/* BOTTOM BARCODE & TAG */}
                    <div className="w-full pt-1 border-t border-[#6d4f2b]/30 flex items-center justify-between text-[7.5px] font-mono font-bold text-[#4a3421] uppercase z-10">
                      <span>TOP SECRET</span>
                      <span className="font-mono tracking-tighter text-[#2a1a0c]">║▌║█║▌│║▌█</span>
                    </div>
                  </div>

                  {/* BACK SIDE: REVEALED CLASSIFIED MANILA MISSION DOSSIER */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl border-2 border-[#8c6b41] bg-gradient-to-b from-[#f2e2c4] via-[#e5cf9f] to-[#d8be8a] text-[#2c1d11] p-2 sm:p-3 flex flex-col justify-between shadow-[0_0_25px_rgba(140,107,65,0.4)] font-mono select-none overflow-hidden"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {/* RED SEAL STRIP AT TOP */}
                    <div className="-mx-2 -mt-2 -mb-1 bg-gradient-to-r from-red-800 via-red-600 to-red-800 text-amber-100 text-[7px] sm:text-[8px] font-extrabold px-1.5 py-0.5 flex items-center justify-between border-b border-red-950">
                      <span>CONFIDENTIAL DOSSIER</span>
                      <span className="text-amber-300 font-black">████████</span>
                    </div>

                    <div className="flex items-center justify-between gap-1 text-[8px] sm:text-[10px] font-black pt-1">
                      <span className="text-[#3b2716] font-black flex items-center gap-1 bg-[#3b2716]/10 px-1 py-0.5 rounded border border-[#8c6b41]/40">
                        BOUNTY 0{index + 1}
                      </span>
                      <span className="text-red-700 border border-red-700/80 px-1 py-0.2 rotate-[-5deg] bg-red-950/10 font-bold uppercase">
                        TOP SECRET
                      </span>
                    </div>

                    <div className="my-auto space-y-1">
                      <h4 className="font-mono font-black text-xs text-[#1a0e06] line-clamp-2 leading-tight uppercase">
                        {item.title}
                      </h4>
                      <p className="text-[9px] text-[#4a3421] leading-tight line-clamp-2 font-semibold">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[8px] sm:text-[9px] font-black border-t border-[#8c6b41]/40 text-[#3b2716]">
                      <span className="truncate bg-[#3b2716] text-[#e8cc9d] px-1 py-0.5 rounded text-[7px] font-mono">
                        {item.discordChannel || "#cto-official-post"}
                      </span>
                      <span className="text-emerald-800 font-extrabold shrink-0 bg-emerald-500/20 px-1 py-0.5 rounded border border-emerald-700/40">
                        +{xpVal} XP • Vault Progress
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* MODAL FOOTER ACTION */}
        <div className="pt-2 flex flex-col items-center gap-2 relative z-10">
          {isAllRevealed ? (
            <Button
              type="button"
              onClick={handleComplete}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-mono text-xs sm:text-sm font-black px-8 py-3 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.6)] cursor-pointer flex items-center justify-center gap-2 border border-emerald-200/80 transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="h-4 w-4 fill-slate-950" />
              <span>ACCEPT ALL MISSIONS ➔</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleUnsealAll}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-mono text-xs sm:text-sm font-black px-8 py-3 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.6)] cursor-pointer flex items-center justify-center gap-2 border border-amber-200/80 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="h-4 w-4 fill-slate-950" />
              <span>FLIP ALL PACKS ⚡</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

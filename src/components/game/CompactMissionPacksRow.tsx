import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { AutomatedMissionItem } from "@/services/automatedMissionsApi";
import { TacticalMissionBriefModal } from "@/components/game/TacticalMissionBriefModal";
import { useDailyMissionsStore } from "@/store/dailyMissionsStore";
import { audio } from "@/services/audio";
import { Shield, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompactMissionPacksRowProps {
  featuredMissions: AutomatedMissionItem[];
  isRerollingFeatured?: boolean;
}

export function CompactMissionPacksRow({
  featuredMissions,
  isRerollingFeatured = false,
}: CompactMissionPacksRowProps) {
  const { isDailyUnsealed, unsealDailyPacks } = useDailyMissionsStore();
  const [selectedMission, setSelectedMission] = useState<AutomatedMissionItem | null>(null);
  const [selectedMissionIndex, setSelectedMissionIndex] = useState<number>(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [unsealingCardIdx, setUnsealingCardIdx] = useState<number | null>(null);

  // Track face-down vs face-up (flipped) state per card index
  const [flippedMap, setFlippedMap] = useState<Record<number, boolean>>(() => ({
    0: isDailyUnsealed,
    1: isDailyUnsealed,
    2: isDailyUnsealed,
  }));

  const prevRerollingRef = useRef(isRerollingFeatured);

  // Sync with re-roll or unsealed store state
  useEffect(() => {
    if (isRerollingFeatured) {
      setFlippedMap({ 0: false, 1: false, 2: false });
    } else if (prevRerollingRef.current && !isRerollingFeatured) {
      // Just finished re-rolling! Keep face down briefly, then flip face-up sequentially
      setFlippedMap({ 0: false, 1: false, 2: false });

      const t0 = setTimeout(() => {
        try {
          audio.play("button.click");
        } catch (e) {
          void e;
        }
        setFlippedMap((prev) => ({ ...prev, 0: true }));
      }, 120);

      const t1 = setTimeout(() => {
        try {
          audio.play("button.click");
        } catch (e) {
          void e;
        }
        setFlippedMap((prev) => ({ ...prev, 1: true }));
      }, 280);

      const t2 = setTimeout(() => {
        try {
          audio.play("button.click");
        } catch (e) {
          void e;
        }
        setFlippedMap((prev) => ({ ...prev, 2: true }));
      }, 440);

      return () => {
        clearTimeout(t0);
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else if (isDailyUnsealed) {
      setFlippedMap({ 0: true, 1: true, 2: true });
    } else {
      setFlippedMap({ 0: false, 1: false, 2: false });
    }
    prevRerollingRef.current = isRerollingFeatured;
  }, [isRerollingFeatured, isDailyUnsealed]);

  const handleFlipCard = (index: number) => {
    if (flippedMap[index]) return;
    audio.play("button.click");
    unsealDailyPacks();
    setFlippedMap((prev) => ({ ...prev, [index]: true }));
  };

  const handleFlipAll = () => {
    audio.play("button.click");
    unsealDailyPacks();
    setFlippedMap({ 0: true, 1: true, 2: true });
  };

  const handleOpenLearnMore = (item: AutomatedMissionItem, index: number) => {
    audio.play("button.click");
    setUnsealingCardIdx(index);

    // Trigger tape peel animation on folder card, then launch modal
    setTimeout(() => {
      setSelectedMission(item);
      setSelectedMissionIndex(index + 1);
      setModalOpen(true);
      setUnsealingCardIdx(null);
    }, 200);
  };

  const packs = featuredMissions.slice(0, 3);
  if (packs.length === 0) return null;

  const hasFaceDownCards = Object.values(flippedMap).some((isFlipped) => !isFlipped);

  return (
    <>
      {/* FLIP ALL PACKS BAR IF ANY CARDS ARE FACE DOWN */}
      <AnimatePresence>
        {hasFaceDownCards && !isRerollingFeatured && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-2 flex items-center justify-between bg-amber-500/10 border border-amber-400/40 px-3 py-1.5 rounded-xl text-amber-300 font-mono text-xs font-black shadow-xs"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>NEW BOUNTY PACKS SEALED FACE-DOWN</span>
            </span>
            <Button
              type="button"
              onClick={handleFlipAll}
              size="sm"
              className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-mono text-[10px] sm:text-xs font-black px-3 py-1 rounded-lg shadow-md cursor-pointer h-7"
            >
              <span>FLIP ALL PACKS ⚡</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 w-full max-w-full box-border my-1.5 perspective-1000">
        {packs.map((item, index) => {
          const isCompleted = item.isCompleted || item.completed;
          const currentVal = isCompleted ? 1 : (item.progress ?? 0);
          const targetVal = item.requiredCount ?? 1;
          const pct = Math.min(100, Math.round((currentVal / targetVal) * 100));
          const xpVal = item.xpReward || item.baseRewardXP || 500;
          const isFlipped = flippedMap[index] ?? true;

          // Stack and Deal physical shuffle configuration for 3 cards
          const stackAndDealConfigs = [
            {
              x: ["0%", "105%", "105%", "0%"],
              y: [0, -4, -4, 0],
              rotate: [0, -6, -6, 0],
              scale: [1, 0.95, 0.95, 1],
              zIndex: [10, 30, 30, 10],
            },
            {
              x: ["0%", "0%", "0%", "0%"],
              y: [0, 0, 0, 0],
              rotate: [0, 2, 2, 0],
              scale: [1, 0.98, 0.98, 1],
              zIndex: [10, 20, 20, 10],
            },
            {
              x: ["0%", "-105%", "-105%", "0%"],
              y: [0, 4, 4, 0],
              rotate: [0, 7, 7, 0],
              scale: [1, 0.95, 0.95, 1],
              zIndex: [10, 25, 25, 10],
            },
          ];

          const isUnsealingThisCard = unsealingCardIdx === index;

          return (
            <div
              key={item.id || `pack-card-${index}`}
              className="perspective-1000 min-h-[175px] w-full max-w-full box-border"
            >
              <motion.div
                animate={
                  isRerollingFeatured
                    ? {
                        ...stackAndDealConfigs[index % 3],
                        rotateY: [0, 90, 180, 180, 180, 180],
                      }
                    : {
                        x: "0%",
                        y: 0,
                        rotate: 0,
                        rotateY: isFlipped ? 0 : 180,
                        scale: 1,
                        zIndex: 10,
                      }
                }
                transition={
                  isRerollingFeatured
                    ? {
                        duration: 0.65,
                        ease: "easeInOut",
                        times: [0, 0.35, 0.5, 0.65, 0.85, 1],
                      }
                    : { duration: 0.5, ease: "easeInOut" }
                }
                whileHover={isRerollingFeatured ? {} : { scale: 1.02 }}
                onClick={() => {
                  if (isRerollingFeatured) return;
                  if (!isFlipped) {
                    handleFlipCard(index);
                  } else {
                    handleOpenLearnMore(item, index);
                  }
                }}
                className={`relative w-full h-full min-h-[175px] rounded-xl font-mono select-none cursor-pointer group shadow-md ${
                  isCompleted ? "opacity-85" : ""
                }`}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* FRONT FACE: REVEALED DOSSIER */}
                <div
                  className="absolute inset-0 w-full h-full flex flex-col justify-between py-2 px-1.5 sm:p-2.5 rounded-xl bg-gradient-to-b from-[#f2e2c4] via-[#e5cf9f] to-[#d8be8a] border-2 border-[#8c6b41] text-[#2c1d11] shadow-md hover:border-[#6b502e] hover:shadow-[0_0_20px_rgba(140,107,65,0.4)] overflow-hidden box-border"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  {/* "MISSION SUCCESSFUL / DEFEATED" COMPLETED STAMP OVERLAY */}
                  {isCompleted && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 overflow-hidden pt-6 px-1.5">
                      <div className="rotate-[-6deg] bg-emerald-950/95 border-2 border-emerald-500 text-emerald-400 font-mono font-black text-[9px] sm:text-[10px] px-2 py-0.5 shadow-lg shadow-emerald-950/60 backdrop-blur-xs flex items-center justify-center gap-1 border-dashed uppercase tracking-wider">
                        <span>✓ DEFEATED & CLAIMED</span>
                      </div>
                    </div>
                  )}

                  {/* TOP TAMPER-EVIDENT RED SEAL BAR */}
                  <div className="relative -mx-1.5 -mt-2 sm:-mx-2.5 sm:-mt-2.5 mb-1.5 overflow-hidden h-4.5 bg-gradient-to-r from-red-800 via-red-600 to-red-800 text-amber-100 font-mono font-extrabold text-[7.5px] sm:text-[8px] tracking-widest uppercase flex items-center justify-between px-1.5 border-b border-red-950 shadow-xs">
                    <AnimatePresence>
                      {!isUnsealingThisCard ? (
                        <div className="w-full flex items-center justify-between">
                          <span className="flex items-center gap-1 text-amber-100 font-extrabold">
                            <Shield className="h-2.5 w-2.5 text-amber-300" />
                            <span>CONFIDENTIAL</span>
                          </span>
                          <span className="text-[7px] text-amber-300 font-black">██████</span>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ scaleX: 1, opacity: 0 }}
                          animate={{ scaleX: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-full text-center text-amber-300 font-black text-[8px]"
                        >
                          OPENING...
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* CARD HEADER LAYOUT: BOUNTY 01 & TOP SECRET STAMP */}
                  <div className="flex items-center justify-between w-full px-0.5 mb-0.5 shrink-0">
                    <span className="font-mono text-[8.5px] sm:text-[9px] font-black text-[#3b2716] uppercase tracking-wider bg-[#3b2716]/10 px-1 py-0.2 rounded border border-[#8c6b41]/40">
                      BOUNTY 0{index + 1}
                    </span>
                    <span className="bg-red-700 text-white font-black text-[6.5px] sm:text-[7.5px] px-1 py-0.2 rounded uppercase tracking-tighter shrink-0 rotate-[-3deg] shadow-xs">
                      TOP SECRET
                    </span>
                  </div>

                  {/* TITLE WITH CLAMP */}
                  <h4 className="text-[10px] sm:text-[11px] font-mono font-black text-[#1a0e06] leading-tight line-clamp-2 my-0.5 min-h-[24px]">
                    {item.title}
                  </h4>

                  {/* XP REWARD BADGE */}
                  <div className="flex items-center justify-between my-0.5">
                    <span className="text-[7.5px] sm:text-[8px] font-mono font-extrabold text-[#4a3421] uppercase">
                      REWARD
                    </span>
                    <span className="inline-flex items-center gap-1 bg-[#3b2716] text-[#e8cc9d] font-mono text-[8px] sm:text-[8.5px] font-black px-1.5 py-0.2 rounded-full border border-[#8c6b41]/50 shadow-xs">
                      +{xpVal} XP
                    </span>
                  </div>

                  {/* DYNAMIC MULTI-COLOR GRADIENT PROGRESS BAR */}
                  <div className="w-full bg-[#3b2716]/20 h-1.5 rounded-full overflow-hidden my-0.5 border border-[#8c6b41]/40">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted
                          ? "bg-emerald-600 shadow-[0_0_10px_rgba(5,150,105,0.8)]"
                          : "bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* STANDARDIZED VERIFICATION STATUS TEXT */}
                  <div className="flex justify-between items-center text-[8px] font-mono font-bold mb-1">
                    <span className="text-[#4a3421] uppercase">STATUS</span>
                    <span
                      className={
                        isCompleted ? "text-emerald-800 font-black" : "text-[#2c1d11] font-bold"
                      }
                    >
                      {isCompleted ? `VERIFIED (+${xpVal})` : `(${currentVal}/${targetVal})`}
                    </span>
                  </div>

                  {/* ACTION BUTTON */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenLearnMore(item, index);
                    }}
                    className="w-full py-1 text-[8.5px] sm:text-[9px] font-mono font-extrabold text-[#e8cc9d] bg-[#2b1b0e] hover:bg-[#1a1008] border border-[#8c6b41] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                  >
                    <span>DETAILS 📂</span>
                  </button>
                </div>

                {/* BACK FACE: SEALED FACE-DOWN DOSSIER PACK */}
                <div
                  className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-br from-[#cbb288] via-[#bd9f71] to-[#aa8b5c] border-2 border-[#6d4f2b] py-2 px-1.5 sm:p-2.5 flex flex-col justify-between items-center text-center font-mono shadow-xl relative overflow-hidden group-hover:border-amber-400 transition-colors box-border"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  {/* TOP CLASSIFIED HEADER STRIP */}
                  <div className="w-full flex items-center justify-between border-b border-[#6d4f2b]/40 pb-0.5 text-[7.5px] sm:text-[8px] font-mono font-black text-[#3a2815] uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <Shield className="h-2.5 w-2.5 text-[#543b1e]" />
                      <span>DOSSIER #{String(index + 1).padStart(2, "0")}</span>
                    </span>
                    <span className="text-[6.5px] bg-[#3a2815]/15 text-[#3a2815] font-black px-1 py-0.2 rounded border border-[#6d4f2b]/30">
                      SEALED
                    </span>
                  </div>

                  {/* CENTER GOLD FOIL EMBLEM SEAL */}
                  <div className="my-auto py-0.5 flex flex-col items-center justify-center gap-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border-2 border-[#543b1e] shadow-md flex items-center justify-center text-amber-950 font-black group-hover:scale-110 transition-transform">
                      <Shield className="h-5 w-5 text-amber-950 fill-amber-950/30" />
                    </div>
                    <span className="text-[7.5px] sm:text-[8px] font-mono font-black text-[#3b2716] uppercase tracking-widest">
                      SEALED PACKET
                    </span>
                    <span className="text-[8px] sm:text-[8.5px] font-mono font-extrabold text-amber-950 bg-amber-400/90 px-1.5 py-0.2 rounded-full border border-[#543b1e]/40 shadow-xs animate-pulse">
                      TAP TO REVEAL ⚡
                    </span>
                  </div>

                  {/* BOTTOM BARCODE STAMP */}
                  <div className="w-full pt-0.5 border-t border-[#6d4f2b]/30 flex items-center justify-between text-[7px] font-mono font-bold text-[#4a3421] uppercase">
                    <span>TOP SECRET</span>
                    <span className="font-mono tracking-tighter text-[#2a1a0c]">║▌│║▌█</span>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* DETAIL MODAL */}
      <TacticalMissionBriefModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mission={selectedMission}
        missionNumber={selectedMissionIndex}
      />
    </>
  );
}

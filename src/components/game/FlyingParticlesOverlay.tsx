import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Package, Sparkles } from "lucide-react";
import { audio } from "@/services/audio";

export interface FlyingParticleTrigger {
  id: string;
  startX: number;
  startY: number;
  xpAmount: number;
  packName?: string;
}

interface ParticleItem {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  xpAmount: number;
  packName?: string;
}

let emitParticleFn: ((trigger: FlyingParticleTrigger) => void) | null = null;

export function emitFlyingRewardParticles(trigger: FlyingParticleTrigger) {
  if (emitParticleFn) {
    emitParticleFn(trigger);
  }
}

export function FlyingParticlesOverlay() {
  const [particles, setParticles] = useState<ParticleItem[]>([]);

  const handleEmit = useCallback((trigger: FlyingParticleTrigger) => {
    // Header XP badge or top-right target position
    const targetEl =
      document.getElementById("header-user-xp-counter") ||
      document.getElementById("user-rank-status-widget") ||
      document.querySelector("header");

    let endX = window.innerWidth - 120;
    let endY = 30;

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      endX = rect.left + rect.width / 2;
      endY = rect.top + rect.height / 2;
    }

    const newItem: ParticleItem = {
      id: `${trigger.id}-${Date.now()}-${Math.random()}`,
      startX: trigger.startX || window.innerWidth / 2,
      startY: trigger.startY || window.innerHeight / 2,
      endX,
      endY,
      xpAmount: trigger.xpAmount,
      packName: trigger.packName,
    };

    setParticles((prev) => [...prev, newItem]);

    // Audio cues
    audio.play("xp.fly");
    setTimeout(() => {
      audio.play("coin.pickup");
    }, 450);

    // Auto cleanup
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newItem.id));
    }, 1200);
  }, []);

  useEffect(() => {
    emitParticleFn = handleEmit;
    return () => {
      emitParticleFn = null;
    };
  }, [handleEmit]);

  return (
    <div
      id="flying-particles-layer"
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
    >
      <AnimatePresence>
        {particles.map((p) => {
          // Mid arc control point
          const midX = (p.startX + p.endX) / 2 + (Math.random() * 80 - 40);
          const midY = Math.min(p.startY, p.endY) - 120;

          return (
            <React.Fragment key={p.id}>
              {/* PRIMARY FLYING XP ORB / BADGE */}
              <motion.div
                initial={{
                  x: p.startX,
                  y: p.startY,
                  scale: 0.6,
                  opacity: 0,
                }}
                animate={{
                  x: [p.startX, midX, p.endX],
                  y: [p.startY, midY, p.endY],
                  scale: [0.6, 1.4, 0.4],
                  opacity: [0, 1, 0.9, 0],
                }}
                transition={{
                  duration: 0.85,
                  ease: "easeInOut",
                  times: [0, 0.4, 1],
                }}
                className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 px-3 py-1 rounded-full font-mono text-xs font-black shadow-[0_0_25px_rgba(245,158,11,1)] border-2 border-amber-200"
              >
                <Zap className="h-3.5 w-3.5 fill-slate-950 text-slate-950 animate-bounce" />
                <span>+{p.xpAmount.toLocaleString()} XP</span>
              </motion.div>

              {/* SECONDARY PACK ICON IF GRANTED */}
              {p.packName && (
                <motion.div
                  initial={{
                    x: p.startX - 30,
                    y: p.startY - 20,
                    scale: 0.5,
                    opacity: 0,
                    rotate: -15,
                  }}
                  animate={{
                    x: [p.startX - 30, midX - 40, p.endX - 30],
                    y: [p.startY - 20, midY - 30, p.endY],
                    scale: [0.5, 1.3, 0.3],
                    opacity: [0, 1, 1, 0],
                    rotate: [-15, 25, 0],
                  }}
                  transition={{
                    duration: 0.95,
                    ease: "easeInOut",
                    delay: 0.08,
                  }}
                  className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 bg-purple-950 border border-purple-400 text-purple-200 px-2.5 py-0.5 rounded-xl font-mono text-[10px] font-black shadow-[0_0_20px_rgba(168,85,247,0.8)]"
                >
                  <Package className="h-3 w-3 text-purple-300 fill-purple-400/40" />
                  <span>{p.packName}</span>
                </motion.div>
              )}

              {/* TRAILING SPARKS */}
              {[...Array(5)].map((_, i) => {
                const sparkOffsetX = (Math.random() - 0.5) * 60;
                const sparkOffsetY = (Math.random() - 0.5) * 60;
                return (
                  <motion.div
                    key={`spark-${p.id}-${i}`}
                    initial={{
                      x: p.startX,
                      y: p.startY,
                      scale: 0.8,
                      opacity: 1,
                    }}
                    animate={{
                      x: [p.startX, midX + sparkOffsetX, p.endX],
                      y: [p.startY, midY + sparkOffsetY, p.endY],
                      scale: [0.8, 1.2, 0],
                      opacity: [1, 0.8, 0],
                    }}
                    transition={{
                      duration: 0.75 + i * 0.08,
                      ease: "easeOut",
                      delay: i * 0.04,
                    }}
                    className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(245,158,11,1)]"
                  />
                );
              })}
            </React.Fragment>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

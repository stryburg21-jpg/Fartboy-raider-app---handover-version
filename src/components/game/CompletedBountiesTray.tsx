import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ChevronDown, ChevronUp, Trophy, Sparkles } from "lucide-react";
import { AutomatedMissionCard } from "./AutomatedMissionCard";
import type { AutomatedMissionItem } from "@/services/automatedMissionsApi";

interface CompletedBountiesTrayProps {
  completedMissions: AutomatedMissionItem[];
  onRefresh?: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function CompletedBountiesTray({
  completedMissions,
  onRefresh,
  isOpen: externalIsOpen,
  onToggle: externalOnToggle,
}: CompletedBountiesTrayProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleToggle = () => {
    if (externalOnToggle) {
      externalOnToggle();
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  };

  if (!completedMissions || completedMissions.length === 0) return null;

  return (
    <div className="mt-6 space-y-3 pt-4 border-t border-slate-800/80">
      {/* COLLAPSIBLE TRAY HEADER TOGGLE */}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-950 via-[#111723] to-slate-950 p-3.5 px-5 shadow-lg hover:border-amber-400/60 transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40">
            <CheckCircle2 className="h-4 w-4" />
          </div>

          <div className="text-left font-mono">
            <div className="font-black text-sm text-amber-300 flex items-center gap-2">
              <span>COMPLETED MISSIONS</span>
              <span className="rounded-full bg-amber-400 text-slate-950 px-2 py-0.2 text-xs font-bold">
                {completedMissions.length}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Completed & Claimed Rewards
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold group-hover:text-amber-300">
          <span>{isOpen ? "HIDE COMPLETED" : "VIEW TRAY"}</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 transition-transform duration-200" />
          ) : (
            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
          )}
        </div>
      </button>

      {/* EXPANDABLE COMPLETED CARDS CONTAINER */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 pt-2 overflow-hidden"
          >
            {completedMissions.map((item) => (
              <AutomatedMissionCard key={item.id} item={item} onRefresh={onRefresh} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

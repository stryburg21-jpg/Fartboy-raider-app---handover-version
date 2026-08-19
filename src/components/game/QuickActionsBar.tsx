import { Link } from "@tanstack/react-router";
import { Package, Zap, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsBarProps {
  unopenedPacksCount?: number;
  dailyQuestsCompleted?: number;
  dailyQuestsTotal?: number;
}

export function QuickActionsBar({ unopenedPacksCount = 0 }: QuickActionsBarProps) {
  const hasUnopenedPacks = unopenedPacksCount > 0;

  return (
    <div className="space-y-3 font-mono">
      {/* COMMAND DECK WITH DYNAMIC QUICK LINKS */}
      <div className="rounded-2xl border-2 border-slate-800 bg-slate-950/90 p-3.5 shadow-xl space-y-2.5 backdrop-blur-md">
        <div className="flex items-center justify-between text-[10px] font-mono font-black uppercase tracking-widest border-b border-slate-800/80 pb-1.5 text-slate-400">
          <span className="flex items-center gap-1.5 text-amber-300 font-extrabold">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>HQ COMMAND DECK</span>
          </span>
          <span className="text-slate-500">QUICK LINKS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* DYNAMIC BUTTON 1: OPEN VAULT */}
          <Link to="/packs" className="w-full">
            <Button
              variant="outline"
              className={`w-full justify-between gap-2 font-mono text-xs font-black uppercase tracking-wider h-11 px-3.5 rounded-xl transition-all cursor-pointer ${
                hasUnopenedPacks
                  ? "border-amber-500/60 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                  : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <Package
                  className={`h-4 w-4 ${hasUnopenedPacks ? "text-amber-400 fill-amber-400/30" : "text-slate-400"}`}
                />
                <span>Open Vault</span>
              </div>
              {hasUnopenedPacks ? (
                <span className="rounded-full bg-red-600 text-white text-[10px] font-black px-2 py-0.5 shadow-[0_0_8px_rgba(220,38,38,0.8)] animate-pulse">
                  {unopenedPacksCount} PACKS
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-mono font-bold">CLEARED</span>
              )}
            </Button>
          </Link>

          {/* DYNAMIC BUTTON 2: VIEW ALL QUESTS */}
          <Link to="/missions" className="w-full">
            <Button
              variant="outline"
              className="w-full justify-between gap-2 font-mono text-xs font-black uppercase tracking-wider h-11 px-3.5 rounded-xl border-cyan-500/40 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-950/60 hover:border-cyan-400 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyan-400 fill-cyan-400/30 animate-pulse" />
                <span>View All Quests</span>
              </div>
              <ArrowRight className="h-4 w-4 text-cyan-400" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

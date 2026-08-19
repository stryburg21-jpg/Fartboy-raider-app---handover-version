import { useEffect, useState } from "react";
import { getXPTransactionHistory, type XPTransactionRecord } from "@/services/xpEngine";
import { History, Award, ArrowUpRight, Sparkles, Zap } from "lucide-react";

export function XPTransactionHistoryList({ limit = 10 }: { limit?: number }) {
  const [history, setHistory] = useState<XPTransactionRecord[]>([]);

  useEffect(() => {
    setHistory(getXPTransactionHistory().slice(0, limit));
  }, [limit]);

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface-1/50 p-6 text-center">
        <History className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
        <p className="font-display text-sm font-bold text-foreground">No XP Transactions Yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Perform social raids, post memes, or win Discord matches to earn XP!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
          <History className="h-4 w-4 text-primary" /> XP Activity Log ({history.length})
        </h3>
        <span className="font-mono text-[10px] text-muted-foreground">
          1:1 Dual-Currency Allocation
        </span>
      </div>

      <div className="space-y-2">
        {history.map((tx) => {
          const formattedTime = new Date(tx.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          return (
            <div
              key={tx.id}
              className="rounded-xl border border-border/70 bg-card p-3 shadow-sm hover:border-border transition-colors flex flex-wrap items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-xs font-extrabold text-foreground">
                    {tx.activityName}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {formattedTime}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                  <span>Base: {tx.baseXP} XP</span>
                  {tx.qualityMultiplier > 1 && (
                    <span className="rounded bg-purple-500/20 text-purple-300 px-1.5 py-0.5 font-bold">
                      Qual: {tx.qualityMultiplier}x
                    </span>
                  )}
                  {tx.viralBonusXP > 0 && (
                    <span className="rounded bg-sky-500/20 text-sky-300 px-1.5 py-0.5 font-bold">
                      Viral: +{tx.viralBonusXP.toLocaleString()} XP
                    </span>
                  )}
                  {tx.setBonusPct > 0 && (
                    <span className="rounded bg-amber-500/20 text-amber-300 px-1.5 py-0.5 font-bold">
                      Set: +{(tx.setBonusPct * 100).toFixed(0)}%
                    </span>
                  )}
                  {tx.decayMultiplier < 1 && (
                    <span className="rounded bg-orange-500/20 text-orange-300 px-1.5 py-0.5 font-bold">
                      Decay: {(tx.decayMultiplier * 100).toFixed(0)}%
                    </span>
                  )}
                  {tx.note && <span className="text-foreground/80 font-sans">({tx.note})</span>}
                </div>
              </div>

              <div className="text-right flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="font-mono text-xs font-black text-emerald-400 flex items-center gap-1">
                    <ArrowUpRight className="h-3.5 w-3.5" /> +{tx.netXPAwarded.toLocaleString()}{" "}
                    LT-XP
                  </span>
                  <span className="font-mono text-xs font-black text-amber-400 flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5" /> +{tx.netXPAwarded.toLocaleString()} SP-XP
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

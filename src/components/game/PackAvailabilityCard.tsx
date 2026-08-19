import { Link } from "@tanstack/react-router";
import { Gift, Sparkles, ArrowRight, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";

interface PackAvailabilityCardProps {
  className?: string;
  variant?: "default" | "compact";
}

export function PackAvailabilityCard({
  className = "",
  variant = "default",
}: PackAvailabilityCardProps) {
  const packs = useGameStore((s) => s.packs);
  const count = packs.length;

  if (variant === "compact") {
    return (
      <div
        className={`rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-surface-1 to-card p-3.5 shadow-md flex items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 font-black text-sm">
            <Gift className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-display font-extrabold text-xs text-foreground truncate">
                Unopened Vault Packs Available!
              </h4>
              <span className="rounded-full bg-amber-400 text-black px-2 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider shrink-0 shadow">
                {count > 0 ? `${count} Packs Waiting ✨` : "Vault Empty"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              {count > 0
                ? "Reveal specialist gear and rarity drops in your Pack Vault."
                : "Acquire new packs in the Raider Shop with spendable XP."}
            </p>
          </div>
        </div>

        <Link to={count > 0 ? "/packs" : "/shop"} className="shrink-0">
          <Button
            size="sm"
            className="h-8 bg-amber-400 text-black hover:bg-amber-300 font-mono text-[11px] font-black uppercase tracking-wider shadow"
          >
            {count > 0 ? (
              <>
                Open Vault <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Get Packs <Sparkles className="ml-1 h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 border-amber-400/80 bg-gradient-to-r from-amber-950/40 via-surface-1 to-surface-2 p-4 sm:p-5 shadow-xl ${
        count > 0 ? "shadow-[0_0_25px_-5px_rgba(245,158,11,0.25)]" : ""
      } ${className}`}
    >
      {/* GLOW EFFECT */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-400/15 blur-3xl" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
            <Gift className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-amber-400 text-black font-mono text-[10px] font-black shadow">
                {count}
              </span>
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 text-amber-300 px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase tracking-wider border border-amber-500/30">
                <Sparkles className="h-3 w-3 text-amber-400" />
                {count > 0 ? `${count} Packs Waiting ✨` : "Pack Vault Ready"}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground hidden md:inline">
                Collectible Loot Drop
              </span>
            </div>

            <h3 className="font-display text-base sm:text-lg font-extrabold text-foreground">
              Unopened Vault Packs Available!
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {count > 0
                ? `You have ${count} unopened pack(s) waiting in your Pack Vault. Reveal specialist gear, titles, and rarity drops!`
                : "No unopened packs remaining in your Vault. Earn bonus packs from daily missions or acquire them in the Shop!"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <Link to={count > 0 ? "/packs" : "/shop"}>
            <Button
              size="md"
              className="bg-amber-400 text-black hover:bg-amber-300 font-mono text-xs font-black uppercase tracking-wider shadow-lg px-4 py-2 h-10"
            >
              {count > 0 ? (
                <span className="flex items-center gap-1.5">
                  <PackageCheck className="h-4 w-4" /> Open Vault
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" /> Visit Shop
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { Target, Gift, Package, Hammer, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RaiderNextMissionCard() {
  const steps = [
    {
      id: "step_raid",
      title: "1. Complete First Raid",
      desc: "Raid target posts in Discord to earn Spendable XP",
      to: "/missions",
      actionText: "Go to Missions",
      icon: <Target className="h-4 w-4 text-primary" />,
      completed: true,
    },
    {
      id: "step_pack",
      title: "2. Open Pack in Vault",
      desc: "Acquire equipment drops to build your specialist set",
      to: "/packs",
      actionText: "Open Packs",
      icon: <Gift className="h-4 w-4 text-accent" />,
      completed: false,
    },
    {
      id: "step_equip",
      title: "3. Equip Set Piece",
      desc: "Fill your 7 equipment slots to activate set bonuses",
      to: "/packs",
      search: { tab: "owned" },
      actionText: "Manage in Vault",
      icon: <Package className="h-4 w-4 text-emerald-400" />,
      completed: false,
    },
    {
      id: "step_forge",
      title: "4. Forge Upgrade",
      desc: "Level up your gear or fuse duplicate items for higher stats",
      to: "/forge",
      actionText: "Visit Forge",
      icon: <Hammer className="h-4 w-4 text-amber-400" />,
      completed: false,
    },
  ];

  return (
    <section className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-surface-1 to-card p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/30">
              Raider Progression Guide
            </span>
            <h2 className="font-display text-lg font-bold text-foreground">
              Your Next Raider Missions
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Follow these core steps to upgrade your Raider identity and maximize Community XP
            earnings.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <div
            key={s.id}
            className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
              s.completed
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-border/80 bg-surface-2/80 hover:border-primary/50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-surface-3">
                  {s.icon}
                </div>
                {s.completed ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> DONE
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-muted-foreground">
                    NEXT
                  </span>
                )}
              </div>
              <h3 className="font-display text-sm font-bold mt-3 text-foreground">{s.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>

            <div className="mt-4 pt-2 border-t border-border/40">
              <Link to={s.to}>
                <Button
                  size="sm"
                  variant={s.completed ? "outline" : "default"}
                  className="w-full font-mono text-[11px] uppercase tracking-wider font-bold"
                >
                  {s.actionText} <ArrowRight className="ml-1.5 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

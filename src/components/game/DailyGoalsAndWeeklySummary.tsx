import { useState } from "react";
import { CheckCircle2, Circle, Flame, Calendar, Award, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CurrencyAmount } from "./CurrencyAmount";

export function DailyGoalsAndWeeklySummary() {
  const [dailyGoals, setDailyGoals] = useState([
    {
      id: "goal_raid",
      label: "Complete 1 Raid in Discord",
      xp: 250,
      completed: true,
      to: "/missions",
    },
    {
      id: "goal_meme",
      label: "Submit a Meme in #memes",
      xp: 150,
      completed: false,
      to: "/missions",
    },
    {
      id: "goal_pack",
      label: "Open 1 Pack in Vault",
      xp: 100,
      completed: false,
      to: "/packs",
    },
  ]);

  const toggleGoal = (id: string) => {
    setDailyGoals((prev) => prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)));
  };

  const completedCount = dailyGoals.filter((g) => g.completed).length;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Daily Raider Checklist */}
      <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div>
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
                <Flame className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Daily Raider Goals
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Complete daily community tasks to earn extra XP
                </p>
              </div>
            </div>
            <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary">
              {completedCount}/{dailyGoals.length} Done
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {dailyGoals.map((g) => (
              <div
                key={g.id}
                onClick={() => toggleGoal(g.id)}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                  g.completed
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-border/60 bg-surface-2/60 hover:border-border hover:bg-surface-2"
                }`}
              >
                <div className="flex items-center gap-3">
                  {g.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      g.completed ? "line-through text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {g.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CurrencyAmount priceXP={g.xp} size="sm" />
                  <Link
                    to={g.to}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded p-1 text-muted-foreground hover:text-primary transition"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {completedCount === dailyGoals.length ? (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-2.5 text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" /> Daily Streak Bonus Claimed (+500 XP)!
          </div>
        ) : (
          <div className="mt-4 text-center text-[11px] text-muted-foreground">
            Finish all 3 goals to claim your Daily Streak Bonus.
          </div>
        )}
      </div>

      {/* Weekly Raider Summary Card */}
      <div className="flex flex-col justify-between rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-surface-1 to-card p-5 shadow-sm">
        <div>
          <div className="flex items-center justify-between border-b border-accent/20 pb-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent/20 text-accent">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">Weekly Summary</h3>
                <p className="text-[11px] text-muted-foreground">
                  Your activity overview for this week
                </p>
              </div>
            </div>
            <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-[10px] font-bold text-accent border border-accent/30">
              Active Season
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-xl border border-border/60 bg-black/30 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                XP Earned
              </div>
              <div className="mt-1 font-display text-base font-bold text-primary">2,500 XP</div>
            </div>

            <div className="rounded-xl border border-border/60 bg-black/30 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Packs Opened
              </div>
              <div className="mt-1 font-display text-base font-bold text-accent">4 Packs</div>
            </div>

            <div className="rounded-xl border border-border/60 bg-black/30 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Set Progress
              </div>
              <div className="mt-1 font-display text-base font-bold text-emerald-400">
                Set +1 Piece
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border/50 bg-surface-2/60 p-3 text-xs text-muted-foreground flex items-center gap-2">
            <Award className="h-4 w-4 text-accent shrink-0" />
            <span>
              <strong>Weekly Highlight:</strong> You are in the top 15% of active community Raiders
              this week!
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between pt-2">
          <span className="text-[11px] font-semibold text-muted-foreground">
            Next Weekly Reset in 3 days
          </span>
          <Link
            to="/leaderboard"
            className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
          >
            View Leaderboard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

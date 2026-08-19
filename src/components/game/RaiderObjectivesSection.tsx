import { Link } from "@tanstack/react-router";
import {
  Target,
  Video,
  Image,
  MessageSquare,
  Swords,
  Trophy,
  Award,
  Sparkles,
  ArrowRight,
  Gift,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Player } from "@/types/game";

interface RaiderObjectivesSectionProps {
  player: Player;
}

// TODO backend / API config: Replace placeholder hrefs with live Discord/X webhooks or OAuth bot endpoints
const RAID_ACTIONS = [
  {
    id: "action_meme",
    title: "Create Meme",
    description: "Submit a viral meme on X / Discord for +250 XP & Meme Specialist drops",
    icon: Image,
    color: "text-amber-400 bg-amber-500/20 border-amber-500/30",
    reward: "+250 XP",
    placeholderUrl: "https://discord.gg/fartboyraid-memes",
  },
  {
    id: "action_video",
    title: "Create Video",
    description: "Post a short clip or stream highlight for +500 XP & Director drops",
    icon: Video,
    color: "text-purple-400 bg-purple-500/20 border-purple-500/30",
    reward: "+500 XP",
    placeholderUrl: "https://discord.gg/fartboyraid-clips",
  },
  {
    id: "action_post",
    title: "Make Posts / Raid",
    description: "Engage in social raid targets to earn raid streak multipliers",
    icon: MessageSquare,
    color: "text-sky-400 bg-sky-500/20 border-sky-500/30",
    reward: "+150 XP",
    placeholderUrl: "https://x.com/fartboyraid",
  },
  {
    id: "action_today_raid",
    title: "Join Today's Raid",
    description: "Participate in today's official community raid event",
    icon: Swords,
    color: "text-rose-400 bg-rose-500/20 border-rose-500/30",
    reward: "Bonus Pack Drop",
    placeholderUrl: "https://discord.gg/fartboyraid-live",
  },
];

export function RaiderObjectivesSection({ player }: RaiderObjectivesSectionProps) {
  const isContributor = player.contributorTier && player.contributorTier !== "free";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. RAIDER OBJECTIVES (2 COLS) */}
      <div className="lg:col-span-2 rounded-2xl border border-border bg-gradient-to-br from-surface-1 via-card to-surface-2 p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold shrink-0">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
                Raider Objectives & Community Actions
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Take direct game actions to earn XP, pack drops, and title progress
              </p>
            </div>
          </div>

          <Link to="/missions">
            <span className="font-mono text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer">
              All Missions <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        </div>

        {/* 4 RAID ACTION CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {RAID_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.id}
                href={action.placeholderUrl}
                target="_blank"
                rel="noreferrer"
                className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-surface-2/80 p-3.5 transition-all hover:border-amber-500/50 hover:bg-surface-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border font-bold ${action.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-display text-xs font-extrabold text-foreground group-hover:text-amber-300 transition-colors">
                        {action.title}
                      </h4>
                      <span className="inline-block font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                        {action.reward}
                      </span>
                    </div>
                  </div>

                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:text-amber-400 transition" />
                </div>

                <p className="mt-2 text-[11px] text-muted-foreground leading-snug">
                  {action.description}
                </p>

                <div className="mt-3 pt-2 border-t border-border/40 flex justify-end">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Execute Action <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* 2. SEASON PASS GOAL (1 COL) */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-surface-1 to-card p-5 space-y-4 shadow-lg flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm text-amber-300 uppercase tracking-wider">
                  Season 1 Goal
                </h3>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Contributor & Status Roadmap
                </span>
              </div>
            </div>

            <span className="font-mono text-[10px] font-bold uppercase bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
              {isContributor ? "Active Pass" : "Free Tier"}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">Current Season Progress:</span>
              <strong className="text-amber-300 font-bold">Level {player.level} / 50</strong>
            </div>

            <div className="h-2 rounded-full bg-surface-3 overflow-hidden border border-border/50">
              <div
                className="h-full bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b]"
                style={{ width: `${Math.min(100, (player.level / 50) * 100)}%` }}
              />
            </div>
          </div>

          {/* UNLOCK HIGHLIGHTS */}
          <div className="rounded-xl border border-amber-500/20 bg-surface-2/60 p-3 space-y-2">
            <span className="font-mono text-[10px] font-extrabold uppercase text-amber-400 flex items-center gap-1">
              <Award className="h-3.5 w-3.5" /> Next Prestigious Unlocks:
            </span>

            <ul className="text-xs space-y-1.5 text-muted-foreground font-mono">
              <li className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Unlock Exclusive Contributor Title Badge</span>
              </li>
              <li className="flex items-center gap-2">
                <Gift className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Monthly Free Vault Pack Allocations</span>
              </li>
            </ul>
          </div>
        </div>

        {/* LINK TO SEASON PASS */}
        <Link to="/season-pass" className="pt-2">
          <Button className="w-full bg-amber-400 text-black hover:bg-amber-300 font-mono text-xs font-black uppercase tracking-wider shadow-md">
            View Contributor Pass <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

import { motion } from "motion/react";
import { HeartHandshake, Sparkles, ArrowRight, ShieldCheck, Zap, Award } from "lucide-react";
import type { PlayerContributorProfile } from "@/services/contributor";
import { ProgressBar } from "./ProgressBar";
import { Button } from "@/components/ui/button";

interface ContributorRankHeroProps {
  profile: PlayerContributorProfile;
  onOpenDonateModal: () => void;
}

export function ContributorRankHero({ profile, onOpenDonateModal }: ContributorRankHeroProps) {
  const isMaxTier = !profile.nextRankName;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-b from-surface-1 via-card to-card p-6 sm:p-8 shadow-2xl space-y-6"
    >
      {/* ATMOSPHERIC AMBIENT GLOW */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-purple-500/15 blur-3xl" />

      {/* TOP DECK STRIP */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 font-mono text-xs font-extrabold text-amber-300 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" /> Tier {profile.currentRankTier} Contributor
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />$
            {profile.currentContributionAmount.toLocaleString()} Contributed
          </span>
        </div>

        {/* SINGLE STRONG CTA */}
        <Button
          onClick={onOpenDonateModal}
          className="gap-2 font-mono text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-400 text-black hover:from-amber-400 hover:to-amber-300 shadow-lg shadow-amber-500/20 h-10 px-5 rounded-xl transition-all hover:scale-105 cursor-pointer"
        >
          <HeartHandshake className="h-4 w-4 shrink-0" />
          <span>Increase Your Rank</span>
        </Button>
      </div>

      {/* HERO RANK CONTENT */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LEFT: BADGE & IDENTITY */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center space-y-3 border-b lg:border-b-0 lg:border-r border-border/50 pb-6 lg:pb-0 lg:pr-8">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-400/30 to-purple-500/30 blur-2xl animate-pulse" />
            <div className="relative grid h-28 w-28 place-items-center rounded-2xl border-2 border-amber-400/70 bg-surface-1 text-6xl shadow-2xl">
              {profile.currentRankIcon}
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-amber-400/80 bg-surface-1 px-3 py-0.5 font-mono text-[11px] font-black text-amber-300 shadow-md whitespace-nowrap">
              Tier {profile.currentRankTier} Rank
            </div>
          </div>

          <div className="pt-2 space-y-1">
            <div className="text-[10px] font-mono font-extrabold uppercase text-amber-400 tracking-wider">
              Current Contributor Identity
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-foreground tracking-tight">
              {profile.currentRankName}
            </h1>
            <p className="text-xs text-muted-foreground italic max-w-xs">
              "{profile.currentRankDescription}"
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2/70 px-3 py-1 font-mono text-xs font-bold text-foreground">
            <Award className="h-3.5 w-3.5 text-amber-400" />
            <span>Title: "{profile.currentTitle}"</span>
          </div>
        </div>

        {/* RIGHT: NEXT RANK TARGET & PROGRESS */}
        <div className="lg:col-span-7 space-y-5">
          {isMaxTier ? (
            <div className="rounded-2xl border border-amber-400/50 bg-amber-500/10 p-6 text-center space-y-2">
              <div className="text-3xl">👑</div>
              <h3 className="font-display font-black text-xl text-amber-300">
                Pinnacle Tier Unlocked!
              </h3>
              <p className="text-xs text-muted-foreground">
                You have reached the maximum Tier 6 Apex Fartboy status. Your legacy is
                immortalized.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* TARGET HEADER */}
              <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-2/60 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl filter drop-shadow">{profile.nextRankIcon}</span>
                  <div>
                    <div className="text-[10px] font-mono font-extrabold uppercase text-amber-400 tracking-wider">
                      Next Rank Target (Tier {profile.nextRankTier})
                    </div>
                    <div className="font-display font-extrabold text-lg text-foreground">
                      {profile.nextRankName}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-sm font-black text-amber-300">
                    ${profile.amountToNextRank?.toLocaleString()} Needed
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Target: ${profile.nextRankRequiredAmount?.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center font-mono text-xs">
                  <span className="text-muted-foreground">Progress to {profile.nextRankName}</span>
                  <span className="font-black text-amber-300">{profile.progressPercent}%</span>
                </div>
                <ProgressBar
                  value={profile.progressPercent ?? 0}
                  className="h-3 rounded-full bg-surface-3"
                />
              </div>

              {/* NEXT UNLOCK PREVIEW */}
              {profile.nextUnlockPreview && profile.nextUnlockPreview.length > 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-2">
                  <div className="text-[10px] font-mono font-extrabold uppercase text-amber-300 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-400" /> Next Rank Rewards Preview
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.nextUnlockPreview.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/80 px-2.5 py-1 text-xs font-semibold text-foreground"
                      >
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

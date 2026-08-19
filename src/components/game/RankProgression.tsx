import { Sparkles, ArrowRight, HeartHandshake, ShieldCheck, Zap, Award } from "lucide-react";
import type { PlayerContributorProfile } from "@/services/contributor";
import { ProgressBar } from "./ProgressBar";
import { Button } from "@/components/ui/button";

interface RankProgressionProps {
  profile: PlayerContributorProfile;
  onOpenDonateModal: () => void;
}

export function RankProgression({ profile, onOpenDonateModal }: RankProgressionProps) {
  const isMaxTier = !profile.nextRankName;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-b from-surface-1 via-card to-card p-6 sm:p-8 shadow-2xl space-y-6">
      {/* ATMOSPHERIC BACKGROUND EFFECTS */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />

      {/* HEADER STRIP */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-md">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display font-black text-xl text-foreground tracking-tight">
              Your Contributor Rank & Progress
            </h2>
            <p className="text-xs text-muted-foreground">
              Character Identity & Community Progression Engine
            </p>
          </div>
        </div>

        {/* DONATE MORE CTA BUTTON */}
        <Button
          onClick={onOpenDonateModal}
          className="gap-2 font-mono text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-400 text-black hover:from-amber-400 hover:to-amber-300 shadow-lg shadow-amber-500/20 h-11 px-5 rounded-xl cursor-pointer"
        >
          <HeartHandshake className="h-4 w-4 shrink-0" />
          <span>Donate & Boost Rank</span>
        </Button>
      </div>

      {/* GAME CHARACTER PROGRESSION HERO DISPLAY */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* LEFT COLUMN: CURRENT RANK HERO BADGE */}
        <div className="lg:col-span-5 rounded-2xl border border-amber-500/30 bg-surface-2/70 p-6 flex flex-col items-center text-center space-y-4 shadow-inner">
          <div className="relative">
            <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-amber-400/30 to-purple-500/30 blur-xl animate-pulse" />
            <div className="relative grid h-24 w-24 place-items-center rounded-2xl border-2 border-amber-400 bg-surface-1 text-5xl shadow-2xl">
              {profile.currentRankIcon}
            </div>
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 rounded-full border border-amber-400/60 bg-surface-1 px-3 py-0.5 font-mono text-[11px] font-extrabold text-amber-300 whitespace-nowrap shadow-md">
              Tier {profile.currentRankTier} Active
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <div className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Current Rank
            </div>
            <h3 className="font-display font-black text-2xl text-foreground tracking-tight">
              {profile.currentRankName}
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs italic">
              "{profile.currentRankDescription}"
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-300">
              <Award className="h-3.5 w-3.5" /> Title: "{profile.currentTitle}"
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" /> $
              {profile.currentContributionAmount.toLocaleString()} Contributed
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: PROGRESSION TO NEXT RANK */}
        <div className="lg:col-span-7 space-y-5">
          {isMaxTier ? (
            <div className="rounded-2xl border border-amber-400/50 bg-amber-500/10 p-6 text-center space-y-3 shadow-inner">
              <div className="text-4xl">👑</div>
              <h3 className="font-display font-black text-xl text-amber-300">
                Pinnacle Apex Contributor!
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                You have reached the maximum Tier 6 Apex Fartboy rank! Your legacy as a top
                community supporter is immortalized in the Raider Hall of Fame.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/80 bg-surface-2/60 p-5 space-y-4 shadow-inner">
              {/* NEXT RANK HEADER */}
              <div className="flex items-center justify-between">
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

                <div className="text-right font-mono text-xs">
                  <div className="font-extrabold text-amber-300">
                    ${profile.amountToNextRank?.toLocaleString()} Needed
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Target: ${profile.nextRankRequiredAmount?.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground font-semibold">
                    Current: ${profile.currentContributionAmount.toLocaleString()}
                  </span>
                  <span className="font-extrabold text-amber-300">
                    {profile.progressPercent}% Complete
                  </span>
                </div>
                <ProgressBar
                  value={profile.progressPercent ?? 0}
                  className="h-3 rounded-full bg-surface-3"
                />
              </div>

              {/* NEXT UNLOCK PREVIEW LIST */}
              {profile.nextUnlockPreview && profile.nextUnlockPreview.length > 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-2">
                  <div className="text-[10px] font-mono font-extrabold uppercase text-amber-300 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-400" /> Next Rank Unlocks & Rewards
                    Preview
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {profile.nextUnlockPreview.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-xs text-foreground font-semibold"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

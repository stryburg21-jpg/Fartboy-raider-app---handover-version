import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { HeartHandshake, Sparkles, ArrowRight, Award, ShieldCheck, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContributorPassPromoBannerProps {
  variant?: "hero" | "compact" | "card" | "vault";
  headline?: string;
  subtext?: string;
  className?: string;
}

export function ContributorPassPromoBanner({
  variant = "hero",
  headline = "Unlock Exclusive Status & Monthly Pack Drops",
  subtext = "Support the community • Earn prestige titles, custom avatar frames, and free pack allocations.",
  className = "",
}: ContributorPassPromoBannerProps) {
  if (variant === "compact") {
    return (
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-surface-1 to-purple-500/10 p-3.5 shadow-md ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400 text-black shadow-sm shrink-0">
            <HeartHandshake className="h-4 w-4" />
          </div>
          <div>
            <div className="font-display font-bold text-xs text-foreground flex items-center gap-1.5">
              <span>{headline}</span>
              <Sparkles className="h-3 w-3 text-amber-400" />
            </div>
            <p className="text-[11px] text-muted-foreground">{subtext}</p>
          </div>
        </div>

        <Link to="/season-pass" className="shrink-0">
          <Button
            size="sm"
            className="bg-amber-400 text-black hover:bg-amber-300 font-mono font-extrabold text-[11px] uppercase tracking-wider rounded-xl gap-1 shadow-sm cursor-pointer"
          >
            <span>Contributor Pass</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className={`relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-br from-surface-1 via-card to-amber-500/10 p-5 space-y-3 shadow-xl ${className}`}
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] font-extrabold text-amber-300">
            <Sparkles className="h-3 w-3 text-amber-400" /> Contributor Rank Perks
          </span>
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
        </div>

        <div className="space-y-1">
          <h4 className="font-display font-bold text-base text-foreground">{headline}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{subtext}</p>
        </div>

        <div className="pt-1 flex items-center justify-between gap-2 border-t border-border/50">
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-300">
            <Gift className="h-3.5 w-3.5 text-emerald-400" /> Free Monthly Packs
          </div>
          <Link to="/season-pass">
            <Button
              size="sm"
              className="bg-amber-400 text-black hover:bg-amber-300 font-mono font-extrabold text-xs h-8 px-3 rounded-lg gap-1 cursor-pointer"
            >
              <span>Increase Rank</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  if (variant === "vault") {
    return (
      <div
        className={`relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-amber-950/40 p-6 shadow-2xl backdrop-blur-md ${className}`}
      >
        {/* Ambient gold glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />

        {/* Ornate corner trim */}
        <span className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-amber-400/50 rounded-tl-md" />
        <span className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-amber-400/50 rounded-tr-md" />
        <span className="pointer-events-none absolute left-3 bottom-3 h-5 w-5 border-l-2 border-b-2 border-amber-400/50 rounded-bl-md" />
        <span className="pointer-events-none absolute right-3 bottom-3 h-5 w-5 border-r-2 border-b-2 border-amber-400/50 rounded-br-md" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <motion.div
              animate={{ opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-black/30 px-3 py-1 font-mono text-[11px] font-black uppercase tracking-widest text-amber-300"
            >
              <span className="relative grid h-3.5 w-3.5 place-items-center">
                <span className="absolute inset-0 rounded-full border border-amber-300/70 animate-plaque-pulse" />
                <HeartHandshake className="h-2.5 w-2.5 text-amber-300" />
              </span>
              Support the Community
            </motion.div>
            <h3 className="font-display font-black text-xl sm:text-2xl text-amber-50 tracking-tight drop-shadow-[0_2px_10px_rgba(245,158,11,0.25)]">
              {headline}
            </h3>
            <p className="text-xs text-amber-100/60 leading-relaxed">{subtext}</p>
          </div>

          <Link to="/season-pass" className="shrink-0 self-start sm:self-auto">
            <Button
              size="lg"
              className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 hover:scale-105 font-mono font-black text-xs uppercase tracking-wider h-11 px-6 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.5)] gap-2 cursor-pointer transition-all active:scale-95"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-sheen-sweep bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)]"
              />
              <Award className="h-4 w-4" />
              <span className="relative">Increase Your Rank</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // HERO BANNER VARIANT (DEFAULT)
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-r from-surface-1 via-amber-500/10 to-purple-500/15 p-6 shadow-2xl space-y-4 ${className}`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/15 blur-2xl" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 font-mono text-xs font-black text-amber-300 shadow-sm">
            <HeartHandshake className="h-3.5 w-3.5" /> Support the Community • Earn Exclusive
            Rewards
          </div>
          <h3 className="font-display font-black text-xl sm:text-2xl text-foreground tracking-tight">
            {headline}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{subtext}</p>
        </div>

        <Link to="/season-pass" className="shrink-0 self-start sm:self-auto">
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-amber-400 text-black hover:from-amber-400 hover:to-amber-300 font-mono font-extrabold text-xs uppercase tracking-wider h-11 px-6 rounded-2xl shadow-lg shadow-amber-500/20 gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <Award className="h-4 w-4" />
            <span>Increase Your Rank</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

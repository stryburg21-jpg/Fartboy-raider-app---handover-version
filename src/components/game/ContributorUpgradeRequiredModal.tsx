import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Sparkles,
  Lock,
  Zap,
  Gift,
  ShieldCheck,
  Film,
  Palette,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  HeartHandshake,
} from "lucide-react";
import { DonateMoreModal } from "@/components/game/DonateMoreModal";
import { useNavigate } from "@tanstack/react-router";

export type LockedFeatureType =
  "frame" | "artwork" | "3d_mode" | "cosmetic_item" | "pass" | "general";

export interface ContributorUpgradeRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: LockedFeatureType;
  customFeatureName?: string;
  customFeatureDescription?: string;
}

const FEATURE_CONFIGS: Record<
  LockedFeatureType,
  {
    title: string;
    headline: string;
    description: string;
    icon: typeof Lock;
    iconColor: string;
    perkHighlight: string;
  }
> = {
  frame: {
    title: "Profile Frame Customization",
    headline: "Exclusive 3D Profile Frames & Prestige Borders",
    description:
      "Wrap your Character HQ in animated video frames, holographic borders, and seasonal contributor insignias.",
    icon: ImageIcon,
    iconColor: "text-amber-400",
    perkHighlight: "Custom 3D Profile Frames & Insignia Borders",
  },
  artwork: {
    title: "Avatar & Artwork Customization",
    headline: "Custom Avatar Artwork & Theme Backgrounds",
    description:
      "Unlock bespoke avatar artwork, alternate character poses, and exclusive HQ background environments.",
    icon: Palette,
    iconColor: "text-purple-400",
    perkHighlight: "Avatar & Background Theme Customization",
  },
  "3d_mode": {
    title: "2D / 3D Media Mode",
    headline: "Dynamic 3D Video Viewport & Motion Rendering",
    description:
      "Render your character with active video motion loops, animated particle VFX, and live luma-key frame rendering.",
    icon: Film,
    iconColor: "text-sky-400",
    perkHighlight: "Custom 3D Viewport & Video Motion Playback",
  },
  cosmetic_item: {
    title: "Contributor Cosmetic Item",
    headline: "Contributor Exclusive Cosmetics & Relics",
    description:
      "Equipping special contributor pet companions, animated power relics, and mythic cosmetics requires an active Contributor status.",
    icon: Sparkles,
    iconColor: "text-emerald-400",
    perkHighlight: "Mythic Pet Skins & Animated Power Effects",
  },
  pass: {
    title: "Season 1 Contributor Pass",
    headline: "Unlock 50 Exclusive Seasonal Rewards",
    description:
      "Claim 50 tiers of premium cosmetic drops, animated titles, monthly vault packs, and permanent XP multipliers.",
    icon: Crown,
    iconColor: "text-amber-400",
    perkHighlight: "50-Tier Season Pass Reward Pipeline",
  },
  general: {
    title: "Contributor Feature Locked",
    headline: "Contributor Tier Required",
    description:
      "Support decentralized ecosystem growth and unlock full Character HQ customization, 3D rendering, and bonus rewards.",
    icon: Lock,
    iconColor: "text-amber-400",
    perkHighlight: "Full Character HQ Customization Suite",
  },
};

export function ContributorUpgradeRequiredModal({
  open,
  onOpenChange,
  feature = "general",
  customFeatureName,
  customFeatureDescription,
}: ContributorUpgradeRequiredModalProps) {
  const navigate = useNavigate();
  const [donateModalOpen, setDonateModalOpen] = useState(false);

  const config = FEATURE_CONFIGS[feature] || FEATURE_CONFIGS.general;
  const FeatureIcon = config.icon;

  const handleBecomeContributor = () => {
    onOpenChange(false);
    setDonateModalOpen(true);
  };

  const handleViewPass = () => {
    onOpenChange(false);
    navigate({ to: "/missions", search: { tab: "pass" } });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          style={{ zIndex: 110, backdropFilter: "blur(12px)" }}
          className="max-w-lg border-2 border-amber-500/50 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-foreground p-5 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] rounded-2xl sm:rounded-3xl z-[110] font-mono"
        >
          {/* TOP ORNATE BANNER */}
          <DialogHeader className="space-y-3 pb-3 border-b border-amber-500/30 text-left">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 text-[10.5px] font-black uppercase tracking-wider shadow-xs">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>CONTRIBUTOR UPGRADE REQUIRED</span>
              </div>
              <span className="text-[10px] font-black text-amber-400/80 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-md">
                TIER 1+ PERK
              </span>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
                <FeatureIcon className={`h-6 w-6 ${config.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="font-display font-black text-lg sm:text-xl text-white tracking-tight leading-snug">
                  {customFeatureName || config.headline}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                  {customFeatureDescription || config.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* PERK BREAKDOWN LIST */}
          <div className="space-y-2 py-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>WHAT YOU UNLOCK WITH CONTRIBUTOR STATUS:</span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/90 border border-amber-500/20 text-slate-200">
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-amber-400/20 text-amber-300 font-bold text-xs">
                  🖼️
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-amber-200">
                    3D Video Viewport & Profile Frames:
                  </span>
                  <span className="text-slate-400 text-[11px] font-sans ml-1">
                    Custom motion rendering, profile frames & artwork switching.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/90 border border-emerald-500/20 text-slate-200">
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-emerald-400/20 text-emerald-300 font-bold text-xs">
                  👑
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-emerald-200">Full 50-Tier Season 1 Pass:</span>
                  <span className="text-slate-400 text-[11px] font-sans ml-1">
                    Instant access to claim all 50 reward tiers and prestige titles.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/90 border border-sky-500/20 text-slate-200">
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-sky-400/20 text-sky-300 font-bold text-xs">
                  ⚡
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-sky-200">Permanent XP Multipliers:</span>
                  <span className="text-slate-400 text-[11px] font-sans ml-1">
                    +10% to +25% bonus XP across all raids, missions, and forge drops.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-xs font-bold text-slate-400 hover:text-white order-2 sm:order-1 cursor-pointer"
            >
              Maybe Later
            </Button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 order-1 sm:order-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleViewPass}
                className="text-xs font-black uppercase tracking-wider border-amber-500/40 text-amber-300 hover:bg-amber-500/20 bg-slate-900/80 cursor-pointer h-10 px-3.5 rounded-xl"
              >
                View Pass Tiers
              </Button>

              <Button
                type="button"
                onClick={handleBecomeContributor}
                className="text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer h-10 px-5 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Crown className="h-4 w-4 text-slate-950 shrink-0" />
                <span>BECOME A CONTRIBUTOR</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-950 shrink-0" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DonateMoreModal open={donateModalOpen} onOpenChange={setDonateModalOpen} />
    </>
  );
}

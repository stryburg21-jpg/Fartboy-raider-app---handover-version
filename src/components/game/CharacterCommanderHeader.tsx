import { useGameState } from "@/hooks/useGameState";
import { Shield, Sparkles, Flame, Crown } from "lucide-react";
import { LumaKeyVideoFrame } from "@/components/game/LumaKeyVideoFrame";
import { checkIsContributor } from "@/utils/contributorGating";

interface CharacterCommanderHeaderProps {
  completedCount: number;
  totalRequired: number;
  streakDays?: number;
  resetTimerStr?: string;
  onClaimDailyClick?: () => void;
  isDailyUnsealed?: boolean;
  isDailyClaimable?: boolean;
  onOpenFrameModal?: () => void;
}

export function CharacterCommanderHeader({
  completedCount,
  totalRequired,
  streakDays = 5,
  resetTimerStr = "07h 12m",
  onClaimDailyClick,
  isDailyUnsealed = false,
  isDailyClaimable = false,
  onOpenFrameModal,
}: CharacterCommanderHeaderProps) {
  const { player, inventory = [] } = useGameState();

  // Dynamic speech bubble text based on daily progress
  const getCommanderSpeech = () => {
    if (completedCount >= totalRequired) {
      return "Daily Mastery achieved! Claim your rewards.";
    }
    if (completedCount > 0) {
      return "Good progress! Keep raiding to gain more xp!.";
    }
    return "To arms, Raider! Pick Your Mission - Help The community!.";
  };

  const commanderSpeechText = getCommanderSpeech();

  const equippedThemeId = player?.equipped?.cosmeticTheme || player?.equipped?.theme;
  const equippedThemeItem = inventory.find(
    (i) => i.id === equippedThemeId || i.templateId === equippedThemeId,
  );

  const equippedFrameId = player?.equipped?.frame;
  const equippedFrameItem = inventory.find(
    (i) => i.id === equippedFrameId || i.templateId === equippedFrameId,
  );
  // Frame is a Contributor-only cosmetic - never render it for a
  // non-contributor, even if stale equip state still points at one (e.g. a
  // lapsed pass). Mirrors the same gate HeroCharacterSection.tsx applies.
  const isContributor = checkIsContributor(player);
  const frameAsset = isContributor ? equippedFrameItem?.frameAsset : undefined;

  const raiderMediaSrc =
    (player as { characterVideo?: string })?.characterVideo ||
    (player as { characterImage?: string })?.characterImage ||
    (isContributor ? equippedThemeItem?.themeAssets?.forgeImage : undefined) ||
    (isContributor ? equippedThemeItem?.themeAssets?.hqImage : undefined) ||
    player?.avatar ||
    "/assets/character-preview.png";

  const isVideo =
    typeof raiderMediaSrc === "string" &&
    (raiderMediaSrc.endsWith(".mp4") || raiderMediaSrc.endsWith(".webm"));

  const commanderName = (player?.username || player?.name || "RAIDER").toUpperCase();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-r from-[#170e28] via-[#0D111A] to-[#0A0D14] p-3 sm:p-5 shadow-2xl space-y-3">
      {/* Background glow accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-10 h-44 w-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

      {/* TOP HEADER STATUS ROW */}
      <div className="flex items-center justify-between gap-2 flex-wrap relative z-10 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 border border-amber-400/50 px-2.5 py-0.5 font-mono text-[10px] font-black text-amber-300 shadow-xs">
            <Crown className="h-3 w-3 text-amber-400" />
            COMMANDER {commanderName}
          </span>

          <span className="text-[10px] font-mono text-emerald-400 font-extrabold flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> War Room Bounties
          </span>
        </div>

        {/* COMPACT WAR ROOM STATS (STREAK + RESET TIMER) */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 px-2.5 py-1 text-[11px] font-black text-amber-300 shadow-xs">
            <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0 animate-pulse" />
            <span>🔥 {streakDays}-Day Streak</span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 text-[11px] font-bold text-slate-300">
            <Shield className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>⏱️ Resets in {resetTimerStr}</span>
          </div>
        </div>
      </div>

      {/* REFRAMED CHARACTER PEDESTAL CANVAS HERO WITH PERFECT FRAME OVERLAY FIT */}
      <div className="relative w-full aspect-square max-h-[220px] mx-auto rounded-xl overflow-hidden bg-zinc-950 flex items-center justify-center border border-amber-500/30 shadow-2xl my-2 group">
        {/* FRAME EQUIP/DE-EQUIP TRIGGER */}
        {onOpenFrameModal && (
          <button
            type="button"
            onClick={onOpenFrameModal}
            className="absolute top-2 right-2 z-30 bg-zinc-950/85 hover:bg-zinc-900 border border-amber-400/60 text-amber-300 hover:text-amber-200 rounded-lg px-2.5 py-1 font-mono text-[10px] font-black flex items-center gap-1.5 shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            title="Equip or De-equip Frame Overlay"
          >
            <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
            <span>FRAME {equippedFrameItem ? "(EQUIPPED)" : ""}</span>
          </button>
        )}

        {/* Character Artwork / Video */}
        {isVideo ? (
          <video
            src={raiderMediaSrc}
            autoPlay
            loop
            muted
            playsInline
            poster="/assets/character-preview.png"
            className="w-full h-full object-cover object-top z-0 pointer-events-none select-none transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <img
            src={raiderMediaSrc}
            alt="Equipped Character"
            className="w-full h-full object-cover object-top z-0 pointer-events-none select-none transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/assets/character-preview.png";
            }}
          />
        )}

        {/* Video Frame Overlay - Exact Inset Fit */}
        {frameAsset && (
          <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <LumaKeyVideoFrame
              className="w-full h-full object-fill pointer-events-none block z-10"
              fallbackImageSrc={frameAsset.image}
              videoSrc={frameAsset.video}
              alt="Equipped Frame"
            />
          </div>
        )}
      </div>

      {/* CLAIM DAILY MISSIONS CTA BUTTON (ONLY SHOWN WHEN NOT UNSEALED) */}
      {!isDailyUnsealed && onClaimDailyClick && (
        <div className="pt-1 flex justify-center">
          <button
            type="button"
            onClick={onClaimDailyClick}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-mono text-xs sm:text-sm font-black px-8 py-3 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.6)] cursor-pointer flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95 border border-amber-200/80 animate-bounce"
          >
            <Sparkles className="h-4 w-4 fill-slate-950 text-slate-950 animate-pulse" />
            <span>CLAIM DAILY MISSIONS 🎁</span>
          </button>
        </div>
      )}
    </div>
  );
}

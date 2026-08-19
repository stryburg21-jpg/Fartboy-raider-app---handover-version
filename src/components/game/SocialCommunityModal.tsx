import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Disc,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Users,
  CheckCircle2,
  Globe,
  Flame,
} from "lucide-react";

interface SocialCommunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SocialCommunityModal({ open, onOpenChange }: SocialCommunityModalProps) {
  const handleOpenDiscord = () => {
    toast.info("Simulated: Navigating to Official Discord Server in Discord Webview");
    window.open("https://discord.gg/fartboy", "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-950 border border-indigo-500/40 text-foreground p-5 sm:p-6 rounded-2xl shadow-2xl space-y-4 font-mono">
        <DialogHeader className="border-b border-indigo-500/20 pb-3">
          <DialogTitle className="flex items-center gap-2 font-display text-lg sm:text-xl font-black text-indigo-300">
            <Disc className="h-5 w-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            <span>COMMUNITY &amp; SOCIAL HUBS</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 font-sans">
            Connect with fellow Raiders, participate in live Discord raids, and claim exclusive
            community XP drops.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1 text-xs">
          {/* Main Discord Card */}
          <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/40 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#5865F2] grid place-items-center text-white shadow-sm">
                  <Disc className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-display font-black text-sm text-white flex items-center gap-1.5">
                    <span>Official Discord Raid Server</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[10px] text-indigo-300/80 font-mono">
                    #daily-quests • #raid-alerts • #forge
                  </div>
                </div>
              </div>
            </div>

            <p className="text-slate-300 text-xs font-sans leading-relaxed">
              Join active community missions, react with ✅ to verify raids, participate in voice
              channel boss fights, and earn seasonal Contributor XP.
            </p>

            <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>Automated Bot Sync Active</span>
              </div>
              <Button
                onClick={handleOpenDiscord}
                className="min-h-[44px] sm:min-h-[48px] bg-[#5865F2] hover:bg-[#4752C4] active:bg-[#3c45a5] text-white font-mono text-xs font-bold px-4 py-2 h-auto rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 touch-manipulation cursor-pointer"
              >
                <span>JOIN DISCORD</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Social Channels List */}
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-amber-400" />
              <span>Other Social Channels:</span>
            </div>

            <div className="space-y-2">
              <a
                href="https://x.com/FartboySolana"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => toast.info("Opening Official Twitter / X in new tab")}
                className="flex items-center justify-between min-h-[48px] p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 active:bg-slate-800 border border-slate-800 hover:border-amber-500/30 text-slate-300 hover:text-white transition-all group touch-manipulation active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-black text-amber-400 text-sm">𝕏</span>
                  <span className="font-bold text-xs">Twitter / X (@FartboySolana)</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </a>

              <a
                href="https://t.me/fartboy"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => toast.info("Opening Telegram Broadcast in new tab")}
                className="flex items-center justify-between min-h-[48px] p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 active:bg-slate-800 border border-slate-800 hover:border-cyan-500/30 text-slate-300 hover:text-white transition-all group touch-manipulation active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="font-bold text-xs">Telegram Community Broadcast</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </a>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-400">
                <div className="flex items-center gap-2">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-xs">
                    Community Raids: <strong className="text-slate-200">Daily 18:00 UTC</strong>
                  </span>
                </div>
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="border-slate-700 hover:bg-slate-900 text-slate-300 font-mono text-xs font-bold px-4 py-2 rounded-xl"
          >
            CLOSE
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

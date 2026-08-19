import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FutureIdeasView } from "@/components/game/FutureIdeasView";
import { Rocket } from "lucide-react";

interface RoadmapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoadmapModal({ open, onOpenChange }: RoadmapModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-950 border border-amber-500/40 text-foreground p-3 sm:p-5 rounded-2xl shadow-2xl overflow-y-auto custom-scrollbar font-mono">
        <DialogHeader className="border-b border-amber-500/20 pb-3 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="flex items-center gap-2 font-display text-lg sm:text-xl font-black text-amber-300">
              <Rocket className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              <span>UPCOMING FEATURES &amp; ROADMAP PROTOCOLS</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-sans mt-0.5">
              Explore planned game mechanics, seasonal expansions, raid guilds, and future
              protocols.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="pt-2">
          <FutureIdeasView onBack={() => onOpenChange(false)} isModal={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

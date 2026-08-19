import { useState } from "react";
import { Check, Sparkles, Award, Shield, Tag, Crown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";
import { equipPlayerTitle } from "@/services/player";
import { updateEquippedTitlePayload } from "@/services/inventory";
import type { Title } from "@/types/game";

interface TitleCosmeticSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_AVAILABLE_TITLES: Title[] = [
  {
    id: "bubble_blaster",
    name: "BUBBLE BLASTER",
    description: "Chaos Engineer & Stench Tactician",
    equipped: true,
    unlocked: true,
  },
  {
    id: "chaos_engineer",
    name: "Chaos Engineer",
    description: "Master of Gas Dynamics & Experimental Alchemy",
    equipped: false,
    unlocked: true,
  },
  {
    id: "raid_veteran",
    name: "Raid Veteran",
    description: "Battle-hardened raider of Season 1",
    equipped: false,
    unlocked: true,
  },
  {
    id: "apex_specialist",
    name: "Apex Specialist",
    description: "Equipped full tier-4 specialist set",
    equipped: false,
    unlocked: true,
  },
  {
    id: "fartboy_lord",
    name: "Fartboy Lord",
    description: "Prestige rank champion of the Vault",
    equipped: false,
    unlocked: true,
  },
  {
    id: "meme_crafter",
    name: "Meme Crafter",
    description: "Community content contribution legend",
    equipped: false,
    unlocked: true,
  },
];

export function TitleCosmeticSelectorModal({
  open,
  onOpenChange,
}: TitleCosmeticSelectorModalProps) {
  const player = useGameStore((s) => s.player);
  const setPlayer = useGameStore((s) => s.setPlayer);
  const [loading, setLoading] = useState(false);

  const availableTitles = player?.titles?.length ? player.titles : DEFAULT_AVAILABLE_TITLES;

  const handleSelectTitle = async (titleId: string) => {
    setLoading(true);
    try {
      const res = await updateEquippedTitlePayload(titleId);
      if (res?.updatedPlayer) {
        setPlayer(res.updatedPlayer);
      } else {
        const updated = await equipPlayerTitle(titleId);
        setPlayer(updated);
      }
    } catch (err) {
      console.error("Failed to set title:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border border-amber-500/40 bg-[#0B0E14] text-foreground shadow-2xl">
        <DialogHeader className="border-b border-amber-500/20 pb-3">
          <DialogTitle className="flex items-center gap-2 font-display text-xl font-black text-amber-400">
            <Tag className="h-5 w-5 text-amber-400" /> Raider Identity & Crest
          </DialogTitle>
          <DialogDescription className="text-xs text-amber-200/60 font-mono">
            Select an unlocked title and cosmetic crest to display on your Raider HQ Command Center.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3 max-h-[380px] overflow-y-auto pr-1">
          <div className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Crown className="h-3.5 w-3.5" /> Unlocked Titles ({availableTitles.length})
          </div>

          <div className="space-y-2">
            {availableTitles.map((t) => {
              const isEquipped = t.equipped;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelectTitle(t.id)}
                  disabled={loading}
                  className={`relative flex items-center justify-between w-full rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                    isEquipped
                      ? "border-amber-400 bg-amber-500/15 shadow-lg ring-1 ring-amber-400/50"
                      : "border-amber-500/20 bg-slate-950/80 hover:border-amber-400/50 hover:bg-amber-950/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border text-lg ${
                        isEquipped
                          ? "border-amber-400 bg-amber-400/20 text-amber-300"
                          : "border-slate-800 bg-slate-900 text-slate-400"
                      }`}
                    >
                      🏷️
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-sm text-amber-200">
                          {t.name}
                        </span>
                        {isEquipped && (
                          <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-mono font-extrabold text-amber-300 border border-amber-400/40">
                            EQUIPPED
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {t.description || "Official Raider Identity Badge"}
                      </p>
                    </div>
                  </div>

                  {isEquipped && (
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-amber-400 text-slate-950 font-bold shadow">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-amber-500/20">
          <span className="text-[10px] font-mono text-slate-400">
            Titles dynamically boost community prestige
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="font-mono text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
  getActiveProfileId,
  setActiveProfileId,
  DEMO_PROFILES,
  type ProfileId,
} from "@/services/profiles";
import { getCurrentPlayer } from "@/services/player";
import { getInventory } from "@/services/inventory";
import { getOwnedPacks } from "@/services/packs";
import { getMissions } from "@/services/missions";
import { getAchievements } from "@/services/achievements";
import { getLatestRewards } from "@/services/rewards";
import { useGameStore } from "@/store/gameStore";
import { audio } from "@/services/audio";
import { Users, Check, Sparkles } from "lucide-react";

export function DemoProfileSwitcher() {
  const [open, setOpen] = useState(false);
  const activeId = getActiveProfileId();

  const setPlayer = useGameStore((s) => s.setPlayer);
  const setInventory = useGameStore((s) => s.setInventory);
  const setPacks = useGameStore((s) => s.setPacks);
  const setMissions = useGameStore((s) => s.setMissions);
  const setAchievements = useGameStore((s) => s.setAchievements);
  const setRewards = useGameStore((s) => s.setRewards);
  const setNotifications = useGameStore((s) => s.setNotifications);
  const notifications = useGameStore((s) => s.notifications);

  const handleSelectProfile = async (id: ProfileId) => {
    if (id === activeId) {
      setOpen(false);
      return;
    }

    audio.play("button.click");
    setActiveProfileId(id);

    // Rehydrate Zustand game store with chosen profile data from service layer
    const [player, inventory, packs, missions, achievements, rewards] = await Promise.all([
      getCurrentPlayer(),
      getInventory(),
      getOwnedPacks(),
      getMissions(),
      getAchievements(),
      getLatestRewards(),
    ]);

    setPlayer(player);
    setInventory(inventory);
    setPacks(packs);
    setMissions(missions);
    setAchievements(achievements);
    setRewards(rewards);

    // Notify user
    const profile = DEMO_PROFILES[id];
    setNotifications([
      {
        id: `notif_profile_${Date.now()}`,
        title: "Profile Switched",
        message: `Active test profile updated to ${profile.name} (${profile.badge}).`,
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...notifications,
    ]);

    setOpen(false);
  };

  const currentProfile = DEMO_PROFILES[activeId];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 text-xs font-mono font-extrabold text-amber-300 transition-all shadow-sm cursor-pointer"
        title="Switch Demo Test Profile"
      >
        <Users className="h-3.5 w-3.5 text-amber-400" />
        <span className="hidden sm:inline">Profile:</span>
        <span>{currentProfile?.badge || "Active"}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl border-amber-500/30 bg-surface-1 p-6 shadow-2xl rounded-3xl">
          <DialogHeader className="pb-3 border-b border-border/60">
            <DialogTitle className="flex items-center gap-2 text-lg font-display font-bold text-foreground">
              <Users className="h-5 w-5 text-amber-400" />
              <span>Select Demo Test Profile</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Switch between simulated player progression profiles to test all frontend UI states &
              forge mechanics without a backend.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3">
            {(Object.keys(DEMO_PROFILES) as ProfileId[]).map((pId) => {
              const prof = DEMO_PROFILES[pId];
              const isSelected = activeId === pId;

              return (
                <button
                  key={pId}
                  onClick={() => handleSelectProfile(pId)}
                  className={`flex flex-col text-left rounded-2xl border p-4 transition-all duration-200 cursor-pointer space-y-2 relative ${
                    isSelected
                      ? "border-amber-400 bg-amber-500/15 shadow-md ring-2 ring-amber-400/30"
                      : "border-border/80 bg-card hover:border-amber-400/50 hover:bg-surface-2"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-extrabold text-sm text-foreground">
                      {prof.name}
                    </span>
                    <span className="font-mono text-[10px] font-extrabold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                      {prof.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {prof.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-muted-foreground border-t border-border/40">
                    <span>
                      Lv {prof.player.level} • {prof.inventory.length} Gear Items
                    </span>
                    {isSelected && (
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Active
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              API & Service layer architecture preserved
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="font-mono text-xs"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

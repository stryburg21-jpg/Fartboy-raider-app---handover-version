import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { DiscordRole, Item, Player, PlayerContributionStats } from "@/types/game";
import { HeroCharacterSection } from "./HeroCharacterSection";
import { UnlockedAchievementsShowcase } from "./UnlockedAchievementsShowcase";
import { CareerRecordsAccordion } from "./CareerRecordsAccordion";
import { ShareProfileModal } from "./ShareProfileModal";
import { Button } from "@/components/ui/button";
import { Rocket, ArrowRight } from "lucide-react";
import { getActiveSpecialistIdentity, getSetInfoForItem } from "@/lib/sets";
import { getPlayerRoles, getPlayerContributionStats } from "@/services/player";
import { getPlayerUnlockedAchievements } from "@/services/achievements";
import { useGameStore } from "@/store/gameStore";

export function CharacterPanel({
  player,
  itemsById,
}: {
  player: Player;
  itemsById: Record<string, Item>;
}) {
  const inventory = useGameStore((s) => s.inventory);
  const packs = useGameStore((s) => s.packs);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [allRoles, setAllRoles] = useState<DiscordRole[]>([]);
  const [contribStats, setContribStats] = useState<PlayerContributionStats | null>(null);

  const unlockedAchievementsQuery = useQuery({
    queryKey: ["unlocked-achievements", player.id],
    queryFn: () => getPlayerUnlockedAchievements(player.id),
  });

  const activeSpecialistIdentity = getActiveSpecialistIdentity(player.equipped, inventory);

  useEffect(() => {
    let isMounted = true;

    getPlayerRoles(player, activeSpecialistIdentity).then((roles) => {
      if (isMounted) {
        setAllRoles(roles);
      }
    });

    getPlayerContributionStats(player.id, player).then((stats) => {
      if (isMounted) {
        setContribStats(stats);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [player, activeSpecialistIdentity]);

  const setInfo = getSetInfoForItem(
    `${activeSpecialistIdentity} Set`,
    inventory,
    player.equipped ?? {},
  );

  const scrollToElement = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* 1. TOP & MAIN SECTIONS (Header -> Raider Progression & Server Meters -> Unopened Packs -> Character Loadout) */}
      <div id="raider-identity-block">
        <HeroCharacterSection
          player={player}
          itemsById={itemsById}
          unopenedPacksCount={packs.length}
          allRoles={allRoles}
          activeSpecialistIdentity={activeSpecialistIdentity}
          setInfoBonusDescription={setInfo?.bonusDescription}
          contribStats={contribStats}
          onOpenShareModal={() => setShareModalOpen(true)}
          onScrollToEquipment={() => scrollToElement("equipment-slots-section")}
        />
      </div>

      {/* 2. BOTTOM SECTION: [TROPHY CABINET & CAREER RECORDS] */}
      <div id="trophy-cabinet-section" className="space-y-2 sm:space-y-2.5">
        <UnlockedAchievementsShowcase
          achievements={unlockedAchievementsQuery.data ?? []}
          isLoading={unlockedAchievementsQuery.isLoading}
        />
        <CareerRecordsAccordion />

        {/* 3. SLEEK COMPACT ROADMAP LINK BANNER */}
        {/* // TODO: Connect roadmap to live feature voting API POST /api/roadmap/vote */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-950/80 to-slate-900/60 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
              <Rocket className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-white flex items-center gap-1.5 flex-wrap">
                <span>GAME ROADMAP & FUTURE IDEATION</span>
                <span className="text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-full">
                  LIVING ROADMAP
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-sans truncate">
                Preview upcoming gear sets, raid mechanics & vote on community concepts.
              </div>
            </div>
          </div>

          <Link to="/roadmap" className="shrink-0 w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto h-8 border-amber-500/50 text-amber-300 bg-amber-950/40 hover:bg-amber-500/20 font-black text-xs px-3 rounded-xl gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              <span>EXPLORE ROADMAP</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* SHARE PROFILE MODAL */}
      <ShareProfileModal open={shareModalOpen} onOpenChange={setShareModalOpen} />
    </div>
  );
}

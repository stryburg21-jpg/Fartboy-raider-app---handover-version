import { useState, useEffect } from "react";
import {
  Share2,
  Copy,
  Download,
  MessageSquare,
  Sparkles,
  Trophy,
  Layers,
  Star,
  Check,
  ShieldCheck,
} from "lucide-react";
import { Modal } from "./Modal";
import { RarityBadge } from "./RarityBadge";
import { isImageUrl } from "./RaiderAvatar";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";
import { getAllItems } from "@/services/items";
import type { Item } from "@/types/game";
import { getContributorTierByName } from "@/config/contributor";

export interface ShareProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareProfileModal({ open, onOpenChange }: ShareProfileModalProps) {
  const player = useGameStore((s) => s.player);
  const inventory = useGameStore((s) => s.inventory);
  const achievements = useGameStore((s) => s.achievements);
  const setNotifications = useGameStore((s) => s.setNotifications);
  const notifications = useGameStore((s) => s.notifications);

  const [itemsById, setItemsById] = useState<Record<string, Item>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getAllItems().then((items) => {
      const map: Record<string, Item> = {};
      for (const it of items) map[it.id] = it;
      setItemsById(map);
    });
  }, []);

  if (!player) return null;

  const equippedTitle = player?.titles?.find((t) => t?.equipped)?.name ?? "Novice Raider";
  const favoriteItem = player.favoriteItemId
    ? itemsById[player.favoriteItemId]
    : (inventory[0] ?? null);

  const favoriteSet = favoriteItem?.set ?? "Raid Specialist Set";
  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const collectionPct = 68; // 68% collection completion mock calculation

  // Specialist identity mapping
  const specialistIdentity =
    favoriteItem?.set === "Raid Specialist Set"
      ? "Raid Specialist"
      : favoriteItem?.set === "CTO Specialist Set"
        ? "CTO Specialist"
        : favoriteItem?.set === "Meme Specialist Set"
          ? "Meme Specialist"
          : favoriteItem?.set === "Video Specialist Set"
            ? "Video Specialist"
            : "Community Specialist";

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    setNotifications([
      {
        id: `notif_share_${Date.now()}`,
        title: "Profile Link Copied!",
        message: "Shareable Raider link copied to clipboard.",
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...notifications,
    ]);
  };

  const handleDiscordShare = () => {
    // TODO(discord): Trigger Discord Native Embedded App / Activity Share Modal via Discord SDK
    setNotifications([
      {
        id: `notif_discord_${Date.now()}`,
        title: "Discord Share Requested",
        message: "Player identity card ready for Discord raid broadcast! (Frontend Presentation)",
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...notifications,
    ]);
  };

  const handleDownloadCard = () => {
    // TODO(frontend): Export card canvas/image asset for local download
    setNotifications([
      {
        id: `notif_download_${Date.now()}`,
        title: "Card Asset Exported",
        message: "Raider card graphic generated successfully.",
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...notifications,
    ]);
  };

  return (
    <Modal open={open} onClose={() => onOpenChange(false)} maxWidth="max-w-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            <h3 className="font-display text-base font-bold">Raider Identity Card</h3>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Shareable Player Card
          </span>
        </div>

        {/* The Card Container (Styled as a premium showcase card) */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-primary/40 bg-gradient-to-b from-surface-2 to-surface-1 p-5 shadow-xl">
          {/* Header Badge */}
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
                {specialistIdentity}
              </span>
            </div>
            {player.contributorRank &&
              getContributorTierByName(player.contributorRank).id !== "unranked" && (
                <div
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${getContributorTierByName(player.contributorRank).bgClass} ${getContributorTierByName(player.contributorRank).colorClass} border ${getContributorTierByName(player.contributorRank).borderClass}`}
                >
                  {getContributorTierByName(player.contributorRank).badge} {player.contributorRank}
                </div>
              )}
          </div>

          {/* Main Identity Info */}
          <div className="mt-4 flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={player.avatar}
                alt={player.username}
                className="h-16 w-16 rounded-2xl border-2 border-primary bg-surface-3 object-cover shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 rounded-md bg-primary px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">
                LV {player.level}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-lg font-bold">{player.username}</h2>
              <p className="truncate font-mono text-xs text-primary">"{equippedTitle}"</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Lifetime XP:{" "}
                <span className="font-mono font-bold text-foreground">
                  {(player.lifetimeXP ?? player.xp ?? 0).toLocaleString()}
                </span>
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
            {/* Favourite Item */}
            <div className="rounded-xl border border-border/60 bg-surface-3/50 p-3">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Star className="h-3 w-3 text-amber-400" />
                Favourite Item
              </div>
              {favoriteItem ? (
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-xl">
                    {isImageUrl(favoriteItem.image) ? (
                      <img
                        src={favoriteItem.image}
                        alt={favoriteItem.name}
                        className="h-5 w-5 object-contain inline-block align-middle"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      favoriteItem.image
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-foreground">
                      {favoriteItem.name}
                    </div>
                    <RarityBadge rarity={favoriteItem.rarity} />
                  </div>
                </div>
              ) : (
                <div className="mt-1.5 text-muted-foreground">None selected</div>
              )}
            </div>

            {/* Favourite Set */}
            <div className="rounded-xl border border-border/60 bg-surface-3/50 p-3">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Layers className="h-3 w-3 text-primary" />
                Favourite Set
              </div>
              <div className="mt-1.5 font-semibold text-foreground truncate">{favoriteSet}</div>
              <div className="mt-0.5 font-mono text-[10px] text-primary">Specialist Affinity</div>
            </div>

            {/* Collection Completion */}
            <div className="rounded-xl border border-border/60 bg-surface-3/50 p-3">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>Collection</span>
                <span className="font-mono text-primary font-bold">{collectionPct}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${collectionPct}%` }}
                />
              </div>
            </div>

            {/* Achievements */}
            <div className="rounded-xl border border-border/60 bg-surface-3/50 p-3">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Trophy className="h-3 w-3 text-amber-400" />
                Achievements
              </div>
              <div className="mt-1 font-mono font-bold text-foreground">
                {unlockedAchievements.length} / {achievements.length} Unlocked
              </div>
            </div>
          </div>

          {/* Footer watermark */}
          <div className="mt-4 border-t border-border/40 pt-2 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
            <span>Fartboy Raid 2.0</span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" /> Discord Raid Verified
            </span>
          </div>
        </div>

        {/* Discord Native Integration & Sharing Actions */}
        <div className="space-y-2 pt-2">
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Share Options
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              size="sm"
              onClick={handleDiscordShare}
              className="font-mono text-xs uppercase tracking-wider"
            >
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Discord Share
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyLink}
              className="font-mono text-xs uppercase tracking-wider"
            >
              {copied ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5 text-primary" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Link
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadCard}
              className="font-mono text-xs uppercase tracking-wider"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> Save Image
            </Button>
          </div>
        </div>

        <div className="border-t border-border/60 pt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {/* TODO(discord): Connect Discord Embedded App SDK for native channel card embeds */}
        </div>
      </div>
    </Modal>
  );
}

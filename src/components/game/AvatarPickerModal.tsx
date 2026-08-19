import { useState, useEffect, useRef } from "react";
import {
  Check,
  Sparkles,
  Disc,
  Upload,
  Image as ImageIcon,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";
import { useAuth } from "@/hooks/use-auth";
import { getOwnedAvatars, selectPlayerAvatar, type AvailableAvatar } from "@/services/player";
import { RaiderAvatar } from "./RaiderAvatar";
import { toast } from "sonner";
import { audio } from "@/services/audio";

interface AvatarPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Mode = "discord" | "upload" | "presets";

export function AvatarPickerModal({ open, onOpenChange }: AvatarPickerModalProps) {
  const player = useGameStore((s) => s.player);
  const setPlayer = useGameStore((s) => s.setPlayer);
  const { session } = useAuth();

  const [mode, setMode] = useState<Mode>("presets");
  const [avatars, setAvatars] = useState<AvailableAvatar[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>("");
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default discord avatar url from session or placeholder
  const discordAvatarUrl =
    session?.avatarUrl ||
    (session?.username
      ? `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(session.username)}`
      : "https://cdn.discordapp.com/embed/avatars/0.png");

  useEffect(() => {
    if (open) {
      getOwnedAvatars().then((list) => {
        setAvatars(list);
        if (player) {
          setSelectedUrl(player.avatar);
          if (player.avatar.startsWith("data:")) {
            setUploadedPreview(player.avatar);
            setMode("upload");
          } else if (player.avatar.includes("discord") || player.avatar === session?.avatarUrl) {
            setMode("discord");
          } else {
            setMode("presets");
          }
        }
      });
    }
  }, [open, player, session]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid JPEG or PNG image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setUploadedPreview(result);
        setSelectedUrl(result);
        setMode("upload");
        audio.play("button.click");
        toast.success("Custom avatar image loaded into preview!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApply = async () => {
    if (!selectedUrl) return;
    setLoading(true);
    audio.play("button.click");

    try {
      const updated = await selectPlayerAvatar(selectedUrl);
      setPlayer(updated);
      toast.success("Raider profile avatar updated successfully!");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update avatar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-amber-500/40 bg-slate-950 text-foreground shadow-2xl p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl font-black text-amber-400">
            <Sparkles className="h-5 w-5 text-amber-400" /> Edit / Change Raider Avatar
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Select an avatar method to update your profile icon across HQ, Raids, and Leaderboards.
          </DialogDescription>
        </DialogHeader>

        {/* Live Circular Avatar Preview */}
        <div className="my-3 flex items-center gap-4 rounded-2xl border border-amber-500/30 bg-slate-900/90 p-3.5">
          <div className="relative shrink-0">
            <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] bg-slate-950 flex items-center justify-center">
              <RaiderAvatar
                avatar={selectedUrl || player?.avatar}
                sizeClassName="h-full w-full rounded-full"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 rounded-full bg-amber-400 px-1.5 py-0.2 text-[9px] font-black text-black">
              LIVE
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="font-display font-bold text-sm text-amber-300 truncate">
              {player?.username || "Raider Operative"}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              Source:{" "}
              <span className="text-amber-200 font-bold uppercase">
                {mode === "discord"
                  ? "Discord OAuth Sync"
                  : mode === "upload"
                    ? "Custom Image Upload"
                    : "Cosmetic Preset"}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
              Fits standard circular Raider silhouette frame.
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode("discord");
              setSelectedUrl(discordAvatarUrl);
              audio.play("button.click");
            }}
            className={`flex items-center justify-center gap-1 rounded-lg py-2 font-bold transition cursor-pointer ${
              mode === "discord"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Disc className="h-3.5 w-3.5" />
            <span>Discord</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("upload");
              if (uploadedPreview) setSelectedUrl(uploadedPreview);
              audio.play("button.click");
            }}
            className={`flex items-center justify-center gap-1 rounded-lg py-2 font-bold transition cursor-pointer ${
              mode === "upload"
                ? "bg-amber-500 text-black shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Custom Upload</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("presets");
              if (avatars.length > 0 && !selectedUrl.startsWith("data:")) {
                setSelectedUrl(avatars[0].url);
              }
              audio.play("button.click");
            }}
            className={`flex items-center justify-center gap-1 rounded-lg py-2 font-bold transition cursor-pointer ${
              mode === "presets"
                ? "bg-amber-400 text-black shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Presets</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="py-3">
          {/* 1. DISCORD TAB */}
          {mode === "discord" && (
            <div className="space-y-3 rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-4 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                <Disc className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-100">Sync Active Discord Avatar</div>
                <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
                  Automatically fetch and use your Discord profile picture linked to your account.
                </p>
              </div>

              <div className="flex justify-center pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedUrl(discordAvatarUrl);
                    audio.play("button.click");
                    toast.success("Discord avatar synced!");
                  }}
                  className="gap-1.5 font-mono text-xs border-indigo-500/50 bg-indigo-900/40 text-indigo-200 hover:bg-indigo-600 hover:text-white"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Re-sync Discord Avatar
                </Button>
              </div>
            </div>
          )}

          {/* 2. CUSTOM UPLOAD TAB */}
          {mode === "upload" && (
            <div className="space-y-3 rounded-xl border border-amber-500/30 bg-slate-900/60 p-4 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <ImageIcon className="h-6 w-6" />
              </div>

              <div>
                <div className="font-bold text-sm text-slate-100">Upload Local Avatar Image</div>
                <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
                  Select a PNG or JPEG file from your device. It will automatically crop to fit the
                  circular avatar frame.
                </p>
              </div>

              <div className="flex justify-center pt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 font-mono text-xs bg-amber-400 text-black hover:bg-amber-300 font-bold"
                >
                  <Upload className="h-3.5 w-3.5" /> Choose Image File (PNG/JPG)
                </Button>
              </div>
            </div>
          )}

          {/* 3. PRESETS TAB */}
          {mode === "presets" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {avatars.map((av) => {
                const isSelected = selectedUrl === av.url;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      setSelectedUrl(av.url);
                      audio.play("button.click");
                    }}
                    className={`relative flex flex-col items-center justify-between rounded-xl border p-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? "border-amber-400 bg-amber-500/20 shadow-md ring-2 ring-amber-400/40 scale-105"
                        : "border-slate-800 bg-slate-900 hover:border-amber-500/50 hover:bg-slate-800"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-amber-500/30">
                      <RaiderAvatar avatar={av.url} sizeClassName="h-full w-full rounded-full" />
                    </div>
                    <span className="mt-1 text-[10px] font-bold text-slate-200 text-center line-clamp-1">
                      {av.name}
                    </span>

                    {isSelected && (
                      <span className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-amber-400 text-black shadow">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="font-mono text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handleApply}
            disabled={loading || !selectedUrl}
            className="gap-1.5 font-bold font-mono text-xs bg-amber-400 text-black hover:bg-amber-300 shadow-md"
          >
            <UserCheck className="h-4 w-4" /> Apply Avatar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

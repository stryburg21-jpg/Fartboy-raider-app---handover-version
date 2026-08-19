import { useState } from "react";
import { User } from "lucide-react";

export interface RaiderAvatarProps {
  avatar?: string;
  username?: string;
  className?: string;
  sizeClassName?: string;
  fallbackIcon?: string;
}

export function isImageUrl(str?: string): boolean {
  if (!str) return false;
  const trimmed = str.trim();
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:") ||
    trimmed.includes(".png") ||
    trimmed.includes(".svg") ||
    trimmed.includes(".jpg") ||
    trimmed.includes(".webp") ||
    trimmed.includes("dicebear.com")
  );
}

export function RaiderAvatar({
  avatar = "/assets/avatar/base/fartboy-3d-raider.png",
  username = "Raider",
  className = "",
  sizeClassName = "h-11 w-11 text-2xl",
}: RaiderAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const isImg = isImageUrl(avatar) && !imageError;
  const avatarUrl = isImg ? avatar : "/assets/avatar/base/fartboy-3d-raider.png";

  return (
    <div
      className={`relative grid place-items-center rounded-xl bg-slate-900 border border-amber-500/30 shadow-inner overflow-hidden shrink-0 ${sizeClassName} ${className}`}
    >
      {imageError ? (
        <div className="flex flex-col items-center justify-center w-full h-full bg-slate-800 text-amber-400">
          <User className="h-2/3 w-2/3" />
        </div>
      ) : (
        <img
          src={avatarUrl}
          alt={username}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}

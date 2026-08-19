import type { Rarity } from "@/types/game";

export const rarityLabel: Record<Rarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  mythic: "Mythic",
};

export const rarityTextClass: Record<Rarity, string> = {
  common: "text-rarity-common",
  uncommon: "text-rarity-uncommon",
  rare: "text-rarity-rare",
  epic: "text-rarity-epic",
  legendary: "text-rarity-legendary",
  mythic: "text-rarity-mythic",
};

export const rarityBorderClass: Record<Rarity, string> = {
  common: "rarity-border-common",
  uncommon: "rarity-border-uncommon",
  rare: "rarity-border-rare",
  epic: "rarity-border-epic",
  legendary: "rarity-border-legendary",
  mythic: "rarity-border-mythic",
};

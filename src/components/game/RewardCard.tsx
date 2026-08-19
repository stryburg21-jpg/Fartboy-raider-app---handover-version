import type { RewardEntry } from "@/services/rewards";
import { rarityBorderClass, rarityTextClass } from "@/lib/rarity";

export function RewardCard({ reward }: { reward: RewardEntry }) {
  const borderCls = reward.rarity ? rarityBorderClass[reward.rarity] : "border-border";
  const textCls = reward.rarity ? rarityTextClass[reward.rarity] : "text-foreground";
  return (
    <div className={`flex w-40 shrink-0 flex-col rounded-xl border bg-card p-3 ${borderCls}`}>
      <div className="grid h-14 w-full place-items-center rounded-lg bg-surface-2 text-3xl">
        {reward.icon}
      </div>
      <div className={`mt-2 truncate font-semibold ${textCls}`}>{reward.name}</div>
      <div className="truncate text-[11px] text-muted-foreground">{reward.detail}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/80">
        {reward.kind}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

export type CurrencyType = "xp";

type CurrencyMeta = Record<CurrencyType, { label: string; icon: string; short: string }>;

export const CURRENCY_META: CurrencyMeta = {
  xp: { label: "Spendable XP", icon: "⚡", short: "XP" },
};

export interface CurrencyAmountProps {
  currency?: CurrencyType;
  amount?: number;
  originalAmount?: number;
  priceXP?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CurrencyAmount({
  currency = "xp",
  amount,
  originalAmount,
  priceXP,
  size = "md",
  className,
}: CurrencyAmountProps) {
  const activeCurrency = currency;
  const activeAmount = priceXP !== undefined ? priceXP : (amount ?? 0);

  const meta = CURRENCY_META[activeCurrency] ?? CURRENCY_META.xp;

  const sizeCls = size === "lg" ? "text-2xl" : size === "sm" ? "text-xs" : "text-base";

  return (
    <div className={cn("inline-flex items-baseline gap-1.5 font-mono", className)}>
      {originalAmount ? (
        <span className="text-xs text-muted-foreground line-through">
          {originalAmount.toLocaleString()} {meta.short}
        </span>
      ) : null}
      <span className="mr-0.5">{meta.icon}</span>
      <span className={cn("font-bold tabular-nums text-foreground", sizeCls)}>
        {activeAmount.toLocaleString()}
      </span>
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {meta.short}
      </span>
    </div>
  );
}

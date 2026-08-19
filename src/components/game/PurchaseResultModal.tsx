import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertCircle,
  Gift,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import type { ShopListing } from "@/types/game";

export interface PurchaseResult {
  success: boolean;
  message?: string;
  purchasedItem?: ShopListing | null;
  remainingBalance?: number;
}

interface PurchaseResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: PurchaseResult | null;
  onRetry?: () => void;
}

export function PurchaseResultModal({
  open,
  onOpenChange,
  result,
  onRetry,
}: PurchaseResultModalProps) {
  if (!result) return null;

  const isSuccess = result.success;
  const isPack = result.purchasedItem?.kind === "pack" || !!result.purchasedItem?.packGrantId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-2 border-border bg-surface-1 p-6 text-center space-y-5">
        <DialogHeader className="text-center space-y-2">
          {isSuccess ? (
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/10 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          ) : (
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-destructive/20 text-destructive border border-destructive/40 shadow-lg shadow-destructive/10">
              <AlertCircle className="h-10 w-10" />
            </div>
          )}

          <DialogTitle className="font-display text-2xl font-black tracking-tight text-foreground">
            {isSuccess ? "Purchase Successful!" : "Purchase Failed"}
          </DialogTitle>

          <DialogDescription className="text-xs text-muted-foreground">
            {isSuccess ? "Transaction confirmed" : "Unable to complete transaction"}
          </DialogDescription>
        </DialogHeader>

        {/* DETAILS BODY */}
        {isSuccess ? (
          <div className="space-y-4">
            {/* ITEM CARD */}
            {result.purchasedItem && (
              <div className="rounded-xl border border-amber-500/40 bg-surface-2 p-4 flex items-center gap-3 text-left">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-surface-3 text-3xl border border-border">
                  {result.purchasedItem.iconEmoji ?? result.purchasedItem.image ?? "🎁"}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    {result.purchasedItem.kind === "pack" ? "Vault Pack Acquired" : "Item Acquired"}
                  </span>
                  <h4 className="font-display text-sm font-extrabold text-foreground truncate">
                    {result.purchasedItem.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {result.purchasedItem.description}
                  </p>
                </div>
              </div>
            )}

            {/* REMAINING CURRENCY */}
            {result.remainingBalance !== undefined && (
              <div className="flex items-center justify-between rounded-lg bg-surface-3/80 px-4 py-2.5 font-mono text-xs border border-border/60">
                <span className="text-muted-foreground font-semibold">Remaining Spendable XP:</span>
                <span className="font-extrabold text-amber-300">
                  {result.remainingBalance.toLocaleString()} XP
                </span>
              </div>
            )}

            <p className="text-xs text-muted-foreground leading-relaxed">
              {isPack
                ? "Your new pack has been delivered directly to your Pack Vault and is ready to open!"
                : "Your item has been placed into your equipment storage and is ready to equip."}
            </p>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {isPack ? (
                <Link
                  to="/packs"
                  search={{
                    tab: "stash",
                    highlightPack: result.purchasedItem?.packGrantId || result.purchasedItem?.id,
                  }}
                  className="w-full"
                  onClick={() => onOpenChange(false)}
                >
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-amber-400 hover:from-cyan-400 hover:to-amber-300 text-slate-950 font-mono text-xs font-black uppercase tracking-wider shadow-md cursor-pointer">
                    <Gift className="mr-1.5 h-4 w-4" /> Open Vault Now
                  </Button>
                </Link>
              ) : (
                <Link to="/character" className="w-full" onClick={() => onOpenChange(false)}>
                  <Button className="w-full bg-primary text-primary-foreground font-mono text-xs font-black uppercase tracking-wider shadow-md">
                    <Sparkles className="mr-1.5 h-4 w-4" /> Equip in HQ
                  </Button>
                </Link>
              )}

              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full font-mono text-xs font-bold uppercase tracking-wider"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        ) : (
          /* FAILURE BODY */
          <div className="space-y-4">
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-left space-y-1">
              <span className="font-mono text-[10px] font-bold text-destructive uppercase tracking-wider block">
                Error Reason
              </span>
              <p className="text-xs font-semibold text-foreground">
                {result.message || "Insufficient community XP or server processing error."}
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Please check your spendable balance or attempt the purchase again.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {onRetry && (
                <Button
                  onClick={onRetry}
                  className="w-full bg-primary text-primary-foreground font-mono text-xs font-bold uppercase tracking-wider"
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retry Purchase
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full font-mono text-xs font-bold uppercase tracking-wider"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

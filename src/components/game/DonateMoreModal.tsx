import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HeartHandshake,
  Sparkles,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Video,
  Image as ImageIcon,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { submitDonationIntent } from "@/services/contributor";
import { toast } from "sonner";

interface DonateMoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DonateMoreModal({ open, onOpenChange }: DonateMoreModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("wallet");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const mockSolAddress = "FartboyCTOPool11111111111111111111111111111111";

  const handleCopy = () => {
    navigator.clipboard.writeText(mockSolAddress);
    setCopied(true);
    toast.success("Solana address copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const amountToSubmit = customAmount ? parseFloat(customAmount) : selectedPreset;

  const handleSubmit = async () => {
    if (!amountToSubmit || amountToSubmit <= 0) {
      toast.error("Please enter a valid contribution amount.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitDonationIntent(amountToSubmit, selectedCategory);
      toast.success(res.message);
      onOpenChange(false);
    } catch {
      toast.error("Failed to process contribution submission.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-amber-500/40 bg-gradient-to-b from-surface-1 via-card to-card p-6 shadow-2xl space-y-5">
        <DialogHeader className="space-y-2 border-b border-border/60 pb-4 text-left">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-display font-black text-xl text-foreground">
                Boost Your Contributor Rank
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Support community growth, CTO raids, and ecosystem initiatives to unlock higher
                Raider tiers.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* CONTRIBUTION METHOD SELECTION */}
        <div className="space-y-3">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
            1. Select Contribution Channel
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => setSelectedCategory("wallet")}
              className={`rounded-xl border p-3 text-left space-y-1 transition-all cursor-pointer ${
                selectedCategory === "wallet"
                  ? "border-amber-400 bg-amber-500/15 ring-1 ring-amber-400/50"
                  : "border-border/60 bg-surface-2/40 hover:border-border"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Rocket className="h-4 w-4 text-amber-400" /> Wallet Transfer
              </div>
              <p className="text-[10px] text-muted-foreground">Direct SOL / Crypto contribution</p>
            </button>

            <button
              onClick={() => setSelectedCategory("cto_raid")}
              className={`rounded-xl border p-3 text-left space-y-1 transition-all cursor-pointer ${
                selectedCategory === "cto_raid"
                  ? "border-amber-400 bg-amber-500/15 ring-1 ring-amber-400/50"
                  : "border-border/60 bg-surface-2/40 hover:border-border"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                <Video className="h-4 w-4 text-purple-400" /> Content & Video
              </div>
              <p className="text-[10px] text-muted-foreground">Submit video edits & lore</p>
            </button>

            <button
              onClick={() => setSelectedCategory("meme")}
              className={`rounded-xl border p-3 text-left space-y-1 transition-all cursor-pointer ${
                selectedCategory === "meme"
                  ? "border-amber-400 bg-amber-500/15 ring-1 ring-amber-400/50"
                  : "border-border/60 bg-surface-2/40 hover:border-border"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <ImageIcon className="h-4 w-4 text-emerald-400" /> Meme Creation
              </div>
              <p className="text-[10px] text-muted-foreground">Original Fartboy meme posts</p>
            </button>
          </div>
        </div>

        {/* CONTRIBUTION AMOUNT SELECTOR */}
        <div className="space-y-3">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
            <span>2. Contribution Amount ($ / Pts)</span>
            <span className="text-amber-300 font-extrabold">Selected: ${amountToSubmit}</span>
          </label>

          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 100, 250].map((amt) => (
              <Button
                key={amt}
                type="button"
                variant={selectedPreset === amt && !customAmount ? "default" : "outline"}
                onClick={() => {
                  setSelectedPreset(amt);
                  setCustomAmount("");
                }}
                className={`font-mono text-xs font-extrabold h-10 ${
                  selectedPreset === amt && !customAmount
                    ? "bg-amber-400 text-black hover:bg-amber-300"
                    : "border-border hover:border-amber-400/50"
                }`}
              >
                ${amt}
              </Button>
            ))}
          </div>

          <Input
            type="number"
            placeholder="Or enter custom contribution amount ($)"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="font-mono text-xs bg-surface-2 border-border focus:border-amber-400"
          />
        </div>

        {/* SOLANA TREASURY ADDRESS ADDRESS */}
        {selectedCategory === "wallet" && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-400" /> Community Treasury Address (SOL)
              </span>
              <span className="text-[10px] text-muted-foreground">Solana Mainnet</span>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-border bg-background/80 p-2.5 font-mono text-xs">
              <span className="truncate text-foreground font-semibold flex-1">
                {mockSolAddress}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="h-8 px-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 shrink-0 gap-1"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        )}

        {/* NON-PAY TO WIN TRANSPARENCY NOTICE */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-surface-2 p-3 rounded-xl border border-border">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            <strong>100% Non-Pay-To-Win:</strong> Contributions strictly unlock cosmetic titles,
            badges, and pack allocations. Zero combat power advantage.
          </span>
        </div>

        {/* ACTION CTA */}
        <div className="flex justify-end gap-3 border-t border-border/60 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="font-mono text-xs font-bold"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="font-mono text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-400 text-black hover:from-amber-400 hover:to-amber-300 gap-2 px-6 shadow-md shadow-amber-500/20"
          >
            {submitting ? (
              "Confirming..."
            ) : (
              <>
                Confirm ${amountToSubmit} Contribution
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

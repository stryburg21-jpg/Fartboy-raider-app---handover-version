import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { isImageUrl } from "@/components/game/RaiderAvatar";
import { PackOpeningModal } from "@/components/game/PackOpeningModal";
import { Pack3DChest } from "@/components/game/Pack3DChest";
import { ProductDetailsModal } from "@/components/game/ProductDetailsModal";
import {
  Sparkles,
  Sword,
  Package,
  Zap,
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Shield,
  Gift,
  CheckCircle2,
  Disc,
  Hammer,
  Layers,
  RotateCcw,
  HelpCircle,
  MessageSquare,
  Target,
  Upload,
  Image as ImageIcon,
  UserCheck,
  RefreshCw,
  Crown,
  Dices,
  ExternalLink,
  Trophy,
  Flame,
  Trash2,
  Sparkle,
  X,
  Plus,
  Clock,
  Award,
  Calendar,
  TrendingUp,
  Anvil,
  ShoppingBag,
  Eye,
  ShieldCheck,
  Percent,
  Clover,
  Radio,
  CheckCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { completeOnboarding, getOnboardingStatus, STARTER_AVATARS } from "@/services/onboarding";
import { OnboardingStep } from "@/components/onboarding/OnboardingStep";
import { AvatarSelector } from "@/components/onboarding/AvatarSelector";
import { AuthLoading } from "@/components/auth/AuthStates";
import { useGameStore } from "@/store/gameStore";
import { audio } from "@/services/audio";
import { selectPlayerAvatar } from "@/services/player";
import { getShopListings } from "@/services/shop";
import { toast } from "sonner";
import { getItem6StatBadges, getItem6Stats, calculateActive6Stats } from "@/utils/itemStats";
import type { Item, ItemStats, Pack, ShopListing, EquipmentSlot } from "@/types/game";

export const Route = createFileRoute("/onboarding")({
  validateSearch: (search: Record<string, unknown>) => ({
    replay: Boolean(search.replay),
  }),
  head: () => ({
    meta: [
      { title: "Game Loop Quest — Fartboy Raid 2.0" },
      {
        name: "description",
        content:
          "Interactive hands-on Game Loop Quest: Avatar setup, Discord missions, Raid Shop, pack unboxing, forge workbench, and gear equipping.",
      },
    ],
  }),
  component: OnboardingPage,
});

const TOTAL_STEPS = 6;

type AvatarMode = "discord" | "upload" | "presets";

// Unboxed tutorial items available in Step 4 & 5
const TUTORIAL_UNBOXED_BOOTS: Item = {
  id: "item_tut_video_boots",
  name: "Video Specialist Boots Beta",
  slot: "feet",
  rarity: "legendary",
  power: 15000,
  raidPower: 850,
  bonusXP: 15,
  image: "🥾",
  description:
    "High-velocity cybernetic combat boots tailored for viral content raids. Directly enhances total Raider POWER.",
  stats: {
    generalXP: 15,
    raidXP: 12,
    ctoXP: 18,
    missionsXP: 10,
    graphicXP: 8,
    luck: 10,
  },
  level: 1,
  set: "Video Specialist Set",
};

const TUTORIAL_UNBOXED_MEME_USB: Item = {
  id: "item_tut_meme_usb",
  name: "Meme Template USB",
  slot: "powerItem",
  rarity: "epic",
  power: 6500,
  raidPower: 350,
  bonusXP: 10,
  image: "💾",
  description:
    "High-speed flash drive preloaded with encrypted high-yield meme templates for community raids.",
  stats: {
    generalXP: 8,
    raidXP: 5,
    ctoXP: 10,
    missionsXP: 6,
    graphicXP: 15,
    luck: 8,
  },
  level: 1,
  set: "Crypto Memetics Set",
};

const TUTORIAL_PACK: Pack = {
  id: "pack_raider",
  name: "Tutorial Supply Pack",
  cost: 0,
  image: "📦",
  description: "Specialist Starter Supply Pack with guaranteed Legendary gear drop!",
  configId: "pack_raider",
};

export function OnboardingPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { status, session } = useAuth();
  const player = useGameStore((s) => s.player);
  const equipItem = useGameStore((s) => s.equipItem);
  const addXp = useGameStore((s) => s.addXp);
  const setPlayer = useGameStore((s) => s.setPlayer);
  const startTutorialSandbox = useGameStore((s) => s.startTutorialSandbox);
  const finishTutorialAndClaimReward = useGameStore((s) => s.finishTutorialAndClaimReward);
  const sandboxXP = useGameStore((s) => s.sandboxXP);
  const isTutorialMode = useGameStore((s) => s.isTutorialMode);

  // Robust Numeric State Guards preventing any NaN values
  const safePower =
    typeof player?.power === "number" && !isNaN(player.power) ? player.power : 127890;
  const safeSpendableXP =
    typeof player?.spendableXP === "number" && !isNaN(player.spendableXP)
      ? player.spendableXP
      : typeof player?.xp === "number" && !isNaN(player.xp)
        ? player.xp
        : 50000;

  useEffect(() => {
    startTutorialSandbox();
  }, [startTutorialSandbox]);

  const onboarding = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: getOnboardingStatus,
  });

  const [step, setStep] = useState(0);

  // STEP 1: Avatar Selection
  const [avatarMode, setAvatarMode] = useState<AvatarMode>("presets");
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("gasmask");
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const discordAvatarUrl =
    session?.avatarUrl ||
    (session?.username
      ? `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(session.username)}`
      : "https://cdn.discordapp.com/embed/avatars/0.png");

  // STEP 2: Missions Simulation
  const [missionSimulated, setMissionSimulated] = useState(false);
  const [showXpPop, setShowXpPop] = useState(false);

  // STEP 3: The Raid Shop & Pack Vault
  const [shopPacks, setShopPacks] = useState<ShopListing[]>([]);
  const [inspectingPack, setInspectingPack] = useState<ShopListing | null>(null);
  const [hasInspectedShop, setHasInspectedShop] = useState(false);

  useEffect(() => {
    getShopListings().then((listings) => {
      setShopPacks(listings.filter((l) => l.kind === "pack"));
    });
  }, []);

  // STEP 4: Interactive Pack Unboxing Modal
  const [packModalOpen, setPackModalOpen] = useState(false);
  const [unboxedItems, setUnboxedItems] = useState<Item[]>([
    TUTORIAL_UNBOXED_BOOTS,
    TUTORIAL_UNBOXED_MEME_USB,
  ]);
  const [hasOpenedPack, setHasOpenedPack] = useState(false);

  // STEP 5: Forge Workbench Sandbox States & Inventory Picker
  type OnboardingForgeSection = "upgrade" | "reroll" | "fusion" | "dismantle";
  const [onboardingForgeSection, setOnboardingForgeSection] =
    useState<OnboardingForgeSection>("upgrade");
  const [selectedAnvilItem, setSelectedAnvilItem] = useState<Item | null>(null);
  const [forgeItem, setForgeItem] = useState<Item>(TUTORIAL_UNBOXED_BOOTS);
  const [hasLeveledUp, setHasLeveledUp] = useState(false);
  const [hasRerolled, setHasRerolled] = useState(false);
  const [hasDismantled, setHasDismantled] = useState(false);

  // STEP 6: Equip & Stat Enhancement States (HQ Integration)
  const [isEquipped, setIsEquipped] = useState(false);
  const [showStatPop, setShowStatPop] = useState(false);

  // Final Celebration Modal State
  const [showCelebration, setShowCelebration] = useState(false);
  const [finishing, setFinishing] = useState(false);

  // Auto-load item if user arrives at Step 5 without choosing
  const handleSelectDrawerItem = (item: Item) => {
    audio.play("button.click");
    setSelectedAnvilItem(item);
    setForgeItem(item);
    toast.success(`Loaded ${item.name} onto the Blacksmith Anvil!`);
  };

  // STEP 6: Equip Action
  const handleEquipTestItem = useCallback(() => {
    audio.play("item.equip");
    setIsEquipped(true);
    setShowStatPop(true);
    const slotKey: EquipmentSlot = "feet";
    equipItem(slotKey, forgeItem.id);

    toast.success(`${forgeItem.name} equipped to BOOTS slot! Total POWER increased!`);

    setTimeout(() => {
      setShowStatPop(false);
    }, 3000);
  }, [equipItem, forgeItem]);

  // Auth & Onboarding Guard Redirects
  useEffect(() => {
    if (status === "unauthenticated") navigate({ to: "/login", replace: true });
  }, [status, navigate]);

  useEffect(() => {
    if (!search.replay && onboarding.data?.completed) {
      navigate({ to: "/hq", replace: true });
    }
  }, [onboarding.data, search.replay, navigate]);

  if (status !== "authenticated" || onboarding.isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <AuthLoading label="Loading Raider Game Loop Quest…" />
      </div>
    );
  }

  const activeAvatarUrl =
    avatarMode === "discord"
      ? discordAvatarUrl
      : avatarMode === "upload" && customAvatarUrl
        ? customAvatarUrl
        : STARTER_AVATARS.find((a) => a.id === selectedAvatarId)?.imageUrl ||
          "/assets/avatar/base/fartboy-3d-raider.png";

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG/JPEG/WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      if (result) {
        setCustomAvatarUrl(result);
        setAvatarMode("upload");
        audio.play("button.click");
        toast.success("Custom avatar image loaded successfully!");
      }
    };
    reader.readAsDataURL(file);
  };

  // STEP 2: Mission Reaction Handler
  const handleSimulateReaction = () => {
    if (missionSimulated) return;

    audio.play("achievement");
    setMissionSimulated(true);
    setShowXpPop(true);
    addXp(1500);

    toast.success(
      "✅ Discord Reaction Verified! +1,500 SP-XP credited to balance & total POWER increased!",
    );

    setTimeout(() => {
      setShowXpPop(false);
    }, 2500);
  };

  // STEP 3: Shop Pack Inspect Handler
  const handleInspectPack = (pack: ShopListing) => {
    audio.play("button.click");
    setInspectingPack(pack);
    setHasInspectedShop(true);
  };

  // STEP 4: Pack Unboxing Finish Callback
  const handlePackFinished = (pulled: Item[]) => {
    setHasOpenedPack(true);
    if (pulled.length > 0) {
      setUnboxedItems(pulled);
      setForgeItem(pulled[0]);
    }
    toast.success("Supply pack unboxed! Proceed to The Forge Workbench.");
  };

  // STEP 5: Forge Actions
  const handleForgeLevelUp = () => {
    if (!selectedAnvilItem) return;
    audio.play("forge.upgrade");
    setHasLeveledUp(true);
    setForgeItem((prev) => {
      const nextLevel = (prev.level || 1) + 1;
      const nextPower = (prev.power || 15000) + 2500;
      return {
        ...prev,
        level: nextLevel,
        power: nextPower,
        stats: {
          ...prev.stats,
          generalXP: (prev.stats?.generalXP || 15) + 5,
        },
      };
    });
    toast.success("Hammer struck! Item leveled up to Lv.2 (+2,500 POWER Boost)!");
  };

  const handleForgeReroll = () => {
    if (!selectedAnvilItem) return;
    audio.play("forge.reroll");
    setHasRerolled(true);
    setForgeItem((prev) => {
      const newStats: ItemStats = {
        generalXP: Math.floor(Math.random() * 15 + 10),
        raidXP: Math.floor(Math.random() * 10 + 5),
        ctoXP: Math.floor(Math.random() * 12 + 6),
        missionsXP: Math.floor(Math.random() * 10 + 5),
        graphicXP: Math.floor(Math.random() * 8 + 3),
        luck: Math.floor(Math.random() * 10 + 4),
      };
      return { ...prev, stats: newStats };
    });
    toast.success("Dice rolled! Sub-stat 6-stat multipliers re-randomized successfully!");
  };

  const handleForgeFusion = () => {
    if (!selectedAnvilItem) return;
    audio.play("forge.upgrade");
    setHasLeveledUp(true);
    setForgeItem((prev) => ({
      ...prev,
      rarity: "mythic",
      power: (prev.power || 15000) + 5000,
    }));
    toast.success("Rarity Fusion completed! Fused into Mythic tier (+5,000 POWER Boost).");
  };

  const handleForgeDismantle = () => {
    if (!selectedAnvilItem) return;
    audio.play("button.click");
    setHasDismantled(true);
    addXp(250);
    toast.success("Scrapped duplicate! +250 Spendable XP refunded to balance.");
  };

  // STEP 6: Finalize Onboarding & Show Celebration Modal
  const handleCompleteWalkthrough = async () => {
    audio.play("quest.complete");
    setShowCelebration(true);

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#f59e0b", "#fbbf24", "#06b6d4", "#38bdf8", "#818cf8"],
    });
  };

  const handleFinalizeRedirect = async () => {
    setFinishing(true);
    try {
      await selectPlayerAvatar(activeAvatarUrl);
      if (player) {
        setPlayer({
          ...player,
          avatar: activeAvatarUrl,
        });
      }

      const rewardRes = await finishTutorialAndClaimReward({
        avatarId: avatarMode === "presets" ? selectedAvatarId : "custom",
        customAvatarUrl: activeAvatarUrl,
      });

      if (rewardRes.rewardGranted) {
        toast.success(rewardRes.rewardMessage);
      } else {
        toast.info(rewardRes.rewardMessage);
      }

      navigate({ to: "/hq", replace: true });
    } catch {
      navigate({ to: "/hq", replace: true });
    }
  };

  const next = () => {
    audio.play("button.click");
    setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  };

  const back = () => {
    audio.play("button.click");
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-foreground overflow-x-hidden">
      {/* Ambient Neon Atmosphere */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-6 sm:px-6">
        {/* Header Bar with Live Numeric State Guards */}
        <header className="mb-4 flex items-center justify-between border-b border-amber-500/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 font-display font-black text-black text-sm shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              ⚡
            </div>
            <div>
              <div className="font-display font-black text-sm text-amber-300 flex items-center gap-2">
                <span>Fartboy Raid 2.0</span>
                <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-2 py-0.2 text-[9px] font-mono font-bold text-amber-300">
                  TUTORIAL
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Interactive Game Loop Quest
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Header Metrics (POWER & Spendable XP) */}
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
              <div className="rounded-lg bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-amber-300 flex items-center gap-1.5 shadow-sm">
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span>POWER: {safePower.toLocaleString()}</span>
              </div>
              <div className="rounded-lg bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 text-cyan-300 flex items-center gap-1.5 shadow-sm">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                <span>SP-XP: {safeSpendableXP.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinalizeRedirect}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-mono text-xs font-bold text-slate-400 hover:border-amber-500/40 hover:text-amber-300 transition cursor-pointer"
            >
              Skip to HQ
            </button>
          </div>
        </header>

        {/* NARRATIVE & VALUE FRAMING: GAME LOOP BANNER */}
        <div className="mb-5 rounded-2xl border border-amber-500/30 bg-slate-900/90 p-4 shadow-xl">
          <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5 mb-2.5">
            <div className="flex items-center gap-1.5 font-display font-bold text-xs text-amber-400 uppercase tracking-wider">
              <Trophy className="h-4 w-4 text-amber-400" /> Core Game Loop Mechanics
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-cyan-400/20 px-2.5 py-0.5 text-[9px] font-mono font-bold text-cyan-300 border border-cyan-400/40">
                SP-XP: {safeSpendableXP.toLocaleString()}
              </span>
              <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[9px] font-mono font-bold text-amber-300 border border-amber-400/40">
                POWER: {safePower.toLocaleString()}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
            Complete community raid missions to earn{" "}
            <strong className="text-cyan-300">Spendable XP</strong>, purchase and unbox digital gear
            packs in the Shop, forge equipment on the Blacksmith Anvil, and maximize your total{" "}
            <strong className="text-amber-300">Raider POWER</strong> on global leaderboards!
          </p>

          {/* Interactive Stepper Visual Flow (6 Steps) */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center font-mono text-[9px]">
            <div
              className={`rounded-lg p-1.5 border transition ${step === 0 ? "border-amber-400 bg-amber-500/20 text-amber-300 font-bold" : "border-slate-800 bg-slate-950 text-slate-500"}`}
            >
              1. Identity
            </div>
            <div
              className={`rounded-lg p-1.5 border transition ${step === 1 ? "border-amber-400 bg-amber-500/20 text-amber-300 font-bold" : "border-slate-800 bg-slate-950 text-slate-500"}`}
            >
              2. Missions
            </div>
            <div
              className={`rounded-lg p-1.5 border transition ${step === 2 ? "border-amber-400 bg-amber-500/20 text-amber-300 font-bold" : "border-slate-800 bg-slate-950 text-slate-500"}`}
            >
              3. Shop
            </div>
            <div
              className={`rounded-lg p-1.5 border transition ${step === 3 ? "border-amber-400 bg-amber-500/20 text-amber-300 font-bold" : "border-slate-800 bg-slate-950 text-slate-500"}`}
            >
              4. Unbox
            </div>
            <div
              className={`rounded-lg p-1.5 border transition ${step === 4 ? "border-amber-400 bg-amber-500/20 text-amber-300 font-bold" : "border-slate-800 bg-slate-950 text-slate-500"}`}
            >
              5. Forge
            </div>
            <div
              className={`rounded-lg p-1.5 border transition ${step === 5 ? "border-amber-400 bg-amber-500/20 text-amber-300 font-bold" : "border-slate-800 bg-slate-950 text-slate-500"}`}
            >
              6. Equip
            </div>
          </div>
        </div>

        {/* Step Progress Bar (6 Steps) */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-amber-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> QUEST STEP {step + 1} OF {TOTAL_STEPS}
            </span>
            <span className="text-slate-300">
              {step === 0 && "1. Avatar & Identity Setup"}
              {step === 1 && "2. Missions & Bounty Directives"}
              {step === 2 && "3. The Raid Shop & Pack Vault"}
              {step === 3 && "4. Interactive Pack Unboxing"}
              {step === 4 && "5. The Raider Forge Workbench"}
              {step === 5 && "6. Equip Gear & Maximize POWER"}
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === step
                    ? "bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                    : idx < step
                      ? "bg-amber-500/40"
                      : "bg-slate-900 border border-slate-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Step Sandbox Views */}
        <main className="flex-1">
          {/* ==========================================
              STEP 1: AVATAR & IDENTITY SETUP
             ========================================== */}
          {step === 0 && (
            <OnboardingStep
              key="s0"
              eyebrow="Quest Step 1 · Raider Identity"
              title="Avatar & Identity Setup"
              subtitle="Configure your Raider profile identity. Your call-sign and avatar represent you on Community Raids, Global Leaderboards, and Bounty logs."
              footer={
                <PrimaryButton onClick={next}>
                  Next: Missions & Bounty Directives <ArrowRight className="h-4 w-4" />
                </PrimaryButton>
              }
            >
              <div className="space-y-4">
                {/* Action Prompt */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-mono text-amber-300 flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Action:</strong> Select your avatar preset, connect Discord, or upload
                    custom art, then proceed to Missions.
                  </span>
                </div>

                {/* Live Circular Avatar Card */}
                <div className="flex items-center gap-4 rounded-2xl border border-amber-500/40 bg-slate-900 p-4 shadow-xl">
                  <div className="relative shrink-0">
                    <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.5)] bg-slate-950 flex items-center justify-center">
                      <img
                        src={activeAvatarUrl}
                        alt="Raider Avatar"
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="absolute -bottom-1 -right-1 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black text-black shadow">
                      LV 1
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold text-base text-amber-300 truncate">
                      {player?.username || "Raider Operative"}
                    </div>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">
                      Selected Identity:{" "}
                      <span className="text-amber-200 font-bold uppercase">
                        {avatarMode === "discord"
                          ? "Synced Discord Avatar"
                          : avatarMode === "upload"
                            ? "Custom Image Upload"
                            : "Cosmetic Preset"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 font-mono text-[10px]">
                      <span className="text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                        POWER: {safePower.toLocaleString()}
                      </span>
                      <span className="text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                        SP-XP: {safeSpendableXP.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Avatar Selection Mode Tabs */}
                <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarMode("discord");
                      audio.play("button.click");
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 font-bold transition cursor-pointer ${
                      avatarMode === "discord"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Disc className="h-4 w-4" /> Discord
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAvatarMode("upload");
                      audio.play("button.click");
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 font-bold transition cursor-pointer ${
                      avatarMode === "upload"
                        ? "bg-amber-500 text-black shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Upload className="h-4 w-4" /> Upload
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAvatarMode("presets");
                      audio.play("button.click");
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 font-bold transition cursor-pointer ${
                      avatarMode === "presets"
                        ? "bg-amber-400 text-black shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Sparkles className="h-4 w-4" /> Presets
                  </button>
                </div>

                {/* Mode Controls Container */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                  {avatarMode === "discord" && (
                    <div className="space-y-3 text-center py-2">
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                        <Disc className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground">
                          Sync Active Discord Avatar
                        </div>
                        <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                          Pulls your authenticated Discord account profile picture for seamless
                          community identity.
                        </p>
                      </div>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            audio.play("button.click");
                            toast.success("Discord profile avatar synced!");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-900/40 px-4 py-2 font-mono text-xs font-bold text-indigo-200 hover:bg-indigo-600 hover:text-white transition cursor-pointer"
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Re-sync Discord Avatar
                        </button>
                      </div>
                    </div>
                  )}

                  {avatarMode === "upload" && (
                    <div className="space-y-3 text-center py-2">
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
                        <div className="font-bold text-sm text-foreground">
                          Upload Custom Avatar Image
                        </div>
                        <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                          Select a PNG or JPEG file from your local device.
                        </p>
                      </div>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 font-mono text-xs font-black text-black hover:bg-amber-300 transition shadow cursor-pointer"
                        >
                          <Upload className="h-4 w-4" /> Choose File (PNG/JPG)
                        </button>
                      </div>
                    </div>
                  )}

                  {avatarMode === "presets" && (
                    <AvatarSelector value={selectedAvatarId} onChange={setSelectedAvatarId} />
                  )}
                </div>

                <WhyCareCard reason="Your avatar displays alongside your total POWER on community raids, bounties, and global leaderboard rankings." />
              </div>
            </OnboardingStep>
          )}

          {/* ==========================================
              STEP 2: MISSIONS & XP REWARDS (INTERACTIVE SIMULATION)
             ========================================== */}
          {step === 1 && (
            <OnboardingStep
              key="s1"
              eyebrow="Quest Step 2 · Discord Bounty Verification"
              title="Missions & Bounty Directives"
              subtitle="Earn Spendable XP and increase your total POWER by completing community bounties across Daily (24h), Weekly (7-Day), and Season Directives."
              footer={
                <>
                  <PrimaryButton onClick={next} disabled={!missionSimulated}>
                    Next: The Raid Shop & Pack Vault <ArrowRight className="h-4 w-4" />
                  </PrimaryButton>
                  <GhostButton onClick={back}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </GhostButton>
                </>
              }
            >
              <div className="space-y-4">
                {/* Action Prompt */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-mono text-amber-300 flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Action:</strong> Simulate verifying a Discord raid mission with ✅ to
                    collect starter Spendable XP and boost your POWER.
                  </span>
                </div>

                {/* 3 Mission Categories Visual Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="rounded-xl border border-amber-500/30 bg-slate-900/90 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400">
                      <Clock className="h-3.5 w-3.5" /> Daily (24h)
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Quick social actions & daily check-ins. Refreshes every 24 hours for steady
                      SP-XP.
                    </p>
                  </div>

                  <div className="rounded-xl border border-cyan-500/30 bg-slate-900/90 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-cyan-300">
                      <Award className="h-3.5 w-3.5" /> Weekly (7-Day)
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      7-day raid campaigns & community team bounties. Resets weekly for major POWER
                      gains.
                    </p>
                  </div>

                  <div className="rounded-xl border border-purple-500/30 bg-slate-900/90 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-purple-300">
                      <Flame className="h-3.5 w-3.5" /> Season Directives
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Long-term seasonal milestones unlocking exclusive gear sets and titles.
                    </p>
                  </div>
                </div>

                {/* Live Dossier Mission Card */}
                <div className="relative rounded-2xl border-2 border-amber-500/50 bg-slate-900/90 p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-400">
                      <Target className="h-4 w-4" /> DAILY COMMUNITY BOUNTY #104
                    </div>
                    <span className="rounded-full bg-indigo-500/20 border border-indigo-500/40 px-2.5 py-0.5 text-[9px] font-mono font-bold text-indigo-300">
                      #raid-announcements
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-base text-foreground">
                      CTO Tweet Raid: Retweet & Like CTO Announcement
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                      Interact with the official raid post on Twitter/X, then react with{" "}
                      <strong className="text-emerald-400 font-bold">✅</strong> in the designated
                      Discord channel to claim your reward.
                    </p>
                  </div>

                  {/* Rewards Row */}
                  <div className="flex items-center gap-2 text-xs font-mono font-bold">
                    <div className="rounded-lg bg-cyan-400/10 border border-cyan-400/30 px-2.5 py-1 text-cyan-300">
                      💎 +1,500 SP-XP (SPENDABLE)
                    </div>
                    <div className="rounded-lg bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 text-amber-300">
                      ⚡ +500 RAID POWER
                    </div>
                  </div>

                  {/* Simulation Interactive Button */}
                  <div className="pt-2">
                    {!missionSimulated ? (
                      <button
                        type="button"
                        onClick={handleSimulateReaction}
                        className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 font-mono text-xs font-black text-black shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:from-amber-300 hover:to-amber-400 active:scale-95 transition cursor-pointer"
                      >
                        <Zap className="h-4 w-4 fill-black" /> Simulate Discord ✅ Reaction
                      </button>
                    ) : (
                      <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/50 p-3 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 shadow">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                        <span>✅ DISCORD REACTION VERIFIED & SP-XP CREDITED TO BALANCE!</span>
                      </div>
                    )}
                  </div>

                  {/* Floating +1500 XP Animation */}
                  {showXpPop && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-2xl bg-amber-400 px-6 py-3 font-display font-black text-black text-lg shadow-[0_0_40px_rgba(245,158,11,0.9)] animate-bounce text-center">
                      💎 +1,500 SP-XP CREDITED!
                      <div className="text-xs font-mono font-bold mt-0.5 text-black">
                        POWER INCREASED!
                      </div>
                    </div>
                  )}
                </div>

                <WhyCareCard reason="You do NOT need to upload files or screenshots inside the app! Reacting with ✅ in Discord automatically issues your SP-XP and boosts your POWER." />
              </div>
            </OnboardingStep>
          )}

          {/* ==========================================
              STEP 3: THE RAID SHOP & PACK VAULT (WITH TACTILE PACK JIGGLE)
             ========================================== */}
          {step === 2 && (
            <OnboardingStep
              key="s2"
              eyebrow="Quest Step 3 · Raid Shop & Pack Vault"
              title="The Raid Shop & Pack Vault"
              subtitle="Spend your earned Spendable XP in the Shop to acquire equipment Packs. Inspect pack contents, drop probability rates, and the Pity System guarantee mechanics."
              footer={
                <>
                  <PrimaryButton onClick={next}>
                    Next: Interactive Pack Unboxing <ArrowRight className="h-4 w-4" />
                  </PrimaryButton>
                  <GhostButton onClick={back}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </GhostButton>
                </>
              }
            >
              <div className="space-y-4">
                {/* Action Prompt */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-mono text-amber-300 flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Action:</strong> Inspect the available Supply Packs below, check the
                    drop rates and Pity System guarantees, then claim your Tutorial Supply Pack.
                  </span>
                </div>

                {/* Live 3D Pack Chests Showcase with Micro-Animations */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 overflow-visible">
                  {/* 1. Raider Pack */}
                  <div className="group rounded-2xl border border-cyan-500/40 bg-slate-900/90 p-4 flex flex-col items-center text-center shadow-xl space-y-3 transition-all hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] cursor-pointer overflow-visible">
                    <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold">
                      <span className="text-cyan-400 uppercase">RAIDER PACK</span>
                      <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-cyan-300 border border-cyan-500/30">
                        5,000 SP-XP
                      </span>
                    </div>

                    {/* Pack Container with Idle Shake & Interactive Touch Response */}
                    <div className="h-32 flex items-center justify-center animate-pack-shake transition-transform overflow-visible">
                      <Pack3DChest packId="shop_pack_raider" rarity="common" size="sm" />
                    </div>

                    <div className="w-full text-left space-y-1">
                      <div className="font-bold text-xs text-foreground">Ancient Runic Vault</div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        Sealed foil pack with Common to Rare cosmetic items.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleInspectPack(
                          shopPacks.find((p) => p.id === "shop_pack_raider") || {
                            id: "shop_pack_raider",
                            name: "Raider Pack",
                            priceXP: 5000,
                            rarity: "common",
                            kind: "pack",
                            category: "Season 1",
                            categoryGroup: "Season 1 Packs",
                            currencyType: "XP",
                            description: "Sealed foil booster pack with ancient gear.",
                            probabilities: {
                              common: 0.65,
                              uncommon: 0.22,
                              rare: 0.08,
                              epic: 0.03,
                              legendary: 0.018,
                              mythic: 0.002,
                            },
                          },
                        )
                      }
                      className="w-full h-9 rounded-xl border border-cyan-500/40 bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 font-mono text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" /> Inspect Drop Rates
                    </button>
                  </div>

                  {/* 2. Specialist Pack */}
                  <div className="group rounded-2xl border border-purple-500/40 bg-slate-900/90 p-4 flex flex-col items-center text-center shadow-xl space-y-3 transition-all hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] cursor-pointer overflow-visible">
                    <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold">
                      <span className="text-purple-400 uppercase">SPECIALIST PACK</span>
                      <span className="rounded bg-purple-500/20 px-2 py-0.5 text-purple-300 border border-purple-500/30">
                        15,000 SP-XP
                      </span>
                    </div>

                    {/* Pack Container with Idle Shake & Interactive Touch Response */}
                    <div className="h-32 flex items-center justify-center animate-pack-shake transition-transform overflow-visible">
                      <Pack3DChest packId="shop_pack_specialist" rarity="epic" size="sm" />
                    </div>

                    <div className="w-full text-left space-y-1">
                      <div className="font-bold text-xs text-foreground">Target Specialist Set</div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        +150% RNG weighting boost on unowned set pieces.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleInspectPack(
                          shopPacks.find((p) => p.id === "shop_pack_specialist") || {
                            id: "shop_pack_specialist",
                            name: "Specialist Pack",
                            priceXP: 15000,
                            rarity: "epic",
                            kind: "pack",
                            category: "Season 1",
                            categoryGroup: "Season 1 Packs",
                            currencyType: "XP",
                            description: "Targeted gear collection pack with Epic guarantee.",
                            probabilities: {
                              common: 0.45,
                              uncommon: 0.3,
                              rare: 0.15,
                              epic: 0.075,
                              legendary: 0.023,
                              mythic: 0.002,
                            },
                          },
                        )
                      }
                      className="w-full h-9 rounded-xl border border-purple-500/40 bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 font-mono text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" /> Inspect Drop Rates
                    </button>
                  </div>

                  {/* 3. Legendary Raider Pack */}
                  <div className="group rounded-2xl border border-amber-500/50 bg-slate-900/90 p-4 flex flex-col items-center text-center shadow-xl space-y-3 transition-all hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] cursor-pointer overflow-visible">
                    <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold">
                      <span className="text-amber-400 uppercase">LEGENDARY PACK</span>
                      <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-300 border border-amber-500/30">
                        50,000 SP-XP
                      </span>
                    </div>

                    {/* Pack Container with Idle Shake & Interactive Touch Response */}
                    <div className="h-32 flex items-center justify-center animate-pack-shake transition-transform overflow-visible">
                      <Pack3DChest
                        packId="shop_pack_legendary_raider"
                        rarity="legendary"
                        size="sm"
                      />
                    </div>

                    <div className="w-full text-left space-y-1">
                      <div className="font-bold text-xs text-foreground">High-Tier Titan Armor</div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        Guaranteed Rare+ drops with 0% Common items.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleInspectPack(
                          shopPacks.find((p) => p.id === "shop_pack_legendary_raider") || {
                            id: "shop_pack_legendary_raider",
                            name: "Legendary Pack",
                            priceXP: 50000,
                            rarity: "legendary",
                            kind: "pack",
                            category: "Season 1",
                            categoryGroup: "Season 1 Packs",
                            currencyType: "XP",
                            description: "End-game pack with zero common items.",
                            probabilities: {
                              common: 0.0,
                              uncommon: 0.2,
                              rare: 0.5,
                              epic: 0.22,
                              legendary: 0.075,
                              mythic: 0.005,
                            },
                          },
                        )
                      }
                      className="w-full h-9 rounded-xl border border-amber-500/40 bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 font-mono text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" /> Inspect Drop Rates
                    </button>
                  </div>
                </div>

                {/* Inline Pity System & Drop Probability Guarantees */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-400">
                      <ShieldCheck className="h-4 w-4 text-amber-400" /> PITY SYSTEM GUARANTEES &
                      DROP RATES
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      PITY COUNTERS PERSIST
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="rounded-xl border border-purple-500/30 bg-slate-950 p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-300 font-bold">EPIC PITY GUARANTEE</span>
                        <span className="text-purple-400">10 PULLS</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Guarantees at least 1 Epic item within 10 opened packs if not rolled
                        naturally.
                      </p>
                    </div>

                    <div className="rounded-xl border border-amber-500/30 bg-slate-950 p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-300 font-bold">LEGENDARY PITY GUARANTEE</span>
                        <span className="text-amber-400">30 PULLS</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Guarantees at least 1 Legendary gear piece within 30 opened packs.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Inspect Details Modal */}
                {inspectingPack && (
                  <ProductDetailsModal
                    item={inspectingPack}
                    open={Boolean(inspectingPack)}
                    onOpenChange={(open) => {
                      if (!open) setInspectingPack(null);
                    }}
                  />
                )}

                <WhyCareCard reason="Packs are purchased using Spendable XP earned from Raids & Missions. Pity counters never reset on season rollovers." />
              </div>
            </OnboardingStep>
          )}

          {/* ==========================================
              STEP 4: INTERACTIVE PACK UNBOXING
             ========================================== */}
          {step === 3 && (
            <OnboardingStep
              key="s3"
              eyebrow="Quest Step 4 · Pack Vault Sandbox"
              title="Interactive Pack Unboxing"
              subtitle="Unbox your free Tutorial Supply Pack using the exact Pack Vault foil-tear unboxing modal to claim your starter gear piece."
              footer={
                <>
                  <PrimaryButton onClick={next} disabled={!hasOpenedPack}>
                    Next: The Raider Forge Workbench <ArrowRight className="h-4 w-4" />
                  </PrimaryButton>
                  <GhostButton onClick={back}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </GhostButton>
                </>
              }
            >
              <div className="space-y-4 text-center">
                {/* Action Prompt */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-mono text-amber-300 flex items-center gap-2 text-left">
                  <Target className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Action:</strong> Tap below to tear open the foil pack and reveal your
                    guaranteed Legendary gear.
                  </span>
                </div>

                {!hasOpenedPack ? (
                  <div className="group rounded-2xl border-2 border-amber-500/40 bg-slate-900 p-6 space-y-4 shadow-2xl transition hover:border-amber-400 hover:shadow-[0_0_35px_rgba(245,158,11,0.4)] overflow-visible">
                    {/* Continuous Idle Shake & Interactive Touch Response Sealed Pack Icon */}
                    <div className="relative mx-auto grid h-28 w-28 place-items-center rounded-3xl bg-gradient-to-br from-amber-500/30 via-amber-400/20 to-cyan-500/30 text-7xl shadow-[0_0_50px_rgba(245,158,11,0.5)] animate-pack-shake overflow-visible">
                      📦
                      <span className="absolute -top-1 -right-1 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black text-black">
                        FREE
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-lg text-foreground">
                        Tutorial Supply Pack
                      </h3>
                      <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Contains guaranteed Legendary digital gear pieces (`Video Specialist Boots
                        Beta` &amp; `Meme Template USB`) to boost your POWER.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPackModalOpen(true)}
                      className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 font-mono text-xs font-black text-black shadow-[0_0_24px_rgba(245,158,11,0.5)] transition hover:bg-amber-300 hover:animate-pack-shake active:scale-95 cursor-pointer"
                    >
                      <Gift className="h-4 w-4" /> Unbox Tutorial Supply Pack (Foil Tear)
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-amber-400 bg-slate-900 p-5 space-y-4 text-center shadow-xl">
                    <div className="inline-block rounded-full bg-amber-400/20 border border-amber-400/40 px-3 py-1 text-[10px] font-bold uppercase text-amber-300">
                      ✨ 2 UNBOXED DROPS READY FOR FORGE
                    </div>

                    {/* 2 Unboxed Items Showcase Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                      <div className="rounded-xl border border-amber-400/50 bg-slate-950 p-3 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl h-12 w-12 grid place-items-center rounded-lg bg-amber-500/20 border border-amber-400/40">
                            {TUTORIAL_UNBOXED_BOOTS.image}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-foreground">
                              {TUTORIAL_UNBOXED_BOOTS.name}
                            </div>
                            <div className="text-[10px] font-mono text-amber-300">
                              SLOT: BOOTS · POWER: +15,000
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {TUTORIAL_UNBOXED_BOOTS.description}
                        </p>
                      </div>

                      <div className="rounded-xl border border-purple-400/50 bg-slate-950 p-3 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl h-12 w-12 grid place-items-center rounded-lg bg-purple-500/20 border border-purple-400/40">
                            {TUTORIAL_UNBOXED_MEME_USB.image}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-foreground">
                              {TUTORIAL_UNBOXED_MEME_USB.name}
                            </div>
                            <div className="text-[10px] font-mono text-purple-300">
                              SLOT: POWER ITEM · POWER: +6,500
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {TUTORIAL_UNBOXED_MEME_USB.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Items added to your Inventory! Ready to
                      select on The Forge Anvil.
                    </div>
                  </div>
                )}

                {/* Real Pack Opening Modal */}
                <PackOpeningModal
                  pack={TUTORIAL_PACK}
                  open={packModalOpen}
                  onOpenChange={setPackModalOpen}
                  onFinished={handlePackFinished}
                />

                <WhyCareCard reason="High-rarity gear items give massive permanent POWER boosts and unique 6-stat multipliers." />
              </div>
            </OnboardingStep>
          )}

          {/* ==========================================
              STEP 5: THE FORGE WORKSHOP SANDBOX (WITH INVENTORY PICKER SIMULATION)
             ========================================== */}
          {step === 4 && (
            <OnboardingStep
              key="s4"
              eyebrow="Quest Step 5 · Blacksmith Workbench"
              title="The Raider Forge Workbench"
              subtitle="Master gear enhancement: Select unboxed items from your gear drawer, load them onto the Anvil, Level Up primary stats to boost POWER, and reroll 6-stat multipliers."
              footer={
                <>
                  <PrimaryButton
                    onClick={next}
                    disabled={!selectedAnvilItem || (!hasLeveledUp && !hasRerolled)}
                  >
                    Next: Equip Gear & Maximize POWER <ArrowRight className="h-4 w-4" />
                  </PrimaryButton>
                  <GhostButton onClick={back}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </GhostButton>
                </>
              }
            >
              <div className="space-y-4">
                {/* Action Prompt */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-mono text-amber-300 flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>
                    {!selectedAnvilItem ? (
                      <strong>
                        Action: Tap 'Video Specialist Boots Beta' in the Inventory Drawer below to
                        load it onto the Anvil.
                      </strong>
                    ) : (
                      <strong>
                        Action: Strike the anvil to Level Up your gear or Reroll sub-stats to boost
                        POWER.
                      </strong>
                    )}
                  </span>
                </div>

                {/* 1. INVENTORY PICKER DRAWER SIMULATION */}
                <div className="rounded-2xl border-2 border-slate-800 bg-slate-900/90 p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-300">
                      <Layers className="h-4 w-4 text-amber-400" /> INVENTORY GEAR DRAWER (UNBOXED
                      ITEMS)
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full animate-pulse">
                      {!selectedAnvilItem ? "TAP ITEM TO MOUNT" : "ITEM MOUNTED TO ANVIL"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Item 1: Video Specialist Boots Beta */}
                    <button
                      type="button"
                      onClick={() => handleSelectDrawerItem(TUTORIAL_UNBOXED_BOOTS)}
                      className={`p-3 rounded-xl border-2 text-left transition flex items-center gap-3 cursor-pointer ${
                        selectedAnvilItem?.id === TUTORIAL_UNBOXED_BOOTS.id
                          ? "border-amber-400 bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                          : "border-amber-500/40 bg-slate-950 hover:border-amber-400 hover:bg-slate-900"
                      }`}
                    >
                      <div className="text-3xl h-12 w-12 grid place-items-center rounded-xl bg-amber-500/20 border border-amber-400/50 shrink-0">
                        {TUTORIAL_UNBOXED_BOOTS.image}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-foreground flex items-center justify-between">
                          <span className="truncate">{TUTORIAL_UNBOXED_BOOTS.name}</span>
                          {selectedAnvilItem?.id === TUTORIAL_UNBOXED_BOOTS.id && (
                            <CheckCheck className="h-4 w-4 text-amber-400 shrink-0" />
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-amber-300">
                          SLOT: BOOTS · POWER: +
                          {(TUTORIAL_UNBOXED_BOOTS.power || 15000).toLocaleString()}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate mt-0.5">
                          Tap to select for Level Up &amp; Stat Rerolls
                        </div>
                      </div>
                    </button>

                    {/* Item 2: Meme Template USB */}
                    <button
                      type="button"
                      onClick={() => handleSelectDrawerItem(TUTORIAL_UNBOXED_MEME_USB)}
                      className={`p-3 rounded-xl border-2 text-left transition flex items-center gap-3 cursor-pointer ${
                        selectedAnvilItem?.id === TUTORIAL_UNBOXED_MEME_USB.id
                          ? "border-purple-400 bg-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                          : "border-purple-500/40 bg-slate-950 hover:border-purple-400 hover:bg-slate-900"
                      }`}
                    >
                      <div className="text-3xl h-12 w-12 grid place-items-center rounded-xl bg-purple-500/20 border border-purple-400/50 shrink-0">
                        {TUTORIAL_UNBOXED_MEME_USB.image}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-foreground flex items-center justify-between">
                          <span className="truncate">{TUTORIAL_UNBOXED_MEME_USB.name}</span>
                          {selectedAnvilItem?.id === TUTORIAL_UNBOXED_MEME_USB.id && (
                            <CheckCheck className="h-4 w-4 text-purple-400 shrink-0" />
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-purple-300">
                          SLOT: POWER ITEM · POWER: +
                          {(TUTORIAL_UNBOXED_MEME_USB.power || 6500).toLocaleString()}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate mt-0.5">
                          Secondary high-yield multiplier relic
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. FORGE ANVIL WORKBENCH CARD */}
                <div className="rounded-2xl border-2 border-amber-500/50 bg-slate-900/90 p-5 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-400">
                      <Anvil className="h-4 w-4" /> BLACKSMITH FORGE ANVIL WORKBENCH
                    </div>
                    {selectedAnvilItem && (
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                          {forgeItem.rarity.toUpperCase()}
                        </span>
                        <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                          Lv. {forgeItem.level || 1}
                        </span>
                        <span className="rounded-full bg-cyan-400/20 border border-cyan-400/40 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 font-mono">
                          POWER: {(forgeItem.power || 15000).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedAnvilItem ? (
                    <>
                      {/* Active Item Display with Sleek 6-Stat Strip */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl shrink-0 grid h-14 w-14 place-items-center rounded-xl bg-slate-900 border border-amber-500/30">
                            {forgeItem.image}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-sm text-foreground">
                              {forgeItem.name}
                            </div>
                            <div className="text-xs text-slate-400 truncate">
                              {forgeItem.description}
                            </div>
                          </div>
                        </div>

                        {/* Horizontal 6-stat strip */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1.5 text-xs w-full text-left bg-black/40 rounded-xl border border-zinc-800/80 font-mono">
                          {getItem6StatBadges(forgeItem).map((badge, bIdx) => (
                            <div
                              key={bIdx}
                              className="rounded-xl bg-black/80 p-1.5 border border-amber-500/30 flex flex-col justify-center"
                            >
                              <div className="text-[8px] uppercase tracking-widest text-slate-400 truncate">
                                {badge.icon} {badge.label}
                              </div>
                              <div className="text-xs font-bold text-amber-300">{badge.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 4 Section Selector Tabs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setOnboardingForgeSection("upgrade")}
                          className={`p-2 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            onboardingForgeSection === "upgrade"
                              ? "border-amber-400 bg-amber-500/20 text-amber-300"
                              : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <TrendingUp className="h-3.5 w-3.5" /> 1. Level Up
                        </button>
                        <button
                          type="button"
                          onClick={() => setOnboardingForgeSection("reroll")}
                          className={`p-2 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            onboardingForgeSection === "reroll"
                              ? "border-purple-400 bg-purple-500/20 text-purple-300"
                              : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <Dices className="h-3.5 w-3.5" /> 2. Stat Reroll
                        </button>
                        <button
                          type="button"
                          onClick={() => setOnboardingForgeSection("fusion")}
                          className={`p-2 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            onboardingForgeSection === "fusion"
                              ? "border-sky-400 bg-sky-500/20 text-sky-300"
                              : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <Sparkles className="h-3.5 w-3.5" /> 3. Fusion Matrix
                        </button>
                        <button
                          type="button"
                          onClick={() => setOnboardingForgeSection("dismantle")}
                          className={`p-2 rounded-xl border font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            onboardingForgeSection === "dismantle"
                              ? "border-red-400 bg-red-500/20 text-red-300"
                              : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> 4. Dismantle
                        </button>
                      </div>

                      {/* Active Section Control Panel */}
                      {onboardingForgeSection === "upgrade" && (
                        <div className="rounded-xl border border-amber-500/30 bg-slate-950 p-3 space-y-2">
                          <div className="text-xs font-mono font-bold text-amber-300">
                            ⚡ LEVEL UP MATRIX (ITEM STAT &amp; POWER SCALING)
                          </div>
                          <p className="text-xs text-slate-400">
                            Upgrade item level from Lv.1 up to Lv.10 to scale primary stat
                            multipliers and increase total POWER.
                          </p>
                          <button
                            type="button"
                            onClick={handleForgeLevelUp}
                            className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-mono font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-300 transition active:scale-95 cursor-pointer"
                          >
                            ⚡ UPGRADE TO LEVEL {(forgeItem.level || 1) + 1} (+2,500 POWER BOOST — 0
                            XP TUTORIAL)
                          </button>
                        </div>
                      )}

                      {onboardingForgeSection === "reroll" && (
                        <div className="rounded-xl border border-purple-500/30 bg-slate-950 p-3 space-y-2">
                          <div className="text-xs font-mono font-bold text-purple-300">
                            🎲 STAT REROLL WORKBENCH
                          </div>
                          <p className="text-xs text-slate-400">
                            Re-randomize sub-stat multipliers (General XP, Raid XP, CTO XP, Luck)
                            with RNG dice rolls.
                          </p>
                          <button
                            type="button"
                            onClick={handleForgeReroll}
                            className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-black font-mono font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/20 hover:from-purple-400 hover:to-indigo-400 transition active:scale-95 cursor-pointer"
                          >
                            🎲 REROLL SUB-STATS (0 XP TUTORIAL) — [Rerolls Multipliers: 5%-25%]
                          </button>
                        </div>
                      )}

                      {onboardingForgeSection === "fusion" && (
                        <div className="rounded-xl border border-sky-500/30 bg-slate-950 p-3 space-y-2">
                          <div className="text-xs font-mono font-bold text-sky-300">
                            💥 RARITY FUSION MATRIX
                          </div>
                          <p className="text-xs text-slate-400">
                            Fuse matching duplicate items to evolve item rarity tier (Common -&gt;
                            Rare -&gt; Legendary -&gt; Mythic).
                          </p>
                          <button
                            type="button"
                            onClick={handleForgeFusion}
                            className="w-full h-11 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-black font-mono font-black text-xs uppercase tracking-wider shadow-lg shadow-sky-500/20 hover:from-sky-300 hover:to-blue-400 transition active:scale-95 cursor-pointer"
                          >
                            💥 FUSE INTO MYTHIC TIER (+5,000 POWER BOOST)
                          </button>
                        </div>
                      )}

                      {onboardingForgeSection === "dismantle" && (
                        <div className="rounded-xl border border-red-500/30 bg-slate-950 p-3 space-y-2">
                          <div className="text-xs font-mono font-bold text-red-300">
                            🗑️ DISMANTLE &amp; REFUND
                          </div>
                          <p className="text-xs text-slate-400">
                            Scrap duplicate or unneeded equipment to recover Spendable XP for future
                            upgrades.
                          </p>
                          <button
                            type="button"
                            onClick={handleForgeDismantle}
                            className="w-full h-11 rounded-xl bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 text-black font-mono font-black text-xs uppercase tracking-wider shadow-lg shadow-red-500/20 hover:from-red-400 hover:to-emerald-400 transition active:scale-95 cursor-pointer"
                          >
                            🗑️ DISMANTLE ITEM (+250 SP-XP REFUND)
                          </button>
                        </div>
                      )}

                      {/* Actions Checklist Tracker */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1.5 text-xs font-mono">
                        <div className="text-amber-400 font-bold mb-1">Sandbox Checklist:</div>
                        <div
                          className={hasLeveledUp ? "text-emerald-400 font-bold" : "text-slate-500"}
                        >
                          {hasLeveledUp ? "✓" : "○"} Level Up item in Level Up Matrix (+2,500 POWER)
                        </div>
                        <div
                          className={hasRerolled ? "text-emerald-400 font-bold" : "text-slate-500"}
                        >
                          {hasRerolled ? "✓" : "○"} Reroll sub-stats for optimal 6-stat multipliers
                        </div>
                        <div
                          className={
                            hasDismantled ? "text-emerald-400 font-bold" : "text-slate-500"
                          }
                        >
                          {hasDismantled ? "✓" : "○"} Dismantle duplicates for Spendable XP refunds
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Anvil Empty Placeholder */
                    <div className="py-8 text-center space-y-3 rounded-xl border border-dashed border-amber-500/30 bg-slate-950/60 p-6">
                      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-3xl animate-pulse">
                        ⚒️
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground">
                          Anvil Waiting for Item Selection
                        </div>
                        <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                          Tap{" "}
                          <strong className="text-amber-300">Video Specialist Boots Beta</strong> in
                          the inventory drawer above to mount it to the forge anvil.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <WhyCareCard reason="Upgrading gear directly scales your total Raider POWER and unlocks secondary multiplier slots without consuming any permanent rewards." />
              </div>
            </OnboardingStep>
          )}

          {/* ==========================================
              STEP 6: EQUIP & STAT ENHANCEMENT (FULL CHARACTER HQ INTEGRATION)
             ========================================== */}
          {step === 5 && (
            <OnboardingStep
              key="s5"
              eyebrow="Quest Step 6 · Character Loadout"
              title="Equip Gear & Maximize Raider POWER"
              subtitle="Equip your forged item onto your 7-slot Raider Loadout to activate active 6-stat multipliers, set synergies, and maximize your total POWER."
              footer={
                <>
                  <PrimaryButton onClick={handleCompleteWalkthrough} disabled={!isEquipped}>
                    Complete Walkthrough &amp; Enter HQ <Sword className="h-4 w-4" />
                  </PrimaryButton>
                  <GhostButton onClick={back}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </GhostButton>
                </>
              }
            >
              <div className="space-y-4">
                {/* Action Prompt */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-mono text-amber-300 flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>
                    {!isEquipped ? (
                      <strong>
                        Action: Tap 'Equip Video Specialist Boots Beta to BOOTS Slot' below to
                        maximize your total POWER.
                      </strong>
                    ) : (
                      <strong>
                        Action: Gear equipped to BOOTS slot! Proceed to enter the Character HQ.
                      </strong>
                    )}
                  </span>
                </div>

                {/* DIRECT HQ UI CONTEXT OVERLAY */}
                <div className="rounded-2xl border-2 border-slate-800 bg-slate-950 p-4 space-y-4 shadow-2xl">
                  {/* 1. HQ TOP STAT & RANK BAR */}
                  <div className="rounded-xl border border-amber-500/30 bg-slate-900/90 p-3 flex flex-wrap items-center justify-between gap-3 font-mono">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={activeAvatarUrl}
                          alt="Avatar"
                          className="h-11 w-11 rounded-full border-2 border-amber-400 object-cover shadow"
                        />
                        <span className="absolute -bottom-1 -right-1 rounded-full bg-amber-400 px-1.5 py-0.2 text-[8px] font-black text-black">
                          LV 1
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <span>{player?.username || "Raider Operative"}</span>
                          <span className="text-[9px] text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/30">
                            RANK 1 · PRIVATE
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          DIRECTIVES: Season 1 Active · Bounty #104 Complete
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <div className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-amber-300 font-bold border border-amber-500/40 shadow-sm">
                        ⚡ TOTAL POWER: {(safePower + (isEquipped ? 15000 : 0)).toLocaleString()}
                      </div>
                      <div className="rounded-lg bg-cyan-500/20 px-2.5 py-1 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm">
                        💎 SP-XP: {safeSpendableXP.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* 2. DIRECTIVES STRIP */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-slate-300 flex items-center justify-between">
                      <span className="text-slate-400">DAILY BOUNTY STREAK:</span>
                      <strong className="text-emerald-400">1 DAY (ACTIVE)</strong>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-slate-300 flex items-center justify-between">
                      <span className="text-slate-400">ACTIVE SET SYNERGY:</span>
                      <strong className="text-amber-300">
                        {isEquipped ? "1/7 VIDEO SPECIALIST" : "0/7 ACTIVE"}
                      </strong>
                    </div>
                  </div>

                  {/* 3. HIGHLIGHTED EQUIPMENT LOADOUT MODULE (7 SLOTS) */}
                  <div className="relative rounded-2xl border-2 border-amber-400 bg-slate-900/90 p-4 shadow-[0_0_35px_rgba(245,158,11,0.35)] space-y-3">
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-400">
                        <Shield className="h-4 w-4 text-amber-400" /> RAIDER EQUIPMENT LOADOUT (7
                        SLOTS)
                      </div>
                      <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black text-black uppercase shadow">
                        TARGET MODULE
                      </span>
                    </div>

                    {/* 7 Slots Grid accurately targeting the BOOTS (feet) slot */}
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center text-xs font-mono">
                      {/* Slot 1: HAT */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-500">
                        <div className="text-2xl opacity-60">🎩</div>
                        <div className="font-bold text-[9px] mt-1">HAT</div>
                        <div className="text-[8px]">EMPTY</div>
                      </div>

                      {/* Slot 2: TOP */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-500">
                        <div className="text-2xl opacity-60">👕</div>
                        <div className="font-bold text-[9px] mt-1">TOP</div>
                        <div className="text-[8px]">EMPTY</div>
                      </div>

                      {/* Slot 3: SHORTS */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-500">
                        <div className="text-2xl opacity-60">🩳</div>
                        <div className="font-bold text-[9px] mt-1">SHORTS</div>
                        <div className="text-[8px]">EMPTY</div>
                      </div>

                      {/* Slot 4: BOOTS (FEET) - ACCURATELY TARGETED */}
                      <div
                        className={`rounded-xl border-2 p-2 transition-all ${
                          isEquipped
                            ? "border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse"
                            : "border-dashed border-amber-500/60 bg-amber-950/30 text-amber-400 animate-bounce"
                        }`}
                      >
                        <div className="text-2xl">{isEquipped ? "🥾" : "🥾"}</div>
                        <div className="font-bold text-[9px] mt-1">BOOTS</div>
                        <div
                          className={`text-[8px] font-bold ${isEquipped ? "text-amber-300" : "text-amber-400"}`}
                        >
                          {isEquipped ? "EQUIPPED" : "READY"}
                        </div>
                      </div>

                      {/* Slot 5: CAPE */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-500">
                        <div className="text-2xl opacity-60">🦸</div>
                        <div className="font-bold text-[9px] mt-1">CAPE</div>
                        <div className="text-[8px]">EMPTY</div>
                      </div>

                      {/* Slot 6: PET */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-500">
                        <div className="text-2xl opacity-60">🐾</div>
                        <div className="font-bold text-[9px] mt-1">PET</div>
                        <div className="text-[8px]">EMPTY</div>
                      </div>

                      {/* Slot 7: POWER ITEM */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-500">
                        <div className="text-2xl opacity-60">⚡</div>
                        <div className="font-bold text-[9px] mt-1">POWER ITEM</div>
                        <div className="text-[8px]">EMPTY</div>
                      </div>
                    </div>

                    {/* Interactive Equip Button */}
                    <div className="pt-2">
                      {!isEquipped ? (
                        <button
                          type="button"
                          onClick={handleEquipTestItem}
                          className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 font-mono text-xs font-black text-black shadow-[0_0_24px_rgba(245,158,11,0.5)] transition hover:from-amber-300 hover:to-amber-400 active:scale-95 cursor-pointer"
                        >
                          <Shield className="h-4 w-4" /> Equip Video Specialist Boots Beta to BOOTS
                          Slot
                        </button>
                      ) : (
                        <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/50 p-3 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 shadow">
                          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                          <span>
                            BOOTS EQUIPPED! +15,000 POWER &amp; 6-STAT MULTIPLIERS ACTIVE ON RAIDER!
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Real-time Stat Surge Pop-up */}
                    {showStatPop && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-4 font-display font-black text-black text-base shadow-[0_0_50px_rgba(245,158,11,0.9)] animate-bounce text-center">
                        ⚡ RAIDER POWER SURGE!
                        <div className="text-xs font-mono font-bold mt-0.5">
                          +15,000 POWER · +18% CTO XP Multiplier Active
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <WhyCareCard reason="Equipping matching gear pieces to all 7 slots activates full set bonus visual auras and multiplies your leaderboard POWER." />
              </div>
            </OnboardingStep>
          )}
        </main>
      </div>

      {/* ==========================================
          FINAL CELEBRATION MODAL ("RAIDER ONBOARDED!")
         ========================================== */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="max-w-md w-full rounded-3xl border-2 border-amber-400 bg-slate-950 p-6 text-center space-y-5 shadow-[0_0_60px_rgba(245,158,11,0.6)]">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-amber-400 text-black text-4xl shadow-[0_0_30px_rgba(245,158,11,0.8)] animate-bounce">
              👑
            </div>

            <div>
              <div className="font-display font-black text-2xl text-amber-300">
                Raider Onboarded!
              </div>
              <p className="text-xs text-slate-300 mt-1">
                You have completed the Game Loop Quest and initialized your Raider loadout.
              </p>
            </div>

            {/* Profile Summary Card */}
            <div className="rounded-2xl border border-amber-500/40 bg-slate-900 p-4 space-y-3 text-left text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={activeAvatarUrl}
                  alt="Avatar"
                  className="h-12 w-12 rounded-full border-2 border-amber-400 object-cover shadow"
                />
                <div>
                  <div className="font-bold text-sm text-foreground">
                    {player?.username || "Raider Operative"}
                  </div>
                  <div className="text-[10px] text-amber-300 font-mono">
                    STATUS: READY FOR COMMUNITY RAIDS
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 font-mono">
                <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">TOTAL POWER</span>
                  <strong className="text-amber-300 text-sm">
                    {(safePower + 15000).toLocaleString()} POWER
                  </strong>
                </div>
                <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">EQUIPPED BOOTS</span>
                  <strong className="text-cyan-300 text-xs truncate block">
                    {TUTORIAL_UNBOXED_BOOTS.name}
                  </strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinalizeRedirect}
              disabled={finishing}
              className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 font-mono text-sm font-black text-black shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:bg-amber-300 transition cursor-pointer"
            >
              {finishing ? "Entering Character HQ…" : "Enter Character HQ"}{" "}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function WhyCareCard({ reason }: { reason: string }) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2 text-xs">
      <HelpCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
      <div>
        <span className="font-bold text-amber-300">Why should I care? </span>
        <span className="text-slate-300">{reason}</span>
      </div>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 font-mono text-xs font-black text-black shadow-[0_0_24px_rgba(245,158,11,0.4)] transition-all hover:bg-amber-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none cursor-pointer"
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-800 bg-transparent px-4 font-mono text-xs font-bold text-slate-400 transition-colors hover:bg-slate-900 hover:text-white disabled:opacity-50 cursor-pointer"
    >
      {children}
    </button>
  );
}

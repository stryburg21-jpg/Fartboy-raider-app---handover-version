import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/game/AppShell";
import { PageHeader } from "@/components/game/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  Sparkles,
  Vote,
  CheckCircle2,
  Clock,
  Flame,
  ShieldAlert,
  Crown,
  Layers,
  ArrowRight,
  ThumbsUp,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/roadmap")({
  component: RoadmapPage,
});

interface RoadmapItem {
  id: string;
  title: string;
  tag: string;
  category: "Upcoming" | "In Development" | "Under Consideration";
  votes: number;
  description: string;
  milestone: string;
  statusBadge: string;
  color: string;
}

const INITIAL_ROADMAP_ITEMS: RoadmapItem[] = [
  {
    id: "road-1",
    title: "Guild / Squad Raids & Shared Vaults",
    tag: "Multiplayer",
    category: "In Development",
    votes: 412,
    description:
      "Band together with squadmates to conquer multi-stage CTO raids and share exclusive guild cosmetics.",
    milestone: "Season 2: Q2 2026",
    statusBadge: "Active Build",
    color: "border-amber-500/40 bg-amber-950/20",
  },
  {
    id: "road-2",
    title: "Cosmetic Crafting & Dye Workshop",
    tag: "Cosmetics",
    category: "In Development",
    votes: 328,
    description:
      "Personalize armour palettes, trail effects, and runic shaders using earned raid fragments.",
    milestone: "Season 2: Q2 2026",
    statusBadge: "Design Phase",
    color: "border-purple-500/40 bg-purple-950/20",
  },
  {
    id: "road-3",
    title: "Live Discord Webhook Stream",
    tag: "Integrations",
    category: "Upcoming",
    votes: 285,
    description:
      "Instant in-app ticker showcasing real-time tweet snipes and verified raid triumphs directly from Discord.",
    milestone: "Mid-Season 1 Update",
    statusBadge: "Next Up",
    color: "border-cyan-500/40 bg-cyan-950/20",
  },
  {
    id: "road-4",
    title: "Season 2 Specialist Classes & Skill Trees",
    tag: "Progression",
    category: "Under Consideration",
    votes: 520,
    description:
      "Unlock branching passive mastery perks tailored to your preferred raiding playstyle (Scout, Tactician, Sniper).",
    milestone: "Season 2 Milestone",
    statusBadge: "Community Voting",
    color: "border-emerald-500/40 bg-emerald-950/20",
  },
];

export function RoadmapPage() {
  const [items, setItems] = useState<RoadmapItem[]>(INITIAL_ROADMAP_ITEMS);
  const [votedIds, setVotedIds] = useState<Record<string, boolean>>({});

  const handleVote = async (id: string) => {
    // TODO: Connect roadmap to live feature voting API POST /api/roadmap/vote
    if (votedIds[id]) {
      toast.info("You have already voted for this roadmap feature!");
      return;
    }

    setVotedIds((prev) => ({ ...prev, [id]: true }));
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, votes: it.votes + 1 } : it)));
    toast.success("🚀 Vote recorded! Thank you for shaping Fartboy Raid.");
  };

  return (
    <AppShell>
      <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 font-mono">
        <PageHeader
          title="ECOSYSTEM ROADMAP"
          subtitle="Community feature vision, development milestones, and live concept voting."
          badge="LIVING ROADMAP"
        />

        {/* HERO BANNER */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/60 bg-gradient-to-br from-amber-950/60 via-slate-950 to-slate-900 p-6 sm:p-8 shadow-[0_0_40px_rgba(245,158,11,0.25)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-black">
                <Rocket className="h-4 w-4" />
                <span>SHAPE THE FUTURE OF FARTBOY RAID</span>
              </div>
              <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-wide">
                EXPANDED FEATURES & RAID ECOSYSTEM
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm font-sans leading-relaxed">
                Vote on upcoming game features, track ongoing development sprints, and preview
                future season expansions.
              </p>
            </div>
            <Link to="/hq">
              <Button
                variant="outline"
                className="border-amber-500/50 text-amber-300 bg-amber-950/40 hover:bg-amber-500/20 font-black text-xs px-4 py-2 rounded-xl"
              >
                RETURN TO HQ
              </Button>
            </Link>
          </div>
        </div>

        {/* ROADMAP ITEMS GRID */}
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all hover:border-amber-400/60 ${item.color}`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-amber-300">
                    {item.tag}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{item.milestone}</span>
                </div>
                <h3 className="font-display font-black text-base text-white tracking-wide">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300/90 font-sans leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Vote className="h-4 w-4 text-amber-400" />
                  <span className="font-black text-white">{item.votes}</span>
                  <span>Supporters</span>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleVote(item.id)}
                  className={`font-black text-xs rounded-xl px-3 py-1 gap-1.5 cursor-pointer ${
                    votedIds[item.id]
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-300 shadow-md active:scale-95"
                  }`}
                >
                  {votedIds[item.id] ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>VOTED</span>
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>VOTE (+1)</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

import { cn } from "@/lib/utils";

export type RewardPipelineStage =
  | "discord-activity"
  | "spendable-xp"
  | "reward-eligible"
  | "pack-granted"
  | "pack-vault"
  | "open-pack"
  | "inventory";

export interface PipelineStep {
  stage: RewardPipelineStage;
  label: string;
  icon: string;
  hint: string;
}

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    stage: "discord-activity",
    label: "Discord Activity",
    icon: "💬",
    hint: "Raids, voice, memes and CTO work in Discord",
  },
  {
    stage: "spendable-xp",
    label: "Spendable XP Earned",
    icon: "⚡",
    hint: "Activity credits spendable XP",
  },
  {
    stage: "reward-eligible",
    label: "Reward Eligible",
    icon: "✅",
    hint: "Thresholds unlock a reward",
  },
  {
    stage: "pack-granted",
    label: "Pack Granted",
    icon: "🎁",
    hint: "Eligibility grants a pack — never loose items",
  },
  {
    stage: "pack-vault",
    label: "Pack Vault",
    icon: "🗄️",
    hint: "Packs wait unopened until you decide",
  },
  {
    stage: "open-pack",
    label: "Open Pack",
    icon: "📦",
    hint: "You open the pack manually",
  },
  {
    stage: "inventory",
    label: "Items Added To Inventory",
    icon: "🎒",
    hint: "Revealed items land in your inventory",
  },
];

export interface RewardPipelineProps {
  /** Stage(s) the current screen represents. */
  activeStage?: RewardPipelineStage | RewardPipelineStage[];
  className?: string;
  compact?: boolean;
}

export function RewardPipeline({ activeStage, className, compact = false }: RewardPipelineProps) {
  const active = new Set(
    activeStage ? (Array.isArray(activeStage) ? activeStage : [activeStage]) : [],
  );

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
        Reward flow
      </div>
      <ol className="flex flex-wrap items-stretch gap-1.5">
        {PIPELINE_STEPS.map((step, i) => {
          const isActive = active.has(step.stage);
          return (
            <li key={step.stage} className="flex items-stretch gap-1.5">
              <div
                title={step.hint}
                className={cn(
                  "flex flex-col justify-center rounded-sm border px-2.5 py-1.5",
                  isActive
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border bg-surface-1/60 text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-widest",
                    isActive ? "font-semibold text-primary" : "text-muted-foreground",
                  )}
                >
                  {step.icon} {step.label}
                </span>
                {!compact && isActive ? (
                  <span className="mt-0.5 text-[10px] text-muted-foreground">{step.hint}</span>
                ) : null}
              </div>
              {i < PIPELINE_STEPS.length - 1 ? (
                <span className="self-center font-mono text-[10px] text-muted-foreground">→</span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

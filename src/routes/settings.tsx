import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/game/AppShell";
import { PageHeader } from "@/components/game/PageHeader";
import { resetOnboarding } from "@/services/onboarding";
import { logout } from "@/services/auth";
import { PlayCircle, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const navigate = useNavigate();

  const handleReplayTutorial = async () => {
    await resetOnboarding();
    navigate({ to: "/onboarding", search: { replay: true } });
  };

  const handleSignOut = async () => {
    toast.info("Signing out of Raider session...");
    await logout();
    navigate({ to: "/login", replace: true });
  };

  return (
    <AppShell>
      <PageHeader title="Settings" subtitle="Preferences, game tutorial replay, and account." />
      <div className="space-y-4">
        <Section title="Game & Onboarding">
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm font-semibold">Replay Game Introduction</div>
              <div className="text-xs text-muted-foreground">
                Revisit the 6-step raider onboarding, tutorial, and starter pack flow.
              </div>
            </div>
            <button
              type="button"
              onClick={handleReplayTutorial}
              className="flex items-center gap-1.5 rounded-lg border border-primary bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition cursor-pointer"
            >
              <PlayCircle className="h-4 w-4" /> Replay Tutorial
            </button>
          </div>
        </Section>

        <Section title="Account">
          <Row label="Discord" value="Connected as Raider" action="Manage" />
          <Row label="Wallet" value="Not connected" action="Connect" />
        </Section>
        <Section title="Notifications">
          <Row label="Mission alerts" value="Enabled" action="Toggle" />
          <Row label="Raid pings" value="Enabled" action="Toggle" />
        </Section>
        <Section title="Danger Zone">
          <Row
            label="Sign out"
            value="Clear local raider session and return to login screen"
            action="Sign out"
            onAction={handleSignOut}
            isDestructive
          />
        </Section>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-3 font-display font-bold">{title}</h3>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  action,
  onAction,
  isDestructive,
}: {
  label: string;
  value: string;
  action: string;
  onAction?: () => void;
  isDestructive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm font-semibold">{label}</div>
        {value && <div className="text-xs text-muted-foreground">{value}</div>}
      </div>
      <button
        type="button"
        onClick={onAction}
        className={`rounded-md border px-3 py-1.5 text-xs font-semibold cursor-pointer transition ${
          isDestructive
            ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
            : "border-border bg-surface-2 hover:border-primary hover:text-primary"
        }`}
      >
        {action}
      </button>
    </div>
  );
}

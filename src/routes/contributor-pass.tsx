import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/game/AppShell";
import { ContributorPassHub } from "@/components/game/ContributorPassHub";

export const Route = createFileRoute("/contributor-pass")({
  component: ContributorPassPage,
});

function ContributorPassPage() {
  return (
    <AppShell>
      <div className="pb-12 max-w-7xl mx-auto">
        <ContributorPassHub />
      </div>
    </AppShell>
  );
}

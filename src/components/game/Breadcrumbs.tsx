import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

const LABELS: Record<string, string> = {
  "": "Character HQ",
  inventory: "Inventory",
  collection: "Collection",
  shop: "Shop",
  packs: "Pack Vault",
  missions: "Missions",
  "season-pass": "Contributor Pass",
  leaderboard: "Leaderboard",
  profile: "Profile",
  settings: "Settings",
  achievements: "Achievements",
  player: "Player",
  onboarding: "Onboarding",
};

export function Breadcrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const parts = pathname.split("/").filter(Boolean);

  const crumbs: { label: string; to: string }[] = [{ label: "Dashboard", to: "/" }];
  let acc = "";
  for (const p of parts) {
    acc += `/${p}`;
    const label = LABELS[p] ?? decodeURIComponent(p);
    crumbs.push({ label, to: acc });
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
    >
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={c.to} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 opacity-60" />}
            {last ? (
              <span className="font-semibold text-foreground">{c.label}</span>
            ) : (
              <Link to={c.to} className="hover:text-foreground">
                {c.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

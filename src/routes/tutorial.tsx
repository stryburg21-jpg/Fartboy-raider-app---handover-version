import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/tutorial")({
  validateSearch: (search: Record<string, unknown>) => ({
    replay: Boolean(search.replay),
  }),
  component: () => <Navigate to="/onboarding" replace />,
});

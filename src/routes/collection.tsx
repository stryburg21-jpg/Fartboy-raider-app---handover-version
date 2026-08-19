import { createFileRoute, Navigate } from "@tanstack/react-router";

// Collection route consolidated into The Vault destination
export const Route = createFileRoute("/collection")({
  component: () => <Navigate to="/packs" search={{ section: "tracker" }} replace />,
});

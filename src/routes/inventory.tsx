import { createFileRoute, Navigate } from "@tanstack/react-router";

// Inventory route consolidated into The Vault destination
export const Route = createFileRoute("/inventory")({
  component: () => <Navigate to="/packs" search={{ tab: "owned" }} replace />,
});

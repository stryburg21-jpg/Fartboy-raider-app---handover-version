import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/market")({
  component: () => <Navigate to="/forge" replace />,
});

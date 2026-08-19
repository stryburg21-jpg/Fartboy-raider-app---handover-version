import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/armory")({ component: ArmoryRedirect });

function ArmoryRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/packs", replace: true });
  }, [navigate]);

  return null;
}

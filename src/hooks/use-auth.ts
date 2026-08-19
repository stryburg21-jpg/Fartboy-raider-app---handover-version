import { useCallback, useEffect, useState } from "react";
import { getCurrentSession, onAuthChange, type Session } from "@/services/auth";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refresh = useCallback(() => {
    const s = getCurrentSession();
    setSession(s);
    setStatus(s ? "authenticated" : "unauthenticated");
  }, []);

  useEffect(() => {
    refresh();
    return onAuthChange(refresh);
  }, [refresh]);

  return { session, status, refresh };
}

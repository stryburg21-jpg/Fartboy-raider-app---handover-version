import { CheckCircle2, Loader2, XCircle, LogIn } from "lucide-react";

/** Reusable auth flow UI states. */

export function AuthLoading({ label = "Authenticating…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function AuthSuccess({
  title = "You're in",
  message = "Redirecting to your command deck…",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <CheckCircle2 className="h-10 w-10 text-primary" />
      <div>
        <div className="font-display text-lg font-bold">{title}</div>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export function AuthError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-center">
      <XCircle className="h-8 w-8 text-destructive" />
      <p className="text-sm text-destructive-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground hover:opacity-90"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function LoggedOutState({ onLogin }: { onLogin?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center text-muted-foreground">
      <LogIn className="h-8 w-8 text-primary" />
      <p className="text-sm">You are signed out.</p>
      {onLogin && (
        <button
          onClick={onLogin}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Sign in
        </button>
      )}
    </div>
  );
}

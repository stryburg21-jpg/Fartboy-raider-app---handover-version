import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthError, AuthLoading } from "@/components/auth/AuthStates";
import { forgotPassword } from "@/services/auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Fartboy Raid 2.0" },
      { name: "description", content: "Recover your Fartboy Raid 2.0 account." },
    ],
  }),
  component: ForgotPasswordPage,
});

type Status = "idle" | "loading" | "sent" | "error";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      await forgotPassword(email);
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset link");
      setStatus("error");
    }
  };

  return (
    <AuthShell
      title="Lost your key?"
      subtitle="We'll send a reset link to your email."
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          ← Back to sign in
        </Link>
      }
    >
      {status === "loading" && <AuthLoading label="Sending reset link…" />}

      {status === "sent" && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-primary/40 bg-primary/10 p-5 text-center">
          <CheckCircle2 className="h-10 w-10 text-primary" />
          <div>
            <div className="font-display text-lg font-bold">Check your inbox</div>
            <p className="mt-1 text-sm text-muted-foreground">
              If an account exists for{" "}
              <span className="font-semibold text-foreground">{email}</span>, a reset link is on its
              way.
            </p>
          </div>
        </div>
      )}

      {status !== "loading" && status !== "sent" && (
        <form className="flex flex-col gap-3" onSubmit={submit}>
          {error && <AuthError message={error} />}
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="raider@fartboy.gg"
              required
              className="rounded-lg border border-input bg-surface-2 px-3 py-2.5 text-sm outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:opacity-90"
          >
            Send Reset Link
          </button>
        </form>
      )}
    </AuthShell>
  );
}

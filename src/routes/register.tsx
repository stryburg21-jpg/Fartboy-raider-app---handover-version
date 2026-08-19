import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthError, AuthLoading, AuthSuccess } from "@/components/auth/AuthStates";
import { registerUser } from "@/services/auth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Join the Raid — Fartboy Raid 2.0" },
      { name: "description", content: "Create your Fartboy Raid 2.0 account." },
    ],
  }),
  component: RegisterPage,
});

type Status = "idle" | "loading" | "success" | "error";

function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      await registerUser({ username, email, password });
      setStatus("success");
      setTimeout(() => navigate({ to: "/" }), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setStatus("error");
    }
  };

  return (
    <AuthShell
      title="Join the Raid"
      subtitle="Claim your raider tag and start earning XP."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {status === "loading" && <AuthLoading label="Creating your account…" />}
      {status === "success" && (
        <AuthSuccess title="Welcome, raider!" message="Account created. Loading your deck…" />
      )}

      {status !== "loading" && status !== "success" && (
        <form className="flex flex-col gap-3" onSubmit={submit}>
          {error && <AuthError message={error} />}
          <Field
            label="Username"
            value={username}
            onChange={setUsername}
            placeholder="FartLord"
            required
          />
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="raider@fartboy.gg"
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            required
          />
          <Field
            label="Confirm Password"
            type="password"
            value={confirm}
            onChange={setConfirm}
            placeholder="••••••••"
            required
          />
          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:opacity-90"
          >
            Create Account <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}
    </AuthShell>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="rounded-lg border border-input bg-surface-2 px-3 py-2.5 text-sm outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
      />
    </label>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { MessageSquare, Sparkles } from "lucide-react";
import { AuthError, AuthLoading, AuthSuccess } from "@/components/auth/AuthStates";
import { loginWithDiscord } from "@/services/auth";
import { getOnboardingStatus } from "@/services/onboarding";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Enter the Raid — Fartboy Raid 2.0" },
      { name: "description", content: "Sign in to Fartboy Raid 2.0 with Discord." },
    ],
  }),
  component: LoginPage,
});

type Status = "idle" | "loading" | "success" | "error";

const BACKGROUND_VIDEO = "/assets/backgrounds/login-bg-fartboy-raider.mp4";
const BACKGROUND_POSTER = "/assets/backgrounds/login-bg-fartboy-raider.png";

function LoginPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        video.style.display = "none";
      });
    }
  }, []);

  const handleDiscordLogin = async () => {
    setStatus("loading");
    setError(null);
    try {
      // TODO: Replace mock login with Discord SDK / OAuth auth service
      await loginWithDiscord();
      setStatus("success");

      const { hasCompletedTutorial } = await getOnboardingStatus();
      setTimeout(() => {
        if (!hasCompletedTutorial) {
          navigate({ to: "/tutorial" });
        } else {
          navigate({ to: "/hq" });
        }
      }, 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStatus("error");
    }
  };

  const LoginCard = () => (
    <div className="w-full max-w-md rounded-xl border border-amber-500/30 bg-black/80 lg:bg-black/60 p-5 text-center shadow-2xl backdrop-blur-md">
      {status === "loading" && <AuthLoading label="Connecting to Discord…" />}
      {status === "success" && <AuthSuccess />}

      {status !== "loading" && status !== "success" && (
        <>
          <p className="font-display mb-3 text-lg font-bold tracking-wide text-amber-400">
            Become a True Fartboy Legend..
            <br />
            Join the Raid ARMY
          </p>

          {error && (
            <div className="mb-4">
              <AuthError message={error} onRetry={handleDiscordLogin} />
            </div>
          )}

          <button
            onClick={handleDiscordLogin}
            className="inline-flex w-full items-center justify-center gap-3 rounded-lg bg-[#5865F2] px-4 py-3.5 text-base font-semibold text-white transition hover:brightness-110"
          >
            <MessageSquare className="h-5 w-5" />
            Discord Login
          </button>

          <Link
            to="/onboarding"
            search={{ replay: true }}
            className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white hover:underline"
          >
            <Sparkles className="h-3.5 w-3.5" /> View Game Introduction
          </Link>
        </>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-foreground">
      {/* ================= DESKTOP LAYOUT (>=1024px) ================= */}
      <div className="hidden lg:block absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BACKGROUND_POSTER})` }}
        />
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover object-center"
          src={BACKGROUND_VIDEO}
          poster={BACKGROUND_POSTER}
          autoPlay
          loop
          muted
          playsInline
          // @ts-expect-error - webkit-playsinline required for legacy iOS Safari support
          webkit-playsinline="true"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-black/25" />

        {/* PC Centered Card — Moved down slightly to top-[62%] */}
        <div className="absolute inset-x-0 top-[62%] flex justify-center px-5">
          <LoginCard />
        </div>
      </div>

      {/* ================= MOBILE / TABLET LAYOUT (<1024px) ================= */}
      <div className="relative flex min-h-screen flex-col items-center justify-start lg:hidden">
        {/* Ambient Blurred Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="h-full w-full bg-cover bg-center filter blur-2xl scale-125 opacity-70"
            style={{ backgroundImage: `url(${BACKGROUND_POSTER})` }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Uncropped 16:9 Video Section */}
        <div className="relative w-full aspect-video z-10">
          <video
            className="h-full w-full object-contain"
            src={BACKGROUND_VIDEO}
            poster={BACKGROUND_POSTER}
            autoPlay
            loop
            muted
            playsInline
            // @ts-expect-error - webkit-playsinline required for legacy iOS Safari support
            webkit-playsinline="true"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Mobile/Tablet Card Section */}
        <div className="relative z-10 w-full px-5 pt-6 pb-10 flex justify-center">
          <LoginCard />
        </div>
      </div>
    </div>
  );
}

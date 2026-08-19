// TODO(backend): Replace with real API endpoints (GET/POST /api/user/onboarding)
// This service maintains local frontend state for starter flow and tutorial completion.

import { safeStorage } from "@/lib/storage";

const STORAGE_KEY = "fbr:onboarding-complete";
const TUTORIAL_KEY = "fbr:has-completed-tutorial";
const AVATAR_KEY = "fbr:user-avatar";

export type OnboardingStatus = {
  completed: boolean;
  hasCompletedTutorial: boolean;
  avatarUrl?: string;
  // TODO(backend): add server-side fields like completedAt, currentStep, rewardsClaimed
};

export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  // TODO(backend): Fetch onboarding status from backend for the authenticated user ID
  await delay(100);
  const completed = safeStorage.getItem(STORAGE_KEY) === "1";
  const hasCompletedTutorial = safeStorage.getItem(TUTORIAL_KEY) === "1" || completed;
  const avatarUrl = safeStorage.getItem(AVATAR_KEY) || undefined;
  return { completed, hasCompletedTutorial, avatarUrl };
}

export async function completeOnboarding(payload?: {
  avatarId?: string;
  customAvatarUrl?: string;
}): Promise<OnboardingStatus> {
  // TODO(backend): POST /api/user/onboarding to persist completed state, selected profile picture, and grant Starter Pack rewards
  await delay(200);
  safeStorage.setItem(STORAGE_KEY, "1");
  safeStorage.setItem(TUTORIAL_KEY, "1");
  if (payload?.customAvatarUrl) {
    safeStorage.setItem(AVATAR_KEY, payload.customAvatarUrl);
  } else if (payload?.avatarId) {
    const match = STARTER_AVATARS.find((a) => a.id === payload.avatarId);
    if (match) safeStorage.setItem(AVATAR_KEY, match.emoji);
  }
  return { completed: true, hasCompletedTutorial: true };
}

export async function resetOnboarding(): Promise<void> {
  // TODO(backend): Replay tutorial helper — clears local onboarding flag so user can re-run tutorial
  safeStorage.removeItem(STORAGE_KEY);
}

export type StarterAvatar = {
  id: string;
  name: string;
  emoji: string;
  imageUrl: string;
  gradient: string;
  tagline: string;
};

// TODO(backend): Replace mock avatar options with real asset URLs or avatar generation service
export const STARTER_AVATARS: StarterAvatar[] = [
  {
    id: "fartboy_3d",
    name: "3D Fartboy Raider",
    emoji: "👑",
    imageUrl: "/assets/avatar/base/fartboy-3d-raider.png",
    gradient: "from-amber-400/40 to-primary/40",
    tagline: "Elite community champion & 3D Fartboy Raider.",
  },
];

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

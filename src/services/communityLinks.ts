import { toast } from "sonner";

export interface CommunityLinks {
  raidChannel: string;
  memeChannel: string;
  videoChannel: string;
  learnRaid: string;
  learnMemes: string;
  learnVideos: string;
  contributorGuide: string;
}

// Backend API mock implementation
// Replace backend endpoint URL when real API is available
const DEFAULT_COMMUNITY_LINKS: CommunityLinks = {
  raidChannel: "https://discord.gg/fartboy-raid-channel",
  memeChannel: "https://discord.gg/fartboy-meme-forge",
  videoChannel: "https://discord.gg/fartboy-video-lab",
  learnRaid: "https://docs.fartboy.io/guides/raid-101",
  learnMemes: "https://docs.fartboy.io/guides/meme-creation",
  learnVideos: "https://docs.fartboy.io/guides/video-creation",
  contributorGuide: "https://docs.fartboy.io/contributor-pass",
};

export async function getCommunityLinks(): Promise<CommunityLinks> {
  // Simulating backend API request latency
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(DEFAULT_COMMUNITY_LINKS);
    }, 100);
  });
}

/**
 * Helper to handle community action navigation safely.
 * Operates gracefully within sandboxed iframe or popups with mobile toast feedback.
 */
export function handleCommunityAction(url: string, actionLabel: string) {
  toast.info(`Simulated: Navigating to ${actionLabel} in Discord Webview`);
  if (typeof window !== "undefined") {
    // Attempt window.open with rel noopener
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) {
      // Fallback if popup blocker active inside iframe
      console.log(`[Community Action] Navigating to ${actionLabel}: ${url}`);
    }
  }
}

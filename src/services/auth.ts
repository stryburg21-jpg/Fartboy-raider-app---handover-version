/**
 * Fartboy Raid 2.0 — Auth service (MOCK)
 *
 * Frontend-only placeholders. Replace each function body with real backend
 * calls. All UI reads from this module — do NOT scatter auth logic elsewhere.
 *
 * TODO(backend):
 *  - Discord OAuth2 (PKCE) → exchange code server-side
 *  - Wallet auth (SIWE / Solana sign-in message + signature verify)
 *  - Email/password via your auth provider (Lovable Cloud / Supabase / custom)
 *  - Persist session in httpOnly cookie or provider session store
 *
 * ── DISCORD INTEGRATION — READ ME (handoff notes for backend/platform dev) ──
 *
 * This ships as a game that loads inside Discord, so login is Discord-only
 * on the actual /login screen (see src/routes/login.tsx). There are two
 * different ways this can be wired up server-side — pick whichever matches
 * how the APK actually launches the game, they are NOT interchangeable:
 *
 *  A) Discord Activity / Embedded App (game runs in an iframe/webview
 *     launched from inside the Discord client itself):
 *     Use the official Embedded App SDK (`@discord/embedded-app-sdk`) and
 *     its `authorize()` / `authenticate()` flow — no redirect, Discord
 *     hands you an access token directly via postMessage.
 *     Docs: https://discord.com/developers/docs/activities/development-guides/setting-up-authentication
 *
 *  B) Standalone APK that opens a normal Discord OAuth2 screen (browser /
 *     webview redirect, then deep-links back into the app with `?code=...`):
 *     Standard OAuth2 Authorization Code flow (+ PKCE recommended).
 *     Docs: https://discord.com/developers/docs/topics/oauth2
 *
 * `loginWithDiscord()` below is a stand-in for whichever path (A/B) you
 * implement — the UI only cares that it resolves to a `Session`. `
 * exchangeDiscordCode()` is an extra placeholder specifically for path (B)'s
 * redirect-callback step; delete it if you go with path (A) instead.
 */

export type AuthProvider = "discord" | "wallet" | "email";

export interface Session {
  userId: string;
  username: string;
  provider: AuthProvider;
  avatarUrl?: string;
  walletAddress?: string;
  token: string; // opaque, mock
  expiresAt: number;
}

/**
 * Placeholder Discord app config — replace with your real values (or better,
 * load clientId from an env var / build-time config, never hardcode secrets
 * here). `redirectUri` only applies to OAuth2 path (B) above.
 */
export const DISCORD_AUTH_CONFIG = {
  clientId: "REPLACE_WITH_DISCORD_CLIENT_ID",
  redirectUri: "REPLACE_WITH_OAUTH_REDIRECT_URI", // e.g. fartboyraid://auth/discord/callback
  scopes: ["identify"], // add "email" / "guilds.members.read" etc. if you need them
} as const;

import { safeStorage } from "@/lib/storage";

const STORAGE_KEY = "fbr_mock_session";
const MOCK_DELAY = 700;

function delay<T>(value: T, ms = MOCK_DELAY): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), ms));
}

const LOGOUT_FLAG_KEY = "fbr_mock_logged_out";

function persist(session: Session | null) {
  if (session) {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    safeStorage.removeItem(LOGOUT_FLAG_KEY);
  } else {
    safeStorage.removeItem(STORAGE_KEY);
    safeStorage.setItem(LOGOUT_FLAG_KEY, "true");
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("fbr:auth-change"));
  }
}

function mockSession(partial: Partial<Session> & { provider: AuthProvider }): Session {
  return {
    userId: "usr_" + Math.random().toString(36).slice(2, 10),
    username: "Raider" + Math.floor(Math.random() * 9999),
    token: "mock_" + Math.random().toString(36).slice(2),
    expiresAt: Date.now() + 1000 * 60 * 60 * 24,
    ...partial,
  };
}

/**
 * TODO(backend): kick off real Discord auth (see notes above — path A or B).
 *
 * Whatever you build, the resolved value must match the `Session` shape.
 * Suggested JSON your backend returns after a successful Discord login
 * (e.g. `POST /api/auth/discord/callback`), for it to map cleanly onto
 * `Session`:
 * {
 *   "userId": "usr_8f2a1c",              // your internal player id, NOT the raw Discord id
 *   "username": "FartLord#0001",         // Discord global_name or username#discriminator
 *   "provider": "discord",
 *   "avatarUrl": "https://cdn.discordapp.com/avatars/<id>/<hash>.png",
 *   "token": "<session JWT or opaque token — used for subsequent API calls>",
 *   "expiresAt": 1735689600000           // epoch ms
 * }
 */
export async function loginWithDiscord(): Promise<Session> {
  const s = await delay(mockSession({ provider: "discord", username: "FartLord#0001" }));
  persist(s);
  return s;
}

/**
 * TODO(backend): PLACEHOLDER for OAuth2 path (B) only — call this from
 * wherever the app handles the Discord redirect back with `?code=...`.
 * Not currently wired into any UI. Suggested endpoint:
 *   POST /api/auth/discord/callback  { code: string }
 *   → returns the JSON shape documented above on `loginWithDiscord()`.
 */
export async function exchangeDiscordCode(code: string): Promise<Session> {
  console.warn("[auth] exchangeDiscordCode() is a placeholder — no backend wired yet.", { code });
  const s = await delay(mockSession({ provider: "discord", username: "FartLord#0001" }));
  persist(s);
  return s;
}

/** TODO(backend): request wallet signature, verify server-side (SIWE/SIWS). */
export async function connectWallet(): Promise<Session> {
  const addr =
    "0x" + Math.random().toString(16).slice(2, 10) + "…" + Math.random().toString(16).slice(2, 6);
  const s = await delay(mockSession({ provider: "wallet", username: addr, walletAddress: addr }));
  persist(s);
  return s;
}

/** TODO(backend): POST /auth/login { email, password }. */
export async function loginWithEmail(email: string, _password: string): Promise<Session> {
  if (!email.includes("@")) throw new Error("Invalid email");
  const s = await delay(mockSession({ provider: "email", username: email.split("@")[0] }));
  persist(s);
  return s;
}

/** TODO(backend): POST /auth/register. */
export async function registerUser(input: {
  username: string;
  email: string;
  password: string;
}): Promise<Session> {
  if (!input.email.includes("@")) throw new Error("Invalid email");
  if (input.password.length < 6) throw new Error("Password too short");
  const s = await delay(mockSession({ provider: "email", username: input.username }));
  persist(s);
  return s;
}

/** TODO(backend): POST /auth/forgot-password { email }. */
export async function forgotPassword(email: string): Promise<{ ok: true }> {
  if (!email.includes("@")) throw new Error("Invalid email");
  return delay({ ok: true as const });
}

/** TODO(backend): POST /auth/logout, clear cookies. */
export async function logout(): Promise<void> {
  persist(null);
  await delay(undefined, 150);
}

/** TODO(backend): GET /auth/session — validate httpOnly cookie / token. */
export function getCurrentSession(): Session | null {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (!raw) {
      if (safeStorage.getItem(LOGOUT_FLAG_KEY) === "true") {
        return null;
      }
      const defaultSession: Session = {
        userId: "usr_fartlord",
        username: "FartLord#0001",
        provider: "discord",
        avatarUrl: "/assets/avatar/base/fartboy-3d-raider.png",
        token: "mock_default_token",
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 365,
      };
      safeStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSession));
      return defaultSession;
    }
    const s = JSON.parse(raw) as Session;
    if (s.expiresAt < Date.now()) {
      safeStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

/** Subscribe to session changes (mock). */
export function onAuthChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("fbr:auth-change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("fbr:auth-change", handler);
    window.removeEventListener("storage", handler);
  };
}

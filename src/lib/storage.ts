/**
 * SSR-safe and error-resilient localStorage wrapper for browser/server execution.
 */
export const safeStorage = {
  getItem(key: string): string | null {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return null;
    }
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string): void {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return;
    }
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore quota exceeded or storage disabled errors
    }
  },

  removeItem(key: string): void {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage errors
    }
  },
};

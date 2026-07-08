const ACCESS_TOKEN_KEY = "kanban_access_token";
const REFRESH_TOKEN_KEY = "kanban_refresh_token";
const SESSION_COOKIE = "kanban_session";

/**
 * Tokens live in localStorage (used for the actual Authorization header).
 * A separate non-sensitive cookie flag mirrors "is logged in" so proxy.ts
 * (which runs on the edge and can't read localStorage) can do an optimistic
 * redirect. The backend is still the source of truth for real authorization.
 */
export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens(accessToken: string, refreshToken: string) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  },

  clear() {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
  },
};

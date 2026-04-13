/**
 * In-memory token store.
 * AuthContext writes here on login/logout/refresh.
 * authFetch reads from here so API calls don't need React context.
 */

let accessToken: string | null = null;
let refreshToken: string | null = null;
let onForceLogout: (() => void) | null = null;
let onTokenRefreshed: ((newAccessToken: string) => void) | null = null;

export const tokenStore = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => refreshToken,

  setTokens: (access: string, refresh: string) => {
    accessToken = access;
    refreshToken = refresh;
  },

  clearTokens: () => {
    accessToken = null;
    refreshToken = null;
  },

  setForceLogoutHandler: (handler: () => void) => {
    onForceLogout = handler;
  },

  forceLogout: () => {
    onForceLogout?.();
  },

  setTokenRefreshedHandler: (handler: (newAccessToken: string) => void) => {
    onTokenRefreshed = handler;
  },

  notifyTokenRefreshed: (newAccessToken: string) => {
    onTokenRefreshed?.(newAccessToken);
  },
};

/**
 * In-memory access token store.
 * Never written to localStorage — lives only in memory.
 * AuthContext writes here on login/logout/refresh.
 * apiClient reads from here so API calls don't need React context.
 */

let accessToken = null;
let onForceLogout = null;

export const tokenStore = {
  getAccessToken: () => accessToken,

  setAccessToken: (token) => {
    accessToken = token;
  },

  clearAccessToken: () => {
    accessToken = null;
  },

  setForceLogoutHandler: (handler) => {
    onForceLogout = handler;
  },

  forceLogout: () => {
    onForceLogout?.();
  },
};

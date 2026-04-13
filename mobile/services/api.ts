import API_BASE_URL from "@/constants/config";
import { Club, Match, MatchLineup, Player, UserProfile } from "@/context/auth";
import { tokenStore } from "@/services/tokenStore";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";

async function doRefresh(): Promise<string> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) throw new Error("Refresh failed");

  const data = await response.json();
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
  tokenStore.setTokens(data.accessToken, data.refreshToken);
  tokenStore.notifyTokenRefreshed(data.accessToken);
  return data.accessToken;
}

function buildRequest(token: string, options?: RequestInit): RequestInit {
  return {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  };
}

// Returns the raw Response, handling 401 + token refresh + retry internally.
async function authFetchRaw(path: string, token: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(`${API_BASE_URL}${path}`, buildRequest(token, options));

  if (response.status === 401) {
    try {
      const newAccessToken = await doRefresh();
      return fetch(`${API_BASE_URL}${path}`, buildRequest(newAccessToken, options));
    } catch {
      tokenStore.forceLogout();
      throw new Error("Session expired. Please log in again.");
    }
  }

  return response;
}

async function authFetch(path: string, token: string, options?: RequestInit) {
  const response = await authFetchRaw(path, token, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json();
}

export async function getUserProfile(token: string): Promise<UserProfile> {
  return authFetch("/api/user/me", token);
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // Ignore network errors — local logout proceeds regardless
  }
}

export async function getClubs(token: string): Promise<Club[]> {
  return authFetch("/api/clubs", token);
}

export async function getClubMatches(
  clubId: number,
  token: string,
): Promise<Match[]> {
  return authFetch(`/api/clubs/${clubId}/matches`, token);
}

export async function getClub(id: number, token: string): Promise<Club> {
  return authFetch(`/api/clubs/${id}`, token);
}

export async function setFavoriteClub(
  id: number,
  token: string,
): Promise<UserProfile> {
  return authFetch(`/api/clubs/${id}/favorite`, token, { method: "POST" });
}

export async function removeFavoriteClub(token: string): Promise<UserProfile> {
  return authFetch("/api/clubs/favorite", token, { method: "DELETE" });
}

export async function getMatch(id: number, token: string): Promise<Match> {
  return authFetch(`/api/matches/${id}`, token);
}

export async function getPlayersByClub(
  clubId: number,
  token: string,
): Promise<Player[]> {
  return authFetch(`/api/players?clubId=${clubId}`, token);
}

// Returns null when the backend responds with 204 (lineup not yet available)
export async function getMatchLineup(
  matchId: number,
  token: string,
): Promise<MatchLineup | null> {
  const response = await authFetchRaw(`/api/matches/${matchId}/lineup`, token);
  if (response.status === 204) return null;
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json();
}

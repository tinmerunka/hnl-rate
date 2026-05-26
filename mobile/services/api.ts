import API_BASE_URL from "@/constants/config";
import { Club, Match, MatchLineup, MatchRatings, MatchStatistics, Player, PlayerRatingInput, UserMatchRating, UserProfile, VoteResult } from "@/context/auth";
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
      throw new Error("Sesija je istekla. Prijavi se ponovno.");
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

export async function getUserRatings(token: string): Promise<UserMatchRating[]> {
  return authFetch('/api/user/ratings', token);
}

export async function getMatchRatings(matchId: number, token: string): Promise<MatchRatings> {
  const response = await authFetchRaw(`/api/matches/${matchId}/ratings`, token);
  if (response.status === 204) {
    return { averageMatchRating: null, matchCount: 0, averageRefereeRating: null, refereeCount: 0, averageAtmosphereRating: null, atmosphereCount: 0, playerRatings: [], comments: [], userMatchRating: null };
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json();
}

async function postRating(path: string, token: string, body: object): Promise<void> {
  const res = await authFetchRaw(path, token, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
}

export async function rateMatch(matchId: number, rating: number, token: string, comment?: string): Promise<void> {
  return postRating(`/api/matches/${matchId}/rate`, token, comment ? { rating, comment } : { rating });
}

export async function rateReferee(matchId: number, rating: number, token: string): Promise<void> {
  return postRating(`/api/matches/${matchId}/rate-referee`, token, { rating });
}

export async function rateAtmosphere(matchId: number, rating: number, token: string): Promise<void> {
  return postRating(`/api/matches/${matchId}/rate-atmosphere`, token, { rating });
}

export async function ratePlayers(matchId: number, ratings: PlayerRatingInput[], token: string): Promise<void> {
  const res = await authFetchRaw(`/api/matches/${matchId}/rate-players`, token, {
    method: 'POST',
    body: JSON.stringify(ratings),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
}

export async function getMatchesByRound(round: number, token: string): Promise<Match[]> {
  return authFetch(`/api/matches?round=${round}`, token);
}

export async function voteOnComment(
  matchId: number,
  ratingId: number,
  voteType: "UP" | "DOWN",
  token: string,
): Promise<VoteResult> {
  const res = await authFetchRaw(
    `/api/matches/${matchId}/ratings/${ratingId}/vote`,
    token,
    { method: "POST", body: JSON.stringify({ voteType }) },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  const data = await res.json();
  return { ...data, userVote: data.userVote || null };
}

// Returns null when the backend responds with 204 (match not finished or stats unavailable)
export async function getMatchStatistics(
  matchId: number,
  token: string,
): Promise<MatchStatistics | null> {
  const response = await authFetchRaw(`/api/matches/${matchId}/statistics`, token);
  if (response.status === 204) return null;
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json();
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

export async function getTopRated(token: string): Promise<TopRated> {
  return authFetch('/api/top-rated', token);
}

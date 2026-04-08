import API_BASE_URL from '@/constants/config';
import { Club, Match, UserProfile } from '@/context/auth';

async function authFetch(path: string, token: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json();
}

export async function getUserProfile(token: string): Promise<UserProfile> {
  return authFetch('/api/user/me', token);
}

export async function getClubs(token: string): Promise<Club[]> {
  return authFetch('/api/clubs', token);
}

export async function getClubMatches(clubId: number, token: string): Promise<Match[]> {
  return authFetch(`/api/clubs/${clubId}/matches`, token);
}

export async function getClub(id: number, token: string): Promise<Club> {
  return authFetch(`/api/clubs/${id}`, token);
}

export async function setFavoriteClub(id: number, token: string): Promise<UserProfile> {
  return authFetch(`/api/clubs/${id}/favorite`, token, { method: 'POST' });
}

export async function removeFavoriteClub(token: string): Promise<UserProfile> {
  return authFetch('/api/clubs/favorite', token, { method: 'DELETE' });
}

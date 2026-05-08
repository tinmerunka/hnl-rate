import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';
import { getUserProfile, revokeRefreshToken } from '@/services/api';
import { tokenStore } from '@/services/tokenStore';

export interface Club {
  id: number;
  name: string;
  shortName?: string;
  tla?: string;
  crest?: string;    // api-football.com field name
  logoUrl?: string;  // backend entity field name
  address?: string;
  website?: string;
  founded?: number;
  venue?: string;
}

export interface Referee {
  id: number;
  firstName: string;
  lastName: string;
}

export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  position?: string;
  number?: number;
  club: Club;
}

export interface Match {
  id: number;
  homeClub: Club;
  awayClub: Club;
  referee?: Referee | null;
  round: number;
  date: string;
  result: string | null;
  finished: boolean;
}

export interface LineupPlayer {
  id: number;
  firstName: string;
  lastName: string;
  number?: number;
  position?: string;
  grid?: string;
}

export interface TeamLineup {
  club: Club;
  startingXI: LineupPlayer[];
  bench: LineupPlayer[];
}

export interface MatchLineup {
  homeTeam: TeamLineup;
  awayTeam: TeamLineup;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  favoriteClub: Club | null;
}

export interface UserMatchRating {
  matchId: number;
  homeClub: string;
  awayClub: string;
  date: string;
  round: number;
  result: string;
  matchRating: { rating: number; comment: string | null } | null;
  refereeRating: { rating: number; comment: string | null } | null;
  atmosphereRating: { rating: number; comment: string | null } | null;
  playerRatings: {
    playerId: number;
    firstName: string;
    lastName: string;
    rating: number;
    bestPlayer: boolean;
    worstPlayer: boolean;
  }[];
}

export interface PlayerRatingInput {
  playerId: number;
  rating: number;
  bestPlayer: boolean;
  worstPlayer: boolean;
}

export interface PlayerRatingResult {
  playerId: number;
  firstName: string;
  lastName: string;
  averageRating: number | null;
  bestPlayerVotes: number;
  worstPlayerVotes: number;
}

export interface MatchComment {
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface MatchRatings {
  averageMatchRating: number | null;
  matchCount: number;
  averageRefereeRating: number | null;
  refereeCount: number;
  averageAtmosphereRating: number | null;
  atmosphereCount: number;
  playerRatings: PlayerRatingResult[];
  comments: MatchComment[];
  userMatchRating: number | null;
}

interface AuthContextType {
  token: string | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ACCESS_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tokenStore.setForceLogoutHandler(async () => {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      tokenStore.clearTokens();
      setToken(null);
      setUserProfile(null);
    });

    tokenStore.setTokenRefreshedHandler((newAccessToken: string) => {
      setToken(newAccessToken);
    });

    Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]).then(async ([storedAccess, storedRefresh]) => {
      if (storedAccess && storedRefresh) {
        tokenStore.setTokens(storedAccess, storedRefresh);
        setToken(storedAccess);
        try {
          const profile = await getUserProfile(storedAccess);
          setUserProfile(profile);
        } catch {
          await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
          await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
          tokenStore.clearTokens();
          setToken(null);
        }
      }
    }).finally(() => setLoading(false));
  }, []);

  async function login(accessToken: string, refreshToken: string) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    tokenStore.setTokens(accessToken, refreshToken);
    setToken(accessToken);
    const profile = await getUserProfile(accessToken);
    setUserProfile(profile);
  }

  async function logout() {
    const storedRefresh = tokenStore.getRefreshToken();
    if (storedRefresh) await revokeRefreshToken(storedRefresh);
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    tokenStore.clearTokens();
    setToken(null);
    setUserProfile(null);
  }

  async function refreshProfile() {
    if (!token) return;
    const profile = await getUserProfile(token);
    setUserProfile(profile);
  }

  function updateProfile(profile: UserProfile) {
    setUserProfile(profile);
  }

  return (
    <AuthContext.Provider value={{ token, userProfile, loading, login, logout, refreshProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';
import { getUserProfile } from '@/services/api';

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

interface AuthContextType {
  token: string | null;
  userProfile: UserProfile | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'auth_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY).then(async (stored) => {
      if (stored) {
        setToken(stored);
        try {
          const profile = await getUserProfile(stored);
          setUserProfile(profile);
        } catch {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
      }
    });
  }, []);

  async function login(newToken: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    setToken(newToken);
    const profile = await getUserProfile(newToken);
    setUserProfile(profile);
  }

  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
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
    <AuthContext.Provider value={{ token, userProfile, login, logout, refreshProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

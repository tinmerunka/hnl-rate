import type { Club, Match } from '@/context/auth';
import { getClub, getClubMatches } from '@/services/api';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useClubData(clubId: number, token: string | null) {
  const [club, setClub] = useState<Club | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    getClub(clubId, token)
      .then(setClub)
      .catch((e) =>
        Alert.alert('Greška', e.message ?? 'Klub nije moguće učitati.'),
      )
      .finally(() => setLoading(false));

    getClubMatches(clubId, token)
      .then(setMatches)
      .catch(() => {})
      .finally(() => setMatchesLoading(false));
  }, [clubId, token]);

  return { club, matches, loading, matchesLoading };
}

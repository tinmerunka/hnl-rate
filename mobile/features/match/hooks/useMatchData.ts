import type { Match, MatchLineup } from '@/context/auth';
import { getMatch, getMatchLineup } from '@/services/api';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function useMatchData(matchId: number, token: string | null) {
  const [match, setMatch] = useState<Match | null>(null);
  const [lineup, setLineup] = useState<MatchLineup | null>(null);
  const [loading, setLoading] = useState(true);
  const [lineupLoading, setLineupLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    getMatch(matchId, token)
      .then((m) => {
        setMatch(m);
        if (m.finished) {
          setLineupLoading(true);
          getMatchLineup(m.id, token)
            .then(setLineup)
            .catch(() => {})
            .finally(() => setLineupLoading(false));
        }
      })
      .catch((e) =>
        Alert.alert('Greška', e.message ?? 'Učitavanje utakmice nije uspjelo.'),
      )
      .finally(() => setLoading(false));
  }, [matchId, token]);

  return { match, lineup, loading, lineupLoading };
}

import type { Match } from '@/context/auth';
import { getMatchesByRound } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

export function useRoundMatches(round: number, token: string | null) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!token) return;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const data = await getMatchesByRound(round, token);
        setMatches(data);
      } catch (e: any) {
        setError(e.message ?? 'Učitavanje utakmica nije uspjelo.');
        setMatches([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [round, token],
  );

  useEffect(() => {
    load();
  }, [load]);

  function onRefresh() {
    setRefreshing(true);
    load(true);
  }

  return { matches, loading, refreshing, error, load, onRefresh };
}

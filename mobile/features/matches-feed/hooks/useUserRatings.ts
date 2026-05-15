import type { UserMatchRating } from '@/context/auth';
import { getUserRatings } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

export function useUserRatings(token: string | null) {
  const [ratings, setRatings] = useState<UserMatchRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!token) return;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const data = await getUserRatings(token);
        data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setRatings(data);
      } catch (e: any) {
        setError(e.message ?? 'Učitavanje ocjena nije uspjelo.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    load();
  }, [load]);

  function onRefresh() {
    setRefreshing(true);
    load(true);
  }

  return { ratings, loading, refreshing, error, load, onRefresh };
}

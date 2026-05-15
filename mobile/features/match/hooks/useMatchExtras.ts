import type { MatchRatings, MatchStatistics } from '@/context/auth';
import { getMatchRatings, getMatchStatistics } from '@/services/api';
import { useEffect, useState } from 'react';

export function useMatchExtras(matchId: number, token: string | null) {
  const [communityRatings, setCommunityRatings] = useState<MatchRatings | null>(null);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [matchStats, setMatchStats] = useState<MatchStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    if (!token) return;
    getMatchRatings(matchId, token)
      .then(setCommunityRatings)
      .catch(() => {})
      .finally(() => setRatingsLoading(false));
  }, [matchId, token]);

  function loadStats() {
    if (!token || statsLoading) return;
    setStatsLoading(true);
    setStatsError(false);
    getMatchStatistics(matchId, token)
      .then(setMatchStats)
      .catch(() => setStatsError(true))
      .finally(() => setStatsLoading(false));
  }

  return {
    communityRatings,
    setCommunityRatings,
    ratingsLoading,
    matchStats,
    statsLoading,
    statsError,
    loadStats,
  };
}

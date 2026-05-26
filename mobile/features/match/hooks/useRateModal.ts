import {
  type LineupPlayer,
  type MatchLineup,
  type MatchRatings,
  type PlayerRatingInput,
} from '@/context/auth';
import {
  getMatchRatings,
  rateAtmosphere,
  rateMatch,
  ratePlayers,
  rateReferee,
} from '@/services/api';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

export type RateStep = 1 | 2 | 3 | 4 | 5;
export type PlayerWithClub = LineupPlayer & { isHome: boolean };

export function useRateModal({
  visible,
  matchId,
  token,
  lineup,
  hasReferee,
  onDone,
  onClose,
}: {
  visible: boolean;
  matchId: number;
  token: string;
  lineup: MatchLineup | null;
  hasReferee: boolean;
  onDone: (ratings: MatchRatings) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<RateStep>(1);
  const [matchRating, setMatchRating] = useState(7);
  const [atmosphereStars, setAtmosphereStars] = useState(0);
  const [refereeStars, setRefereeStars] = useState(0);
  const [bestPlayerId, setBestPlayerId] = useState<number | null>(null);
  const [worstPlayerId, setWorstPlayerId] = useState<number | null>(null);
  const [playerComments, setPlayerComments] = useState<Record<number, string>>({});
  const [selectedForActionId, setSelectedForActionId] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setStep(1);
      setMatchRating(7);
      setAtmosphereStars(0);
      setRefereeStars(0);
      setBestPlayerId(null);
      setWorstPlayerId(null);
      setPlayerComments({});
      setSelectedForActionId(null);
      setComment('');
    }
  }, [visible]);

  const allPlayers: PlayerWithClub[] = useMemo(
    () =>
      lineup
        ? [
            ...lineup.homeTeam.startingXI.map((p) => ({ ...p, isHome: true })),
            ...lineup.awayTeam.startingXI.map((p) => ({ ...p, isHome: false })),
          ]
        : [],
    [lineup],
  );

  const bestPlayer = allPlayers.find((p) => p.id === bestPlayerId);
  const worstPlayer = allPlayers.find((p) => p.id === worstPlayerId);
  const actionPlayer = selectedForActionId
    ? allPlayers.find((p) => p.id === selectedForActionId)
    : null;

  function toggleBest(id: number) {
    if (bestPlayerId === id) {
      setBestPlayerId(null);
      return;
    }
    if (worstPlayerId === id) setWorstPlayerId(null);
    setBestPlayerId(id);
  }

  function toggleWorst(id: number) {
    if (worstPlayerId === id) {
      setWorstPlayerId(null);
      return;
    }
    if (bestPlayerId === id) setBestPlayerId(null);
    setWorstPlayerId(id);
  }

  function setPlayerComment(playerId: number, text: string) {
    setPlayerComments((prev) => ({ ...prev, [playerId]: text }));
  }

  function selectForAction(playerId: number | null) {
    setSelectedForActionId(playerId);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const promises: Promise<unknown>[] = [];
      promises.push(rateMatch(matchId, matchRating, token, comment.trim() || undefined));
      if (atmosphereStars > 0)
        promises.push(rateAtmosphere(matchId, atmosphereStars * 2, token));
      if (refereeStars > 0 && hasReferee)
        promises.push(rateReferee(matchId, refereeStars * 2, token));

      const playerPayload: PlayerRatingInput[] = [];
      if (bestPlayerId) {
        playerPayload.push({
          playerId: bestPlayerId,
          rating: 10,
          bestPlayer: true,
          worstPlayer: false,
          // @ts-expect-error backend accepts optional comment field
          comment: playerComments[bestPlayerId]?.trim() || null,
        });
      }
      if (worstPlayerId) {
        playerPayload.push({
          playerId: worstPlayerId,
          rating: 1,
          bestPlayer: false,
          worstPlayer: true,
          // @ts-expect-error backend accepts optional comment field
          comment: playerComments[worstPlayerId]?.trim() || null,
        });
      }
      if (playerPayload.length > 0) {
        promises.push(ratePlayers(matchId, playerPayload, token));
      }
      await Promise.all(promises);
      const updated = await getMatchRatings(matchId, token);
      onDone({
        averageMatchRating: updated.averageMatchRating ?? matchRating,
        averageAtmosphereRating:
          updated.averageAtmosphereRating ??
          (atmosphereStars > 0 ? atmosphereStars * 2 : null),
        averageRefereeRating:
          updated.averageRefereeRating ??
          (refereeStars > 0 ? refereeStars * 2 : null),
        matchCount: updated.matchCount ?? 1,
        refereeCount: updated.refereeCount ?? 0,
        atmosphereCount: updated.atmosphereCount ?? 0,
        playerRatings: updated.playerRatings,
        comments: updated.comments ?? [],
        userMatchRating: updated.userMatchRating ?? matchRating,
      });
      onClose();
    } catch (e: any) {
      Alert.alert('Greška', e.message ?? 'Slanje ocjena nije uspjelo.');
    } finally {
      setSubmitting(false);
    }
  }

  return {
    step,
    setStep,
    matchRating,
    setMatchRating,
    atmosphereStars,
    setAtmosphereStars,
    refereeStars,
    setRefereeStars,
    bestPlayerId,
    worstPlayerId,
    selectedForActionId,
    playerComments,
    comment,
    setComment,
    submitting,
    bestPlayer,
    worstPlayer,
    actionPlayer,
    toggleBest,
    toggleWorst,
    setPlayerComment,
    selectForAction,
    handleSubmit,
  };
}

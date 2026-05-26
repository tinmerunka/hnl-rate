import { T } from '@/constants/theme';
import { Text, View } from 'react-native';
import { rm } from '../../styles/rateModal.styles';
import { SummaryTile } from '../SummaryTile';
import type { PlayerWithClub } from '../../hooks/useRateModal';

export function Step5Review({
  matchRating,
  matchColor,
  atmosphereStars,
  refereeStars,
  bestPlayer,
  worstPlayer,
  comment,
}: {
  matchRating: number;
  matchColor: string;
  atmosphereStars: number;
  refereeStars: number;
  bestPlayer: PlayerWithClub | undefined;
  worstPlayer: PlayerWithClub | undefined;
  comment: string;
}) {
  return (
    <View>
      <Text style={rm.stepLabel}>KORAK 5 · PREGLED I POTVRDA</Text>
      <Text style={rm.cardTitle}>Tvoja ocjena.</Text>
      <Text style={rm.cardSub}>Pregledaj prije objave.</Text>

      <View style={rm.summaryGrid}>
        <SummaryTile label="Utakmica" value={String(matchRating)} color={matchColor} />
        <SummaryTile
          label="Atmos"
          value={atmosphereStars > 0 ? `${atmosphereStars}★` : '—'}
          color={T.text}
        />
        <SummaryTile
          label="Sudac"
          value={refereeStars > 0 ? `${refereeStars}★` : '—'}
          color={T.text}
        />
      </View>
      <View style={[rm.summaryGrid, { marginTop: 8 }]}>
        <SummaryTile
          label="Najbolji"
          value={bestPlayer ? bestPlayer.lastName : '—'}
          color={bestPlayer ? T.win : T.textFaint}
        />
        <SummaryTile
          label="Najgori"
          value={worstPlayer ? worstPlayer.lastName : '—'}
          color={worstPlayer ? T.loss : T.textFaint}
        />
      </View>
      {comment.trim().length > 0 && (
        <View style={rm.commentPreview}>
          <Text style={rm.commentPreviewLabel}>TVOJ DOJAM</Text>
          <Text style={rm.commentPreviewText} numberOfLines={4}>
            {comment.trim()}
          </Text>
        </View>
      )}
    </View>
  );
}

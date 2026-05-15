import { matchCardStyles } from '@/components/MatchCard';
import { T } from '@/constants/theme';
import type { UserMatchRating } from '@/context/auth';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function RatedMatchCard({
  rating,
  onPress,
}: {
  rating: UserMatchRating;
  onPress: () => void;
}) {
  const [homeScore, awayScore] = rating.result
    ? rating.result.split(':')
    : [null, null];

  return (
    <TouchableOpacity
      style={[matchCardStyles.card, { paddingRight: 14 }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={matchCardStyles.inner}>
        <View style={matchCardStyles.teamRow}>
          <Text style={matchCardStyles.teamName} numberOfLines={1}>
            {rating.homeClub}
          </Text>
          {homeScore != null && (
            <Text style={[matchCardStyles.score, { color: T.text }]}>{homeScore}</Text>
          )}
        </View>
        <View style={matchCardStyles.teamRow}>
          <Text style={matchCardStyles.teamName} numberOfLines={1}>
            {rating.awayClub}
          </Text>
          {awayScore != null && (
            <Text style={[matchCardStyles.score, { color: T.text }]}>{awayScore}</Text>
          )}
        </View>
      </View>
      <View style={styles.right}>
        <View style={matchCardStyles.ftBadge}>
          <Text style={matchCardStyles.ftText}>KRAJ</Text>
        </View>
        <View style={styles.pills}>
          {rating.matchRating && (
            <View style={styles.pill}>
              <Text style={styles.pillText}>⚽ {rating.matchRating.rating}</Text>
            </View>
          )}
          {rating.refereeRating && (
            <View style={styles.pill}>
              <Text style={styles.pillText}>🏁 {rating.refereeRating.rating}</Text>
            </View>
          )}
          {rating.atmosphereRating && (
            <View style={styles.pill}>
              <Text style={styles.pillText}>🔥 {rating.atmosphereRating.rating}</Text>
            </View>
          )}
        </View>
        <Ionicons
          name="chevron-forward"
          size={14}
          color={T.textFaint}
          style={{ marginTop: 4 }}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  right: { alignItems: 'flex-end', gap: 4, minWidth: 60 },
  pills: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  pill: {
    backgroundColor: T.surfaceHi,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: T.hairline,
  },
  pillText: { fontSize: 10, fontWeight: '700', color: T.textDim },
});

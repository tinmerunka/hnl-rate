import { T } from '@/constants/theme';
import type { MatchRatings } from '@/context/auth';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { CommentCard } from '../buzz/CommentCard';

export function BuzzTab({
  ratings,
  motmName,
  matchId,
  loading,
}: {
  ratings: MatchRatings | null;
  motmName?: string;
  matchId: number;
  loading: boolean;
}) {
  const comments = ratings?.comments ?? [];

  if (loading) {
    return (
      <View style={{ paddingTop: 48, alignItems: 'center' }}>
        <ActivityIndicator color={T.red} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {ratings && (
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>ZAJEDNICA</Text>
            <View style={styles.statValueRow}>
              {ratings.averageMatchRating != null ? (
                <Text style={styles.statBig}>
                  {ratings.averageMatchRating.toFixed(1)}
                </Text>
              ) : (
                <Text style={styles.statBig}>—</Text>
              )}
              <Text style={styles.statUnit}>/ 10</Text>
            </View>
            <Text style={styles.statVotes}>{ratings.matchCount} glasova</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>ATMOS.</Text>
            {ratings.averageAtmosphereRating != null ? (
              <Text style={styles.statMid}>
                {ratings.averageAtmosphereRating.toFixed(1)}
              </Text>
            ) : (
              <Text style={styles.statMid}>—</Text>
            )}
            <Text style={styles.statVotes}>{ratings.atmosphereCount}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>SUDAC</Text>
            {ratings.averageRefereeRating != null ? (
              <Text style={styles.statMid}>
                {ratings.averageRefereeRating.toFixed(1)}
              </Text>
            ) : (
              <Text style={styles.statMid}>—</Text>
            )}
            <Text style={styles.statVotes}>{ratings.refereeCount}</Text>
          </View>

          {motmName && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>MVP</Text>
                <Text
                  style={[styles.statMid, { color: T.red, fontSize: 12 }]}
                  numberOfLines={1}
                >
                  {motmName}
                </Text>
              </View>
            </>
          )}
        </View>
      )}

      {comments.length > 0 ? (
        <View style={styles.commentsSection}>
          <Text style={styles.commentsSectionTitle}>KOMENTARI ZAJEDNICE</Text>
          {comments.map((c) => (
            <CommentCard key={c.ratingId} item={c} matchId={matchId} />
          ))}
        </View>
      ) : (
        <View style={styles.takesPlaceholder}>
          <Ionicons name="chatbubble-outline" size={32} color={T.textFaint} />
          <Text style={styles.takesTitle}>Komentari zajednice</Text>
          <Text style={styles.takesSub}>Budi prvi koji će ostaviti komentar.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20 },
  statsCard: {
    backgroundColor: T.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.hairline,
    flexDirection: 'row',
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: T.textFaint,
    letterSpacing: 0.8,
  },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  statBig: {
    fontSize: 28,
    fontWeight: '900',
    color: T.text,
    letterSpacing: -1,
  },
  statUnit: { fontSize: 12, color: T.textFaint },
  statMid: {
    fontSize: 18,
    fontWeight: '800',
    color: T.text,
    letterSpacing: -0.5,
  },
  statVotes: { fontSize: 9, color: T.textFaint, marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: T.hairline },

  takesPlaceholder: {
    alignItems: 'center',
    paddingVertical: 36,
    gap: 10,
    backgroundColor: T.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.hairline,
  },
  takesTitle: { fontSize: 16, fontWeight: '700', color: T.text },
  takesSub: { fontSize: 13, color: T.textDim, textAlign: 'center' },

  commentsSection: { gap: 10 },
  commentsSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: T.textFaint,
    letterSpacing: 1,
    marginBottom: 2,
  },
});

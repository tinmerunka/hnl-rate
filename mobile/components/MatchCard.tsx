import { ClubAvatar } from '@/components/ClubAvatar';
import { T } from '@/constants/theme';
import type { Match } from '@/context/auth';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('hr-HR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('hr-HR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function scoreColor(a: string, b: string) {
  const [ha, hb] = [parseInt(a), parseInt(b)];
  if (isNaN(ha) || isNaN(hb) || ha === hb) return T.draw;
  return ha > hb ? T.win : T.loss;
}

export function MatchCard({ match, onPress }: { match: Match; onPress: () => void }) {
  const [homeScore, awayScore] = match.result ? match.result.split('-') : [null, null];
  const isLive = !match.finished && new Date(match.date) <= new Date();

  return (
    <TouchableOpacity
      style={[styles.card, isLive && styles.cardLive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {isLive && (
        <View style={styles.liveStrip}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>UŽIVO</Text>
        </View>
      )}

      <View style={styles.inner}>
        <View style={styles.teamRow}>
          <ClubAvatar club={match.homeClub} size={28} />
          <Text style={styles.teamName} numberOfLines={1}>
            {match.homeClub.shortName ?? match.homeClub.name}
          </Text>
          {homeScore != null && (
            <Text style={[styles.score, { color: scoreColor(homeScore, awayScore!) }]}>
              {homeScore}
            </Text>
          )}
        </View>

        <View style={styles.teamRow}>
          <ClubAvatar club={match.awayClub} size={28} />
          <Text style={styles.teamName} numberOfLines={1}>
            {match.awayClub.shortName ?? match.awayClub.name}
          </Text>
          {awayScore != null && (
            <Text style={[styles.score, { color: scoreColor(awayScore, homeScore!) }]}>
              {awayScore}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightCol}>
        {match.finished ? (
          <View style={styles.ftBadge}>
            <Text style={styles.ftText}>KRAJ</Text>
          </View>
        ) : (
          <>
            <Text style={styles.time}>{formatTime(match.date)}</Text>
            <Text style={styles.date}>{formatDate(match.date)}</Text>
          </>
        )}
        <Ionicons
          name="chevron-forward"
          size={14}
          color={T.textFaint}
          style={{ marginTop: 6 }}
        />
      </View>
    </TouchableOpacity>
  );
}

export const matchCardStyles = StyleSheet.create({
  card: {
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardLive: {
    borderColor: T.red,
    shadowColor: T.red,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  inner: { flex: 1, paddingVertical: 14, paddingHorizontal: 14, gap: 10 },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  teamName: { flex: 1, fontSize: 14, fontWeight: '600', color: T.text },
  score: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
    minWidth: 18,
    textAlign: 'right',
  },
  ftBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: T.surfaceHi,
    borderWidth: 1,
    borderColor: T.hairline,
  },
  ftText: { fontSize: 10, fontWeight: '800', color: T.textFaint, letterSpacing: 0.5 },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardLive: {
    borderColor: T.red,
    shadowColor: T.red,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  liveStrip: {
    width: 36,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(225,29,42,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRightWidth: 1,
    borderRightColor: 'rgba(225,29,42,0.2)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: T.red,
  },
  liveText: {
    fontSize: 8,
    fontWeight: '800',
    color: T.red,
    letterSpacing: 0.5,
    transform: [{ rotate: '-90deg' }],
    width: 24,
    textAlign: 'center',
  },
  inner: { flex: 1, paddingVertical: 14, paddingHorizontal: 14, gap: 10 },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  teamName: { flex: 1, fontSize: 14, fontWeight: '600', color: T.text },
  score: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
    minWidth: 18,
    textAlign: 'right',
  },
  rightCol: {
    paddingRight: 14,
    alignItems: 'flex-end',
    gap: 2,
  },
  time: {
    fontSize: 14,
    fontWeight: '700',
    color: T.text,
    letterSpacing: -0.3,
  },
  date: {
    fontSize: 10,
    fontWeight: '600',
    color: T.textFaint,
    letterSpacing: 0.2,
  },
  ftBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: T.surfaceHi,
    borderWidth: 1,
    borderColor: T.hairline,
  },
  ftText: { fontSize: 10, fontWeight: '800', color: T.textFaint, letterSpacing: 0.5 },
});

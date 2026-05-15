import { ClubLogo } from '@/components/ClubLogo';
import { T } from '@/constants/theme';
import type { Match } from '@/context/auth';
import { dateLong, timeShort } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function InfoRow({
  icon,
  label,
  value,
  last,
}: {
  icon: any;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={15} color={T.textFaint} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export function UpcomingLayout({
  match,
  insets,
  onBack,
}: {
  match: Match;
  insets: { top: number };
  onBack: () => void;
}) {
  const venue = match.homeClub.venue;
  const dateFormatted = dateLong(match.date);
  const time = timeShort(match.date);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
    >
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="chevron-back" size={20} color={T.text} />
      </TouchableOpacity>

      <Text style={styles.meta}>KOLO {match.round} · NADOLAZEĆA</Text>

      <View style={styles.hero}>
        <View style={styles.clubCol}>
          <ClubLogo club={match.homeClub} size={64} />
          <Text style={styles.clubName} numberOfLines={2}>
            {match.homeClub.shortName ?? match.homeClub.name}
          </Text>
        </View>
        <View style={styles.centre}>
          <Text style={styles.vs}>vs</Text>
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>{time}</Text>
          </View>
        </View>
        <View style={[styles.clubCol, styles.clubColRight]}>
          <ClubLogo club={match.awayClub} size={64} />
          <Text style={[styles.clubName, { textAlign: 'right' }]} numberOfLines={2}>
            {match.awayClub.shortName ?? match.awayClub.name}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <InfoRow icon="trophy-outline" label="Kolo" value={`${match.round}. kolo`} />
        <InfoRow icon="calendar-outline" label="Datum" value={dateFormatted} />
        {match.referee && (
          <InfoRow
            icon="person-outline"
            label="Sudac"
            value={`${match.referee.firstName} ${match.referee.lastName}`}
          />
        )}
        {venue && <InfoRow icon="location-outline" label="Stadion" value={venue} last />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: 20, paddingBottom: 48 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.hairline,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  meta: {
    fontSize: 11,
    fontWeight: '800',
    color: T.textFaint,
    letterSpacing: 1,
    marginBottom: 20,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
  },
  clubCol: { flex: 1, alignItems: 'flex-start', gap: 10 },
  clubColRight: { alignItems: 'flex-end' },
  clubName: { fontSize: 13, fontWeight: '700', color: T.text, lineHeight: 17 },
  centre: { alignItems: 'center', gap: 8 },
  vs: {
    fontSize: 22,
    fontWeight: '800',
    color: T.textFaint,
    letterSpacing: -0.5,
  },
  timeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.hairline,
  },
  timeText: { fontSize: 13, fontWeight: '700', color: T.text },
  infoCard: {
    backgroundColor: T.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.hairline,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: T.hairline },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { fontSize: 14, color: T.textDim },
  infoValue: {
    fontSize: 14,
    color: T.text,
    maxWidth: '55%',
    textAlign: 'right',
  },
});

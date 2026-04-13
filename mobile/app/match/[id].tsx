import { LineupPlayer, Match, MatchLineup, useAuth } from '@/context/auth';
import { getMatch, getMatchLineup } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* ── Helpers ─────────────────────────────────────────────────── */

const POS_SHORT: Record<string, string> = {
  Goalkeeper: 'GK', Defender: 'DF', Midfielder: 'MF', Attacker: 'FW',
};
const POS_COLOR: Record<string, string> = {
  Goalkeeper: '#1A2A0D', Defender: '#0D1A2A', Midfielder: '#1A1200', Attacker: '#1A0000',
};

/* ── Screen ──────────────────────────────────────────────────── */

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();

  const [match, setMatch] = useState<Match | null>(null);
  const [lineup, setLineup] = useState<MatchLineup | null>(null);
  const [loading, setLoading] = useState(true);
  const [lineupLoading, setLineupLoading] = useState(false);

  const matchId = parseInt(id, 10);

  useEffect(() => {
    if (!token) return;

    getMatch(matchId, token)
      .then((m) => {
        setMatch(m);
        // Only fetch lineup for finished matches
        if (m.finished) {
          setLineupLoading(true);
          getMatchLineup(m.id, token)
            .then(setLineup)
            .catch(() => {})
            .finally(() => setLineupLoading(false));
        }
      })
      .catch((e) => Alert.alert('Error', e.message ?? 'Could not load match.'))
      .finally(() => setLoading(false));
  }, [matchId, token]);

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={[styles.backBtn, { position: 'absolute', top: insets.top + 12, left: 20 }]}
          onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <ActivityIndicator color="#CC0000" size="large" />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={[styles.backBtn, { position: 'absolute', top: insets.top + 12, left: 20 }]}
          onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.errorText}>Match not found.</Text>
      </View>
    );
  }

  return match.finished
    ? <PastMatchLayout
        match={match}
        lineup={lineup}
        lineupLoading={lineupLoading}
        insets={insets}
        onBack={() => router.back()}
      />
    : <UpcomingMatchLayout
        match={match}
        insets={insets}
        onBack={() => router.back()}
      />;
}

/* ── Upcoming match ──────────────────────────────────────────── */

function UpcomingMatchLayout({
  match, insets, onBack,
}: {
  match: Match; insets: { top: number }; onBack: () => void;
}) {
  const homeLogo = match.homeClub.crest ?? match.homeClub.logoUrl;
  const awayLogo = match.awayClub.crest ?? match.awayClub.logoUrl;
  const venue = match.homeClub.venue;

  const dateStr = new Date(match.date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}>

      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.hero}>
        <ClubHeroCol name={match.homeClub.name} tla={match.homeClub.tla} logoUri={homeLogo} />
        <View style={styles.centreBox}>
          <Text style={styles.vsText}>vs</Text>
          <View style={styles.upcomingBadge}>
            <Text style={styles.upcomingBadgeText}>Upcoming</Text>
          </View>
        </View>
        <ClubHeroCol name={match.awayClub.name} tla={match.awayClub.tla} logoUri={awayLogo} align="right" />
      </View>

      <View style={styles.infoCard}>
        <InfoRow icon="trophy-outline" label="Round" value={`Round ${match.round}`} />
        <InfoRow icon="calendar-outline" label="Date" value={dateStr} last={!match.referee && !venue} />
        {match.referee && (
          <InfoRow
            icon="person-outline"
            label="Referee"
            value={`${match.referee.firstName} ${match.referee.lastName}`}
            last={!venue}
          />
        )}
        {venue && (
          <InfoRow icon="location-outline" label="Venue" value={venue} last />
        )}
      </View>
    </ScrollView>
  );
}

/* ── Past match ──────────────────────────────────────────────── */

function PastMatchLayout({
  match, lineup, lineupLoading, insets, onBack,
}: {
  match: Match;
  lineup: MatchLineup | null;
  lineupLoading: boolean;
  insets: { top: number };
  onBack: () => void;
}) {
  const homeLogo = match.homeClub.crest ?? match.homeClub.logoUrl;
  const awayLogo = match.awayClub.crest ?? match.awayClub.logoUrl;
  const [homeScore, awayScore] = match.result ? match.result.split('-') : ['?', '?'];

  const dateStr = new Date(match.date).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}>

      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Score hero */}
      <View style={styles.hero}>
        <ClubHeroCol name={match.homeClub.name} tla={match.homeClub.tla} logoUri={homeLogo} />
        <View style={styles.centreBox}>
          <Text style={styles.scoreText}>{homeScore} – {awayScore}</Text>
          <View style={styles.ftBadge}>
            <Text style={styles.ftText}>FT</Text>
          </View>
        </View>
        <ClubHeroCol name={match.awayClub.name} tla={match.awayClub.tla} logoUri={awayLogo} align="right" />
      </View>

      {/* Match info */}
      <View style={styles.infoCard}>
        <InfoRow icon="trophy-outline" label="Round" value={`Round ${match.round}`} />
        <InfoRow icon="calendar-outline" label="Date" value={dateStr} last={!match.referee} />
        {match.referee && (
          <InfoRow
            icon="person-outline"
            label="Referee"
            value={`${match.referee.firstName} ${match.referee.lastName}`}
            last
          />
        )}
      </View>

      {/* Lineups */}
      {lineupLoading ? (
        <ActivityIndicator color="#CC0000" style={{ marginTop: 12 }} />
      ) : lineup ? (
        <LineupSection lineup={lineup} />
      ) : (
        <View style={styles.noLineup}>
          <Text style={styles.noLineupText}>Lineup not available.</Text>
        </View>
      )}
    </ScrollView>
  );
}

/* ── Lineup section ──────────────────────────────────────────── */

function LineupSection({ lineup }: { lineup: MatchLineup }) {
  const homeName = lineup.homeTeam.club.shortName ?? lineup.homeTeam.club.name;
  const awayName = lineup.awayTeam.club.shortName ?? lineup.awayTeam.club.name;

  const hasBench = lineup.homeTeam.bench.length > 0 || lineup.awayTeam.bench.length > 0;

  return (
    <View>
      {/* Column headers */}
      <View style={lup.colHeaders}>
        <Text style={lup.colHeaderLeft} numberOfLines={1}>{homeName.toUpperCase()}</Text>
        <Text style={lup.colHeaderRight} numberOfLines={1}>{awayName.toUpperCase()}</Text>
      </View>

      {/* Starting XI */}
      <View style={lup.sectionHeader}>
        <View style={lup.sectionLine} />
        <Text style={lup.sectionTitle}>STARTING XI</Text>
        <View style={lup.sectionLine} />
      </View>

      <View style={lup.card}>
        <View style={lup.columns}>
          <View style={lup.col}>
            {lineup.homeTeam.startingXI.map((p, i) => (
              <PlayerChip
                key={p.id}
                player={p}
                side="left"
                last={i === lineup.homeTeam.startingXI.length - 1 && !hasBench}
              />
            ))}
          </View>
          <View style={lup.divider} />
          <View style={lup.col}>
            {lineup.awayTeam.startingXI.map((p, i) => (
              <PlayerChip
                key={p.id}
                player={p}
                side="right"
                last={i === lineup.awayTeam.startingXI.length - 1 && !hasBench}
              />
            ))}
          </View>
        </View>

        {/* Bench */}
        {hasBench && (
          <>
            <View style={lup.benchDivider}>
              <View style={lup.benchLine} />
              <Text style={lup.benchTitle}>BENCH</Text>
              <View style={lup.benchLine} />
            </View>
            <View style={lup.columns}>
              <View style={lup.col}>
                {lineup.homeTeam.bench.map((p, i) => (
                  <PlayerChip
                    key={p.id}
                    player={p}
                    side="left"
                    last={i === lineup.homeTeam.bench.length - 1}
                  />
                ))}
              </View>
              <View style={lup.divider} />
              <View style={lup.col}>
                {lineup.awayTeam.bench.map((p, i) => (
                  <PlayerChip
                    key={p.id}
                    player={p}
                    side="right"
                    last={i === lineup.awayTeam.bench.length - 1}
                  />
                ))}
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

/* ── Shared sub-components ───────────────────────────────────── */

function ClubHeroCol({
  name, tla, logoUri, align = 'left',
}: {
  name: string; tla?: string; logoUri?: string | null; align?: 'left' | 'right';
}) {
  return (
    <View style={[styles.clubCol, align === 'right' && styles.clubColRight]}>
      {logoUri ? (
        <Image source={{ uri: logoUri }} style={styles.heroLogo} contentFit="contain" />
      ) : (
        <View style={styles.heroLogoPlaceholder}>
          <Text style={styles.heroLogoInitials}>
            {tla ?? name.slice(0, 3).toUpperCase()}
          </Text>
        </View>
      )}
      <Text style={[styles.clubName, align === 'right' && { textAlign: 'right' }]} numberOfLines={2}>
        {name}
      </Text>
    </View>
  );
}

function InfoRow({
  icon, label, value, last,
}: {
  icon: any; label: string; value: string; last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <View style={styles.infoRowLeft}>
        <Ionicons name={icon} size={15} color="#555555" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function PlayerChip({
  player, side, last,
}: {
  player: LineupPlayer; side: 'left' | 'right'; last: boolean;
}) {
  const pos = player.position
    ? (POS_SHORT[player.position] ?? player.position.slice(0, 2).toUpperCase())
    : '—';
  const posColor = POS_COLOR[player.position ?? ''] ?? '#1A1A1A';

  return (
    <View style={[lup.chip, !last && lup.chipBorder]}>
      {side === 'left' ? (
        <>
          <Text style={lup.number}>{player.number ?? '—'}</Text>
          <Text style={lup.name} numberOfLines={1}>{player.lastName}</Text>
          <View style={[lup.posBadge, { backgroundColor: posColor }]}>
            <Text style={lup.posText}>{pos}</Text>
          </View>
        </>
      ) : (
        <>
          <View style={[lup.posBadge, { backgroundColor: posColor }]}>
            <Text style={lup.posText}>{pos}</Text>
          </View>
          <Text style={[lup.name, { textAlign: 'right' }]} numberOfLines={1}>{player.lastName}</Text>
          <Text style={lup.number}>{player.number ?? '—'}</Text>
        </>
      )}
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { padding: 20, paddingBottom: 48 },
  centered: {
    flex: 1, backgroundColor: '#000000',
    justifyContent: 'center', alignItems: 'center',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  errorText: { color: '#666666', fontSize: 16 },

  hero: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 20, gap: 8,
  },
  clubCol: { flex: 1, alignItems: 'flex-start', gap: 8 },
  clubColRight: { alignItems: 'flex-end' },
  heroLogo: { width: 54, height: 54 },
  heroLogoPlaceholder: {
    width: 54, height: 54, borderRadius: 10,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center',
  },
  heroLogoInitials: { fontSize: 13, fontWeight: '800', color: '#444444' },
  clubName: { fontSize: 12, fontWeight: '700', color: '#CCCCCC' },

  centreBox: { alignItems: 'center', gap: 6, minWidth: 76 },
  scoreText: { fontSize: 30, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  vsText: { fontSize: 20, fontWeight: '700', color: '#333333' },
  ftBadge: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6,
    backgroundColor: '#1A1A1A',
  },
  ftText: { fontSize: 11, fontWeight: '700', color: '#888888' },
  upcomingBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    backgroundColor: '#0D1A00',
  },
  upcomingBadgeText: { fontSize: 11, fontWeight: '700', color: '#4A8A2A' },

  infoCard: {
    backgroundColor: '#111111', borderRadius: 12,
    borderWidth: 1, borderColor: '#1E1E1E',
    marginBottom: 20, overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  infoRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { fontSize: 14, color: '#666666' },
  infoValue: { fontSize: 14, color: '#FFFFFF', maxWidth: '55%', textAlign: 'right' },

  noLineup: { alignItems: 'center', paddingTop: 24 },
  noLineupText: { color: '#333333', fontSize: 13 },
});

const lup = StyleSheet.create({
  colHeaders: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 10, paddingHorizontal: 2,
  },
  colHeaderLeft: {
    flex: 1, fontSize: 11, fontWeight: '800',
    color: '#CC0000', letterSpacing: 1,
  },
  colHeaderRight: {
    flex: 1, fontSize: 11, fontWeight: '800',
    color: '#CC0000', letterSpacing: 1,
    textAlign: 'right',
  },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 8,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: '#1E1E1E' },
  sectionTitle: {
    fontSize: 10, fontWeight: '800', color: '#444444', letterSpacing: 1.2,
  },

  card: {
    backgroundColor: '#111111', borderRadius: 12,
    borderWidth: 1, borderColor: '#1E1E1E',
    overflow: 'hidden', marginBottom: 20,
  },
  columns: { flexDirection: 'row' },
  col: { flex: 1 },
  divider: { width: 1, backgroundColor: '#1E1E1E' },

  benchDivider: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, paddingHorizontal: 12, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: '#1E1E1E',
    backgroundColor: '#0A0A0A',
  },
  benchLine: { flex: 1, height: 1, backgroundColor: '#2A2A2A' },
  benchTitle: {
    fontSize: 9, fontWeight: '800', color: '#333333', letterSpacing: 1.2,
  },

  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 9,
    gap: 4,
  },
  chipBorder: { borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  number: {
    width: 20, fontSize: 10, fontWeight: '700',
    color: '#444444', textAlign: 'center',
  },
  name: { flex: 1, fontSize: 11, fontWeight: '500', color: '#CCCCCC' },
  posBadge: {
    width: 22, height: 16, borderRadius: 3,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  posText: { fontSize: 8, fontWeight: '800', color: '#AAAAAA' },
});

import { Club, Match, useAuth } from '@/context/auth';
import { getClub, getClubMatches, removeFavoriteClub, setFavoriteClub } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token, userProfile, updateProfile } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const clubId = parseInt(id, 10);
  const isFavorite = userProfile?.favoriteClub?.id === clubId;

  const pastMatches = useMemo(
    () => matches.filter((m) => m.finished).reverse(),
    [matches]
  );
  const upcomingMatches = useMemo(
    () => matches.filter((m) => !m.finished),
    [matches]
  );

  useEffect(() => {
    if (!token) return;

    getClub(clubId, token)
      .then(setClub)
      .catch((e) => Alert.alert('Error', e.message ?? 'Could not load club.'))
      .finally(() => setLoading(false));

    getClubMatches(clubId, token)
      .then(setMatches)
      .catch(() => {/* silently show empty */})
      .finally(() => setMatchesLoading(false));
  }, [clubId, token]);

  async function toggleFavorite() {
    if (!token || !club) return;
    setToggling(true);
    try {
      const updated = isFavorite
        ? await removeFavoriteClub(token)
        : await setFavoriteClub(clubId, token);
      updateProfile(updated);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to update favorite.');
    } finally {
      setToggling(false);
    }
  }

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

  if (!club) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={[styles.backBtn, { position: 'absolute', top: insets.top + 12, left: 20 }]}
          onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.errorText}>Club not found.</Text>
      </View>
    );
  }

  const logoUri = club.crest ?? club.logoUrl;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Hero */}
      <View style={styles.hero}>
        {logoUri ? (
          <Image source={{ uri: logoUri }} style={styles.crest} contentFit="contain" />
        ) : (
          <View style={styles.crestPlaceholder}>
            <Text style={styles.crestInitials}>
              {club.tla ?? club.name.slice(0, 3).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.clubName}>{club.name}</Text>
        {club.shortName && <Text style={styles.shortName}>{club.shortName}</Text>}
      </View>

      {/* Info */}
      <View style={styles.card}>
        {club.tla && <DetailRow icon="text-outline" label="TLA" value={club.tla} />}
        {club.founded && (
          <DetailRow icon="calendar-outline" label="Founded" value={String(club.founded)} last={!club.venue && !club.address && !club.website} />
        )}
        {club.venue && (
          <DetailRow icon="location-outline" label="Venue" value={club.venue} last={!club.address && !club.website} />
        )}
        {club.address && (
          <DetailRow icon="map-outline" label="Address" value={club.address} last={!club.website} />
        )}
        {club.website && (
          <DetailRow icon="globe-outline" label="Website" value={club.website} last />
        )}
      </View>

      {/* Favorite */}
      <TouchableOpacity
        style={[styles.favBtn, isFavorite && styles.favBtnActive, toggling && styles.btnDisabled]}
        onPress={toggleFavorite}
        disabled={toggling}
        activeOpacity={0.8}>
        {toggling ? (
          <ActivityIndicator color={isFavorite ? '#CC0000' : '#FFFFFF'} />
        ) : (
          <>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? '#CC0000' : '#FFFFFF'}
            />
            <Text style={[styles.favBtnText, isFavorite && styles.favBtnTextActive]}>
              {isFavorite ? 'Remove from favorites' : 'Set as favorite'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Matches */}
      {matchesLoading ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MATCHES</Text>
          <ActivityIndicator color="#CC0000" style={{ marginTop: 12 }} />
        </View>
      ) : (
        <>
          {upcomingMatches.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>UPCOMING MATCHES</Text>
              {upcomingMatches.map((m) => (
                <MatchCard key={m.id} match={m} clubId={clubId} />
              ))}
            </View>
          )}

          {pastMatches.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>PAST MATCHES</Text>
              {pastMatches.map((m) => (
                <MatchCard key={m.id} match={m} clubId={clubId} />
              ))}
            </View>
          )}

          {matches.length === 0 && (
            <View style={styles.emptyMatches}>
              <Text style={styles.emptyMatchesText}>No matches available.</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function MatchCard({ match, clubId }: { match: Match; clubId: number }) {
  const isHome = match.homeClub.id === clubId;
  const opponent = isHome ? match.awayClub : match.homeClub;
  const opponentLogo = opponent.crest ?? opponent.logoUrl;

  const date = new Date(match.date);
  const dateStr = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const [homScore, awayScore] = match.result ? match.result.split('-') : [null, null];
  const currentClubScore = isHome ? homScore : awayScore;
  const opponentScore = isHome ? awayScore : homScore;

  const won = match.finished && currentClubScore !== null && opponentScore !== null
    ? parseInt(currentClubScore) > parseInt(opponentScore)
    : null;
  const drew = match.finished && currentClubScore !== null && opponentScore !== null
    ? parseInt(currentClubScore) === parseInt(opponentScore)
    : null;

  return (
    <View style={matchStyles.card}>
      <View style={matchStyles.topRow}>
        <Text style={matchStyles.round}>Round {match.round}</Text>
        <Text style={matchStyles.date}>{dateStr}</Text>
      </View>

      <View style={matchStyles.teams}>
        {/* Opponent */}
        <View style={matchStyles.teamBlock}>
          {opponentLogo ? (
            <Image source={{ uri: opponentLogo }} style={matchStyles.logo} contentFit="contain" />
          ) : (
            <View style={matchStyles.logoPlaceholder}>
              <Text style={matchStyles.logoInitials}>
                {opponent.tla ?? opponent.name.slice(0, 3).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={matchStyles.opponentName} numberOfLines={2}>{opponent.name}</Text>
          <Text style={matchStyles.homeAway}>{isHome ? 'HOME' : 'AWAY'}</Text>
        </View>

        {/* Score / VS */}
        <View style={matchStyles.scoreBlock}>
          {match.finished && match.result ? (
            <>
              <Text style={[
                matchStyles.score,
                won === true && matchStyles.scoreWin,
                won === false && matchStyles.scoreLoss,
                drew === true && matchStyles.scoreDraw,
              ]}>
                {isHome
                  ? match.result
                  : `${awayScore}-${homScore}`}
              </Text>
              <View style={[
                matchStyles.badge,
                won === true && matchStyles.badgeWin,
                won === false && matchStyles.badgeLoss,
                drew === true && matchStyles.badgeDraw,
              ]}>
                <Text style={matchStyles.badgeText}>
                  {won === true ? 'W' : drew === true ? 'D' : 'L'}
                </Text>
              </View>
            </>
          ) : (
            <Text style={matchStyles.vs}>vs</Text>
          )}
        </View>
      </View>
    </View>
  );
}

function DetailRow({
  icon, label, value, last,
}: {
  icon: any; label: string; value: string; last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={15} color="#555555" />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={styles.rowValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

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
    marginBottom: 8,
  },
  errorText: { color: '#666666', fontSize: 16 },
  hero: { alignItems: 'center', paddingVertical: 20, marginBottom: 20 },
  crest: { width: 90, height: 90, marginBottom: 14 },
  crestPlaceholder: {
    width: 90, height: 90, borderRadius: 16,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  crestInitials: { fontSize: 22, fontWeight: '800', color: '#444444', letterSpacing: 1 },
  clubName: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: 4 },
  shortName: { fontSize: 14, color: '#666666', textAlign: 'center' },
  card: {
    backgroundColor: '#111111', borderRadius: 12,
    borderWidth: 1, borderColor: '#1E1E1E',
    marginBottom: 14, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowLabel: { fontSize: 14, color: '#666666' },
  rowValue: { fontSize: 14, color: '#FFFFFF', maxWidth: '55%', textAlign: 'right' },
  favBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#CC0000',
    paddingVertical: 16, borderRadius: 12, minHeight: 52, marginBottom: 28,
  },
  favBtnActive: {
    backgroundColor: '#0D0000', borderWidth: 1, borderColor: '#2A1A1A',
  },
  favBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  favBtnTextActive: { color: '#CC0000' },
  btnDisabled: { opacity: 0.6 },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#444444',
    letterSpacing: 1.2, marginBottom: 10,
  },
  emptyMatches: { alignItems: 'center', paddingTop: 16 },
  emptyMatchesText: { color: '#333333', fontSize: 14 },
});

const matchStyles = StyleSheet.create({
  card: {
    backgroundColor: '#111111', borderRadius: 12,
    borderWidth: 1, borderColor: '#1E1E1E',
    padding: 14, marginBottom: 8,
  },
  topRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 12,
  },
  round: { fontSize: 12, color: '#555555', fontWeight: '600' },
  date: { fontSize: 12, color: '#444444' },
  teams: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  teamBlock: { flex: 1, alignItems: 'center', gap: 6 },
  logo: { width: 40, height: 40 },
  logoPlaceholder: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center',
  },
  logoInitials: { fontSize: 10, fontWeight: '700', color: '#444444' },
  opponentName: {
    fontSize: 13, fontWeight: '600', color: '#CCCCCC',
    textAlign: 'center', maxWidth: 110,
  },
  homeAway: { fontSize: 10, color: '#444444', fontWeight: '600', letterSpacing: 0.8 },
  scoreBlock: { width: 70, alignItems: 'center', gap: 6 },
  score: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  scoreWin: { color: '#22C55E' },
  scoreLoss: { color: '#CC0000' },
  scoreDraw: { color: '#F59E0B' },
  badge: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 6, backgroundColor: '#1A1A1A',
  },
  badgeWin: { backgroundColor: '#052E16' },
  badgeLoss: { backgroundColor: '#1A0000' },
  badgeDraw: { backgroundColor: '#1C1200' },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  vs: { fontSize: 18, fontWeight: '700', color: '#333333' },
});

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

type Filter = 'upcoming' | 'past';

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
  const [filter, setFilter] = useState<Filter>('upcoming');

  const clubId = parseInt(id, 10);
  const isFavorite = userProfile?.favoriteClub?.id === clubId;

  // Upcoming: sorted nearest-first
  const upcomingMatches = useMemo(
    () =>
      matches
        .filter((m) => !m.finished)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [matches]
  );
  // Past: most-recent first
  const pastMatches = useMemo(
    () => matches.filter((m) => m.finished).reverse(),
    [matches]
  );

  const nextMatch = upcomingMatches[0] ?? null;
  const otherUpcoming = upcomingMatches.slice(1);

  useEffect(() => {
    if (!token) return;

    getClub(clubId, token)
      .then(setClub)
      .catch((e) => Alert.alert('Error', e.message ?? 'Could not load club.'))
      .finally(() => setLoading(false));

    getClubMatches(clubId, token)
      .then(setMatches)
      .catch(() => {})
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

      {/* Compact hero */}
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
        <View style={styles.heroText}>
          <Text style={styles.clubName} numberOfLines={1}>{club.name}</Text>
          {(club.shortName || club.tla) && (
            <Text style={styles.clubMeta}>
              {[club.shortName, club.tla].filter(Boolean).join(' · ')}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.favIcon, toggling && styles.btnDisabled]}
          onPress={toggleFavorite}
          disabled={toggling}
          activeOpacity={0.7}>
          {toggling ? (
            <ActivityIndicator size="small" color="#CC0000" />
          ) : (
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#CC0000' : '#555555'}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(['upcoming', 'past'] as Filter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.7}>
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f === 'upcoming' ? 'Upcoming' : 'Past'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Match list */}
      {matchesLoading ? (
        <ActivityIndicator color="#CC0000" style={{ marginTop: 24 }} />
      ) : filter === 'upcoming' ? (
        <>
          {nextMatch && (
            <FeaturedMatchCard match={nextMatch} />
          )}
          {otherUpcoming.map((m) => (
            <MatchCard key={m.id} match={m} clubId={clubId} />
          ))}
          {upcomingMatches.length === 0 && (
            <EmptyState text="No upcoming matches scheduled." />
          )}
        </>
      ) : (
        <>
          {pastMatches.map((m) => (
            <MatchCard key={m.id} match={m} clubId={clubId} />
          ))}
          {pastMatches.length === 0 && (
            <EmptyState text="No past matches available." />
          )}
        </>
      )}
    </ScrollView>
  );
}

/* ── Featured "Next Match" card ─────────────────────────────── */

function FeaturedMatchCard({ match }: { match: Match }) {
  const router = useRouter();

  const homeLogo = match.homeClub.crest ?? match.homeClub.logoUrl;
  const awayLogo = match.awayClub.crest ?? match.awayClub.logoUrl;

  const date = new Date(match.date);
  const dateStr = date.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <TouchableOpacity
      style={feat.card}
      onPress={() => router.push(`/match/${match.id}` as any)}
      activeOpacity={0.75}>

      <View style={feat.header}>
        <View style={feat.nextBadge}>
          <Text style={feat.nextText}>NEXT MATCH</Text>
        </View>
        <Text style={feat.roundText}>Round {match.round}</Text>
      </View>

      <View style={feat.teams}>
        <View style={feat.teamBlock}>
          {homeLogo ? (
            <Image source={{ uri: homeLogo }} style={feat.logo} contentFit="contain" />
          ) : (
            <View style={feat.logoPlaceholder}>
              <Text style={feat.logoInitials}>
                {match.homeClub.tla ?? match.homeClub.name.slice(0, 3).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={feat.clubName} numberOfLines={2}>{match.homeClub.name}</Text>
          <Text style={feat.homeAway}>HOME</Text>
        </View>

        <View style={feat.vsBlock}>
          <Text style={feat.vs}>vs</Text>
        </View>

        <View style={feat.teamBlock}>
          {awayLogo ? (
            <Image source={{ uri: awayLogo }} style={feat.logo} contentFit="contain" />
          ) : (
            <View style={feat.logoPlaceholder}>
              <Text style={feat.logoInitials}>
                {match.awayClub.tla ?? match.awayClub.name.slice(0, 3).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={feat.clubName} numberOfLines={2}>{match.awayClub.name}</Text>
          <Text style={feat.homeAway}>AWAY</Text>
        </View>
      </View>

      <View style={feat.footer}>
        <View style={feat.footerRow}>
          <Ionicons name="calendar-outline" size={13} color="#555555" />
          <Text style={feat.footerText}>{dateStr}</Text>
        </View>
        {match.referee && (
          <View style={feat.footerRow}>
            <Ionicons name="person-outline" size={13} color="#555555" />
            <Text style={feat.footerText}>
              {match.referee.firstName} {match.referee.lastName}
            </Text>
          </View>
        )}
        {match.homeClub.venue && (
          <View style={feat.footerRow}>
            <Ionicons name="location-outline" size={13} color="#555555" />
            <Text style={feat.footerText}>{match.homeClub.venue}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

/* ── Compact match card ─────────────────────────────────────── */

function MatchCard({ match, clubId }: { match: Match; clubId: number }) {
  const router = useRouter();
  const isHome = match.homeClub.id === clubId;

  const homeLogo = match.homeClub.crest ?? match.homeClub.logoUrl;
  const awayLogo = match.awayClub.crest ?? match.awayClub.logoUrl;

  const date = new Date(match.date);
  const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  const [homeScore, awayScore] = match.result ? match.result.split('-') : [null, null];
  const myScore = isHome ? homeScore : awayScore;
  const theirScore = isHome ? awayScore : homeScore;

  const won = myScore !== null && theirScore !== null
    ? parseInt(myScore) > parseInt(theirScore) : null;
  const drew = myScore !== null && theirScore !== null
    ? parseInt(myScore) === parseInt(theirScore) : null;

  return (
    <TouchableOpacity
      style={mc.card}
      onPress={() => router.push(`/match/${match.id}` as any)}
      activeOpacity={0.7}>

      <View style={mc.row}>
        {/* Home */}
        <View style={mc.teamSide}>
          {homeLogo ? (
            <Image source={{ uri: homeLogo }} style={mc.logo} contentFit="contain" />
          ) : (
            <View style={mc.logoPlaceholder}>
              <Text style={mc.logoInitials}>
                {match.homeClub.tla ?? match.homeClub.name.slice(0, 3).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={mc.tla} numberOfLines={1}>
            {match.homeClub.tla ?? match.homeClub.name.slice(0, 3).toUpperCase()}
          </Text>
        </View>

        {/* Centre */}
        <View style={mc.centre}>
          {match.finished && match.result ? (
            <Text style={[
              mc.score,
              won === true && (isHome ? mc.scoreWin : mc.scoreLoss),
              won === false && (isHome ? mc.scoreLoss : mc.scoreWin),
              drew === true && mc.scoreDraw,
            ]}>
              {match.result}
            </Text>
          ) : (
            <Text style={mc.vs}>vs</Text>
          )}
        </View>

        {/* Away */}
        <View style={[mc.teamSide, mc.teamSideRight]}>
          <Text style={mc.tla} numberOfLines={1}>
            {match.awayClub.tla ?? match.awayClub.name.slice(0, 3).toUpperCase()}
          </Text>
          {awayLogo ? (
            <Image source={{ uri: awayLogo }} style={mc.logo} contentFit="contain" />
          ) : (
            <View style={mc.logoPlaceholder}>
              <Text style={mc.logoInitials}>
                {match.awayClub.tla ?? match.awayClub.name.slice(0, 3).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Meta */}
      <View style={mc.meta}>
        <Text style={mc.metaText}>R{match.round} · {dateStr}</Text>
        {match.finished && myScore !== null && (
          <View style={[
            mc.badge,
            won === true && mc.badgeWin,
            won === false && mc.badgeLoss,
            drew === true && mc.badgeDraw,
          ]}>
            <Text style={mc.badgeText}>
              {won === true ? 'W' : drew === true ? 'D' : 'L'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

/* ── Empty state ─────────────────────────────────────────────── */

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */

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
    marginBottom: 16,
  },
  errorText: { color: '#666666', fontSize: 16 },

  // Hero
  hero: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginBottom: 20,
  },
  crest: { width: 52, height: 52, flexShrink: 0 },
  crestPlaceholder: {
    width: 52, height: 52, borderRadius: 10,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  crestInitials: { fontSize: 14, fontWeight: '800', color: '#444444' },
  heroText: { flex: 1 },
  clubName: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  clubMeta: { fontSize: 12, color: '#555555', marginTop: 2 },
  favIcon: { padding: 6 },
  btnDisabled: { opacity: 0.5 },

  // Filter
  filterRow: {
    flexDirection: 'row', gap: 8,
    marginBottom: 18,
  },
  filterTab: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#111111',
    borderWidth: 1, borderColor: '#1E1E1E',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#1A0000',
    borderColor: '#CC0000',
  },
  filterTabText: { fontSize: 13, fontWeight: '700', color: '#555555' },
  filterTabTextActive: { color: '#CC0000' },

  empty: { alignItems: 'center', paddingTop: 32 },
  emptyText: { color: '#333333', fontSize: 14 },
});

// Featured card styles
const feat = StyleSheet.create({
  card: {
    backgroundColor: '#0D0000',
    borderRadius: 14,
    borderWidth: 1, borderColor: '#3A0000',
    padding: 16, marginBottom: 12,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  nextBadge: {
    backgroundColor: '#CC0000',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5,
  },
  nextText: { fontSize: 10, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.8 },
  roundText: { fontSize: 12, color: '#555555', fontWeight: '600' },
  teams: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 16,
  },
  teamBlock: { flex: 1, alignItems: 'center', gap: 6 },
  logo: { width: 44, height: 44 },
  logoPlaceholder: {
    width: 44, height: 44, borderRadius: 8,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center',
  },
  logoInitials: { fontSize: 11, fontWeight: '700', color: '#444444' },
  clubName: {
    fontSize: 13, fontWeight: '600', color: '#CCCCCC',
    textAlign: 'center', maxWidth: 120,
  },
  homeAway: { fontSize: 10, color: '#444444', fontWeight: '600', letterSpacing: 0.8 },
  vsBlock: { width: 50, alignItems: 'center' },
  vs: { fontSize: 16, fontWeight: '800', color: '#333333' },
  footer: { gap: 5, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1A0000' },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  footerText: { fontSize: 12, color: '#666666' },
});

// Compact match card styles
const mc = StyleSheet.create({
  card: {
    backgroundColor: '#111111', borderRadius: 10,
    borderWidth: 1, borderColor: '#1E1E1E',
    paddingHorizontal: 12, paddingVertical: 10,
    marginBottom: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  teamSide: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  teamSideRight: { justifyContent: 'flex-end' },
  logo: { width: 26, height: 26 },
  logoPlaceholder: {
    width: 26, height: 26, borderRadius: 5,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center',
  },
  logoInitials: { fontSize: 8, fontWeight: '700', color: '#444444' },
  tla: { fontSize: 12, fontWeight: '700', color: '#CCCCCC', flexShrink: 1 },
  centre: { width: 64, alignItems: 'center' },
  score: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  scoreWin: { color: '#22C55E' },
  scoreLoss: { color: '#CC0000' },
  scoreDraw: { color: '#F59E0B' },
  vs: { fontSize: 13, fontWeight: '700', color: '#333333' },
  meta: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 6,
  },
  metaText: { fontSize: 11, color: '#444444' },
  badge: {
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 4, backgroundColor: '#1A1A1A',
  },
  badgeWin: { backgroundColor: '#052E16' },
  badgeLoss: { backgroundColor: '#1A0000' },
  badgeDraw: { backgroundColor: '#1C1200' },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
});

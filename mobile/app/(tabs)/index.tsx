import { T } from '@/constants/theme';
import { Match, UserMatchRating, useAuth } from '@/context/auth';
import { getClubMatches, getMatchesByRound, getUserRatings } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* ── helpers ─────────────────────────────────────────── */

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function scoreColor(a: string, b: string) {
  const [ha, hb] = [parseInt(a), parseInt(b)];
  if (isNaN(ha) || isNaN(hb) || ha === hb) return T.draw;
  return ha > hb ? T.win : T.loss;
}

/* ── ClubAvatar ──────────────────────────────────────── */

function ClubAvatar({ club, size = 32 }: { club: { name: string; crest?: string; logoUrl?: string; tla?: string }; size?: number }) {
  const uri = club.crest ?? club.logoUrl;
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size }} contentFit="contain" />;
  }
  return (
    <View style={[av.placeholder, { width: size, height: size, borderRadius: size * 0.22 }]}>
      <Text style={[av.initials, { fontSize: size * 0.33 }]}>
        {club.tla ?? club.name.slice(0, 3).toUpperCase()}
      </Text>
    </View>
  );
}

const av = StyleSheet.create({
  placeholder: { backgroundColor: T.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: T.hairline },
  initials: { color: T.textFaint, fontWeight: '800', letterSpacing: 0.5 },
});

/* ── MatchCard ───────────────────────────────────────── */

function MatchCard({ match, onPress }: { match: Match; onPress: () => void }) {
  const [homeScore, awayScore] = match.result ? match.result.split('-') : [null, null];
  const isLive = !match.finished && new Date(match.date) <= new Date();
  const isUpcoming = !match.finished && !isLive;

  return (
    <TouchableOpacity style={[mc.card, isLive && mc.cardLive]} onPress={onPress} activeOpacity={0.75}>
      {/* Live indicator */}
      {isLive && (
        <View style={mc.liveStrip}>
          <View style={mc.liveDot} />
          <Text style={mc.liveText}>LIVE</Text>
        </View>
      )}

      <View style={mc.inner}>
        {/* Home team */}
        <View style={mc.teamRow}>
          <ClubAvatar club={match.homeClub} size={28} />
          <Text style={mc.teamName} numberOfLines={1}>{match.homeClub.shortName ?? match.homeClub.name}</Text>
          {homeScore != null && (
            <Text style={[mc.score, { color: scoreColor(homeScore, awayScore!) }]}>{homeScore}</Text>
          )}
        </View>

        {/* Away team */}
        <View style={mc.teamRow}>
          <ClubAvatar club={match.awayClub} size={28} />
          <Text style={mc.teamName} numberOfLines={1}>{match.awayClub.shortName ?? match.awayClub.name}</Text>
          {awayScore != null && (
            <Text style={[mc.score, { color: scoreColor(awayScore, homeScore!) }]}>{awayScore}</Text>
          )}
        </View>
      </View>

      {/* Right column */}
      <View style={mc.rightCol}>
        {match.finished ? (
          <View style={mc.ftBadge}><Text style={mc.ftText}>FT</Text></View>
        ) : (
          <>
            <Text style={mc.time}>{formatTime(match.date)}</Text>
            <Text style={mc.date}>{formatDate(match.date)}</Text>
          </>
        )}
        <Ionicons name="chevron-forward" size={14} color={T.textFaint} style={{ marginTop: 6 }} />
      </View>
    </TouchableOpacity>
  );
}

const mc = StyleSheet.create({
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
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teamName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
  },
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
  ftText: {
    fontSize: 10,
    fontWeight: '800',
    color: T.textFaint,
    letterSpacing: 0.5,
  },
});

/* ── Section header ──────────────────────────────────── */

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <View style={sh.row}>
      <Text style={sh.title}>{title}</Text>
      {count != null && count > 0 && <Text style={sh.count}>{count}</Text>}
    </View>
  );
}

const sh = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 10 },
  title: { fontSize: 17, fontWeight: '800', color: T.text, letterSpacing: -0.5 },
  count: { fontSize: 13, color: T.textFaint, fontWeight: '600' },
});

/* ── Round selector ──────────────────────────────────── */

function RoundPill({ round, onPrev, onNext, loading }: {
  round: number; onPrev: () => void; onNext: () => void; loading: boolean;
}) {
  return (
    <View style={rp.pill}>
      <TouchableOpacity onPress={onPrev} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} disabled={round <= 1}>
        <Ionicons name="chevron-back" size={16} color={round <= 1 ? T.textFaint : T.textDim} />
      </TouchableOpacity>
      <View style={rp.center}>
        {loading
          ? <ActivityIndicator size="small" color={T.textDim} />
          : (
            <>
              <Text style={rp.label}>Round {round}</Text>
              <Text style={rp.dot}> · </Text>
              <Text style={rp.sub}>SuperSport HNL</Text>
            </>
          )}
      </View>
      <TouchableOpacity onPress={onNext} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="chevron-forward" size={16} color={T.textDim} />
      </TouchableOpacity>
    </View>
  );
}

const rp = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: T.surface,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: T.hairline,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  center: { flexDirection: 'row', alignItems: 'center', minHeight: 20, justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '700', color: T.text, letterSpacing: 0.1 },
  dot: { fontSize: 13, color: T.textFaint },
  sub: { fontSize: 13, color: T.textFaint },
});

/* ── Segmented control ───────────────────────────────── */

type Tab = 'all' | 'myclub' | 'rated';

function SegmentedControl({ active, onChange }: {
  active: Tab;
  onChange: (v: Tab) => void;
}) {
  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'myclub', label: 'My Club' },
    { key: 'rated', label: 'Rated' },
  ];
  return (
    <View style={seg.wrap}>
      {tabs.map(t => (
        <TouchableOpacity
          key={t.key}
          style={[seg.btn, active === t.key && seg.btnActive]}
          onPress={() => onChange(t.key)}
          activeOpacity={0.7}>
          <Text style={[seg.label, active === t.key && seg.labelActive]}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const seg = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: T.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.hairline,
    padding: 3,
    gap: 3,
  },
  btn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  btnActive: { backgroundColor: T.red },
  label: { fontSize: 13, fontWeight: '700', color: T.textDim },
  labelActive: { color: '#FFFFFF' },
});

/* ── My Club feed ────────────────────────────────────── */

function MyClubFeed({ token }: { token: string }) {
  const { userProfile } = useAuth();
  const router = useRouter();
  const favoriteClub = userProfile?.favoriteClub;

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(silent = false) {
    if (!favoriteClub) { setLoading(false); return; }
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await getClubMatches(favoriteClub.id, token);
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setMatches(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load matches.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, [favoriteClub?.id]);

  function goToMatch(m: Match) {
    router.push({ pathname: '/match/[id]' as any, params: { id: m.id } });
  }

  if (!favoriteClub) {
    return (
      <View style={cl.empty}>
        <Ionicons name="heart-outline" size={40} color={T.textFaint} />
        <Text style={cl.emptyTitle}>No favourite club</Text>
        <Text style={cl.emptySub}>Pick a club to follow and see all their matches here.</Text>
        <TouchableOpacity style={cl.emptyBtn} onPress={() => router.push('/(tabs)/clubs' as any)}>
          <Text style={cl.emptyBtnText}>Browse clubs</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const now = new Date();
  const upcoming = matches.filter(m => !m.finished && new Date(m.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const finished = matches.filter(m => m.finished);

  return (
    <ScrollView
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={T.red} />
      }>

      {loading ? (
        <View style={s.centered}><ActivityIndicator color={T.red} size="large" /></View>
      ) : error ? (
        <View style={s.errorWrap}>
          <Ionicons name="alert-circle-outline" size={40} color={T.textFaint} />
          <Text style={s.errorTitle}>Could not load matches</Text>
          <Text style={s.errorSub}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => load()}>
            <Text style={s.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Club header */}
          <View style={cl.clubHeader}>
            <ClubAvatar club={favoriteClub} size={36} />
            <View>
              <Text style={cl.clubName}>{favoriteClub.name}</Text>
              <Text style={cl.clubSub}>{matches.length} matches</Text>
            </View>
          </View>

          {finished.length > 0 && (
            <View style={s.section}>
              <SectionHeader title="Results" count={finished.length} />
              {finished.map(m => (
                <View key={m.id} style={{ marginBottom: 8 }}>
                  <MatchCard match={m} onPress={() => goToMatch(m)} />
                </View>
              ))}
            </View>
          )}

          {upcoming.length > 0 && (
            <View style={s.section}>
              <SectionHeader title="Upcoming" count={upcoming.length} />
              {upcoming.map(m => (
                <View key={m.id} style={{ marginBottom: 8 }}>
                  <MatchCard match={m} onPress={() => goToMatch(m)} />
                </View>
              ))}
            </View>
          )}

          {matches.length === 0 && (
            <View style={s.centered}>
              <Ionicons name="football-outline" size={40} color={T.textFaint} />
              <Text style={s.emptyText}>No matches found</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const cl = StyleSheet.create({
  clubHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: T.hairline,
  },
  clubName: { fontSize: 16, fontWeight: '800', color: T.text, letterSpacing: -0.3 },
  clubSub: { fontSize: 12, color: T.textFaint, fontWeight: '500', marginTop: 1 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80, gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: T.text },
  emptySub: { fontSize: 14, color: T.textDim, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    marginTop: 4, paddingHorizontal: 24, paddingVertical: 11,
    borderRadius: 12, backgroundColor: T.red,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

/* ── Rated feed ─────────────────────────────────────── */

function RatedMatchCard({ rating, onPress }: { rating: UserMatchRating; onPress: () => void }) {
  const [homeScore, awayScore] = rating.result ? rating.result.split(':') : [null, null];

  return (
    <TouchableOpacity style={[mc.card, { paddingRight: 14 }]} onPress={onPress} activeOpacity={0.75}>
      <View style={mc.inner}>
        <View style={mc.teamRow}>
          <Text style={mc.teamName} numberOfLines={1}>{rating.homeClub}</Text>
          {homeScore != null && <Text style={[mc.score, { color: T.text }]}>{homeScore}</Text>}
        </View>
        <View style={mc.teamRow}>
          <Text style={mc.teamName} numberOfLines={1}>{rating.awayClub}</Text>
          {awayScore != null && <Text style={[mc.score, { color: T.text }]}>{awayScore}</Text>}
        </View>
      </View>
      <View style={rdf.right}>
        <View style={mc.ftBadge}><Text style={mc.ftText}>FT</Text></View>
        <View style={rdf.pills}>
          {rating.matchRating && <View style={rdf.pill}><Text style={rdf.pillText}>⚽ {rating.matchRating.rating}</Text></View>}
          {rating.refereeRating && <View style={rdf.pill}><Text style={rdf.pillText}>🏁 {rating.refereeRating.rating}</Text></View>}
          {rating.atmosphereRating && <View style={rdf.pill}><Text style={rdf.pillText}>🔥 {rating.atmosphereRating.rating}</Text></View>}
        </View>
        <Ionicons name="chevron-forward" size={14} color={T.textFaint} style={{ marginTop: 4 }} />
      </View>
    </TouchableOpacity>
  );
}

const rdf = StyleSheet.create({
  right: { alignItems: 'flex-end', gap: 4, minWidth: 60 },
  pills: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' },
  pill: {
    backgroundColor: T.surfaceHi, borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 2,
    borderWidth: 1, borderColor: T.hairline,
  },
  pillText: { fontSize: 10, fontWeight: '700', color: T.textDim },
});

function RatedFeed({ token }: { token: string }) {
  const router = useRouter();
  const [ratings, setRatings] = useState<UserMatchRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await getUserRatings(token);
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRatings(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load ratings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <ScrollView
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={T.red} />
      }>
      {loading ? (
        <View style={s.centered}><ActivityIndicator color={T.red} size="large" /></View>
      ) : error ? (
        <View style={s.errorWrap}>
          <Ionicons name="alert-circle-outline" size={40} color={T.textFaint} />
          <Text style={s.errorTitle}>Could not load ratings</Text>
          <Text style={s.errorSub}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => load()}>
            <Text style={s.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : ratings.length === 0 ? (
        <View style={s.centered}>
          <Ionicons name="star-outline" size={40} color={T.textFaint} />
          <Text style={s.emptyText}>No rated matches yet</Text>
        </View>
      ) : (
        <View style={s.section}>
          <SectionHeader title="Your Ratings" count={ratings.length} />
          {ratings.map(r => (
            <View key={r.matchId} style={{ marginBottom: 8 }}>
              <RatedMatchCard
                rating={r}
                onPress={() => router.push({ pathname: '/match/[id]' as any, params: { id: r.matchId } })}
              />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

/* ── Screen ──────────────────────────────────────────── */

const STARTING_ROUND = 32;

export default function MatchesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const [round, setRound] = useState(STARTING_ROUND);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadRound(r: number, silent = false) {
    if (!token) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await getMatchesByRound(r, token);
      setMatches(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load matches.');
      setMatches([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { loadRound(round); }, [token, round]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRound(round, true);
  }, [token, round]);

  const { finished, upcoming, live } = useMemo(() => {
    const now = new Date();
    const fin: Match[] = [];
    const up: Match[] = [];
    const lv: Match[] = [];
    for (const m of matches) {
      if (m.finished) fin.push(m);
      else if (new Date(m.date) <= now) lv.push(m);
      else up.push(m);
    }
    return { finished: fin, upcoming: up, live: lv };
  }, [matches]);

  function goToMatch(m: Match) {
    router.push({ pathname: '/match/[id]' as any, params: { id: m.id } });
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.logoMark}>
            {[0,1,2,3,4,5,6].map(i =>
              [0,1,2,3,4,5,6].map(j =>
                (i+j) % 2 === 0
                  ? <View key={`${i}-${j}`} style={{ position: 'absolute', left: i*3.4, top: j*3.4, width: 3.4, height: 3.4, backgroundColor: '#fff' }} />
                  : null
              )
            )}
          </View>
          <Text style={s.headerTitle}>HNL Rate</Text>
        </View>
        <View style={s.headerRight}>
          <View style={s.iconBtn}>
            <Ionicons name="search-outline" size={18} color={T.textDim} />
          </View>
        </View>
      </View>

      {/* Tab selector */}
      <SegmentedControl active={activeTab} onChange={setActiveTab} />

      {/* My Club feed */}
      {activeTab === 'myclub' && token && <MyClubFeed token={token} />}

      {/* Rated feed */}
      {activeTab === 'rated' && token && <RatedFeed token={token} />}

      {/* Round pill — only for All tab */}
      {activeTab === 'all' && (
        <RoundPill
          round={round}
          loading={loading && !refreshing}
          onPrev={() => { if (round > 1) setRound(r => r - 1); }}
          onNext={() => setRound(r => r + 1)}
        />
      )}

      {activeTab === 'all' && <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.red} />
        }>

        {error ? (
          <View style={s.errorWrap}>
            <Ionicons name="alert-circle-outline" size={40} color={T.textFaint} />
            <Text style={s.errorTitle}>No matches found</Text>
            <Text style={s.errorSub}>{error}</Text>
            <TouchableOpacity style={s.retryBtn} onPress={() => loadRound(round)}>
              <Text style={s.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <View style={s.centered}>
            <ActivityIndicator color={T.red} size="large" />
          </View>
        ) : matches.length === 0 ? (
          <View style={s.centered}>
            <Ionicons name="football-outline" size={40} color={T.textFaint} />
            <Text style={s.emptyText}>No matches for Round {round}</Text>
          </View>
        ) : (
          <>
            {/* Live */}
            {live.length > 0 && (
              <View style={s.section}>
                <View style={s.liveHeader}>
                  <View style={s.liveBullet} />
                  <Text style={s.liveLabel}>LIVE NOW</Text>
                  <View style={s.hairline} />
                  <Text style={s.liveCount}>{live.length} match{live.length > 1 ? 'es' : ''}</Text>
                </View>
                {live.map(m => (
                  <View key={m.id} style={{ marginBottom: 8 }}>
                    <MatchCard match={m} onPress={() => goToMatch(m)} />
                  </View>
                ))}
              </View>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <View style={s.section}>
                <SectionHeader title="Upcoming" count={upcoming.length} />
                {upcoming.map(m => (
                  <View key={m.id} style={{ marginBottom: 8 }}>
                    <MatchCard match={m} onPress={() => goToMatch(m)} />
                  </View>
                ))}
              </View>
            )}

            {/* Finished */}
            {finished.length > 0 && (
              <View style={s.section}>
                <SectionHeader title="Results" count={finished.length} />
                {finished.map(m => (
                  <View key={m.id} style={{ marginBottom: 8 }}>
                    <MatchCard match={m} onPress={() => goToMatch(m)} />
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 4,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: T.red,
    overflow: 'hidden',
    position: 'relative',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: T.text, letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: T.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.hairline,
  },

  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  section: { marginBottom: 24 },

  liveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  liveBullet: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: T.red,
    shadowColor: T.red,
    shadowOpacity: 0.6,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  liveLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: T.red,
    letterSpacing: 1,
  },
  hairline: { flex: 1, height: 1, backgroundColor: T.hairline },
  liveCount: { fontSize: 11, color: T.textFaint, fontWeight: '600' },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { color: T.textFaint, fontSize: 15, fontWeight: '500' },

  errorWrap: { paddingTop: 80, alignItems: 'center', gap: 12 },
  errorTitle: { fontSize: 17, fontWeight: '700', color: T.text },
  errorSub: { fontSize: 13, color: T.textDim, textAlign: 'center', maxWidth: 260 },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.hairline,
  },
  retryText: { fontSize: 14, fontWeight: '600', color: T.text },
});

import { T } from '@/constants/theme';
import { RatedAtmosphere, RatedMatch, RatedPlayer, RatedReferee, TopRated } from '@/context/auth';
import { useAuth } from '@/context/auth';
import { getTopRated } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const POSITION_LABEL: Record<string, string> = {
  Goalkeeper: 'Golman',
  Defender: 'Branič',
  Midfielder: 'Vezni',
  Attacker: 'Napadač',
};

const POSITION_ICON: Record<string, string> = {
  Goalkeeper: 'hand-left-outline',
  Defender: 'shield-outline',
  Midfielder: 'sync-outline',
  Attacker: 'football-outline',
};

function ratingColor(r: number) {
  if (r >= 7) return T.win;
  if (r >= 5) return T.draw;
  return T.loss;
}

function RatingBadge({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const color = ratingColor(value);
  const big = size === 'md';
  return (
    <View style={[s.badge, { borderColor: color, backgroundColor: color + '22' }]}>
      <Text style={[s.badgeText, { color, fontSize: big ? 18 : 14 }]}>{value.toFixed(1)}</Text>
    </View>
  );
}

function SectionHeader({ label, icon }: { label: string; icon: string }) {
  return (
    <View style={s.sectionHeader}>
      <Ionicons name={icon as any} size={14} color={T.textFaint} />
      <Text style={s.sectionLabel}>{label}</Text>
    </View>
  );
}

function MatchCard({ item, accent, tag }: { item: RatedMatch; accent: string; tag: string }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={[s.card, { borderLeftColor: accent, borderLeftWidth: 3 }]}
      onPress={() => router.push({ pathname: '/match/[id]' as any, params: { id: item.matchId } })}
      activeOpacity={0.75}>
      <View style={s.cardTop}>
        <View style={s.tagWrap}>
          <Text style={[s.tag, { color: accent }]}>{tag}</Text>
        </View>
        <RatingBadge value={item.avgRating} />
      </View>
      <Text style={s.matchTitle} numberOfLines={1}>
        {item.homeClub} — {item.awayClub}
      </Text>
      <Text style={s.matchSub}>
        Kolo {item.round}
        {item.result ? ` · ${item.result}` : ''}
        {' · '}{item.voteCount} {item.voteCount === 1 ? 'glas' : 'glasova'}
      </Text>
    </TouchableOpacity>
  );
}

function PlayerCard({ item }: { item: RatedPlayer }) {
  const icon = POSITION_ICON[item.position] ?? 'person-outline';
  const label = POSITION_LABEL[item.position] ?? item.position;
  return (
    <View style={s.playerCard}>
      <View style={s.playerIconWrap}>
        <Ionicons name={icon as any} size={18} color={T.red} />
      </View>
      <Text style={s.positionLabel}>{label}</Text>
      <Text style={s.playerName} numberOfLines={1}>{item.firstName} {item.lastName}</Text>
      <Text style={s.playerClub} numberOfLines={1}>{item.clubName}</Text>
      <RatingBadge value={item.avgRating} size="sm" />
    </View>
  );
}

function RefereeCard({ item, accent, tag }: { item: RatedReferee; accent: string; tag: string }) {
  return (
    <View style={[s.card, { borderLeftColor: accent, borderLeftWidth: 3 }]}>
      <View style={s.cardTop}>
        <View style={s.tagWrap}>
          <Text style={[s.tag, { color: accent }]}>{tag}</Text>
        </View>
        <RatingBadge value={item.avgRating} />
      </View>
      <Text style={s.matchTitle}>{item.firstName} {item.lastName}</Text>
      <Text style={s.matchSub}>
        {item.voteCount} {item.voteCount === 1 ? 'ocjena' : 'ocjena'}
      </Text>
    </View>
  );
}

function AtmosphereCard({ item, accent, tag }: { item: RatedAtmosphere; accent: string; tag: string }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={[s.card, { borderLeftColor: accent, borderLeftWidth: 3 }]}
      onPress={() => router.push({ pathname: '/match/[id]' as any, params: { id: item.matchId } })}
      activeOpacity={0.75}>
      <View style={s.cardTop}>
        <View style={s.tagWrap}>
          <Text style={[s.tag, { color: accent }]}>{tag}</Text>
        </View>
        <RatingBadge value={item.avgRating} />
      </View>
      <Text style={s.matchTitle} numberOfLines={1}>
        {item.homeClub} — {item.awayClub}
      </Text>
      <Text style={s.matchSub}>
        Kolo {item.round}
        {item.result ? ` · ${item.result}` : ''}
        {' · '}{item.voteCount} {item.voteCount === 1 ? 'glas' : 'glasova'}
      </Text>
    </TouchableOpacity>
  );
}

function EmptyCard({ label }: { label: string }) {
  return (
    <View style={s.emptyCard}>
      <Text style={s.emptyCardText}>{label}</Text>
    </View>
  );
}

export default function TopRatedScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [data, setData] = useState<TopRated | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(silent = false) {
    if (!token) return;
    if (!silent) setLoading(true);
    try {
      const result = await getTopRated(token);
      setData(result);
    } catch {
      // silent fail — screen shows empty cards
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.title}>Najbolje ocijenjeno</Text>
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator color={T.red} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={T.red} />}>

          {/* Utakmice */}
          <SectionHeader label="UTAKMICA SEZONE" icon="trophy-outline" />
          {data?.bestMatch
            ? <MatchCard item={data.bestMatch} accent={T.win} tag="Najbolja" />
            : <EmptyCard label="Nema dovoljno ocjena za utakmice" />}
          {data?.worstMatch && data.worstMatch.matchId !== data.bestMatch?.matchId && (
            <MatchCard item={data.worstMatch} accent={T.loss} tag="Najgora" />
          )}

          {/* Igrači po pozicijama */}
          <SectionHeader label="IGRAČI SEZONE" icon="person-outline" />
          {data?.topPlayersByPosition && data.topPlayersByPosition.length > 0 ? (
            <View style={s.playerGrid}>
              {data.topPlayersByPosition.map(p => (
                <PlayerCard key={p.playerId} item={p} />
              ))}
            </View>
          ) : (
            <EmptyCard label="Nema dovoljno ocjena za igrače" />
          )}

          {/* Suci */}
          <SectionHeader label="SUDAC SEZONE" icon="flag-outline" />
          {data?.bestReferee
            ? <RefereeCard item={data.bestReferee} accent={T.win} tag="Najbolji" />
            : <EmptyCard label="Nema dovoljno ocjena za suce" />}
          {data?.worstReferee && data.worstReferee.refereeId !== data.bestReferee?.refereeId && (
            <RefereeCard item={data.worstReferee} accent={T.loss} tag="Najgori" />
          )}

          {/* Atmosfera */}
          <SectionHeader label="ATMOSFERA SEZONE" icon="megaphone-outline" />
          {data?.bestAtmosphere
            ? <AtmosphereCard item={data.bestAtmosphere} accent={T.win} tag="Najbolja" />
            : <EmptyCard label="Nema dovoljno ocjena za atmosferu" />}
          {data?.worstAtmosphere && data.worstAtmosphere.matchId !== data.bestAtmosphere?.matchId && (
            <AtmosphereCard item={data.worstAtmosphere} accent={T.loss} tag="Najgora" />
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: T.text, letterSpacing: -0.8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
    marginBottom: 10,
  },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: T.textFaint, letterSpacing: 1 },

  card: {
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.hairline,
    padding: 14,
    marginBottom: 10,
    gap: 4,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  tagWrap: {},
  tag: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  matchTitle: { fontSize: 15, fontWeight: '700', color: T.text },
  matchSub: { fontSize: 12, color: T.textFaint, marginTop: 2 },

  badge: {
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontWeight: '800', letterSpacing: -0.3 },

  playerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  playerCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.hairline,
    padding: 14,
    width: '47%',
    gap: 4,
  },
  playerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: T.redGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  positionLabel: { fontSize: 10, fontWeight: '700', color: T.textFaint, letterSpacing: 0.8 },
  playerName: { fontSize: 14, fontWeight: '700', color: T.text },
  playerClub: { fontSize: 11, color: T.textFaint, marginBottom: 4 },

  emptyCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.hairline,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyCardText: { fontSize: 13, color: T.textFaint, textAlign: 'center' },
});

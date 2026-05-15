import { ClubAvatar } from '@/components/ClubAvatar';
import { MatchCard } from '@/components/MatchCard';
import { T } from '@/constants/theme';
import { type Match, useAuth } from '@/context/auth';
import { getClubMatches } from '@/services/api';
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
import { SectionHeader } from './SectionHeader';
import { feedStyles as s } from './styles';

export function MyClubFeed({ token }: { token: string }) {
  const { userProfile } = useAuth();
  const router = useRouter();
  const favoriteClub = userProfile?.favoriteClub;

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(silent = false) {
    if (!favoriteClub) {
      setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await getClubMatches(favoriteClub.id, token);
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setMatches(data);
    } catch (e: any) {
      setError(e.message ?? 'Učitavanje utakmica nije uspjelo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favoriteClub?.id]);

  function goToMatch(m: Match) {
    router.push({ pathname: '/match/[id]' as any, params: { id: m.id } });
  }

  if (!favoriteClub) {
    return (
      <View style={cl.empty}>
        <Ionicons name="heart-outline" size={40} color={T.textFaint} />
        <Text style={cl.emptyTitle}>Nemaš omiljeni klub</Text>
        <Text style={cl.emptySub}>
          Odaberi klub i prati sve njegove utakmice ovdje.
        </Text>
        <TouchableOpacity
          style={cl.emptyBtn}
          onPress={() => router.push('/(tabs)/clubs' as any)}
        >
          <Text style={cl.emptyBtnText}>Pregledaj klubove</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const now = new Date();
  const upcoming = matches
    .filter((m) => !m.finished && new Date(m.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const finished = matches.filter((m) => m.finished);

  return (
    <ScrollView
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load(true);
          }}
          tintColor={T.red}
        />
      }
    >
      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator color={T.red} size="large" />
        </View>
      ) : error ? (
        <View style={s.errorWrap}>
          <Ionicons name="alert-circle-outline" size={40} color={T.textFaint} />
          <Text style={s.errorTitle}>Učitavanje utakmica nije uspjelo</Text>
          <Text style={s.errorSub}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => load()}>
            <Text style={s.retryText}>Pokušaj ponovno</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={cl.clubHeader}>
            <ClubAvatar club={favoriteClub} size={36} />
            <View>
              <Text style={cl.clubName}>{favoriteClub.name}</Text>
              <Text style={cl.clubSub}>{matches.length} utakmica</Text>
            </View>
          </View>

          {finished.length > 0 && (
            <View style={s.section}>
              <SectionHeader title="Rezultati" count={finished.length} />
              {finished.map((m) => (
                <View key={m.id} style={{ marginBottom: 8 }}>
                  <MatchCard match={m} onPress={() => goToMatch(m)} />
                </View>
              ))}
            </View>
          )}

          {upcoming.length > 0 && (
            <View style={s.section}>
              <SectionHeader title="Nadolazeće" count={upcoming.length} />
              {upcoming.map((m) => (
                <View key={m.id} style={{ marginBottom: 8 }}>
                  <MatchCard match={m} onPress={() => goToMatch(m)} />
                </View>
              ))}
            </View>
          )}

          {matches.length === 0 && (
            <View style={s.centered}>
              <Ionicons name="football-outline" size={40} color={T.textFaint} />
              <Text style={s.emptyText}>Nema utakmica</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const cl = StyleSheet.create({
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: T.hairline,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '800',
    color: T.text,
    letterSpacing: -0.3,
  },
  clubSub: {
    fontSize: 12,
    color: T.textFaint,
    fontWeight: '500',
    marginTop: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: T.text },
  emptySub: {
    fontSize: 14,
    color: T.textDim,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 4,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: T.red,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

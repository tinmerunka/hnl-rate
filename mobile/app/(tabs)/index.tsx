import { MatchCard } from '@/components/MatchCard';
import { T } from '@/constants/theme';
import { type Match, useAuth } from '@/context/auth';
import { MyClubFeed } from '@/features/matches-feed/MyClubFeed';
import { RatedFeed } from '@/features/matches-feed/RatedFeed';
import { RoundPill } from '@/features/matches-feed/RoundPill';
import { SectionHeader } from '@/features/matches-feed/SectionHeader';
import { SegmentedControl, type FeedTab } from '@/features/matches-feed/SegmentedControl';
import { useRoundMatches } from '@/features/matches-feed/hooks/useRoundMatches';
import { feedStyles as s } from '@/features/matches-feed/styles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STARTING_ROUND = 32;

export default function MatchesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [round, setRound] = useState(STARTING_ROUND);

  const { matches, loading, refreshing, error, load, onRefresh } =
    useRoundMatches(round, token);

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

  function livePlural(n: number) {
    return n === 1 ? 'utakmica' : n < 5 ? 'utakmice' : 'utakmica';
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.logoMark}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) =>
              [0, 1, 2, 3, 4, 5, 6].map((j) =>
                (i + j) % 2 === 0 ? (
                  <View
                    key={`${i}-${j}`}
                    style={{
                      position: 'absolute',
                      left: i * 3.4,
                      top: j * 3.4,
                      width: 3.4,
                      height: 3.4,
                      backgroundColor: '#fff',
                    }}
                  />
                ) : null,
              ),
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

      <SegmentedControl active={activeTab} onChange={setActiveTab} />

      {activeTab === 'myclub' && token && <MyClubFeed token={token} />}
      {activeTab === 'rated' && token && <RatedFeed token={token} />}

      {activeTab === 'all' && (
        <RoundPill
          round={round}
          loading={loading && !refreshing}
          onPrev={() => {
            if (round > 1) setRound((r) => r - 1);
          }}
          onNext={() => setRound((r) => r + 1)}
        />
      )}

      {activeTab === 'all' && (
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={T.red}
            />
          }
        >
          {error ? (
            <View style={s.errorWrap}>
              <Ionicons name="alert-circle-outline" size={40} color={T.textFaint} />
              <Text style={s.errorTitle}>Nema utakmica</Text>
              <Text style={s.errorSub}>{error}</Text>
              <TouchableOpacity style={s.retryBtn} onPress={() => load()}>
                <Text style={s.retryText}>Pokušaj ponovno</Text>
              </TouchableOpacity>
            </View>
          ) : loading ? (
            <View style={s.centered}>
              <ActivityIndicator color={T.red} size="large" />
            </View>
          ) : matches.length === 0 ? (
            <View style={s.centered}>
              <Ionicons name="football-outline" size={40} color={T.textFaint} />
              <Text style={s.emptyText}>
                Nema utakmica za {round}. kolo
              </Text>
            </View>
          ) : (
            <>
              {live.length > 0 && (
                <View style={s.section}>
                  <View style={s.liveHeader}>
                    <View style={s.liveBullet} />
                    <Text style={s.liveLabel}>UŽIVO</Text>
                    <View style={s.hairline} />
                    <Text style={s.liveCount}>
                      {live.length} {livePlural(live.length)}
                    </Text>
                  </View>
                  {live.map((m) => (
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
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

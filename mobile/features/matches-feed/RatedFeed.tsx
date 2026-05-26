import { T } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RatedMatchCard } from './RatedMatchCard';
import { SectionHeader } from './SectionHeader';
import { useUserRatings } from './hooks/useUserRatings';
import { feedStyles as s } from './styles';

export function RatedFeed({ token }: { token: string }) {
  const router = useRouter();
  const { ratings, loading, refreshing, error, load, onRefresh } =
    useUserRatings(token);

  return (
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
      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator color={T.red} size="large" />
        </View>
      ) : error ? (
        <View style={s.errorWrap}>
          <Ionicons name="alert-circle-outline" size={40} color={T.textFaint} />
          <Text style={s.errorTitle}>Učitavanje ocjena nije uspjelo</Text>
          <Text style={s.errorSub}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => load()}>
            <Text style={s.retryText}>Pokušaj ponovno</Text>
          </TouchableOpacity>
        </View>
      ) : ratings.length === 0 ? (
        <View style={s.centered}>
          <Ionicons name="star-outline" size={40} color={T.textFaint} />
          <Text style={s.emptyText}>Još nemaš ocijenjenih utakmica</Text>
        </View>
      ) : (
        <View style={s.section}>
          <SectionHeader title="Tvoje ocjene" count={ratings.length} />
          {ratings.map((r) => (
            <View key={r.matchId} style={{ marginBottom: 8 }}>
              <RatedMatchCard
                rating={r}
                onPress={() =>
                  router.push({
                    pathname: '/match/[id]' as any,
                    params: { id: r.matchId },
                  })
                }
              />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

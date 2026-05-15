import { T } from '@/constants/theme';
import type { MatchStatistics } from '@/context/auth';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { StatsContent } from '../stats/StatsContent';

export function StatsTab({
  stats,
  loading,
  error,
  onRetry,
  homeClub,
  awayClub,
}: {
  stats: MatchStatistics | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  homeClub: string;
  awayClub: string;
}) {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 }}>
      {loading ? (
        <ActivityIndicator color={T.red} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={{ alignItems: 'center', paddingTop: 40, gap: 12 }}>
          <Ionicons name="alert-circle-outline" size={36} color={T.textFaint} />
          <Text style={{ color: T.textFaint, fontSize: 14 }}>
            Učitavanje statistike nije uspjelo
          </Text>
          <TouchableOpacity onPress={onRetry}>
            <Text style={{ color: T.red, fontSize: 13, fontWeight: '600' }}>
              Pokušaj ponovno
            </Text>
          </TouchableOpacity>
        </View>
      ) : stats === null ? (
        <View style={{ alignItems: 'center', paddingTop: 40, gap: 12 }}>
          <Ionicons name="stats-chart-outline" size={36} color={T.textFaint} />
          <Text style={{ color: T.textFaint, fontSize: 14 }}>
            Statistika za ovu utakmicu nije dostupna
          </Text>
        </View>
      ) : (
        <StatsContent stats={stats} homeClub={homeClub} awayClub={awayClub} />
      )}
    </View>
  );
}

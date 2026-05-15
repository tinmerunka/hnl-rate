import { T } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { PastLayout } from '@/features/match/PastLayout';
import { UpcomingLayout } from '@/features/match/UpcomingLayout';
import { useMatchData } from '@/features/match/hooks/useMatchData';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const matchId = parseInt(id, 10);

  const { match, lineup, loading, lineupLoading } = useMatchData(matchId, token);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: T.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={T.red} size="large" />
      </View>
    );
  }

  if (!match) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: T.bg,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Ionicons name="alert-circle-outline" size={40} color={T.textFaint} />
        <Text style={{ color: T.textFaint, fontSize: 15 }}>Utakmica nije pronađena.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: T.red, fontSize: 14, fontWeight: '600' }}>Natrag</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return match.finished ? (
    <PastLayout
      match={match}
      lineup={lineup}
      lineupLoading={lineupLoading}
      insets={insets}
      onBack={() => router.back()}
    />
  ) : (
    <UpcomingLayout match={match} insets={insets} onBack={() => router.back()} />
  );
}

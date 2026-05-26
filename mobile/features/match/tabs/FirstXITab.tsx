import { T } from '@/constants/theme';
import type { MatchLineup } from '@/context/auth';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Text, View } from 'react-native';
import { BenchSection } from '../lineup/BenchSection';
import { PitchView } from '../lineup/PitchView';

export function FirstXITab({
  lineup,
  loading,
}: {
  lineup: MatchLineup | null;
  loading: boolean;
}) {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      {loading ? (
        <View style={{ paddingTop: 48, alignItems: 'center', gap: 12 }}>
          <ActivityIndicator color={T.red} size="large" />
          <Text style={{ color: T.textFaint, fontSize: 13 }}>
            Učitavanje postave...
          </Text>
        </View>
      ) : lineup ? (
        <>
          <PitchView lineup={lineup} />
          <BenchSection homeTeam={lineup.homeTeam} awayTeam={lineup.awayTeam} />
        </>
      ) : (
        <View style={{ alignItems: 'center', paddingTop: 40, gap: 12 }}>
          <Ionicons name="people-outline" size={36} color={T.textFaint} />
          <Text style={{ color: T.textFaint, fontSize: 14 }}>
            Postava nije dostupna
          </Text>
        </View>
      )}
    </View>
  );
}

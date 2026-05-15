import { Text, TouchableOpacity, View } from 'react-native';
import { screen as styles } from './styles/club.styles';

export type ClubFilter = 'upcoming' | 'past';

const LABELS: Record<ClubFilter, string> = {
  upcoming: 'Nadolazeće',
  past: 'Prošle',
};

export function MatchFilterTabs({
  value,
  onChange,
}: {
  value: ClubFilter;
  onChange: (v: ClubFilter) => void;
}) {
  return (
    <View style={styles.filterRow}>
      {(['upcoming', 'past'] as ClubFilter[]).map((f) => (
        <TouchableOpacity
          key={f}
          style={[styles.filterTab, value === f && styles.filterTabActive]}
          onPress={() => onChange(f)}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterTabText, value === f && styles.filterTabTextActive]}>
            {LABELS[f]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

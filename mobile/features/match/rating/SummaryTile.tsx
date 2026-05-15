import { T } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

export function SummaryTile({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.tile}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Text style={[styles.value, { color }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: T.bg,
    borderWidth: 1,
    borderColor: T.hairline,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: T.textFaint,
    letterSpacing: 0.6,
  },
  value: { fontSize: 14, fontWeight: '800', letterSpacing: -0.3 },
});

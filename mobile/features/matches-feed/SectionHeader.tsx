import { T } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

export function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {count != null && count > 0 && <Text style={styles.count}>{count}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: T.text,
    letterSpacing: -0.5,
  },
  count: { fontSize: 13, color: T.textFaint, fontWeight: '600' },
});

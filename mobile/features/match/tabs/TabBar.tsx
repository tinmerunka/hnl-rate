import { T } from '@/constants/theme';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type TabId = 'buzz' | 'firstxi' | 'stats';

const TABS: { id: TabId; label: string }[] = [
  { id: 'buzz', label: 'Komentari' },
  { id: 'firstxi', label: 'Postava' },
  { id: 'stats', label: 'Statistika' },
];

export function TabBar({
  active,
  onPress,
}: {
  active: TabId;
  onPress: (t: TabId) => void;
}) {
  return (
    <View style={styles.bar}>
      {TABS.map((t) => {
        const on = t.id === active;
        return (
          <TouchableOpacity
            key={t.id}
            style={[styles.tab, on && styles.tabActive]}
            onPress={() => onPress(t.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, on && styles.labelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 4,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  tabActive: {
    backgroundColor: T.text,
  },
  label: { fontSize: 13, fontWeight: '700', color: T.textDim },
  labelActive: { color: T.bg },
});

import { T } from '@/constants/theme';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type FeedTab = 'all' | 'myclub' | 'rated';

const TABS: { key: FeedTab; label: string }[] = [
  { key: 'all', label: 'Sve' },
  { key: 'myclub', label: 'Moj klub' },
  { key: 'rated', label: 'Ocijenjeno' },
];

export function SegmentedControl({
  active,
  onChange,
}: {
  active: FeedTab;
  onChange: (v: FeedTab) => void;
}) {
  return (
    <View style={styles.wrap}>
      {TABS.map((t) => (
        <TouchableOpacity
          key={t.key}
          style={[styles.btn, active === t.key && styles.btnActive]}
          onPress={() => onChange(t.key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.label, active === t.key && styles.labelActive]}>
            {t.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: T.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.hairline,
    padding: 3,
    gap: 3,
  },
  btn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  btnActive: { backgroundColor: T.red },
  label: { fontSize: 13, fontWeight: '700', color: T.textDim },
  labelActive: { color: '#FFFFFF' },
});

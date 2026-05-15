import { T } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function StarRow({
  label,
  sub,
  value,
  onChange,
}: {
  label: string;
  sub?: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <View>
          <Text style={styles.label}>{label}</Text>
          {sub && <Text style={styles.sub}>{sub}</Text>}
        </View>
        <Text style={styles.count}>{value > 0 ? `${value}.0` : '—'}</Text>
      </View>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity
            key={i}
            style={[styles.starBtn, i <= value && styles.starBtnActive]}
            onPress={() => onChange(value === i ? 0 : i)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={i <= value ? 'star' : 'star-outline'}
              size={18}
              color={i <= value ? '#F5A524' : T.textFaint}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: T.hairline,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  label: { fontSize: 14, fontWeight: '700', color: T.text },
  sub: { fontSize: 11, color: T.textFaint, marginTop: 2 },
  count: { fontSize: 13, color: T.textFaint, fontWeight: '600' },
  stars: { flexDirection: 'row', gap: 6 },
  starBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.hairline,
    backgroundColor: 'transparent',
  },
  starBtnActive: {
    backgroundColor: 'rgba(245,165,36,0.10)',
    borderColor: 'rgba(245,165,36,0.35)',
  },
});

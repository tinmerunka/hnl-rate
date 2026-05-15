import { T } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function RoundPill({
  round,
  onPrev,
  onNext,
  loading,
}: {
  round: number;
  onPrev: () => void;
  onNext: () => void;
  loading: boolean;
}) {
  return (
    <View style={styles.pill}>
      <TouchableOpacity
        onPress={onPrev}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        disabled={round <= 1}
      >
        <Ionicons
          name="chevron-back"
          size={16}
          color={round <= 1 ? T.textFaint : T.textDim}
        />
      </TouchableOpacity>
      <View style={styles.center}>
        {loading ? (
          <ActivityIndicator size="small" color={T.textDim} />
        ) : (
          <>
            <Text style={styles.label}>{round}. kolo</Text>
            <Text style={styles.dot}> · </Text>
            <Text style={styles.sub}>SuperSport HNL</Text>
          </>
        )}
      </View>
      <TouchableOpacity
        onPress={onNext}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-forward" size={16} color={T.textDim} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: T.surface,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: T.hairline,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 20,
    justifyContent: 'center',
  },
  label: { fontSize: 13, fontWeight: '700', color: T.text, letterSpacing: 0.1 },
  dot: { fontSize: 13, color: T.textFaint },
  sub: { fontSize: 13, color: T.textFaint },
});

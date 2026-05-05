import { T } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TopRatedScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.title}>Top Rated</Text>
      </View>

      <View style={s.center}>
        <View style={s.iconWrap}>
          <Ionicons name="trophy-outline" size={40} color={T.textFaint} />
        </View>
        <Text style={s.comingSoon}>Coming soon</Text>
        <Text style={s.sub}>
          The highest-rated matches and players from{'\n'}every round — ranked by the community.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '800', color: T.text, letterSpacing: -0.8 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
    marginTop: -60,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.hairline,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  comingSoon: {
    fontSize: 22,
    fontWeight: '800',
    color: T.text,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 14,
    color: T.textDim,
    textAlign: 'center',
    lineHeight: 20,
  },
});

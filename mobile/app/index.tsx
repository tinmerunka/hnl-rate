import { T } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function LogoMark({ size = 96 }: { size?: number }) {
  const sq = size / 7;
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      if ((i + j) % 2 === 0) {
        cells.push(
          <View
            key={`${i}-${j}`}
            style={{
              position: 'absolute',
              left: i * sq,
              top: j * sq,
              width: sq,
              height: sq,
              backgroundColor: '#fff',
            }}
          />
        );
      }
    }
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        backgroundColor: T.red,
        overflow: 'hidden',
      }}>
      {cells}
    </View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={s.container}>
      {/* Glow orb */}
      <View style={s.glowOuter} />
      <View style={s.glowInner} />

      <View style={s.center}>
        <View style={s.logoWrap}>
          <LogoMark size={96} />
        </View>
        <Text style={s.title}>HNL Rate</Text>
        <Text style={s.tagline}>The community scoreboard{'\n'}for SuperSport HNL.</Text>
      </View>

      <View style={s.btns}>
        <TouchableOpacity
          style={s.btnPrimary}
          onPress={() => router.push('/register' as any)}
          activeOpacity={0.85}>
          <Text style={s.btnPrimaryText}>Get started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.btnSecondary}
          onPress={() => router.push('/login')}
          activeOpacity={0.8}>
          <Text style={s.btnSecondaryText}>I already have an account</Text>
        </TouchableOpacity>

        <Text style={s.season}>SEASON 2025 / 26  ·  SUPERHNL</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  glowOuter: {
    position: 'absolute',
    top: -120,
    alignSelf: 'center',
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: 'rgba(225,29,42,0.18)',
  },
  glowInner: {
    position: 'absolute',
    top: -60,
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(225,29,42,0.22)',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoWrap: {
    marginBottom: 28,
    shadowColor: T.red,
    shadowOpacity: 0.55,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: T.text,
    letterSpacing: -1.5,
    lineHeight: 44,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 15,
    color: T.textDim,
    textAlign: 'center',
    lineHeight: 22,
  },
  btns: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 12,
  },
  btnPrimary: {
    height: 52,
    borderRadius: 14,
    backgroundColor: T.red,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: T.red,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.1,
  },
  btnSecondary: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.hairlineStrong,
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: '500',
    color: T.text,
    letterSpacing: 0.1,
  },
  season: {
    textAlign: 'center',
    fontSize: 11,
    color: T.textFaint,
    letterSpacing: 0.5,
    marginTop: 4,
    fontWeight: '600',
  },
});

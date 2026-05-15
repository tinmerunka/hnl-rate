import { LogoMark } from '@/components/LogoMark';
import { T } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const router = useRouter();
  return (
    <>
      <View style={styles.topRow}>
        <LogoMark />
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backText}>← Natrag</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 36,
  },
  backText: { fontSize: 14, color: T.textDim, fontWeight: '500' },

  heading: { marginBottom: 32 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: T.text,
    letterSpacing: -1,
    lineHeight: 36,
    marginBottom: 8,
  },
  subtitle: { fontSize: 15, color: T.textDim, lineHeight: 21 },
});

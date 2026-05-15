import { T } from '@/constants/theme';
import type { Club } from '@/context/auth';
import { useClubLogoSource } from '@/hooks/useClubLogoSource';
import { clubInitials } from '@/utils/initials';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

export function ClubLogo({ club, size = 56 }: { club: Club; size?: number }) {
  const uri = useClubLogoSource(club);
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        contentFit="contain"
      />
    );
  }
  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius: size * 0.2 },
      ]}
    >
      <Text style={[styles.tla, { fontSize: size * 0.28 }]}>{clubInitials(club)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.hairline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tla: { color: T.textFaint, fontWeight: '800', letterSpacing: 0.5 },
});

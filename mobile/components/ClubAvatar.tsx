import { T } from '@/constants/theme';
import { clubInitials } from '@/utils/initials';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

type ClubLike = { name: string; crest?: string; logoUrl?: string; tla?: string };

export function ClubAvatar({ club, size = 32 }: { club: ClubLike; size?: number }) {
  const uri = club.crest ?? club.logoUrl;
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size }} contentFit="contain" />;
  }
  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius: size * 0.22 },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.33 }]}>
        {clubInitials(club)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: T.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.hairline,
  },
  initials: { color: T.textFaint, fontWeight: '800', letterSpacing: 0.5 },
});

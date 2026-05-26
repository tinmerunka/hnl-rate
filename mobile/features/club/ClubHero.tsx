import type { Club } from '@/context/auth';
import { useClubLogoSource } from '@/hooks/useClubLogoSource';
import { clubInitials } from '@/utils/initials';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { screen as styles } from './styles/club.styles';

export function ClubHero({
  club,
  isFavorite,
  toggling,
  onToggle,
}: {
  club: Club;
  isFavorite: boolean;
  toggling: boolean;
  onToggle: () => void;
}) {
  const logoUri = useClubLogoSource(club);

  return (
    <View style={styles.hero}>
      {logoUri ? (
        <Image source={{ uri: logoUri }} style={styles.crest} contentFit="contain" />
      ) : (
        <View style={styles.crestPlaceholder}>
          <Text style={styles.crestInitials}>{clubInitials(club)}</Text>
        </View>
      )}
      <View style={styles.heroText}>
        <Text style={styles.clubName} numberOfLines={1}>
          {club.name}
        </Text>
        {(club.shortName || club.tla) && (
          <Text style={styles.clubMeta}>
            {[club.shortName, club.tla].filter(Boolean).join(' · ')}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={[styles.favIcon, toggling && styles.btnDisabled]}
        onPress={onToggle}
        disabled={toggling}
        activeOpacity={0.7}
      >
        {toggling ? (
          <ActivityIndicator size="small" color="#CC0000" />
        ) : (
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#CC0000' : '#555555'}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

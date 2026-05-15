import type { Match } from '@/context/auth';
import { useClubLogoSource } from '@/hooks/useClubLogoSource';
import { clubInitials } from '@/utils/initials';
import { dateWeekday } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { featCard as styles } from './styles/club.styles';

export function FeaturedMatchCard({ match }: { match: Match }) {
  const router = useRouter();
  const homeLogo = useClubLogoSource(match.homeClub);
  const awayLogo = useClubLogoSource(match.awayClub);
  const formattedDate = dateWeekday(match.date);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/match/${match.id}` as any)}
      activeOpacity={0.75}
    >
      <View style={styles.header}>
        <View style={styles.nextBadge}>
          <Text style={styles.nextText}>SLJEDEĆA UTAKMICA</Text>
        </View>
        <Text style={styles.roundText}>{match.round}. kolo</Text>
      </View>

      <View style={styles.teams}>
        <View style={styles.teamBlock}>
          {homeLogo ? (
            <Image source={{ uri: homeLogo }} style={styles.logo} contentFit="contain" />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoInitials}>{clubInitials(match.homeClub)}</Text>
            </View>
          )}
          <Text style={styles.clubName} numberOfLines={2}>
            {match.homeClub.name}
          </Text>
          <Text style={styles.homeAway}>DOMAĆIN</Text>
        </View>

        <View style={styles.vsBlock}>
          <Text style={styles.vs}>vs</Text>
        </View>

        <View style={styles.teamBlock}>
          {awayLogo ? (
            <Image source={{ uri: awayLogo }} style={styles.logo} contentFit="contain" />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoInitials}>{clubInitials(match.awayClub)}</Text>
            </View>
          )}
          <Text style={styles.clubName} numberOfLines={2}>
            {match.awayClub.name}
          </Text>
          <Text style={styles.homeAway}>GOST</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Ionicons name="calendar-outline" size={13} color="#555555" />
          <Text style={styles.footerText}>{formattedDate}</Text>
        </View>
        {match.referee && (
          <View style={styles.footerRow}>
            <Ionicons name="person-outline" size={13} color="#555555" />
            <Text style={styles.footerText}>
              {match.referee.firstName} {match.referee.lastName}
            </Text>
          </View>
        )}
        {match.homeClub.venue && (
          <View style={styles.footerRow}>
            <Ionicons name="location-outline" size={13} color="#555555" />
            <Text style={styles.footerText}>{match.homeClub.venue}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

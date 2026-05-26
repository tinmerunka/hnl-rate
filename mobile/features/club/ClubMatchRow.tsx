import type { Match } from '@/context/auth';
import { useClubLogoSource } from '@/hooks/useClubLogoSource';
import { clubInitials } from '@/utils/initials';
import { dateShort } from '@/utils/date';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { mc as styles } from './styles/club.styles';

export function ClubMatchRow({
  match,
  clubId,
}: {
  match: Match;
  clubId: number;
}) {
  const router = useRouter();
  const isHome = match.homeClub.id === clubId;

  const homeLogo = useClubLogoSource(match.homeClub);
  const awayLogo = useClubLogoSource(match.awayClub);

  const formattedDate = dateShort(match.date);

  const [homeScore, awayScore] = match.result ? match.result.split('-') : [null, null];
  const myScore = isHome ? homeScore : awayScore;
  const theirScore = isHome ? awayScore : homeScore;

  const won =
    myScore !== null && theirScore !== null
      ? parseInt(myScore) > parseInt(theirScore)
      : null;
  const drew =
    myScore !== null && theirScore !== null
      ? parseInt(myScore) === parseInt(theirScore)
      : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/match/${match.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <View style={styles.teamSide}>
          {homeLogo ? (
            <Image source={{ uri: homeLogo }} style={styles.logo} contentFit="contain" />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoInitials}>{clubInitials(match.homeClub)}</Text>
            </View>
          )}
          <Text style={styles.tla} numberOfLines={1}>
            {clubInitials(match.homeClub)}
          </Text>
        </View>

        <View style={styles.centre}>
          {match.finished && match.result ? (
            <Text
              style={[
                styles.score,
                won === true && (isHome ? styles.scoreWin : styles.scoreLoss),
                won === false && (isHome ? styles.scoreLoss : styles.scoreWin),
                drew === true && styles.scoreDraw,
              ]}
            >
              {match.result}
            </Text>
          ) : (
            <Text style={styles.vs}>vs</Text>
          )}
        </View>

        <View style={[styles.teamSide, styles.teamSideRight]}>
          <Text style={styles.tla} numberOfLines={1}>
            {clubInitials(match.awayClub)}
          </Text>
          {awayLogo ? (
            <Image source={{ uri: awayLogo }} style={styles.logo} contentFit="contain" />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoInitials}>{clubInitials(match.awayClub)}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.meta}>
        <Text style={styles.metaText}>
          {match.round}. kolo · {formattedDate}
        </Text>
        {match.finished && myScore !== null && (
          <View
            style={[
              styles.badge,
              won === true && styles.badgeWin,
              won === false && styles.badgeLoss,
              drew === true && styles.badgeDraw,
            ]}
          >
            <Text style={styles.badgeText}>
              {won === true ? 'P' : drew === true ? 'N' : 'I'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

import { useAuth } from '@/context/auth';
import { ClubHero } from '@/features/club/ClubHero';
import { ClubMatchRow } from '@/features/club/ClubMatchRow';
import { EmptyState } from '@/features/club/EmptyState';
import { FeaturedMatchCard } from '@/features/club/FeaturedMatchCard';
import { MatchFilterTabs, type ClubFilter } from '@/features/club/MatchFilterTabs';
import { useClubData } from '@/features/club/hooks/useClubData';
import { useFavoriteToggle } from '@/features/club/hooks/useFavoriteToggle';
import { screen as styles } from '@/features/club/styles/club.styles';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();

  const clubId = parseInt(id, 10);
  const { club, matches, loading, matchesLoading } = useClubData(clubId, token);
  const { isFavorite, toggling, toggle } = useFavoriteToggle(club);
  const [filter, setFilter] = useState<ClubFilter>('upcoming');

  const upcomingMatches = useMemo(
    () =>
      matches
        .filter((m) => !m.finished)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [matches],
  );
  const pastMatches = useMemo(
    () => matches.filter((m) => m.finished).reverse(),
    [matches],
  );

  const nextMatch = upcomingMatches[0] ?? null;
  const otherUpcoming = upcomingMatches.slice(1);

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            { position: 'absolute', top: insets.top + 12, left: 20 },
          ]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <ActivityIndicator color="#CC0000" size="large" />
      </View>
    );
  }

  if (!club) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            { position: 'absolute', top: insets.top + 12, left: 20 },
          ]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.errorText}>Klub nije pronađen.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
    >
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      <ClubHero
        club={club}
        isFavorite={isFavorite}
        toggling={toggling}
        onToggle={toggle}
      />

      <MatchFilterTabs value={filter} onChange={setFilter} />

      {matchesLoading ? (
        <ActivityIndicator color="#CC0000" style={{ marginTop: 24 }} />
      ) : filter === 'upcoming' ? (
        <>
          {nextMatch && <FeaturedMatchCard match={nextMatch} />}
          {otherUpcoming.map((m) => (
            <ClubMatchRow key={m.id} match={m} clubId={clubId} />
          ))}
          {upcomingMatches.length === 0 && (
            <EmptyState text="Nema zakazanih utakmica." />
          )}
        </>
      ) : (
        <>
          {pastMatches.map((m) => (
            <ClubMatchRow key={m.id} match={m} clubId={clubId} />
          ))}
          {pastMatches.length === 0 && (
            <EmptyState text="Nema odigranih utakmica." />
          )}
        </>
      )}
    </ScrollView>
  );
}

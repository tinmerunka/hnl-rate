import { Club, useAuth } from '@/context/auth';
import { getClubs, removeFavoriteClub, setFavoriteClub } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ClubsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token, userProfile, updateProfile } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const favoriteId = userProfile?.favoriteClub?.id ?? null;

  const filtered = useMemo(() => {
    if (!search.trim()) return clubs;
    const q = search.toLowerCase();
    return clubs.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.shortName?.toLowerCase().includes(q) ||
        c.tla?.toLowerCase().includes(q)
    );
  }, [clubs, search]);

  async function loadClubs(silent = false) {
    if (!token) return;
    if (!silent) setLoading(true);
    try {
      const data = await getClubs(token);
      setClubs(data);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to load clubs.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadClubs();
  }, [token]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadClubs(true);
  }, [token]);

  async function toggleFavorite(club: Club) {
    if (!token) return;
    setTogglingId(club.id);
    try {
      let updated;
      if (favoriteId === club.id) {
        updated = await removeFavoriteClub(token);
      } else {
        updated = await setFavoriteClub(club.id, token);
      }
      updateProfile(updated);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to update favorite.');
    } finally {
      setTogglingId(null);
    }
  }

  function renderClub({ item }: { item: Club }) {
    const isFav = item.id === favoriteId;
    const isToggling = togglingId === item.id;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: '/club/[id]' as any, params: { id: item.id } })}
        activeOpacity={0.7}>
        <View style={styles.cardLeft}>
          {item.crest ?? item.logoUrl ? (
            <Image source={{ uri: item.crest ?? item.logoUrl }} style={styles.crest} contentFit="contain" />
          ) : (
            <View style={styles.crestPlaceholder}>
              <Text style={styles.crestInitials}>{item.tla ?? item.name.slice(0, 3).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.clubName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.clubSub} numberOfLines={1}>
              {[item.shortName, item.tla].filter(Boolean).join(' · ') || ' '}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={() => toggleFavorite(item)}
          disabled={isToggling}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          {isToggling ? (
            <ActivityIndicator size="small" color="#CC0000" />
          ) : (
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={22}
              color={isFav ? '#CC0000' : '#444444'}
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Clubs</Text>
        <Text style={styles.count}>{clubs.length > 0 ? `${clubs.length} clubs` : ''}</Text>
      </View>

      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={16} color="#555555" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search clubs..."
          placeholderTextColor="#444444"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#CC0000" size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderClub}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#CC0000" />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>
                {search ? 'No clubs match your search.' : 'No clubs found.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  count: {
    fontSize: 13,
    color: '#555555',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#222222',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 15,
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 8,
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  crest: {
    width: 40,
    height: 40,
  },
  crestPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crestInitials: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555555',
    letterSpacing: 0.5,
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  clubName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  clubSub: {
    fontSize: 12,
    color: '#555555',
  },
  heartBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#444444',
    fontSize: 15,
  },
});

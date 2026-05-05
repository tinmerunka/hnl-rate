import { T } from '@/constants/theme';
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

function ClubCard({
  club,
  isFav,
  isToggling,
  onPress,
  onFav,
}: {
  club: Club;
  isFav: boolean;
  isToggling: boolean;
  onPress: () => void;
  onFav: () => void;
}) {
  const uri = club.crest ?? club.logoUrl;
  const tla = club.tla ?? club.name.slice(0, 3).toUpperCase();

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.75}>
      <View style={s.cardLeft}>
        {uri ? (
          <Image source={{ uri }} style={s.crest} contentFit="contain" />
        ) : (
          <View style={s.crestPlaceholder}>
            <Text style={s.crestInitials}>{tla}</Text>
          </View>
        )}
        <View style={s.cardInfo}>
          <Text style={s.clubName} numberOfLines={1}>{club.name}</Text>
          <Text style={s.clubSub} numberOfLines={1}>
            {[club.shortName, club.tla].filter(Boolean).join(' · ') || tla}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={s.heartBtn}
        onPress={onFav}
        disabled={isToggling}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        {isToggling
          ? <ActivityIndicator size="small" color={T.red} />
          : <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={isFav ? T.red : T.textFaint} />}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

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
    return clubs.filter(c =>
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

  useEffect(() => { loadClubs(); }, [token]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadClubs(true);
  }, [token]);

  async function toggleFavorite(club: Club) {
    if (!token) return;
    setTogglingId(club.id);
    try {
      const updated = favoriteId === club.id
        ? await removeFavoriteClub(token)
        : await setFavoriteClub(club.id, token);
      updateProfile(updated);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to update favorite.');
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Clubs</Text>
        {clubs.length > 0 && <Text style={s.count}>{clubs.length} clubs</Text>}
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={16} color={T.textFaint} style={{ marginRight: 8 }} />
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search clubs..."
          placeholderTextColor={T.textFaint}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={16} color={T.textFaint} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator color={T.red} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <ClubCard
              club={item}
              isFav={item.id === favoriteId}
              isToggling={togglingId === item.id}
              onPress={() => router.push({ pathname: '/club/[id]' as any, params: { id: item.id } })}
              onFav={() => toggleFavorite(item)}
            />
          )}
          contentContainerStyle={s.list}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.red} />
          }
          ListEmptyComponent={
            <View style={s.centered}>
              <Ionicons name="shield-outline" size={40} color={T.textFaint} />
              <Text style={s.emptyText}>
                {search ? 'No clubs match your search.' : 'No clubs found.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
  },
  title: { fontSize: 28, fontWeight: '800', color: T.text, letterSpacing: -0.8 },
  count: { fontSize: 13, color: T.textFaint, fontWeight: '600' },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: T.hairline,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: T.text,
  },

  list: { paddingHorizontal: 20, paddingBottom: 100 },

  card: {
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.hairline,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  crest: { width: 40, height: 40 },
  crestPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: T.surfaceHi,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.hairline,
  },
  crestInitials: { fontSize: 11, fontWeight: '800', color: T.textFaint, letterSpacing: 0.5 },
  cardInfo: { flex: 1, gap: 3 },
  clubName: { fontSize: 15, fontWeight: '600', color: T.text },
  clubSub: { fontSize: 12, color: T.textFaint },
  heartBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: T.textFaint, fontSize: 15 },
});

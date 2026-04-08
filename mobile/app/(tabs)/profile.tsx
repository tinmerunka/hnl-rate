import { useAuth } from '@/context/auth';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userProfile, logout } = useAuth();

  if (!userProfile) return null;

  const initials = userProfile.username.slice(0, 2).toUpperCase();
  const fav = userProfile.favoriteClub;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
      showsVerticalScrollIndicator={false}>

      <Text style={styles.pageTitle}>Profile</Text>

      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.username}>{userProfile.username}</Text>
        <Text style={styles.email}>{userProfile.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>FAVORITE CLUB</Text>
        {fav ? (
          <TouchableOpacity
            style={styles.favCard}
            onPress={() => router.push({ pathname: '/club/[id]' as any, params: { id: fav.id } })}
            activeOpacity={0.75}>
            <View style={styles.favLeft}>
              {fav.crest ?? fav.logoUrl ? (
                <Image source={{ uri: fav.crest ?? fav.logoUrl }} style={styles.favCrest} contentFit="contain" />
              ) : (
                <View style={styles.favCrestPlaceholder}>
                  <Text style={styles.favCrestInitials}>
                    {fav.tla ?? fav.name.slice(0, 3).toUpperCase()}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.favName}>{fav.name}</Text>
                {fav.shortName && <Text style={styles.favSub}>{fav.shortName}</Text>}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#444444" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.noFavCard}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.75}>
            <Ionicons name="heart-outline" size={20} color="#444444" />
            <Text style={styles.noFavText}>No favorite club yet</Text>
            <Text style={styles.noFavHint}>Browse clubs to set one</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.infoCard}>
          <InfoRow icon="person-outline" label="Username" value={userProfile.username} />
          <View style={styles.divider} />
          <InfoRow icon="mail-outline" label="Email" value={userProfile.email} />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color="#CC0000" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoRowLeft}>
        <Ionicons name={icon} size={16} color="#555555" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 28,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#CC0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666666',
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#444444',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  favCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  favLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  favCrest: {
    width: 44,
    height: 44,
  },
  favCrestPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favCrestInitials: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555555',
  },
  favName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  favSub: {
    fontSize: 12,
    color: '#555555',
  },
  noFavCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
  },
  noFavText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444444',
  },
  noFavHint: {
    fontSize: 12,
    color: '#333333',
  },
  infoCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#888888',
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    maxWidth: '55%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#1A1A1A',
    marginHorizontal: 14,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#2A1A1A',
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: '#0D0000',
  },
  logoutText: {
    color: '#CC0000',
    fontSize: 15,
    fontWeight: '600',
  },
});

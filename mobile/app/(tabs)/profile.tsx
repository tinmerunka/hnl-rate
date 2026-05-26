import { T } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Avatar({ name, size = 72 }: { name: string; size?: number }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <View style={[av.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[av.text, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

const av = StyleSheet.create({
  wrap: { backgroundColor: T.red, justifyContent: 'center', alignItems: 'center' },
  text: { fontWeight: '800', color: '#fff', letterSpacing: 1 },
});

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={ir.row}>
      <View style={ir.left}>
        <Ionicons name={icon} size={16} color={T.textFaint} />
        <Text style={ir.label}>{label}</Text>
      </View>
      <Text style={ir.value} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const ir = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontSize: 14, color: T.textDim },
  value: { fontSize: 14, color: T.text, maxWidth: '55%', textAlign: 'right' },
});

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userProfile, logout } = useAuth();

  if (!userProfile) return <View style={{ flex: 1, backgroundColor: T.bg }} />;

  const fav = userProfile.favoriteClub;
  const favUri = fav?.crest ?? fav?.logoUrl;
  const favTla = fav?.tla ?? fav?.name.slice(0, 3).toUpperCase();

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={[s.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}>

      <Text style={s.pageTitle}>Profil</Text>

      {/* Avatar section */}
      <View style={s.avatarSection}>
        <Avatar name={userProfile.username} size={72} />
        <Text style={s.username}>{userProfile.username}</Text>
        <Text style={s.email}>{userProfile.email}</Text>
      </View>

      {/* Favorite club */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>OMILJENI KLUB</Text>
        {fav ? (
          <TouchableOpacity
            style={s.favCard}
            onPress={() => router.push({ pathname: '/club/[id]' as any, params: { id: fav.id } })}
            activeOpacity={0.75}>
            <View style={s.favLeft}>
              {favUri ? (
                <Image source={{ uri: favUri }} style={s.favCrest} contentFit="contain" />
              ) : (
                <View style={s.favCrestPlaceholder}>
                  <Text style={s.favInitials}>{favTla}</Text>
                </View>
              )}
              <View style={s.favInfo}>
                <Text style={s.favName}>{fav.name}</Text>
                {fav.shortName && <Text style={s.favSub}>{fav.shortName}</Text>}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={T.textFaint} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={s.noFavCard}
            onPress={() => router.push('/(tabs)/clubs' as any)}
            activeOpacity={0.75}>
            <Ionicons name="heart-outline" size={22} color={T.textFaint} />
            <Text style={s.noFavText}>Još nemaš omiljeni klub</Text>
            <Text style={s.noFavHint}>Pregledaj klubove da odabereš →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Account info */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>RAČUN</Text>
        <View style={s.infoCard}>
          <InfoRow icon="person-outline" label="Korisničko ime" value={userProfile.username} />
          <View style={s.divider} />
          <InfoRow icon="mail-outline" label="E-mail" value={userProfile.email} />
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={s.logoutBtn}
        onPress={() => logout()}
        activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color={T.red} />
        <Text style={s.logoutText}>Odjava</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { paddingHorizontal: 20, paddingBottom: 60 },

  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: T.text,
    letterSpacing: -0.8,
    marginBottom: 28,
  },

  avatarSection: { alignItems: 'center', marginBottom: 36 },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: T.text,
    marginTop: 14,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  email: { fontSize: 14, color: T.textDim },

  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: T.textFaint,
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  favCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.hairline,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  favLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  favCrest: { width: 44, height: 44 },
  favCrestPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: T.surfaceHi,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.hairline,
  },
  favInitials: { fontSize: 11, fontWeight: '800', color: T.textFaint },
  favInfo: { flex: 1 },
  favName: { fontSize: 15, fontWeight: '600', color: T.text, marginBottom: 2 },
  favSub: { fontSize: 12, color: T.textFaint },

  noFavCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.hairline,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 6,
  },
  noFavText: { fontSize: 14, fontWeight: '600', color: T.textDim },
  noFavHint: { fontSize: 13, color: T.textFaint },

  infoCard: {
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.hairline,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: T.hairline, marginHorizontal: 14 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(225,29,42,0.2)',
    borderRadius: 14,
    paddingVertical: 16,
    backgroundColor: 'rgba(225,29,42,0.05)',
  },
  logoutText: { color: T.red, fontSize: 15, fontWeight: '600' },
});

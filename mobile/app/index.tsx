import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.appName}>HNL Rate</Text>
        <Text style={styles.tagline}>Your go-to rating platform</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/login')}>
          <Text style={styles.btnPrimaryText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/register')}>
          <Text style={styles.btnSecondaryText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#888888',
    letterSpacing: 0.5,
  },
  buttons: {
    gap: 14,
  },
  btnPrimary: {
    backgroundColor: '#CC0000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  btnSecondaryText: {
    color: '#AAAAAA',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

import { FormField } from '@/components/FormField';
import API_BASE_URL from '@/constants/config';
import { useAuth } from '@/context/auth';
import { AuthHeader } from '@/features/auth/AuthHeader';
import { authStyles as s } from '@/features/auth/styles';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Greška', 'Molimo ispunite sva polja.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Prijava neuspješna', data.message ?? 'Neispravni podaci.');
        return;
      }

      const token = data.accessToken ?? data.token;
      await login(token, data.refreshToken);
      router.replace('/(tabs)');
    } catch {
      Alert.alert(
        'Greška',
        'Neuspješno spajanje na poslužitelj. Pokušajte ponovno.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 16 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthHeader
          title="Dobrodošli natrag."
          subtitle="Nastavi gdje si stao — ocjenjuj utakmice, prati svoj klub."
        />

        <View style={s.fields}>
          <FormField
            label="Korisničko ime"
            value={username}
            onChangeText={setUsername}
            placeholder="korisničko_ime"
          />
          <FormField
            label="Lozinka"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
          <TouchableOpacity style={s.forgotWrap}>
            <Text style={s.forgot}>Zaboravljena lozinka?</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />

        <View style={s.cta}>
          <TouchableOpacity
            style={[s.btnPrimary, loading && s.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnPrimaryText}>Prijavi se</Text>
            )}
          </TouchableOpacity>

          <View style={s.switchRow}>
            <Text style={s.switchText}>Novi si ovdje? </Text>
            <TouchableOpacity onPress={() => router.replace('/register')}>
              <Text style={s.switchLink}>Kreiraj račun</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import { FormField } from '@/components/FormField';
import API_BASE_URL from '@/constants/config';
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

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Greška', 'Molimo ispunite sva polja.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      const text = await response.text();

      if (!response.ok) {
        let message = 'Račun nije mogao biti kreiran.';
        try {
          const data = JSON.parse(text);
          message = data.message ?? data.error ?? text;
        } catch {
          message = text || message;
        }
        Alert.alert('Registracija neuspješna', message);
        return;
      }

      Alert.alert(
        'Dobrodošli u HNL Rate',
        'Račun je kreiran! Prijavi se za početak.',
        [{ text: 'Prijavi se', onPress: () => router.replace('/login') }],
      );
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
          title="Pridruži se tribinama."
          subtitle="Kreiraj račun za ocjenjivanje utakmica, igrača i sudaca."
        />

        <View style={[s.fields, { marginBottom: 32 }]}>
          <FormField
            label="Korisničko ime"
            value={username}
            onChangeText={setUsername}
            placeholder="navijac_hr"
          />
          <FormField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="ime@primjer.hr"
            keyboardType="email-address"
          />
          <FormField
            label="Lozinka"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
        </View>

        <View style={s.cta}>
          <TouchableOpacity
            style={[s.btnPrimary, loading && s.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnPrimaryText}>Kreiraj račun</Text>
            )}
          </TouchableOpacity>

          <View style={s.switchRow}>
            <Text style={s.switchText}>Već imaš račun? </Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={s.switchLink}>Prijavi se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim()) {
      Alert.alert('Greška', 'Molimo unesite email adresu.');
      return;
    }

    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      Alert.alert(
        'Zahtjev poslan',
        'Ako taj email postoji u sustavu, primiti ćete uputu za reset lozinke.',
        [{ text: 'U redu', onPress: () => router.replace('/reset-password') }],
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
          title="Zaboravljena lozinka?"
          subtitle="Unesite email adresu i poslat ćemo vam uputu za reset lozinke."
        />

        <View style={[s.fields, { marginBottom: 32 }]}>
          <FormField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="ime@primjer.hr"
            keyboardType="email-address"
          />
        </View>

        <View style={s.cta}>
          <TouchableOpacity
            style={[s.btnPrimary, loading && s.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnPrimaryText}>Pošalji zahtjev</Text>
            )}
          </TouchableOpacity>

          <View style={s.switchRow}>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={s.switchLink}>Natrag na prijavu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

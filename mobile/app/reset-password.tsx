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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!token.trim() || !newPassword.trim()) {
      Alert.alert('Greška', 'Molimo ispunite sva polja.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), newPassword }),
      });

      if (!response.ok) {
        const text = await response.text();
        let message = 'Reset lozinke nije uspio.';
        try {
          const data = JSON.parse(text);
          message = data.message ?? data.error ?? message;
        } catch {
          message = text || message;
        }
        Alert.alert('Greška', message);
        return;
      }

      Alert.alert(
        'Lozinka promijenjena',
        'Vaša lozinka je uspješno resetirana. Možete se prijaviti.',
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
          title="Postavi novu lozinku."
          subtitle="Unesite 6-znamenkasti kod koji ste primili na email i odaberite novu lozinku."
        />

        <View style={[s.fields, { marginBottom: 32 }]}>
          <FormField
            label="Kod iz emaila"
            value={token}
            onChangeText={setToken}
            placeholder="123456"
            keyboardType="number-pad"
          />
          <FormField
            label="Nova lozinka"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            secureTextEntry
          />
        </View>

        <View style={s.cta}>
          <TouchableOpacity
            style={[s.btnPrimary, loading && s.btnDisabled]}
            onPress={handleReset}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnPrimaryText}>Resetiraj lozinku</Text>
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

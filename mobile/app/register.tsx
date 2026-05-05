import API_BASE_URL from '@/constants/config';
import { T } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function LogoMark() {
  const sq = 40 / 7;
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      if ((i + j) % 2 === 0) {
        cells.push(
          <View
            key={`${i}-${j}`}
            style={{ position: 'absolute', left: i * sq, top: j * sq, width: sq, height: sq, backgroundColor: '#fff' }}
          />
        );
      }
    }
  }
  return (
    <View style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: T.red, overflow: 'hidden' }}>
      {cells}
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  optional,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  optional?: boolean;
}) {
  return (
    <View style={s.fieldWrap}>
      <View style={s.fieldLabelRow}>
        <Text style={s.fieldLabel}>{label.toUpperCase()}</Text>
        {optional && <Text style={s.fieldOptional}> · OPTIONAL</Text>}
      </View>
      <TextInput
        style={s.fieldInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={T.textFaint}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'none'}
        autoCorrect={false}
      />
    </View>
  );
}

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
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
        let message = 'Could not create account.';
        try {
          const data = JSON.parse(text);
          message = data.message ?? data.error ?? text;
        } catch {
          message = text || message;
        }
        Alert.alert('Registration Failed', message);
        return;
      }

      Alert.alert('Welcome to HNL Rate', 'Account created! Sign in to get started.', [
        { text: 'Sign in', onPress: () => router.replace('/login') },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 16 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Top row: logo + back */}
        <View style={s.topRow}>
          <LogoMark />
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Heading */}
        <View style={s.heading}>
          <Text style={s.title}>Join the stands.</Text>
          <Text style={s.subtitle}>Create an account to rate matches, players &amp; referees.</Text>
        </View>

        {/* Fields */}
        <View style={s.fields}>
          <Field label="Username" value={username} onChangeText={setUsername} placeholder="navijac_hr" />
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="ime@primjer.hr" keyboardType="email-address" />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
        </View>

        {/* CTA */}
        <View style={s.cta}>
          <TouchableOpacity
            style={[s.btnPrimary, loading && s.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnPrimaryText}>Create account</Text>}
          </TouchableOpacity>

          <View style={s.switchRow}>
            <Text style={s.switchText}>Already a member? </Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={s.switchLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 36,
  },
  backText: { fontSize: 14, color: T.textDim, fontWeight: '500' },

  heading: { marginBottom: 32 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: T.text,
    letterSpacing: -1,
    lineHeight: 36,
    marginBottom: 8,
  },
  subtitle: { fontSize: 15, color: T.textDim, lineHeight: 21 },

  fields: { gap: 16, marginBottom: 32 },
  fieldWrap: { gap: 8 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'baseline' },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: T.textFaint,
    letterSpacing: 0.8,
  },
  fieldOptional: {
    fontSize: 11,
    fontWeight: '600',
    color: T.textFaint,
    letterSpacing: 0.5,
  },
  fieldInput: {
    height: 52,
    borderRadius: 12,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.hairline,
    paddingHorizontal: 16,
    fontSize: 15,
    color: T.text,
  },

  cta: { gap: 16 },
  btnPrimary: {
    height: 52,
    borderRadius: 14,
    backgroundColor: T.red,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: T.red,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  switchText: { fontSize: 14, color: T.textDim },
  switchLink: { fontSize: 14, color: T.text, fontWeight: '700' },
});

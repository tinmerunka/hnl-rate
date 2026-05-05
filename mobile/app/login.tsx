import API_BASE_URL from '@/constants/config';
import { T } from '@/constants/theme';
import { useAuth } from '@/context/auth';
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
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
}) {
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>{label.toUpperCase()}</Text>
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

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
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
        Alert.alert('Login Failed', data.message ?? 'Invalid credentials.');
        return;
      }

      const token = data.accessToken ?? data.token;
      await login(token, data.refreshToken);
      router.replace('/(tabs)');
    } catch {
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
          <Text style={s.title}>Welcome back.</Text>
          <Text style={s.subtitle}>Pick up where you left off — rate matches, follow your club.</Text>
        </View>

        {/* Fields */}
        <View style={s.fields}>
          <Field label="Username" value={username} onChangeText={setUsername} placeholder="your_username" />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
          <TouchableOpacity style={s.forgotWrap}>
            <Text style={s.forgot}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />

        {/* CTA */}
        <View style={s.cta}>
          <TouchableOpacity
            style={[s.btnPrimary, loading && s.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnPrimaryText}>Sign in</Text>}
          </TouchableOpacity>

          <View style={s.switchRow}>
            <Text style={s.switchText}>New here? </Text>
            <TouchableOpacity onPress={() => router.replace('/register')}>
              <Text style={s.switchLink}>Create account</Text>
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

  fields: { gap: 16, marginBottom: 8 },
  fieldWrap: { gap: 8 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: T.textFaint,
    letterSpacing: 0.8,
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
  forgotWrap: { alignSelf: 'flex-end', marginTop: 2 },
  forgot: { fontSize: 13, color: T.textDim, fontWeight: '500' },

  cta: { gap: 16, paddingBottom: 8 },
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

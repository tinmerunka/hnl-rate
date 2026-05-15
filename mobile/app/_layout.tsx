import { AuthProvider, useAuth } from '@/context/auth';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

function RootNavigator() {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const first = segments[0] as string | undefined;
    const inProtectedArea = first === '(tabs)' || first === 'club' || first === 'match';
    const onAuthScreen = first === undefined || first === 'login' || first === 'register';

    if (!token && inProtectedArea) {
      router.replace('/');
    } else if (token && onAuthScreen) {
      router.replace('/(tabs)');
    }
  }, [token, loading, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="club/[id]" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" backgroundColor="#000000" />
    </AuthProvider>
  );
}

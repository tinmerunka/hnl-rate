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
    const inProtectedArea = segments[0] === '(tabs)' || segments[0] === 'club' || segments[0] === 'match';
    const onAuthScreen = segments.length === 0 || segments[0] === 'login' || segments[0] === 'register';

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

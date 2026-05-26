import '@/firebaseMessagingService';
import { AuthProvider, useAuth } from '@/context/auth';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, onNotificationOpenedApp, getInitialNotification } from '@react-native-firebase/messaging';

function RootNavigator() {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const first = segments[0] as string | undefined;
    const inProtectedArea = first === '(tabs)' || first === 'club' || first === 'match';
    const onAuthScreen = first === undefined || first === 'login' || first === 'register' || first === 'forgot-password' || first === 'reset-password';

    if (!token && inProtectedArea) {
      router.replace('/login');
    } else if (token && onAuthScreen) {
      router.replace('/(tabs)');
    }
  }, [token, loading, segments]);

  useEffect(() => {
    const msg = getMessaging(getApp());

    const unsubscribe = onNotificationOpenedApp(msg, remoteMessage => {
      const matchId = remoteMessage.data?.matchId;
      if (matchId) router.push(`/match/${matchId}`);
    });

    getInitialNotification(msg).then(remoteMessage => {
      if (remoteMessage?.data?.matchId) {
        router.push(`/match/${remoteMessage.data.matchId}`);
      }
    });

    return unsubscribe;
  }, []);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="reset-password" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="club/[id]" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="light" backgroundColor="#000000" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

import { AuthProvider } from '@/context/auth';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
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

import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  requestPermission,
  AuthorizationStatus,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import API_BASE_URL from '@/constants/config';

export async function registerForPushNotifications(accessToken: string): Promise<void> {
  try {
    const messaging = getMessaging(getApp());
    const authStatus = await requestPermission(messaging);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('[FCM] Korisnik nije dao dopuštenje za notifikacije.');
      return;
    }

    if (Platform.OS === 'android') {
      await registerDeviceForRemoteMessages(messaging);
    }

    const fcmToken = await getToken(messaging);
    if (!fcmToken) {
      console.log('[FCM] Nije moguće dohvatiti token.');
      return;
    }

    await fetch(`${API_BASE_URL}/api/user/push-token`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ fcmToken }),
    });

    console.log('[FCM] Token uspješno registriran.');
  } catch (error) {
    console.log('[FCM] Greška pri registraciji:', error);
  }
}

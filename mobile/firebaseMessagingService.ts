import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';

const messaging = getMessaging(getApp());

setBackgroundMessageHandler(messaging, async () => {
  // Notifikacije se prikazuju automatski od FCM-a, ovdje nema potrebe za dodatnom obradom
});

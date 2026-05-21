import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    // Menangkap notifikasi saat aplikasi terbuka di depan mata
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Menangkap respons ketika user MENG-KLIK notifikasi yang melayang
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notifikasi di-klik!', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return { expoPushToken, notification };
};
async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Gagal mendapatkan akses notifikasi!');
      return;
    }
    
    try {
      const projectId = 'b248a3c8-04f5-4a61-9c86-c4d32a0db833'; // Jika kosong, gunakan projectId dari app.json Anda, di sini kita gunakan cara aman
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Token Rahasia HP Ini:', token);
    } catch (error) {
      console.error(error);
    }
  } else {
    console.log('Notifikasi Push membutuhkan perangkat HP fisik asli.');
  }

  return token;
}


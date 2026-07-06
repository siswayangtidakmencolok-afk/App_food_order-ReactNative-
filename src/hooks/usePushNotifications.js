import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
    configurePushHandler,
    registerForPushNotificationsAsync,
} from '../services/pushNotificationService';

// expo-notifications tidak support web sepenuhnya — hanya setup di native
if (Platform.OS !== 'web') {
  configurePushHandler();
}

/** @param {((token: string) => void|Promise<void>)|null} onToken */
export const usePushNotifications = (onToken) => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [permissionStatus, setPermissionStatus] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Push notifications tidak didukung di web
    if (Platform.OS === 'web') return;

    registerForPushNotificationsAsync().then(({ token, status }) => {
      setPermissionStatus(status);
      if (token) {
        setExpoPushToken(token);
        onToken?.(token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});
    responseListener.current = Notifications.addNotificationResponseReceivedListener((r) => {
      console.log('[push] tapped', r.notification.request.content.data);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [onToken]);

  return { expoPushToken, permissionStatus };
};

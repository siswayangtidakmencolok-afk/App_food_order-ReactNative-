import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import {
  configurePushHandler,
  registerForPushNotificationsAsync,
} from '../services/pushNotificationService';

configurePushHandler();

/** @param {((token: string) => void|Promise<void>)|null} onToken */
export const usePushNotifications = (onToken) => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [permissionStatus, setPermissionStatus] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
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
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [onToken]);

  return { expoPushToken, permissionStatus };
};

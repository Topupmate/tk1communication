import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

import { navigate } from '../../utilities/RootNavigation';
import { createScopedDebugger } from '../../utils/debugScopes';
import {
  getNotificationThatOpenedApp,
  listenForForegroundMessages,
  listenForNotificationOpens,
  listenForTokenRefresh,
  syncPushRegistration,
} from './fcm';

const __pushDebug = createScopedDebugger('PUSH');

const openNotification = (remoteMessage) => {
  __pushDebug('[PUSH] notification open', {
    messageId: remoteMessage?.messageId,
    title: remoteMessage?.notification?.title,
  });
  navigate('notificationPage');
};

const showForegroundToast = (remoteMessage) => {
  const title = remoteMessage?.notification?.title;
  const body = remoteMessage?.notification?.body;
  if (!title && !body) return;

  Toast.show({
    type: ALERT_TYPE.INFO,
    title: title || 'Notification',
    textBody: body || '',
  });
};

export default function FcmRegistrationBridge() {
  const authToken = useSelector((state) => state?.globalState?.token);
  const isAuthenticated = useSelector((state) => state?.globalState?.isAuthenticated);

  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    if (!isAuthenticated || !authToken) return undefined;
    syncPushRegistration(authToken);
    return listenForTokenRefresh(() => {
      syncPushRegistration(authToken);
    });
  }, [authToken, isAuthenticated]);

  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    const unsubscribeMessage = listenForForegroundMessages(showForegroundToast);
    const unsubscribeOpen = listenForNotificationOpens(openNotification);

    getNotificationThatOpenedApp()
      .then((remoteMessage) => {
        if (remoteMessage) openNotification(remoteMessage);
      })
      .catch(() => {});

    return () => {
      unsubscribeMessage();
      unsubscribeOpen();
    };
  }, []);

  return null;
}

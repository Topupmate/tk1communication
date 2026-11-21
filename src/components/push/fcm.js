import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import {
  AuthorizationStatus,
  deleteToken,
  getInitialNotification,
  getMessaging,
  getToken,
  hasPermission,
  isDeviceRegisteredForRemoteMessages,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  requestPermission,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

import { GetData, StoreData } from '../../constants/storage';
import { registerFcmToken, removeFcmToken } from '../../store/apis/push';
import { createScopedDebugger } from '../../utils/debugScopes';

const __pushDebug = createScopedDebugger('PUSH');

const SAVED_TOKEN_KEY = 'fcm_token';

const messaging = () => getMessaging();

export const isPushGranted = (status) =>
  status === AuthorizationStatus.AUTHORIZED ||
  status === AuthorizationStatus.PROVISIONAL ||
  status === AuthorizationStatus.EPHEMERAL;

const tokenPreview = (value) => {
  const token = String(value || '');
  if (token.length < 12) return '';
  return `${token.slice(0, 6)}…${token.slice(-4)}`;
};

async function devicePayload() {
  const platform =
    Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : null;
  if (!platform) return null;

  let deviceId;
  try {
    if (platform === 'android') {
      deviceId = Application.getAndroidId();
    } else {
      deviceId = await Application.getIosIdForVendorAsync();
    }
  } catch (error) {
    __pushDebug('[PUSH] device id unavailable', { message: error?.message });
  }

  const deviceName = Constants.deviceName || undefined;
  return {
    platform,
    deviceId: deviceId || undefined,
    deviceName,
  };
}

async function ensureIosRegistered() {
  if (Platform.OS !== 'ios') return;
  if (isDeviceRegisteredForRemoteMessages(messaging())) return;
  await registerDeviceForRemoteMessages(messaging());
}

async function readCurrentToken() {
  await ensureIosRegistered();
  return getToken(messaging());
}

/**
 * Posts the current FCM registration token. Retries on the next launch when
 * the API is down or the PHP route is not deployed yet.
 */
export async function registerCurrentToken(authToken) {
  if (!authToken || Platform.OS === 'web') return false;

  let fcmToken;
  try {
    fcmToken = await readCurrentToken();
  } catch (error) {
    __pushDebug('[PUSH] getToken failed', { message: error?.message });
    return false;
  }

  if (!fcmToken) return false;

  const device = await devicePayload();
  if (!device) return false;

  try {
    const response = await registerFcmToken({
      token: authToken,
      fcmToken,
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      platform: device.platform,
    });

    if (response?.status !== 'success') {
      __pushDebug('[PUSH] register-fcm-token rejected', {
        status: response?.status,
        message: response?.message,
      });
      return false;
    }

    await StoreData(SAVED_TOKEN_KEY, fcmToken);
    __pushDebug('[PUSH] token registered', {
      platform: device.platform,
      token: tokenPreview(fcmToken),
    });
    return true;
  } catch (error) {
    __pushDebug('[PUSH] register-fcm-token failed', { message: error?.message });
    return false;
  }
}

export async function disablePushNotifications(authToken) {
  await StoreData('allow_notification', false);

  let fcmToken = await GetData(SAVED_TOKEN_KEY);
  try {
    const current = await getToken(messaging());
    if (current) fcmToken = current;
  } catch {
    // Firebase may already be unregistered. The saved token is enough to
    // tell the server to stop sending to this device.
  }

  let removed = !fcmToken;
  if (authToken && fcmToken) {
    try {
      const response = await removeFcmToken({ token: authToken, fcmToken });
      removed = response?.status === 'success';
      if (!removed) {
        __pushDebug('[PUSH] remove-fcm-token rejected', {
          status: response?.status,
          message: response?.message,
        });
      }
    } catch (error) {
      removed = false;
      __pushDebug('[PUSH] remove-fcm-token failed', { message: error?.message });
    }
  }

  try {
    await deleteToken(messaging());
  } catch (error) {
    __pushDebug('[PUSH] deleteToken failed', { message: error?.message });
  }

  // Keep the token string when the server did not accept the removal so the
  // next launch can retry. The local FCM registration is already deleted.
  await StoreData(SAVED_TOKEN_KEY, removed ? null : fcmToken || null);
}

/**
 * Shows the OS permission prompt, then registers the FCM token when the user
 * is signed in. Returns whether notifications are allowed.
 */
export async function enablePushNotifications(authToken) {
  await StoreData('asked_push_permission', true);

  if (Platform.OS === 'web') {
    await StoreData('allow_notification', false);
    return false;
  }

  try {
    await ensureIosRegistered();
    const status = await requestPermission(messaging());
    const granted = isPushGranted(status);
    await StoreData('allow_notification', granted);
    if (!granted) return false;
    if (authToken) await registerCurrentToken(authToken);
    return true;
  } catch (error) {
    __pushDebug('[PUSH] permission request failed', { message: error?.message });
    return false;
  }
}

/**
 * Registers when the user is signed in and has not opted out, and the OS
 * already allows notifications. Does not show a permission prompt.
 */
export async function syncPushRegistration(authToken) {
  if (!authToken || Platform.OS === 'web') return;

  const allowed = await GetData('allow_notification');
  if (allowed === false) {
    const saved = await GetData(SAVED_TOKEN_KEY);
    if (saved) await disablePushNotifications(authToken);
    return;
  }

  try {
    const status = await hasPermission(messaging());
    if (!isPushGranted(status)) return;
    await registerCurrentToken(authToken);
  } catch (error) {
    __pushDebug('[PUSH] sync failed', { message: error?.message });
  }
}

export function listenForTokenRefresh(onToken) {
  return onTokenRefresh(messaging(), (nextToken) => {
    if (nextToken) onToken(nextToken);
  });
}

export function listenForForegroundMessages(onRemoteMessage) {
  return onMessage(messaging(), onRemoteMessage);
}

export function listenForNotificationOpens(onRemoteMessage) {
  return onNotificationOpenedApp(messaging(), onRemoteMessage);
}

export function getNotificationThatOpenedApp() {
  return getInitialNotification(messaging());
}

export function registerBackgroundHandler() {
  if (Platform.OS === 'web') return;
  setBackgroundMessageHandler(messaging(), async () => {
    // Notification messages are displayed by the OS while the app is
    // backgrounded. This handler settles data-only messages.
  });
}

export async function currentPermissionIsDenied() {
  try {
    const status = await hasPermission(messaging());
    return status === AuthorizationStatus.DENIED;
  } catch {
    return false;
  }
}

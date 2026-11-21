import { sendRequest } from './api';

/**
 * Registers this device's FCM registration token for the signed-in user.
 * The PHP API must implement POST apiserver/register-fcm-token.
 * See FCM_SERVER_AND_ADMIN.md.
 */
export const registerFcmToken = async ({
  token,
  fcmToken,
  deviceId,
  deviceName,
  platform,
}) => {
  return sendRequest({
    method: 'POST',
    url: 'register-fcm-token',
    token,
    data: {
      token: fcmToken,
      deviceId,
      deviceName,
      platform,
    },
  });
};

/**
 * Drops one device token so this install stops receiving pushes after the
 * user turns notifications off. POST apiserver/remove-fcm-token.
 */
export const removeFcmToken = async ({ token, fcmToken }) => {
  return sendRequest({
    method: 'POST',
    url: 'remove-fcm-token',
    token,
    data: {
      token: fcmToken,
    },
  });
};

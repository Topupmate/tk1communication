import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

import * as RootNavigation from './../../utilities/RootNavigation';
import { createScopedDebugger, logFeatures } from '../../utils/debugScopes';

export const BaseUrl = 'https://primebiller.com/apiserver/';
// export const BaseUrl = 'https://sample.topupmate.com/apiserver/';

const __apiDebug = createScopedDebugger('API');

const __hasToken = (t) => Boolean(t && String(t).trim().length > 10);

const __redactValue = (v) => {
  if (v == null) return v;
  const s = String(v);
  if (s.length <= 4) return '*'.repeat(s.length);
  return `${s.slice(0, 2)}${'*'.repeat(Math.max(0, s.length - 4))}${s.slice(-2)}`;
};

const __redactForLogs = (input) => {
  const SENSITIVE_KEYS = new Set([
    'pin',
    'transkey',
    'token',
    'authorization',
    'serial',
    'password',
    'otp',
  ]);

  const walk = (value) => {
    if (Array.isArray(value)) return value.map(walk);
    if (value && typeof value === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(value)) {
        if (SENSITIVE_KEYS.has(String(k).toLowerCase())) {
          out[k] = __redactValue(v);
        } else {
          out[k] = walk(v);
        }
      }
      return out;
    }
    return value;
  };

  try {
    return walk(input);
  } catch {
    return undefined;
  }
};

export const sendRequest = async ({
  url,
  data,
  method,
  token,
  removeTokenValidation,
  formData,
  baseUrl = BaseUrl,
  useFeaturesApi = false,
}) => {
  try {
    const t0 = Date.now();
    const requestMeta = {
      method: method ? method : 'get',
      url,
      baseUrl,
      hasToken: __hasToken(token),
      hasBody: Boolean(data),
      body: __redactForLogs(data),
      formData: Boolean(formData),
      useFeaturesApi,
    };

    __apiDebug('[API] request', requestMeta);
    if (useFeaturesApi) {
      logFeatures('API', 'request', requestMeta);
    }

    const response = await fetch(`${baseUrl}${url}`, {
      method: method ? method : 'get',
      headers: {
        'Content-Type': formData ? 'multipart/form-data' : 'application/json',
        [token && 'Authorization']: token && `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (useFeaturesApi) {
      logFeatures('API', 'response meta', {
        method: method ? method : 'get',
        url: `${baseUrl}${url}`,
        httpOk: response?.ok,
        httpStatus: response?.status,
        ms: Date.now() - t0,
      });
    }

    if (response) {
      const newData = await response.json();
      if (useFeaturesApi) {
        logFeatures('API', 'response body', {
          url: `${baseUrl}${url}`,
          status: newData?.status,
          message: newData?.message,
          code: newData?.code,
          responseCount: Array.isArray(newData?.response)
            ? newData.response.length
            : newData?.response
              ? 1
              : 0,
        });
      }
      __apiDebug('[API] response', {
        ms: Date.now() - t0,
        httpOk: response?.ok,
        httpStatus: response?.status,
        url,
        status: newData?.status,
        message: newData?.message,
        code: newData?.code,
        raw: __redactForLogs(newData),
      });
      if (newData?.code === '401' && !removeTokenValidation) {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'please login again',
          textBody: 'session expired, please login again',
          button: 'close',
        });

        RootNavigation.navigate('welcomePage');

        return;
      }
      return newData;
    }
  } catch (error) {
    __apiDebug('[API] error', {
      url,
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });
    return error;
  }
};

export const sendOtpFunction = async ({ email }) => {
  try {
    const response = await sendRequest({
      method: 'POST',
      url: '/',
      data: {
        service: 'forgetpassword',
        email,
      },
    });

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const verifyOtp = async ({ email, otp }) => {
  try {
    const response = await sendRequest({
      method: 'POST',
      url: '/',
      data: {
        service: 'confirmemailotp',
        email,
        otp,
      },
    });

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const changePassword = async ({ email, otp, password }) => {
  try {
    const response = await sendRequest({
      method: 'POST',
      url: '/',
      data: {
        service: 'resetpassword',
        email,
        otp,
        password,
      },
    });

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

import { BaseUrl } from './api';
import { logFeatures } from '../../utils/debugScopes';

const __maskPin = (p) => {
  if (!p) return '';
  const s = String(p);
  if (s.length <= 2) return '*'.repeat(s.length);
  return `${s.slice(0, 1)}${'*'.repeat(Math.max(0, s.length - 2))}${s.slice(-1)}`;
};

// This endpoint only reads form fields (JSON bodies are ignored) and is
// case-sensitive about field names, so we send every casing variant to be safe.
const buildFormBody = ({ sendername, phoneNumbers, message, ref, pin }) => {
  const params = new URLSearchParams();
  const appendVariants = (keys, value) => {
    keys.forEach((key) => params.append(key, String(value ?? '')));
  };

  appendVariants(['transkey', 'Transkey'], pin);
  appendVariants(['transref', 'Transref'], ref);
  appendVariants(['sendername', 'SenderName', 'senderName'], sendername);
  appendVariants(['phoneNumbers', 'PhoneNumbers', 'phonenumbers'], phoneNumbers);
  appendVariants(['message', 'Message'], message);

  return params.toString();
};

export const SendBulkSms = async ({
  token,
  sendername,
  phoneNumbers,
  message,
  ref,
  pin,
}) => {
  const endpoint = `${BaseUrl}bulk-sms`;
  const body = buildFormBody({ sendername, phoneNumbers, message, ref, pin });

  logFeatures('BulkSms', 'SendBulkSms request', {
    endpoint,
    sendername,
    phoneNumbers,
    messageLength: message?.length,
    transref: ref,
    transkey: __maskPin(pin),
    hasToken: Boolean(token),
    contentType: 'application/x-www-form-urlencoded',
  });

  try {
    const t0 = Date.now();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    const data = await response.json();
    logFeatures('BulkSms', 'SendBulkSms response', {
      endpoint,
      transref: ref,
      httpOk: response?.ok,
      httpStatus: response?.status,
      ms: Date.now() - t0,
      status: data?.status,
      message: data?.message,
      code: data?.code,
    });
    return data;
  } catch (error) {
    logFeatures('BulkSms', 'SendBulkSms error', {
      endpoint,
      transref: ref,
      message: error?.message,
      name: error?.name,
    });
    return error;
  }
};

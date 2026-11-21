import { BaseUrl, sendRequest } from './api';
import { logFeatures } from '../../utils/debugScopes';

const BUY_TIMEOUT_MS = 25000;

const postBuyJson = async ({
  endpoint,
  fields,
  token,
  scope,
  meta = {},
}) => {
  logFeatures(scope, `${endpoint} request`, {
    endpoint: `${BaseUrl}${endpoint}`,
    hasToken: Boolean(token),
    contentType: 'application/json',
    ...meta,
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BUY_TIMEOUT_MS);

  try {
    const t0 = Date.now();
    const response = await fetch(`${BaseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fields),
      signal: controller.signal,
    });
    const data = await response.json();
    logFeatures(scope, `${endpoint} response`, {
      httpOk: response?.ok,
      httpStatus: response?.status,
      ms: Date.now() - t0,
      status: data?.status,
      message: data?.message || data?.msg,
    });
    return data;
  } catch (error) {
    const message =
      error?.name === 'AbortError'
        ? 'Request timed out'
        : error?.message || 'Purchase failed';
    logFeatures(scope, `${endpoint} error`, { message });
    return { status: 'fail', message };
  } finally {
    clearTimeout(timer);
  }
};

export const GetKiraniPlans = async ({ token }) => {
  logFeatures('Kirani', 'GetKiraniPlans request', { hasToken: Boolean(token) });
  const response = await sendRequest({
    url: 'kirani-plans',
    token,
    useFeaturesApi: true,
  });
  logFeatures('Kirani', 'GetKiraniPlans response', {
    status: response?.status,
    rate: response?.response?.rate,
  });
  return response;
};

export const BuyKirani = async ({ token, plan, amount, phone, pin, transref }) =>
  postBuyJson({
    endpoint: 'buy-kirani',
    token,
    scope: 'Kirani',
    fields: {
      plan: String(plan ?? ''),
      amount: Number(amount),
      phone: String(phone ?? ''),
      transkey: String(pin ?? ''),
      transref: String(transref ?? ''),
    },
    meta: {
      plan: String(plan ?? ''),
      amount: String(amount ?? ''),
      phone: String(phone ?? ''),
      transref: String(transref ?? ''),
      hasTranskey: Boolean(pin),
      transkeyLength: String(pin ?? '').length,
    },
  });

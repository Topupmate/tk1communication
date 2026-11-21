import axios from 'axios';
import { BaseUrl, sendRequest } from './api';
import { createScopedDebugger } from '../../utils/debugScopes';

const __maskPin = (p) => {
  if (!p) return '';
  const s = String(p);
  if (s.length <= 2) return '*'.repeat(s.length);
  return `${s.slice(0, 1)}${'*'.repeat(Math.max(0, s.length - 2))}${s.slice(-1)}`;
};

const __hasToken = (t) => Boolean(t && String(t).trim().length > 10);

// Existing logs in this file are dev-only. We keep that behavior here.
// For buy-data specifically, we want the logs to be user-toggleable.
const __debug = (...args) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};

const __buyDataDebug = createScopedDebugger('BUY_DATA');
const __buyAirtimeDebug = createScopedDebugger('BUY_AIRTIME');
const __tvDebug = createScopedDebugger('TV');
const __apiDebug = createScopedDebugger('API');

const __redactValue = (v) => {
  if (v == null) return v;
  const s = String(v);
  if (s.length <= 4) return '*'.repeat(s.length);
  return `${s.slice(0, 2)}${'*'.repeat(Math.max(0, s.length - 4))}${s.slice(-2)}`;
};

// Redacts sensitive keys anywhere in a response object before logging.
const __redactForLogs = (input) => {
  const SENSITIVE_KEYS = new Set([
    'pin', // purchased recharge pin or user transaction pin
    'transkey',
    'token',
    'authorization',
    'serial',
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
export const GetAirtimeDiscounts = async ({ token }) => {
  return await sendRequest({
    method: 'POST',
    url: 'user/airtime-discounts',
    token,
  });
};

export const GetNetworkSettings = async ({ token }) => {
  return await sendRequest({
    url: 'networks',
    token,
  });
};

export const GetHomeNotification = async ({ token }) => {
  return await sendRequest({
    url: 'home-notification',
    token,
  });
};
export const GetAirtimeNetworkStatus = async ({ token }) => {
  return await sendRequest({
    url: 'airtime-status',
    token,
  });
};

export const GetDataNetworkStatus = async ({ token }) => {
  return await sendRequest({
    url: 'data-status',
    token,
  });
};
export const PurchaseAirtime = async ({
  token,
  network,
  phone,
  amount,
  ported_number,
  airtime_type,
  ref,
  pin,
}) => {
  const formData = new FormData();
  formData.append('network', network);
  formData.append('amount', amount);
  formData.append('phone', phone);
  formData.append('networktype', airtime_type);
  formData.append('transref', ref);
  formData.append('transkey', pin);

  try {
    const t0 = Date.now();
    __buyAirtimeDebug('[BUY_AIRTIME] PurchaseAirtime request', {
      ref,
      network,
      airtime_type,
      amount,
      phoneLast4: phone ? String(phone).slice(-4) : '',
      hasToken: __hasToken(token),
      pin: __maskPin(pin),
      endpoint: `${BaseUrl}buy-airtime`,
    });
    const response = await fetch(`${BaseUrl}buy-airtime`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    __buyAirtimeDebug('[BUY_AIRTIME] PurchaseAirtime response', {
      ref,
      ms: Date.now() - t0,
      httpOk: response?.ok,
      httpStatus: response?.status,
      status: data?.status,
      message: data?.message,
      code: data?.code,
      response: __redactForLogs(data?.response),
      raw: __redactForLogs(data),
    });
    return data;
  } catch (error) {
    __buyAirtimeDebug('[BUY_AIRTIME] PurchaseAirtime error', {
      ref,
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      network,
      airtime_type,
      amount,
      phoneLast4: phone ? String(phone).slice(-4) : '',
      hasToken: __hasToken(token),
      pin: __maskPin(pin),
      endpoint: `${BaseUrl}buy-airtime`,
    });
    return error;
  }
};

export const PurchaseData = async ({
  token,
  network,
  phone,
  ref,
  data_plan,
  pin,
}) => {
  const formData = new FormData();
  formData.append('network', network);
  formData.append('phone', phone);
  formData.append('dataplan', data_plan);
  formData.append('transref', ref);
  formData.append('transkey', pin);

  try {
    const t0 = Date.now();
    __buyDataDebug('[BUY_DATA] PurchaseData request', {
      ref,
      network,
      phoneLast4: phone ? String(phone).slice(-4) : '',
      data_plan,
      hasToken: __hasToken(token),
      pin: __maskPin(pin),
      endpoint: `${BaseUrl}buy-data`,
    });
    const response = await fetch(`${BaseUrl}buy-data`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await response.json();
    __buyDataDebug('[BUY_DATA] PurchaseData response', {
      ref,
      ms: Date.now() - t0,
      httpOk: response?.ok,
      httpStatus: response?.status,
      status: data?.status,
      message: data?.message,
      code: data?.code,
      response: __redactForLogs(data?.response),
      raw: __redactForLogs(data),
    });
    return data;
  } catch (error) {
    __buyDataDebug('[BUY_DATA] PurchaseData error', {
      ref,
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      network,
      phoneLast4: phone ? String(phone).slice(-4) : '',
      data_plan,
      hasToken: __hasToken(token),
      pin: __maskPin(pin),
      endpoint: `${BaseUrl}buy-data`,
    });
    return error;
  }
};

export const GetDataPlans = async ({ token }) => {
  return await sendRequest({
    url: 'data-plans',
    token,
  });
};

export const GetCableProviders = async ({ token }) => {
  return await sendRequest({
    url: 'cable-providers',
    token,
  });
};

export const GetCablePlans = async ({ token }) => {
  return await sendRequest({
    url: 'cable-plans',
    token,
  });
};

export const VerifyCableNumber = async ({ token, iucnumber, cablename }) => {
  const formdata = new FormData();
  formdata.append('provider', cablename);
  formdata.append('iucnumber', iucnumber);

  try {
    const t0 = Date.now();
    __tvDebug('[TV] VerifyCableNumber request', {
      provider: cablename,
      iucLast4: iucnumber ? String(iucnumber).replace(/\s+/g, '').slice(-4) : '',
      hasToken: __hasToken(token),
      endpoint: `${BaseUrl}cable-number`,
    });
    const response = await fetch(`${BaseUrl}cable-number`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formdata,
    });
    const data = await response.json();
    __tvDebug('[TV] VerifyCableNumber response', {
      ms: Date.now() - t0,
      httpOk: response?.ok,
      httpStatus: response?.status,
      status: data?.status,
      message: data?.message,
      code: data?.code,
      response: __redactForLogs(data?.response),
      raw: __redactForLogs(data),
    });
    return data;
  } catch (error) {
    __tvDebug('[TV] VerifyCableNumber error', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      provider: cablename,
      iucLast4: iucnumber ? String(iucnumber).replace(/\s+/g, '').slice(-4) : '',
      hasToken: __hasToken(token),
      endpoint: `${BaseUrl}cable-number`,
    });
    return error;
  }
};

export const SubscribeCableTv = async ({
  token,
  provider,
  phone,
  iucnumber,
  ref,
  pin,
  cableplanId,
  subtype,
}) => {
  const formdata = new FormData();
  // Backend field names are inconsistent across environments.
  // Send both variants so the server can resolve the package:
  // - provider/cableplan (legacy)
  // - packageCode/addonCode (newer)
  formdata.append('provider', provider);
  formdata.append('packageCode', provider);
  formdata.append('phone', phone);
  const normalizedSubtype = subtype ? String(subtype).toLowerCase() : '';
  formdata.append('subtype', normalizedSubtype);
  formdata.append('iucnumber', iucnumber);
  formdata.append('transref', ref);
  formdata.append('transkey', pin);
  formdata.append('cableplan', cableplanId);
  formdata.append('addonCode', cableplanId);
  try {
    const t0 = Date.now();
    __tvDebug('[TV] SubscribeCableTv request', {
      ref,
      provider,
      subtype: normalizedSubtype,
      cableplanId,
      phoneLast4: phone ? String(phone).replace(/\s+/g, '').slice(-4) : '',
      iucLast4: iucnumber ? String(iucnumber).replace(/\s+/g, '').slice(-4) : '',
      hasToken: __hasToken(token),
      pin: __maskPin(pin),
      endpoint: `${BaseUrl}subscribe-cabletv`,
    });
    const response = await fetch(`${BaseUrl}subscribe-cabletv`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formdata,
    });
    const data = await response.json();
    __tvDebug('[TV] SubscribeCableTv response', {
      ref,
      ms: Date.now() - t0,
      httpOk: response?.ok,
      httpStatus: response?.status,
      status: data?.status,
      message: data?.message,
      code: data?.code,
      response: __redactForLogs(data?.response),
      raw: __redactForLogs(data),
    });
    return data;
  } catch (error) {
    __tvDebug('[TV] SubscribeCableTv error', {
      ref,
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      provider,
      subtype,
      cableplanId,
      phoneLast4: phone ? String(phone).replace(/\s+/g, '').slice(-4) : '',
      iucLast4: iucnumber ? String(iucnumber).replace(/\s+/g, '').slice(-4) : '',
      hasToken: __hasToken(token),
      pin: __maskPin(pin),
      endpoint: `${BaseUrl}subscribe-cabletv`,
    });
    return error;
  }
};

export const GetElectricityProviders = async ({ token }) => {
  __debug('[ELECTRICITY] GetElectricityProviders request', {
    hasToken: __hasToken(token),
  });
  return await sendRequest({
    url: 'meter-providers',
    token,
  });
};
export const VerifyMeterNumber = async ({
  token,
  meternumber,
  provider,
  metertype,
}) => {
  const formdata = new FormData();
  formdata.append('provider', provider);
  formdata.append('meternumber', meternumber);
  formdata.append('metertype', metertype);

  try {
    const t0 = Date.now();
    __debug('[ELECTRICITY] VerifyMeterNumber request', {
      provider,
      meternumber,
      metertype,
      hasToken: __hasToken(token),
    });
    const response = await fetch(`${BaseUrl}meter-number`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formdata,
    });
    const data = await response.json();
    __debug('[ELECTRICITY] VerifyMeterNumber response', {
      ms: Date.now() - t0,
      httpOk: response?.ok,
      httpStatus: response?.status,
      status: data?.status,
      message: data?.message,
      code: data?.code,
      response: __redactForLogs(data?.response),
      raw: __redactForLogs(data),
    });
    return data;
  } catch (error) {
    __debug('[ELECTRICITY] VerifyMeterNumber error', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      provider,
      meternumber,
      metertype,
      hasToken: __hasToken(token),
    });
    return error;
  }
};

export const PurchaseElectricityToken = async ({
  token,
  meternumber,
  provider,
  metertype,
  amount,
  pin,
  phone,
  ref,
}) => {
  console.log('========== ELECTRICITY TOKEN PURCHASE START ==========');
  console.log('[ELECTRICITY] Step 1: Preparing request data', {
    ref,
    provider,
    meternumber,
    metertype,
    amount,
    phone,
    hasToken: __hasToken(token),
    pin: __maskPin(pin),
  });

  const formdata = new FormData();
  formdata.append('provider', provider);
  formdata.append('meternumber', meternumber);
  formdata.append('metertype', metertype);
  formdata.append('amount', amount);
  formdata.append('phone', phone);
  formdata.append('transkey', pin);
  formdata.append('transref', ref);

  console.log('[ELECTRICITY] Step 2: FormData prepared, sending request to:', `${BaseUrl}purchase-meter`);

  try {
    const t0 = Date.now();
    __debug('[ELECTRICITY] PurchaseElectricityToken request', {
      ref,
      provider,
      meternumber,
      metertype,
      amount,
      phone,
      hasToken: __hasToken(token),
      pin: __maskPin(pin),
      endpoint: `${BaseUrl}purchase-meter`,
    });

    const response = await fetch(`${BaseUrl}purchase-meter`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formdata,
    });

    console.log('[ELECTRICITY] Step 3: Response received', {
      ref,
      ms: Date.now() - t0,
      httpOk: response?.ok,
      httpStatus: response?.status,
    });

    const data = await response.json();

    console.log('[ELECTRICITY] Step 4: Response parsed', {
      ref,
      status: data?.status,
      message: data?.message,
      code: data?.code,
    });

    console.log('[ELECTRICITY] Step 5: FULL RESPONSE DATA (for debugging):', JSON.stringify(data, null, 2));

    // Log the actual token if it exists - check multiple possible locations
    if (data?.response) {
      const tokenData = data.response.msg || data.response;
      const extractedToken = tokenData?.token || tokenData?.Token || data.response.token || data.response.Token;
      const extractedUnits = tokenData?.units || tokenData?.Units || data.response.units || data.response.Units;
      
      console.log('[ELECTRICITY] Step 6: TOKEN DATA FOUND:', {
        ref,
        responseType: typeof data.response,
        token: extractedToken || 'N/A',
        units: extractedUnits || 'N/A',
        customerName: tokenData?.customername || tokenData?.CustomerName || 'N/A',
        address: tokenData?.address || tokenData?.Address || 'N/A',
        fullResponse: data.response, // Full token data for success screen
        msgObject: data.response.msg, // Nested msg object if exists
      });
      
      // Extra log for easy copy-paste of token
      if (extractedToken && extractedToken !== 'N/A') {
        console.log('[ELECTRICITY] ✅ TOKEN:', extractedToken);
      }
    } else {
      console.log('[ELECTRICITY] Step 6: No token data in response');
    }

    __debug('[ELECTRICITY] PurchaseElectricityToken response', {
      ref,
      ms: Date.now() - t0,
      httpOk: response?.ok,
      httpStatus: response?.status,
      status: data?.status,
      message: data?.message,
      code: data?.code,
      response: __redactForLogs(data?.response),
      raw: __redactForLogs(data),
    });

    console.log('========== ELECTRICITY TOKEN PURCHASE END ==========\n');
    return data;
  } catch (error) {
    console.error('[ELECTRICITY] ERROR occurred:', {
      ref,
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });

    __debug('[ELECTRICITY] PurchaseElectricityToken error', {
      ref,
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      provider,
      meternumber,
      metertype,
      amount,
      phone,
      hasToken: __hasToken(token),
      pin: __maskPin(pin),
    });

    console.log('========== ELECTRICITY TOKEN PURCHASE END (ERROR) ==========\n');
    return error;
  }
};
export const GetExamPinProviders = async ({ token }) => {
  __debug('[EXAM_PIN] GetExamPinProviders request', {
    hasToken: __hasToken(token),
  });
  const res = await sendRequest({
    url: 'exam-providers',
    token,
  });
  __debug('[EXAM_PIN] GetExamPinProviders response', {
    status: res?.status,
    message: res?.message,
    count: Array.isArray(res?.response) ? res.response.length : undefined,
    first: Array.isArray(res?.response) ? res.response[0] : undefined,
  });
  return res;
};

export const PurchaseExamPin = async ({
  token,
  provider,
  quantity,
  pin,
  ref,
}) => {
  console.log('========== EXAM PIN PURCHASE START ==========');
  console.log('[EXAM_PIN] Step 1: Preparing request data', {
    ref,
    provider,
    quantity,
    hasToken: __hasToken(token),
    pin: __maskPin(pin),
  });

  const formdata = new FormData();
  formdata.append('provider', provider);
  formdata.append('quantity', quantity);
  formdata.append('transref', ref);
  formdata.append('transkey', pin);

  console.log('[EXAM_PIN] Step 2: FormData prepared, sending request to:', `${BaseUrl}purchase-exampin`);

  try {
    const t0 = Date.now();
    __debug('[EXAM_PIN] PurchaseExamPin request', {
      provider,
      quantity,
      ref,
      hasToken: __hasToken(token),
      pin: __maskPin(pin),
    });

    const response = await fetch(`${BaseUrl}purchase-exampin`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formdata,
    });

    console.log('[EXAM_PIN] Step 3: Response received', {
      ref,
      ms: Date.now() - t0,
      httpOk: response?.ok,
      httpStatus: response?.status,
    });

    const data = await response.json();

    console.log('[EXAM_PIN] Step 4: Response parsed', {
      ref,
      status: data?.status,
      message: data?.message,
      code: data?.code,
    });

    console.log('[EXAM_PIN] Step 5: FULL RESPONSE DATA (for debugging):', JSON.stringify(data, null, 2));

    // Log the actual exam pins if they exist
    if (data?.response) {
      console.log('[EXAM_PIN] Step 6: EXAM PIN DATA FOUND:', {
        ref,
        responseType: typeof data.response,
        isArray: Array.isArray(data.response),
        pinCount: Array.isArray(data.response) ? data.response.length : 'N/A',
        pins: data.response, // Full exam pin data for success screen
      });
    } else {
      console.log('[EXAM_PIN] Step 6: No exam pin data in response');
    }

    __debug('[EXAM_PIN] PurchaseExamPin response', {
      httpOk: response?.ok,
      httpStatus: response?.status,
      status: data?.status,
      message: data?.message,
      code: data?.code,
      response: data?.response,
    });

    console.log('========== EXAM PIN PURCHASE END ==========\n');
    return data;
  } catch (error) {
    console.error('[EXAM_PIN] ERROR occurred:', {
      ref,
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });

    __debug('[EXAM_PIN] PurchaseExamPin error', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });

    console.log('========== EXAM PIN PURCHASE END (ERROR) ==========\n');
    return error;
  }
};

export const GetDataPinPlans = async ({
  token,
  fullname,
  role,
  accountstatus,
  username,
}) => {
  return await sendRequest({
    url: 'datapin-plans',
    token,
  });
};

export const GetDataPins = async ({ token }) => {
  return await sendRequest({
    // method: 'POST',
    url: 'datapin-tokens?pagenumber=1',
    token,
  });
};

export const GetAirtimePinDetails = async ({ token, ref }) => {
  return await sendRequest({
    url: 'rechargecard-tokens?ref=' + ref,
    token,
  });
};
export const GetDataPinDetails = async ({ token, ref }) => {
  return await sendRequest({
    url: 'datapin-tokens?ref=' + ref,
    token,
  });
};
export const PurchaseDataPin = async ({
  token,
  network,
  businessname,
  quantity,
  plan,
  ref,
  pin,
}) => {
  console.log('========== DATA PIN PURCHASE START ==========');
  console.log('[DATA_PIN] Step 1: Preparing request data', {
    ref,
    network,
    businessname,
    quantity,
    plan,
    hasToken: __hasToken(token),
    pin: __maskPin(pin),
  });

  const formdata = new FormData();
  formdata.append('network', network);
  formdata.append('quantity', quantity);
  formdata.append('businessname', businessname);
  formdata.append('datapinplan', plan);
  formdata.append('transref', ref);
  formdata.append('transkey', pin);

  console.log('[DATA_PIN] Step 2: FormData prepared, sending request to:', `${BaseUrl}purchase-datapin`);

  try {
    const t0 = Date.now();
    const response = await fetch(`${BaseUrl}purchase-datapin`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formdata,
    });
    
    console.log('[DATA_PIN] Step 3: Response received', {
      ref,
      ms: Date.now() - t0,
      httpOk: response?.ok,
      httpStatus: response?.status,
    });

    const data = await response.json();
    
    console.log('[DATA_PIN] Step 4: Response parsed', {
      ref,
      status: data?.status,
      message: data?.message,
      code: data?.code,
    });

    console.log('[DATA_PIN] Step 5: FULL RESPONSE DATA (for debugging):', JSON.stringify(data, null, 2));
    
    // Log the actual pins/tokens if they exist
    if (data?.response) {
      console.log('[DATA_PIN] Step 6: PIN/TOKEN DATA FOUND:', {
        ref,
        responseType: typeof data.response,
        isArray: Array.isArray(data.response),
        pinCount: Array.isArray(data.response) ? data.response.length : 'N/A',
        pins: data.response, // Full pin data for success screen
      });
    } else {
      console.log('[DATA_PIN] Step 6: No pin/token data in response');
    }

    console.log('========== DATA PIN PURCHASE END ==========\n');
    return data;
  } catch (error) {
    console.error('[DATA_PIN] ERROR occurred:', {
      ref,
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });
    console.log('========== DATA PIN PURCHASE END (ERROR) ==========\n');
    return error;
  }
};

export const GetAirtimePinPlans = async ({ token }) => {
  __debug('[AIRTIME_PIN] GetAirtimePinPlans request', {
    hasToken: __hasToken(token),
  });
  const res = await sendRequest({
    url: 'rechargecard-plans',
    token,
  });
  __debug('[AIRTIME_PIN] GetAirtimePinPlans response', {
    status: res?.status,
    message: res?.message,
    count: Array.isArray(res?.response) ? res.response.length : undefined,
    first: Array.isArray(res?.response) ? res.response[0] : undefined,
    raw: __redactForLogs(res),
  });
  return res;
};

export const GetAirtimePins = async ({ token }) => {
  return await sendRequest({
    url: 'rechargecard-tokens?pagenumber=1',
    token,
  });
};

export const PurchaseAirtimePin = async ({
  token,
  network,
  businessname,
  quantity,
  plan,
  ref,
  pin,
}) => {
  console.log('========== AIRTIME PIN PURCHASE START ==========');
  console.log('[AIRTIME_PIN] Step 1: Preparing request data', {
    ref,
    network,
    businessname,
    quantity,
    plan,
    hasToken: __hasToken(token),
    pin: __maskPin(pin),
  });

  const formdata = new FormData();
  formdata.append('network', network);
  formdata.append('amount', plan);
  formdata.append('quantity', quantity);
  formdata.append('businessname', businessname);
  formdata.append('transref', ref);
  formdata.append('transkey', pin);

  console.log('[AIRTIME_PIN] Step 2: FormData prepared, sending request to:', `${BaseUrl}purchase-rechargepin`);

  try {
    const t0 = Date.now();
    __debug('[AIRTIME_PIN] PurchaseAirtimePin request', {
      ref,
      network,
      businessname,
      quantity,
      plan,
      hasToken: __hasToken(token),
      pin: __maskPin(pin),
      endpoint: `${BaseUrl}purchase-rechargepin`,
    });

    const response = await fetch(`${BaseUrl}purchase-rechargepin`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formdata,
    });

    console.log('[AIRTIME_PIN] Step 3: Response received', {
      ref,
      ms: Date.now() - t0,
      httpOk: response?.ok,
      httpStatus: response?.status,
    });

    const data = await response.json();

    console.log('[AIRTIME_PIN] Step 4: Response parsed', {
      ref,
      status: data?.status,
      message: data?.message,
      code: data?.code,
    });

    console.log('[AIRTIME_PIN] Step 5: FULL RESPONSE DATA (for debugging):', JSON.stringify(data, null, 2));

    // Log the actual pins if they exist
    if (data?.response) {
      console.log('[AIRTIME_PIN] Step 6: PIN DATA FOUND:', {
        ref,
        responseType: typeof data.response,
        isArray: Array.isArray(data.response),
        pinCount: Array.isArray(data.response) ? data.response.length : 'N/A',
        pins: data.response, // Full pin data for success screen
      });
    } else {
      console.log('[AIRTIME_PIN] Step 6: No pin data in response');
    }

    __debug('[AIRTIME_PIN] PurchaseAirtimePin response', {
      ref,
      ms: Date.now() - t0,
      httpOk: response?.ok,
      httpStatus: response?.status,
      status: data?.status,
      message: data?.message,
      code: data?.code,
      response: __redactForLogs(data?.response),
      raw: __redactForLogs(data),
    });

    console.log('========== AIRTIME PIN PURCHASE END ==========\n');
    return data;
  } catch (error) {
    console.error('[AIRTIME_PIN] ERROR occurred:', {
      ref,
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });

    __debug('[AIRTIME_PIN] PurchaseAirtimePin error', {
      ref,
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      network,
      businessname,
      quantity,
      plan,
      hasToken: __hasToken(token),
      pin: __maskPin(pin),
    });

    console.log('========== AIRTIME PIN PURCHASE END (ERROR) ==========\n');
    return error;
  }
};

export const GetAlphaPlans = async ({ token }) => {
  return await sendRequest({
    url: 'alpha-plans',
    token,
  });
};

export const PurchaseAlpha = async ({ token, phone, ref, plan, pin }) => {
  const formdata = new FormData();
  formdata.append('alphaplan', plan);
  formdata.append('phone', phone);
  formdata.append('transref', ref);
  formdata.append('transkey', pin);

  try {
    const response = await fetch(`${BaseUrl}purchase-alpha`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formdata,
    });
    console.log(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const GetAirtimeSwapDetails = async ({ token }) => {
  return await sendRequest({
    url: 'airtime-cash-details',
    token,
  });
};

export const SendAirtimeSwapRequest = async ({
  token,
  network,
  amount,
  ref,
  pin,
  phone,
}) => {
  console.log({ token, network, amount, ref, pin, phone });
  const formdata = new FormData();
  formdata.append('airtimetocashnetwork', network);
  formdata.append('airtimetocashphone', phone);
  formdata.append('airtimetocashamount', amount);
  formdata.append('transref', ref);
  formdata.append('transkey', pin);

  try {
    const response = await fetch(`${BaseUrl}airtime-cash-request`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formdata,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};
export const GetSmilePlans = async ({ token }) => {
  return await sendRequest({
    url: 'smile-plans',
    token,
  });
};

export const PurchaseSmile = async ({
  token,
  phone,
  ref,
  plan,
  pin,
  accountType,
}) => {
  const formdata = new FormData();
  formdata.append('phone', phone);
  formdata.append('actype', accountType);
  formdata.append('dataplan', plan);
  formdata.append('transref', ref);
  formdata.append('transkey', pin);

  try {
    const response = await fetch(`${BaseUrl}purchase-smile`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formdata,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const GetTransactions = async ({
  token,
  keyword,
  service,
  date,
  page,
}) => {
  return await sendRequest({
    url: `transactions?pagenumber=${page || 1}`,
    token,
  });
};

export const GetTransactionDetails = async ({
  token,
  ref,
}) => {
  try {
    const t0 = Date.now();
    __apiDebug('[API] GetTransactionDetails request', {
      ref,
      hasToken: __hasToken(token),
      endpoint: `${BaseUrl}transaction-details?ref=${ref}`,
    });
    const response = await axios.get(
      `${BaseUrl}transaction-details?ref=${ref}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    __apiDebug('[API] GetTransactionDetails response', {
      ref,
      ms: Date.now() - t0,
      status: response?.data?.status,
      message: response?.data?.message,
      code: response?.data?.code,
      raw: __redactForLogs(response?.data),
    });
    return response.data;
  } catch (error) {
    __apiDebug('[API] GetTransactionDetails error', {
      ref,
      message: error?.message,
      name: error?.name,
      status: error?.response?.status,
      data: __redactForLogs(error?.response?.data),
    });
    throw error;
  }
};

export const GetCommissionList = async ({ token }) => {
  return await sendRequest({
    url: 'referral-bonus',
    token,
  });
};

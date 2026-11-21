import { BaseUrl } from './api';
import { logFeatures } from '../../utils/debugScopes';

const postForm = async ({ endpoint, fields, token, meta = {} }) => {
  const formdata = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formdata.append(key, String(value));
    }
  });

  logFeatures('Fx', `${endpoint} request`, {
    endpoint: `${BaseUrl}${endpoint}`,
    hasToken: Boolean(token),
    ...meta,
  });

  try {
    const t0 = Date.now();
    const response = await fetch(`${BaseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formdata,
    });
    const data = await response.json();
    logFeatures('Fx', `${endpoint} response`, {
      httpOk: response?.ok,
      httpStatus: response?.status,
      ms: Date.now() - t0,
      status: data?.status,
      message: data?.message || data?.msg,
      code: data?.code,
      quoteId: data?.response?.quote_id,
      rate: data?.response?.rate,
    });
    return data;
  } catch (error) {
    logFeatures('Fx', `${endpoint} error`, {
      message: error?.message,
      name: error?.name,
    });
    return error;
  }
};

export const GetFxRate = async ({ token, amount, from, to, ref }) =>
  postForm({
    endpoint: 'fx-rates',
    token,
    fields: { amount, from, to, ref },
    meta: { amount, from, to, ref },
  });

export const ConvertCurrency = async ({ token, quote_id, sig }) =>
  postForm({
    endpoint: 'convert-currency',
    token,
    fields: { quote_id, sig },
    meta: { quote_id },
  });

import { BaseUrl, sendRequest } from './api';
import { logFeatures } from '../../utils/debugScopes';

const postForm = async ({ endpoint, fields, token, scope, meta = {} }) => {
  const formdata = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formdata.append(key, String(value));
    }
  });

  logFeatures(scope, `${endpoint} request`, {
    endpoint: `${BaseUrl}${endpoint}`,
    hasToken: Boolean(token),
    fieldKeys: Object.keys(fields),
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
    logFeatures(scope, `${endpoint} response`, {
      httpOk: response?.ok,
      httpStatus: response?.status,
      ms: Date.now() - t0,
      status: data?.status,
      message: data?.message || data?.msg,
      code: data?.code,
      body: data,
    });
    return data;
  } catch (error) {
    logFeatures(scope, `${endpoint} error`, {
      message: error?.message,
      name: error?.name,
    });
    return error;
  }
};

export const GetVirtualCards = async ({ token }) => {
  logFeatures('VirtualCard', 'GetVirtualCards request', {
    hasToken: Boolean(token),
  });
  const response = await sendRequest({
    url: 'virtual-cards',
    token,
    useFeaturesApi: true,
  });
  logFeatures('VirtualCard', 'GetVirtualCards response', {
    status: response?.status,
    message: response?.message,
    cardCount: Array.isArray(response?.response?.cards)
      ? response.response.cards.length
      : 0,
  });
  return response;
};

export const CreateVirtualCard = async ({ token, amount, brand, ref }) =>
  postForm({
    endpoint: 'create-virtual-card',
    token,
    scope: 'VirtualCard',
    fields: { amount, brand, ref },
    meta: { amount, brand, ref },
  });

export const GetVirtualCardDetails = async ({ token, card_id }) =>
  postForm({
    endpoint: 'virtual-card-details',
    token,
    scope: 'VirtualCard',
    fields: { card_id },
    meta: { card_id },
  });

export const GetVirtualCardTransactions = async ({
  token,
  card_id,
  start_date,
  end_date,
  page = 1,
}) =>
  postForm({
    endpoint: 'virtual-card-transactions',
    token,
    scope: 'VirtualCard',
    fields: { card_id, start_date, end_date, page },
    meta: { card_id, start_date, end_date, page },
  });

export const TopupVirtualCard = async ({ token, card_id, amount, ref }) =>
  postForm({
    endpoint: 'topup-virtual-card',
    token,
    scope: 'VirtualCard',
    fields: { card_id, amount, ref },
    meta: { card_id, amount, ref },
  });

export const WithdrawVirtualCard = async ({ token, card_id, amount, ref }) =>
  postForm({
    endpoint: 'withdraw-virtual-card',
    token,
    scope: 'VirtualCard',
    fields: { card_id, amount, ref },
    meta: { card_id, amount, ref },
  });

export const FreezeVirtualCard = async ({ token, card_id, ref }) =>
  postForm({
    endpoint: 'freeze-virtual-card',
    token,
    scope: 'VirtualCard',
    fields: { card_id, ref },
    meta: { card_id, ref },
  });

export const UnfreezeVirtualCard = async ({ token, card_id, ref }) =>
  postForm({
    endpoint: 'unfreeze-virtual-card',
    token,
    scope: 'VirtualCard',
    fields: { card_id, ref },
    meta: { card_id, ref },
  });

export const TerminateVirtualCard = async ({ token, card_id, pin, ref }) =>
  postForm({
    endpoint: 'terminate-virtual-card',
    token,
    scope: 'VirtualCard',
    fields: { card_id, pin, ref },
    meta: { card_id, ref },
  });

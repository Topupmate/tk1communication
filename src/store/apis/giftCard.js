import { BaseUrl, sendRequest } from './api';
import { logFeatures } from '../../utils/debugScopes';

export const GetGiftCardPlans = async ({ token }) => {
  logFeatures('GiftCard', 'GetGiftCardPlans request', {
    hasToken: Boolean(token),
  });
  const response = await sendRequest({
    url: 'giftcard-plans',
    token,
    useFeaturesApi: true,
  });

  // API returns plans in `msg` (array) rather than `response`
  const plans = Array.isArray(response?.msg)
    ? response.msg
    : Array.isArray(response?.response)
      ? response.response
      : [];

  logFeatures('GiftCard', 'GetGiftCardPlans response', {
    status: response?.status,
    count: plans.length,
  });

  return { ...response, plans };
};

export const BuyGiftCard = async ({
  token,
  product,
  email,
  amount,
  sender,
  units,
  pin,
}) => {
  const formdata = new FormData();
  formdata.append('product', String(product));
  formdata.append('email', String(email));
  formdata.append('amount', String(amount));
  formdata.append('sender', String(sender));
  formdata.append('units', String(units));
  formdata.append('transkey', String(pin));

  logFeatures('GiftCard', 'BuyGiftCard request', {
    product,
    email,
    amount,
    sender,
    units,
    hasToken: Boolean(token),
  });

  try {
    const t0 = Date.now();
    const response = await fetch(`${BaseUrl}buy-giftcard`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formdata,
    });
    const data = await response.json();
    logFeatures('GiftCard', 'BuyGiftCard response', {
      httpOk: response?.ok,
      httpStatus: response?.status,
      ms: Date.now() - t0,
      status: data?.status,
      message: data?.message || data?.msg,
    });
    return data;
  } catch (error) {
    logFeatures('GiftCard', 'BuyGiftCard error', {
      message: error?.message,
    });
    return error;
  }
};

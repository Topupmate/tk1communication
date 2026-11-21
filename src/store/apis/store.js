import { BaseUrl, sendRequest } from './api';
import { logFeatures } from '../../utils/debugScopes';

const withQuery = (path, params = {}) => {
  const qs = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');
  return qs ? `${path}?${qs}` : path;
};

export const GetStoreDetails = async ({ token }) => {
  logFeatures('Store', 'GetStoreDetails request', { hasToken: Boolean(token) });
  const response = await sendRequest({
    url: 'store-details',
    token,
    useFeaturesApi: true,
  });
  logFeatures('Store', 'GetStoreDetails response', {
    status: response?.status,
    storeName: response?.response?.settings?.store_name,
    feeCount: Array.isArray(response?.response?.deliveryFees)
      ? response.response.deliveryFees.length
      : 0,
  });
  return response;
};

export const GetStoreCategories = async ({ token }) => {
  logFeatures('Store', 'GetStoreCategories request', {
    hasToken: Boolean(token),
  });
  const response = await sendRequest({
    url: 'store-categories',
    token,
    useFeaturesApi: true,
  });
  logFeatures('Store', 'GetStoreCategories response', {
    status: response?.status,
    count: Array.isArray(response?.response) ? response.response.length : 0,
  });
  return response;
};

export const GetStoreProducts = async ({
  token,
  offset = 0,
  category,
  search,
}) => {
  const url = withQuery('store-products', { offset, category, search });
  logFeatures('Store', 'GetStoreProducts request', {
    offset,
    category,
    search,
    hasToken: Boolean(token),
  });
  const response = await sendRequest({
    url,
    token,
    useFeaturesApi: true,
  });
  logFeatures('Store', 'GetStoreProducts response', {
    status: response?.status,
    count: Array.isArray(response?.response?.products)
      ? response.response.products.length
      : 0,
    total: response?.response?.total,
    offset: response?.response?.offset,
  });
  return response;
};

export const GetStoreOrders = async ({ token }) => {
  logFeatures('Store', 'GetStoreOrders request', { hasToken: Boolean(token) });
  const response = await sendRequest({
    url: 'store-orders',
    token,
    useFeaturesApi: true,
  });
  logFeatures('Store', 'GetStoreOrders response', {
    status: response?.status,
    count: Array.isArray(response?.response) ? response.response.length : 0,
  });
  return response;
};

export const GetStoreOrderStatus = async ({ token, ref }) => {
  const url = withQuery('store-order-status', { ref });
  logFeatures('Store', 'GetStoreOrderStatus request', {
    ref,
    hasToken: Boolean(token),
  });
  const response = await sendRequest({
    url,
    token,
    useFeaturesApi: true,
  });
  logFeatures('Store', 'GetStoreOrderStatus response', {
    status: response?.status,
    orderId: response?.response?.order_id,
    deliveryStatus: response?.response?.delivery_status,
  });
  return response;
};

export const PlaceStoreOrder = async ({
  token,
  product_id,
  quantity,
  customer_name,
  customer_phone,
  delivery_address,
  destination_state,
  delivery_notes,
  pin,
}) => {
  // Android drops urlencoded string bodies, so PHP sees an empty $_POST and
  // answers "Only POST method is allowed". Multipart matches other purchases.
  const formData = new FormData();
  const fields = {
    product_id,
    quantity,
    customer_name,
    customer_phone,
    delivery_address,
    destination_state,
    transkey: pin,
  };
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value) !== '') {
      formData.append(key, String(value));
    }
  });
  if (delivery_notes) {
    formData.append('delivery_notes', String(delivery_notes));
  }

  logFeatures('Store', 'PlaceStoreOrder request', {
    product_id,
    quantity,
    destination_state,
    hasToken: Boolean(token),
    hasTranskey: Boolean(pin),
    contentType: 'multipart/form-data',
  });

  try {
    const t0 = Date.now();
    const response = await fetch(`${BaseUrl}store-place-order`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: formData,
    });
    const data = await response.json();
    logFeatures('Store', 'PlaceStoreOrder response', {
      httpOk: response?.ok,
      httpStatus: response?.status,
      ms: Date.now() - t0,
      status: data?.status,
      message: data?.message || data?.msg,
      detail: data?.response?.msg || data?.response,
      ref: data?.response?.ref,
    });
    return data;
  } catch (error) {
    logFeatures('Store', 'PlaceStoreOrder error', { message: error?.message });
    return error;
  }
};

import { BaseUrl } from '../store/apis/api';

export const STORE_PAGE_LIMIT = 12;

export const resolveStoreAsset = (path) => {
  if (!path || typeof path !== 'string') return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const root = BaseUrl.replace(/apiserver\/?$/, '');
  const match = trimmed.match(/assets_upload\/.+$/);
  const cleaned = (match ? match[0] : trimmed.replace(/^(\.{2}\/)+/, '').replace(/^\/+/, ''))
    .replace(/\/{2,}/g, '/');
  return `${root}${cleaned}`;
};

export const productImageUris = (product) =>
  [product?.p_image, product?.image_url_2, product?.image_url_3]
    .map(resolveStoreAsset)
    .filter(Boolean);

export const getDeliveryFeeForState = (fees, stateName) => {
  const found = (fees || []).find(
    (item) =>
      String(item?.state_name || '').toLowerCase() ===
      String(stateName || '').toLowerCase()
  );
  return found ? parseFloat(found.fee) : 0;
};

export const whatsappUrl = (contact) => {
  if (!contact) return null;
  const digits = String(contact).replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}`;
};

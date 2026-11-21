import { GenerateRandomNumber } from './GenerateRandomNumber';

export const CURRENCY_SYMBOLS = {
  NGN: '₦',
  USD: '$',
};

export const generateFxRef = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = `${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear()}`;
  return `FX_${stamp}${GenerateRandomNumber()}`;
};

// The backend reports expiry as a human string such as "60 seconds".
export const parseExpirySeconds = (expire, fallback = 60) => {
  const seconds = parseInt(String(expire ?? '').replace(/[^0-9]/g, ''), 10);
  return Number.isNaN(seconds) || seconds <= 0 ? fallback : seconds;
};

export const normalizeFxQuote = (response) => {
  const payload = response?.response || {};
  if (!payload?.quote_id || !payload?.sig) return null;

  return {
    quoteId: String(payload.quote_id),
    sig: payload.sig,
    from: payload.from,
    to: payload.to,
    rate: parseFloat(payload.rate),
    amountFrom: parseFloat(payload.amount_from),
    amountTo: parseFloat(payload.amount_to),
    expiresIn: parseExpirySeconds(payload.expire),
  };
};

export const formatFxAmount = (value, currency) => {
  const n = parseFloat(value);
  const symbol = CURRENCY_SYMBOLS[currency] || '';
  if (Number.isNaN(n)) return `${symbol}0`;
  const decimals = currency === 'USD' ? 2 : 2;
  return `${symbol}${n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

// The profile payload has used different keys for the dollar wallet across
// backend versions, so probe the known aliases before giving up.
// Listed lowercase and matched case-insensitively, since the live profile
// payload uses camelCase (`sDollarWallet`) while older versions did not.
// `sDollarDueWallet` is deliberately excluded: it is money owed, not available.
const USD_BALANCE_KEYS = [
  'sdollarwallet',
  'usdwallet',
  'usd_wallet',
  'usdbalance',
  'usd_balance',
  'walletusd',
  'wallet_usd',
  'dollarwallet',
  'dollar_wallet',
  'usd',
];

export const getUsdBalance = (user) => {
  if (!user) return null;

  const byLowerKey = new Map(
    Object.keys(user).map((key) => [key.toLowerCase(), key]),
  );

  for (const alias of USD_BALANCE_KEYS) {
    const actualKey = byLowerKey.get(alias);
    if (actualKey === undefined) continue;
    const value = user[actualKey];
    if (value === undefined || value === null || value === '') continue;
    const n = parseFloat(value);
    if (!Number.isNaN(n)) return n;
  }
  return null;
};

export const getNgnBalance = (user) => {
  const n = parseFloat(user?.wallet);
  return Number.isNaN(n) ? 0 : n;
};

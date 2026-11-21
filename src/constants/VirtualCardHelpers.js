export const normalizeVirtualCardsResponse = (response) => {
  const payload = response?.response || {};
  return {
    cards: Array.isArray(payload.cards) ? payload.cards : [],
    fees: payload.fees || {},
  };
};

// The list endpoint returns camelCase (cardBrand, cardMasked...) while the
// details endpoint is documented as snake_case, so accept both. Sources are
// read in order, first usable value wins.
export const normalizeVirtualCard = (...sources) => {
  const pickWhere = (isValid, ...keys) => {
    for (const source of sources) {
      if (!source) continue;
      for (const key of keys) {
        const value = source[key];
        if (value === undefined || value === null || value === '') continue;
        if (isValid && !isValid(value)) continue;
        return value;
      }
    }
    return undefined;
  };

  const pick = (...keys) => pickWhere(null, ...keys);

  // The details payload reuses `status`/`card_status` for the request outcome
  // ("success"), so skip those and fall back to the real state ("Active").
  const isCardState = (value) =>
    !['success', 'fail', 'failed'].includes(String(value).toLowerCase());

  return {
    cardId: pick('cardId', 'card_id', 'id'),
    brand: pick('cardBrand', 'brand'),
    holder: pick('cardCustomerName', 'name', 'cardholder'),
    number: pick('cardNumber', 'card_number', 'number'),
    masked: pick('cardMasked', 'masked', 'card_masked'),
    last4: pick('cardLast4', 'last4', 'last_four'),
    expiry: pick('cardExpiry', 'expiry', 'expiration'),
    cvv: pick('cardCvv', 'cvv'),
    status: pickWhere(isCardState, 'cardStatus', 'card_status', 'status'),
    balance: pick(
      'balance',
      'cardBalance',
      'card_balance',
      'availableBalance',
      'available_balance',
    ),
    createdAt: pick('createdAt', 'created_at'),
    billing: pick('billing', 'billingAddress', 'billing_address'),
  };
};

// The details endpoint can answer with a bare {status, msg} envelope when the
// upstream lookup fails, which must not be mistaken for card data.
export const hasCardFields = (payload) =>
  Boolean(
    payload &&
      (payload.cardId ||
        payload.card_id ||
        payload.cardNumber ||
        payload.card_number ||
        payload.balance !== undefined),
  );

// StroWallet answers "Insufficient balance fund your USD wallet with N USD"
// when the platform's own provider wallet is empty, and the backend forwards
// that string verbatim. A user who holds enough USD reads it as an accusation,
// so only pass the raw message through when their balance really is short.
export const getCardFundingErrorMessage = ({
  response,
  amount,
  usdBalance,
  fallback,
}) => {
  const message = response?.message || response?.msg || fallback;
  const userCanAfford =
    typeof usdBalance === 'number' &&
    Number.isFinite(amount) &&
    usdBalance >= amount;

  if (userCanAfford && /insufficient/i.test(String(message))) {
    return 'Card funding is temporarily unavailable. Please try again later.';
  }
  return message;
};

export const isServiceOn = (fees) =>
  String(fees?.serviceStatus || '').toLowerCase() === 'on';

export const normalizeCardStatus = (status) =>
  String(status || '')
    .trim()
    .toLowerCase();

export const isTerminated = (status) =>
  normalizeCardStatus(status).includes('terminat');

export const isFrozen = (status) =>
  normalizeCardStatus(status).includes('freeze') ||
  normalizeCardStatus(status).includes('frozen') ||
  normalizeCardStatus(status) === 'inactive';

export const isActive = (status) => {
  const s = normalizeCardStatus(status);
  if (!s) return true;
  return !isTerminated(status) && !isFrozen(status);
};

export const getCardDisplayStatus = (status) => {
  if (isTerminated(status)) return 'Terminated';
  if (isFrozen(status)) return 'Frozen';
  if (isActive(status)) return 'Active';
  return status || 'Unknown';
};

export const getStatusColor = (status, theme) => {
  if (isTerminated(status)) return theme.palette.red;
  if (isFrozen(status)) return '#c47d00';
  return theme.palette.primary;
};

export const groupCardNumber = (number) =>
  String(number || '')
    .replace(/\s+/g, '')
    .replace(/(.{4})/g, '$1  ')
    .trim();

export const formatUsd = (value) => {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return String(value ?? '0');
  return n.toFixed(2);
};

export const extractCardTransactions = (response) => {
  const outer = response?.response?.transactions;
  if (Array.isArray(outer?.transactions)) return outer.transactions;
  if (Array.isArray(outer)) return outer;
  if (Array.isArray(response?.response)) return response.response;
  return [];
};

export const defaultTxnDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 90);
  const toYmd = (d) => d.toISOString().slice(0, 10);
  return { start_date: toYmd(start), end_date: toYmd(end) };
};

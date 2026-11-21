const PRECOMPUTED_SERVICES = new Set(['data', 'cable']);

const toNumber = (value) => {
  if (value == null || value === '') return null;
  const parsed = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

// Data and cable already include a naira cashback when it is not 0.
// Other services use cashbackRate and cashbackType against the amount.
export function resolveCashback({ service, amount, plan, settings }) {
  const source = plan || {};
  const precomputed = toNumber(source.cashback);

  if (PRECOMPUTED_SERVICES.has(service)) {
    return precomputed && precomputed !== 0 ? precomputed : null;
  }

  const rate = toNumber(source.cashbackRate ?? settings?.cashbackRate);
  const type = String(
    source.cashbackType || settings?.cashbackType || ''
  ).toLowerCase();
  const spend = toNumber(amount);

  if (rate != null && rate !== 0) {
    if (type === 'per') {
      if (spend == null || spend <= 0) return null;
      return (rate * spend) / 100;
    }
    return rate;
  }

  const fallback = precomputed ?? toNumber(settings?.cashback);
  return fallback && fallback !== 0 ? fallback : null;
}

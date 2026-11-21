// Toggle runtime logs from the RN dev console:
// - Enable:  global.__DEBUG_BUY_DATA__ = true
// - Disable: global.__DEBUG_BUY_DATA__ = false
//
// This keeps detailed debugging logs off by default.

const __getGlobal = () => {
  // RN has `global`; modern JS has `globalThis`.
  // Prefer globalThis when available.
  // eslint-disable-next-line no-undef
  if (typeof globalThis !== 'undefined') return globalThis;
  // eslint-disable-next-line no-undef
  if (typeof global !== 'undefined') return global;
  return {};
};

const __flagName = (scope) => `__DEBUG_${String(scope).toUpperCase()}__`;

export const isDebugScopeEnabled = (scope) => {
  const g = __getGlobal();
  const key = __flagName(scope);
  return Boolean(g?.[key] === true);
};

export const createScopedDebugger = (scope) => {
  return (...args) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__ && isDebugScopeEnabled(scope)) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  };
};

const __redact = (value) => {
  if (value == null) return value;
  const s = String(value);
  if (s.length <= 4) return '*'.repeat(s.length);
  return `${s.slice(0, 2)}${'*'.repeat(Math.max(0, s.length - 4))}${s.slice(-2)}`;
};

/** Always-on dev logs for password reset debugging. */
export const logPasswordReset = (step, payload) => {
  if (typeof __DEV__ === 'undefined' || !__DEV__) return;

  const safePayload =
    payload && typeof payload === 'object'
      ? Object.fromEntries(
          Object.entries(payload).map(([key, value]) => {
            const k = key.toLowerCase();
            if (k === 'password' || k === 'otp' || k === 'code') {
              return [key, __redact(value)];
            }
            return [key, value];
          }),
        )
      : payload;

  // eslint-disable-next-line no-console
  console.log(`[PasswordReset] ${step}`, safePayload ?? '');
};

const __FEATURES_SENSITIVE_KEYS = new Set([
  'pin',
  'transkey',
  'token',
  'password',
  'otp',
  'authorization',
]);

const __redactFeatures = (value) => {
  if (value == null) return value;
  const s = String(value);
  if (s.length <= 4) return '*'.repeat(s.length);
  return `${s.slice(0, 2)}${'*'.repeat(Math.max(0, s.length - 4))}${s.slice(-2)}`;
};

const __sanitizeFeaturesPayload = (payload) => {
  if (payload == null) return payload;
  if (Array.isArray(payload)) return payload.map(__sanitizeFeaturesPayload);
  if (typeof payload !== 'object') return payload;

  const out = {};
  for (const [key, value] of Object.entries(payload)) {
    if (__FEATURES_SENSITIVE_KEYS.has(String(key).toLowerCase())) {
      out[key] = __redactFeatures(value);
    } else {
      out[key] = __sanitizeFeaturesPayload(value);
    }
  }
  return out;
};

/** Always-on dev logs for Blog + Bulk SMS debugging. */
export const logFeatures = (feature, step, payload) => {
  if (typeof __DEV__ === 'undefined' || !__DEV__) return;

  // eslint-disable-next-line no-console
  console.log(
    `[Features:${feature}] ${step}`,
    payload != null ? __sanitizeFeaturesPayload(payload) : '',
  );
};


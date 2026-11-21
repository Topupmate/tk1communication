export function isFeatureOn(features, key) {
  if (!key) return true;
  if (!features) return true;
  return String(features[key] ?? '').toLowerCase() === 'on';
}

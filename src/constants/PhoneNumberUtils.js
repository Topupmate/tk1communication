/**
 * App-wide phone number normalization.
 * Strips non-digits (except +), converts +234/234 to leading 0 for Nigerian numbers.
 */
export function normalizePhoneNumber(input) {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();
  if (!trimmed) return '';
  const digits = trimmed.replace(/[^\d+]/g, '');
  if (digits.startsWith('+234')) {
    return '0' + digits.slice(4);
  }
  if (digits.startsWith('234') && digits.length >= 13) {
    return '0' + digits.slice(3);
  }
  if (digits.startsWith('0')) {
    return digits;
  }
  if (digits.length === 10 && !digits.startsWith('+')) {
    return '0' + digits;
  }
  return digits;
}

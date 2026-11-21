import { Platform } from 'react-native';

/**
 * Normalize phone number to Nigerian-style format (leading 0, digits only).
 * +234 801... → 0801...; 234... → 0...; 10 digits → 0 + digits.
 */
function normalizeMsisdn(input) {
  if (!input) return '';
  const digits = String(input).replace(/\D/g, '');
  if (digits.startsWith('234')) {
    return '0' + digits.slice(3); // +234 801... → 0801...
  }
  if (digits.startsWith('0')) {
    return digits;
  }
  if (digits.length === 10) {
    return '0' + digits; // 801... → 0801...
  }
  return digits;
}

/**
 * Extract phone number from react-native-contact-picker result.
 * Result shape: { phoneNumbers: [{ stringValue, digits }], fullName }.
 */
function getNumberFromNativeModule(result) {
  const first = result?.phoneNumbers?.[0];
  const raw = first?.stringValue ?? first?.digits ?? result?.selectedPhone?.number ?? result?.phoneNumber ?? result?.number;
  if (raw) return normalizeMsisdn(raw);
  if (Array.isArray(result?.phoneNumbers) && result.phoneNumbers[0]) {
    const p = result.phoneNumbers[0];
    return normalizeMsisdn(p.number ?? p.stringValue ?? p.digits);
  }
  return null;
}

/**
 * Extract name from react-native-contact-picker result.
 */
function getNameFromNativeModule(result) {
  return result?.fullName ?? result?.contact?.name ?? result?.name ?? result?.displayName ?? null;
}

/**
 * Open the device's native contact picker and return the first phone number (and optional name).
 * Tries react-native-contact-picker first, then falls back to expo-contacts.
 * Returns { number, name } or null (web, no module, permission denied, user cancelled, or no number).
 */
export async function pickNativeContactPhone() {
  if (Platform.OS === 'web') {
    return null;
  }

  // 1) Try react-native-contact-picker (e.g. pickContact)
  try {
    const ContactPicker = require('react-native-contact-picker');
    if (ContactPicker && typeof ContactPicker.pickContact === 'function') {
      const result = await ContactPicker.pickContact({});
      const number = getNumberFromNativeModule(result);
      if (number) {
        return { number, name: getNameFromNativeModule(result) ?? undefined };
      }
      return null;
    }
  } catch (e) {
    // Module not available or rejected (e.g. user cancel) – fall through to Expo
  }

  // 2) Fallback: Expo Contacts
  try {
    const Contacts = require('expo-contacts');
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }
    const contact = await Contacts.presentContactPickerAsync();
    if (!contact) return null;
    const rawNumber = contact?.phoneNumbers?.[0]?.number ?? contact?.phoneNumbers?.[0]?.digits;
    if (!rawNumber) return null;
    const number = normalizeMsisdn(rawNumber);
    const name = contact.name ?? ([contact.firstName, contact.lastName].filter(Boolean).join(' ') || undefined);
    return { number, name };
  } catch (err) {
    return null;
  }
}

// The backend doesn't have a confirmed field name yet for the per-unit bulk
// SMS fee, so we probe the common variants that show up in /site-details
// style responses and gracefully fall back if none are present.
import { logFeatures } from '../utils/debugScopes';

export const MIN_BULK_SMS_RECIPIENTS = 2;

const FEE_FIELD_CANDIDATES = [
  'smsfee',
  'bulksmsfee',
  'sms_fee',
  'bulk_sms_fee',
  'smsrate',
  'sms_rate',
  'bulksmsrate',
];

export const getBulkSmsFee = (siteSettings) => {
  if (!siteSettings) {
    logFeatures('BulkSms', 'getBulkSmsFee', { fee: null, reason: 'no siteSettings' });
    return null;
  }

  for (const key of FEE_FIELD_CANDIDATES) {
    const value = siteSettings?.[key];
    if (value !== undefined && value !== null && value !== '') {
      const parsed = parseFloat(value);
      if (!Number.isNaN(parsed)) {
        logFeatures('BulkSms', 'getBulkSmsFee', { fee: parsed, field: key });
        return parsed;
      }
    }
  }

  logFeatures('BulkSms', 'getBulkSmsFee', {
    fee: null,
    reason: 'no matching fee field',
    checkedFields: FEE_FIELD_CANDIDATES,
  });
  return null;
};

export const getSmsPageCount = (message = '') => {
  const length = message?.length || 0;
  if (length === 0) return 0;
  return Math.ceil(length / 160);
};

export const getPhoneNumberList = (phoneNumbers = '') => {
  return phoneNumbers
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);
};

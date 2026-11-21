import { sendRequest } from './api';
import { logFeatures } from '../../utils/debugScopes';

export const GetFeatureAccess = async ({ token }) => {
  logFeatures('Features', 'GetFeatureAccess request', {
    hasToken: Boolean(token),
  });
  const response = await sendRequest({
    url: 'feature-access',
    token,
    useFeaturesApi: true,
  });
  logFeatures('Features', 'GetFeatureAccess response', {
    status: response?.status,
    message: response?.message,
  });
  return response;
};

// The docs title this GET Cashback and omit the path. It sits with
// feature-access and referral-settings, so the path follows that name.
export const GetCashback = async ({ token }) => {
  logFeatures('Features', 'GetCashback request', {
    hasToken: Boolean(token),
  });
  const response = await sendRequest({
    url: 'cashback',
    token,
    useFeaturesApi: true,
  });
  logFeatures('Features', 'GetCashback response', {
    status: response?.status,
    message: response?.message,
    cashback: response?.response?.cashback,
    cashbackRate: response?.response?.cashbackRate,
    cashbackType: response?.response?.cashbackType,
  });
  return response;
};

export const GetReferralSettings = async ({ token }) => {
  logFeatures('Features', 'GetReferralSettings request', {
    hasToken: Boolean(token),
  });
  const response = await sendRequest({
    url: 'referral-settings',
    token,
    useFeaturesApi: true,
  });
  logFeatures('Features', 'GetReferralSettings response', {
    status: response?.status,
    message: response?.message,
    totalReferral: response?.response?.totalReferral,
    referralCount: Array.isArray(response?.response?.referralList)
      ? response.response.referralList.length
      : 0,
  });
  return response;
};

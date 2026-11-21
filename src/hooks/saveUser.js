import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { StoreData } from '../constants/storage';
import { GetUserDetails } from '../store/apis/user';
import { loginUser } from '../store/globalState';
import { logFeatures } from '../utils/debugScopes';
import { getUsdBalance } from '../constants/FxHelpers';

const useSaveUser = () => {
  const { token } = useSelector((state) => state.globalState);
  const dispatch = useDispatch();

  const getUserInfo = async () => {
    const response = await GetUserDetails({ token });

    if (response?.status !== 'success') {
      logFeatures('UserRefresh', 'getUserInfo failed, keeping stale user', {
        isError: response instanceof Error,
        status: response?.status,
        message: response?.message,
      });
      return;
    }

    const newUser = {
      token,
      data: response?.response,
    };

    await StoreData('user', newUser);
    dispatch(loginUser(newUser));

    const profile = response?.response || {};
    logFeatures('UserRefresh', 'getUserInfo succeeded, user updated', {
      kycstatus: profile?.kycstatus,
      wallet: profile?.wallet,
      refwallet: profile?.refwallet,
      resolvedUsdBalance: getUsdBalance(profile),
      // Surfaces the real key names and values so we can tell which ledger the
      // backend debits, and whether a "due" balance eats into the spendable one.
      walletFields: Object.keys(profile)
        .filter((key) => /wallet|usd|dollar|bal/i.test(key))
        .reduce((acc, key) => ({ ...acc, [key]: profile[key] }), {}),
    });
  };

  return { getUserInfo };
};

export default useSaveUser;

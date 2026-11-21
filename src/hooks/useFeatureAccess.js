import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { GetCashback, GetFeatureAccess } from '../store/apis/features';
import { setCashbackSettings, setFeatures } from '../store/globalState';

export async function loadFeatureAccess(token, dispatch) {
  if (!token) return;
  const response = await GetFeatureAccess({ token });
  if (response?.status === 'success' && response.response) {
    dispatch(setFeatures(response.response));
  }
}

export async function loadCashbackSettings(token, dispatch) {
  if (!token) return;
  const response = await GetCashback({ token });
  if (response?.status === 'success' && response.response) {
    dispatch(setCashbackSettings(response.response));
    return;
  }
  dispatch(setCashbackSettings({}));
}

export function useFeatureAccess() {
  const dispatch = useDispatch();
  const { token, features } = useSelector((state) => state.globalState);

  useEffect(() => {
    if (!token || features) return;
    loadFeatureAccess(token, dispatch);
  }, [token, features, dispatch]);

  return features;
}

export function useCashbackSettings() {
  const dispatch = useDispatch();
  const { token, features, cashbackSettings } = useSelector(
    (state) => state.globalState
  );

  useEffect(() => {
    if (!token || cashbackSettings) return;
    if (features && String(features.cashback).toLowerCase() !== 'on') return;
    loadCashbackSettings(token, dispatch);
  }, [token, features, cashbackSettings, dispatch]);

  return cashbackSettings;
}

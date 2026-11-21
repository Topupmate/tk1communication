import React from 'react';
import { useSelector } from 'react-redux';

import Title from './Title';
import { Theme } from '../../constants/Theme';
import formatMoney from '../../constants/FormatNumber';
import { resolveCashback } from '../../constants/Cashback';
import { isFeatureOn } from '../../constants/FeatureAccess';
import { useCashbackSettings } from '../../hooks/useFeatureAccess';

const theme = Theme();

export default function CashbackHint({ service, amount, plan, style }) {
  const features = useSelector((state) => state.globalState.features);
  const settings = useCashbackSettings();

  if (!isFeatureOn(features, 'cashback')) return null;

  const value = resolveCashback({ service, amount, plan, settings });
  if (value == null) return null;

  return (
    <Title
      text={`Cashback: ₦${formatMoney(value)}`}
      small
      position="left"
      color={theme.palette.primary}
      style={[{ marginTop: 6, marginBottom: 4 }, style]}
    />
  );
}

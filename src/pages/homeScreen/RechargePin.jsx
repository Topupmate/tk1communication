import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import NetworkSection from '../../components/buyAirtime/NetworkSection';
import MyButton from '../../components/global/Mybutton';
import Dropdown from '../../components/global/Dropdown';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import { Theme } from '../../constants/Theme';
import {
  GetAirtimePinPlans,
  PurchaseAirtimePin,
} from '../../store/apis/services';
import MyInput from '../../components/global/MyInput';
import CashbackHint from '../../components/global/CashbackHint';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { StackActions, useNavigation } from '@react-navigation/native';
import PinNetworkSection from '../../components/airtimeAndDataPin/PinNetworkSection';
import Title from '../../components/global/Title';

const theme = Theme();

const __debug = (...args) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};

export default function RechargePinPage() {
  const [network, setNetwork] = useState(0);
  const [amount, setAmount] = useState('');
  const { token, user } = useSelector((state) => state.globalState);
  const [plans, setPlans] = useState([]);
  const [customPlan, setCustomPlan] = useState(``);
  const [quantity, setQuantity] = useState('');
  const [businessName, setBusinessName] = useState('');
  const navigation = useNavigation();
  const [plansLoading, setPlansLoading] = useState(false);
  const [uiError, setUiError] = useState('');

  const getPlans = async () => {
    const t0 = Date.now();
    __debug('[AIRTIME_PIN][UI] Fetch plans start', {
      hasToken: Boolean(token),
      accountType: user?.account_type,
      screen: 'RechargePinPage',
    });
    setPlansLoading(true);
    setUiError('');
    const response = await GetAirtimePinPlans({ token });
    __debug('[AIRTIME_PIN][UI] Fetch plans end', {
      ms: Date.now() - t0,
      status: response?.status,
      message: response?.message,
      count: Array.isArray(response?.response) ? response.response.length : undefined,
      raw: response,
    });

    if (response.status !== 'success') {
      setPlansLoading(false);
      setUiError(response?.message || 'Unable to load plans. Please try again.');
      return;
    }

    setPlans(response.response);
    setPlansLoading(false);
  };

  useEffect(() => {
    __debug('[AIRTIME_PIN][UI] Screen mounted', {
      hasToken: Boolean(token),
      accountType: user?.account_type,
    });
    getPlans();
  }, []);

  useEffect(() => {
    __debug('[AIRTIME_PIN][UI] Recomputing plan dropdown', {
      network,
      plansCount: Array.isArray(plans) ? plans.length : undefined,
      accountType: user?.account_type,
    });
    const filteredPlans = plans.filter(
      (plan) => plan?.aNetwork.toString() === network.toString()
    );

    const customP = filteredPlans.map((plan) => {
      const role = user?.account_type;
      let price;

      switch (role) {
        case 'user':
          price = plan?.aUserPrice;
          break;
        case 'agent':
          price = plan?.aAgentPrice;
          break;
        case 'vendor':
          price = plan?.aVendorPrice;
          break;
        case 'dealer':
          price = plan?.aDealerPrice;
          break;
        default:
          price = plan?.aUserPrice;
      }

      return `Size: ${plan?.planSize} - Price: ₦${price}`;
    });

    setCustomPlan(customP);
  }, [network, plans]);

  const hasPlans = Array.isArray(plans) && plans.length > 0;
  const canContinue =
    !plansLoading &&
    network !== 0 &&
    Boolean(amount && String(amount).trim()) &&
    Boolean(quantity && String(quantity).trim()) &&
    Boolean(businessName && String(businessName).trim());

  const handlePurchase = async () => {
    const attemptId = `AIRTIME_PIN_${Date.now()}`;
    __debug('[AIRTIME_PIN][UI] Continue pressed', {
      attemptId,
      network,
      amountSelection: amount,
      quantity,
      businessName,
    });
    if (!amount || !quantity || !businessName || network === 0) {
      __debug('[AIRTIME_PIN][UI] Missing fields', {
        attemptId,
        hasAmount: Boolean(amount),
        hasQuantity: Boolean(quantity),
        hasBusinessName: Boolean(businessName),
        network,
      });
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'All fields are required',
        button: 'close',
      });
      return;
    }

    const plan = plans
      .filter((item) => item.planSize === amount.split(' ')[1])
      .find((item) => {
        if (item?.aNetwork.toString() === network.toString()) {
          return item;
        }
      });

    __debug('[AIRTIME_PIN][UI] Resolved plan', {
      attemptId,
      selectedSize: amount?.split?.(' ')?.[1],
      network,
      planId: plan?.aId,
      planSize: plan?.planSize,
      rawPlan: plan,
    });

    if (!plan?.aId) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Plan not found',
        textBody: 'Please re-select a plan and try again.',
        button: 'close',
      });
      return;
    }

    navigation.navigate('airtime pin model', {
      network,
      businessname: businessName,
      quantity,
      plan: plan,
    });
    __debug('[AIRTIME_PIN][UI] Navigated to airtime pin model', { attemptId });
    return;
    setLoading(true);
    const response = await PurchaseAirtimePin({
      token,
      network,
      businessname: businessName,
      quantity,
      plan: plan?.nId,
    });

    setLoading(false);
    if (response.status !== 'success') {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Payment Fail',
        textBody: response.message,
        button: 'close',
      });
      return;
    }

    navigation.dispatch(StackActions.popToTop());
    navigation.navigate('airtimeReceipt', {
      data: response.response,
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SecondaryHeader text="Airtime Pin" />

        <View style={styles.card}>
          <Title text="Purchase details" bold />
          <Title
            text="Choose network, plan size, quantity and business name."
            small
            style={{ marginTop: 4, opacity: 0.75 }}
          />

          <View style={{ marginTop: 12 }} />

          <PinNetworkSection
            active={network}
            setActive={(n) => {
              __debug('[AIRTIME_PIN][UI] Network changed', { from: network, to: n });
              setNetwork(n);
              setAmount('');
            }}
          />

          {plansLoading && (
            <View style={styles.infoBox}>
              <Title text="Loading plans..." small />
            </View>
          )}

          {!!uiError && (
            <View style={styles.errorBox}>
              <Title text={uiError} small color={theme.palette.red} />
              <MyButton
                text="Retry"
                onPress={getPlans}
                background={theme.palette.gray}
                style={{ marginTop: 8, height: 44 }}
              />
            </View>
          )}

          {network !== 0 && (
            <Dropdown
              text={amount ? amount : hasPlans ? 'Select Plan' : 'No plans available'}
              data={customPlan}
              onSelectItem={(v) => {
                __debug('[AIRTIME_PIN][UI] Plan selected', { value: v });
                setAmount(v);
              }}
            />
          )}

          <MyInput
            text="Quantity"
            icon="wallet"
            value={quantity}
            onChangeText={(t) => {
              __debug('[AIRTIME_PIN][UI] Quantity changed', { value: t });
              setQuantity(t);
            }}
            type={'number-pad'}
          />
          <CashbackHint
            service="rechargecard"
            amount={(() => {
              const match = String(amount).match(/₦\s*([0-9.]+)/);
              const unit = match ? parseFloat(match[1]) : null;
              const qty = parseInt(quantity, 10);
              if (!Number.isFinite(unit)) return null;
              return unit * (Number.isFinite(qty) && qty > 0 ? qty : 1);
            })()}
          />
          <MyInput
            text="Business Name"
            icon="briefcase"
            value={businessName}
            onChangeText={(t) => {
              __debug('[AIRTIME_PIN][UI] Business name changed', {
                length: t?.length,
              });
              setBusinessName(t);
            }}
          />

          <MyButton
            text={canContinue ? 'Continue' : 'Fill all fields to continue'}
            onPress={canContinue ? handlePurchase : undefined}
            background={canContinue ? theme.palette.primary : theme.palette.gray}
            style={{ opacity: canContinue ? 1 : 0.85 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.window.windowWidth > 600 ? 20 : 10,
  },
  card: {
    backgroundColor: theme.palette.white,
    borderRadius: 14,
    padding: 14,
    ...theme.shadow,
    marginTop: 12,
  },
  infoBox: {
    paddingVertical: 10,
  },
  errorBox: {
    backgroundColor: 'rgba(255,0,0,0.06)',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
});

import { ScrollView, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { StackActions, useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';

import formatMoney from '../../constants/FormatNumber';
import BottomHalfModal from '../global/MyModal';
import Title from '../global/Title';
import Row from '../global/Row';
import { Theme } from '../../constants/Theme';
import { toggleDataModel } from '../../store/globalState';
import MyButton from '../global/Mybutton';
import useCheckBiometric from '../../hooks/CheckBiometric';
import { useMemo, useState } from 'react';
import MyInput from '../global/MyInput';
import { VerifyTransactionPin } from '../../store/apis/auth';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { StoreData } from '../../constants/storage';
import {
  GiftAUser,
  MakeBankTransfer,
  MakeBankWithdrawal,
} from '../../store/apis/global';
import {
  PurchaseElectricityToken,
  SubscribeCableTv,
} from '../../store/apis/services';
import { SendBulkSms } from '../../store/apis/sms';
import { BuyGiftCard } from '../../store/apis/giftCard';
import { BuyKirani } from '../../store/apis/kirani';
import { BuyRatel } from '../../store/apis/ratel';
import { PlaceStoreOrder } from '../../store/apis/store';
import { TerminateVirtualCard } from '../../store/apis/virtualCards';
import { GenerateRandomNumber } from '../../constants/GenerateRandomNumber';
import { MIN_BULK_SMS_RECIPIENTS } from '../../constants/SmsHelpers';
import { logFeatures } from '../../utils/debugScopes';
import useSaveUser from '../../hooks/saveUser';

const theme = Theme();

const __maskPin = (p) => {
  if (!p) return '';
  const s = String(p);
  if (s.length <= 2) return '*'.repeat(s.length);
  return `${s.slice(0, 1)}${'*'.repeat(Math.max(0, s.length - 2))}${s.slice(-1)}`;
};

const __debug = (...args) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};

export default function PayModel({ data }) {
  const dispatch = useDispatch();
  const { dataModel, user, token } = useSelector((state) => state.globalState);
  const { pin: currentPin, usePin } = useCheckBiometric();
  const { getUserInfo } = useSaveUser();
  const [error, setError] = useState();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleToggleModal = () => {
    dispatch(toggleDataModel());
  };

  let dataList = useMemo(() => [], [data]);

  switch (data?.type?.toLowerCase()) {
    case 'gift user':
      dataList = [
        {
          id: 1,
          header: 'Phone Number',
          title: data.phone,
        },
        {
          id: 2,
          header: 'amount',
          title: data.amount,
        },
      ];
      break;
    case 'tv subscription':
      dataList = [
        {
          id: 2,
          header: 'Name',
          title: data.name,
        },
        {
          id: 4,
          header: 'Provider',
          title: data?.cablename,
        },
        {
          id: 5,
          header: 'Plan',
          title: data?.planName,
        },
        {
          id: 3,
          header: 'Card Number',
          title: data?.cardNumber,
        },
      ];
      break;
    case 'electricity':
      dataList = [
        {
          id: 2,
          header: 'Name',
          title: data.name,
        },
        {
          id: 3,
          header: 'Provider',
          title: data.providerName,
        },
        {
          id: 4,
          header: 'Amount',
          title: data.amount,
        },
        {
          id: 5,
          header: 'Meter Number',
          title: data.meternumber,
        },
      ];
      break;
    case 'bulk sms':
      dataList = [
        {
          id: 1,
          header: 'Sender Name',
          title: data?.sendername,
        },
        {
          id: 2,
          header: 'Recipients',
          title: `${data?.phoneCount} number${data?.phoneCount === 1 ? '' : 's'}`,
        },
        {
          id: 3,
          header: 'Pages',
          title: String(data?.pageCount),
        },
        {
          id: 4,
          header: 'Estimated Cost',
          title:
            data?.amount != null
              ? `₦${formatMoney(parseFloat(data?.amount))}`
              : 'Confirmed after sending',
        },
      ];
      break;
    case 'gift card':
      dataList = [
        {
          id: 1,
          header: 'Plan',
          title: data?.productName,
        },
        {
          id: 2,
          header: 'Email',
          title: data?.email,
        },
        {
          id: 3,
          header: 'Sender',
          title: data?.sender,
        },
        {
          id: 4,
          header: 'Units',
          title: String(data?.units),
        },
        {
          id: 5,
          header: 'Amount',
          title: `₦${formatMoney(parseFloat(data?.amount))}`,
        },
      ];
      break;
    case 'store order':
      dataList = [
        {
          id: 1,
          header: 'Product',
          title: data?.productName,
        },
        {
          id: 2,
          header: 'Quantity',
          title: String(data?.quantity),
        },
        {
          id: 3,
          header: 'Deliver to',
          title: data?.destination_state,
        },
        {
          id: 4,
          header: 'Delivery fee',
          title: `₦${formatMoney(parseFloat(data?.delivery_fee || 0))}`,
        },
        {
          id: 5,
          header: 'Total',
          title: `₦${formatMoney(parseFloat(data?.total || data?.amount))}`,
        },
      ];
      break;
    case 'kirani':
      dataList = [
        {
          id: 1,
          header: 'Phone',
          title: data?.phone,
        },
        {
          id: 2,
          header: 'Amount',
          title: `₦${formatMoney(parseFloat(data?.amount))}`,
        },
      ];
      break;
    case 'ratel':
      dataList = [
        {
          id: 1,
          header: 'Phone',
          title: data?.phone,
        },
        {
          id: 2,
          header: 'Amount',
          title: `₦${formatMoney(parseFloat(data?.amount))}`,
        },
      ];
      break;
    case 'terminate virtual card':
      dataList = [
        {
          id: 1,
          header: 'Action',
          title: 'Terminate Card',
        },
        {
          id: 2,
          header: 'Card',
          title: data?.masked || data?.card_id,
        },
        {
          id: 3,
          header: 'Brand',
          title: data?.brand || '—',
        },
      ];
      break;
    default:
      dataList = [
        {
          id: 1,
          header: 'Account Name',
          title: data?.accountname,
        },
        {
          id: 2,
          header: 'Bank Name',
          title: data?.bankname,
        },
        {
          id: 3,
          header: 'Account Number',
          title: data?.accountnumber,
        },
        {
          id: 4,
          header: 'Amount',
          title: `₦${formatMoney(parseFloat(data?.amount))}`,
        },
      ];
  }

  const handleSubmit = async ({ useBio }) => {
    const txType = data?.type?.toLowerCase?.() || String(data?.type || '');
    __debug('[PAYMENT_MODAL] Submit pressed', {
      type: txType,
      useBio,
      usePin,
      hasStoredPin: Boolean(currentPin && String(currentPin).trim() !== ''),
      hasManualPin: Boolean(pin && String(pin).trim() !== ''),
      hasToken: Boolean(token),
    });
    // verify if pin is not empty
    if (pin.trim() === '' && !useBio) {
      __debug('[PAYMENT_MODAL] Pin validation failed (empty pin, no biometric)', {
        type: txType,
      });
      return setError((p) => ({ ...p, pin: 'Pin cannot be empty' }));
    }

    // verify if biometric is enabled and pay using biometric
    if (useBio) {
      __debug('[PAYMENT_MODAL] Biometric auth start', { type: txType });
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm payment',
        disableDeviceFallback: true,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Pin',
      });

      if (!biometricAuth.success) {
        __debug('[PAYMENT_MODAL] Biometric auth failed/cancelled', {
          type: txType,
          result: biometricAuth,
        });
        return;
      }
      __debug('[PAYMENT_MODAL] Biometric auth success', { type: txType });
    }

    setLoading(true);
    __debug('[PAYMENT_MODAL] Loading set true', { type: txType });

    let response;
    switch (data?.type?.toLowerCase()) {
      case 'gift user':
        handleGiftUser();
        break;
      case 'withdraw':
        response = await MakeBankWithdrawal({
          ...data,
          token,
        });
        break;
      case 'tv subscription':
        handleBuyTv();
        return;
      case 'electricity':
        handleBuyElectric();
        return;
      case 'bulk sms':
        handleBulkSms();
        return;
      case 'gift card':
        handleBuyGiftCard();
        return;
      case 'store order':
        handlePlaceStoreOrder();
        return;
      case 'kirani':
        handleBuyKirani();
        return;
      case 'ratel':
        handleBuyRatel();
        return;
      case 'terminate virtual card':
        handleTerminateVirtualCard();
        return;
      default:
        response = await MakeBankTransfer({
          ...data,
          token,
        });
    }

    setLoading(false);
    __debug('[PAYMENT_MODAL] Loading set false', { type: txType });
    if (response.status !== 'success') {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Payment Fail',
        textBody: response.message,
        button: 'close',
      });
      return;
    }

    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: 'Payment Fail',
      textBody: 'Transaction Successful',
      button: 'close',
    });

    navigation.dispatch(StackActions.popToTop());
    handleToggleModal();
    navigation.navigate('bottomTabs', { page: 'homePage' });
  };

  async function handleGiftUser() {
    const response = await GiftAUser({
      token,
      amount: data.amount,
      phone: data.phone,
    });
    setLoading(false);

    if (response.status !== 'success') {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Transfer Fail',
        textBody: response.message,
        button: 'close',
      });
      return;
    }
    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: 'Transfer successful',
      textBody: response.message,
      button: 'close',
    });

    navigation.replace('bottomTabs', { page: 'homePage' });
  }
  async function handleBuyElectric() {
    const ref = `ELECTRICITY_${GenerateRandomNumber()}_${Date.now()}`;
    const resolvedPin = pin.trim() === '' && currentPin ? currentPin : pin.trim();
    __debug('[ELECTRICITY][PAY] handleBuyElectric start', {
      ref,
      amount: data?.amount,
      provider: data?.provider,
      metertype: data?.metertype,
      meternumberLast4: data?.meternumber ? String(data.meternumber).slice(-4) : '',
      phone: user?.phone,
      hasToken: Boolean(token),
      pin: __maskPin(resolvedPin),
      pinSource: pin.trim() === '' && currentPin ? 'storedPin' : 'manualPin',
      transferData: data,
    });
    const response = await PurchaseElectricityToken({
      amount: data.amount,
      token,
      meternumber: data?.meternumber,
      provider: data?.provider,
      metertype: data.metertype,
      pin: resolvedPin,
      phone: user.phone,
      ref,
    });
    setLoading(false);
    __debug('[ELECTRICITY][PAY] handleBuyElectric response received', {
      ref,
      status: response?.status,
      message: response?.message,
      raw: response,
    });
    if (response.status.toLowerCase() !== 'success') {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Payment Fail',
        textBody: response.message,
        button: 'close',
      });
      return;
    }

    if (usePin) {
      __debug('[ELECTRICITY][PAY] Persisting transaction pin', {
        ref,
        pin: __maskPin(resolvedPin),
      });
      await StoreData(
        'transaction_pin',
        resolvedPin
      );
    }
    __debug('[ELECTRICITY][PAY] Navigation to transaction status', {
      ref,
      amount: data?.amount,
      hasToken: Boolean(response?.response?.msg?.token),
    });
    navigation.dispatch(StackActions.popToTop());
    navigation.navigate('transaction status', {
      data: {
        oldbal: user?.wallet,
        ref,
        date: Date.now(),
        message: response.message,
        type: 'Electricity',
        amount: data.amount,
        response: response?.response, // Pass full response with token
        token: response?.response?.msg?.token, // Direct token access
      },
    });
  }
  async function handleBuyTv() {
    setLoading(true);
    const ref = `TV_${GenerateRandomNumber()}_${Date.now()}`;
    const resolvedPin = pin.trim() === '' && currentPin ? currentPin : pin.trim();
    __debug('[TV][PAY] handleBuyTv start', {
      ref,
      provider: data?.cableId ?? data?.cId,
      cardNumberLast4: data?.cardNumber ? String(data.cardNumber).replace(/\s+/g, '').slice(-4) : '',
      subType: data?.subType,
      // This is the critical field that must match backend package code
      plan: data?.plan,
      legacy_cpId: data?.cpId,
      hasToken: Boolean(token),
      pin: __maskPin(resolvedPin),
      pinSource: pin.trim() === '' && currentPin ? 'storedPin' : 'manualPin',
      transferData: data,
    });
    const response = await SubscribeCableTv({
      token,
      provider: data?.cableId ?? data?.cId,
      phone: user.phone,
      iucnumber: data?.cardNumber,
      ref,
      pin: resolvedPin,
      // Backend expects the cable plan internal id (cpId) for this field.
      // We still keep data.plan (planid) in transferData for display/debugging.
      cableplanId: data?.cpId ?? data?.plan,
      subtype: data?.subType,
    });
    setLoading(false);
    __debug('[TV][PAY] handleBuyTv response', {
      ref,
      status: response?.status,
      message: response?.message,
      code: response?.code,
      raw: response,
    });

    if (response.status !== 'success') {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Payment Fail',
        textBody: response.message,
        button: 'close',
      });
      return;
    }

    if (usePin) {
      await StoreData(
        'transaction_pin',
        pin.trim() === '' && currentPin ? currentPin : pin
      );
    }

    // handleToggleModal();
    navigation.dispatch(StackActions.popToTop());
    navigation.navigate('transaction status', {
      data: {
        message: response.message,
        status: response.status,
        oldbal: user?.wallet,
        ref,
        date: Date.now(),
        type: 'Tv Subscription',
        amount: data.amount,
      },
    });
  }

  async function handleBulkSms() {
    if ((data?.phoneCount ?? 0) < MIN_BULK_SMS_RECIPIENTS) {
      setLoading(false);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Bulk SMS requires multiple recipients',
        textBody: `Add at least ${MIN_BULK_SMS_RECIPIENTS} phone numbers, separated by commas.`,
        button: 'close',
      });
      return;
    }

    const ref = `BULKSMS_${GenerateRandomNumber()}_${Date.now()}`;
    const resolvedPin = pin.trim() === '' && currentPin ? currentPin : pin.trim();
    logFeatures('BulkSms', 'PayModel submit start', {
      ref,
      sendername: data?.sendername,
      phoneCount: data?.phoneCount,
      pageCount: data?.pageCount,
      amount: data?.amount,
      messageLength: data?.message?.length,
      transkey: __maskPin(resolvedPin),
      useBio: false,
    });
    const response = await SendBulkSms({
      token,
      sendername: data?.sendername,
      phoneNumbers: data?.phoneNumbers,
      message: data?.message,
      ref,
      pin: resolvedPin,
    });
    setLoading(false);

    if (response?.status !== 'success') {
      logFeatures('BulkSms', 'PayModel submit failed', {
        ref,
        status: response?.status,
        message: response?.message,
      });
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Payment Fail',
        textBody: response?.message,
        button: 'close',
      });
      return;
    }

    logFeatures('BulkSms', 'PayModel submit success', {
      ref,
      status: response?.status,
      message: response?.message,
    });

    if (usePin) {
      await StoreData('transaction_pin', resolvedPin);
    }

    navigation.dispatch(StackActions.popToTop());
    navigation.navigate('transaction status', {
      data: {
        message: response.message,
        status: response.status,
        oldbal: user?.wallet,
        ref,
        date: Date.now(),
        type: 'Bulk Sms',
        amount: data?.amount,
      },
    });
  }

  async function handleBuyGiftCard() {
    const resolvedPin = pin.trim() === '' && currentPin ? currentPin : pin.trim();
    const response = await BuyGiftCard({
      token,
      product: data?.product,
      email: data?.email,
      amount: data?.amount,
      sender: data?.sender,
      units: data?.units,
      pin: resolvedPin,
    });
    setLoading(false);

    if (response?.status !== 'success') {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Payment Fail',
        textBody: response?.message || response?.msg || 'Purchase failed',
        button: 'close',
      });
      return;
    }

    if (usePin) {
      await StoreData('transaction_pin', resolvedPin);
    }

    handleToggleModal();
    navigation.dispatch(StackActions.popToTop());
    navigation.navigate('transaction status', {
      data: {
        message: response?.message || response?.msg || 'Purchase Successful',
        status: response.status,
        oldbal: user?.wallet,
        ref: `GIFTCARD_${GenerateRandomNumber()}_${Date.now()}`,
        date: Date.now(),
        type: 'Gift Card',
        amount: data?.amount,
      },
    });
  }

  async function handleBuyKirani() {
    const resolvedPin = pin.trim() === '' && currentPin ? currentPin : pin.trim();
    const ref = `KIRANI_${GenerateRandomNumber()}_${Date.now()}`;
    let response;
    try {
      response = await BuyKirani({
        token,
        plan: data?.plan,
        amount: data?.amount,
        phone: data?.phone,
        pin: resolvedPin,
        transref: ref,
      });
    } finally {
      setLoading(false);
    }

    if (response?.status !== 'success') {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Payment Fail',
        textBody: response?.message || response?.msg || 'Purchase failed',
        button: 'close',
      });
      return;
    }

    if (usePin) {
      await StoreData('transaction_pin', resolvedPin);
    }

    handleToggleModal();
    navigation.dispatch(StackActions.popToTop());
    navigation.navigate('transaction status', {
      data: {
        message: response?.message || response?.msg || 'Purchase Successful',
        status: response.status,
        oldbal: user?.wallet,
        ref,
        date: Date.now(),
        type: 'Kirani',
        amount: data?.amount,
      },
    });
  }

  async function handleBuyRatel() {
    const resolvedPin = pin.trim() === '' && currentPin ? currentPin : pin.trim();
    const ref = `RATEL_${GenerateRandomNumber()}_${Date.now()}`;
    let response;
    try {
      response = await BuyRatel({
        token,
        plan: data?.plan,
        amount: data?.amount,
        phone: data?.phone,
        pin: resolvedPin,
        transref: ref,
      });
    } finally {
      setLoading(false);
    }

    if (response?.status !== 'success') {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Payment Fail',
        textBody: response?.message || response?.msg || 'Purchase failed',
        button: 'close',
      });
      return;
    }

    if (usePin) {
      await StoreData('transaction_pin', resolvedPin);
    }

    handleToggleModal();
    navigation.dispatch(StackActions.popToTop());
    navigation.navigate('transaction status', {
      data: {
        message: response?.message || response?.msg || 'Purchase Successful',
        status: response.status,
        oldbal: user?.wallet,
        ref,
        date: Date.now(),
        type: 'Ratel',
        amount: data?.amount,
      },
    });
  }

  async function handlePlaceStoreOrder() {
    const resolvedPin =
      pin.trim() === '' && currentPin ? currentPin : pin.trim();
    let response;
    try {
      response = await PlaceStoreOrder({
        token,
        product_id: data?.product_id,
        quantity: data?.quantity,
        customer_name: data?.customer_name,
        customer_phone: data?.customer_phone,
        delivery_address: data?.delivery_address,
        destination_state: data?.destination_state,
        delivery_notes: data?.delivery_notes,
        pin: resolvedPin,
      });
    } finally {
      setLoading(false);
    }

    if (response?.status !== 'success') {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Order Failed',
        textBody: response?.message || response?.msg || 'Unable to place order',
        button: 'close',
      });
      return;
    }

    if (usePin) {
      await StoreData('transaction_pin', resolvedPin);
    }

    const orderRef = response?.response?.ref;
    handleToggleModal();
    navigation.dispatch(StackActions.popToTop());
    if (orderRef) {
      navigation.navigate('store order details', { ref: orderRef });
      return;
    }
    navigation.navigate('transaction status', {
      data: {
        message: response?.message || 'Order placed successfully',
        status: response.status,
        oldbal: user?.wallet,
        date: Date.now(),
        type: 'Store',
        amount: data?.total,
      },
    });
  }

  async function handleTerminateVirtualCard() {
    const resolvedPin = pin.trim() === '' && currentPin ? currentPin : pin.trim();
    const ref = `CARD_TERMINATE_${GenerateRandomNumber()}_${Date.now()}`;
    const response = await TerminateVirtualCard({
      token,
      card_id: data?.card_id,
      pin: resolvedPin,
      ref,
    });
    setLoading(false);

    if (response?.status !== 'success') {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Terminate Failed',
        textBody: response?.message || response?.msg || 'Unable to terminate card',
        button: 'close',
      });
      return;
    }

    if (usePin) {
      await StoreData('transaction_pin', resolvedPin);
    }

    await getUserInfo();

    handleToggleModal();
    navigation.dispatch(StackActions.popToTop());
    navigation.navigate('transaction status', {
      data: {
        message: response?.message || response?.msg || 'Card Terminated Successfully',
        status: response.status,
        ref,
        date: Date.now(),
        type: 'Virtual Card Terminate',
      },
    });
  }

  return (
    <BottomHalfModal toggleModal={handleToggleModal} isModalVisible={dataModel}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Title text={'Transaction Details'} header />
        <View style={{ marginTop: 10 }} />
        {dataList.map((item) => (
          <DataItem header={item.header} title={item.title} key={item.id} />
        ))}
        <MyInput
          password
          icon="lock-closed"
          text="Transaction Pin"
          type="number-pad"
          value={pin}
          onChangeText={(t) => {
            setError('');
            setPin(t);
          }}
          error={error}
        />
        <Row style={{ justifyContent: 'space-between' }}>
          <MyButton
            text="Proceed"
            isLoading={loading}
            style={{
              width: usePin && currentPin.trim() !== '' ? '75%' : '100%',
            }}
            onPress={() => handleSubmit({ useBio: false })}
          />

          {usePin && currentPin.trim() !== '' && (
            <MyButton
              iconButton="finger-print-outline"
              style={{
                width: '20%',
              }}
              onPress={() => handleSubmit({ useBio: true })}
            />
          )}
        </Row>
      </ScrollView>
    </BottomHalfModal>
  );
}

function DataItem({ header, title }) {
  return (
    <Row style={{ justifyContent: 'space-between', marginTop: 10 }}>
      <Title text={header} bold color={theme.palette.grayDark} />
      <Title text={title} style={{ maxWidth: '60%', textAlign: 'right' }} />
    </Row>
  );
}

import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';

import { toggleDataModel } from '../../store/globalState';
import Title from '../global/Title';
import MyInput from '../global/MyInput';
import MyButton from '../global/Mybutton';
import Row from '../global/Row';
import { Theme } from '../../constants/Theme';
import formatMoney from '../../constants/FormatNumber';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import {
  PurchaseAirtimePin,
  PurchaseSmile,
  SendAirtimeSwapRequest,
} from '../../store/apis/services';
import { GenerateRandomNumber } from '../../constants/GenerateRandomNumber';
import useCheckBiometric from '../../hooks/CheckBiometric';
import { StoreData } from '../../constants/storage';
import { GetCurrentUserPrice } from '../../constants/GetUserPrice';
import SecondaryHeader from '../global/SecondaryHeader';

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

export default function AirtimePinModel() {
  const { dataModel, dataPlans, user, token } = useSelector(
    (state) => state.globalState
  );
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { network, businessname, quantity, plan } = useRoute().params;
  //   const [plan, setPlan] = useState({});
  const [price, setPrice] = useState(0);
  const [dataList, setDataList] = useState([]);
  const [pin, setPin] = useState('');
  const [error, setError] = useState({ pin: '', pay: 'hi' });
  const [loading, setLoading] = useState(false);
  const { pin: currentPin, usePin } = useCheckBiometric();

  useEffect(() => {
    __debug('[AIRTIME_PIN][PAY] Screen mounted', {
      network,
      businessname,
      quantity,
      planId: plan?.aId,
      planSize: plan?.planSize,
      hasToken: Boolean(token),
      userPhone: user?.phone,
      usePin,
      hasStoredPin: Boolean(currentPin && String(currentPin).trim() !== ''),
    });
  }, []);

  const handleToggleModal = () => {
    dispatch(toggleDataModel());
  };

  useEffect(() => {
    // console.log({ exam, quantity, amount });
    const DataList = [
      {
        id: 1,
        header: 'Services',
        title: 'Airtime Pin',
      },
      {
        id: 2,
        header: 'Size',
        title: plan?.planSize,
      },
      {
        id: 3,
        header: 'Quantity',
        title: quantity,
      },

      {
        id: 4,
        header: 'Business Name',
        title: businessname,
      },
    ];
    setDataList(DataList);
  }, []);

  const canProceedWithPin = Boolean(pin && String(pin).trim() !== '');
  const canProceedWithBio = Boolean(usePin && currentPin && String(currentPin).trim() !== '');

  const handleSubmit = async ({ useBio }) => {
    const resolvedPin = pin.trim() === '' && currentPin ? currentPin : pin.trim();
    const ref = `RechargePin_${GenerateRandomNumber()}${Date.now()}`;
    __debug('[AIRTIME_PIN][PAY] Submit pressed', {
      useBio,
      usePin,
      hasStoredPin: Boolean(currentPin && String(currentPin).trim() !== ''),
      hasManualPin: Boolean(pin && String(pin).trim() !== ''),
      resolvedPin: __maskPin(resolvedPin),
      pinSource: pin.trim() === '' && currentPin ? 'storedPin' : 'manualPin',
      network,
      businessname,
      quantity,
      planId: plan?.aId,
      planSize: plan?.planSize,
      ref,
      hasToken: Boolean(token),
    });
    if (pin.trim() === '' && !useBio) {
      __debug('[AIRTIME_PIN][PAY] Pin validation failed (empty pin, no biometric)', {
        network,
        businessname,
        quantity,
      });
      return setError((p) => ({ ...p, pin: 'Pin cannot be empty' }));
    }

    if (useBio) {
      __debug('[AIRTIME_PIN][PAY] Biometric auth start', { ref });
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm payment',
        disableDeviceFallback: true,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Pin',
      });

      if (!biometricAuth.success) {
        __debug('[AIRTIME_PIN][PAY] Biometric auth failed/cancelled', {
          ref,
          result: biometricAuth,
        });
        return;
      }
      __debug('[AIRTIME_PIN][PAY] Biometric auth success', { ref });
    }

    setLoading(true);
    __debug('[AIRTIME_PIN][PAY] Loading set true', { ref });
    const response = await PurchaseAirtimePin({
      token,
      network,
      businessname,
      quantity,
      amount: plan?.planSize,
      plan: plan?.aId,
      pin: resolvedPin,
      ref,
    });

    setLoading(false);
    __debug('[AIRTIME_PIN][PAY] PurchaseAirtimePin response received', {
      ref,
      status: response?.status,
      message: response?.message,
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
      __debug('[AIRTIME_PIN][PAY] Persisting transaction pin', {
        ref,
        pin: __maskPin(resolvedPin),
      });
      await StoreData(
        'transaction_pin',
        resolvedPin
      );
    }

    __debug('[AIRTIME_PIN][PAY] Navigation to transaction status', {
      ref,
      type: 'airtime-pin',
    });
    handleToggleModal();
    navigation.navigate('transaction status', {
      data: {
        ...response.response,
        message: response.message,
        type: 'airtime-pin',
      },
    });
  };

  return (
    <ScrollView
      style={styles.outerContainer}
      showsVerticalScrollIndicator={false}
    >
      <SecondaryHeader text="Confirm Transaction" />

      {theme.window.windowWidth > 600 && (
        <Image source={require('../../assets/icon.png')} style={styles.image} />
      )}
      <View style={styles.container}>
        <View style={styles.card}>
          <Title text="Review purchase" bold />
          <Title
            text="Confirm the details below, then authorize with your transaction PIN."
            small
            style={{ marginTop: 4, opacity: 0.75 }}
          />

          <View style={{ marginTop: 12 }} />

          {dataList.map((item) => (
            <DataItem header={item.header} title={item.title} key={item.id} />
          ))}

          <View style={styles.divider} />

          <MyInput
            password
            icon="lock-closed"
            text="Transaction PIN"
            type="number-pad"
            value={pin}
            onChangeText={(t) => {
              setError((p) => ({ ...p, pin: '' }));
              setPin(t);
            }}
            error={error.pin}
          />

          {!!canProceedWithBio && (
            <Title
              text="Tip: You can also approve with fingerprint."
              small
              style={{ marginTop: 6, opacity: 0.75 }}
            />
          )}

          <Row style={{ justifyContent: 'space-between' }}>
            <MyButton
              text={canProceedWithPin ? 'Proceed' : 'Enter PIN to proceed'}
              isLoading={loading}
              background={canProceedWithPin ? theme.palette.primary : theme.palette.gray}
              style={{
                width: canProceedWithBio ? '75%' : '100%',
                opacity: canProceedWithPin ? 1 : 0.85,
              }}
              onPress={canProceedWithPin ? () => handleSubmit({ useBio: false }) : undefined}
            />
            {canProceedWithBio && (
              <MyButton
                iconButton="finger-print-outline"
                background={theme.palette.primary}
                style={{
                  width: '20%',
                }}
                onPress={() => handleSubmit({ useBio: true })}
              />
            )}
          </Row>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    marginTop: 20,
  },
  card: {
    backgroundColor: theme.palette.white,
    borderRadius: 14,
    padding: 14,
    ...theme.shadow,
  },
  divider: {
    height: 1,
    backgroundColor: theme.palette.gray,
    opacity: 0.35,
    marginVertical: 12,
  },
  image: {
    marginTop: 20,
  },
  outerContainer: {
    padding: 18,
  },
});

function DataItem({ header, title }) {
  return (
    <Row style={{ justifyContent: 'space-between', marginTop: 10 }}>
      <Title text={header} />
      <Title
        text={title}
        style={{ fontWeight: 'bold', maxWidth: '60%', textAlign: 'right' }}
      />
    </Row>
  );
}

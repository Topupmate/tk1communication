import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { StackActions, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import * as LocalAuthentication from 'expo-local-authentication';

import BottomHalfModal from '../global/MyModal';
import { toggleModal } from '../../store/globalState';
import Title from '../global/Title';
import MyInput from '../global/MyInput';
import MyButton from '../global/Mybutton';
import Row from '../global/Row';
import { Theme } from '../../constants/Theme';
import { PurchaseAirtime } from '../../store/apis/services';
import { GenerateRandomNumber } from '../../constants/GenerateRandomNumber';
import { VerifyTransactionPin } from '../../store/apis/auth';
import useCheckBiometric from '../../hooks/CheckBiometric';
import { StoreData } from '../../constants/storage';
import { createScopedDebugger } from '../../utils/debugScopes';

const theme = Theme();
const __buyAirtimeDebug = createScopedDebugger('BUY_AIRTIME');
const __maskPin = (p) => {
  if (!p) return '';
  const s = String(p);
  if (s.length <= 2) return '*'.repeat(s.length);
  return `${s.slice(0, 1)}${'*'.repeat(Math.max(0, s.length - 2))}${s.slice(-1)}`;
};
const __phoneLast4 = (p) => (p ? String(p).replace(/\s+/g, '').slice(-4) : '');
export default function PaymentModal({
  network,
  selectedOption,
  phone,
  amount,
}) {
  const { isModalVisible, token, user } = useSelector(
    (state) => state.globalState
  );
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [networkType, setNetworkType] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ pin: '', pay: 'hi' });
  const { pin: currentPin, usePin } = useCheckBiometric();

  useEffect(() => {
    switch (network) {
      case 1:
        setNetworkType('MTN');
        break;
      case 2:
        setNetworkType('Airtel');
        break;
      case 3:
        setNetworkType('Glo');
        break;
      case 4:
        setNetworkType('9mobile');
        break;
      default:
        setNetworkType('Unknown Network');
        break;
    }
  }, [network]);

  const handleToggleModal = () => {
    __buyAirtimeDebug('[BUY_AIRTIME] step: toggle payment modal', {
      isModalVisible,
    });
    dispatch(toggleModal());
  };

  const clearError = (field) => {
    setError((prevErrors) => ({ ...prevErrors, [field]: '' }));
  };

  const handleSubmit = async ({ useBio }) => {
    __buyAirtimeDebug('[BUY_AIRTIME] step: submit pressed', {
      useBio,
      network,
      networkType,
      airtime_type: selectedOption,
      amount,
      phoneLast4: __phoneLast4(phone),
      hasToken: Boolean(token && String(token).trim()),
      pin: __maskPin(pin.trim()),
      hasSavedPin: Boolean(currentPin && String(currentPin).trim()),
      canUseSavedPin: Boolean(usePin),
    });
    if (pin.trim() === '' && !useBio) {
      __buyAirtimeDebug('[BUY_AIRTIME] validation failed: empty pin', {});
      return setError((p) => ({ ...p, pin: 'Pin cannot be empty' }));
    }

    if (useBio) {
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm payment',
        disableDeviceFallback: true,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Pin',
      });

      if (!biometricAuth.success) {
        __buyAirtimeDebug('[BUY_AIRTIME] biometric auth failed/cancelled', {
          error: biometricAuth?.error,
          warning: biometricAuth?.warning,
        });
        return;
      }
      __buyAirtimeDebug('[BUY_AIRTIME] biometric auth success', {});
    }

    setLoading(true);
    const ref = `AIRTIME_${GenerateRandomNumber()}_${Date.now()}`;
    __buyAirtimeDebug('[BUY_AIRTIME] step: calling PurchaseAirtime', {
      ref,
      network,
      airtime_type: selectedOption,
      amount,
      phoneLast4: __phoneLast4(phone),
    });
    const response = await PurchaseAirtime({
      airtime_type: selectedOption,
      amount,
      network,
      phone: phone.trim(),
      token,
      ported_number: true,
      ref,
      pin: pin.trim() === '' && currentPin ? currentPin : pin.trim(),
    });

    setLoading(false);
    __buyAirtimeDebug('[BUY_AIRTIME] step: PurchaseAirtime returned', {
      ref,
      status: response?.status,
      message: response?.message,
      code: response?.code,
      hasResponse: Boolean(response?.response),
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

    handleToggleModal();
    __buyAirtimeDebug('[BUY_AIRTIME] step: navigate -> transaction status', {
      ref,
      network,
      networkType,
      airtime_type: selectedOption,
      amount,
      phoneLast4: __phoneLast4(phone),
    });
    navigation.navigate('transaction status', {
      data: {
        ...response.response,
        message: response.message,
        network: networkType,
        type: selectedOption,
        oldbal: user?.wallet,
        phone,
        ref: 'AIRTIME_' + ref,
        date: Date.now(),
        amount,
        transactionFlow: 'buy-airtime',
      },
    });
  };

  return (
    <BottomHalfModal
      toggleModal={handleToggleModal}
      isModalVisible={isModalVisible}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {theme.window.windowWidth > 600 && (
          <Image
            source={require('../../assets/icon.png')}
            style={styles.image}
          />
        )}

        <View style={styles.container}>
          <Title
            text="Please enter your pin to continue"
            header
            style={{ marginBottom: 40 }}
          />
          <ListItem header="Product Name" text={'Airtime'} />
          <ListItem header="Phone Number" text={phone} />
          <ListItem header="Amount" text={amount} />
          <ListItem header="Network type" text={networkType} />
          <MyInput
            password
            icon="lock-closed"
            text="Transaction Pin"
            value={pin}
            type="number-pad"
            onChangeText={(t) => {
              clearError('pin');
              setPin(t);
            }}
            error={error.pin}
          />
          <Row style={{ justifyContent: 'space-between' }}>
            <MyButton
              text="Proceed"
              isLoading={loading}
              onPress={() => handleSubmit({ useBio: false })}
              style={{
                width: usePin && currentPin.trim() !== '' ? '75%' : '100%',
              }}
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
        </View>
      </ScrollView>
    </BottomHalfModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  button: {},
  image: {
    marginTop: 20,
    resizeMode: 'contain',
    height: 100,
    alignSelf: 'center',
  },
});

function ListItem({ header, text }) {
  return (
    <Row style={{ justifyContent: 'space-between', marginTop: 10 }}>
      <Title text={header} bold color={theme.palette.grayDark} />
      <Title text={text} bold />
    </Row>
  );
}

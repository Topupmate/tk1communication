import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { StackActions, useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';

import BottomHalfModal from '../global/MyModal';
import { toggleDataModel } from '../../store/globalState';
import Title from '../global/Title';
import MyInput from '../global/MyInput';
import MyButton from '../global/Mybutton';
import Row from '../global/Row';
import { Theme } from '../../constants/Theme';
import formatMoney from '../../constants/FormatNumber';
import { VerifyTransactionPin } from '../../store/apis/auth';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { PurchaseData } from '../../store/apis/services';
import { GenerateRandomNumber } from '../../constants/GenerateRandomNumber';
import useCheckBiometric from '../../hooks/CheckBiometric';
import { StoreData } from '../../constants/storage';
import { GetCurrentUserPrice } from '../../constants/GetUserPrice';
import { createScopedDebugger } from '../../utils/debugScopes';

const theme = Theme();
export default function DataModal({ phone, data_plan }) {
  const { dataModel, dataPlans, user, token } = useSelector(
    (state) => state.globalState
  );
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [plan, setPlan] = useState({});
  const [price, setPrice] = useState(0);
  const [dataList, setDataList] = useState([]);
  const [pin, setPin] = useState('');
  const [error, setError] = useState({ pin: '', pay: 'hi' });
  const [loading, setLoading] = useState(false);
  const { pin: currentPin, usePin } = useCheckBiometric();

  const __debug = createScopedDebugger('BUY_DATA');

  const __maskPin = (p) => {
    if (!p) return '';
    const s = String(p);
    if (s.length <= 2) return '*'.repeat(s.length);
    return `${s.slice(0, 1)}${'*'.repeat(Math.max(0, s.length - 2))}${s.slice(-1)}`;
  };

  const __last4 = (v) => {
    if (!v) return '';
    const s = String(v);
    return s.length <= 4 ? s : s.slice(-4);
  };

  const __hasToken = (t) => Boolean(t && String(t).trim().length > 10);

  useEffect(() => {
    if (dataModel) {
      console.log('[BUY_DATA_DEBUG]', 'Buydatamodel modal opened', {
        planid: data_plan?.planid,
        pId: data_plan?.pId,
        phoneLast4: __last4(phone),
      });
    }
  }, [dataModel, data_plan?.planid, data_plan?.pId, phone]);

  useEffect(() => {
    __debug('[BUY_DATA][MODAL] init plan/price from selected plan', {
      dataPlanPlanId: data_plan?.planid,
      dataPlanPid: data_plan?.pId,
      dataPlanName: data_plan?.name,
      dataPlanType: data_plan?.type,
      phoneLast4: __last4(phone),
      dataPlansCount: Array.isArray(dataPlans) ? dataPlans.length : undefined,
      accountType: user?.account_type,
    });
    const p = dataPlans.filter((item) => item.planid === data_plan?.planid)[0];
    setPlan(p);
    setPrice(GetCurrentUserPrice({ user, data: p }));
  }, [data_plan]);

  const handleToggleModal = () => {
    dispatch(toggleDataModel());
  };
  useEffect(() => {
    const DataList = [
      {
        id: 1,
        header: 'Services',
        title: 'Data',
      },
      {
        id: 2,
        header: 'Network',
        title: plan?.network,
      },

      {
        id: 3,
        header: 'Number',
        title: phone,
      },
      {
        id: 4,
        header: 'Plan',
        title: plan?.name,
      },
      {
        id: 5,
        header: 'Price',
        title: `₦${formatMoney(parseFloat(price))}`,
      },
    ];
    setDataList(DataList);
  }, [plan, price, phone, data_plan]);
  const handleSubmit = async ({ useBio }) => {
    const attemptId = `DATA_PURCHASE_${Date.now()}`;
    __debug('[BUY_DATA][MODAL] proceed pressed', {
      attemptId,
      useBio,
      usePinEnabled: Boolean(usePin),
      hasSavedPin: Boolean(currentPin && String(currentPin).trim()),
      typedPinLen: pin?.length,
      phoneLast4: __last4(phone),
      planid: data_plan?.planid,
      pId: data_plan?.pId,
      datanetwork: plan?.datanetwork,
      networkName: plan?.networkName,
      displayNetwork: plan?.network,
      name: plan?.name,
      type: plan?.type,
      computedPrice: price,
      hasToken: __hasToken(token),
    });
    if (pin.trim() === '' && !useBio) {
      __debug('[BUY_DATA][MODAL] blocked: empty pin (no biometric)', {
        attemptId,
      });
      return setError((p) => ({ ...p, pin: 'Pin cannot be empty' }));
    }

    if (useBio) {
      const bioT0 = Date.now();
      __debug('[BUY_DATA][MODAL] biometric auth start', { attemptId });
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm payment',
        disableDeviceFallback: true,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Pin',
      });

      if (!biometricAuth.success) {
        __debug('[BUY_DATA][MODAL] biometric auth failed/cancelled', {
          attemptId,
          ms: Date.now() - bioT0,
          result: biometricAuth,
        });
        return;
      }
      __debug('[BUY_DATA][MODAL] biometric auth success', {
        attemptId,
        ms: Date.now() - bioT0,
      });
    }

    setLoading(true);
    const ref = `DATA_${GenerateRandomNumber()}_${Date.now()}`;
    const resolvedPin = pin.trim() === '' && currentPin ? currentPin : pin.trim();
    __debug('[BUY_DATA][MODAL] calling PurchaseData', {
      attemptId,
      ref,
      endpoint: 'buy-data',
      payload: {
        data_plan: data_plan?.pId,
        network: plan?.datanetwork,
        phoneLast4: __last4(phone?.trim()),
        tokenPresent: __hasToken(token),
        pinMasked: __maskPin(resolvedPin),
      },
    });
    const t0 = Date.now();
    const response = await PurchaseData({
      data_plan: data_plan?.pId,
      network: plan?.datanetwork,
      phone: phone.trim(),
      ref,
      token,
      pin: resolvedPin,
    });

    setLoading(false);
    __debug('[BUY_DATA][MODAL] PurchaseData returned', {
      attemptId,
      ref,
      ms: Date.now() - t0,
      responseStatus: response?.status,
      responseMessage: response?.message,
      responseCode: response?.code,
      raw: response,
    });
    if (response.status !== 'success') {
      console.log('[BUY_DATA_DEBUG]', 'Buydatamodel PurchaseData failed', {
        attemptId,
        ref,
        status: response?.status,
        message: response?.message,
      });
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Payment Fail',
        textBody: response.message,
        button: 'close',
      });
      return;
    }
    if (usePin) {
      __debug('[BUY_DATA][MODAL] storing transaction pin (if enabled)', {
        attemptId,
        pinMasked: __maskPin(resolvedPin),
      });
      await StoreData(
        'transaction_pin',
        resolvedPin
      );
    }

    handleToggleModal();
    const navPayload = {
      ...response.response,
      message: response.message,
      network: plan?.networkName,
      type: plan?.type,
      oldbal: user?.wallet,
      phone,
      ref: 'DATA_' + ref,
      date: Date.now(),
      amount: price,
      transactionFlow: 'buy-data',
    };
    __debug('[BUY_DATA][MODAL] navigating to transaction status', {
      attemptId,
      ref,
      phoneLast4: __last4(phone),
      navKeys: Object.keys(navPayload || {}),
      navDataPreview: {
        status: navPayload?.status,
        message: navPayload?.message,
        amount: navPayload?.amount,
        network: navPayload?.network,
        type: navPayload?.type,
      },
    });
    console.log('[BUY_DATA_DEBUG]', 'Buydatamodel -> navigate transaction status', {
      attemptId,
      transactionFlow: navPayload.transactionFlow,
      ref: navPayload.ref,
      navKeys: Object.keys(navPayload),
      status: navPayload?.status,
      message: navPayload?.message,
      responseResponseKeys: response.response
        ? Object.keys(response.response)
        : [],
    });
    navigation.navigate('transaction status', {
      data: {
        ...navPayload,
      },
    });
  };

  return (
    <BottomHalfModal toggleModal={handleToggleModal} isModalVisible={dataModel}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {theme.window.windowWidth > 600 && (
          <Image
            source={require('../../assets/icon.png')}
            style={styles.image}
          />
        )}
        <View style={styles.container}>
          <Title text="Please enter your pin to continue" header />
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
            error={error.pin}
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
  image: {
    marginTop: 20,
  },
});

function DataItem({ header, title }) {
  return (
    <Row style={{ justifyContent: 'space-between', marginTop: 10 }}>
      <Title text={header} />
      <Title text={title} style={{ fontWeight: 'bold' }} />
    </Row>
  );
}

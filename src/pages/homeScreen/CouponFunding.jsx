import { StyleSheet, View, ScrollView } from 'react-native';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

import MyCard from '../../components/global/MyCard';
import { Theme } from '../../constants/Theme';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import NoticeContainer from '../../components/fund/NoticeContainer';
import MyInput from '../../components/global/MyInput';
import MyButton from '../../components/global/Mybutton';
import { VerifyCouponCode } from '../../store/apis/global';
import useSaveUser from '../../hooks/saveUser';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

const theme = Theme();

export default function CouponFundingPage() {
  const { token } = useSelector((state) => state.globalState);
  const { getUserInfo } = useSaveUser();
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      console.log('[AddMoneyDebug] Screen focused: Coupon Funding (couponFundingPage)');
      return () =>
        console.log('[AddMoneyDebug] Screen blurred: Coupon Funding (couponFundingPage)');
    }, [])
  );

  const handleRedeem = async () => {
    const trimmed = couponCode.trim();
    console.log('[AddMoneyDebug] Redeem pressed', {
      rawLength: couponCode.length,
      trimmedLength: trimmed.length,
    });
    if (!trimmed.length) {
      console.log('[AddMoneyDebug] Validation failed: empty coupon code');
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Invalid code',
        textBody: 'Please enter a coupon code.',
        button: 'close',
      });
      return;
    }

    setLoading(true);
    console.log('[AddMoneyDebug] Calling VerifyCouponCode…');
    const response = await VerifyCouponCode({ token, couponCode: trimmed });
    setLoading(false);
    console.log('[AddMoneyDebug] VerifyCouponCode finished (handled in API layer + here)', {
      status: response?.status,
      message: response?.message,
    });

    if (response?.status === 'success') {
      console.log('[AddMoneyDebug] Coupon success → showing dialog, clearing input, getUserInfo()');
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: response?.message || 'Coupon redeemed successfully! Your wallet has been credited.',
        button: 'close',
      });
      setCouponCode('');
      await getUserInfo();
      console.log('[AddMoneyDebug] getUserInfo() completed after coupon success');
    } else {
      console.log('[AddMoneyDebug] Coupon failed or non-success status → error dialog');
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Failed',
        textBody: response?.message || 'Invalid or expired coupon code.',
        button: 'close',
      });
    }
  };

  return (
    <View style={styles.container}>
      <SecondaryHeader text="Coupon Funding" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <NoticeContainer
          text1="Enter your coupon code below"
          text2="Your wallet will be credited instantly upon successful redemption."
        />
        <MyCard style={styles.card}>
          <MyInput
            text="Coupon code"
            value={couponCode}
            onChangeText={setCouponCode}
            style={styles.input}
          />
          <MyButton
            text={loading ? 'Redeeming...' : 'Redeem Coupon'}
            style={styles.button}
            onPress={handleRedeem}
            isLoading={loading}
          />
        </MyCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.window.windowWidth * 0.04,
  },
  card: {
    marginTop: 20,
    alignSelf: 'stretch',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

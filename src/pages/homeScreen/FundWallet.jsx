import { ScrollView, StyleSheet, View } from 'react-native';
import React, { useCallback } from 'react';

import Header from '../../components/global/Header';
import Title from '../../components/global/Title';
import { Theme } from '../../constants/Theme';
import PaymentOptions from '../../components/fund/PaymentOption';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import { isFeatureOn } from '../../constants/FeatureAccess';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';

const theme = Theme();
const FundWalletPage = () => {
  const navigation = useNavigation();
  const features = useFeatureAccess();

  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused: Add Money (fundWalletPage)');
      return () =>
        console.log('[AddMoneyDebug] Screen blurred: Add Money (fundWalletPage)');
    }, [])
  );

  const goBankTransfer = () => {
    console.log('[AddMoneyDebug] User chose: Bank Transfer → bankTransferPage');
    navigation.navigate('bankTransferPage');
  };
  const goManualFunding = () => {
    console.log('[AddMoneyDebug] User chose: Manual Transfer → manualFundingPage');
    navigation.navigate('manualFundingPage');
  };
  const goCouponFunding = () => {
    console.log('[AddMoneyDebug] User chose: Coupon Funding → couponFundingPage');
    navigation.navigate('couponFundingPage');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}
      >
        <SecondaryHeader text="Add Money" />
        <View style={styles.innerContainer}>
          <PaymentOptions
            header="Bank Transfer"
            title="Pay with automatic bank transfer and get credited on your wallet instantly"
            onclick={goBankTransfer}
          />

          <PaymentOptions
            header="Manual Transfer"
            title="Transfer money directly to admin and send him proof of payment to get credited"
            onclick={goManualFunding}
          />

          {isFeatureOn(features, 'couponfunding') ? (
            <PaymentOptions
              header="Coupon Funding"
              title="Redeem a coupon code to credit your wallet instantly"
              onclick={goCouponFunding}
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

export default FundWalletPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
  },
  scrollView: {
    flexGrow: 1,
  },
  innerContainer: {},
});

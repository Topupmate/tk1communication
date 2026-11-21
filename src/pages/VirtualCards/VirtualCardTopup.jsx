import { ScrollView, StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

import { Theme } from '../../constants/Theme';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import Title from '../../components/global/Title';
import MyInput from '../../components/global/MyInput';
import MyButton from '../../components/global/Mybutton';
import MyCard from '../../components/global/MyCard';
import { TopupVirtualCard } from '../../store/apis/virtualCards';
import { GenerateRandomNumber } from '../../constants/GenerateRandomNumber';
import { getCardFundingErrorMessage } from '../../constants/VirtualCardHelpers';
import { getUsdBalance } from '../../constants/FxHelpers';
import useSaveUser from '../../hooks/saveUser';

const theme = Theme();

const VirtualCardTopup = () => {
  const navigation = useNavigation();
  const { cardId, fees } = useRoute().params || {};
  const { token, user } = useSelector((state) => state.globalState);
  const { getUserInfo } = useSaveUser();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const parsed = parseFloat(amount);
    const minFund = parseFloat(fees?.minUsdFund || fees?.minCardFund) || 1;
    if (!amount || Number.isNaN(parsed) || parsed < minFund) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Invalid amount',
        textBody: `Enter at least $${minFund} USD`,
        button: 'close',
      });
      return;
    }

    setLoading(true);
    const ref = `CARD_TOPUP_${GenerateRandomNumber()}_${Date.now()}`;
    const response = await TopupVirtualCard({
      token,
      card_id: cardId,
      amount: String(parsed),
      ref,
    });

    if (response?.status !== 'success') {
      setLoading(false);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Top Up Failed',
        textBody: getCardFundingErrorMessage({
          response,
          amount: parsed,
          usdBalance: getUsdBalance(user),
          fallback: 'Unable to top up',
        }),
        button: 'close',
      });
      return;
    }

    await getUserInfo();
    setLoading(false);

    navigation.dispatch(StackActions.pop(2));
    navigation.navigate('transaction status', {
      data: {
        message: response?.message || 'Card Topup Successful',
        status: response?.status,
        ref,
        date: Date.now(),
        type: 'Virtual Card Topup',
        amount: parsed,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SecondaryHeader text="Top Up Card" />
        <MyCard style={styles.infoCard}>
          <Title
            text={`Funding fee: ${fees?.fundingFee ?? '—'}`}
            small
            position="left"
            color={theme.palette.grayDark}
          />
          <Title
            text="Amount and fee are debited from your USD wallet."
            small
            position="left"
            color={theme.palette.grayDark}
            style={styles.infoLine}
          />
        </MyCard>
        <Title text="Amount (USD)" bold position="left" style={styles.label} />
        <MyInput
          text="Amount in USD"
          icon="cash-outline"
          type="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
        <MyButton text="Top Up" onPress={handleSubmit} isLoading={loading} />
      </ScrollView>
    </View>
  );
};

export default VirtualCardTopup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.window.windowWidth * 0.05,
    backgroundColor: '#F5F1F7',
  },
  infoCard: {
    borderRadius: 12,
    marginBottom: 10,
  },
  infoLine: {
    marginTop: 4,
    letterSpacing: 0,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
  },
});

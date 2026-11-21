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
import { WithdrawVirtualCard } from '../../store/apis/virtualCards';
import { GenerateRandomNumber } from '../../constants/GenerateRandomNumber';
import useSaveUser from '../../hooks/saveUser';

const theme = Theme();

const VirtualCardWithdraw = () => {
  const navigation = useNavigation();
  const { cardId, fees } = useRoute().params || {};
  const { token } = useSelector((state) => state.globalState);
  const { getUserInfo } = useSaveUser();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const parsed = parseFloat(amount);
    if (!amount || Number.isNaN(parsed) || parsed <= 0) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Invalid amount',
        textBody: 'Enter a valid USD amount to withdraw',
        button: 'close',
      });
      return;
    }

    setLoading(true);
    const ref = `CARD_WITHDRAW_${GenerateRandomNumber()}_${Date.now()}`;
    const response = await WithdrawVirtualCard({
      token,
      card_id: cardId,
      amount: String(parsed),
      ref,
    });

    if (response?.status !== 'success') {
      setLoading(false);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Withdraw Failed',
        textBody: response?.message || response?.msg || 'Unable to withdraw',
        button: 'close',
      });
      return;
    }

    await getUserInfo();
    setLoading(false);

    navigation.dispatch(StackActions.pop(2));
    navigation.navigate('transaction status', {
      data: {
        message: response?.message || 'Card Withdrawal Successful',
        status: response?.status,
        ref,
        date: Date.now(),
        type: 'Virtual Card Withdraw',
        amount: parsed,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SecondaryHeader text="Withdraw" />
        <MyCard style={styles.infoCard}>
          <Title
            text={`Withdrawal fee: $${fees?.withdrawalFee ?? '—'} USD`}
            small
            position="left"
            color={theme.palette.grayDark}
          />
          <Title
            text="Funds are credited back to your USD wallet."
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
        <MyButton text="Withdraw" onPress={handleSubmit} isLoading={loading} />
      </ScrollView>
    </View>
  );
};

export default VirtualCardWithdraw;

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

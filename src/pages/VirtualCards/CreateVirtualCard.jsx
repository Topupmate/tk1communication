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
import Dropdown from '../../components/global/Dropdown';
import MyCard from '../../components/global/MyCard';
import { CreateVirtualCard } from '../../store/apis/virtualCards';
import { GenerateRandomNumber } from '../../constants/GenerateRandomNumber';
import {
  getCardFundingErrorMessage,
  isServiceOn,
} from '../../constants/VirtualCardHelpers';
import { getUsdBalance } from '../../constants/FxHelpers';
import useSaveUser from '../../hooks/saveUser';

const theme = Theme();
const BRANDS = ['MASTERCARD', 'VISA'];

const CreateVirtualCardScreen = () => {
  const navigation = useNavigation();
  const { fees: routeFees } = useRoute().params || {};
  const { token, user } = useSelector((state) => state.globalState);
  const { getUserInfo } = useSaveUser();
  const [amount, setAmount] = useState('');
  const [brand, setBrand] = useState('MASTERCARD');
  const [loading, setLoading] = useState(false);
  const fees = routeFees || {};

  const handleCreate = async () => {
    if (!isServiceOn(fees)) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Unavailable',
        textBody: 'Virtual card service is currently off',
        button: 'close',
      });
      return;
    }

    const parsed = parseFloat(amount);
    const minFund = parseFloat(fees?.minCardFund) || 1;
    if (!amount || Number.isNaN(parsed) || parsed < minFund) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Invalid amount',
        textBody: `Enter at least $${minFund} USD`,
        button: 'close',
      });
      return;
    }

    if (!brand) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Select brand',
        textBody: 'Please select MASTERCARD or VISA',
        button: 'close',
      });
      return;
    }

    setLoading(true);
    const ref = `CARD_CREATE_${GenerateRandomNumber()}_${Date.now()}`;
    const response = await CreateVirtualCard({
      token,
      amount: String(parsed),
      brand,
      ref,
    });

    if (response?.status !== 'success') {
      setLoading(false);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Create Failed',
        textBody: getCardFundingErrorMessage({
          response,
          amount: parsed,
          usdBalance: getUsdBalance(user),
          fallback: 'Unable to create card',
        }),
        button: 'close',
      });
      return;
    }

    await getUserInfo();
    setLoading(false);

    navigation.dispatch(StackActions.popToTop());
    navigation.navigate('transaction status', {
      data: {
        message: response?.message || 'Virtual Card created successfully',
        status: response?.status,
        ref,
        date: Date.now(),
        type: 'Virtual Card',
        amount: parsed,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SecondaryHeader text="Create Card" />

        <MyCard style={styles.infoCard}>
          <Title
            text={`Creation fee: $${fees?.creationFee ?? '—'} USD`}
            small
            position="left"
            color={theme.palette.grayDark}
          />
          <Title
            text={`Minimum funding: $${fees?.minCardFund ?? '1'} USD`}
            small
            position="left"
            color={theme.palette.grayDark}
            style={styles.infoLine}
          />
          <Title
            text="Funding and fees are debited from your USD wallet."
            small
            position="left"
            color={theme.palette.grayDark}
            style={styles.infoLine}
          />
        </MyCard>

        <Title text="Card Brand" bold position="left" style={styles.label} />
        <Dropdown
          data={BRANDS}
          text="Select brand"
          onSelectItem={setBrand}
          iconName="card-outline"
        />

        <Title text="Initial Funding (USD)" bold position="left" style={styles.label} />
        <MyInput
          text="Amount in USD"
          icon="cash-outline"
          type="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <MyButton text="Create Card" onPress={handleCreate} isLoading={loading} />
      </ScrollView>
    </View>
  );
};

export default CreateVirtualCardScreen;

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
    marginTop: 10,
    marginBottom: 4,
  },
});

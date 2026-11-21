import { ScrollView, StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

import { Theme } from '../../constants/Theme';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import Title from '../../components/global/Title';
import MyInput from '../../components/global/MyInput';
import MyButton from '../../components/global/Mybutton';
import PayModel from '../../components/fund/PayMentModel';
import SelectContactButton from '../../components/global/SelectContactButton';
import { toggleDataModel } from '../../store/globalState';
import { pickNativeContactPhone } from '../../utils/nativeContactPicker';
import { normalizePhoneNumber } from '../../constants/PhoneNumberUtils';

const theme = Theme();

const Ratel = () => {
  const dispatch = useDispatch();
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [data, setData] = useState({});

  const handleSelectContact = async () => {
    try {
      const result = await pickNativeContactPhone();
      if (result?.number) setPhone(result.number);
    } catch (err) {
      // User cancelled or permission denied
    }
  };

  const handleAmountChange = (value) => {
    setAmount(String(value || '').replace(/[^0-9]/g, ''));
  };

  const handleContinue = () => {
    const normalizedPhone = normalizePhoneNumber(phone);
    const selectedAmount = parseInt(amount, 10);

    if (!normalizedPhone) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Submit Error',
        textBody: 'Please enter a phone number',
        button: 'close',
      });
      return;
    }

    if (!selectedAmount) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Submit Error',
        textBody: 'Please enter an amount',
        button: 'close',
      });
      return;
    }

    setData({
      type: 'ratel',
      plan: String(selectedAmount),
      planName: `₦${selectedAmount}`,
      amount: selectedAmount,
      phone: normalizedPhone,
    });
    dispatch(toggleDataModel());
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SecondaryHeader text="Ratel Top-up" />
        <SelectContactButton
          onPress={handleSelectContact}
          text="Select Phone Number"
        />
        <Title text="Phone Number" bold position="left" style={styles.label} />
        <MyInput
          text="Phone Number"
          icon="call-outline"
          type="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <Title text="Amount" bold position="left" style={styles.label} />
        <MyInput
          text="Enter amount"
          icon="cash-outline"
          type="number-pad"
          value={amount}
          onChangeText={handleAmountChange}
        />
        <MyButton text="Send Order" onPress={handleContinue} />
      </ScrollView>
      <PayModel data={data} />
    </View>
  );
};

export default Ratel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.window.windowWidth * 0.05,
    backgroundColor: '#F5F1F7',
  },
  label: {
    marginTop: 10,
    marginBottom: 4,
  },
});

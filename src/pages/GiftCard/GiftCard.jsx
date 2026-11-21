import { ScrollView, StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

import { Theme } from '../../constants/Theme';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import Title from '../../components/global/Title';
import MyInput from '../../components/global/MyInput';
import MyButton from '../../components/global/Mybutton';
import Dropdown from '../../components/global/Dropdown';
import Loader from '../../components/loading/Loading';
import PayModel from '../../components/fund/PayMentModel';
import { GetGiftCardPlans } from '../../store/apis/giftCard';
import { toggleDataModel } from '../../store/globalState';

const theme = Theme();

const GiftCard = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.globalState);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [email, setEmail] = useState('');
  const [sender, setSender] = useState('');
  const [amount, setAmount] = useState('');
  const [units, setUnits] = useState('1');
  const [data, setData] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const response = await GetGiftCardPlans({ token });
      setPlans(response?.plans || []);
      setLoading(false);
    };
    load();
  }, [token]);

  const planLabels = plans.map((p) => p.name || `Plan ${p.id}`);

  const handleContinue = () => {
    if (!selectedPlan || !email.trim() || !sender.trim() || !amount || !units) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Submit Error',
        textBody: 'Please fill in all fields',
        button: 'close',
      });
      return;
    }

    const parsedAmount = parseFloat(amount);
    const parsedUnits = parseInt(units, 10);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Invalid amount',
        textBody: 'Enter a valid amount in NGN',
        button: 'close',
      });
      return;
    }
    if (Number.isNaN(parsedUnits) || parsedUnits < 1) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Invalid units',
        textBody: 'Units must be at least 1',
        button: 'close',
      });
      return;
    }

    setData({
      type: 'gift card',
      product: selectedPlan.id,
      productName: selectedPlan.name,
      email: email.trim(),
      sender: sender.trim(),
      amount: parsedAmount,
      units: parsedUnits,
    });
    dispatch(toggleDataModel());
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SecondaryHeader text="Gift Card" />
        <View style={styles.centered}>
          <Loader />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SecondaryHeader text="Gift Card" />

        <Title text="Select Plan" bold position="left" style={styles.label} />
        <Dropdown
          data={planLabels.length ? planLabels : ['No plans available']}
          text="Choose gift card plan"
          onSelectItem={(label) => {
            const plan = plans.find((p) => (p.name || `Plan ${p.id}`) === label);
            setSelectedPlan(plan || null);
          }}
          iconName="gift-outline"
        />

        <Title text="Recipient Email" bold position="left" style={styles.label} />
        <MyInput
          text="email@example.com"
          icon="mail-outline"
          type="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Title text="Sender Name" bold position="left" style={styles.label} />
        <MyInput
          text="Your name"
          icon="person-outline"
          value={sender}
          onChangeText={setSender}
        />

        <Title text="Amount (NGN)" bold position="left" style={styles.label} />
        <MyInput
          text="Amount"
          icon="cash-outline"
          type="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <Title text="Units" bold position="left" style={styles.label} />
        <MyInput
          text="Number of cards"
          icon="layers-outline"
          type="number-pad"
          value={units}
          onChangeText={setUnits}
        />

        <MyButton text="Continue" onPress={handleContinue} />
      </ScrollView>
      <PayModel data={data} />
    </View>
  );
};

export default GiftCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.window.windowWidth * 0.05,
    backgroundColor: '#F5F1F7',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginTop: 10,
    marginBottom: 4,
  },
});

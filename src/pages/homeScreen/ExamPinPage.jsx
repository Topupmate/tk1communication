import { useSelector } from 'react-redux';
import { ScrollView, StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import MyInput from '../../components/global/MyInput';
import MyButton from '../../components/global/Mybutton';
import Dropdown from '../../components/global/Dropdown';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import {
  GetExamPinProviders,
  PurchaseExamPin,
} from '../../store/apis/services';
import { Theme } from '../../constants/Theme';
import GetUserPrice, {
  GetCurrentUserPrice,
} from '../../constants/GetUserPrice';
import Title from '../../components/global/Title';
import CashbackHint from '../../components/global/CashbackHint';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { StackActions } from '@react-navigation/native';

// this is the page to buy pin
const theme = Theme();
export default function ExamPinPage({ navigation }) {
  const [providers, setProviders] = useState([]);
  const { token, user } = useSelector((state) => state.globalState);
  const [selectedItem, setSelectedItem] = useState(null);
  const [exams, setExams] = useState([]);
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const debug = (...args) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  };

  const getTvs = async () => {
    debug('[EXAM_PIN] ExamPinPage: fetching providers', {
      hasToken: Boolean(token),
    });
    const response = await GetExamPinProviders({
      token,
    });

    debug('[EXAM_PIN] ExamPinPage: providers fetched', {
      status: response?.status,
      message: response?.message,
      count: Array.isArray(response?.response) ? response.response.length : 0,
    });
    if (response.status === 'success') {
      const data = [];
      response.response.map((item) =>
        item.providerStatus.toLowerCase() === 'on'
          ? data.push(item.provider)
          : null
      );

      setExams(response?.response);
      setProviders(data);
    }
  };

  useEffect(() => {
    const selectedExam = exams.find((item) => item.provider === selectedItem);

    setAmount(selectedExam?.price * parseInt(quantity) || '');
  }, [selectedItem, quantity]);

  useEffect(() => {
    getTvs();
  }, []);

  const handleBuyExamPin = async () => {
    const selectedExam = exams.find((item) => item.provider === selectedItem);

    debug('[EXAM_PIN] ExamPinPage: proceed to confirm', {
      selectedItem,
      quantity,
      amount,
      selectedExam,
    });
    // navigation.dispatch(StackActions.popToTop());
    navigation.navigate('examModal', {
      exam: selectedExam,
      quantity,
      amount,
    });
  };

  return (
    <View style={styles.container}>
      <SecondaryHeader text="Buy Exam Pin" />
      <ScrollView>
        <Dropdown
          text="Select Exam"
          data={providers}
          onSelectItem={setSelectedItem}
        />
        {amount && (
          <Title
            text={`Amount: ${amount}`}
            position="left"
            small
            bold
            color={theme.palette.grayDark}
          />
        )}
        <CashbackHint service="exam" amount={amount} />
        <MyInput
          text="Quantity"
          icon="wallet"
          value={quantity}
          type="number-pad"
          onChangeText={(text) => setQuantity(text)}
        />
        <MyButton
          text="Proceed"
          onPress={handleBuyExamPin}
          isLoading={loading}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: theme.window.windowWidth < 800 ? 10 : 20,
  },
});

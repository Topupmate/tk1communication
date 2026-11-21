import { useDispatch, useSelector } from 'react-redux';
import {
  Image,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import Modal from 'react-native-modal';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { useNavigation } from '@react-navigation/native';

import DropDown from '../../components/global/Dropdown';
import MyInput from '../../components/global/MyInput';
import MyButton from '../../components/global/Mybutton';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import GetUserPrice from '../../constants/GetUserPrice';
import Title from '../../components/global/Title';
import CashbackHint from '../../components/global/CashbackHint';
import { Theme } from '../../constants/Theme';
import TransparentButton from '../../components/global/TransParentButton';
import PayModel from '../../components/fund/PayMentModel';
import SelectContactButton from '../../components/global/SelectContactButton';
import {
  resetContactNumber,
  toggleDataModel,
} from '../../store/globalState';
import { pickNativeContactPhone } from '../../utils/nativeContactPicker';
import {
  GetCablePlans,
  GetCableProviders,
  VerifyCableNumber,
} from '../../store/apis/services';
import Row from '../../components/global/Row';
import { createScopedDebugger } from '../../utils/debugScopes';

const theme = Theme();
const __tvDebug = createScopedDebugger('TV');
const __iucLast4 = (v) => (v ? String(v).replace(/\s+/g, '').slice(-4) : '');

const TvSubscriptionsPage = () => {
  const { token, user, contact } = useSelector((state) => state.globalState);
  const navigation = useNavigation();
  const [cableProviders, setCableProviders] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [plan, setPlan] = useState([]);
  const [data, setData] = useState({ cableProviders: [], plan: [] });
  const [cardNumber, setCardNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState([]);
  const [transferData, setTransferData] = useState(null);
  const dispatch = useDispatch();
  const [subType, setSubType] = useState('');

  const [verifiedNumber, setVerifiedNumber] = useState({
    verified: false,
    message: '',
    loading: false,
    fail: false,
  });

  const [showModel, setShowModel] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPlans, setFilterPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tvProviders, setTvProviders] = useState([]);

  const fetchData = async (apiFunction, setDataCallback) => {
    try {
      const t0 = Date.now();
      __tvDebug('[TV] fetchData start', {
        fn: apiFunction?.name,
      });
      const response = await apiFunction({
        token,
      });

      if (response.status === 'success') {
        setDataCallback(response.response);
      }
      __tvDebug('[TV] fetchData done', {
        fn: apiFunction?.name,
        ms: Date.now() - t0,
        status: response?.status,
        message: response?.message,
        count: Array.isArray(response?.response) ? response.response.length : undefined,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      __tvDebug('[TV] fetchData error', {
        fn: apiFunction?.name,
        message: error?.message,
        name: error?.name,
      });
    }
  };

  const getCableProviders = () =>
    fetchData(GetCableProviders, (response) => {
      const cableProviderNames = response.map((item) => {
        // console.log(item);
        setTvProviders((prev) => [...prev, item]);
        return item.provider;
      });
      setCableProviders(cableProviderNames);
      setData((prev) => ({ ...prev, cableProviders: response }));
    });

  const getCablePlans = () =>
    fetchData(GetCablePlans, (response) => {
      setData((prev) => ({ ...prev, plan: response }));
    });

  useEffect(() => {
    __tvDebug('[TV] screen mount', {
      screen: 'TvSubscriptionsPage',
    });
    getCableProviders();
    getCablePlans();
  }, []);

  useEffect(() => {
    if (!selectedItem) {
      setPlan([]);
      return;
    }

    const plans = data.plan.filter(
      (it) => it.provider.toLowerCase() === selectedItem.toLowerCase()
    );

    setPlan(plans);
  }, [selectedItem, data]);

  useEffect(() => {
    setVerifiedNumber((prev) => ({
      ...prev,
      verified: false,
      message: '',
      fail: false,
    }));
  }, [cardNumber]);

  useEffect(() => {
    const filteredPlans = plan.filter((item) => {
      const s = search.toLocaleLowerCase();
      return (
        item?.name.toLowerCase().includes(s) ||
        item?.day.toLowerCase().includes(s)
      );
    });
    setFilterPlans(filteredPlans);
  }, [search, plan]);

  function handleChange(t) {
    setCardNumber(t);
  }

  const handleProceed = async () => {
    __tvDebug('[TV] proceed pressed', {
      selectedItem,
      hasCardNumber: Boolean(cardNumber && String(cardNumber).trim()),
      cardLast4: __iucLast4(cardNumber),
      subType,
      selectedPlanId: selectedPlan?.planid,
      selectedPlanName: selectedPlan?.name,
    });
    if (!selectedItem || !cardNumber || !subType) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'All fields are require',

        button: 'close',
      });
      return;
    }

    setLoading(true);

    const cableId = tvProviders.find(
      (item) => item.provider === selectedItem
    )?.cId;
    __tvDebug('[TV] verifying card number', {
      selectedItem,
      cableId,
      cardLast4: __iucLast4(cardNumber),
      subType,
      selectedPlanId: selectedPlan?.planid,
    });
    const cardVerification = await VerifyCableNumber({
      token,
      cablename: cableId,
      iucnumber: cardNumber,
    });
    setLoading(false);
    __tvDebug('[TV] verify result', {
      status: cardVerification?.status,
      message: cardVerification?.message,
      code: cardVerification?.code,
      hasResponse: Boolean(cardVerification?.response),
    });

    if (cardVerification.status !== 'success') {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Validation Fail',
        textBody: cardVerification.message,
        button: 'close',
      });
      return;
    }

    const userInfo = cardVerification.response;
    __tvDebug('[TV] selected plan snapshot', {
      planid: selectedPlan?.planid,
      name: selectedPlan?.name,
      day: selectedPlan?.day,
      cpId: selectedPlan?.cpId,
      cId: selectedPlan?.cId,
    });
    const selectedPlanAmount = GetUserPrice({ user, item: selectedPlan });
    setTransferData({
      type: 'tv subscription',
      ref: userInfo?.ref,
      name: userInfo?.name,
      cardNumber,
      cablename: selectedItem,
      // planid is the provider "package code" used by the backend to locate the package
      plan: selectedPlan?.planid,
      planName: selectedPlan?.name,
      amount: selectedPlanAmount,
      cableId,
      subType,
      cpId: selectedPlan?.cpId,
      cId: selectedPlan.cId,
    });

    dispatch(toggleDataModel());
  };

  const renderItem = useCallback(({ item }) => {
    const price = GetUserPrice({ user, item });
    return (
      <TouchableOpacity
        style={{
          padding: 10,
          borderBottomColor: theme.palette.gray,
          borderBottomWidth: 1,
        }}
        onPress={() => {
          setSelectedPlan(item);
          setShowModel(false);
        }}
      >
        <Title
          text={`${item?.name} - ₦${price} ${item?.day} Days`}
          position="left"
          bold
        />
        <CashbackHint service="cable" plan={item} />
      </TouchableOpacity>
    );
  }, []);

  useEffect(() => {
    if (contact?.selectedItem) {
      setSelectedItem(contact?.selectedItem);
    }

    if (contact?.selectedPlan) {
      setSelectedPlan(contact?.selectedPlan);
    }

    if (contact?.number) {
      setCardNumber(contact?.number);
    }

    dispatch(resetContactNumber());
  }, []);

  const handleSelectContact = async () => {
    try {
      __tvDebug('[TV] open contact picker', {});
      const result = await pickNativeContactPhone();
      if (result?.number) {
        __tvDebug('[TV] contact selected', {
          cardLast4: __iucLast4(result.number),
        });
        setCardNumber(result.number);
      }
    } catch (err) {
      // User cancelled or permission denied
      __tvDebug('[TV] contact picker cancelled/failed', {
        message: err?.message,
        name: err?.name,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
        <SecondaryHeader text="Tv Subscriptions" />
        {/* <TvsSection /> */}
        {/* <Title text="📺" style={{ fontSize: 100 }} /> */}
        <Row style={styles.imageContainer}>
          <Image
            source={require('../../assets/tvs/dstv.png')}
            style={styles.image}
          />
          <Image
            source={require('../../assets/tvs/gotv.png')}
            style={styles.image}
          />
          <Image
            source={require('../../assets/tvs/startimes.png')}
            style={styles.image}
          />
        </Row>
        <SelectContactButton
          onPress={handleSelectContact}
          text="Select Card Number"
        />
        <DropDown
          text={selectedItem ? selectedItem : 'Cable Providers'}
          data={cableProviders}
          onSelectItem={setSelectedItem}
          iconName="tv-outline"
        />
        <DropDown
          text={subType ? subType : 'Subscription Type'}
          data={['Renew', 'Change']}
          onSelectItem={setSubType}
        />
        <TransparentButton
          text={
            selectedPlan.name
              ? `${selectedPlan?.name} - ${selectedPlan?.day} Days`
              : 'Select Plan'
          }
          onPress={() => {
            setShowModel(true);
          }}
        />

        <View>
          <MyInput
            text="Card Number"
            icon="wallet"
            value={cardNumber}
            onChangeText={handleChange}
            type="numeric"
            style={{ marginTop: 10 }}
          />
        </View>

        <MyButton
          text="Proceed"
          style={styles.button}
          onPress={handleProceed}
          isLoading={loading}
        />
        </ScrollView>
      <Modal
        isVisible={showModel}
        onBackdropPress={() => setShowModel(false)}
        onSwipeComplete={() => setShowModel(false)}
        swipeDirection={['down']}
        style={styles.modal}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.contentContainer}>
          <MyInput
            text="Search Plan"
            icon="search"
            style={{ marginBottom: 10 }}
            onChangeText={(t) => setSearch(t)}
            value={search}
            maxLength={10}
          />
          <FlatList
            data={filterPlans}
            renderItem={renderItem}
            keyExtractor={(item) => item.planid}
            style={{
              maxHeight: theme.window.windowHeight / 1.5,
              marginBottom: 30,
            }}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </Modal>
      <PayModel data={transferData} />
      </View>
    </KeyboardAvoidingView>
  );
};

export default TvSubscriptionsPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    minHeight: theme.window.windowHeight,
    backgroundColor: theme.palette.white,
  },
  fail: {
    borderColor: 'red',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  contentContainer: {
    backgroundColor: '#fefefe',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    height: 100,
    width: 100,
    resizeMode: 'contain',
  },
  imageContainer: {
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

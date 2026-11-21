import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import { useCallback, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-native-modal';
import Dropdown from '../../components/global/Dropdown';
import MyInput from '../../components/global/MyInput';
import CashbackHint from '../../components/global/CashbackHint';
import MyButton from '../../components/global/Mybutton';
import {
  GetElectricityProviders,
  VerifyMeterNumber,
} from '../../store/apis/services';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import { Theme } from '../../constants/Theme';
import TransparentButton from '../../components/global/TransParentButton';
import Title from '../../components/global/Title';
import PayModel from '../../components/fund/PayMentModel';
import {
  resetContactNumber,
  toggleDataModel,
} from '../../store/globalState';
import SelectContactButton from '../../components/global/SelectContactButton';
import { pickNativeContactPhone } from '../../utils/nativeContactPicker';

const theme = Theme();

const __debug = (...args) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};

export default function ElectricBill() {
  const [providers, setProviders] = useState([]);
  const { token, user, contact } = useSelector((state) => state.globalState);
  const [selectedItem, setSelectedItem] = useState(null);
  const [type, setSelectedType] = useState(null);
  const [meterNumber, setMeterNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [states, setStates] = useState([]);
  const typaData = ['Postpaid', 'Prepaid'];
  const [transferData, setTransferData] = useState({ type: 'electricity' });
  const dispatch = useDispatch();

  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(
      states.filter((item) => item.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, states]);

  const renderItem = useCallback(({ item }) => {
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => {
          __debug('[ELECTRICITY][UI] Provider selected from list', { provider: item });
          setSelectedItem(item);
          setIsBottomSheetVisible(false);
        }}
      >
        <Title text={item} position="left" bold />
      </TouchableOpacity>
    );
  }, []);

  const getTvs = async () => {
    const t0 = Date.now();
    __debug('[ELECTRICITY][UI] Fetch providers start', {
      hasToken: Boolean(token),
      screen: 'ElectricBill',
    });
    const response = await GetElectricityProviders({
      token,
    });

    __debug('[ELECTRICITY][UI] Fetch providers end', {
      ms: Date.now() - t0,
      status: response?.status,
      message: response?.message,
      count: Array.isArray(response?.response) ? response.response.length : undefined,
      raw: response,
    });

    if (response.status === 'success') {
      const data = [];
      response.response.map((item) => {
        data.push(item.provider);
      });

      setProviders(response?.response);
      setStates(data);
      setError('');
    } else {
      setError(response?.message || 'Unable to load providers. Please try again.');
    }
  };

  useEffect(() => {
    __debug('[ELECTRICITY][UI] Screen mounted', {
      userPhone: user?.phone,
      hasToken: Boolean(token),
    });
    getTvs();
  }, []);

  const handleMeterNumberChange = (text) => {
    __debug('[ELECTRICITY][UI] Meter number changed', {
      length: text?.length,
      last4: text ? String(text).slice(-4) : '',
    });
    setMeterNumber(text);
  };

  const hasProviders = Array.isArray(providers) && providers.length > 0;
  const canConfirm =
    !loading &&
    Boolean(amount && String(amount).trim()) &&
    Boolean(selectedItem) &&
    Boolean(type) &&
    Boolean(meterNumber && String(meterNumber).trim()) &&
    hasProviders;

  const handlePurchase = async () => {
    const attemptId = `ELEC_VERIFY_${Date.now()}`;
    __debug('[ELECTRICITY][UI] Confirm pressed (start verify)', {
      attemptId,
      selectedProviderName: selectedItem,
      type,
      meterNumberLast4: meterNumber ? String(meterNumber).slice(-4) : '',
      amount,
    });

    if (!amount || !selectedItem || !type || !meterNumber) {
      __debug('[ELECTRICITY][UI] Missing fields', {
        attemptId,
        hasAmount: Boolean(amount),
        hasSelectedProvider: Boolean(selectedItem),
        hasType: Boolean(type),
        hasMeterNumber: Boolean(meterNumber),
      });
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'All fields are required',
        button: 'close',
      });
      return;
    }
    const st = providers.find((item) => item.provider === selectedItem);
    if (!st?.eId) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Provider not found',
        textBody: 'Please re-select a provider and try again.',
        button: 'close',
      });
      return;
    }
    __debug('[ELECTRICITY][UI] Resolved provider meta', {
      attemptId,
      selectedItem,
      providerId: st?.eId,
      providerName: st?.provider,
      metertype: type?.toLowerCase(),
    });
    setLoading(true);
    const t0 = Date.now();
    const response = await VerifyMeterNumber({
      token,
      meternumber: meterNumber,
      provider: st.eId,
      metertype: type.toLowerCase(),
    });
    setLoading(false);
    __debug('[ELECTRICITY][UI] VerifyMeterNumber finished', {
      attemptId,
      ms: Date.now() - t0,
      status: response?.status,
      message: response?.message,
      raw: response,
    });

    if (response.status !== 'success') {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Validation Fail',
        textBody: response.message,
        button: 'close',
      });
      return;
    }

    const userInfo = response.response;
    __debug('[ELECTRICITY][UI] Meter verified (building transferData)', {
      attemptId,
      name: userInfo?.name,
      ref: userInfo?.ref,
      providerName: st?.provider,
      providerId: st?.eId,
      meterNumberLast4: meterNumber ? String(meterNumber).slice(-4) : '',
      amount,
      metertype: type?.toLowerCase(),
      rawUserInfo: userInfo,
    });

    setTransferData({
      type: 'electricity',
      amount,
      meternumber: meterNumber,
      provider: st.eId,
      metertype: type.toLowerCase(),
      ref: userInfo?.ref,
      name: userInfo?.name,
      providerName: st?.provider,
    });

    __debug('[ELECTRICITY][UI] Opening payment modal', { attemptId });
    dispatch(toggleDataModel());

    return;
  };

  useEffect(() => {
    if (contact) {
      __debug('[ELECTRICITY][UI] Pre-filling from contact state', {
        amount: contact?.amount,
        selectedItem: contact?.selectedItem,
        type: contact?.type,
        numberLast4: contact?.number ? String(contact.number).slice(-4) : '',
      });
      setAmount(contact?.amount);
      setSelectedItem(contact?.selectedItem);
      setSelectedType(contact?.type);
      setMeterNumber(contact?.number);
    }
    dispatch(resetContactNumber());
  }, []);

  const handleSelectContact = async () => {
    try {
      __debug('[ELECTRICITY][UI] Select meter number pressed');
      const result = await pickNativeContactPhone();
      __debug('[ELECTRICITY][UI] Contact picker result', {
        hasNumber: Boolean(result?.number),
        numberLast4: result?.number ? String(result.number).slice(-4) : '',
      });
      if (result?.number) setMeterNumber(result.number);
    } catch (err) {
      __debug('[ELECTRICITY][UI] Contact picker error/cancel', {
        message: err?.message,
        name: err?.name,
      });
      // User cancelled or permission denied
    }
  };

  return (
    <>
      <View style={styles.container}>
        <SecondaryHeader text={'Electric Bill'} />
        
        <SelectContactButton
          onPress={handleSelectContact}
          text="Select Meter Number"
        />

        <TransparentButton
          text={selectedItem || 'Select Provider'}
          onPress={() => setIsBottomSheetVisible(true)}
        />

        <Dropdown
          text={type || 'Select Type'}
          data={typaData}
          onSelectItem={setSelectedType}
        />

        <MyInput
          text="Meter Number"
          icon="call"
          value={meterNumber}
          onChangeText={handleMeterNumberChange}
          type="phone-pad"
        />
        
        <MyInput
          text="Amount"
          icon="wallet"
          value={amount}
          onChangeText={setAmount}
          type="number-pad"
        />
        <CashbackHint service="electricity" amount={amount} />

        {!!error && (
          <View style={styles.errorBox}>
            <Title text={error} small color={theme.palette.red} />
          </View>
        )}

        {!hasProviders && !error && (
          <View style={styles.infoBox}>
            <Title text="Loading providers..." small />
          </View>
        )}

        {!hasProviders && !!error && (
          <MyButton
            text="Retry loading providers"
            onPress={getTvs}
            background={theme.palette.gray}
            style={styles.retryButton}
          />
        )}

        <MyButton
          text={canConfirm ? 'Confirm & Validate Meter' : 'Fill all fields to continue'}
          icon="call"
          onPress={canConfirm ? handlePurchase : undefined}
          isLoading={loading}
          background={canConfirm ? theme.palette.primary : theme.palette.gray}
          style={{ opacity: canConfirm ? 1 : 0.85 }}
        />
      </View>

      <Modal
        isVisible={isBottomSheetVisible}
        onBackdropPress={() => setIsBottomSheetVisible(false)}
        onSwipeComplete={() => setIsBottomSheetVisible(false)}
        swipeDirection={['down']}
        style={styles.modal}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.contentContainer}>
          <View style={styles.modalHeaderRow}>
            <Title text="Select Provider" bold />
            <TransparentButton
              text="Close"
              style={styles.closeBtn}
              onPress={() => setIsBottomSheetVisible(false)}
            />
          </View>
          
          <MyInput
            text="Search Provider"
            icon="search"
            style={styles.searchInput}
            onChangeText={setSearch}
            value={search}
            maxLength={10}
          />
          
          {data?.length === 0 && (
            <View style={styles.emptyState}>
              <Title
                text={search ? 'No provider matches your search.' : 'No providers available.'}
                small
              />
              <Title
                text="Try clearing the search or reload providers."
                small
                style={styles.emptySubtext}
              />
            </View>
          )}
          
          <FlatList
            data={data}
            keyExtractor={(item) => item}
            renderItem={renderItem}
            style={styles.providerList}
          />
        </View>
      </Modal>

      <PayModel data={transferData} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: theme.window.windowWidth * 0.05,
  },
  infoBox: {
    paddingVertical: 10,
  },
  errorBox: {
    backgroundColor: 'rgba(255,0,0,0.06)',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  retryButton: {
    marginTop: 10,
    marginBottom: 10,
  },
  listItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomColor: theme.palette.gray,
    borderBottomWidth: 1,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  contentContainer: {
    backgroundColor: '#fff',
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
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  closeBtn: {
    width: 90,
    height: 36,
    borderRadius: 10,
  },
  searchInput: {
    marginBottom: 16,
  },
  emptyState: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  emptySubtext: {
    marginTop: 6,
    opacity: 0.75,
  },
  providerList: {
    maxHeight: theme.window.windowHeight / 1.5,
    marginBottom: 20,
  },
});

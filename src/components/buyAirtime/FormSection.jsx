import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import MyInput from '../global/MyInput';
import MyButton from '../global/Mybutton';
import { toggleModal } from '../../store/globalState';
import { Theme } from '../../constants/Theme';
import Dropdown from '../global/Dropdown';
import PaymentModal from './PaymentModal';
import Title from '../global/Title';
import Row from '../global/Row';
import SelectContactButton from '../global/SelectContactButton';
import { pickNativeContactPhone } from '../../utils/nativeContactPicker';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import NetworkStatusButton from '../global/NetworkStatusButton';
import CashbackHint from '../global/CashbackHint';
import { createScopedDebugger } from '../../utils/debugScopes';

const theme = Theme();
const __buyAirtimeDebug = createScopedDebugger('BUY_AIRTIME');
const __phoneLast4 = (p) => (p ? String(p).replace(/\s+/g, '').slice(-4) : '');

const FormSection = ({ network: net }) => {
  const dispatch = useDispatch();
  const [selectedOption, setSelectedOption] = useState(null);
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const navigation = useNavigation();
  const [network, setNetwork] = useState(0);
  const [data, setData] = useState([]);
  const { netWorkSettings, contact } = useSelector(
    (state) => state.globalState
  );

  useEffect(() => {
    const newType = netWorkSettings
      .filter((dataItem) => parseInt(dataItem.nId) === network)
      .map((dataItem) => {
        const n = [];
        if (dataItem.vtuStatus === 'On') {
          n.push('VTU');
        }
        if (dataItem.sharesellStatus === 'On') {
          n.push('Share And Sell');
        }
        if (dataItem.momoStatus === 'On') {
          n.push('Momo');
        }

        return n;
      })
      .flat();

    setData(newType);
    __buyAirtimeDebug('[BUY_AIRTIME] step: network types resolved', {
      network,
      availableTypes: newType,
    });
  }, [network, netWorkSettings]);

  const [error, setError] = useState({
    phone: '',
    amount: '',
    option: '',
  });

  const clearError = (field) => {
    setError((prevErrors) => ({ ...prevErrors, [field]: '' }));
  };

  const validateAndToggleModal = () => {
    __buyAirtimeDebug('[BUY_AIRTIME] step: proceed pressed', {
      network,
      selectedOption,
      amount,
      phoneLast4: __phoneLast4(phone),
    });
    const errors = {};

    if (amount.trim() === '') {
      errors.amount = 'Amount cannot be empty';
    }

    if (phone.trim() === '') {
      errors.phone = 'Phone Number cannot be empty';
    }

    if (!selectedOption) {
      errors.option = 'Please Select Airtime type';
    }

    if (network === 0) {
      __buyAirtimeDebug('[BUY_AIRTIME] validation failed: missing network', {
        selectedOption,
        amount,
        phoneLast4: __phoneLast4(phone),
      });
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Payment Fail',
        textBody: 'Please Select Network Provider',
        button: 'close',
      });
      return;
    }
    setError(errors);

    if (Object.keys(errors).length === 0) {
      __buyAirtimeDebug('[BUY_AIRTIME] validation ok: opening payment modal', {
        network,
        selectedOption,
        amount,
        phoneLast4: __phoneLast4(phone),
      });
      dispatch(toggleModal());
    } else {
      __buyAirtimeDebug('[BUY_AIRTIME] validation failed', {
        errors,
        network,
        selectedOption,
        amount,
        phoneLast4: __phoneLast4(phone),
      });
    }
  };

  useEffect(() => {
    if (selectedOption) {
      clearError('option');
    }
  }, [selectedOption]);

  function handleUtility(item) {
    setAmount(item);
  }

  useEffect(() => {
    setNetwork(net);
  }, [net]);

  useEffect(() => {
    if (contact?.network) {
      setNetwork(contact?.network);
    }
    if (contact?.amount) {
      setAmount(contact?.amount);
    }
    if (contact?.selectedOption) {
      setSelectedOption(contact?.selectedOption);
    }
    if (contact?.number) {
      setPhone(contact?.number);
    }
  }, []);

  const handleSelectContact = async () => {
    try {
      __buyAirtimeDebug('[BUY_AIRTIME] step: open contact picker', {});
      const result = await pickNativeContactPhone();
      if (result?.number) {
        __buyAirtimeDebug('[BUY_AIRTIME] step: contact selected', {
          phoneLast4: __phoneLast4(result.number),
        });
        setPhone(result.number);
      } else {
        __buyAirtimeDebug('[BUY_AIRTIME] step: contact picker returned no number', {
          resultKeys: result ? Object.keys(result) : [],
        });
      }
    } catch (err) {
      // User cancelled or permission denied
      __buyAirtimeDebug('[BUY_AIRTIME] step: contact picker cancelled/failed', {
        message: err?.message,
        name: err?.name,
      });
    }
  };

  return (
    <View style={styles.container}>
      <SelectContactButton onPress={handleSelectContact} />
      <MyInput
        text="Phone Number"
        icon="call"
        type={'phone-pad'}
        value={phone}
        onChangeText={(text) => {
          clearError('phone');
          setPhone(text);
        }}
        error={error.phone}
      />
      {network >= 1 && (
        <Dropdown
          data={data}
          onSelectItem={(item) => {
            __buyAirtimeDebug('[BUY_AIRTIME] step: airtime type selected', {
              network,
              selectedOption: item,
            });
            setSelectedOption(item);
          }}
          text={selectedOption ? selectedOption : 'Airtime type'}
          error={error.option}
        />
      )}
      {selectedOption && (
        <>
          <View style={{ marginVertical: 20 }}>
            <Row style={styles.utilityRow}>
              <UtilityItem handleUtility={handleUtility} text="50" />
              <UtilityItem handleUtility={handleUtility} text="100" />
              <UtilityItem handleUtility={handleUtility} text="200" />
              <UtilityItem handleUtility={handleUtility} text="500" />
            </Row>
            <Row style={styles.utilityRow}>
              <UtilityItem handleUtility={handleUtility} text="1000" />
              <UtilityItem handleUtility={handleUtility} text="2000" />
              <UtilityItem handleUtility={handleUtility} text="5000" />
              <UtilityItem handleUtility={handleUtility} text="8000" />
            </Row>
          </View>
          <MyInput
            text="Amount"
            icon="wallet"
            value={amount}
            type="number-pad"
            style={styles.input}
            onChangeText={(text) => {
              clearError('amount');
              setAmount(text);
            }}
            error={error.amount}
          />
          <CashbackHint service="airtime" amount={amount} />
        </>
      )}
      <NetworkStatusButton />
      <MyButton text="Proceed" onPress={validateAndToggleModal} />
      <PaymentModal
        network={network}
        selectedOption={selectedOption}
        phone={phone}
        amount={amount}
      />
    </View>
  );
};

export default FormSection;

const styles = StyleSheet.create({
  container: {
    paddingTop: theme.window.windowWidth > 600 ? 20 : 0,
  },
  utilityContainer: {
    backgroundColor: theme.palette.white,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    paddingVertical: 12,
    width: theme.window.windowWidth / 4.5,
    borderWidth: 2,
    borderColor: theme.palette.gray,
  },
  utilityRow: {
    justifyContent: 'space-between',
  },
  input: {
    marginTop: -40,
    marginBottom: 15,
  },
});

function UtilityItem({ text, handleUtility }) {
  return (
    <TouchableOpacity
      onPress={() => handleUtility(text)}
      style={styles.utilityContainer}
    >
      <Title text={`₦${text}`} bold color={theme.palette.grayDark} />
    </TouchableOpacity>
  );
}

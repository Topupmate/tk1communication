import { ScrollView, StyleSheet, View } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

import { Theme } from '../../constants/Theme';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import Title from '../../components/global/Title';
import MyInput from '../../components/global/MyInput';
import MyButton from '../../components/global/Mybutton';
import TransparentButton from '../../components/global/TransParentButton';
import Dropdown from '../../components/global/Dropdown';
import Row from '../../components/global/Row';
import Loader from '../../components/loading/Loading';
import PayModel from '../../components/fund/PayMentModel';
import { GetStoreDetails } from '../../store/apis/store';
import { toggleDataModel } from '../../store/globalState';
import formatMoney from '../../constants/FormatNumber';
import { getDeliveryFeeForState } from '../../constants/StoreHelpers';
import { normalizePhoneNumber } from '../../constants/PhoneNumberUtils';

const theme = Theme();

const StoreCheckout = () => {
  const dispatch = useDispatch();
  const { product: passedProduct } = useRoute().params || {};
  const { token, user } = useSelector((state) => state.globalState);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [fees, setFees] = useState([]);
  const [quantity, setQuantity] = useState('1');
  const [customerName, setCustomerName] = useState(
    `${user?.firstname || ''} ${user?.lastname || ''}`.trim()
  );
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [stateName, setStateName] = useState(user?.state || '');
  const [notes, setNotes] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [data, setData] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const response = await GetStoreDetails({ token });
      if (response?.status === 'success') {
        setSettings(response.response?.settings || null);
        setFees(response.response?.deliveryFees || []);
      }
      setLoading(false);
    };
    load();
  }, [token]);

  const stateLabels = useMemo(
    () => (fees || []).map((f) => f.state_name).filter(Boolean),
    [fees]
  );

  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const unitPrice = parseFloat(passedProduct?.p_price) || 0;
  const subtotal = unitPrice * qty;
  const deliveryFee = getDeliveryFeeForState(fees, stateName);
  const total = subtotal + (Number.isNaN(deliveryFee) ? 0 : deliveryFee);

  const handleContinue = () => {
    const phone = normalizePhoneNumber(customerPhone);
    if (
      !passedProduct?.p_id ||
      !customerName.trim() ||
      !phone ||
      !address.trim() ||
      !stateName
    ) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Submit Error',
        textBody: 'Please fill in name, phone, address and destination state',
        button: 'close',
      });
      return;
    }

    const wallet = parseFloat(user?.wallet) || 0;
    if (total > wallet) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Insufficient wallet',
        textBody: `This order is ₦${formatMoney(total)} but your wallet balance is ₦${formatMoney(wallet)}`,
        button: 'close',
      });
      return;
    }

    setData({
      type: 'store order',
      product_id: passedProduct.p_id,
      productName: passedProduct.p_name,
      quantity: qty,
      customer_name: customerName.trim(),
      customer_phone: phone,
      delivery_address: address.trim(),
      destination_state: stateName,
      delivery_notes: notes.trim(),
      amount: subtotal,
      delivery_fee: deliveryFee,
      total,
    });
    dispatch(toggleDataModel());
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SecondaryHeader text="Checkout" />
        <View style={styles.centered}>
          <Loader />
        </View>
      </View>
    );
  }

  const terms = String(settings?.store_terms || '')
    .replace(/\\r\\n/g, '\n')
    .replace(/\r\n/g, '\n');

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SecondaryHeader text="Checkout" />
        <Title
          text={passedProduct?.p_name}
          bold
          position="left"
          style={styles.product}
        />
        <Title
          text={`₦${formatMoney(unitPrice)} each`}
          small
          position="left"
          color={theme.palette.grayDark}
        />

        <Title text="Quantity" bold position="left" style={styles.label} />
        <MyInput
          text="Quantity"
          icon="layers-outline"
          type="number-pad"
          value={quantity}
          onChangeText={setQuantity}
        />
        <Title text="Full name" bold position="left" style={styles.label} />
        <MyInput
          text="Customer name"
          icon="person-outline"
          value={customerName}
          onChangeText={setCustomerName}
        />
        <Title text="Phone" bold position="left" style={styles.label} />
        <MyInput
          text="Phone number"
          icon="call-outline"
          type="phone-pad"
          value={customerPhone}
          onChangeText={setCustomerPhone}
        />
        <Title text="Delivery address" bold position="left" style={styles.label} />
        <MyInput
          text="Street address"
          icon="home-outline"
          value={address}
          onChangeText={setAddress}
        />
        <Title text="Destination state" bold position="left" style={styles.label} />
        <Dropdown
          data={stateLabels.length ? stateLabels : ['No delivery states']}
          text={stateName || 'Choose state'}
          onSelectItem={setStateName}
        />
        <Title text="Delivery notes (optional)" bold position="left" style={styles.label} />
        <MyInput
          text="Landmark, extra instructions"
          icon="create-outline"
          value={notes}
          onChangeText={setNotes}
        />

        <View style={styles.summary}>
          <Row style={styles.summaryRow}>
            <Title text="Subtotal" />
            <Title text={`₦${formatMoney(subtotal)}`} bold />
          </Row>
          <Row style={styles.summaryRow}>
            <Title text="Delivery" />
            <Title text={`₦${formatMoney(deliveryFee || 0)}`} bold />
          </Row>
          <Row style={styles.summaryRow}>
            <Title text="Total" bold />
            <Title text={`₦${formatMoney(total)}`} bold color={theme.palette.primary} />
          </Row>
        </View>

        {terms ? (
          <>
            <TransparentButton
              text={showTerms ? 'Hide store terms' : 'View store terms'}
              onPress={() => setShowTerms((v) => !v)}
            />
            {showTerms ? (
              <Title text={terms} position="left" small style={styles.terms} />
            ) : null}
          </>
        ) : null}

        <MyButton text="Pay from wallet" onPress={handleContinue} />
      </ScrollView>
      <PayModel data={data} />
    </View>
  );
};

export default StoreCheckout;

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
  product: {
    marginTop: 4,
    letterSpacing: 0,
    textTransform: 'none',
  },
  label: {
    marginTop: 10,
    marginBottom: 4,
  },
  summary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    marginBottom: 8,
  },
  summaryRow: {
    justifyContent: 'space-between',
    marginTop: 6,
  },
  terms: {
    marginBottom: 12,
    letterSpacing: 0,
    lineHeight: 20,
  },
});

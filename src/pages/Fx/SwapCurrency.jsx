import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

import { Theme } from '../../constants/Theme';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import Title from '../../components/global/Title';
import Row from '../../components/global/Row';
import MyIcon from '../../components/global/MyIcon';
import MyInput from '../../components/global/MyInput';
import MyButton from '../../components/global/Mybutton';
import MyCard from '../../components/global/MyCard';
import { ConvertCurrency, GetFxRate } from '../../store/apis/fx';
import useSaveUser from '../../hooks/saveUser';
import {
  formatFxAmount,
  generateFxRef,
  getNgnBalance,
  getUsdBalance,
  normalizeFxQuote,
} from '../../constants/FxHelpers';

const theme = Theme();

const SwapCurrency = () => {
  const navigation = useNavigation();
  const { token, user } = useSelector((state) => state.globalState);
  const { getUserInfo } = useSaveUser();

  const [from, setFrom] = useState('NGN');
  const [to, setTo] = useState('USD');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [quoting, setQuoting] = useState(false);
  const [converting, setConverting] = useState(false);
  const refRef = useRef(null);

  const ngnBalance = getNgnBalance(user);
  const usdBalance = getUsdBalance(user);

  // Tracked against a wall-clock deadline so a backgrounded app never shows a
  // quote as still valid after the server-side window has closed.
  useEffect(() => {
    if (!expiresAt) return undefined;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        setQuote(null);
        setExpiresAt(null);
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const resetQuote = () => {
    setQuote(null);
    setExpiresAt(null);
    setSecondsLeft(0);
  };

  const handleFlip = () => {
    setFrom(to);
    setTo(from);
    setAmount('');
    resetQuote();
  };

  const availableBalance = from === 'NGN' ? ngnBalance : usdBalance;

  const handleGetRate = async () => {
    const parsed = parseFloat(amount);
    if (!amount || Number.isNaN(parsed) || parsed <= 0) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Invalid amount',
        textBody: `Enter the amount in ${from} you want to swap`,
        button: 'close',
      });
      return;
    }

    if (availableBalance !== null && parsed > availableBalance) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Insufficient balance',
        textBody: `You only have ${formatFxAmount(availableBalance, from)} available`,
        button: 'close',
      });
      return;
    }

    setQuoting(true);
    const ref = generateFxRef();
    refRef.current = ref;
    const response = await GetFxRate({
      token,
      amount: String(parsed),
      from,
      to,
      ref,
    });
    setQuoting(false);

    const normalized =
      response?.status === 'success' ? normalizeFxQuote(response) : null;

    if (!normalized) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Unable to get rate',
        textBody:
          response?.message || response?.msg || 'Could not fetch the exchange rate',
        button: 'close',
      });
      return;
    }

    setQuote(normalized);
    setSecondsLeft(normalized.expiresIn);
    setExpiresAt(Date.now() + normalized.expiresIn * 1000);
  };

  const handleConfirm = async () => {
    if (!quote) return;

    setConverting(true);
    const response = await ConvertCurrency({
      token,
      quote_id: quote.quoteId,
      sig: quote.sig,
    });
    setConverting(false);

    if (response?.status !== 'success') {
      resetQuote();
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Swap Failed',
        textBody:
          response?.message || response?.msg || 'Unable to complete the swap',
        button: 'close',
      });
      return;
    }

    const oldbal = from === 'NGN' ? user?.wallet : usdBalance;
    await getUserInfo();
    resetQuote();
    setAmount('');

    navigation.navigate('transaction status', {
      data: {
        message: response?.message || 'FX Converted successfully',
        status: response?.status,
        oldbal,
        ref: refRef.current,
        date: Date.now(),
        type: `Currency Swap (${from} → ${to})`,
        amount: quote.amountFrom,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SecondaryHeader text="Swap Currency" />

        <MyCard style={styles.balanceCard}>
          <Row style={styles.balanceRow}>
            <View style={styles.balanceBlock}>
              <Title
                text="NGN Balance"
                small
                position="left"
                color={theme.palette.grayDark}
              />
              <Title
                text={formatFxAmount(ngnBalance, 'NGN')}
                bold
                position="left"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.balanceAmount}
              />
            </View>
            <View style={styles.balanceBlock}>
              <Title
                text="USD Balance"
                small
                position="left"
                color={theme.palette.grayDark}
              />
              <Title
                text={usdBalance === null ? '—' : formatFxAmount(usdBalance, 'USD')}
                bold
                position="left"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.balanceAmount}
              />
            </View>
          </Row>
        </MyCard>

        <Row style={styles.directionRow}>
          <MyCard style={styles.currencyBox}>
            <Title text="From" small color={theme.palette.grayDark} />
            <Title text={from} bold header />
          </MyCard>
          <TouchableOpacity onPress={handleFlip} style={styles.flipButton}>
            <MyIcon name="swap-horizontal" color={theme.palette.white} />
          </TouchableOpacity>
          <MyCard style={styles.currencyBox}>
            <Title text="To" small color={theme.palette.grayDark} />
            <Title text={to} bold header />
          </MyCard>
        </Row>

        <Title
          text={`Amount (${from})`}
          bold
          position="left"
          style={styles.label}
        />
        <MyInput
          text={`Amount in ${from}`}
          icon="cash-outline"
          type="decimal-pad"
          value={amount}
          onChangeText={(value) => {
            setAmount(value);
            resetQuote();
          }}
        />

        {quote ? (
          <MyCard style={styles.quoteCard}>
            <Row style={styles.quoteLine}>
              <Title text="Rate" small color={theme.palette.grayDark} />
              <Title
                text={`1 ${quote.from} = ${quote.rate} ${quote.to}`}
                small
                bold
              />
            </Row>
            <Row style={styles.quoteLine}>
              <Title text="You swap" small color={theme.palette.grayDark} />
              <Title
                text={formatFxAmount(quote.amountFrom, quote.from)}
                small
                bold
              />
            </Row>
            <Row style={styles.quoteLine}>
              <Title text="You receive" small color={theme.palette.grayDark} />
              <Title
                text={formatFxAmount(quote.amountTo, quote.to)}
                small
                bold
                color={theme.palette.primary}
              />
            </Row>
            <Title
              text={`Rate expires in ${secondsLeft}s`}
              small
              color={secondsLeft <= 10 ? theme.palette.red : theme.palette.grayDark}
              style={styles.expiry}
            />
          </MyCard>
        ) : (
          <MyCard style={styles.infoCard}>
            <Title
              text="Rates are locked for 60 seconds once quoted. Confirm before the timer runs out."
              small
              position="left"
              color={theme.palette.grayDark}
            />
          </MyCard>
        )}

        {quote || converting ? (
          <MyButton
            text="Confirm Swap"
            onPress={handleConfirm}
            isLoading={converting}
          />
        ) : (
          <MyButton text="Get Rate" onPress={handleGetRate} isLoading={quoting} />
        )}
      </ScrollView>
    </View>
  );
};

export default SwapCurrency;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.window.windowWidth * 0.05,
    backgroundColor: '#F5F1F7',
  },
  balanceCard: {
    borderRadius: 12,
    marginBottom: 10,
  },
  balanceRow: {
    justifyContent: 'space-between',
  },
  balanceBlock: {
    flex: 1,
    marginRight: 10,
  },
  balanceAmount: {
    letterSpacing: 0,
  },
  directionRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  currencyBox: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
  },
  flipButton: {
    backgroundColor: theme.palette.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    ...theme.ShadowLight,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
  },
  infoCard: {
    borderRadius: 12,
    marginTop: 15,
  },
  quoteCard: {
    borderRadius: 12,
    marginTop: 15,
  },
  quoteLine: {
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  expiry: {
    marginTop: 4,
    textAlign: 'left',
  },
});

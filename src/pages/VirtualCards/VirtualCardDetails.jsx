import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import Clipboard from '@react-native-clipboard/clipboard';

import { Theme } from '../../constants/Theme';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import Title from '../../components/global/Title';
import Row from '../../components/global/Row';
import MyCard from '../../components/global/MyCard';
import MyIcon from '../../components/global/MyIcon';
import MyPressable from '../../components/global/MyPressable';
import Loader from '../../components/loading/Loading';
import VirtualCardFace from '../../components/virtualCards/VirtualCardFace';
import PayModel from '../../components/fund/PayMentModel';
import {
  FreezeVirtualCard,
  GetVirtualCardDetails,
  UnfreezeVirtualCard,
} from '../../store/apis/virtualCards';
import { GenerateRandomNumber } from '../../constants/GenerateRandomNumber';
import { toggleDataModel } from '../../store/globalState';
import {
  formatUsd,
  getCardDisplayStatus,
  getStatusColor,
  hasCardFields,
  isFrozen,
  isTerminated,
  normalizeVirtualCard,
} from '../../constants/VirtualCardHelpers';
import { logFeatures } from '../../utils/debugScopes';

const theme = Theme();

const QuickAction = ({ icon, label, color, onPress }) => (
  <MyPressable style={styles.quickAction} onPress={onPress}>
    <View style={[styles.quickCircle, { backgroundColor: color }]}>
      <MyIcon name={icon} size={22} color={theme.palette.white} />
    </View>
    <Title text={label} small color={theme.palette.grayDark} style={styles.quickLabel} />
  </MyPressable>
);

const ActionRow = ({ icon, label, color, done, disabled, last, onPress }) => (
  <TouchableOpacity
    style={[
      styles.actionRow,
      last && styles.actionRowLast,
      disabled && styles.actionRowDisabled,
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Row style={styles.actionRowInner}>
      <Row>
        <MyIcon
          name={done ? 'checkmark-circle-outline' : icon}
          size={20}
          color={color || theme.palette.primary}
        />
        <Title
          text={done ? 'Copied' : label}
          small
          position="left"
          color={color || theme.palette.black}
          style={styles.actionLabel}
        />
      </Row>
      <MyIcon name="chevron-forward" size={18} color={theme.palette.grayDark} />
    </Row>
  </TouchableOpacity>
);

const VirtualCardDetails = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { cardId, card: cardFromList, fees } = useRoute().params || {};
  const { token } = useSelector((state) => state.globalState);
  const [loading, setLoading] = useState(!cardFromList);
  const [actionLoading, setActionLoading] = useState(false);
  const [remoteCard, setRemoteCard] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [payData, setPayData] = useState({});

  const loadDetails = async () => {
    if (!cardFromList) setLoading(true);
    const response = await GetVirtualCardDetails({ token, card_id: cardId });

    // Stringified because RN's console collapses nested objects to [Object].
    logFeatures('VirtualCard', 'card details payload', {
      keys: Object.keys(response?.response || {}),
      usable: hasCardFields(response?.response),
      json: JSON.stringify(response?.response ?? null),
    });

    if (hasCardFields(response?.response)) {
      setRemoteCard(response.response);
    } else if (response?.status !== 'success' && !cardFromList) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: response?.message || 'Unable to load card details',
        button: 'close',
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDetails();
  }, [cardId]);

  const handleCopy = (key, value) => {
    if (!value) return;
    Clipboard.setString(String(value));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const details = normalizeVirtualCard(remoteCard, cardFromList);
  const status = details?.status;
  const terminated = isTerminated(status) || remoteCard?.terminate === true;
  const frozen = isFrozen(status);
  const statusLabel = getCardDisplayStatus(status);
  const statusColor = getStatusColor(status, theme);

  const handleFreezeToggle = async () => {
    setActionLoading(true);
    const ref = frozen
      ? `CARD_UNFREEZE_${GenerateRandomNumber()}_${Date.now()}`
      : `CARD_FREEZE_${GenerateRandomNumber()}_${Date.now()}`;
    const response = frozen
      ? await UnfreezeVirtualCard({ token, card_id: cardId, ref })
      : await FreezeVirtualCard({ token, card_id: cardId, ref });
    setActionLoading(false);

    if (response?.status !== 'success') {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Action Failed',
        textBody: response?.message || response?.msg || 'Please try again',
        button: 'close',
      });
      return;
    }

    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: 'Success',
      textBody: response?.message || response?.msg || 'Updated successfully',
      button: 'close',
    });
    loadDetails();
  };

  const handleTerminate = () => {
    setPayData({
      type: 'terminate virtual card',
      card_id: cardId,
      masked: details?.masked || details?.number,
      brand: details?.brand,
    });
    dispatch(toggleDataModel());
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SecondaryHeader text="Card Details" />
        <View style={styles.centered}>
          <Loader />
        </View>
      </View>
    );
  }

  if (!details?.cardId && !details?.number && !details?.masked) {
    return (
      <View style={styles.container}>
        <SecondaryHeader text="Card Details" />
        <View style={styles.centered}>
          <Title text="Card not found" header />
        </View>
      </View>
    );
  }

  const billing = details?.billing || {};

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <SecondaryHeader text="Card Details" />

        <VirtualCardFace
          brand={details?.brand}
          number={details?.number}
          last4={details?.last4}
          holder={details?.holder}
          expiry={details?.expiry}
          cvv={details?.cvv}
          revealed={revealed}
          dimmed={terminated || frozen}
        />

        <MyCard style={styles.balanceCard}>
          <Title
            text="Available Balance"
            small
            color={theme.palette.grayDark}
            style={styles.balanceLabel}
          />
          <Title
            text={
              details?.balance === undefined
                ? '—'
                : `$${formatUsd(details.balance)}`
            }
            bold
            numberOfLines={1}
            style={styles.balance}
          />
          <View style={[styles.statusChip, { backgroundColor: statusColor + '22' }]}>
            <Title text={statusLabel} small color={statusColor} />
          </View>
        </MyCard>

        <Row style={styles.actionsRow}>
          {!terminated && (
            <>
              <QuickAction
                icon="add"
                label="Fund"
                color={theme.palette.primary}
                onPress={() =>
                  navigation.navigate('virtual card topup', { cardId, fees })
                }
              />
              <QuickAction
                icon="arrow-down"
                label="Withdraw"
                color="#2e9e5b"
                onPress={() =>
                  navigation.navigate('virtual card withdraw', { cardId, fees })
                }
              />
            </>
          )}
          <QuickAction
            icon="time-outline"
            label="History"
            color="#7c4dff"
            onPress={() =>
              navigation.navigate('virtual card transactions', { cardId })
            }
          />
          <QuickAction
            icon={revealed ? 'eye-off-outline' : 'eye-outline'}
            label={revealed ? 'Hide' : 'Details'}
            color={theme.palette.secondary}
            onPress={() => setRevealed((v) => !v)}
          />
        </Row>

        <MyCard style={styles.section}>
          <ActionRow
            icon="copy-outline"
            label="Copy Card Number"
            done={copiedKey === 'number'}
            disabled={!details?.number}
            onPress={() => handleCopy('number', details?.number)}
          />
          <ActionRow
            icon="key-outline"
            label="Copy CVV"
            done={copiedKey === 'cvv'}
            disabled={!details?.cvv}
            last={terminated}
            onPress={() => handleCopy('cvv', details?.cvv)}
          />
          {!terminated && (
            <>
              <ActionRow
                icon={frozen ? 'lock-open-outline' : 'snow-outline'}
                label={frozen ? 'Unfreeze Card' : 'Freeze Card'}
                disabled={actionLoading}
                onPress={handleFreezeToggle}
              />
              <ActionRow
                icon="trash-outline"
                label="Terminate Card"
                color={theme.palette.red}
                last
                onPress={handleTerminate}
              />
            </>
          )}
        </MyCard>

        {Object.keys(billing).length > 0 && (
          <MyCard style={styles.section}>
            <Title text="Billing Address" bold position="left" style={styles.sectionTitle} />
            <Title
              text={billing?.address || '—'}
              small
              position="left"
              style={styles.infoLine}
            />
            <Title
              text={`${billing?.city || ''} ${billing?.state || ''} ${billing?.country || ''}`.trim()}
              small
              position="left"
              style={styles.infoLine}
            />
            <Title
              text={`Postal: ${billing?.postal_code || '—'}`}
              small
              position="left"
              style={styles.infoLine}
            />
          </MyCard>
        )}
      </ScrollView>
      <PayModel data={payData} />
    </View>
  );
};

export default VirtualCardDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.window.windowWidth * 0.05,
    backgroundColor: '#F5F1F7',
  },
  scroll: {
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    borderRadius: 14,
    marginTop: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  balanceLabel: {
    letterSpacing: 0,
  },
  balance: {
    fontSize: 30,
    marginVertical: 4,
    letterSpacing: 0,
  },
  statusChip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  actionsRow: {
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.ShadowLight,
  },
  quickLabel: {
    marginTop: 6,
    letterSpacing: 0,
  },
  section: {
    borderRadius: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  actionRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.palette.gray,
  },
  actionRowLast: {
    borderBottomWidth: 0,
  },
  actionRowDisabled: {
    opacity: 0.45,
  },
  actionRowInner: {
    justifyContent: 'space-between',
  },
  actionLabel: {
    marginLeft: 10,
    letterSpacing: 0,
  },
  infoLine: {
    marginBottom: 6,
    letterSpacing: 0,
  },
});

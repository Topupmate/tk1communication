import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { Theme } from '../../constants/Theme';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import Title from '../../components/global/Title';
import MyButton from '../../components/global/Mybutton';
import MyCard from '../../components/global/MyCard';
import MyIcon from '../../components/global/MyIcon';
import Loader from '../../components/loading/Loading';
import VirtualCardItem from '../../components/virtualCards/VirtualCardItem';
import { GetVirtualCards } from '../../store/apis/virtualCards';
import {
  isServiceOn,
  normalizeVirtualCardsResponse,
} from '../../constants/VirtualCardHelpers';
import { logFeatures } from '../../utils/debugScopes';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import Row from '../../components/global/Row';
import {
  formatFxAmount,
  getNgnBalance,
  getUsdBalance,
} from '../../constants/FxHelpers';

const theme = Theme();

const VirtualCards = () => {
  const navigation = useNavigation();
  const { token, user } = useSelector((state) => state.globalState);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cards, setCards] = useState([]);
  const [fees, setFees] = useState({});

  const loadCards = async ({ soft } = {}) => {
    if (soft) setRefreshing(true);
    else setLoading(true);

    logFeatures('VirtualCard', 'VirtualCards screen load', {});
    const response = await GetVirtualCards({ token });
    if (response?.status === 'success') {
      const normalized = normalizeVirtualCardsResponse(response);
      // Stringified because RN's console collapses nested objects to [Object].
      logFeatures('VirtualCard', 'cards list payload', {
        cardKeys: Object.keys(normalized.cards?.[0] || {}),
        json: JSON.stringify(normalized.cards ?? []),
      });
      setCards(normalized.cards);
      setFees(normalized.fees);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [token])
  );

  const serviceOn = isServiceOn(fees);
  const usdBalance = getUsdBalance(user);

  return (
    <View style={styles.container}>
      <SecondaryHeader text="Virtual Cards" />

      {loading ? (
        <View style={styles.centered}>
          <Loader />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadCards({ soft: true })}
            />
          }
        >
          {!serviceOn ? (
            <View style={styles.disabledBanner}>
              <MyIcon
                name="alert-circle-outline"
                size={18}
                color={theme.palette.red}
              />
              <Title
                text="Virtual card service is currently unavailable"
                small
                color={theme.palette.red}
                style={styles.bannerText}
              />
            </View>
          ) : null}

          <MyCard style={styles.balanceCard}>
            <Row style={styles.balanceRow}>
              <View style={styles.balanceStack}>
                <View>
                  <Title
                    text="NGN Balance"
                    small
                    position="left"
                    color={theme.palette.grayDark}
                  />
                  <Title
                    text={formatFxAmount(getNgnBalance(user), 'NGN')}
                    bold
                    position="left"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.balanceAmount}
                  />
                </View>
                {usdBalance !== null ? (
                  <View style={styles.balanceBlockSpaced}>
                    <Title
                      text="USD Balance"
                      small
                      position="left"
                      color={theme.palette.grayDark}
                    />
                    <Title
                      text={formatFxAmount(usdBalance, 'USD')}
                      bold
                      position="left"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={styles.balanceAmount}
                    />
                  </View>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('swap currency')}
                style={styles.swapButton}
              >
                <MyIcon
                  name="swap-horizontal"
                  size={18}
                  color={theme.palette.white}
                />
                <Title
                  text="Swap"
                  small
                  color={theme.palette.white}
                  style={styles.swapLabel}
                />
              </TouchableOpacity>
            </Row>
          </MyCard>

          <Title
            text={`${cards.length} card${cards.length === 1 ? '' : 's'}`}
            small
            color={theme.palette.grayDark}
            style={styles.count}
          />

          {cards.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <MyIcon
                  name="card-outline"
                  size={36}
                  color={theme.palette.primary}
                />
              </View>
              <Title text="No virtual cards yet" bold style={styles.emptyTitle} />
              <Title
                text="Create a USD virtual card to get started."
                small
                color={theme.palette.grayDark}
                style={styles.emptyHint}
              />
            </View>
          ) : (
            cards.map((card) => (
              <VirtualCardItem
                key={card.cardId || card.id}
                card={card}
                onPress={() =>
                  navigation.navigate('virtual card details', {
                    cardId: card.cardId,
                    card,
                    fees,
                  })
                }
              />
            ))
          )}

          <MyButton
            text="Create Virtual Card"
            onPress={() => {
              if (!serviceOn) {
                Dialog.show({
                  type: ALERT_TYPE.DANGER,
                  title: 'Unavailable',
                  textBody: 'Virtual card service is currently off',
                  button: 'close',
                });
                return;
              }
              navigation.navigate('create virtual card', { fees });
            }}
          />

          <MyCard style={styles.feesCard}>
            <Title text="Fees" bold position="left" style={styles.feesTitle} />
            <Title
              text={`Creation: $${fees?.creationFee ?? '—'}  ·  Funding: ${
                fees?.fundingFee ?? '—'
              }`}
              small
              position="left"
              color={theme.palette.grayDark}
              style={styles.feeLine}
            />
            <Title
              text={`Withdrawal: $${fees?.withdrawalFee ?? '—'}  ·  Min fund: $${
                fees?.minCardFund ?? '—'
              }`}
              small
              position="left"
              color={theme.palette.grayDark}
              style={styles.feeLine}
            />
          </MyCard>

          <MyCard style={styles.noteCard}>
            <Row style={styles.noteHeader}>
              <MyIcon
                name="alert-circle-outline"
                size={18}
                color="#a86500"
              />
              <Title
                text="Important Note"
                bold
                small
                color="#a86500"
                style={styles.noteTitle}
              />
            </Row>
            <Title
              text="Your virtual card must be funded at all times. If you use this card for subscriptions or recurring payments that result in insufficient funds multiple times, an insufficient balance fee will apply. If these failed charges exceed the limit, your card will be automatically terminated."
              small
              position="left"
              color={theme.palette.black}
              style={styles.noteText}
            />
          </MyCard>
        </ScrollView>
      )}
    </View>
  );
};

export default VirtualCards;

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
  disabledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdecea',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  bannerText: {
    marginLeft: 8,
    flex: 1,
    letterSpacing: 0,
  },
  balanceCard: {
    borderRadius: 12,
    marginBottom: 12,
  },
  balanceRow: {
    justifyContent: 'space-between',
  },
  // Views default to flexShrink: 0 in Yoga, so long amounts would push the
  // Swap button off the card instead of truncating.
  balanceStack: {
    flex: 1,
    marginRight: 10,
  },
  balanceBlockSpaced: {
    marginTop: 12,
  },
  balanceAmount: {
    letterSpacing: 0,
  },
  swapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.palette.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexShrink: 0,
  },
  swapLabel: {
    marginLeft: 4,
  },
  feesCard: {
    borderRadius: 12,
    marginBottom: 12,
  },
  noteCard: {
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff6e5',
    borderWidth: 1,
    borderColor: '#f0d9a8',
  },
  noteHeader: {
    marginBottom: 6,
  },
  noteTitle: {
    marginLeft: 6,
    letterSpacing: 0,
  },
  noteText: {
    letterSpacing: 0,
    lineHeight: 18,
  },
  feesTitle: {
    marginBottom: 6,
  },
  feeLine: {
    letterSpacing: 0,
    marginTop: 2,
  },
  count: {
    marginTop: 8,
    marginBottom: 8,
    letterSpacing: 0,
    textAlign: 'left',
  },
  empty: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#eef0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
  },
  emptyHint: {
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0,
  },
});

import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';

import { Theme } from '../../constants/Theme';
import Title from '../global/Title';
import Row from '../global/Row';
import MyIcon from '../global/MyIcon';
import {
  getPendingBanks,
  getVirtualAccounts,
} from '../../constants/VirtualBanks';
import useGenerateVirtualAccount from '../../hooks/useGenerateVirtualAccount';

const theme = Theme();

const AccountNumberCard = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.globalState);
  const { loading: generating, generateAccount } = useGenerateVirtualAccount();
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);

  const accounts = getVirtualAccounts(user);
  const pendingBanks = getPendingBanks(user);

  const handleCopy = (account) => {
    Clipboard.setString(account.account);
    setCopiedKey(account.key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateAccount = () => {
    // With a single provider we can generate straight from here, otherwise the
    // user picks the bank on the bank transfer screen.
    if (pendingBanks.length === 1) {
      generateAccount(pendingBanks[0].param);
      return;
    }

    navigation.navigate('bankTransferPage');
  };

  const handleMomentumEnd = (event) => {
    if (!cardWidth) {
      return;
    }

    setActiveIndex(
      Math.round(event.nativeEvent.contentOffset.x / cardWidth)
    );
  };

  if (accounts.length === 0) {
    if (pendingBanks.length === 0) {
      return null;
    }

    return (
      <TouchableOpacity
        style={[styles.card, styles.emptyCard]}
        activeOpacity={0.8}
        disabled={generating}
        onPress={handleGenerateAccount}
      >
        <Row style={styles.cardRow}>
          <Row style={styles.cardMain}>
            <View style={styles.icon}>
              <MyIcon name="add-outline" size={20} color={theme.palette.primary} />
            </View>
            <View style={styles.info}>
              <Title
                text="No account number yet"
                position="left"
                bold
                small
                style={styles.bankName}
              />
              <Title
                text="Tap to generate your account number"
                position="left"
                small
                numberOfLines={1}
                style={styles.hint}
              />
            </View>
          </Row>

          {generating ? (
            <ActivityIndicator size="small" color={theme.palette.primary} />
          ) : (
            <MyIcon
              name="chevron-forward"
              size={20}
              color={theme.palette.grayDark}
            />
          )}
        </Row>
      </TouchableOpacity>
    );
  }

  return (
    <View onLayout={(event) => setCardWidth(event.nativeEvent.layout.width)}>
      {cardWidth > 0 && (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          scrollEnabled={accounts.length > 1}
          onMomentumScrollEnd={handleMomentumEnd}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.page,
                { width: cardWidth },
                // Gap between pages, without changing the paging width.
                index < accounts.length - 1 && styles.pageGap,
              ]}
            >
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('bankTransferPage')}
              >
                <Row style={styles.cardRow}>
                  <Row style={styles.cardMain}>
                    <View style={styles.icon}>
                      <MyIcon
                        name="business-outline"
                        size={20}
                        color={theme.palette.primary}
                      />
                    </View>
                    <View style={styles.info}>
                      <Title
                        text={item.label}
                        position="left"
                        bold
                        small
                        numberOfLines={1}
                        style={styles.bankName}
                      />
                      <Title
                        text={item.account}
                        position="left"
                        style={styles.accountNumber}
                      />
                    </View>
                  </Row>

                  <TouchableOpacity
                    onPress={() => handleCopy(item)}
                    hitSlop={10}
                  >
                    <MyIcon
                      name={
                        copiedKey === item.key
                          ? 'checkmark-outline'
                          : 'copy-outline'
                      }
                      size={20}
                      color={theme.palette.grayDark}
                    />
                  </TouchableOpacity>
                </Row>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {accounts.length > 1 && (
        <Row center style={styles.dots}>
          {accounts.map((item, index) => (
            <View
              key={item.key}
              style={[styles.dot, index === activeIndex && styles.activeDot]}
            />
          ))}
        </Row>
      )}
    </View>
  );
};

export default AccountNumberCard;

const styles = StyleSheet.create({
  page: {
    marginTop: 10,
  },
  pageGap: {
    paddingRight: 8,
  },
  card: {
    flex: 1,
    backgroundColor: theme.palette.white,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    ...theme.ShadowLight,
  },
  emptyCard: {
    marginTop: 10,
  },
  cardRow: {
    justifyContent: 'space-between',
  },
  cardMain: {
    flex: 1,
    marginRight: 10,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.palette.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 10,
    alignItems: 'flex-start',
  },
  bankName: {
    color: theme.palette.black,
  },
  accountNumber: {
    color: theme.palette.black,
    letterSpacing: 1.5,
  },
  hint: {
    color: theme.palette.grayDark,
  },
  dots: {
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeDot: {
    width: 16,
    backgroundColor: theme.palette.white,
  },
});

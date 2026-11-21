import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { Theme } from '../../constants/Theme';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import Title from '../../components/global/Title';
import MyCard from '../../components/global/MyCard';
import Loader from '../../components/loading/Loading';
import { GetVirtualCardTransactions } from '../../store/apis/virtualCards';
import {
  defaultTxnDateRange,
  extractCardTransactions,
  formatUsd,
} from '../../constants/VirtualCardHelpers';

const theme = Theme();

const VirtualCardTransactions = () => {
  const { cardId } = useRoute().params || {};
  const { token } = useSelector((state) => state.globalState);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const range = defaultTxnDateRange();

  const loadTxns = async ({ pageNumber = 1, replace = true } = {}) => {
    if (replace) {
      if (!refreshing) setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const response = await GetVirtualCardTransactions({
      token,
      card_id: cardId,
      start_date: range.start_date,
      end_date: range.end_date,
      page: String(pageNumber),
    });

    if (response?.status === 'success') {
      const list = extractCardTransactions(response);
      setTransactions((prev) => (replace ? list : [...prev, ...list]));
      setHasMore(list.length >= 10);
      setPage(pageNumber);
    } else {
      setHasMore(false);
    }

    setLoading(false);
    setRefreshing(false);
    setLoadingMore(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadTxns({ pageNumber: 1, replace: true });
    }, [cardId, token])
  );

  const renderItem = ({ item }) => (
    <MyCard style={styles.txnCard}>
      <Title
        text={item?.description || 'Card transaction'}
        position="left"
        bold
        style={styles.desc}
        numberOfLines={3}
      />
      <Title
        text={`$${formatUsd(item?.amount)} · ${item?.status || ''}`}
        small
        position="left"
        color={theme.palette.primary}
        style={styles.amount}
      />
      <Title
        text={item?.created_at || ''}
        small
        position="left"
        color={theme.palette.grayDark}
        style={styles.date}
      />
    </MyCard>
  );

  return (
    <View style={styles.container}>
      <SecondaryHeader text="Card Transactions" />
      <Title
        text={`${range.start_date} → ${range.end_date}`}
        small
        color={theme.palette.grayDark}
        style={styles.range}
      />

      {loading ? (
        <View style={styles.centered}>
          <Loader />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item, index) =>
            `${item?.trans_id || item?.ref_id || index}`
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadTxns({ pageNumber: 1, replace: true });
              }}
            />
          }
          onEndReached={() => {
            if (!loadingMore && hasMore) {
              loadTxns({ pageNumber: page + 1, replace: false });
            }
          }}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Title text="No transactions found" bold />
              <Title
                text="Activity for this card will appear here."
                small
                color={theme.palette.grayDark}
                style={styles.emptyHint}
              />
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footer}>
                <Loader />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

export default VirtualCardTransactions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.window.windowWidth * 0.05,
    backgroundColor: '#F5F1F7',
  },
  range: {
    letterSpacing: 0,
    marginBottom: 10,
  },
  list: {
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txnCard: {
    borderRadius: 12,
    marginBottom: 10,
  },
  desc: {
    letterSpacing: 0,
    fontSize: 14,
    lineHeight: 20,
  },
  amount: {
    marginTop: 8,
    letterSpacing: 0,
  },
  date: {
    marginTop: 4,
    letterSpacing: 0,
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyHint: {
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});

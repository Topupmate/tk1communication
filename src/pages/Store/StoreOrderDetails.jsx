import { Image, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import React, { useCallback, useState } from 'react';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { Theme } from '../../constants/Theme';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import Title from '../../components/global/Title';
import Loader from '../../components/loading/Loading';
import Row from '../../components/global/Row';
import MyIcon from '../../components/global/MyIcon';
import { GetStoreOrderStatus } from '../../store/apis/store';
import formatMoney from '../../constants/FormatNumber';
import { resolveStoreAsset } from '../../constants/StoreHelpers';

const theme = Theme();

const StoreOrderDetails = () => {
  const { token } = useSelector((state) => state.globalState);
  const { ref, order: passed } = useRoute().params || {};
  const [loading, setLoading] = useState(!passed);
  const [refreshing, setRefreshing] = useState(false);
  const [order, setOrder] = useState(passed || null);
  const [imageError, setImageError] = useState(false);

  const load = async ({ soft } = {}) => {
    if (!ref) return;
    if (soft) setRefreshing(true);
    else if (!order) setLoading(true);
    const response = await GetStoreOrderStatus({ token, ref });
    if (response?.status === 'success' && response.response) {
      setOrder(response.response);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [token, ref])
  );

  if (loading || !order) {
    return (
      <View style={styles.container}>
        <SecondaryHeader text="Order Status" />
        <View style={styles.centered}>
          <Loader />
        </View>
      </View>
    );
  }

  const uri = resolveStoreAsset(order?.product_image);
  const rows = [
    ['Reference', order.reference],
    ['Quantity', String(order.quantity)],
    ['Amount', `₦${formatMoney(parseFloat(order.amount))}`],
    ['Delivery fee', `₦${formatMoney(parseFloat(order.delivery_fee))}`],
    ['Total paid', `₦${formatMoney(parseFloat(order.total_paid))}`],
    ['Payment', `${order.payment_method} · ${order.payment_status}`],
    ['Delivery', order.delivery_status],
    ['Customer', order.customer_name],
    ['Phone', order.customer_phone],
    ['State', order.destination_state],
    ['Address', order.delivery_address],
    ['Notes', order.delivery_notes],
    ['Date', order.order_date],
  ].filter(([, value]) => value);

  return (
    <View style={styles.container}>
      <SecondaryHeader text="Order Status" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load({ soft: true })} />
        }
      >
        {uri && !imageError ? (
          <Image
            source={{ uri }}
            style={styles.image}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <MyIcon name="cube-outline" size={40} color={theme.palette.grayDark} />
          </View>
        )}
        <Title
          text={order.product_name}
          header
          bold
          position="left"
          style={styles.title}
        />
        {order.delivery_status_message ? (
          <View style={styles.banner}>
            <Title
              text={order.delivery_status_message}
              position="left"
              style={styles.bannerText}
            />
          </View>
        ) : null}
        {rows.map(([header, title]) => (
          <Row key={header} style={styles.row}>
            <Title text={header} color={theme.palette.grayDark} />
            <Title
              text={title}
              bold
              position="right"
              style={styles.value}
              numberOfLines={4}
            />
          </Row>
        ))}
      </ScrollView>
    </View>
  );
};

export default StoreOrderDetails;

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
  image: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    backgroundColor: '#eee',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: 14,
    textTransform: 'none',
    letterSpacing: 0,
  },
  banner: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  bannerText: {
    letterSpacing: 0,
  },
  row: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 12,
    gap: 12,
  },
  value: {
    flex: 1,
    letterSpacing: 0,
    textTransform: 'none',
  },
});

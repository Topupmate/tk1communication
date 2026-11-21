import { Image, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import React, { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { Theme } from '../../constants/Theme';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import Title from '../../components/global/Title';
import Loader from '../../components/loading/Loading';
import MyPressable from '../../components/global/MyPressable';
import Row from '../../components/global/Row';
import MyIcon from '../../components/global/MyIcon';
import { GetStoreOrders } from '../../store/apis/store';
import formatMoney from '../../constants/FormatNumber';
import { resolveStoreAsset } from '../../constants/StoreHelpers';

const theme = Theme();

const StoreOrders = () => {
  const navigation = useNavigation();
  const { token } = useSelector((state) => state.globalState);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);

  const load = async ({ soft } = {}) => {
    if (soft) setRefreshing(true);
    else setLoading(true);
    const response = await GetStoreOrders({ token });
    setOrders(Array.isArray(response?.response) ? response.response : []);
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [token])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <SecondaryHeader text="My Orders" />
        <View style={styles.centered}>
          <Loader />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SecondaryHeader text="My Orders" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load({ soft: true })} />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.empty}>
            <Title text="No store orders yet" bold />
          </View>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.order_id || order.reference}
              order={order}
              onPress={() =>
                navigation.navigate('store order details', {
                  ref: order.reference,
                  order,
                })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

function OrderCard({ order, onPress }) {
  const [imageError, setImageError] = useState(false);
  const uri = resolveStoreAsset(order?.product_image);

  return (
    <MyPressable onPress={onPress}>
      <View style={styles.card}>
        <Row style={styles.cardRow}>
          {uri && !imageError ? (
            <Image
              source={{ uri }}
              style={styles.image}
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <MyIcon name="cube-outline" color={theme.palette.grayDark} />
            </View>
          )}
          <View style={styles.body}>
            <Title
              text={order?.product_name}
              bold
              position="left"
              numberOfLines={2}
              style={styles.name}
            />
            <Title
              text={order?.reference}
              small
              position="left"
              color={theme.palette.grayDark}
              numberOfLines={1}
            />
            <Title
              text={`₦${formatMoney(parseFloat(order?.total_paid))}`}
              bold
              position="left"
              color={theme.palette.primary}
            />
            <Row style={styles.statusRow}>
              <Title
                text={order?.payment_status}
                small
                color={theme.palette.primary}
              />
              <Title text=" · " small />
              <Title text={order?.delivery_status} small />
            </Row>
            <Title
              text={order?.order_date}
              small
              position="left"
              color={theme.palette.grayDark}
            />
          </View>
        </Row>
      </View>
    </MyPressable>
  );
}

export default StoreOrders;

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
  empty: {
    paddingTop: 80,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    ...theme.ShadowLight,
  },
  cardRow: {
    alignItems: 'flex-start',
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    letterSpacing: 0,
    textTransform: 'none',
  },
  statusRow: {
    justifyContent: 'flex-start',
    marginTop: 4,
  },
});

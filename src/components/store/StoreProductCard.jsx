import { Image, StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import MyPressable from '../global/MyPressable';
import Title from '../global/Title';
import MyIcon from '../global/MyIcon';
import { Theme } from '../../constants/Theme';
import formatMoney from '../../constants/FormatNumber';
import { resolveStoreAsset } from '../../constants/StoreHelpers';

const theme = Theme();
const CARD_GAP = 10;
const CARD_WIDTH =
  (theme.window.windowWidth * 0.9 - CARD_GAP) / 2;

const StoreProductCard = ({ item }) => {
  const navigation = useNavigation();
  const [imageError, setImageError] = useState(false);
  const uri = resolveStoreAsset(item?.p_image);

  return (
    <MyPressable
      onPress={() => navigation.navigate('store product', { product: item })}
      style={styles.press}
    >
      <View style={styles.card}>
        {uri && !imageError ? (
          <Image
            source={{ uri }}
            style={styles.image}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.placeholder}>
            <MyIcon name="image-outline" size={32} color={theme.palette.grayDark} />
          </View>
        )}
        <View style={styles.body}>
          {item?.cat_name ? (
            <Title
              text={item.cat_name}
              small
              position="left"
              color={theme.palette.primary}
              numberOfLines={1}
              style={styles.cat}
            />
          ) : null}
          <Title
            text={item?.p_name}
            bold
            position="left"
            numberOfLines={2}
            style={styles.name}
          />
          <Title
            text={`₦${formatMoney(parseFloat(item?.p_price))}`}
            bold
            position="left"
            color={theme.palette.primary}
          />
        </View>
      </View>
    </MyPressable>
  );
};

export default StoreProductCard;

const styles = StyleSheet.create({
  press: {
    width: CARD_WIDTH,
    marginBottom: 12,
  },
  card: {
    backgroundColor: theme.palette.white,
    borderRadius: 12,
    overflow: 'hidden',
    ...theme.ShadowLight,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#eee',
  },
  placeholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    padding: 10,
  },
  cat: {
    letterSpacing: 0,
    marginBottom: 2,
  },
  name: {
    letterSpacing: 0,
    marginBottom: 6,
    minHeight: 36,
  },
});

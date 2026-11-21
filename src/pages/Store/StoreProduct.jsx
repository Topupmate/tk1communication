import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Theme } from '../../constants/Theme';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import Title from '../../components/global/Title';
import MyButton from '../../components/global/Mybutton';
import Row from '../../components/global/Row';
import MyIcon from '../../components/global/MyIcon';
import formatMoney from '../../constants/FormatNumber';
import { productImageUris } from '../../constants/StoreHelpers';

const theme = Theme();

const StoreProduct = () => {
  const navigation = useNavigation();
  const { product } = useRoute().params || {};
  const images = useMemo(() => productImageUris(product), [product]);
  const [active, setActive] = useState(0);
  const [imageError, setImageError] = useState(false);

  const description = String(product?.p_description || '').replace(/\\r\\n/g, '\n').replace(/\r\n/g, '\n');

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SecondaryHeader text="Product" />
        {images[active] && !imageError ? (
          <Image
            source={{ uri: images[active] }}
            style={styles.hero}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.hero, styles.placeholder]}>
            <MyIcon name="image-outline" size={48} color={theme.palette.grayDark} />
          </View>
        )}
        {images.length > 1 ? (
          <Row style={styles.thumbs}>
            {images.map((uri, index) => (
              <TouchableOpacity
                key={`${uri}-${index}`}
                onPress={() => {
                  setImageError(false);
                  setActive(index);
                }}
              >
                <Image
                  source={{ uri }}
                  style={[
                    styles.thumb,
                    active === index && styles.thumbActive,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </Row>
        ) : null}

        {product?.cat_name ? (
          <Title
            text={product.cat_name}
            small
            position="left"
            color={theme.palette.primary}
            style={styles.cat}
          />
        ) : null}
        <Title text={product?.p_name} header bold position="left" style={styles.name} />
        <Title
          text={`₦${formatMoney(parseFloat(product?.p_price))}`}
          bold
          position="left"
          color={theme.palette.primary}
          style={styles.price}
        />
        {description ? (
          <Title text={description} position="left" style={styles.desc} />
        ) : null}

        <MyButton
          text="Order now"
          onPress={() =>
            navigation.navigate('store checkout', { product })
          }
        />
      </ScrollView>
    </View>
  );
};

export default StoreProduct;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.window.windowWidth * 0.05,
    backgroundColor: '#F5F1F7',
  },
  hero: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    backgroundColor: '#eee',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbs: {
    marginTop: 10,
    gap: 8,
    justifyContent: 'flex-start',
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbActive: {
    borderColor: theme.palette.primary,
  },
  cat: {
    marginTop: 16,
    letterSpacing: 0,
  },
  name: {
    marginTop: 4,
    textTransform: 'none',
    letterSpacing: 0,
  },
  price: {
    marginTop: 8,
  },
  desc: {
    marginTop: 12,
    marginBottom: 16,
    letterSpacing: 0,
    lineHeight: 22,
  },
});

import {
  Linking,
  RefreshControl,
  Image,
  ScrollView,
  StyleSheet,
  View,
  FlatList,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';

import { Theme } from '../../constants/Theme';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import Title from '../../components/global/Title';
import MyInput from '../../components/global/MyInput';
import Loader from '../../components/loading/Loading';
import BlogCategoryChip from '../../components/blog/BlogCategoryChip';
import StoreProductCard from '../../components/store/StoreProductCard';
import TransparentButton from '../../components/global/TransParentButton';
import Row from '../../components/global/Row';
import MyIcon from '../../components/global/MyIcon';
import {
  GetStoreCategories,
  GetStoreDetails,
  GetStoreProducts,
} from '../../store/apis/store';
import {
  STORE_PAGE_LIMIT,
  resolveStoreAsset,
  whatsappUrl,
} from '../../constants/StoreHelpers';

const theme = Theme();

const Store = () => {
  const navigation = useNavigation();
  const { token } = useSelector((state) => state.globalState);
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [coverError, setCoverError] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const onEndReachedDuringMomentum = useRef(true);
  const searchTimer = useRef(null);

  const loadHeader = async () => {
    const [details, cats] = await Promise.all([
      GetStoreDetails({ token }),
      GetStoreCategories({ token }),
    ]);
    if (details?.status === 'success') {
      setSettings(details.response?.settings || null);
    }
    if (cats?.status === 'success') {
      const active = (cats.response || []).filter(
        (c) => String(c.status).toLowerCase() === 'active'
      );
      setCategories(active);
    }
  };

  const loadProducts = async ({ nextOffset, category, keyword, replace }) => {
    if (replace) setInitialLoading(true);
    else setLoadingMore(true);

    const response = await GetStoreProducts({
      token,
      offset: nextOffset,
      category: category || undefined,
      search: keyword || undefined,
    });

    if (response?.status === 'success') {
      const payload = response.response || {};
      const list = Array.isArray(payload.products) ? payload.products : [];
      setProducts((prev) => (replace ? list : [...prev, ...list]));
      setTotal(Number(payload.total) || list.length);
      setOffset(Number(payload.offset) || nextOffset);
    }

    setInitialLoading(false);
    setLoadingMore(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadHeader();
      setOffset(0);
      loadProducts({
        nextOffset: 0,
        category: activeCategory,
        keyword: appliedSearch,
        replace: true,
      });
    }, [token, activeCategory, appliedSearch])
  );

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setAppliedSearch(search.trim());
    }, 450);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHeader();
    loadProducts({
      nextOffset: 0,
      category: activeCategory,
      keyword: appliedSearch,
      replace: true,
    });
  };

  const handleLoadMore = () => {
    if (onEndReachedDuringMomentum.current) return;
    if (loadingMore || initialLoading) return;
    if (products.length >= total) return;
    onEndReachedDuringMomentum.current = true;
    loadProducts({
      nextOffset: offset + STORE_PAGE_LIMIT,
      category: activeCategory,
      keyword: appliedSearch,
      replace: false,
    });
  };

  const coverUri = resolveStoreAsset(settings?.store_cover_photo);
  const logoUri = resolveStoreAsset(settings?.store_logo);
  const wa = whatsappUrl(settings?.whatsapp_contact);

  const ListHeader = (
    <View>
      <View style={styles.hero}>
        {coverUri && !coverError ? (
          <Image
            source={{ uri: coverUri }}
            style={styles.cover}
            onError={() => setCoverError(true)}
          />
        ) : (
          <View style={[styles.cover, styles.coverFallback]} />
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.82)']}
          locations={[0, 0.45, 1]}
          style={styles.heroOverlay}
        />
        <View style={styles.heroBody}>
          {logoUri && !logoError ? (
            <Image
              source={{ uri: logoUri }}
              style={styles.logo}
              onError={() => setLogoError(true)}
            />
          ) : (
            <View style={[styles.logo, styles.logoFallback]}>
              <MyIcon name="storefront-outline" color="#fff" size={28} />
            </View>
          )}
          <Title
            text={settings?.store_name || 'Store'}
            header
            bold
            position="left"
            color={theme.palette.white}
            style={styles.storeName}
          />
          {settings?.store_description ? (
            <Title
              text={settings.store_description}
              small
              position="left"
              color={theme.palette.white}
              numberOfLines={3}
              style={styles.desc}
            />
          ) : null}
        </View>
      </View>

      <Row style={styles.actions}>
        <TransparentButton
          text="My Orders"
          style={styles.actionBtn}
          onPress={() => navigation.navigate('store orders')}
        />
        {wa ? (
          <TransparentButton
            text="WhatsApp"
            style={styles.actionBtn}
            onPress={() => Linking.openURL(wa)}
          />
        ) : null}
      </Row>

      <MyInput
        text="Search products"
        icon="search-outline"
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.cats}
      >
        <BlogCategoryChip
          text="All"
          active={!activeCategory}
          onPress={() => setActiveCategory('')}
        />
        {categories.map((item) => (
          <BlogCategoryChip
            key={String(item.cat_id)}
            text={item.cat_name}
            active={activeCategory === String(item.cat_id)}
            onPress={() => setActiveCategory(String(item.cat_id))}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <SecondaryHeader text={settings?.store_name || 'Store'} />
      {initialLoading && products.length === 0 ? (
        <View style={styles.centered}>
          <Loader />
        </View>
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          columnWrapperStyle={styles.columns}
          keyExtractor={(item, index) => `${item.p_id}-${index}`}
          renderItem={({ item }) => <StoreProductCard item={item} />}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Title text="No products found" bold />
              <Title
                text="Try another category or search."
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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          onMomentumScrollBegin={() => {
            onEndReachedDuringMomentum.current = false;
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

export default Store;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.window.windowWidth * 0.05,
    backgroundColor: '#F5F1F7',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: theme.palette.secondary,
  },
  cover: {
    width: '100%',
    height: 140,
  },
  coverFallback: {
    backgroundColor: theme.palette.secondary,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroBody: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  logoFallback: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeName: {
    textTransform: 'none',
    letterSpacing: 0,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  desc: {
    letterSpacing: 0,
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  actions: {
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    marginTop: 0,
  },
  cats: {
    marginVertical: 8,
    maxHeight: 50,
  },
  columns: {
    justifyContent: 'space-between',
  },
  list: {
    paddingBottom: 80,
  },
  footer: {
    paddingVertical: 16,
  },
  empty: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyHint: {
    marginTop: 6,
  },
});

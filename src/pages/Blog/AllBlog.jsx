import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';

import { Theme } from '../../constants/Theme';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import Title from '../../components/global/Title';
import Loader from '../../components/loading/Loading';
import BlogCategoryChip from '../../components/blog/BlogCategoryChip';
import BlogPostCard from '../../components/blog/BlogPostCard';
import BlogEmptyState from '../../components/blog/BlogEmptyState';
import { GetBlogCategories, GetBlogPosts } from '../../store/apis/blog';
import { logFeatures } from '../../utils/debugScopes';

const theme = Theme();
const BLOG_PAGE_SIZE = 10;

const AllBlog = () => {
  const { token } = useSelector((state) => state.globalState);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('0');
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const onEndReachedDuringMomentum = useRef(true);

  const activeCategoryName = useMemo(() => {
    if (activeCategory === '0') return 'All';
    return categories.find((c) => c.catId === activeCategory)?.name || 'All';
  }, [activeCategory, categories]);

  const getCategories = async () => {
    logFeatures('Blog', 'AllBlog getCategories start', {});
    const response = await GetBlogCategories({ token });
    if (response?.status === 'success') {
      setCategories(response?.response || []);
      logFeatures('Blog', 'AllBlog categories loaded', {
        count: response?.response?.length ?? 0,
      });
    } else {
      logFeatures('Blog', 'AllBlog categories failed', {
        status: response?.status,
        message: response?.message,
      });
    }
  };

  const getPosts = async ({ pageNumber, category, replace }) => {
    logFeatures('Blog', 'AllBlog getPosts start', {
      pageNumber,
      category,
      replace,
    });
    if (replace) {
      setInitialLoading(true);
    } else {
      setLoadingMore(true);
    }

    const response = await GetBlogPosts({
      token,
      page: pageNumber,
      category,
    });

    if (response?.status === 'success') {
      const newPosts = response?.response || [];
      setPosts((prev) => (replace ? newPosts : [...prev, ...newPosts]));
      const moreAvailable = newPosts.length >= BLOG_PAGE_SIZE;
      setHasMore(moreAvailable);
      logFeatures('Blog', 'AllBlog getPosts success', {
        pageNumber,
        category,
        replace,
        received: newPosts.length,
        hasMore: moreAvailable,
      });
    } else {
      setHasMore(false);
      logFeatures('Blog', 'AllBlog getPosts failed', {
        pageNumber,
        category,
        status: response?.status,
        message: response?.message,
      });
    }

    setInitialLoading(false);
    setLoadingMore(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      logFeatures('Blog', 'AllBlog screen focused', {
        activeCategory,
        hasToken: Boolean(token),
      });
      getCategories();
      setPage(1);
      setHasMore(true);
      getPosts({ pageNumber: 1, category: activeCategory, replace: true });
    }, [token, activeCategory])
  );

  const onSelectCategory = (catId) => {
    if (catId === activeCategory) return;
    logFeatures('Blog', 'AllBlog category selected', {
      from: activeCategory,
      to: catId,
    });
    setActiveCategory(catId);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    getPosts({ pageNumber: 1, category: activeCategory, replace: true });
  }, [activeCategory]);

  const handleLoadMore = () => {
    if (onEndReachedDuringMomentum.current) return;
    if (loadingMore || initialLoading || !hasMore) return;
    onEndReachedDuringMomentum.current = true;
    const nextPage = page + 1;
    setPage(nextPage);
    getPosts({ pageNumber: nextPage, category: activeCategory });
  };

  const ListHeader = () =>
    posts.length > 0 ? (
      <View style={styles.listHeader}>
        <Title
          text={`${posts.length} article${posts.length === 1 ? '' : 's'}`}
          small
          color={theme.palette.grayDark}
          style={styles.listHeaderText}
        />
      </View>
    ) : null;

  return (
    <View style={styles.container}>
      <SecondaryHeader text="Blog" />

      <View style={styles.categoryContainer}>
        <FlashList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          estimatedItemSize={90}
          contentContainerStyle={styles.categoryList}
          keyExtractor={(item) => item.catId}
          ListHeaderComponent={() => (
            <BlogCategoryChip
              text="All"
              active={activeCategory === '0'}
              onPress={() => onSelectCategory('0')}
            />
          )}
          renderItem={({ item }) => (
            <BlogCategoryChip
              text={item.name}
              active={activeCategory === item.catId}
              onPress={() => onSelectCategory(item.catId)}
            />
          )}
        />
      </View>

      <View style={styles.listContainer}>
        {initialLoading ? (
          <View style={styles.loadingContainer}>
            <Loader />
          </View>
        ) : posts.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.emptyScroll}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <BlogEmptyState categoryName={activeCategoryName} />
          </ScrollView>
        ) : (
          <FlashList
            data={posts}
            estimatedItemSize={300}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <BlogPostCard item={item} />}
            keyExtractor={(item, index) => `${item.postId}-${index}`}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            onMomentumScrollBegin={() => {
              onEndReachedDuringMomentum.current = false;
            }}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListHeaderComponent={ListHeader}
            ListFooterComponent={() =>
              loadingMore ? (
                <View style={styles.footerLoader}>
                  <Loader />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
};

export default AllBlog;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.window.windowWidth * 0.05,
    backgroundColor: '#F5F1F7',
  },
  categoryContainer: {
    height: 50,
    marginBottom: 12,
  },
  categoryList: {
    paddingRight: 10,
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    marginBottom: 8,
  },
  listHeaderText: {
    letterSpacing: 0,
  },
  listContent: {
    paddingBottom: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyScroll: {
    flexGrow: 1,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

import { Image, ScrollView, StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { Theme } from '../../constants/Theme';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import Title from '../../components/global/Title';
import Row from '../../components/global/Row';
import MyIcon from '../../components/global/MyIcon';
import Loader from '../../components/loading/Loading';
import { GetBlogContent } from '../../store/apis/blog';
import { resolveBlogAsset, htmlToParagraphs } from '../../constants/BlogHelpers';
import FormatDate from '../../constants/FormatDate';
import { logFeatures } from '../../utils/debugScopes';

const theme = Theme();

const BlogDetails = () => {
  const { postId } = useRoute().params || {};
  const { token } = useSelector((state) => state.globalState);
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState(null);
  const [imageError, setImageError] = useState(false);

  const getPost = async () => {
    setLoading(true);
    setImageError(false);
    logFeatures('Blog', 'BlogDetails fetch start', { postId });
    const response = await GetBlogContent({ token, post: postId });
    if (response?.status === 'success') {
      setPost(response?.response);
      logFeatures('Blog', 'BlogDetails fetch success', {
        postId,
        title: response?.response?.title,
        cover: response?.response?.cover,
        coverUrl: resolveBlogAsset(response?.response?.cover),
      });
    } else {
      logFeatures('Blog', 'BlogDetails fetch failed', {
        postId,
        status: response?.status,
        message: response?.message,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    getPost();
  }, [postId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <SecondaryHeader text="Blog" />
        <View style={styles.centered}>
          <Loader />
        </View>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.container}>
        <SecondaryHeader text="Blog" />
        <View style={styles.centered}>
          <View style={styles.notFoundIcon}>
            <MyIcon
              name="document-text-outline"
              size={40}
              color={theme.palette.primary}
            />
          </View>
          <Title text="Post not found" bold style={styles.notFoundTitle} />
          <Title
            text="This article may have been removed or is unavailable."
            small
            color={theme.palette.grayDark}
            style={styles.notFoundHint}
          />
        </View>
      </View>
    );
  }

  const paragraphs = htmlToParagraphs(post?.contents);
  const coverUri = resolveBlogAsset(post?.cover);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SecondaryHeader text="Blog" />

        <View style={styles.heroCard}>
          {coverUri && !imageError ? (
            <Image
              source={{ uri: coverUri }}
              style={styles.image}
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MyIcon
                name="image-outline"
                size={40}
                color={theme.palette.grayDark}
              />
            </View>
          )}

          <View style={styles.heroBody}>
            {post?.name ? (
              <View style={styles.badge}>
                <Title
                  text={post.name}
                  small
                  color={theme.palette.primary}
                  style={styles.badgeText}
                />
              </View>
            ) : null}

            <Title
              text={post?.title}
              bold
              position="left"
              color={theme.palette.black}
              style={styles.title}
            />

            <Row style={styles.metaRow}>
              <Row style={styles.dateRow}>
                <MyIcon
                  name="calendar-outline"
                  size={14}
                  color={theme.palette.grayDark}
                />
                <Title
                  text={FormatDate(post?.date)}
                  small
                  color={theme.palette.grayDark}
                  style={styles.metaText}
                />
              </Row>
              <Row style={styles.statsRow}>
                <Row style={styles.stat}>
                  <MyIcon
                    name="eye-outline"
                    size={14}
                    color={theme.palette.grayDark}
                  />
                  <Title
                    text={String(post?.views ?? 0)}
                    small
                    style={styles.statText}
                  />
                </Row>
                <Row style={styles.stat}>
                  <MyIcon
                    name="heart-outline"
                    size={14}
                    color={theme.palette.grayDark}
                  />
                  <Title
                    text={String(post?.likes ?? 0)}
                    small
                    style={styles.statText}
                  />
                </Row>
              </Row>
            </Row>
          </View>
        </View>

        <View style={styles.articleCard}>
          {paragraphs.map((paragraph, index) => (
            <Title
              key={index}
              text={paragraph}
              position="left"
              color={theme.palette.black}
              style={styles.paragraph}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default BlogDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.window.windowWidth * 0.05,
    backgroundColor: '#F5F1F7',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  notFoundIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eef0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  notFoundTitle: {
    fontSize: 18,
    color: theme.palette.black,
  },
  notFoundHint: {
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0,
    lineHeight: 20,
  },
  heroCard: {
    backgroundColor: theme.palette.white,
    borderRadius: 14,
    overflow: 'hidden',
    ...theme.ShadowLight,
  },
  image: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 220,
    backgroundColor: theme.palette.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBody: {
    padding: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef0ff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  badgeText: {
    letterSpacing: 0,
    fontSize: 12,
  },
  title: {
    fontSize: theme.window.windowWidth > 400 ? 22 : 20,
    lineHeight: 28,
    letterSpacing: 0,
  },
  metaRow: {
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dateRow: {
    flex: 1,
  },
  metaText: {
    marginLeft: 4,
    letterSpacing: 0,
  },
  statsRow: {},
  stat: {
    marginLeft: 12,
  },
  statText: {
    marginLeft: 4,
    letterSpacing: 0,
    fontSize: 12,
  },
  articleCard: {
    marginTop: 14,
    backgroundColor: theme.palette.white,
    borderRadius: 14,
    padding: 16,
    ...theme.ShadowLight,
  },
  paragraph: {
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 26,
    marginBottom: 16,
  },
});

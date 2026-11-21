import { Image, StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import MyPressable from '../global/MyPressable';
import Row from '../global/Row';
import Title from '../global/Title';
import MyIcon from '../global/MyIcon';
import { Theme } from '../../constants/Theme';
import { resolveBlogAsset, htmlToParagraphs } from '../../constants/BlogHelpers';
import FormatDate from '../../constants/FormatDate';

const theme = Theme();

const BlogPostCard = ({ item }) => {
  const navigation = useNavigation();
  const excerpt = htmlToParagraphs(item?.contents)[0] || '';
  const [imageError, setImageError] = useState(false);
  const coverUri = resolveBlogAsset(item?.cover);

  return (
    <MyPressable
      onPress={() =>
        navigation.navigate('blog details', { postId: item?.postId })
      }
    >
      <View style={styles.container}>
        {coverUri && !imageError ? (
          <Image
            source={{ uri: coverUri }}
            style={styles.image}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MyIcon name="image-outline" size={36} color={theme.palette.grayDark} />
          </View>
        )}

        <View style={styles.body}>
          {item?.name ? (
            <View style={styles.badge}>
              <Title
                text={item.name}
                small
                color={theme.palette.primary}
                style={styles.badgeText}
              />
            </View>
          ) : null}

          <Title
            text={item?.title}
            bold
            position="left"
            numberOfLines={3}
            color={theme.palette.black}
            style={styles.title}
          />

          {excerpt ? (
            <Title
              text={excerpt}
              small
              position="left"
              numberOfLines={2}
              color={theme.palette.grayDark}
              style={styles.excerpt}
            />
          ) : null}

          <Row style={styles.metaRow}>
            <Title
              text={FormatDate(item?.date)}
              small
              color={theme.palette.grayDark}
              style={styles.metaText}
            />
            <Row style={styles.statsRow}>
              <Row style={styles.stat}>
                <MyIcon
                  name="eye-outline"
                  size={14}
                  color={theme.palette.grayDark}
                />
                <Title
                  text={String(item?.views ?? 0)}
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
                  text={String(item?.likes ?? 0)}
                  small
                  style={styles.statText}
                />
              </Row>
            </Row>
          </Row>

          <Row style={styles.readMore}>
            <Title text="Read article" small color={theme.palette.primary} bold />
            <MyIcon
              name="chevron-forward"
              size={16}
              color={theme.palette.primary}
            />
          </Row>
        </View>
      </View>
    </MyPressable>
  );
};

export default BlogPostCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.palette.white,
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    ...theme.ShadowLight,
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: theme.palette.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    padding: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef0ff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  badgeText: {
    letterSpacing: 0,
    fontSize: 12,
  },
  title: {
    fontSize: theme.window.windowWidth > 400 ? 17 : 16,
    lineHeight: 22,
    letterSpacing: 0,
  },
  excerpt: {
    marginTop: 6,
    letterSpacing: 0,
    lineHeight: 18,
  },
  metaRow: {
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  metaText: {
    letterSpacing: 0,
  },
  statsRow: {
    gap: 10,
  },
  stat: {
    marginLeft: 8,
  },
  statText: {
    marginLeft: 4,
    letterSpacing: 0,
    fontSize: 12,
  },
  readMore: {
    marginTop: 10,
    justifyContent: 'flex-end',
    gap: 2,
  },
});

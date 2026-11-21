import { StyleSheet, View } from 'react-native';
import React from 'react';

import Title from '../global/Title';
import MyIcon from '../global/MyIcon';
import { Theme } from '../../constants/Theme';

const theme = Theme();

const BlogEmptyState = ({ categoryName }) => {
  const isFiltered = Boolean(categoryName && categoryName !== 'All');

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <MyIcon name="newspaper-outline" size={42} color={theme.palette.primary} />
      </View>
      <Title
        text={isFiltered ? `No posts in ${categoryName}` : 'No blog posts yet'}
        bold
        style={styles.title}
      />
      <Title
        text={
          isFiltered
            ? 'Try another category or pull down to refresh.'
            : 'New articles will appear here. Pull down to refresh.'
        }
        small
        color={theme.palette.grayDark}
        style={styles.hint}
      />
    </View>
  );
};

export default BlogEmptyState;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 80,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#eef0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    color: theme.palette.black,
    fontSize: 18,
  },
  hint: {
    marginTop: 10,
    textAlign: 'center',
    letterSpacing: 0,
    lineHeight: 20,
  },
});

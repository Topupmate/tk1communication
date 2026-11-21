import { StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';

import Title from '../global/Title';
import { Theme } from '../../constants/Theme';

const theme = Theme();

const BlogCategoryChip = ({ text, active, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.container, active && styles.activeContainer]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Title
        text={text}
        small
        bold={active}
        color={active ? theme.palette.white : theme.palette.black}
        style={styles.label}
      />
    </TouchableOpacity>
  );
};

export default BlogCategoryChip;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: theme.palette.white,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  activeContainer: {
    backgroundColor: theme.palette.primary,
    borderColor: theme.palette.primary,
    ...theme.ShadowLight,
  },
  label: {
    letterSpacing: 0,
  },
});

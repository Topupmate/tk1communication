import { Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';

import MyCard from '../global/MyCard';
import { Theme } from '../../constants/Theme';

const theme = Theme();
export default function NetworkItem({ active, item, onPress }) {
  const isActive = active === item.id;
  return (
    <MyCard style={[styles.container, isActive && styles.active]}>
      <Pressable onPress={onPress} android_ripple={{ color: 'grey' }}>
        <Image source={item?.image} style={styles.image} contentFit="contain" />
      </Pressable>
    </MyCard>
  );
}

const height = theme.window.windowWidth > 600 ? 100 : 60;

const styles = StyleSheet.create({
  container: {
    padding: 0,
    margin: 10,
    overflow: 'hidden',
    height,
    borderRadius: 10,
    opacity: 1,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  active: {
    borderColor: theme.palette.primary,
  },
  image: {
    resizeMode: 'contain',
    width: height,
    height,
    opacity: 1,
  },
});

import { StyleSheet, View } from 'react-native';
import React from 'react';
import { StackActions, useNavigation } from '@react-navigation/native';

import Row from '../global/Row';
import QuickActionItem from './QuickActionItem';
import Title from '../global/Title';
import { Theme } from '../../constants/Theme';
import {
  AlignJustify,
  PhoneCall,
  Users,
  Zap,
} from 'react-native-feather';
import { isFeatureOn } from '../../constants/FeatureAccess';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import {
  SERVICE_GROUPS,
  visibleGroupItems,
} from '../../constants/ServiceGroups';

const theme = Theme();

const chunk = (items, size) => {
  const rows = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
};

export default function QuickActions({ hideText }) {
  const navigation = useNavigation();
  const features = useFeatureAccess();

  const actions = [
    {
      feature: 'airtime',
      title: 'Airtime',
      onPress: () => navigation.navigate('buyAirtimePage', { phone: '' }),
      iconNode: <PhoneCall color={theme.palette.primary} />,
    },
    {
      feature: 'data',
      title: 'Data',
      icon: 'wifi-outline',
      onPress: () => navigation.navigate('buyDataPage', { phone: '' }),
    },
    {
      feature: 'cable',
      title: 'TV',
      icon: 'tv-outline',
      onPress: () => navigation.navigate('tvSubscriptionsPage'),
    },
    {
      feature: 'electricity',
      title: 'Electricity',
      onPress: () => navigation.navigate('electricBillPage'),
      iconNode: <Zap color={theme.palette.primary} />,
    },
    {
      feature: 'exam',
      title: 'Exam Pin',
      onPress: () => navigation.navigate('examPinPage'),
      iconNode: <AlignJustify color={theme.palette.primary} />,
    },
    {
      feature: 'airtime2cash',
      title: 'Airtime Swap',
      icon: 'swap-horizontal',
      onPress: () => navigation.navigate('airtimeToCashPage'),
    },
    {
      feature: 'rechargecard',
      title: 'Airtime Pin',
      icon: 'call',
      onPress: () => navigation.navigate('airtime pin option'),
    },
    {
      feature: 'datapin',
      title: 'Data Pin',
      icon: 'wifi',
      onPress: () => navigation.navigate('data pin option'),
    },
    ...['voice', 'internet']
      .filter((key) => visibleGroupItems(key, features).length > 0)
      .map((key) => ({
        title: SERVICE_GROUPS[key].title,
        icon: SERVICE_GROUPS[key].icon,
        onPress: () => navigation.navigate('service group', { group: key }),
      })),
    {
      feature: 'blog',
      title: 'Blog',
      icon: 'newspaper-outline',
      onPress: () => navigation.navigate('all blog'),
    },
    {
      feature: 'bulksms',
      title: 'Bulk SMS',
      icon: 'chatbox-ellipses-outline',
      onPress: () => navigation.navigate('bulk sms'),
    },
    {
      feature: 'virtualcard',
      title: 'Virtual Card',
      icon: 'card-outline',
      onPress: () => navigation.navigate('virtual cards'),
    },
    {
      feature: 'giftcard',
      title: 'Gift Card',
      icon: 'gift-outline',
      onPress: () => navigation.navigate('gift card'),
    },
    {
      feature: 'onlineshop',
      title: 'Store',
      icon: 'storefront-outline',
      onPress: () => navigation.navigate('store'),
    },
    {
      title: 'Referrals',
      onPress: () => navigation.navigate('referrals page'),
      iconNode: <Users color={theme.palette.primary} />,
    },
    {
      title: 'Logout',
      icon: 'exit-outline',
      onPress: () => {
        StackActions.popToTop();
        navigation.replace('welcomePage');
      },
    },
  ].filter((item) => isFeatureOn(features, item.feature));

  return (
    <View style={styles.container}>
      {!hideText && (
        <Title
          text="What Would You Like To Do Today?"
          bold
          color={theme.palette.primary}
          position={'start'}
        />
      )}
      {chunk(actions, 4).map((row, index) => (
        <Row
          key={row.map((item) => item.title).join('-') || index}
          style={row.length === 4 ? styles.row : styles.rowStart}
        >
          {row.map((item) => (
            <QuickActionItem
              key={item.title}
              title={item.title}
              icon={item.icon}
              onPress={item.onPress}
            >
              {item.iconNode}
            </QuickActionItem>
          ))}
        </Row>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginTop: 10,
  },
  rowStart: {
    justifyContent: 'flex-start',
    marginTop: 10,
    gap: theme.window.windowWidth * 0.02,
  },
});

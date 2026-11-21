import { StyleSheet, View } from 'react-native';
import React from 'react';

import Title from '../global/Title';
import Row from '../global/Row';
import MyIcon from '../global/MyIcon';
import MyPressable from '../global/MyPressable';
import { Theme } from '../../constants/Theme';
import {
  getCardDisplayStatus,
  getStatusColor,
} from '../../constants/VirtualCardHelpers';

const theme = Theme();

const VirtualCardItem = ({ card, onPress }) => {
  const status = getCardDisplayStatus(card?.status);
  const statusColor = getStatusColor(card?.status, theme);
  const masked =
    card?.cardMasked ||
    `${card?.cardFirst4 || '****'} **** ${card?.cardLast4 || '****'}`;

  return (
    <MyPressable onPress={onPress}>
      <View style={styles.container}>
        <Row style={styles.header}>
          <View style={styles.brandBadge}>
            <Title
              text={card?.cardBrand || 'CARD'}
              small
              bold
              color={theme.palette.primary}
              style={styles.brandText}
            />
          </View>
          <View style={[styles.statusChip, { backgroundColor: statusColor + '22' }]}>
            <Title text={status} small color={statusColor} style={styles.statusText} />
          </View>
        </Row>

        <Title
          text={masked}
          bold
          position="left"
          color={theme.palette.black}
          style={styles.number}
        />

        <Row style={styles.meta}>
          <Title
            text={card?.cardCustomerName || 'Virtual Card'}
            small
            color={theme.palette.grayDark}
            style={styles.metaText}
          />
          <Row>
            <MyIcon name="calendar-outline" size={12} color={theme.palette.grayDark} />
            <Title
              text={String(card?.createdAt || '').slice(0, 10)}
              small
              color={theme.palette.grayDark}
              style={styles.dateText}
            />
          </Row>
        </Row>
      </View>
    </MyPressable>
  );
};

export default VirtualCardItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.palette.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    ...theme.ShadowLight,
  },
  header: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  brandBadge: {
    backgroundColor: '#eef0ff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  brandText: {
    letterSpacing: 0,
    fontSize: 11,
  },
  statusChip: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    letterSpacing: 0,
    fontSize: 11,
  },
  number: {
    fontSize: 18,
    letterSpacing: 1,
  },
  meta: {
    justifyContent: 'space-between',
    marginTop: 10,
  },
  metaText: {
    letterSpacing: 0,
    flex: 1,
  },
  dateText: {
    marginLeft: 4,
    letterSpacing: 0,
  },
});

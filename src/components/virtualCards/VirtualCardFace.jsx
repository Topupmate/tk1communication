import { StyleSheet, View } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

import Title from '../global/Title';
import Row from '../global/Row';
import { Theme } from '../../constants/Theme';
import { groupCardNumber } from '../../constants/VirtualCardHelpers';

const theme = Theme();

const Chip = () => (
  <View style={styles.chip}>
    <View style={styles.chipLine} />
    <View style={styles.chipLine} />
  </View>
);

const VirtualCardFace = ({
  brand,
  number,
  last4,
  holder,
  expiry,
  cvv,
  revealed,
  dimmed,
}) => {
  const hiddenNumber = `••••  ••••  ••••  ${last4 || '••••'}`;

  return (
    <LinearGradient
      colors={['#111a3f', '#1d2a6b', '#0b0f2c']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, dimmed && styles.dimmed]}
    >
      <Row style={styles.topRow}>
        <Chip />
        <Title
          text={brand || 'CARD'}
          bold
          color={theme.palette.white}
          style={styles.brand}
        />
      </Row>

      <Title
        text={revealed && number ? groupCardNumber(number) : hiddenNumber}
        color={theme.palette.white}
        style={styles.number}
      />

      <Row style={styles.bottomRow}>
        <View style={styles.bottomBlock}>
          <Title text="CARD HOLDER" color="#9aa4d6" style={styles.label} />
          <Title
            text={holder || '—'}
            color={theme.palette.white}
            style={styles.value}
            numberOfLines={1}
          />
        </View>

        <View style={styles.bottomBlock}>
          <Title text="EXPIRES" color="#9aa4d6" style={styles.label} />
          <Title
            text={expiry || '—'}
            color={theme.palette.white}
            style={styles.value}
          />
        </View>

        {revealed && !!cvv && (
          <View style={styles.bottomBlock}>
            <Title text="CVV" color="#9aa4d6" style={styles.label} />
            <Title
              text={cvv}
              color={theme.palette.white}
              style={styles.value}
            />
          </View>
        )}
      </Row>
    </LinearGradient>
  );
};

export default VirtualCardFace;

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 20,
    justifyContent: 'space-between',
    aspectRatio: 1.6,
    ...theme.shadow,
  },
  dimmed: {
    opacity: 0.55,
  },
  topRow: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chip: {
    width: 42,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#e6b422',
    paddingVertical: 6,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  chipLine: {
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  brand: {
    letterSpacing: 2,
    fontSize: 18,
  },
  number: {
    fontSize: 20,
    letterSpacing: 2,
    textAlign: 'left',
  },
  bottomRow: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  bottomBlock: {
    flexShrink: 1,
  },
  label: {
    fontSize: 9,
    letterSpacing: 1,
    textAlign: 'left',
  },
  value: {
    fontSize: 14,
    letterSpacing: 1,
    textAlign: 'left',
    marginTop: 2,
  },
});

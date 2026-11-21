import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React, { useEffect, useMemo, useRef } from 'react';

import { Theme } from '../../constants/Theme';

const theme = Theme();

const __getCellSize = (pinCount) => {
  const screenWidth = theme.window.windowWidth;
  const horizontalPadding = 48;
  const gap = 10;
  const availableWidth = screenWidth - horizontalPadding;
  const maxCellSize = screenWidth > 600 ? 80 : 64;
  const computed = Math.floor(
    (availableWidth - gap * (pinCount - 1)) / pinCount,
  );
  return Math.min(maxCellSize, Math.max(48, computed));
};

const OtpInput = ({
  onChange,
  code = '',
  onFilled,
  password,
  count,
  autoFocus = false,
}) => {
  const pinCount = count ?? 5;
  const cellSize = useMemo(() => __getCellSize(pinCount), [pinCount]);
  const fontSize = Math.round(cellSize * 0.48);
  const inputRef = useRef(null);
  const activeIndex = Math.min(code?.length ?? 0, pinCount - 1);

  const digits = useMemo(() => {
    const chars = String(code ?? '')
      .replace(/\D/g, '')
      .slice(0, pinCount)
      .split('');
    while (chars.length < pinCount) {
      chars.push('');
    }
    return chars;
  }, [code, pinCount]);

  useEffect(() => {
    if (!autoFocus) return undefined;
    const timer = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(timer);
  }, [autoFocus]);

  const handleChange = (text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, pinCount);
    onChange?.(cleaned);
    if (cleaned.length === pinCount) {
      onFilled?.(cleaned);
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <Pressable
      style={[styles.wrapper, { minHeight: cellSize }]}
      onPress={focusInput}
      accessibilityRole="none"
    >
      <View style={styles.row}>
        {digits.map((digit, index) => {
          const isActive = index === activeIndex;
          return (
            <View
              key={`otp-cell-${index}`}
              style={[
                styles.cell,
                {
                  width: cellSize,
                  height: cellSize,
                  borderColor: isActive
                    ? theme.palette.primary
                    : theme.palette.gray,
                },
              ]}
            >
              <Text
                style={[
                  styles.digit,
                  {
                    fontSize,
                    lineHeight: fontSize + 4,
                  },
                ]}
              >
                {password && digit ? '•' : digit}
              </Text>
            </View>
          );
        })}
      </View>

      <TextInput
        ref={inputRef}
        value={code ?? ''}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : 'none'}
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        importantForAutofill="yes"
        maxLength={pinCount}
        caretHidden
        contextMenuHidden={false}
        selectTextOnFocus={false}
        style={[styles.hiddenInput, { height: cellSize }]}
        selectionColor="transparent"
        underlineColorAndroid="transparent"
      />
    </Pressable>
  );
};

export default OtpInput;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  cell: {
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: theme.palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontWeight: '600',
    color: theme.palette.black,
    textAlign: 'center',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    opacity: 0.02,
    color: 'transparent',
    fontSize: 16,
    padding: 0,
    margin: 0,
    zIndex: 1,
  },
});

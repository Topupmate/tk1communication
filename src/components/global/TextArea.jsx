import { StyleSheet, TextInput } from 'react-native';
import React from 'react';

import { Theme } from '../../constants/Theme';

const theme = Theme();

const TextArea = ({ onChangeText, value, text, style, props }) => {
  return (
    <TextInput
      placeholder={text}
      placeholderTextColor={theme.palette.grayDark}
      style={[styles.input, style]}
      multiline
      numberOfLines={4}
      value={value}
      {...props}
      onChangeText={onChangeText}
    />
  );
};

export default TextArea;

const styles = StyleSheet.create({
  input: {
    borderColor: theme.palette.grayDark,
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    marginTop: 20,
    lineHeight: 23,
    textAlignVertical: 'top',
    maxHeight: 150,
    color: theme.palette.black,
  },
});

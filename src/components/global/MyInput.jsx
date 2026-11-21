import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';

import { Theme } from '../../constants/Theme';
import MyIcon from './MyIcon';
import Title from './Title';
import { Users } from 'react-native-feather';
import { pickNativeContactPhone } from '../../utils/nativeContactPicker';
import { normalizePhoneNumber } from '../../constants/PhoneNumberUtils';

const theme = Theme();
const MyInput = ({
  text,
  style,
  icon,
  password,
  error,
  props,
  type,
  onChangeText,
  value,
  material,
  contact,
  maxLength,
  inputStyle,
  noSpaces,
}) => {
  const [showPassword, setShowPassword] = useState(true);

  const openContactsPicker = async () => {
    try {
      const result = await pickNativeContactPhone();
      if (result?.number && onChangeText) {
        const normalized = normalizePhoneNumber(result.number);
        onChangeText(normalized);
      }
    } catch (err) {
      // Picker not available or permission denied – user can type manually
    }
  };

  const showContactIcon = contact || type === 'phone-pad';

  return (
    <View style={[styles.container, style]}>
      <MyIcon name={icon} style={styles.icon} material={material} />
      <TextInput
        style={[
          styles.input,
          error && { borderColor: theme.palette.red },
          inputStyle,
          { color: 'black' },
        ]}
        placeholder={text}
        secureTextEntry={password && showPassword ? true : false}
        keyboardType={type}
        value={value}
        placeholderTextColor={theme.palette.grayDark}
        maxLength={maxLength}
        onChangeText={(next) => {
          const sanitized =
            type === 'phone-pad' || noSpaces ? next.replace(/\s/g, '') : next;
          onChangeText(sanitized);
        }}
        {...props}
      />
      {password && (
        <TouchableOpacity
          style={styles.iconRight}
          onPress={() => setShowPassword((prev) => !prev)}
        >
          <MyIcon name={showPassword ? 'eye' : 'eye-off'} size={30} />
        </TouchableOpacity>
      )}
      {showContactIcon && (
        <TouchableOpacity
          style={[styles.iconRight, { top: 45 }]}
          onPress={openContactsPicker}
        >
          <Users color={theme.palette.link} />
        </TouchableOpacity>
      )}
      {error && (
        <Title text={error} small color={theme.palette.red} position="start" />
      )}
    </View>
  );
};

export default MyInput;

const styles = StyleSheet.create({
  container: {
    marginTop: -10,
  },
  input: {
    padding: 10,
    borderRadius: 10,
    fontSize: 20,
    borderWidth: 2,
    borderColor: 'gray',
    paddingLeft: 45,
  },
  icon: {
    transform: [{ translateY: 43 }, { translateX: 10 }],
    opacity: 0.8,
  },

  iconRight: {
    position: 'absolute',
    right: 20,
    top: 40,
  },
});

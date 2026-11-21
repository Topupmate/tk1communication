import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Theme } from '../../constants/Theme';
import Title from '../../components/global/Title';
import OtpInput from '../../components/global/OtpInput';
import MyButton from '../../components/global/Mybutton';
import { useNavigation } from '@react-navigation/native';
import { ConfirmEmailOtp } from '../../store/apis/auth';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { logPasswordReset } from '../../utils/debugScopes';

//reset password
const theme = Theme();
export default function OtpPage({ route }) {
  const [code, setCode] = useState('');
  const navigation = useNavigation();
  const [error, setError] = useState('');
  const { email } = route.params;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    logPasswordReset('OtpPage screen mounted', { email });
  }, [email]);

  const handleCodeChange = (newCode) => {
    setError('');
    setCode(newCode);
    logPasswordReset('OtpPage code changed', { length: newCode.length, otp: newCode });
  };

  const handleSubmit = async () => {
    setError('');
    logPasswordReset('OtpPage handleSubmit called', { email, codeLength: code.length, otp: code });
    if (code.length !== 4) {
      logPasswordReset('OtpPage validation failed', {
        reason: 'invalid code length',
        expected: 4,
        actual: code.length,
      });
      setError('Please enter the 4-digit code');
      return;
    }

    setLoading(true);
    const response = await ConfirmEmailOtp({ email, otp: code });
    setLoading(false);

    logPasswordReset('OtpPage handleSubmit ← ConfirmEmailOtp result', {
      status: response?.status,
      message: response?.message ?? response?.msg,
      response,
    });

    if (response.status !== 'success') {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Wrong OTP',
        textBody: response?.message ?? response?.msg,
        button: 'close',
      });
      return;
    }

    if (response.status === 'success') {
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'OTP Verified Successfully',
        textBody: response?.message ?? response?.msg,
        button: 'close',
      });

      logPasswordReset('OtpPage navigating to changePassword', { email, otp: code });
      navigation.navigate('changePassword', {
        email,
        otp: code,
      });
    }
  };

  useEffect(() => {
    if (code.length === 4) {
      handleSubmit();
    }
  }, [code]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          <Title
            text={`Enter the OTP sent to this email`}
            style={{ color: theme.palette.black }}
          />
          <Title text={email} bold color={theme.palette.primary} />
          <View style={styles.inputContainer}>
            <OtpInput
              count={4}
              autoFocus
              onChange={handleCodeChange}
              code={code}
            />
          </View>
          {error && <Title text={error} style={styles.errorText} />}
          <View style={styles.buttonWrap}>
            <MyButton text={'Submit'} onPress={handleSubmit} isLoading={loading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.palette.white,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.window.windowWidth * 0.05,
    paddingTop: 24,
    paddingBottom: 32,
  },
  inputContainer: {
    width: '100%',
    paddingVertical: 24,
    alignItems: 'center',
    alignSelf: 'center',
  },
  errorText: {
    marginTop: 8,
    marginBottom: 8,
    color: theme.palette.red,
  },
  buttonWrap: {
    width: '100%',
    marginTop: 16,
  },
});

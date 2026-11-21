import { StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import Title from '../../components/global/Title';
import MyInput from '../../components/global/MyInput';
import MyButton from '../../components/global/Mybutton';
import { Theme } from '../../constants/Theme';
import { changePassword } from '../../store/apis/api';
import { ResetPassword } from '../../store/apis/auth';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { logPasswordReset } from '../../utils/debugScopes';

//reset password
const theme = Theme();
const ChangePasswordPage = ({ route }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const { email, otp } = route.params;
  const [responseError, setResponseError] = useState('');
  const [isLoading, setLoading] = useState(false);

  const [LoginError, setLoginError] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    logPasswordReset('ChangePasswordPage screen mounted', { email, otp });
  }, [email, otp]);

  const handleSubmit = async () => {
    setResponseError('');
    logPasswordReset('ChangePasswordPage handleSubmit called', {
      email,
      otp,
      passwordLength: password.length,
      confirmPasswordLength: confirmPassword.length,
    });
    if (password.trim().length === 0) {
      setLoginError((prev) => ({
        ...prev,
        password: 'password cannot be empty',
      }));
    }

    if (confirmPassword.trim().length === 0) {
      setLoginError((prev) => ({
        ...prev,
        confirmPassword: 'confirm password cannot be empty',
      }));
    }

    if (password.trim().length === 0 || confirmPassword.trim().length === 0) {
      return;
    }

    if (password !== confirmPassword) {
      logPasswordReset('ChangePasswordPage validation failed', { reason: 'passwords do not match' });
      setError('Passwords do not match');
      return;
    }

    logPasswordReset('ChangePasswordPage → calling ResetPassword API', { email, otp });
    setLoading(true);
    const response = await ResetPassword({ email, otp, password });
    setLoading(false);

    logPasswordReset('ChangePasswordPage ← ResetPassword result', {
      status: response?.status,
      message: response?.message ?? response?.msg,
      response,
    });

    if (response.status !== 'success') {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Fail',
        textBody: response.message,
        button: 'close',
      });
      setPassword('');
      setConfirmPassword('');
      return;
    }

    if (response.status === 'success') {
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Password changed successfully',
        textBody: response?.message,
        button: 'close',
      });
      setPassword('');
      setConfirmPassword('');
      logPasswordReset('ChangePasswordPage navigating to successPage');
      navigation.replace('successPage');
    }
  };

  return (
    <View style={styles.container}>
      <Title text="Enter new password" header />
      <View style={styles.form}>
        <MyInput
          password
          text="New Password"
          icon="lock-closed"
          value={password}
          error={LoginError.password}
          onChangeText={(e) => {
            setLoginError((prev) => ({
              ...prev,
              password: '',
            }));
            setError('');
            setPassword(e);
          }}
        />
        <MyInput
          password
          text="Confirm Password"
          icon="lock-closed"
          style={styles.inputStyle}
          error={LoginError.confirmPassword}
          onChangeText={(e) => {
            setResponseError('');
            setLoginError((prev) => ({
              ...prev,
              confirmPassword: '',
            }));
            setError('');
            setConfirmPassword(e);
          }}
        />
        {error && <Title text={error} style={{ color: theme.palette.red }} />}
        {responseError && (
          <Title text={responseError} style={{ color: theme.palette.red }} />
        )}
        <MyButton
          text={'Proceed'}
          style={styles.button}
          isLoading={isLoading}
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
};

export default ChangePasswordPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  form: {
    paddingHorizontal: '5%',
  },
  inputStyle: {
    marginTop: -10,
    marginBottom: 30,
  },
  button: {},
});

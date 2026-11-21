import { StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import Title from '../../components/global/Title';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../../constants/Theme';
import MyButton from '../../components/global/Mybutton';
import TransparentButton from '../../components/global/TransParentButton';
import { logPasswordReset } from '../../utils/debugScopes';

const theme = Theme();
const SuccessPage = () => {
  const navigation = useNavigation();

  useEffect(() => {
    logPasswordReset('SuccessPage screen mounted — password reset flow complete');
  }, []);

  const handlePress = () => {
    logPasswordReset('SuccessPage navigating to welcomePage');
    navigation.navigate('welcomePage');
  };
  return (
    <View style={styles.container}>
      <Title
        text="Your Password has been updated successfully"
        header
        color={'green'}
        style={{ marginBottom: 10 }}
      />
      <TransparentButton text="Login to your account" onPress={handlePress} />
    </View>
  );
};

export default SuccessPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
});

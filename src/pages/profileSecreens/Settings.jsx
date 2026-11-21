import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Theme } from '../../constants/Theme';
import MySwitch from '../../components/global/MySwitch';
import { GetData, StoreData } from '../../constants/storage';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import {
  currentPermissionIsDenied,
  disablePushNotifications,
  enablePushNotifications,
} from '../../components/push/fcm';

const theme = Theme();
const SettingsPage = () => {
  const authToken = useSelector((state) => state?.globalState?.token);
  const [isEnabledPin, setIsEnabledPin] = useState(false);
  const [logWithPin, setLogWithPin] = useState(false);
  const [logWithFinger, setLogWithFinger] = useState(false);
  const [notification, setNotification] = useState(false);

  useEffect(() => {
    const getData = async () => {
      // Replace these with actual calls to fetch your data
      const use_transaction_pin = await GetData('use_transaction_pin');
      const use_biometric = await GetData('use_biometric');
      const use_login_pin = await GetData('use_login_pin');
      const allow_notification = await GetData('allow_notification');

      setIsEnabledPin(use_transaction_pin);
      setLogWithFinger(use_biometric);
      setLogWithPin(use_login_pin);
      setNotification(allow_notification);
    };

    getData();
  }, []);

  const toggleSwitch = async (key) => {
    let valueToStore = false;

    switch (key) {
      case 'use_transaction_pin':
        valueToStore = !isEnabledPin;
        setIsEnabledPin(valueToStore);
        break;
      case 'use_biometric':
        valueToStore = !logWithFinger;
        setLogWithFinger(valueToStore);
        break;
      case 'use_login_pin':
        valueToStore = !logWithPin;
        setLogWithPin(valueToStore);
        break;
      case 'allow_notification': {
        const next = !notification;
        if (next) {
          const alreadyDenied = await currentPermissionIsDenied();
          const granted = await enablePushNotifications(authToken);
          setNotification(granted);
          valueToStore = granted;
          if (!granted && alreadyDenied) {
            try {
              await Linking.openSettings();
            } catch {}
          }
        } else {
          await disablePushNotifications(authToken);
          setNotification(false);
          valueToStore = false;
        }
        break;
      }
      default:
        break;
    }

    if (key !== 'allow_notification') {
      await StoreData(key, valueToStore);
    }
  };

  return (
    <View style={styles.container}>
      <SecondaryHeader text="Settings" />
      <ScrollView>
        <MySwitch
          text="Transaction pin"
          isEnabled={isEnabledPin}
          toggleSwitch={() => toggleSwitch('use_transaction_pin')}
        />
        <MySwitch
          text="Biometrics Login"
          isEnabled={logWithFinger}
          toggleSwitch={() => toggleSwitch('use_biometric')}
        />
        <MySwitch
          text="Login with pin"
          isEnabled={logWithPin}
          toggleSwitch={() => toggleSwitch('use_login_pin')}
        />
        <MySwitch
          text="Notification"
          isEnabled={notification}
          toggleSwitch={() => toggleSwitch('allow_notification')}
        />
      </ScrollView>
    </View>
  );
};
export default SettingsPage;
const styles = StyleSheet.create({
  container: {
    margin: theme.window.windowWidth > 600 ? 20 : 10,
  },
});

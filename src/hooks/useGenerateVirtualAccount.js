import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

import { GenerateVirtualAccount, GetSiteDetails } from '../store/apis/global';
import { GetUserDetails } from '../store/apis/user';
import useSaveUser from './saveUser';

const useGenerateVirtualAccount = () => {
  const { token } = useSelector((state) => state.globalState);
  const navigation = useNavigation();
  const { getUserInfo } = useSaveUser();
  const [loading, setLoading] = useState(false);

  const generateAccount = async (bank) => {
    try {
      setLoading(true);
      const newUser = await GetUserDetails({ token });
      const settings = await GetSiteDetails({ token });

      if (settings?.response?.kycShouldEnable !== 'no') {
        if (newUser?.response?.kycstatus !== 'verified') {
          Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: 'KYC not completed',
            textBody: 'Please complete your KYC before generating account',
            button: 'close',
            autoClose: true,
          });
          navigation.navigate('level 2');
          return;
        }
      }

      const response = await GenerateVirtualAccount({ token, bank });

      if (response?.status === 'success') {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Account Generated',
          textBody: response?.message,
          button: 'close',
        });
      } else {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Account Generation Failed',
          textBody: response?.message,
          button: 'close',
        });
      }

      getUserInfo();
    } catch (error) {
      console.log(error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Account Generation Failed',
        textBody: 'An error occured, please try again',
        button: 'close',
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, generateAccount };
};

export default useGenerateVirtualAccount;

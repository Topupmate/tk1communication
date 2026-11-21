import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { Theme } from '../../constants/Theme';
import Title from '../global/Title';
import Row from '../global/Row';
import MyIcon from '../global/MyIcon';
import IconCard from '../global/IconCard';
import useGetAvatar from '../../hooks/useGetAvater';
import { Image } from 'react-native';
import formatMoney from '../../constants/FormatNumber';
import { formatFxAmount, getUsdBalance } from '../../constants/FxHelpers';
import AccountNumberCard from './AccountNumberCard';

const theme = Theme();
const white = theme.palette.white;

const InfoCard = ({ hideAdd }) => {
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.globalState);
  const avater = useGetAvatar();
  const [showBalance, setShowBalance] = useState({
    total: false,
    commission: false,
  });

  const handleShowBalance = () => {
    setShowBalance((prev) => ({
      ...prev,
      total: !prev.total,
    }));
  };

  const handleShowCommission = () => {
    setShowBalance((prev) => ({
      ...prev,
      commission: !prev.commission,
    }));
  };

  const handleAddFund = () => {
    console.log('[AddMoneyDebug] Navigation: InfoCard "Add Money" → fundWalletPage');
    navigation.navigate('fundWalletPage');
  };
  const handleWithdraw = () => {
    navigation.navigate('referrals page');
  };

  const usdBalance = getUsdBalance(user);
  return (
    <View>
      <LinearGradient
        colors={[theme.palette.primary, theme.palette.secondary]}
        style={styles.linergrd}
      >
        <Row style={{ justifyContent: 'space-between' }}>
          <Row>
            <Image
              source={avater}
              resizeMode="contain"
              style={styles.dpImage}
            />
            <View style={styles.userInfoContainer}>
              <Title
                text={`Hi ${user?.firstname} ${user?.lastname}`}
                color={theme.palette.white}
                bold
              />
              <Title
                text={`${user?.account_type}`}
                small
                bold
                color={theme.palette.white}
                style={{ textTransform: 'capitalize' }}
              />
            </View>
          </Row>

          <Row>
            <IconCard
              name="settings-outline"
              onPress={() => navigation.navigate('settingPage')}
            />
            <IconCard
              name="notifications-outline"
              onPress={() => navigation.navigate('notificationPage')}
            />
          </Row>
        </Row>

        <Row style={styles.walletMainContainer}>
          <View style={styles.userInfoContainer}>
            <Title
              text="Wallet Balance"
              bold
              color={theme.palette.white}
              small
            />
            <Row>
              <Title
                text={
                  showBalance.total
                    ? `₦${formatMoney(parseInt(user?.wallet))}`
                    : '******'
                }
                color={theme.palette.white}
                header
              />
              <TouchableOpacity
                onPress={handleShowBalance}
                style={{ marginLeft: 10 }}
              >
                <MyIcon
                  name={showBalance.total ? 'eye-off' : 'eye'}
                  color={white}
                />
              </TouchableOpacity>
            </Row>
            {usdBalance !== null && usdBalance > 0 && (
              <Row>
                <Title
                  text="USD: "
                  color={theme.palette.white}
                  small
                  bold
                />
                <Title
                  text={
                    showBalance.total
                      ? formatFxAmount(usdBalance, 'USD')
                      : '****'
                  }
                  color={theme.palette.white}
                  style={{ marginLeft: 5 }}
                />
              </Row>
            )}
            <Row>
              <Title
                text={`Commission: `}
                color={theme.palette.white}
                small
                bold
              />
              <Title
                text={
                  showBalance.commission
                    ? `₦${formatMoney(parseInt(user?.refwallet))}`
                    : '****'
                }
                color={theme.palette.white}
                style={{ marginLeft: 5 }}
              />
              <TouchableOpacity
                onPress={handleShowCommission}
                style={{ marginLeft: 5 }}
              >
                <MyIcon
                  name={showBalance.commission ? 'eye-off' : 'eye'}
                  color={white}
                />
              </TouchableOpacity>
            </Row>
            <Title />
          </View>
          <Image
            source={require('../../assets/logolight.png')}
            style={styles.logo}
          />
        </Row>

        <AccountNumberCard />

        <Row style={styles.buttonsContainer}>
          <CustomButton
            text="Add Money"
            name="add-circle"
            onPress={handleAddFund}
          />

          <CustomButton
            text="Withdraw"
            name="arrow-down"
            onPress={handleWithdraw}
          />
        </Row>
      </LinearGradient>
    </View>
  );
};

export default InfoCard;

const styles = StyleSheet.create({
  container: {
    minHeight: 100,
  },
  linergrd: {
    padding: 10,
  },

  dpImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  userInfoContainer: {
    alignItems: 'flex-start',
    marginLeft: 5,
  },
  logo: {
    width: 130,
    height: 100,
    resizeMode: 'contain',
  },
  walletMainContainer: {
    marginTop: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonsContainer: {
    marginTop: 10,
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: theme.palette.primary,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    ...theme.ShadowLight,
    flex: 1,
    margin: theme.window.windowWidth > 600 ? 10 : 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    marginLeft: 3,
    flexShrink: 1,
  },
});

function CustomButton({ text, onPress, name }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Row>
        <MyIcon name={name} size={20} color={theme.palette.white} />
        <Title
          text={text}
          color={theme.palette.white}
          small
          numberOfLines={1}
          style={styles.buttonText}
        />
      </Row>
    </TouchableOpacity>
  );
}

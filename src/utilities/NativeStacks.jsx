import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';

import { Theme } from '../constants/Theme';
import { BottomTabs } from './BottomTabs';
import MySlider from '../pages/authScreens/MySlider';
import WelcomePage from '../pages/authScreens/WelcomePage';
import LoginPage from '../pages/authScreens/LoginPage';
import ResetPassword from '../pages/authScreens/ResetPassword';
import OtpPage from '../pages/authScreens/OtpPage';
import ChangePasswordPage from '../pages/authScreens/ChangePasswordPage';
import SuccessPage from '../pages/authScreens/SuccesPage';
import SmsOtpPage from '../pages/authScreens/SmsOtpPage';
import SmsOtpVerifyPage from '../pages/authScreens/SmsOtpVerifyPage';
import PayBills from '../pages/homeScreen/Paybills';
import BuyAirtimePage from '../pages/homeScreen/BuyAirtime';
import BuyDataPage from '../pages/homeScreen/BuyData';
import BankTransferPage from '../pages/homeScreen/BankTransfer';
import CardPaymentPage from '../pages/homeScreen/CardPayment';
import ManualFundingPage from '../pages/homeScreen/ManualFunding';
import FundWalletPage from '../pages/homeScreen/FundWallet';
import CouponFundingPage from '../pages/homeScreen/CouponFunding';
import AirtimeToCash from '../pages/homeScreen/AirtimeToCash';
import ExamPinPage from '../pages/homeScreen/ExamPinPage';
import NotificationPage from '../pages/global/NotificationPage';
import ProfilePage from '../pages/global/ProfilePage';
import TvSubscriptionsPage from '../pages/homeScreen/TvSubscriptions';
import ElectricBill from '../pages/homeScreen/ElectricBill';
import Referral from '../pages/profileSecreens/Referral';
import AggregatorsPage from '../pages/profileSecreens/Aggregators';
import SmileDataPage from '../pages/homeScreen/SmileData';
import RechargePinPage from '../pages/homeScreen/RechargePin';
import DataPinPage from '../pages/homeScreen/DataPin';
import AlphaCallerPage from '../pages/homeScreen/AlphaCaller';
import WithdrawPage from '../pages/global/WidrawPage';
import AirtimeReceipt from '../pages/recipts/AirtimeReceipt';
import { GetData } from '../constants/storage';
import { loginUser } from '../store/globalState';
import SettingsPage from '../pages/profileSecreens/Settings';
import SetUpPinPage from '../pages/authScreens/SetUpPinPage';
import SettingPinPage from '../pages/authScreens/SettingPinPage';
import ConfirmNewPinScreen from '../pages/authScreens/ConfirmNewPinScreen';
import EnableBiometric from '../pages/authScreens/EnableBiometric';
import AllowNotification from '../pages/authScreens/AllowNotification';
import WelcomeSuccessPage from '../pages/authScreens/WelcomeSuccessPage';
import SelectAvatarPage from '../pages/authScreens/SelectAvaterPage';
import PersonalInfoScreen from '../pages/profileSecreens/PersonalInfoSecreen';
import SecurityPage from '../pages/profileSecreens/SecurityPage';
import UpgradeAccount from '../pages/profileSecreens/UpgradeAccount';
import ContactList from '../pages/global/ContactList';
import AggregatorsAddCustomer from '../pages/aggregators/AggregatorsAddCustomer';
import AggregatorViewComission from '../pages/aggregators/AggregatorViewComission';
import AggretorViewCustomer from '../pages/aggregators/AggretorViewCustomer';
import AggregatorViewTransaction from '../pages/aggregators/AggregatorViewTransaction';
import AirtimePinOption from '../pages/homeScreen/AirtimePinOption';
import AirtimePinHistory from '../pages/homeScreen/AirtimePinHistory';
import DataPinHistory from '../pages/homeScreen/DataPinHistory';
import DataPinOption from '../pages/homeScreen/DataPinOption';
import PinDetailsScreen from '../components/pinScreens/PinDetailsScreen';
import Level2 from '../pages/upgradeAccountScreens/Level2';
import Level3 from '../pages/upgradeAccountScreens/Level3';
import Level4 from '../pages/upgradeAccountScreens/Level4';
import ReportTransaction from '../pages/recipts/ReportTransaction';
import AllTicket from '../pages/Tickets/AllTicket';
import CreateTicket from '../pages/Tickets/CreateTicket';
import TicketDetails from '../pages/Tickets/TicketDetails';
import TransferPage from '../pages/global/TransferPage';
import GiftUser from '../pages/homeScreen/GiftUser';
import Services from '../pages/homeScreen/Services';
import ServiceGroup from '../pages/homeScreen/ServiceGroup';
import TransactionStatus from '../pages/recipts/TransactionStatus';
import ExamModal from '../components/ExamPin/ExamModel';
import AirtimeSwapModel from '../components/airtimetocash/AirtimeSwapModel';
import AlphaModel from '../components/alpha/AlphaModel';
import SmileModel from '../components/smile/SmileModel';
import AirtimePinModel from '../components/pinScreens/AirtimePinModel';
import DataPinModel from '../components/pinScreens/DataPinModel';
import NetworkStatus from '../pages/global/NetworkStatus';
import Faq from '../pages/homeScreen/Faq';
import HelpPage from '../pages/global/HelpPage';
import LoginV2 from '../pages/authScreens/LoginV2';
import AllBlog from '../pages/Blog/AllBlog';
import BlogDetails from '../pages/Blog/BlogDetails';
import BulkSms from '../pages/Sms/BulkSms';
import VirtualCards from '../pages/VirtualCards/VirtualCards';
import CreateVirtualCard from '../pages/VirtualCards/CreateVirtualCard';
import VirtualCardDetails from '../pages/VirtualCards/VirtualCardDetails';
import VirtualCardTopup from '../pages/VirtualCards/VirtualCardTopup';
import VirtualCardWithdraw from '../pages/VirtualCards/VirtualCardWithdraw';
import VirtualCardTransactions from '../pages/VirtualCards/VirtualCardTransactions';
import SwapCurrency from '../pages/Fx/SwapCurrency';
import GiftCard from '../pages/GiftCard/GiftCard';
import Kirani from '../pages/Kirani/Kirani';
import Ratel from '../pages/Ratel/Ratel';
import Store from '../pages/Store/Store';
import StoreProduct from '../pages/Store/StoreProduct';
import StoreCheckout from '../pages/Store/StoreCheckout';
import StoreOrders from '../pages/Store/StoreOrders';
import StoreOrderDetails from '../pages/Store/StoreOrderDetails';

const Stack = createNativeStackNavigator();
const theme = Theme();
export default function NativeStacks() {
  const dispatch = useDispatch();
  const [currentUser, setCurrentUser] = useState(false);

  const getUser = async () => {
    const user = await GetData('user');
    if (user) {
      setCurrentUser(user);
      dispatch(loginUser(user));
      return;
    }
    setCurrentUser('');
  };
  useEffect(() => {
    getUser();
  }, []);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerTintColor: theme.palette.black,
        animation: 'slide_from_right',
      }}
      initialRouteName="slider"
    >
      <Stack.Screen name="bottomTabs" component={BottomTabs} />
      <Stack.Screen
        name="slider"
        component={!currentUser?.token ? MySlider : LoginV2}
      />
      {/* auth screens */}
      <Stack.Screen name="welcomePage" component={WelcomePage} />
      <Stack.Screen name="loginPage" component={LoginPage} />
      <Stack.Screen name="loginV2" component={LoginV2} />
      <Stack.Screen name="resetPassword" component={ResetPassword} />
      <Stack.Screen name="otpPage" component={OtpPage} />
      <Stack.Screen name="changePassword" component={ChangePasswordPage} />
      <Stack.Screen name="successPage" component={SuccessPage} />
      <Stack.Screen name="smsOtpPage" component={SmsOtpPage} />
      <Stack.Screen name="smsOtpVerifyPage" component={SmsOtpVerifyPage} />
      <Stack.Screen name="set up pin page" component={SetUpPinPage} />
      <Stack.Screen name="setting pin page" component={SettingPinPage} />
      <Stack.Screen
        name="confirm new pin page"
        component={ConfirmNewPinScreen}
      />
      <Stack.Screen name="enable biometric" component={EnableBiometric} />
      <Stack.Screen name="allow notification" component={AllowNotification} />
      <Stack.Screen name="select avatar page" component={SelectAvatarPage} />
      <Stack.Screen
        name="welcome success page"
        component={WelcomeSuccessPage}
      />
      {/* home screens */}
      <Stack.Screen name="buyAirtimePage" component={BuyAirtimePage} />
      <Stack.Screen name="buyDataPage" component={BuyDataPage} />
      <Stack.Screen name="examPinPage" component={ExamPinPage} />
      <Stack.Screen name="examModal" component={ExamModal} />
      <Stack.Screen name="alpha page" component={AlphaCallerPage} />
      <Stack.Screen name="alphaModel" component={AlphaModel} />
      <Stack.Screen name="smile data page" component={SmileDataPage} />
      <Stack.Screen name="smileModel" component={SmileModel} />
      <Stack.Screen name="withdrawPage" component={WithdrawPage} />
      <Stack.Screen name="airtimeToCashPage" component={AirtimeToCash} />
      <Stack.Screen name="airtimeSwapModel" component={AirtimeSwapModel} />
      <Stack.Screen name="electricBillPage" component={ElectricBill} />
      <Stack.Screen name="airtime pin option" component={AirtimePinOption} />
      <Stack.Screen name="airtime pin page" component={RechargePinPage} />
      <Stack.Screen name="airtime pin model" component={AirtimePinModel} />
      <Stack.Screen name="airtime pin history" component={AirtimePinHistory} />
      <Stack.Screen name="data pin history" component={DataPinHistory} />
      <Stack.Screen name="data pin page" component={DataPinPage} />
      <Stack.Screen name="data pin option" component={DataPinOption} />
      <Stack.Screen name="data pin model" component={DataPinModel} />
      <Stack.Screen name="pin details screen" component={PinDetailsScreen} />
      <Stack.Screen name="payBillsPage" component={PayBills} />
      <Stack.Screen name="referrals page" component={Referral} />
      <Stack.Screen name="gift user" component={GiftUser} />
      <Stack.Screen name="services" component={Services} />
      <Stack.Screen name="service group" component={ServiceGroup} />
      <Stack.Screen name="network status" component={NetworkStatus} />
      <Stack.Screen name="faq" component={Faq} />
      <Stack.Screen
        name="tvSubscriptionsPage"
        component={TvSubscriptionsPage}
      />

      {/* fund wallet screen */}
      <Stack.Screen name="fundWalletPage" component={FundWalletPage} />
      <Stack.Screen name="couponFundingPage" component={CouponFundingPage} />
      <Stack.Screen name="bankTransferPage" component={BankTransferPage} />
      <Stack.Screen name="cardPaymentPage" component={CardPaymentPage} />
      <Stack.Screen name="manualFundingPage" component={ManualFundingPage} />
      {/* global */}
      <Stack.Screen name="helpPage" component={HelpPage} />
      <Stack.Screen name="settingPage" component={SettingsPage} />
      <Stack.Screen name="transfer page" component={TransferPage} />
      <Stack.Screen
        name="contact list"
        component={ContactList}
        options={{ animation: 'slide_from_left' }}
      />
      <Stack.Screen name="notificationPage" component={NotificationPage} />
      <Stack.Screen
        name="profilePage"
        component={ProfilePage}
        options={{
          headerShown: true,
          title: 'Profile',
        }}
      />
      {/* profile page */}
      <Stack.Screen
        name="personal info screen"
        component={PersonalInfoScreen}
      />
      <Stack.Screen name="Security screen" component={SecurityPage} />
      <Stack.Screen name="upgrade account screen" component={UpgradeAccount} />
      <Stack.Screen name="aggregatorsPage" component={AggregatorsPage} />
      {/* Receipt screens */}
      <Stack.Screen name="airtimeReceipt" component={AirtimeReceipt} />
      <Stack.Screen name="transaction status" component={TransactionStatus} />
      <Stack.Screen
        name="report transaction screen"
        component={ReportTransaction}
      />
      {/* Aggregators Screens */}
      <Stack.Screen
        name="aggregators add customer"
        component={AggregatorsAddCustomer}
      />
      <Stack.Screen
        name="aggregators view customer"
        component={AggretorViewCustomer}
      />
      <Stack.Screen
        name="aggregators view transaction"
        component={AggregatorViewTransaction}
      />
      <Stack.Screen
        name="aggregators view commission"
        component={AggregatorViewComission}
      />
      {/* upgrade account screens */}
      <Stack.Screen name="level 2" component={Level2} />
      <Stack.Screen name="level 3" component={Level3} />
      <Stack.Screen name="level 4" component={Level4} />
      {/* tickets screens */}
      <Stack.Screen name="create ticket" component={CreateTicket} />
      <Stack.Screen name="all tickets" component={AllTicket} />
      <Stack.Screen name="ticket details" component={TicketDetails} />
      {/* blog screens */}
      <Stack.Screen name="all blog" component={AllBlog} />
      <Stack.Screen name="blog details" component={BlogDetails} />
      {/* sms screens */}
      <Stack.Screen name="bulk sms" component={BulkSms} />
      {/* virtual cards */}
      <Stack.Screen name="virtual cards" component={VirtualCards} />
      <Stack.Screen name="create virtual card" component={CreateVirtualCard} />
      <Stack.Screen name="virtual card details" component={VirtualCardDetails} />
      <Stack.Screen name="virtual card topup" component={VirtualCardTopup} />
      <Stack.Screen
        name="virtual card withdraw"
        component={VirtualCardWithdraw}
      />
      <Stack.Screen
        name="virtual card transactions"
        component={VirtualCardTransactions}
      />
      {/* fx */}
      <Stack.Screen name="swap currency" component={SwapCurrency} />
      {/* gift / kirani / ratel */}
      <Stack.Screen name="gift card" component={GiftCard} />
      <Stack.Screen name="kirani" component={Kirani} />
      <Stack.Screen name="ratel" component={Ratel} />
      <Stack.Screen name="store" component={Store} />
      <Stack.Screen name="store product" component={StoreProduct} />
      <Stack.Screen name="store checkout" component={StoreCheckout} />
      <Stack.Screen name="store orders" component={StoreOrders} />
      <Stack.Screen name="store order details" component={StoreOrderDetails} />
    </Stack.Navigator>
  );
}

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import Row from '../../components/global/Row';
import Title from '../../components/global/Title';
import { Theme } from '../../constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import MyIcon from '../../components/global/MyIcon';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import formatMoney from '../../constants/FormatNumber';
import BottomHalfModal from '../../components/global/MyModal';
import { toggleModal } from '../../store/globalState';
import MyPressable from '../../components/global/MyPressable';
import MyInput from '../../components/global/MyInput';
import MyButton from '../../components/global/Mybutton';
import { WithdrawCommission } from '../../store/apis/global';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import { GetReferralSettings } from '../../store/apis/features';
import Loader from '../../components/loading/Loading';
import useSaveUser from '../../hooks/saveUser';

const handleToggleModal = (dispatch) => {
  dispatch(toggleModal());
};
function WithdrawModel() {
  const dispatch = useDispatch();
  const { isModalVisible, token } = useSelector((state) => state.globalState);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pin, setPin] = useState('');
  const { getUserInfo } = useSaveUser();

  const handleWithdraw = async () => {
    if (amount.trim() === '') {
      setError('Amount cannot be empty');
      return;
    }

    if (pin.trim() === '') {
      setError('Pin cannot be empty');
      return;
    }
    setLoading(true);
    const response = await WithdrawCommission({
      token,
      amount,
      pin,
      ref: 'REFERRAL' + Date.now(),
    });

    if (response.status !== 'success') {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Withdraw Fail',
        textBody: response.message,
        button: 'close',
      });
      setLoading(false);
      return;
    }

    Toast.show({
      type: ALERT_TYPE.SUCCESS,
      text1: 'Withdraw Success',
      text2: response.message,
    });
    getUserInfo();
    setLoading(false);
    handleToggleModal(dispatch);
  };

  return (
    <BottomHalfModal
      toggleModal={() => handleToggleModal(dispatch)}
      isModalVisible={isModalVisible}
    >
      <Title
        text="Withdraw Commission"
        bold
        header
        color={theme.palette.black}
      />
      <MyInput
        value={amount}
        onChangeText={(t) => {
          setError('');
          setAmount(t);
        }}
        text="Enter Amount"
        icon="cash"
        error={error}
        type={'number-pad'}
      />
      <MyInput
        value={pin}
        onChangeText={(t) => setPin(t)}
        text="Enter Pin"
        icon="lock-closed"
        type={'number-pad'}
      />
      <MyButton isLoading={loading} text="Withdraw" onPress={handleWithdraw} />
    </BottomHalfModal>
  );
}

const theme = Theme();

const COMMISSION_LABELS = [
  ['first_funding', 'First funding'],
  ['agent_upgrade', 'Agent upgrade'],
  ['vendor_upgrade', 'Vendor upgrade'],
  ['airtime', 'Airtime'],
  ['data', 'Data'],
  ['cabletv', 'Cable TV'],
  ['exam', 'Exam'],
  ['electricity', 'Electricity'],
  ['wallet', 'Wallet'],
];

const displayMoney = (value) => {
  const text = String(value ?? '').trim();
  if (!text) return '—';
  if (text.includes('₦') || text.toLowerCase().includes('ngn')) return text;
  const amount = parseFloat(text.replace(/,/g, ''));
  if (!Number.isFinite(amount)) return text;
  return `₦${formatMoney(amount)}`;
};

function GoalCard({ title, goal }) {
  if (!goal) return null;
  const percent = Math.max(0, Math.min(100, Number(goal.percent) || 0));
  return (
    <View style={styles.goalCard}>
      <Row style={styles.row}>
        <Title text={title} bold />
        <Title text={displayMoney(goal.reward)} small />
      </Row>
      <Title
        text={`${goal.current ?? 0} / ${goal.target ?? 0}`}
        small
        position="left"
        style={{ marginTop: 4 }}
      />
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
}

export default function Referral() {
  const { user, token } = useSelector((state) => state.globalState);

  const dispatch = useDispatch();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getSettings = async () => {
      setLoading(true);
      const res = await GetReferralSettings({ token });
      setLoading(false);
      if (res?.status === 'success') {
        setSettings(res?.response || null);
      }
    };
    getSettings();
  }, [token]);

  // console.log(list);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SecondaryHeader text="Referral" />
        <WithdrawModel />
        <View>
          <LinearGradient
            colors={[theme.palette.primary, theme.palette.secondary]}
            style={styles.card}
          >
            <Row style={styles.row}>
              <Title text="Commission" header color={theme.palette.white} />
              <Title
                text={
                  settings?.balance
                    ? displayMoney(settings.balance)
                    : `₦${formatMoney(parseFloat(user?.refwallet || 0))}`
                }
                header
                bold
                color={theme.palette.white}
              />
            </Row>

            <View>
              <Row style={styles.row}>
                <Title
                  text="Total referrals"
                  bold
                  color={theme.palette.white}
                />
                <Title
                  text={String(settings?.totalReferral ?? user?.referrals ?? 0)}
                  color={theme.palette.white}
                />
              </Row>
            </View>
          </LinearGradient>
          <Row style={styles.buttonRow}>
            <TouchableOpacity style={styles.customButton}>
              <Title text="Referral Number" small bold />
              <Title text={user?.phone} />
            </TouchableOpacity>
            <MyPressable
              style={styles.customButton}
              onPress={() => handleToggleModal(dispatch)}
            >
              <Row style={styles.customButtonRow}>
                <MyIcon name="arrow-down-circle" />
                <Title text={'Withdraw'} bold />
              </Row>
            </MyPressable>
          </Row>
        </View>
        {loading ? (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: 100,
            }}
          >
            <Loader />
          </View>
        ) : (
          <View>
            <View style={styles.tableContainer}>
              <Title text="Commission" header />
              <Title text="Rate" header />
            </View>
            {COMMISSION_LABELS.map(([key, label]) => (
              <View style={styles.tableRow} key={key}>
                <Text style={styles.tableText}>{label}</Text>
                <Text style={styles.tableText}>
                  {displayMoney(settings?.commissions?.[key])}
                </Text>
              </View>
            ))}

            <Title
              text="Transaction goals"
              header
              position="left"
              style={styles.sectionTitle}
            />
            <GoalCard title="Daily" goal={settings?.goals?.tx?.daily} />
            <GoalCard title="Weekly" goal={settings?.goals?.tx?.weekly} />
            <GoalCard title="Monthly" goal={settings?.goals?.tx?.monthly} />

            <Title
              text="Funding goals"
              header
              position="left"
              style={styles.sectionTitle}
            />
            <GoalCard title="Daily" goal={settings?.goals?.fund?.daily} />
            <GoalCard title="Weekly" goal={settings?.goals?.fund?.weekly} />
            <GoalCard title="Monthly" goal={settings?.goals?.fund?.monthly} />

            <Title
              text="Referred users"
              header
              position="left"
              style={styles.sectionTitle}
            />
            {Array.isArray(settings?.referralList) &&
            settings.referralList.length > 0 ? (
              settings.referralList.map((person) => (
                <View style={styles.personCard} key={person.id}>
                  <Row style={styles.row}>
                    <Title
                      text={`${person.sFname || ''} ${person.sLname || ''}`.trim() || 'User'}
                      bold
                    />
                    <Title text={person.status || ''} small />
                  </Row>
                  <Title text={person.sPhone || ''} small position="left" />
                  <Title
                    text={`Joined ${person.signup_date || person.sRegDate || ''}`}
                    small
                    position="left"
                  />
                  <Title
                    text={`Reward ${displayMoney(person.reward_amount)}${
                      person.reward_type ? ` · ${person.reward_type}` : ''
                    }`}
                    small
                    position="left"
                  />
                </View>
              ))
            ) : (
              <Title text="No referred users yet." small position="left" />
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: theme.window.windowWidth > 800 ? 20 : 10,
  },
  card: {
    height: 150,
    padding: 10,
    borderRadius: 10,
    ...theme.shadow,
    justifyContent: 'space-between',
  },
  row: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  customButton: {
    backgroundColor: theme.palette.gray,
    flex: 1,
    margin: 5,
    marginTop: 20,
    borderRadius: 10,
    justifyContent: 'center',
  },
  customButtonRow: {
    padding: 8,
  },
  tableContainer: {
    marginTop: 20,
    backgroundColor: theme.palette.gray,
    padding: 5,
    borderRadius: 10,
    ...theme.shadow,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  tableRow: {
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.palette.gray,
    flexDirection: 'row',
    padding: 15,
  },
  tableText: {
    borderRightWidth: 2,
    borderColor: theme.palette.gray,
    flex: 1,
    marginLeft: 5,
    color: theme.palette.black,
  },
  tableTextHead: {
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: theme.palette.gray,
    flex: 1.5,
    padding: 5,
    height: 50,
  },
  buttonRow: {
    alignItems: 'stretch',
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
  },
  goalCard: {
    backgroundColor: theme.palette.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.palette.gray,
  },
  track: {
    height: 8,
    borderRadius: 8,
    backgroundColor: theme.palette.gray,
    marginTop: 8,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    backgroundColor: theme.palette.primary,
  },
  personCard: {
    backgroundColor: theme.palette.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.palette.gray,
  },
});

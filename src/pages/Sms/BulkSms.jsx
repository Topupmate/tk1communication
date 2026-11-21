import { ScrollView, StyleSheet, View } from 'react-native';
import React, { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

import { Theme } from '../../constants/Theme';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import MyInput from '../../components/global/MyInput';
import TextArea from '../../components/global/TextArea';
import MyButton from '../../components/global/Mybutton';
import Title from '../../components/global/Title';
import Row from '../../components/global/Row';
import MyCard from '../../components/global/MyCard';
import MyIcon from '../../components/global/MyIcon';
import PayModel from '../../components/fund/PayMentModel';
import { toggleDataModel } from '../../store/globalState';
import formatMoney from '../../constants/FormatNumber';
import {
  getBulkSmsFee,
  getPhoneNumberList,
  getSmsPageCount,
  MIN_BULK_SMS_RECIPIENTS,
} from '../../constants/SmsHelpers';
import { logFeatures } from '../../utils/debugScopes';

const theme = Theme();
const SMS_PAGE_SIZE = 160;

const SectionHeader = ({ icon, title, hint }) => (
  <Row style={styles.sectionHeader}>
    <View style={styles.sectionIconWrap}>
      <MyIcon name={icon} size={18} color={theme.palette.primary} />
    </View>
    <View style={styles.sectionHeaderText}>
      <Title text={title} bold position="left" style={styles.sectionTitle} />
      {hint ? (
        <Title
          text={hint}
          small
          position="left"
          color={theme.palette.grayDark}
          style={styles.sectionHint}
        />
      ) : null}
    </View>
  </Row>
);

const BulkSms = () => {
  const [sendername, setSendername] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [message, setMessage] = useState('');
  const [data, setData] = useState({});
  const dispatch = useDispatch();
  const { siteSettings, user } = useSelector((state) => state.globalState);

  const pageCount = useMemo(() => getSmsPageCount(message), [message]);
  const phoneList = useMemo(
    () => getPhoneNumberList(phoneNumbers),
    [phoneNumbers]
  );
  const smsFee = useMemo(() => getBulkSmsFee(siteSettings), [siteSettings]);
  const estimatedCost = useMemo(() => {
    if (smsFee == null || !pageCount || !phoneList.length) return null;
    return pageCount * phoneList.length * smsFee;
  }, [pageCount, phoneList.length, smsFee]);

  const walletBalance = parseInt(user?.wallet, 10) || 0;
  const charsInCurrentPage =
    message.length % SMS_PAGE_SIZE ||
    (message.length > 0 ? SMS_PAGE_SIZE : 0);
  const pageProgress =
    message.length === 0 ? 0 : charsInCurrentPage / SMS_PAGE_SIZE;
  const nearPageLimit = charsInCurrentPage >= 140 && message.length > 0;
  const insufficientBalance =
    estimatedCost != null && walletBalance < estimatedCost;

  const hasEnoughRecipients = phoneList.length >= MIN_BULK_SMS_RECIPIENTS;

  const isFormReady =
    sendername.trim().length > 0 &&
    hasEnoughRecipients &&
    message.trim().length > 0;

  useEffect(() => {
    logFeatures('BulkSms', 'BulkSms estimate updated', {
      messageLength: message.length,
      pageCount,
      recipientCount: phoneList.length,
      smsFee,
      estimatedCost,
    });
  }, [message.length, pageCount, phoneList.length, smsFee, estimatedCost]);

  const handleSubmit = () => {
    if (!sendername.trim() || !phoneNumbers.trim() || !message.trim()) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Submit Error',
        textBody: 'Please fill in all fields',
        button: 'close',
      });
      return;
    }

    if (phoneList.length === 0) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Submit Error',
        textBody: 'Please enter at least one valid phone number',
        button: 'close',
      });
      return;
    }

    if (phoneList.length < MIN_BULK_SMS_RECIPIENTS) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Bulk SMS requires multiple recipients',
        textBody: `Add at least ${MIN_BULK_SMS_RECIPIENTS} phone numbers, separated by commas. Single-number sends are not supported.`,
        button: 'close',
      });
      return;
    }

    setData({
      type: 'bulk sms',
      sendername: sendername.trim(),
      phoneNumbers: phoneList.join(','),
      message,
      phoneCount: phoneList.length,
      pageCount,
      amount: estimatedCost,
    });
    logFeatures('BulkSms', 'BulkSms continue pressed', {
      sendername: sendername.trim(),
      phoneCount: phoneList.length,
      pageCount,
      messageLength: message.length,
      estimatedCost,
    });
    dispatch(toggleDataModel());
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SecondaryHeader text="Bulk SMS" />

        <Title
          text="Send SMS to multiple recipients in one go"
          small
          color={theme.palette.grayDark}
          style={styles.pageSubtitle}
        />

        {user?.wallet != null ? (
          <View style={styles.walletCard}>
            <Row style={styles.walletRow}>
              <View style={styles.walletIconWrap}>
                <MyIcon
                  name="wallet-outline"
                  size={22}
                  color={theme.palette.primary}
                />
              </View>
              <View style={styles.walletText}>
                <Title
                  text="Wallet balance"
                  small
                  color={theme.palette.grayDark}
                  style={styles.walletLabel}
                />
                <Title
                  text={`₦${formatMoney(walletBalance)}`}
                  bold
                  color={theme.palette.primary}
                  style={styles.walletAmount}
                />
              </View>
            </Row>
            {insufficientBalance && isFormReady ? (
              <Row style={styles.walletWarning}>
                <MyIcon
                  name="alert-circle-outline"
                  size={16}
                  color={theme.palette.red}
                />
                <Title
                  text="Insufficient balance for this send"
                  small
                  color={theme.palette.red}
                  style={styles.walletWarningText}
                />
              </Row>
            ) : null}
          </View>
        ) : null}

        <MyCard style={styles.sectionCard}>
          <SectionHeader
            icon="person-outline"
            title="Sender details"
            hint="Max 11 characters — shown as the SMS sender ID"
          />
          <MyInput
            text="Enter sender name"
            value={sendername}
            onChangeText={setSendername}
            maxLength={11}
            style={styles.inputWrap}
            inputStyle={styles.inputField}
          />
          <Row style={styles.counterRow}>
            <Title
              text={`${sendername.length}/11 characters`}
              small
              color={
                sendername.length >= 11
                  ? theme.palette.red
                  : theme.palette.grayDark
              }
              style={styles.counterText}
            />
          </Row>
        </MyCard>

        <MyCard style={styles.sectionCard}>
          <SectionHeader
            icon="people-outline"
            title="Recipients"
            hint={`Enter at least ${MIN_BULK_SMS_RECIPIENTS} numbers, separated by commas`}
          />
          <TextArea
            text="e.g. 08012345678, 08023456789, 08034567890"
            value={phoneNumbers}
            onChangeText={setPhoneNumbers}
            style={styles.textArea}
          />
          {phoneList.length >= MIN_BULK_SMS_RECIPIENTS ? (
            <View style={styles.recipientBadge}>
              <MyIcon
                name="checkmark-circle"
                size={16}
                color={theme.palette.primary}
              />
              <Title
                text={`${phoneList.length} valid numbers detected`}
                small
                color={theme.palette.primary}
                style={styles.recipientBadgeText}
              />
            </View>
          ) : phoneList.length === 1 ? (
            <Row style={styles.recipientWarning}>
              <MyIcon
                name="alert-circle-outline"
                size={16}
                color={theme.palette.red}
              />
              <Title
                text={`Bulk SMS needs at least ${MIN_BULK_SMS_RECIPIENTS} numbers — add one more`}
                small
                color={theme.palette.red}
                style={styles.recipientWarningText}
              />
            </Row>
          ) : phoneNumbers.trim().length > 0 ? (
            <Title
              text="Enter valid Nigerian phone numbers"
              small
              color={theme.palette.red}
              style={styles.recipientHint}
            />
          ) : null}
        </MyCard>

        <MyCard style={styles.sectionCard}>
          <SectionHeader
            icon="chatbubble-ellipses-outline"
            title="Message"
            hint="160 characters count as one SMS page"
          />
          <TextArea
            text="Type your SMS message here"
            value={message}
            onChangeText={setMessage}
            style={styles.textArea}
          />

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                nearPageLimit && styles.progressFillWarning,
                { width: `${Math.min(pageProgress * 100, 100)}%` },
              ]}
            />
          </View>
          <Row style={styles.charRow}>
            <Title
              text={`${message.length} total characters`}
              small
              color={theme.palette.grayDark}
              style={styles.charText}
            />
            <Title
              text={`${charsInCurrentPage}/${SMS_PAGE_SIZE} · page ${
                pageCount || 1
              }`}
              small
              color={nearPageLimit ? theme.palette.red : theme.palette.grayDark}
              style={styles.charText}
            />
          </Row>
        </MyCard>

        <MyCard style={styles.summaryCard}>
          <SectionHeader icon="calculator-outline" title="Cost summary" />
          <Row style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Title text="Pages" small color={theme.palette.grayDark} />
              <Title
                text={String(pageCount || 0)}
                bold
                style={styles.summaryValue}
              />
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Title text="Recipients" small color={theme.palette.grayDark} />
              <Title
                text={String(phoneList.length)}
                bold
                style={styles.summaryValue}
              />
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Title text="Rate" small color={theme.palette.grayDark} />
              <Title
                text={smsFee != null ? `₦${formatMoney(smsFee)}` : '—'}
                bold
                style={styles.summaryValue}
              />
            </View>
          </Row>

          <View style={styles.costDivider} />

          {estimatedCost !== null ? (
            <Row style={styles.costRow}>
              <Title text="Estimated total" position="left" bold />
              <Title
                text={`₦${formatMoney(estimatedCost)}`}
                bold
                color={theme.palette.primary}
                style={styles.costAmount}
              />
            </Row>
          ) : (
            <Title
              text={
                isFormReady
                  ? 'Rate unavailable — cost confirmed on next screen'
                  : 'Fill in the form to see your estimated cost'
              }
              position="left"
              small
              color={theme.palette.grayDark}
              style={styles.costHint}
            />
          )}

          {estimatedCost != null && pageCount > 0 && phoneList.length > 0 ? (
            <Title
              text={`${pageCount} page${pageCount === 1 ? '' : 's'} × ${
                phoneList.length
              } recipient${phoneList.length === 1 ? '' : 's'} × ₦${formatMoney(
                smsFee
              )}`}
              small
              color={theme.palette.grayDark}
              style={styles.formulaHint}
            />
          ) : null}
        </MyCard>
      </ScrollView>

      <View style={styles.footer}>
        {estimatedCost != null ? (
          <Row style={styles.footerCost}>
            <Title text="Total" small color={theme.palette.grayDark} />
            <Title
              text={`₦${formatMoney(estimatedCost)}`}
              bold
              color={theme.palette.primary}
            />
          </Row>
        ) : null}
        <MyButton
          text="Continue"
          onPress={handleSubmit}
          style={styles.continueBtn}
        />
      </View>

      <PayModel data={data} />
    </View>
  );
};

export default BulkSms;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1F7',
  },
  scrollContent: {
    padding: theme.window.windowWidth * 0.05,
    paddingBottom: 120,
  },
  pageSubtitle: {
    textAlign: 'center',
    letterSpacing: 0,
    marginTop: -4,
    marginBottom: 14,
  },
  walletCard: {
    backgroundColor: '#eef0ff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d8dcff',
  },
  walletRow: {
    alignItems: 'center',
  },
  walletIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.palette.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletText: {
    marginLeft: 12,
    flex: 1,
  },
  walletLabel: {
    letterSpacing: 0,
    marginBottom: 2,
  },
  walletAmount: {
    fontSize: 20,
  },
  walletWarning: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#d8dcff',
  },
  walletWarningText: {
    marginLeft: 6,
    letterSpacing: 0,
  },
  sectionCard: {
    marginBottom: 12,
    borderRadius: 12,
    padding: 14,
  },
  sectionHeader: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    letterSpacing: 0,
    fontSize: 16,
  },
  sectionHint: {
    marginTop: 2,
    letterSpacing: 0,
    lineHeight: 18,
  },
  inputWrap: {
    marginTop: 0,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    fontSize: 16,
    paddingVertical: 12,
    paddingLeft: 14,
    backgroundColor: '#fafafa',
  },
  textArea: {
    marginTop: 0,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    backgroundColor: '#fafafa',
    minHeight: 100,
    maxHeight: 140,
    fontSize: 16,
  },
  counterRow: {
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  counterText: {
    letterSpacing: 0,
    fontSize: 12,
  },
  recipientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#eef0ff',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recipientBadgeText: {
    marginLeft: 6,
    letterSpacing: 0,
    fontSize: 12,
  },
  recipientWarning: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  recipientWarningText: {
    marginLeft: 6,
    letterSpacing: 0,
    flex: 1,
    lineHeight: 18,
  },
  recipientHint: {
    marginTop: 8,
    letterSpacing: 0,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#e8e8e8',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.palette.primary,
    borderRadius: 3,
  },
  progressFillWarning: {
    backgroundColor: theme.palette.red,
  },
  charRow: {
    justifyContent: 'space-between',
    marginTop: 8,
  },
  charText: {
    letterSpacing: 0,
    fontSize: 12,
  },
  summaryCard: {
    marginBottom: 8,
    borderRadius: 12,
    padding: 14,
    backgroundColor: theme.palette.white,
    borderWidth: 1,
    borderColor: '#e8e4f5',
  },
  summaryRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 18,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#e8e8e8',
  },
  costDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  costRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costAmount: {
    fontSize: 20,
  },
  costHint: {
    letterSpacing: 0,
    lineHeight: 18,
  },
  formulaHint: {
    marginTop: 8,
    letterSpacing: 0,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.palette.white,
    paddingHorizontal: theme.window.windowWidth * 0.05,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    ...theme.ShadowLight,
  },
  footerCost: {
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  continueBtn: {
    marginVertical: 0,
    borderRadius: 10,
    height: 52,
  },
});

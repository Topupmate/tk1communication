import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Clipboard from '@react-native-clipboard/clipboard';

import SecondaryHeader from '../../components/global/SecondaryHeader';
import { Theme } from '../../constants/Theme';
import Title from '../../components/global/Title';
import MyButton from '../../components/global/Mybutton';
import TransparentButton from '../../components/global/TransParentButton';
import { GetTransactionDetails } from '../../store/apis/services';
import { Check, Copy } from 'react-native-feather';

const theme = Theme();

// Format electricity token with dashes for better readability
const formatElectricityToken = (token) => {
  if (!token) return '';
  
  // Remove any existing dashes and spaces
  const cleanToken = String(token).replace(/[-\s]/g, '');
  
  // Common electricity token format: XXXX-XXXX-XXXX-XXXX-XXXX (20 digits in groups of 4)
  // Some tokens might be different lengths, so we'll handle that
  if (cleanToken.length === 20) {
    return cleanToken.match(/.{1,4}/g).join('-');
  }
  
  // For other lengths, group by 4 digits
  return cleanToken.match(/.{1,4}/g)?.join('-') || cleanToken;
};

const TransactionStatus = ({ route, navigation }) => {
  const data = route?.params?.data;
  const [text, setText] = useState('Processing');
  const [imageurl, setImageurl] = useState(require('../../assets/pending.png'));
  const [color, setColor] = useState('orange');
  const { token } = useSelector((state) => state.globalState);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const pinFromRoute =
    data?.pin ??
    data?.token ??
    data?.tokens ??
    data?.pins ??
    data?.msg?.pin ??
    data?.msg?.token ??
    data?.msg?.tokens ??
    data?.msg?.pins ??
    data?.pin ??
    data?.examPin ??
    data?.exam_pin ??
    data?.token ??
    data?.response?.pin ??
    data?.response?.examPin ??
    data?.response?.exam_pin ??
    data?.response?.token ??
    data?.response?.msg?.pin ??
    data?.response?.msg?.token ??
    data?.response?.data?.pin ??
    data?.response?.data?.token;

  const pinFromDetails =
    transactionDetails?.pin ??
    transactionDetails?.token ??
    transactionDetails?.tokens ??
    transactionDetails?.pins ??
    transactionDetails?.msg?.pin ??
    transactionDetails?.msg?.token ??
    transactionDetails?.msg?.tokens ??
    transactionDetails?.msg?.pins ??
    transactionDetails?.response?.pin ??
    transactionDetails?.response?.token ??
    transactionDetails?.response?.pins ??
    transactionDetails?.msg?.pins;

  const purchasedPin = pinFromRoute || pinFromDetails;

  const electricityToken =
    data?.token ??
    data?.response?.token ??
    data?.response?.msg?.token ??
    data?.response?.msg?.data?.token ??
    transactionDetails?.token ??
    transactionDetails?.msg?.token ??
    transactionDetails?.response?.token;

  const serialNumber =
    data?.serial ??
    data?.serialNumber ??
    data?.serial_number ??
    data?.msg?.serial ??
    data?.msg?.serialNumber ??
    data?.msg?.serial_number ??
    data?.response?.serial ??
    data?.response?.serialNumber ??
    data?.response?.serial_number ??
    data?.response?.msg?.serial ??
    data?.response?.msg?.serialNumber ??
    data?.response?.msg?.serial_number;

  const ref = data?.ref || data?.transref;
  // Buy-data / buy-airtime modals set transactionFlow; also match ref prefix if API overwrites params.
  const isBuyDataFlow =
    data?.transactionFlow === 'buy-data' ||
    (typeof ref === 'string' && ref.startsWith('DATA_DATA_'));
  const isBuyAirtimeFlow =
    data?.transactionFlow === 'buy-airtime' ||
    (typeof ref === 'string' && ref.startsWith('AIRTIME_AIRTIME_'));
  const isBulkSmsFlow = data?.type?.toLowerCase() === 'bulk sms';
  // Covers 'Virtual Card', plus the Topup/Withdraw/Terminate variants.
  const isVirtualCardFlow = data?.type
    ?.toLowerCase()
    .startsWith('virtual card');
  const showWalletReceiptInCard = isBuyDataFlow || isBuyAirtimeFlow;

  useEffect(() => {
    console.log('[BUY_DATA_DEBUG]', 'TransactionStatus (buy-data check)', {
      ref,
      transactionFlow: data?.transactionFlow,
      isBuyDataFlow,
      isBuyAirtimeFlow,
      isVirtualCardFlow,
      showWalletReceiptInCard,
      message: data?.message,
      type: data?.type,
      dataKeys: data ? Object.keys(data) : [],
    });
  }, [
    ref,
    data?.transactionFlow,
    isBuyDataFlow,
    isBuyAirtimeFlow,
    isVirtualCardFlow,
    showWalletReceiptInCard,
    data?.message,
    data?.type,
  ]);

  const loadPin =
    data?.loadpin ??
    data?.load_pin ??
    data?.msg?.loadpin ??
    data?.msg?.load_pin ??
    data?.response?.loadpin ??
    data?.response?.load_pin ??
    data?.response?.msg?.loadpin ??
    data?.response?.msg?.load_pin;

  const checkBalance =
    data?.checkbalance ??
    data?.check_balance ??
    data?.msg?.checkbalance ??
    data?.msg?.check_balance ??
    data?.response?.checkbalance ??
    data?.response?.check_balance ??
    data?.response?.msg?.checkbalance ??
    data?.response?.msg?.check_balance;

  const handleCopy = ({ key, value }) => {
    if (!value) return;
    Clipboard.setString(String(value));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  useEffect(() => {
    if (
      data?.status?.toLowerCase() === 'fail' ||
      data?.status?.toString() === '1'
    ) {
      setColor('red');
      setImageurl(require('../../assets/fail.png'));
      setText('Failed');
    }
    if (
      data?.status?.toLowerCase() === 'success' ||
      data?.status?.toString() === '0' ||
      data?.status?.toString() === '2' ||
      data?.message?.toLowerCase() === 'success'
    ) {
      setImageurl(require('../../assets/success.png'));
      setText('Successful');
      setColor('green');
    }
    if (
      data?.status?.toLowerCase() === 'processing' ||
      data?.status?.toString() === '5'
    ) {
      setColor('orange');
      setText('Processing');
      setImageurl(require('../../assets/pending.png'));
    }
  }, []);

  useEffect(() => {
    const isPinProduct =
      data?.type?.toLowerCase() === 'exam-pin' ||
      data?.type?.toLowerCase() === 'airtime-pin' ||
      data?.type?.toLowerCase() === 'data-pin';
    const hasPin = Boolean(pinFromRoute && String(pinFromRoute).trim());
    const hasRef = Boolean(ref && String(ref).trim());

    if (!isPinProduct || hasPin || !hasRef) return;

    const fetchDetails = async () => {
      setDetailsLoading(true);
      try {
        const response = await GetTransactionDetails({ ref, token });
        if (response?.status === 'success') {
          setTransactionDetails(response?.response);
        }
      } catch (e) {
        // silent: status screen should not crash if details fail
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchDetails();
  }, [data?.type, ref, token]);

  return (
    <View style={styles.container}>
      <SecondaryHeader hideBack />
      <View style={styles.innerContainer}>
        <Image source={imageurl} style={styles.image} />
        <Title text={`Transaction ${text}`} header color={color} />
        <Title text={data?.message} style={{ marginTop: 5 }} small />
        <View style={styles.row}>
          {!isBulkSmsFlow && !isVirtualCardFlow && (
          <View style={styles.card}>
            <Title text="Details" bold />
            {!!ref && !showWalletReceiptInCard && (
              <Title text={`Reference: ${ref}`} small style={{ marginTop: 6 }} />
            )}

            {data?.type?.toLowerCase() === 'electricity' && !!electricityToken && (
              <View style={{ marginTop: 10 }}>
                <View style={styles.copyRow}>
                  <Title text={`Token: ${formatElectricityToken(electricityToken)}`} small />
                  <TouchableOpacity
                    onPress={() =>
                      handleCopy({ key: 'electricityToken', value: formatElectricityToken(electricityToken) })
                    }
                    style={styles.copyBtn}
                  >
                    {copiedKey === 'electricityToken' ? (
                      <Check color={theme.palette.black} />
                    ) : (
                      <Copy color={theme.palette.black} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {data?.type?.toLowerCase() === 'exam-pin' && !!purchasedPin && (() => {
                const pins = String(purchasedPin).split(',').map(p => p.trim()).filter(Boolean);
                const isMultiple = pins.length > 1;

                if (isMultiple) {
                  return (
                    <View style={{ marginTop: 10 }}>
                      {!!data?.exam && <Title text={`Exam: ${data?.exam}`} small bold style={{ marginBottom: 8 }} />}
                      <View style={styles.multiplePinSummary}>
                        <Title 
                          text={`${pins.length} PINs purchased successfully`} 
                          bold
                          style={{ color: theme.palette.primary, marginBottom: 4 }}
                        />
                        <Title 
                          text="Click 'View Pins' below to see all your PINs" 
                          small
                          style={{ opacity: 0.7 }}
                        />
                      </View>
                    </View>
                  );
                }

                // Single pin - show it directly
                const pin = pins[0];
                const serial = serialNumber ? String(serialNumber).trim() : null;

                return (
                  <View style={{ marginTop: 10 }}>
                    {!!data?.exam && <Title text={`Exam: ${data?.exam}`} small bold style={{ marginBottom: 8 }} />}
                    
                    <View style={styles.copyRow}>
                      <Title text={`PIN: ${pin}`} small style={{ flex: 1 }} />
                      <TouchableOpacity
                        onPress={() => handleCopy({ key: 'examPin', value: pin })}
                        style={styles.copyBtn}
                      >
                        {copiedKey === 'examPin' ? (
                          <Check color={theme.palette.black} />
                        ) : (
                          <Copy color={theme.palette.black} />
                        )}
                      </TouchableOpacity>
                    </View>

                    {serial && (
                      <View style={[styles.copyRow, { marginTop: 6 }]}>
                        <Title text={`Serial: ${serial}`} small style={{ flex: 1 }} />
                        <TouchableOpacity
                          onPress={() => handleCopy({ key: 'examSerial', value: serial })}
                          style={styles.copyBtn}
                        >
                          {copiedKey === 'examSerial' ? (
                            <Check color={theme.palette.black} />
                          ) : (
                            <Copy color={theme.palette.black} />
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })()}

            {(data?.type?.toLowerCase() === 'airtime-pin' ||
              data?.type?.toLowerCase() === 'data-pin') &&
              !!purchasedPin && (() => {
                const pinType = data?.type?.toLowerCase() === 'data-pin' ? 'Data' : 'Airtime';
                const pins = String(purchasedPin).split(',').map(p => p.trim()).filter(Boolean);
                const isMultiple = pins.length > 1;

                if (isMultiple) {
                  return (
                    <View style={{ marginTop: 10 }}>
                      <View style={styles.multiplePinSummary}>
                        <Title 
                          text={`${pins.length} ${pinType} PINs purchased successfully`} 
                          bold
                          style={{ color: theme.palette.primary, marginBottom: 4 }}
                        />
                        <Title 
                          text="Click 'View Pins' below to see all your PINs" 
                          small
                          style={{ opacity: 0.7 }}
                        />
                      </View>
                    </View>
                  );
                }

                // Single pin - show it directly
                const pin = pins[0];
                const serial = serialNumber ? String(serialNumber).trim() : null;

                return (
                  <View style={{ marginTop: 10 }}>
                    <View style={styles.copyRow}>
                      <Title text={`${pinType} PIN: ${pin}`} small style={{ flex: 1 }} />
                      <TouchableOpacity
                        onPress={() => handleCopy({ key: 'pinProductPin', value: pin })}
                        style={styles.copyBtn}
                      >
                        {copiedKey === 'pinProductPin' ? (
                          <Check color={theme.palette.black} />
                        ) : (
                          <Copy color={theme.palette.black} />
                        )}
                      </TouchableOpacity>
                    </View>

                    {serial && (
                      <View style={[styles.copyRow, { marginTop: 6 }]}>
                        <Title text={`Serial: ${serial}`} small style={{ flex: 1 }} />
                        <TouchableOpacity
                          onPress={() => handleCopy({ key: 'pinProductSerial', value: serial })}
                          style={styles.copyBtn}
                        >
                          {copiedKey === 'pinProductSerial' ? (
                            <Check color={theme.palette.black} />
                          ) : (
                            <Copy color={theme.palette.black} />
                          )}
                        </TouchableOpacity>
                      </View>
                    )}

                    {!!loadPin && (
                      <View style={[styles.copyRow, { marginTop: 6 }]}>
                        <Title text={`Load: ${loadPin}`} small />
                        <TouchableOpacity
                          onPress={() => handleCopy({ key: 'pinProductLoad', value: loadPin })}
                          style={styles.copyBtn}
                        >
                          {copiedKey === 'pinProductLoad' ? (
                            <Check color={theme.palette.black} />
                          ) : (
                            <Copy color={theme.palette.black} />
                          )}
                        </TouchableOpacity>
                      </View>
                    )}

                    {!!checkBalance && (
                      <View style={[styles.copyRow, { marginTop: 6 }]}>
                        <Title text={`Check Balance: ${checkBalance}`} small />
                        <TouchableOpacity
                          onPress={() => handleCopy({ key: 'pinProductCheckBalance', value: checkBalance })}
                          style={styles.copyBtn}
                        >
                          {copiedKey === 'pinProductCheckBalance' ? (
                            <Check color={theme.palette.black} />
                          ) : (
                            <Copy color={theme.palette.black} />
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })()}

            {(data?.type?.toLowerCase() === 'exam-pin' ||
              data?.type?.toLowerCase() === 'airtime-pin' ||
              data?.type?.toLowerCase() === 'data-pin') &&
              !purchasedPin &&
              detailsLoading && (
                <View style={{ marginTop: 10 }}>
                  <Title text="Fetching your PIN..." small />
                </View>
              )}
          </View>
          )}

          <MyButton
            text={isBulkSmsFlow ? 'Send Again' : 'Buy Again'}
            style={styles.button}
            onPress={() =>
              isBulkSmsFlow
                ? navigation.navigate('bulk sms')
                : navigation.goBack()
            }
          />
          <TransparentButton
            text="No Thanks"
            style={styles.button}
            onPress={() => navigation.replace('bottomTabs')}
          />
          {data?.type?.toLowerCase() === 'airtime-pin' && (
            <TransparentButton
              text="View Pins"
              style={styles.button}
              onPress={() => navigation.navigate('airtime pin history')}
            />
          )}
          {data?.type?.toLowerCase() === 'data-pin' && (
            <TransparentButton
              text="View Pins"
              style={styles.button}
              onPress={() => navigation.navigate('data pin history')}
            />
          )}
        </View>
        {/* {data?.type === 'airtime-pin' && (
          <TransparentButton
            style={{ borderWidth: 0 }}
            text="View Pins"
            onPress={() => navigation.navigate('airtime pin history')}
          />
        )}

        {data?.type === 'data-pin' && (
          <TransparentButton
            style={{ borderWidth: 0 }}
            text="View Pins"
            onPress={() => navigation.navigate('data pin history')}
          />
        )} */}
      </View>
    </View>
  );
};

export default TransactionStatus;

const styles = StyleSheet.create({
  container: {
    padding: theme.window.windowWidth * 0.05,
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'contain',
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  row: {
    width: '100%',
    marginTop: 20,
  },
  card: {
    backgroundColor: theme.palette.white,
    borderRadius: 14,
    padding: 14,
    ...theme.shadow,
    marginBottom: 10,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  copyBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: theme.palette.gray,
  },
  multiplePinSummary: {
    backgroundColor: theme.palette.primary + '15',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  button: {},
});

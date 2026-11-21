import { View, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import Row from '../global/Row';
import MyIcon from '../global/MyIcon';
import Title from '../global/Title';
import formatMoney from '../../constants/FormatNumber';
import FormatDate from '../../constants/FormatDate';
import Divider from '../global/Divider';
import { Theme } from '../../constants/Theme';

const theme = Theme();
function HistoryItem({ item }) {
  const navigation = useNavigation();
  const [color, setColor] = useState();
  const [status, setStatus] = useState();

  useEffect(() => {
    if (item?.status.toString() === '1') {
      setColor('red');
    } else if (item?.status.toString() === '0') {
      setColor('green');
    } else if (item?.status.toString() === '5') {
      setColor('orange');
    } else if (item?.status.toString() === '2') {
      setColor('green');
    }

    let statusText;
    if (item?.status.toString() === '1') {
      statusText = 'Failed';
    } else if (item?.status.toString() === '0') {
      statusText = 'Success';
    } else if (item?.status.toString() === '5') {
      statusText = 'Processing';
    } else if (item?.status.toString() === '2') {
      statusText = 'success';
    }
    setStatus(statusText);
  }, [item?.status]);
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('airtimeReceipt', { data: { ...item, status } })
      }
      style={{ marginVertical: 5 }}
    >
      <Row style={{ justifyContent: 'space-between' }}>
        <Row style={{ maxWidth: '60%' }}>
          <View style={[styles.listIcon, { backgroundColor: color }]}>
            <MyIcon
              name="reader-outline"
              color={theme.palette.white}
              size={20}
            />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Title text={item?.servicename} small bold position="left" />
            <Title text={item?.servicedesc} small position="left" />
          </View>
        </Row>
        <View style={{ alignItems: 'flex-end' }}>
          <Title
            text={`₦${formatMoney(parseFloat(item?.amount))}`}
            small
            bold
          />
          <Title text={FormatDate(item?.date)} small />
          <Title text={status} small color={color} textTransform="capitalize" />
        </View>
      </Row>
      <Divider />
    </TouchableOpacity>
  );
}
export default HistoryItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
  row: {
    marginBottom: 10,
  },
  input: {
    flex: 1,
  },
  icon: {
    marginTop: 20,
    marginLeft: 15,
    backgroundColor: theme.palette.primary,
    padding: 8,
    borderRadius: 10,
    ...theme.shadow,
    paddingLeft: 11,
  },
  listIcon: {
    height: 40,
    width: 40,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green',
  },
  loadingContainer: {
    height: 50,
    backgroundColor: theme.palette.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

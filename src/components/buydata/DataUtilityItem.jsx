import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Title from '../global/Title';
import { Theme } from '../../constants/Theme';
import Row from '../global/Row';
import CashbackHint from '../global/CashbackHint';

const theme = Theme();
function UtilityItem({ onPress, active, item, user }) {
  let price, image;
  switch (user?.account_type?.toLowerCase()) {
    case 'subscriber':
      price = item?.userprice;
      break;
    case 'agent':
      price = item?.agentprice;
      break;
    case 'vendor':
      price = item?.vendorprice;
      break;
    case 'dealer':
      price = item?.dealerprice;
      break;
    default:
      price = item?.userprice;
  }

  switch (item?.datanetwork.toString()) {
    case '1':
      image = require('../../assets/mtn.jpg');
      break;
    case '2':
      image = require('../../assets/airtel.png');
      break;
    case '3':
      image = require('../../assets/glo.png');
      break;
    case '4':
      image = require('../../assets/nmobile.png');
      break;
  }

  const onPressLogged = () => {
    console.log('[BUY_DATA_DEBUG]', 'DataUtilityItem press', {
      planid: item?.planid,
      name: item?.name,
      type: item?.type,
    });
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={onPressLogged}
      style={[
        styles.utilityContainer,
        active && { borderColor: theme.palette.primary },
      ]}
    >
      <Row style={{ flexWrap: 'wrap', maxWidth: '60%' }}>
        <Image source={image} style={styles.image} />
        <Text
          style={{
            fontSize: 20,
          }}
        >
          {item?.name} {item?.type}
        </Text>
      </Row>
      <Title
        text={`${`${item?.day} Days`}`}
        color={theme.palette.grayDark}
        bold
      />
      <View style={{ alignItems: 'flex-end' }}>
        <Title text={`₦${price}`} bold color={theme.palette.black} />
        <CashbackHint service="data" plan={item} style={{ marginTop: 0 }} />
      </View>
    </TouchableOpacity>
  );
}

export default UtilityItem;

const styles = StyleSheet.create({
  utilityContainer: {
    backgroundColor: '#f1f2f4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomColor: theme.palette.gray,
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 5,
  },
  image: {
    width: 30,
    height: 30,
    borderRadius: 25,
    resizeMode: 'contain',
  },
});

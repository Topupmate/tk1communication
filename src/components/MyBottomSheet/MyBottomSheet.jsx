import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Modal from 'react-native-modal';
import TransparentButton from '../global/TransParentButton';

const MyBottomSheet = ({ snapPoints, header, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: 'white', position: 'relative' }}>
      <TransparentButton
        text="Open Bottom Sheet"
        onPress={() => {
          setIsVisible(true);
        }}
      />
      {children}
      <Modal
        isVisible={isVisible}
        onBackdropPress={() => setIsVisible(false)}
        onSwipeComplete={() => setIsVisible(false)}
        swipeDirection={['down']}
        style={{ justifyContent: 'flex-end', margin: 0 }}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: '70%',
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: '600' }}>{header}</Text>
        </View>
      </Modal>
    </View>
  );
};

export default MyBottomSheet;

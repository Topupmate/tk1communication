import React, { forwardRef, useImperativeHandle, useState } from 'react';
import Modal from 'react-native-modal';
import { View, StyleSheet } from 'react-native';

import TransparentButton from './TransParentButton';
import { Theme } from '../../constants/Theme';

const theme = Theme();
const DraggableModel = forwardRef(
  ({ children, buttonText, ...otherProps }, ref) => {
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

    const closeModel = () => {
      setIsBottomSheetVisible(false);
    };

    useImperativeHandle(ref, () => ({
      closeModel,
    }));

    return (
      <>
        <View style={styles.container}>
          <TransparentButton
            text={buttonText || 'Create A Ticket'}
            onPress={() => {
              setIsBottomSheetVisible(true);
            }}
          />
        </View>

        <Modal
          isVisible={isBottomSheetVisible}
          onBackdropPress={() => setIsBottomSheetVisible(false)}
          onSwipeComplete={() => setIsBottomSheetVisible(false)}
          swipeDirection={['down']}
          style={styles.modal}
          backdropOpacity={0.5}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          {...otherProps}
        >
          <View style={styles.contentContainer}>{children}</View>
        </Modal>
      </>
    );
  }
);
export default DraggableModel;
const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  contentContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
    ...theme.shadow,
    zIndex: 100,
  },
});

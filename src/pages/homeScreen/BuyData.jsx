import { FlatList, StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';

import DataFormSection from '../../components/buydata/DataFormSection';
import SecondaryHeader from '../../components/global/SecondaryHeader';
import { Theme } from '../../constants/Theme';

const theme = Theme();
const BuyDataPage = () => {
  useEffect(() => {
    console.log('[BUY_DATA_DEBUG]', 'BuyDataPage mounted');
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={[1]}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        renderItem={() => (
          <>
            <View style={styles.container}>
              <SecondaryHeader text="Buy Data" />
            </View>

            <DataFormSection />
          </>
        )}
      />
    </View>
  );
};

export default BuyDataPage;

const styles = StyleSheet.create({
  container: {
    margin: 5,
  },
});

import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

import SecondaryHeader from '../../components/global/SecondaryHeader';
import { Theme } from '../../constants/Theme';
import MyCard from '../../components/global/MyCard';
import Row from '../../components/global/Row';
import MyIcon from '../../components/global/MyIcon';
import Title from '../../components/global/Title';
import {
  SERVICE_GROUPS,
  visibleGroupItems,
} from '../../constants/ServiceGroups';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';

const theme = Theme();

export default function ServiceGroup() {
  const navigation = useNavigation();
  const { group } = useRoute().params || {};
  const features = useFeatureAccess();
  const config = SERVICE_GROUPS[group];
  const items = visibleGroupItems(group, features);

  return (
    <View style={styles.container}>
      <SecondaryHeader text={config?.title || 'Services'} />
      {items.map((item) => (
        <TouchableOpacity
          key={item.route}
          onPress={() => navigation.navigate(item.route)}
        >
          <MyCard style={styles.card}>
            <Row>
              <MyIcon name={item.icon} color={theme.palette.primary} size={22} />
              <Title
                text={item.title}
                position="left"
                small
                style={styles.label}
              />
              <MyIcon
                name="chevron-forward"
                color={theme.palette.grayDark}
                size={18}
              />
            </Row>
          </MyCard>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.window.windowWidth * 0.05,
    backgroundColor: theme.palette.white,
  },
  card: {
    marginTop: 12,
  },
  label: {
    flex: 1,
    marginLeft: 12,
  },
});

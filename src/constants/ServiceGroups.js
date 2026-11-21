import { isFeatureOn } from './FeatureAccess';

export const SERVICE_GROUPS = {
  voice: {
    title: 'Voice',
    icon: 'call-outline',
    items: [
      {
        feature: 'alpha',
        title: 'Alpha Top-up',
        route: 'alpha page',
        icon: 'call-outline',
      },
      {
        feature: 'ratel',
        title: 'Ratel Top-up',
        route: 'ratel',
        icon: 'hardware-chip-outline',
      },
      {
        feature: 'kirani',
        title: 'Kirani Top-up',
        route: 'kirani',
        icon: 'radio-outline',
      },
    ],
  },
  internet: {
    title: 'Internet',
    icon: 'globe-outline',
    items: [
      {
        feature: 'smile',
        title: 'Smile',
        route: 'smile data page',
        icon: 'happy-outline',
      },
    ],
  },
};

export function visibleGroupItems(groupKey, features) {
  const group = SERVICE_GROUPS[groupKey];
  if (!group) return [];
  return group.items.filter((item) => isFeatureOn(features, item.feature));
}

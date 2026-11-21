module.exports = {
  dependencies: {
    '@react-native-community/clipboard': {
      platforms: {
        android: null,
        ios: null,
      },
    },
    // Pulled in by sp-react-native-in-app-updates. JS imports are redirected
    // to src/react-native-device-info-shim.js; skip the native module.
    'react-native-device-info': {
      platforms: {
        android: null,
        ios: null,
      },
    },
  },
};

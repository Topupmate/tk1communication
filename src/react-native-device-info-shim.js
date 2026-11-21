/**
 * JS stand-in for react-native-device-info.
 * sp-react-native-in-app-updates imports it, but we only need these helpers.
 * Metro resolves the package name to this file.
 */
import Constants from 'expo-constants';

export const getBundleId = () =>
  Constants.expoConfig?.ios?.bundleIdentifier ??
  Constants.expoConfig?.android?.package ??
  '';

export const getVersion = () => Constants.expoConfig?.version ?? '0.0.0';

export default {
  getBundleId,
  getVersion,
};

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const deviceInfoShimPath = path.resolve(
  __dirname,
  'src',
  'react-native-device-info-shim.js'
);

const defaultResolve = config.resolver?.resolveRequest;
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    if (moduleName === 'react-native-device-info') {
      return { type: 'sourceFile', filePath: deviceInfoShimPath };
    }
    return defaultResolve
      ? defaultResolve(context, moduleName, platform)
      : context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;

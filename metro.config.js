// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add resolver for crypto and other node modules
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    crypto: require.resolve('expo-crypto'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('@craftzdog/react-native-buffer').default,
  }
};

module.exports = config;

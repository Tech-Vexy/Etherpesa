const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for Node.js polyfills
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
    stream: require.resolve('react-native-stream'),
    crypto: require.resolve('react-native-quick-crypto'),
    buffer: require.resolve('@craftzdog/react-native-buffer'),
    http: require.resolve('@react-native-community/netinfo'),
    https: require.resolve('@react-native-community/netinfo'),
  },
};

// Ensure these are treated as Node.js modules
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

module.exports = config;

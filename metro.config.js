const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for Node.js polyfills
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
    // Core crypto and buffer
    stream: require.resolve('react-native-stream'),
    crypto: require.resolve('react-native-quick-crypto'),
    buffer: require.resolve('@craftzdog/react-native-buffer'),
    
    // Network modules - provide polyfills for basic functionality
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    net: require.resolve('react-native-tcp-socket'), // Disable net module - not needed for React Native
    tls: require.resolve('react-native-tcp-socket'), // Disable tls module - not needed for React Native

    // File system and OS
    fs: false, // Most FS operations don't work in React Native
    os: require.resolve('react-native-os'),
    
    // Path and utilities
    path: require.resolve('path-browserify'),
    util: require.resolve('util'),
    url: require.resolve('url'),
    querystring: require.resolve('querystring-es3'),
    events: require.resolve('events'),
    assert: require.resolve('assert'),
    
    // Modules that don't exist in React Native
    zlib: require.resolve('browserify-zlib'), // Disable zlib - causes issues with WebSocket polyfills
    readline: false,
    child_process: false,
    cluster: false,
    dgram: false,
    dns: false,
    domain: false,
    module: false,
    perf_hooks: false,
    punycode: false,
    repl: false,
    string_decoder: false,
    sys: false,
    timers: false,
    tty: false,
    v8: false,
    vm: false,
    worker_threads: false,
    // Explicitly disable WebSocket server modules
    ws: require.resolve('./polyfills/empty-websocket.js'),
  },
  // Block problematic modules at the resolver level
  blockList: [
    /node_modules\/ws\/lib\/websocket-server\.js$/,
    /node_modules\/ws\/lib\/permessage-deflate\.js$/,
  ],
};

// Ensure these are treated as Node.js modules
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

module.exports = config;

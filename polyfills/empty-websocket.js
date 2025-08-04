// Empty WebSocket polyfill for React Native
// This prevents the ws package from trying to import Node.js modules

module.exports = {
  WebSocket: global.WebSocket || function() {
    throw new Error('WebSocket not available in this environment');
  },
  WebSocketServer: function() {
    throw new Error('WebSocketServer not available in React Native');
  }
};

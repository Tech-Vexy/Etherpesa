import { Linking } from 'react-native';

// Transak configuration for Etherlink
export const TRANSAK_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_TRANSAK_API_KEY || 'YOUR_TRANSAK_API_KEY',
  environment: 'STAGING', // Use 'PRODUCTION' for mainnet
  defaultCryptoCurrency: 'USDC',
  networks: 'etherlink',
  walletAddress: '',
  disableWalletAddressForm: true,
};

/**
 * Open Transak widget for buying crypto (on-ramp)
 * @param walletAddress User's wallet address
 * @param amount Optional amount in USD
 */
export const openTransakBuy = (walletAddress: string, amount?: number) => {
  const params = new URLSearchParams({
    apiKey: TRANSAK_CONFIG.apiKey,
    environment: TRANSAK_CONFIG.environment,
    defaultCryptoCurrency: TRANSAK_CONFIG.defaultCryptoCurrency,
    networks: TRANSAK_CONFIG.networks,
    walletAddress,
    disableWalletAddressForm: 'true',
    ...(amount && { defaultFiatAmount: amount.toString() }),
  });

  const url = `https://global-stg.transak.com/?${params.toString()}`;
  Linking.openURL(url);
};

/**
 * Open Transak widget for selling crypto (off-ramp)
 * @param walletAddress User's wallet address
 * @param amount Optional amount in USDC
 */
export const openTransakSell = (walletAddress: string, amount?: number) => {
  const params = new URLSearchParams({
    apiKey: TRANSAK_CONFIG.apiKey,
    environment: TRANSAK_CONFIG.environment,
    defaultCryptoCurrency: TRANSAK_CONFIG.defaultCryptoCurrency,
    networks: TRANSAK_CONFIG.networks,
    walletAddress,
    disableWalletAddressForm: 'true',
    productsAvailed: 'SELL',
    ...(amount && { defaultCryptoAmount: amount.toString() }),
  });

  const url = `https://global-stg.transak.com/?${params.toString()}`;
  Linking.openURL(url);
};

/**
 * Initialize Transak KYC flow
 * @param walletAddress User's wallet address
 */
export const initTransakKYC = (walletAddress: string) => {
  const params = new URLSearchParams({
    apiKey: TRANSAK_CONFIG.apiKey,
    environment: TRANSAK_CONFIG.environment,
    walletAddress,
    productsAvailed: 'BUY',
    hideMenu: 'true',
    themeColor: '007AFF',
  });

  const url = `https://global-stg.transak.com/?${params.toString()}`;
  Linking.openURL(url);
};

/**
 * Check if Transak is properly configured
 */
export const isTransakConfigured = (): boolean => {
  return TRANSAK_CONFIG.apiKey !== 'YOUR_TRANSAK_API_KEY' && TRANSAK_CONFIG.apiKey.length > 0;
};
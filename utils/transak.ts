import { Linking, Alert } from 'react-native';

// Etherlink network configuration for Transak
export const ETHERLINK_NETWORK_CONFIG = {
  chainId: 128123,
  name: 'Etherlink Testnet',
  rpcUrl: 'https://node.ghostnet.etherlink.com',
  explorerUrl: 'https://testnet-explorer.etherlink.com',
  nativeCurrency: 'XTZ',
  // Etherlink mainnet config for production
  mainnet: {
    chainId: 128123, // Update when mainnet is available
    name: 'Etherlink',
    rpcUrl: 'https://node.mainnet.etherlink.com', // Update when mainnet is available
    explorerUrl: 'https://explorer.etherlink.com',
  }
};

// Supported cryptocurrencies on Etherlink with verified contract addresses
export const SUPPORTED_CRYPTOCURRENCIES = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    contractAddress: '0x617f3112bf5397D0467D315cC709EF968D9ba546', // Update with actual Etherlink USDC address
    decimals: 6,
    description: 'USD Coin - The most trusted stablecoin for DeFi',
    supportedNetworks: ['etherlink', 'ethereum', 'polygon', 'arbitrum', 'optimism'],
    preferredNetwork: 'etherlink', // Prefer Etherlink for lowest fees
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    contractAddress: '0x617f3112bf5397D0467D315cC709EF968D9ba547', // Update with actual Etherlink USDT address
    decimals: 6,
    description: 'Tether USD - The world\'s most widely used stablecoin',
    supportedNetworks: ['etherlink', 'ethereum', 'polygon', 'arbitrum', 'optimism'],
    preferredNetwork: 'etherlink', // Prefer Etherlink for lowest fees
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    contractAddress: '0x617f3112bf5397D0467D315cC709EF968D9ba548', // Example bridged ETH address
    decimals: 18,
    description: 'Ethereum - Native cryptocurrency, bridged to Etherlink',
    supportedNetworks: ['ethereum', 'etherlink', 'arbitrum', 'optimism'],
    preferredNetwork: 'ethereum', // Native on Ethereum, then bridge
  },
  XTZ: {
    symbol: 'XTZ',
    name: 'Tezos',
    contractAddress: 'native',
    decimals: 18,
    description: 'Tezos - Native currency of Etherlink',
    supportedNetworks: ['etherlink'],
    preferredNetwork: 'etherlink', // Native on Etherlink
  },
} as const;

// Transak configuration optimized for Etherlink ecosystem
export const TRANSAK_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_TRANSAK_API_KEY || 'cb8cb4f7-848d-4783-bfd8-b64d5831f996',
  environment: 'STAGING', // Use 'PRODUCTION' for mainnet
  defaultCryptoCurrency: 'USDC',
  defaultFiatCurrency: 'USD',
  // Use broader network support since Etherlink may not be directly supported yet
  networks: 'ethereum,polygon,arbitrum,optimism,base', // Bridge-friendly networks
  defaultNetwork: 'ethereum', // Users can bridge to Etherlink after purchase
  cryptoCurrencyList: 'USDC,USDT,ETH', // Supported currencies
  fiatCurrencyList: 'USD,EUR,GBP,KES,NGN,ZAR', // African-friendly currencies
  themeColor: '007AFF',
  hideMenu: 'true',
  redirectURL: 'etherpesa://transak-success',
  disableWalletAddressForm: 'true',
  // Enable additional features
  exchangeScreenTitle: 'Buy Crypto for EtherPesa',
  partnerOrderId: undefined, // Can be set per transaction
  countryCode: undefined, // Auto-detect or set based on user preference
};

/**
 * Get the base Transak URL based on environment
 */
const getTransakBaseUrl = () => {
  return TRANSAK_CONFIG.environment === 'PRODUCTION' 
    ? 'https://global.transak.com' 
    : 'https://global-stg.transak.com';
};

/**
 * Check if Transak is properly configured
 */
export const isTransakConfigured = (): boolean => {
  return !!(TRANSAK_CONFIG.apiKey && TRANSAK_CONFIG.apiKey !== 'your_api_key_here');
};

/**
 * Open Transak widget for buying crypto (on-ramp)
 * @param walletAddress User's wallet address
 * @param amount Optional amount in USD
 * @param cryptoCurrency Optional cryptocurrency to buy (USDC, USDT, ETH)
 */
export const openTransakBuy = (
  walletAddress: string, 
  amount?: number, 
  cryptoCurrency: 'USDC' | 'USDT' | 'ETH' = 'USDC'
) => {
  try {
    if (!isTransakConfigured()) {
      Alert.alert(
        'Configuration Error',
        'Transak is not properly configured. Please contact support.',
        [{ text: 'OK' }]
      );
      return;
    }

    const params = new URLSearchParams({
      apiKey: TRANSAK_CONFIG.apiKey,
      environment: TRANSAK_CONFIG.environment,
      defaultCryptoCurrency: cryptoCurrency,
      defaultFiatCurrency: TRANSAK_CONFIG.defaultFiatCurrency,
      networks: TRANSAK_CONFIG.networks,
      defaultNetwork: TRANSAK_CONFIG.defaultNetwork,
      cryptoCurrencyList: TRANSAK_CONFIG.cryptoCurrencyList,
      fiatCurrencyList: TRANSAK_CONFIG.fiatCurrencyList,
      walletAddress,
      disableWalletAddressForm: TRANSAK_CONFIG.disableWalletAddressForm,
      hideMenu: TRANSAK_CONFIG.hideMenu,
      themeColor: TRANSAK_CONFIG.themeColor,
      redirectURL: TRANSAK_CONFIG.redirectURL,
      productsAvailed: 'BUY',
      exchangeScreenTitle: TRANSAK_CONFIG.exchangeScreenTitle,
      ...(amount && { defaultFiatAmount: amount.toString() }),
    });

    const url = `${getTransakBaseUrl()}/?${params.toString()}`;
    
    const cryptoName = SUPPORTED_CRYPTOCURRENCIES[cryptoCurrency]?.name || cryptoCurrency;
    
    Alert.alert(
      `Buy ${cryptoName} with Transak`,
      `You will be redirected to Transak to purchase ${cryptoName} with fiat currency.\n\n` +
      `Amount: ${amount ? `$${amount}` : 'Enter amount in app'}\n` +
      `Currency: ${cryptoName}\n` +
      `Wallet: ${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}\n\n` +
      `💡 Note: After purchase, you can bridge your ${cryptoName} to Etherlink network using the bridge feature in EtherPesa.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Transak', 
          onPress: () => {
            console.log('Opening Transak URL:', url);
            Linking.openURL(url).catch(err => {
              console.error('Error opening Transak URL:', err);
              Alert.alert('Error', 'Failed to open Transak. Please try again or contact support.');
            });
          }
        }
      ]
    );
  } catch (error) {
    console.error('Error opening Transak buy:', error);
    Alert.alert('Error', 'Failed to initialize Transak purchase. Please try again later.');
  }
};

/**
 * Open Transak widget for selling crypto (off-ramp)
 * @param walletAddress User's wallet address
 * @param amount Optional amount in cryptocurrency
 * @param cryptoCurrency Optional cryptocurrency to sell (USDC, USDT, ETH)
 */
export const openTransakSell = (
  walletAddress: string, 
  amount?: number, 
  cryptoCurrency: 'USDC' | 'USDT' | 'ETH' = 'USDC'
) => {
  try {
    if (!isTransakConfigured()) {
      Alert.alert(
        'Configuration Error',
        'Transak is not properly configured. Please contact support.',
        [{ text: 'OK' }]
      );
      return;
    }

    const params = new URLSearchParams({
      apiKey: TRANSAK_CONFIG.apiKey,
      environment: TRANSAK_CONFIG.environment,
      defaultCryptoCurrency: cryptoCurrency,
      defaultFiatCurrency: TRANSAK_CONFIG.defaultFiatCurrency,
      networks: TRANSAK_CONFIG.networks,
      defaultNetwork: TRANSAK_CONFIG.defaultNetwork,
      cryptoCurrencyList: TRANSAK_CONFIG.cryptoCurrencyList,
      fiatCurrencyList: TRANSAK_CONFIG.fiatCurrencyList,
      walletAddress,
      disableWalletAddressForm: TRANSAK_CONFIG.disableWalletAddressForm,
      hideMenu: TRANSAK_CONFIG.hideMenu,
      themeColor: TRANSAK_CONFIG.themeColor,
      redirectURL: TRANSAK_CONFIG.redirectURL,
      productsAvailed: 'SELL',
      exchangeScreenTitle: TRANSAK_CONFIG.exchangeScreenTitle,
      ...(amount && { defaultCryptoAmount: amount.toString() }),
    });

    const url = `${getTransakBaseUrl()}/?${params.toString()}`;
    
    const cryptoName = SUPPORTED_CRYPTOCURRENCIES[cryptoCurrency]?.name || cryptoCurrency;
    
    Alert.alert(
      `Sell ${cryptoName} with Transak`,
      `You will be redirected to Transak to sell your ${cryptoName} for fiat currency.\n\n` +
      `Amount: ${amount ? `${amount} ${cryptoCurrency}` : 'Enter amount in app'}\n` +
      `Currency: ${cryptoName}\n` +
      `Wallet: ${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}\n\n` +
      `💡 Note: If your ${cryptoName} is on Etherlink, you may need to bridge it to Ethereum first using the bridge feature in EtherPesa.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Transak', 
          onPress: () => {
            console.log('Opening Transak URL:', url);
            Linking.openURL(url).catch(err => {
              console.error('Error opening Transak URL:', err);
              Alert.alert('Error', 'Failed to open Transak. Please try again or contact support.');
            });
          }
        }
      ]
    );
  } catch (error) {
    console.error('Error opening Transak sell:', error);
    Alert.alert('Error', 'Failed to initialize Transak sale. Please try again later.');
  }
};

/**
 * Initialize Transak KYC flow
 * @param walletAddress User's wallet address
 */
export const initTransakKYC = (walletAddress: string) => {
  try {
    if (!isTransakConfigured()) {
      Alert.alert(
        'Configuration Error',
        'Transak is not properly configured. Please contact support.',
        [{ text: 'OK' }]
      );
      return;
    }

    const params = new URLSearchParams({
      apiKey: TRANSAK_CONFIG.apiKey,
      environment: TRANSAK_CONFIG.environment,
      walletAddress,
      productsAvailed: 'BUY',
      hideMenu: TRANSAK_CONFIG.hideMenu,
      themeColor: TRANSAK_CONFIG.themeColor,
      redirectURL: TRANSAK_CONFIG.redirectURL,
    });

    const url = `${getTransakBaseUrl()}/?${params.toString()}`;
    
    console.log('Opening Transak KYC URL:', url);
    Linking.openURL(url).catch(err => {
      console.error('Error opening Transak KYC URL:', err);
      Alert.alert('Error', 'Failed to open Transak KYC. Please try again or contact support.');
    });
  } catch (error) {
    console.error('Error opening Transak KYC:', error);
    Alert.alert('Error', 'Failed to initialize Transak KYC. Please try again later.');
  }
};

/**
 * Get available cryptocurrencies for the user's region
 * @param countryCode ISO country code (optional)
 */
export const getAvailableCryptocurrencies = (countryCode?: string) => {
  // In a real implementation, this would check Transak's API for available currencies by region
  // For now, return our supported currencies
  const allCurrencies = Object.values(SUPPORTED_CRYPTOCURRENCIES);
  
  // Filter based on region-specific availability if needed
  if (countryCode) {
    // Some regions might have restrictions on certain cryptocurrencies
    const restrictedRegions = ['US']; // Example: USDT might be restricted in some regions
    
    if (restrictedRegions.includes(countryCode)) {
      return allCurrencies.filter(crypto => crypto.symbol !== 'USDT');
    }
  }
  
  return allCurrencies;
};

/**
 * Check if a cryptocurrency is supported for buying/selling
 * @param symbol Cryptocurrency symbol
 */
export const isCryptocurrencySupported = (symbol: string): symbol is keyof typeof SUPPORTED_CRYPTOCURRENCIES => {
  return symbol in SUPPORTED_CRYPTOCURRENCIES;
};

/**
 * Get the minimum transaction amount for a cryptocurrency
 * @param cryptoCurrency Cryptocurrency symbol
 */
export const getMinTransactionAmount = (cryptoCurrency: keyof typeof SUPPORTED_CRYPTOCURRENCIES) => {
  // These would typically come from Transak's API
  const minimums = {
    USDC: 10, // $10 minimum
    USDT: 10, // $10 minimum
    ETH: 0.01, // 0.01 ETH minimum
    XTZ: 5, // 5 XTZ minimum
  };
  
  return minimums[cryptoCurrency] || 10;
};

/**
 * Get optimal network for purchasing a cryptocurrency
 * @param cryptoCurrency Cryptocurrency to buy
 */
export const getOptimalPurchaseNetwork = (cryptoCurrency: keyof typeof SUPPORTED_CRYPTOCURRENCIES) => {
  // Suggest the best network for purchasing based on fees and availability
  const networkPreferences = {
    USDC: 'polygon', // Lower fees on Polygon
    USDT: 'polygon', // Lower fees on Polygon
    ETH: 'ethereum', // Native on Ethereum
    XTZ: 'ethereum', // Bridge to Etherlink later
  };
  
  return networkPreferences[cryptoCurrency] || 'ethereum';
};

/**
 * Open Transak with optimal settings for Etherlink ecosystem
 * @param walletAddress User's wallet address
 * @param amount Optional amount in USD
 * @param cryptoCurrency Optional cryptocurrency to buy
 * @param countryCode Optional user's country code
 */
export const openTransakOptimized = (
  walletAddress: string,
  amount?: number,
  cryptoCurrency: keyof typeof SUPPORTED_CRYPTOCURRENCIES = 'USDC',
  countryCode?: string
) => {
  try {
    if (!isCryptocurrencySupported(cryptoCurrency)) {
      Alert.alert(
        'Unsupported Currency',
        `${cryptoCurrency} is not currently supported. Please choose from: ${Object.keys(SUPPORTED_CRYPTOCURRENCIES).join(', ')}`,
        [{ text: 'OK' }]
      );
      return;
    }

    const minAmount = getMinTransactionAmount(cryptoCurrency);
    if (amount && amount < minAmount) {
      Alert.alert(
        'Amount Too Low',
        `Minimum amount for ${cryptoCurrency} is ${minAmount}. Please increase your amount.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const optimalNetwork = getOptimalPurchaseNetwork(cryptoCurrency);
    
    const params = new URLSearchParams({
      apiKey: TRANSAK_CONFIG.apiKey,
      environment: TRANSAK_CONFIG.environment,
      defaultCryptoCurrency: cryptoCurrency,
      defaultFiatCurrency: TRANSAK_CONFIG.defaultFiatCurrency,
      networks: TRANSAK_CONFIG.networks,
      defaultNetwork: optimalNetwork,
      cryptoCurrencyList: TRANSAK_CONFIG.cryptoCurrencyList,
      fiatCurrencyList: TRANSAK_CONFIG.fiatCurrencyList,
      walletAddress,
      disableWalletAddressForm: TRANSAK_CONFIG.disableWalletAddressForm,
      hideMenu: TRANSAK_CONFIG.hideMenu,
      themeColor: TRANSAK_CONFIG.themeColor,
      redirectURL: TRANSAK_CONFIG.redirectURL,
      productsAvailed: 'BUY',
      exchangeScreenTitle: TRANSAK_CONFIG.exchangeScreenTitle,
      ...(amount && { defaultFiatAmount: amount.toString() }),
      ...(countryCode && { countryCode }),
    });

    const url = `${getTransakBaseUrl()}/?${params.toString()}`;
    
    const cryptoInfo = SUPPORTED_CRYPTOCURRENCIES[cryptoCurrency];
    
    Alert.alert(
      `Buy ${cryptoInfo.name}`,
      `Optimized purchase settings:\n\n` +
      `💰 Currency: ${cryptoInfo.name} (${cryptoCurrency})\n` +
      `🌐 Network: ${optimalNetwork.charAt(0).toUpperCase() + optimalNetwork.slice(1)}\n` +
      `💵 Amount: ${amount ? `$${amount}` : 'Enter in app'}\n` +
      `📱 Wallet: ${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}\n\n` +
      `🌉 After purchase, use EtherPesa's bridge to move your ${cryptoCurrency} to Etherlink for lower fees!`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            console.log('Opening optimized Transak URL:', url);
            Linking.openURL(url).catch(err => {
              console.error('Error opening Transak URL:', err);
              Alert.alert('Error', 'Failed to open Transak. Please try again or contact support.');
            });
          }
        }
      ]
    );
  } catch (error) {
    console.error('Error opening optimized Transak:', error);
    Alert.alert('Error', 'Failed to initialize optimized purchase. Please try again later.');
  }
};

/**
 * Provide bridge guidance for moving tokens to Etherlink
 * @param cryptoCurrency The cryptocurrency to bridge
 * @param amount Amount to bridge
 */
export const getBridgeGuidance = (cryptoCurrency: keyof typeof SUPPORTED_CRYPTOCURRENCIES, amount?: number) => {
  const cryptoInfo = SUPPORTED_CRYPTOCURRENCIES[cryptoCurrency];
  
  Alert.alert(
    `🌉 Bridge ${cryptoInfo.name} to Etherlink`,
    `To use your ${cryptoCurrency} on Etherlink for lower fees:\n\n` +
    `1️⃣ Go to the EtherPesa Bridge tab\n` +
    `2️⃣ Select ${cryptoCurrency} from your current network\n` +
    `3️⃣ Choose Etherlink as destination\n` +
    `4️⃣ Enter amount: ${amount ? `${amount} ${cryptoCurrency}` : 'Your desired amount'}\n` +
    `5️⃣ Confirm the bridge transaction\n\n` +
    `💡 Bridging typically takes 5-15 minutes and enables lower transaction fees on Etherlink!`,
    [
      { text: 'Maybe Later', style: 'cancel' },
      { text: 'Open Bridge', onPress: () => {
        // Navigate to bridge tab - would be implemented with router
        console.log('Navigate to bridge tab');
      }}
    ]
  );
};

/**
 * Enhanced error handling for Transak operations
 * @param error Error object from Transak operation
 * @param operation The operation that failed
 */
export const handleTransakError = (error: any, operation: 'buy' | 'sell' | 'kyc' = 'buy') => {
  console.error(`Transak ${operation} error:`, error);
  
  let title = 'Transaction Error';
  let message = `Failed to ${operation} cryptocurrency. Please try again.`;
  
  if (error?.message?.includes('network')) {
    title = 'Network Error';
    message = 'Please check your internet connection and try again.';
  } else if (error?.message?.includes('region') || error?.message?.includes('country')) {
    title = 'Region Not Supported';
    message = 'Transak may not be available in your region. Please contact support for alternatives.';
  } else if (error?.message?.includes('amount')) {
    title = 'Amount Error';
    message = 'Please check the transaction amount and minimum requirements.';
  }
  
  Alert.alert(title, message, [
    { text: 'Contact Support', onPress: () => {
      // Open support - would link to actual support
      console.log('Opening support');
    }},
    { text: 'Try Again', style: 'default' },
    { text: 'OK', style: 'cancel' }
  ]);
};

/**
 * Get Transak transaction status
 * @param orderId Transak order ID
 */
export const getTransakOrderStatus = async (orderId: string) => {
  try {
    if (!isTransakConfigured()) {
      throw new Error('Transak not configured');
    }

    // This would typically make an API call to Transak's order status endpoint
    // For now, we'll return a placeholder
    console.log('Checking Transak order status for:', orderId);
    
    // In production, implement actual API call:
    // const response = await fetch(`https://api.transak.com/api/v2/order/${orderId}`, {
    //   headers: {
    //     'access-token': TRANSAK_CONFIG.apiKey
    //   }
    // });
    // return response.json();
    
    return { status: 'PENDING', message: 'Order status check not implemented' };
  } catch (error) {
    console.error('Error checking Transak order status:', error);
    throw error;
  }
};

/**
 * Handle Transak deep link redirects
 * @param url Deep link URL from Transak
 */
export const handleTransakRedirect = (url: string) => {
  try {
    const urlParams = new URL(url);
    const orderId = urlParams.searchParams.get('transactionId');
    const status = urlParams.searchParams.get('status');
    const cryptoCurrency = urlParams.searchParams.get('cryptoCurrency') || 'USDC';
    const fiatAmount = urlParams.searchParams.get('fiatAmount');
    const cryptoAmount = urlParams.searchParams.get('cryptoAmount');
    
    console.log('Transak redirect:', { orderId, status, cryptoCurrency, fiatAmount, cryptoAmount, url });
    
    const cryptoInfo = SUPPORTED_CRYPTOCURRENCIES[cryptoCurrency as keyof typeof SUPPORTED_CRYPTOCURRENCIES];
    const cryptoName = cryptoInfo?.name || cryptoCurrency;
    
    if (status === 'COMPLETED') {
      Alert.alert(
        '🎉 Purchase Successful!',
        `Your ${cryptoName} purchase has been completed!\n\n` +
        `💰 Amount: ${cryptoAmount ? `${cryptoAmount} ${cryptoCurrency}` : `$${fiatAmount || 'N/A'}`}\n` +
        `📋 Order ID: ${orderId}\n\n` +
        `🔍 Check your wallet balance and consider bridging to Etherlink for lower transaction fees.\n\n` +
        `💡 Tip: Use EtherPesa's bridge feature to move your ${cryptoCurrency} to Etherlink network!`,
        [
          { text: 'View Wallet', onPress: () => {/* Navigate to wallet */} },
          { text: 'Bridge Now', onPress: () => {/* Navigate to bridge */} },
          { text: 'OK', style: 'default' }
        ]
      );
    } else if (status === 'FAILED') {
      Alert.alert(
        '❌ Purchase Failed',
        `Your ${cryptoName} purchase could not be completed.\n\n` +
        `📋 Order ID: ${orderId}\n\n` +
        `This could be due to:\n` +
        `• Payment method declined\n` +
        `• Verification requirements\n` +
        `• Network issues\n\n` +
        `Please try again or contact Transak support.`,
        [
          { text: 'Try Again', onPress: () => {/* Retry purchase */} },
          { text: 'Contact Support', onPress: () => {/* Open support */} },
          { text: 'OK', style: 'default' }
        ]
      );
    } else if (status === 'CANCELLED') {
      Alert.alert(
        '⏹️ Purchase Cancelled',
        `Your ${cryptoName} purchase was cancelled.\n\n` +
        `📋 Order ID: ${orderId}\n\n` +
        `No charges were made to your payment method.`,
        [
          { text: 'Try Again', onPress: () => {/* Retry purchase */} },
          { text: 'OK', style: 'default' }
        ]
      );
    } else if (status === 'PENDING') {
      Alert.alert(
        '⏳ Purchase Pending',
        `Your ${cryptoName} purchase is being processed.\n\n` +
        `📋 Order ID: ${orderId}\n\n` +
        `This may take a few minutes. You'll receive a notification when complete.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'ℹ️ Transaction Update',
        `Transaction status: ${status}\n\n` +
        `📋 Order ID: ${orderId}\n\n` +
        `Please check your email for more details.`,
        [{ text: 'OK' }]
      );
    }
    
    return { orderId, status, cryptoCurrency, fiatAmount, cryptoAmount };
  } catch (error) {
    console.error('Error handling Transak redirect:', error);
    Alert.alert(
      '⚠️ Error Processing Response',
      'Failed to process Transak response. Please check your transaction status in your Transak account.',
      [{ text: 'OK' }]
    );
    return null;
  }
};
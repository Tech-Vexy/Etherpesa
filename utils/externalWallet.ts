import { readContract } from 'thirdweb';
import { etherlink, client } from '@/constants/thirdweb';
import { 
  fetchCryptoPrices, 
  convertToUSD, 
  formatUSDValue,
  CryptoPrices 
} from './priceConversion';

/**
 * Fetch external wallet balances (native token and optionally ERC20 tokens)
 */
export interface ExternalWalletBalances {
  native: string; // XTZ balance in readable format
  nativeRaw: bigint; // Raw balance in wei
  nativeSymbol: string; // XTZ
  walletType: string; // e.g., 'MetaMask', 'Coinbase', etc.
  usdValue?: number; // USD value of native balance
}

/**
 * Multi-token balance interface for portfolio view
 */
export interface MultiTokenBalance {
  symbol: string;
  amount: string;
  name: string;
  usdValue: number;
  price: number;
}

/**
 * Fetch native balance for external wallets (MetaMask, Coinbase, etc.)
 */
export async function fetchExternalWalletBalance(
  walletAddress: string,
  walletId?: string
): Promise<ExternalWalletBalances> {
  try {
    // Use Etherlink RPC endpoint directly for reliability
    const rpcUrl = 'https://node.ghostnet.etherlink.com';
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [walletAddress, 'latest'],
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    // Convert hex to bigint
    const balanceWei = BigInt(data.result || '0x0');
    
    // Convert to readable format (18 decimals for XTZ)
    const balanceFormatted = (Number(balanceWei) / Math.pow(10, 18)).toFixed(4);

    // Determine wallet type based on wallet ID
    let walletType = 'External Wallet';
    if (walletId) {
      const lowerWalletId = walletId.toLowerCase();
      if (lowerWalletId.includes('metamask')) walletType = 'MetaMask';
      else if (lowerWalletId.includes('coinbase')) walletType = 'Coinbase Wallet';
      else if (lowerWalletId.includes('rainbow')) walletType = 'Rainbow';
      else if (lowerWalletId.includes('trust')) walletType = 'Trust Wallet';
      else if (lowerWalletId.includes('zerion')) walletType = 'Zerion';
    }

    // Calculate USD value
    let usdValue = 0;
    try {
      const prices = await fetchCryptoPrices();
      usdValue = convertToUSD(balanceFormatted, 'XTZ', prices);
    } catch (error) {
      console.warn('Failed to fetch USD value for XTZ balance:', error);
    }

    return {
      native: balanceFormatted,
      nativeRaw: balanceWei,
      nativeSymbol: 'XTZ', // Etherlink native token
      walletType,
      usdValue,
    };
  } catch (error) {
    console.error('Error fetching external wallet balance:', error);
    // Return zero balance instead of throwing to prevent app crashes
    return {
      native: '0.0000',
      nativeRaw: BigInt(0),
      nativeSymbol: 'XTZ',
      walletType: walletId ? getWalletDisplayName(walletId) : 'External Wallet',
      usdValue: 0,
    };
  }
}

/**
 * Fetch USDC balance from external wallet (if they have USDC tokens)
 * This would require the USDC contract address on Etherlink
 */
export async function fetchExternalUSDCBalance(
  walletAddress: string,
  usdcContractAddress?: string
): Promise<string> {
  if (!usdcContractAddress) {
    return '0.00';
  }

  try {
    // This would require a proper USDC contract setup
    // For now, return 0 as placeholder
    return '0.00';
  } catch (error) {
    console.error('Error fetching external USDC balance:', error);
    return '0.00';
  }
}

/**
 * Check if the current wallet is an external wallet (not in-app wallet)
 */
export function isExternalWallet(walletId?: string): boolean {
  if (!walletId) return false;
  
  console.log('Checking wallet ID:', walletId); // Debug log to see what wallet is detected
  
  const externalWalletIds = [
    'io.metamask',
    'metamask',
    'com.coinbase.wallet',
    'coinbase',
    'me.rainbow',
    'rainbow',
    'com.trustwallet.app',
    'trust',
    'io.zerion.wallet',
    'zerion'
  ];
  
  return externalWalletIds.some(id => walletId.toLowerCase().includes(id));
}

/**
 * Get wallet display name
 */
export function getWalletDisplayName(walletId?: string): string {
  if (!walletId) return 'Unknown Wallet';
  
  const lowerWalletId = walletId.toLowerCase();
  
  if (lowerWalletId.includes('metamask')) return 'MetaMask';
  if (lowerWalletId.includes('coinbase')) return 'Coinbase Wallet';
  if (lowerWalletId.includes('rainbow')) return 'Rainbow';
  if (lowerWalletId.includes('trust')) return 'Trust Wallet';
  if (lowerWalletId.includes('zerion')) return 'Zerion';
  if (lowerWalletId.includes('inapp')) return 'EtherPesa Wallet';
  
  return 'External Wallet';
}

/**
 * Fetch comprehensive wallet portfolio including multiple tokens
 * This simulates what MetaMask shows - all tokens with USD values
 */
export async function fetchWalletPortfolio(
  walletAddress: string,
  internalUSDCBalance: string = '0',
  walletId?: string
): Promise<MultiTokenBalance[]> {
  try {
    const portfolio: MultiTokenBalance[] = [];
    const prices = await fetchCryptoPrices();

    // Add internal USDC balance (from EtherPesa contract)
    if (parseFloat(internalUSDCBalance) > 0) {
      const usdcValue = convertToUSD(internalUSDCBalance, 'USDC', prices);
      portfolio.push({
        symbol: 'USDC',
        amount: internalUSDCBalance,
        name: 'USD Coin (EtherPesa)',
        usdValue: usdcValue,
        price: prices.USDC || 1,
      });
    }

    // Add native XTZ balance from external wallet
    const nativeBalance = await fetchExternalWalletBalance(walletAddress, walletId);
    if (parseFloat(nativeBalance.native) > 0) {
      portfolio.push({
        symbol: 'XTZ',
        amount: nativeBalance.native,
        name: 'Tezos',
        usdValue: nativeBalance.usdValue || 0,
        price: prices.XTZ || 0,
      });
    }

    // TODO: Add support for other ERC20 tokens on Etherlink
    // This would require contract addresses for USDT, ETH bridged tokens, etc.
    // For now, we'll add placeholder support

    return portfolio.sort((a, b) => b.usdValue - a.usdValue); // Sort by USD value
  } catch (error) {
    console.error('Error fetching wallet portfolio:', error);
    return [];
  }
}

/**
 * Format portfolio for display in components
 */
export function formatPortfolioForDisplay(portfolio: MultiTokenBalance[]): {
  symbol: string;
  amount: string;
  name: string;
}[] {
  return portfolio.map(item => ({
    symbol: item.symbol,
    amount: item.amount,
    name: item.name,
  }));
}

/**
 * Cryptocurrency Price Conversion Utilities
 * 
 * Provides automatic conversion of XTZ, ETH, USDT, USDC to USD
 * similar to MetaMask's price display functionality
 */

export interface CryptoPrices {
  XTZ: number;
  ETH: number;
  USDT: number;
  USDC: number;
  // Add more currencies as needed
}

export interface CurrencyBalance {
  symbol: string;
  amount: string;
  usdValue: number;
  price: number;
}

export interface TotalBalance {
  totalUSD: number;
  currencies: CurrencyBalance[];
}

// Cache for prices to avoid excessive API calls
let priceCache: CryptoPrices | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Fetch current cryptocurrency prices from CoinGecko API
 */
export async function fetchCryptoPrices(): Promise<CryptoPrices> {
  const now = Date.now();
  
  // Return cached prices if still valid
  if (priceCache && (now - lastFetchTime) < CACHE_DURATION) {
    return priceCache;
  }

  try {
    // Using CoinGecko API (free tier) - no API key required
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=tezos,ethereum,tether,usd-coin&vs_currencies=usd',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Map CoinGecko response to our format
    const prices: CryptoPrices = {
      XTZ: data.tezos?.usd || 0,
      ETH: data.ethereum?.usd || 0,
      USDT: data.tether?.usd || 1, // Should be ~1 USD
      USDC: data['usd-coin']?.usd || 1, // Should be ~1 USD
    };

    // Update cache
    priceCache = prices;
    lastFetchTime = now;
    
    console.log('Fetched crypto prices:', prices);
    return prices;
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    
    // Return fallback prices if API fails
    const fallbackPrices: CryptoPrices = {
      XTZ: 1.20, // Approximate fallback price
      ETH: 3200, // Approximate fallback price
      USDT: 1.00, // Stable
      USDC: 1.00, // Stable
    };
    
    // Update cache with fallback
    priceCache = fallbackPrices;
    lastFetchTime = now;
    
    return fallbackPrices;
  }
}

/**
 * Convert cryptocurrency amount to USD value
 */
export function convertToUSD(amount: string | number, symbol: string, prices: CryptoPrices): number {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return 0;
  }

  const normalizedSymbol = symbol.toUpperCase() as keyof CryptoPrices;
  const price = prices[normalizedSymbol];
  
  if (!price) {
    console.warn(`Price not available for ${symbol}`);
    return 0;
  }

  return numericAmount * price;
}

/**
 * Format USD value for display
 */
export function formatUSDValue(usdValue: number): string {
  if (usdValue === 0) return '$0.00';
  
  // For very small amounts, show more decimals
  if (usdValue < 0.01) {
    return `$${usdValue.toFixed(6)}`;
  }
  
  // For amounts less than $1, show 4 decimals
  if (usdValue < 1) {
    return `$${usdValue.toFixed(4)}`;
  }
  
  // For regular amounts, show 2 decimals
  if (usdValue < 1000) {
    return `$${usdValue.toFixed(2)}`;
  }
  
  // For larger amounts, use locale formatting
  return `$${usdValue.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

/**
 * Calculate total USD value for multiple currencies
 */
export async function calculateTotalBalance(
  balances: { symbol: string; amount: string }[]
): Promise<TotalBalance> {
  try {
    const prices = await fetchCryptoPrices();
    
    const currencies: CurrencyBalance[] = balances.map(balance => {
      const usdValue = convertToUSD(balance.amount, balance.symbol, prices);
      const price = prices[balance.symbol.toUpperCase() as keyof CryptoPrices] || 0;
      
      return {
        symbol: balance.symbol,
        amount: balance.amount,
        usdValue,
        price,
      };
    });
    
    const totalUSD = currencies.reduce((sum, currency) => sum + currency.usdValue, 0);
    
    return {
      totalUSD,
      currencies,
    };
  } catch (error) {
    console.error('Error calculating total balance:', error);
    
    // Return zero values on error
    return {
      totalUSD: 0,
      currencies: balances.map(balance => ({
        symbol: balance.symbol,
        amount: balance.amount,
        usdValue: 0,
        price: 0,
      })),
    };
  }
}

/**
 * Get price change indicator (for future enhancement)
 */
export function getPriceChangeIndicator(currentPrice: number, previousPrice?: number): {
  change: number;
  changePercent: number;
  direction: 'up' | 'down' | 'neutral';
} {
  if (!previousPrice || previousPrice === 0) {
    return { change: 0, changePercent: 0, direction: 'neutral' };
  }
  
  const change = currentPrice - previousPrice;
  const changePercent = (change / previousPrice) * 100;
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  
  return { change, changePercent, direction };
}

/**
 * Hook for real-time price updates (React Hook)
 */
export function useCryptoPrices(refreshInterval: number = 30000) {
  const [prices, setPrices] = React.useState<CryptoPrices | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchPrices = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const newPrices = await fetchCryptoPrices();
      setPrices(newPrices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // Initial fetch
    fetchPrices();

    // Set up interval for regular updates
    const interval = setInterval(fetchPrices, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchPrices, refreshInterval]);

  return { prices, loading, error, refetch: fetchPrices };
}

// Re-export React for the hook
import React from 'react';

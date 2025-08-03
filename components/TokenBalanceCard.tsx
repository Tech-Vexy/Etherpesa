import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import Ionicons from '@expo/vector-icons/Ionicons';
import { 
  fetchCryptoPrices, 
  convertToUSD, 
  formatUSDValue, 
  CryptoPrices,
  getPriceChangeIndicator 
} from '@/utils/priceConversion';

interface TokenBalanceCardProps {
  symbol: string; // XTZ, ETH, USDT, USDC
  balance: string;
  name: string; // Full name like "Tezos", "Ethereum"
  icon?: string; // Ionicon name
  onPress?: () => void;
  showPriceChange?: boolean;
}

export function TokenBalanceCard({ 
  symbol, 
  balance, 
  name, 
  icon,
  onPress,
  showPriceChange = false
}: TokenBalanceCardProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const borderColor = useThemeColor({}, 'border');

  // Price state for automatic USD conversion
  const [prices, setPrices] = useState<CryptoPrices | null>(null);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [previousPrice, setPreviousPrice] = useState<number | undefined>();

  useEffect(() => {
    const loadPrices = async () => {
      try {
        const currentPrices = await fetchCryptoPrices();
        
        // Store previous price for change calculation
        if (prices && symbol in prices) {
          setPreviousPrice(prices[symbol as keyof CryptoPrices]);
        }
        
        setPrices(currentPrices);
      } catch (error) {
        console.error('Failed to fetch prices:', error);
      } finally {
        setPricesLoading(false);
      }
    };

    loadPrices();
    
    // Update prices every 30 seconds
    const interval = setInterval(loadPrices, 30000);
    return () => clearInterval(interval);
  }, [symbol, prices]);

  // Calculate values
  const usdValue = prices ? convertToUSD(balance, symbol, prices) : 0;
  const currentPrice = prices ? prices[symbol as keyof CryptoPrices] : 0;
  const priceChange = showPriceChange ? 
    getPriceChangeIndicator(currentPrice, previousPrice) : null;

  // Get appropriate icon
  const getTokenIcon = (tokenSymbol: string): string => {
    switch (tokenSymbol.toLowerCase()) {
      case 'xtz': return 'diamond-outline';
      case 'eth': return 'flash-outline';
      case 'usdt': case 'usdc': return 'ellipse-outline';
      default: return 'wallet-outline';
    }
  };

  const tokenIcon = icon || getTokenIcon(symbol);

  // Color for price change
  const getPriceChangeColor = () => {
    if (!priceChange) return subtextColor;
    switch (priceChange.direction) {
      case 'up': return '#10B981'; // Green
      case 'down': return '#EF4444'; // Red
      default: return subtextColor;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <ThemedView style={[
        styles.card, 
        { backgroundColor: cardBackground, borderColor }
      ]}>
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor }]}>
            <Ionicons 
              name={tokenIcon as any} 
              size={24} 
              color={textColor} 
            />
          </View>
          
          <View style={styles.tokenInfo}>
            <ThemedText style={[styles.tokenName, { color: textColor }]}>
              {name}
            </ThemedText>
            <ThemedText style={[styles.tokenSymbol, { color: subtextColor }]}>
              {symbol}
              {showPriceChange && priceChange && (
                <ThemedText style={[styles.priceChange, { color: getPriceChangeColor() }]}>
                  {' '}
                  {priceChange.direction === 'up' ? '↗' : priceChange.direction === 'down' ? '↘' : '→'}
                  {' '}
                  {Math.abs(priceChange.changePercent).toFixed(2)}%
                </ThemedText>
              )}
            </ThemedText>
          </View>
        </View>

        <View style={styles.rightSection}>
          <ThemedText style={[styles.balance, { color: textColor }]}>
            {parseFloat(balance).toFixed(4)} {symbol}
          </ThemedText>
          <ThemedText style={[styles.usdValue, { color: subtextColor }]}>
            {pricesLoading ? 'Loading...' : formatUSDValue(usdValue)}
          </ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  tokenSymbol: {
    fontSize: 14,
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  balance: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  usdValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});

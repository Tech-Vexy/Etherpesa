import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import Ionicons from '@expo/vector-icons/Ionicons';
import { 
  fetchWalletPortfolio, 
  formatPortfolioForDisplay,
  MultiTokenBalance 
} from '@/utils/externalWallet';
import { 
  calculateTotalBalance, 
  formatUSDValue 
} from '@/utils/priceConversion';

interface USDPortfolioSummaryProps {
  walletAddress: string;
  internalBalance: string;
  externalBalance?: string;
  externalSymbol?: string;
  walletType?: string;
  onPress?: () => void;
  refreshTrigger?: number; // Can be used to trigger refresh
}

export function USDPortfolioSummary({ 
  walletAddress, 
  internalBalance, 
  externalBalance, 
  externalSymbol = 'XTZ',
  walletType,
  onPress,
  refreshTrigger = 0
}: USDPortfolioSummaryProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const accentColor = useThemeColor({}, 'tint');

  const [portfolio, setPortfolio] = useState<MultiTokenBalance[]>([]);
  const [totalUSD, setTotalUSD] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPortfolio();
  }, [walletAddress, internalBalance, externalBalance, refreshTrigger]);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch comprehensive portfolio
      const portfolioData = await fetchWalletPortfolio(
        walletAddress, 
        internalBalance, 
        walletType
      );

      setPortfolio(portfolioData);

      // Calculate total USD value
      const total = portfolioData.reduce((sum, item) => sum + item.usdValue, 0);
      setTotalUSD(total);

    } catch (error) {
      console.error('Error loading portfolio:', error);
      setError('Failed to load portfolio');
      
      // Fallback calculation
      try {
        const balances = [
          { symbol: 'USDC', amount: internalBalance },
          ...(externalBalance ? [{ symbol: externalSymbol, amount: externalBalance }] : [])
        ];
        
        const fallbackTotal = await calculateTotalBalance(balances);
        setTotalUSD(fallbackTotal.totalUSD);
      } catch (fallbackError) {
        console.error('Fallback calculation failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const getPortfolioSummary = () => {
    if (portfolio.length === 0) {
      return 'No assets';
    }

    const nonZeroAssets = portfolio.filter(item => item.usdValue > 0);
    if (nonZeroAssets.length === 1) {
      return `${nonZeroAssets[0].symbol} only`;
    }
    
    return `${nonZeroAssets.length} assets`;
  };

  const getTopAsset = () => {
    const topAsset = portfolio.reduce((max, item) => 
      item.usdValue > max.usdValue ? item : max, 
      { usdValue: 0, symbol: '', amount: '0', name: '', price: 0 }
    );
    
    return topAsset.usdValue > 0 ? topAsset : null;
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <ThemedView style={[styles.container, { backgroundColor: cardBackground }]}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="wallet" size={20} color={accentColor} />
          </View>
          
          <View style={styles.titleContainer}>
            <ThemedText style={[styles.title, { color: textColor }]}>
              Portfolio Value
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: subtextColor }]}>
              {loading ? 'Calculating...' : error ? 'Error loading' : getPortfolioSummary()}
            </ThemedText>
          </View>

          {loading && (
            <ActivityIndicator size="small" color={accentColor} />
          )}
          
          {onPress && !loading && (
            <Ionicons name="chevron-forward" size={20} color={subtextColor} />
          )}
        </View>

        <View style={styles.valueSection}>
          <ThemedText style={[styles.totalValue, { color: textColor }]}>
            {loading ? 'Loading...' : error ? '--' : formatUSDValue(totalUSD)}
          </ThemedText>
          
          {!loading && !error && getTopAsset() && (
            <ThemedText style={[styles.topAsset, { color: subtextColor }]}>
              Largest: {getTopAsset()?.symbol} ({formatUSDValue(getTopAsset()?.usdValue || 0)})
            </ThemedText>
          )}
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={16} color="#EF4444" />
            <ThemedText style={[styles.errorText, { color: '#EF4444' }]}>
              {error}
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  valueSection: {
    alignItems: 'flex-start',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  topAsset: {
    fontSize: 12,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    marginLeft: 4,
  },
});

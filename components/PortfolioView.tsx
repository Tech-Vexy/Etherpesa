import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { TokenBalanceCard } from './TokenBalanceCard';
import { 
  calculateTotalBalance, 
  formatUSDValue, 
  TotalBalance,
  useCryptoPrices
} from '@/utils/priceConversion';
import Ionicons from '@expo/vector-icons/Ionicons';

interface PortfolioViewProps {
  balances: {
    symbol: string;
    amount: string;
    name: string;
  }[];
  onTokenPress?: (symbol: string) => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function PortfolioView({ 
  balances, 
  onTokenPress, 
  isRefreshing = false, 
  onRefresh 
}: PortfolioViewProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const accentColor = useThemeColor({}, 'tint');

  const [totalBalance, setTotalBalance] = useState<TotalBalance | null>(null);
  const [loading, setLoading] = useState(true);

  // Use the price hook for real-time updates
  const { prices, loading: pricesLoading, error: pricesError, refetch } = useCryptoPrices(30000);

  useEffect(() => {
    const calculateTotal = async () => {
      try {
        setLoading(true);
        const total = await calculateTotalBalance(balances);
        setTotalBalance(total);
      } catch (error) {
        console.error('Error calculating total balance:', error);
      } finally {
        setLoading(false);
      }
    };

    if (balances.length > 0) {
      calculateTotal();
    }
  }, [balances, prices]);

  const handleRefresh = async () => {
    if (onRefresh) {
      onRefresh();
    }
    await refetch();
  };

  // Filter out zero balances
  const nonZeroBalances = balances.filter(balance => parseFloat(balance.amount) > 0);

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing || loading} 
            onRefresh={handleRefresh}
            tintColor={accentColor}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Portfolio Header */}
        <View style={[styles.headerCard, { backgroundColor: cardBackground }]}>
          <View style={styles.headerContent}>
            <Ionicons name="wallet" size={24} color={accentColor} />
            <ThemedText style={[styles.headerTitle, { color: textColor }]}>
              Total Portfolio Value
            </ThemedText>
          </View>
          
          <ThemedText style={[styles.totalValue, { color: textColor }]}>
            {loading || pricesLoading ? 
              'Calculating...' : 
              formatUSDValue(totalBalance?.totalUSD || 0)
            }
          </ThemedText>
          
          {pricesError && (
            <ThemedText style={[styles.errorText, { color: '#EF4444' }]}>
              Price data unavailable
            </ThemedText>
          )}
        </View>

        {/* Token List */}
        <View style={styles.tokenList}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Assets ({nonZeroBalances.length})
          </ThemedText>
          
          {nonZeroBalances.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: cardBackground }]}>
              <Ionicons name="wallet-outline" size={48} color={subtextColor} />
              <ThemedText style={[styles.emptyStateText, { color: subtextColor }]}>
                No assets found
              </ThemedText>
              <ThemedText style={[styles.emptyStateSubtext, { color: subtextColor }]}>
                Purchase some crypto to get started
              </ThemedText>
            </View>
          ) : (
            nonZeroBalances.map((balance, index) => (
              <TokenBalanceCard
                key={`${balance.symbol}-${index}`}
                symbol={balance.symbol}
                balance={balance.amount}
                name={balance.name}
                onPress={() => onTokenPress?.(balance.symbol)}
                showPriceChange={true}
              />
            ))
          )}
        </View>

        {/* Price Update Indicator */}
        {prices && (
          <View style={styles.priceUpdateIndicator}>
            <ThemedText style={[styles.priceUpdateText, { color: subtextColor }]}>
              Prices updated {new Date().toLocaleTimeString()}
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: -1,
  },
  errorText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  tokenList: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    margin: 16,
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  priceUpdateIndicator: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  priceUpdateText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

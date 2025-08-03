/**
 * Example integration of automatic USD conversion in Home screen
 * This shows how to integrate the MetaMask-like price conversion
 * into your existing EtherPesa app screens
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useActiveAccount } from 'thirdweb/react';
import { EnhancedBalanceCard } from '@/components/EnhancedBalanceCard';
import { PortfolioView } from '@/components/PortfolioView';
import { TokenBalanceCard } from '@/components/TokenBalanceCard';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { 
  fetchWalletPortfolio, 
  formatPortfolioForDisplay,
  fetchExternalWalletBalance 
} from '@/utils/externalWallet';
import { useCryptoPrices } from '@/utils/priceConversion';

export default function EnhancedHomeScreen() {
  const account = useActiveAccount();
  const backgroundColor = useThemeColor({}, 'background');
  
  // State for wallet balances
  const [internalBalance, setInternalBalance] = useState('1250.50'); // From your contract
  const [externalBalance, setExternalBalance] = useState<string | undefined>();
  const [portfolioBalances, setPortfolioBalances] = useState<any[]>([]);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Use real-time price updates
  const { prices, loading: pricesLoading, refetch } = useCryptoPrices(30000);

  // Fetch balances when account connects
  useEffect(() => {
    if (account?.address) {
      loadWalletData();
    }
  }, [account?.address]);

  const loadWalletData = async () => {
    if (!account?.address) return;

    try {
      // Fetch external wallet balance
      const externalWallet = await fetchExternalWalletBalance(
        account.address, 
        'metamask' // This would come from your wallet detection
      );
      setExternalBalance(externalWallet.native);

      // Fetch comprehensive portfolio
      const portfolio = await fetchWalletPortfolio(
        account.address, 
        internalBalance, 
        'metamask'
      );
      setPortfolioBalances(formatPortfolioForDisplay(portfolio));
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadWalletData();
      await refetch();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTokenPress = (symbol: string) => {
    // Navigate to token details or actions
    console.log('Token pressed:', symbol);
  };

  if (!account) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedText>Please connect your wallet</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Balance Card with USD Conversion */}
        <EnhancedBalanceCard
          internalBalance={internalBalance}
          externalBalance={externalBalance}
          externalSymbol="XTZ"
          walletType="MetaMask"
          address={account.address}
          onEyePress={() => setIsBalanceHidden(!isBalanceHidden)}
          isBalanceHidden={isBalanceHidden}
        />

        {/* Portfolio View - MetaMask Style */}
        <PortfolioView
          balances={portfolioBalances}
          onTokenPress={handleTokenPress}
          isRefreshing={refreshing}
          onRefresh={handleRefresh}
        />

        {/* Individual Token Cards */}
        <View style={styles.tokenSection}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          
          {/* Example individual token cards */}
          <TokenBalanceCard
            symbol="USDC"
            balance={internalBalance}
            name="USD Coin"
            icon="ellipse"
            onPress={() => handleTokenPress('USDC')}
            showPriceChange={true}
          />

          {externalBalance && parseFloat(externalBalance) > 0 && (
            <TokenBalanceCard
              symbol="XTZ"
              balance={externalBalance}
              name="Tezos"
              icon="diamond-outline"
              onPress={() => handleTokenPress('XTZ')}
              showPriceChange={true}
            />
          )}
        </View>

        {/* Price Update Status */}
        {prices && (
          <View style={styles.priceStatus}>
            <ThemedText style={styles.priceStatusText}>
              {pricesLoading ? 'Updating prices...' : 'Prices up to date'}
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
  tokenSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  priceStatus: {
    alignItems: 'center',
    padding: 16,
  },
  priceStatusText: {
    fontSize: 12,
    opacity: 0.7,
  },
});

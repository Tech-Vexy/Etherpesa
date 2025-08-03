import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import Ionicons from '@expo/vector-icons/Ionicons';
import { 
  fetchCryptoPrices, 
  convertToUSD, 
  formatUSDValue, 
  CryptoPrices 
} from '@/utils/priceConversion';

interface WalletBalance {
  type: 'internal' | 'external';
  balance: string;
  symbol: string;
  walletName: string;
  address: string;
}

interface EnhancedBalanceCardProps {
  internalBalance: string; // EtherPesa contract balance
  externalBalance?: string; // External wallet native balance
  externalSymbol?: string; // XTZ, ETH, etc.
  walletType?: string; // MetaMask, Coinbase, etc.
  address: string;
  onEyePress?: () => void;
  isBalanceHidden?: boolean;
}

export function EnhancedBalanceCard({ 
  internalBalance, 
  externalBalance, 
  externalSymbol = 'XTZ',
  walletType = 'External Wallet',
  address, 
  onEyePress, 
  isBalanceHidden = false 
}: EnhancedBalanceCardProps) {
  const backgroundColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'textInverted');
  const iconColor = useThemeColor({}, 'textInverted');
  const cardSecondary = useThemeColor({}, 'backgroundSecondary');

  // Price state for automatic USD conversion
  const [prices, setPrices] = useState<CryptoPrices | null>(null);
  const [pricesLoading, setPricesLoading] = useState(true);

  useEffect(() => {
    const loadPrices = async () => {
      try {
        const currentPrices = await fetchCryptoPrices();
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
  }, []);

  const hasExternalBalance = externalBalance && parseFloat(externalBalance) > 0;

  // Calculate USD values
  const internalUSDValue = prices ? convertToUSD(internalBalance, 'USDC', prices) : 0;
  const externalUSDValue = prices && hasExternalBalance ? 
    convertToUSD(externalBalance, externalSymbol, prices) : 0;
  const totalUSDValue = internalUSDValue + externalUSDValue;

  return (
    <ThemedView style={[styles.card, { backgroundColor }]}>
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <ThemedText style={[styles.greeting, { color: textColor }]}>Good Morning</ThemedText>
          <ThemedText style={[styles.accountType, { color: textColor }]}>
            {hasExternalBalance ? `EtherPesa + ${walletType}` : 'EtherPesa Account'}
          </ThemedText>
        </View>
        <TouchableOpacity onPress={onEyePress} style={styles.eyeButton}>
          <Ionicons 
            name={isBalanceHidden ? "eye-off" : "eye"} 
            size={24} 
            color={iconColor} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Primary Balance - EtherPesa USDC */}
      <View style={styles.balanceSection}>
        <View style={styles.balanceHeader}>
          <Ionicons name="wallet" size={16} color={iconColor} />
          <ThemedText style={[styles.balanceLabel, { color: textColor }]}>
            EtherPesa Balance
          </ThemedText>
        </View>
        <ThemedText style={[styles.balance, { color: textColor }]}>
          {isBalanceHidden ? '***,*** USDC' : `${Number(internalBalance).toLocaleString('en-US')} USDC`}
        </ThemedText>
        
        {/* USD Value Display */}
        <ThemedText style={[styles.usdValue, { color: textColor }]}>
          {isBalanceHidden ? '***.**' : 
            pricesLoading ? 'Loading...' : 
            formatUSDValue(internalUSDValue)
          }
        </ThemedText>
      </View>

      {/* External Wallet Balance */}
      {hasExternalBalance && (
        <View style={[styles.externalBalanceSection, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
          <View style={styles.balanceHeader}>
            <Ionicons name="card" size={16} color={iconColor} />
            <ThemedText style={[styles.balanceLabel, { color: textColor }]}>
              {walletType} Balance
            </ThemedText>
          </View>
          <ThemedText style={[styles.externalBalance, { color: textColor }]}>
            {isBalanceHidden ? '***.**' : externalBalance} {externalSymbol}
          </ThemedText>
          
          {/* External Balance USD Value */}
          <ThemedText style={[styles.externalUsdValue, { color: textColor }]}>
            {isBalanceHidden ? '***.**' : 
              pricesLoading ? 'Loading...' : 
              formatUSDValue(externalUSDValue)
            }
          </ThemedText>
        </View>
      )}
      
      <View style={styles.bottomSection}>
        <ThemedText style={[styles.availableBalance, { color: textColor }]}>
          Total Value: {isBalanceHidden ? '***,***' : 
            pricesLoading ? 'Calculating...' : 
            formatUSDValue(totalUSDValue)
          }
        </ThemedText>
        
        {/* Show individual balances breakdown */}
        {!isBalanceHidden && !pricesLoading && (
          <ThemedText style={[styles.balanceBreakdown, { color: textColor }]}>
            {hasExternalBalance 
              ? `${Number(internalBalance).toLocaleString('en-US')} USDC + ${externalBalance} ${externalSymbol}`
              : `${Number(internalBalance).toLocaleString('en-US')} USDC`
            }
          </ThemedText>
        )}
        
        <ThemedText style={[styles.address, { color: textColor }]}>
          Wallet: {address.slice(0, 6)}...{address.slice(-4)}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 16,
    minHeight: 220,
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    opacity: 0.8,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  balanceSection: {
    marginVertical: 8,
  },
  externalBalanceSection: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 12,
    marginLeft: 6,
    opacity: 0.8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  balance: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  usdValue: {
    fontSize: 16,
    opacity: 0.8,
    marginTop: 4,
    fontWeight: '500',
  },
  externalBalance: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  externalUsdValue: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
    fontWeight: '500',
  },
  bottomSection: {
    marginTop: 12,
  },
  availableBalance: {
    fontSize: 15,
    opacity: 0.9,
    marginBottom: 4,
    fontWeight: '600',
  },
  balanceBreakdown: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  address: {
    fontSize: 12,
    opacity: 0.8,
    fontFamily: 'monospace',
  },
});

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useActiveAccount } from 'thirdweb/react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { WalletConnect } from '@/components/WalletConnect';
import { AmountInput } from '@/components/AmountInput';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import { 
  openTransakBuy, 
  openTransakOptimized, 
  isTransakConfigured, 
  SUPPORTED_CRYPTOCURRENCIES,
  getMinTransactionAmount,
  getAvailableCryptocurrencies 
} from '@/utils/transak';
import { executeUSDDeposit, getUserUSDBalance } from '@/utils/enhancedUSDTransactions';
import { formatUSDValue } from '@/utils/priceConversion';
import Ionicons from '@expo/vector-icons/Ionicons';

type SupportedCrypto = keyof typeof SUPPORTED_CRYPTOCURRENCIES;

export default function BuyScreen() {
  const account = useActiveAccount();
  const [amount, setAmount] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState<SupportedCrypto>('USDC');
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');

  const availableCryptos = getAvailableCryptocurrencies();

  // Load user balance when account changes
  useEffect(() => {
    if (account) {
      loadUserBalance();
    }
  }, [account]);

  const loadUserBalance = async () => {
    if (!account) return;
    
    setBalanceLoading(true);
    try {
      const balance = await getUserUSDBalance(account.address);
      setUserBalance(balance);
    } catch (error) {
      console.error('Error loading balance:', error);
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleTransakBuy = () => {
    if (!account) {
      Alert.alert('Error', 'Please connect your wallet first');
      return;
    }

    if (!isTransakConfigured()) {
      Alert.alert(
        'Transak Configuration',
        `Transak integration is properly configured and ready to use!\n\nAPI Key: ${process.env.EXPO_PUBLIC_TRANSAK_API_KEY?.slice(0, 8)}...\n\nIf you're still seeing this message, there may be a configuration issue.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Try Anyway', onPress: () => {
              const buyAmount = amount ? parseFloat(amount) : undefined;
              openTransakOptimized(account.address, buyAmount, selectedCrypto);
            }
          }
        ]
      );
      return;
    }

    const buyAmount = amount ? parseFloat(amount) : undefined;
    const minAmount = getMinTransactionAmount(selectedCrypto);
    
    if (buyAmount && buyAmount < minAmount) {
      Alert.alert(
        'Amount Too Low',
        `Minimum purchase amount for ${selectedCrypto} is $${minAmount}. Please increase your amount.`,
        [{ text: 'OK' }]
      );
      return;
    }

    openTransakOptimized(account.address, buyAmount, selectedCrypto);
  };

    const handleDemoDeposit = async () => {
    if (!account) {
      Alert.alert('Error', 'Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const amountUSD = parseFloat(amount);

    setLoading(true);
    try {
      const result = await executeUSDDeposit(account, amountUSD, true); // Enable gasless transactions

      if (result.success) {
        Alert.alert(
          'Demo Deposit Successful! 🎉',
          `Successfully deposited ${formatUSDValue(amountUSD)} to your EtherPesa wallet.

` +
          `💰 Amount: ${formatUSDValue(amountUSD)}
` +
          `⛽ Gas Cost: Free (Account Abstraction)
` +
          `🔗 Transaction Hash: ${result.transactionHash?.slice(0, 10)}...

` +
          `� Note: This is a demo deposit. For real purchases, use the Transak integration above.`,
          [{ text: 'OK' }]
        );
        setAmount('');
      } else {
        Alert.alert('Demo Deposit Failed', result.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('Demo deposit error:', error);
      Alert.alert('Demo Deposit Failed', error.message || 'Failed to deposit funds');
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <StatusBar backgroundColor={Colors.light.tint} barStyle="light-content" translucent={false} />
        <View style={styles.centerContent}>
          <ThemedText style={[styles.title, { color: textColor }]}>Connect Wallet</ThemedText>
          <ThemedText style={[styles.subtitle, { color: subtextColor }]}>
            Please connect your wallet to buy USDC
          </ThemedText>
        </View>
        <WalletConnect />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar backgroundColor={Colors.light.tint} barStyle="light-content" translucent={false} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.light.tint }]}>
        <View style={styles.headerContent}>
          <ThemedText style={[styles.title, { color: Colors.light.textInverted }]}>
            Buy {selectedCrypto}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: Colors.light.textInverted }]}>
            Purchase {SUPPORTED_CRYPTOCURRENCIES[selectedCrypto].name} with fiat currency
          </ThemedText>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cryptocurrency Selection */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Select Cryptocurrency
          </ThemedText>
          <View style={styles.cryptoSelector}>
            {availableCryptos.map((crypto) => (
              <TouchableOpacity
                key={crypto.symbol}
                style={[
                  styles.cryptoOption,
                  {
                    backgroundColor: selectedCrypto === crypto.symbol ? Colors.light.tint : 'transparent',
                    borderColor: selectedCrypto === crypto.symbol ? Colors.light.tint : Colors.light.border,
                  }
                ]}
                onPress={() => setSelectedCrypto(crypto.symbol as SupportedCrypto)}
              >
                <View style={styles.cryptoInfo}>
                  <ThemedText style={[
                    styles.cryptoSymbol,
                    { color: selectedCrypto === crypto.symbol ? 'white' : textColor }
                  ]}>
                    {crypto.symbol}
                  </ThemedText>
                  <ThemedText style={[
                    styles.cryptoName,
                    { color: selectedCrypto === crypto.symbol ? 'white' : subtextColor }
                  ]}>
                    {crypto.name}
                  </ThemedText>
                </View>
                {selectedCrypto === crypto.symbol && (
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </View>
          <ThemedText style={[styles.minAmountText, { color: subtextColor }]}>
            Minimum amount: ${getMinTransactionAmount(selectedCrypto)}
          </ThemedText>
        </View>

        {/* Amount Input */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Amount to Buy
          </ThemedText>
          <AmountInput
            value={amount}
            onChangeText={setAmount}
            placeholder="Enter amount in USD"
          />
          <View style={styles.quickAmounts}>
            {[10, 25, 50, 100, 250].map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={[styles.quickAmountButton, { borderColor: Colors.light.tint }]}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <ThemedText style={[styles.quickAmountText, { color: Colors.light.tint }]}>
                  ${quickAmount}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Transak Integration */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={24} color={Colors.light.success} />
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Buy {SUPPORTED_CRYPTOCURRENCIES[selectedCrypto].name} (Transak)
            </ThemedText>
          </View>
          <ThemedText style={[styles.sectionDescription, { color: subtextColor }]}>
            Purchase {selectedCrypto} directly with your bank account, credit card, or other payment methods.
            Optimized routing for Etherlink ecosystem.
          </ThemedText>
          
          {/* Purchase Summary */}
          {amount && (
            <View style={[styles.purchaseSummary, { backgroundColor: Colors.light.backgroundSecondary }]}>
              <View style={styles.summaryRow}>
                <ThemedText style={[styles.summaryLabel, { color: subtextColor }]}>You pay:</ThemedText>
                <ThemedText style={[styles.summaryValue, { color: textColor }]}>${amount}</ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText style={[styles.summaryLabel, { color: subtextColor }]}>You get:</ThemedText>
                <ThemedText style={[styles.summaryValue, { color: textColor }]}>~{amount} {selectedCrypto}</ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText style={[styles.summaryLabel, { color: subtextColor }]}>Network:</ThemedText>
                <ThemedText style={[styles.summaryValue, { color: Colors.light.success }]}>Optimized routing</ThemedText>
              </View>
            </View>
          )}
          
          <TouchableOpacity
            style={[
              styles.buyButton, 
              { backgroundColor: isTransakConfigured() ? Colors.light.success : Colors.light.warning }
            ]}
            onPress={handleTransakBuy}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons 
                name={isTransakConfigured() ? "card" : "warning"} 
                size={20} 
                color="white" 
              />
              <ThemedText style={[styles.buyButtonText, { color: 'white' }]}>
                {`Buy ${amount ? `$${amount}` : ''} ${selectedCrypto} with Transak`}
              </ThemedText>
            </View>
          </TouchableOpacity>
          {!isTransakConfigured() && (
            <ThemedText style={[styles.warningText, { color: Colors.light.warning }]}>
              ⚠️ Transak may need additional configuration for your region
            </ThemedText>
          )}
          {isTransakConfigured() && (
            <ThemedText style={[styles.successText, { color: Colors.light.success }]}>
              ✅ Transak is ready - supports 180+ countries & multiple stablecoins
            </ThemedText>
          )}
        </View>

        {/* Demo Section */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flask" size={24} color={Colors.light.purple} />
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Demo Deposit
            </ThemedText>
          </View>
          <ThemedText style={[styles.sectionDescription, { color: subtextColor }]}>
            For testing purposes, you can simulate a deposit directly to your wallet.
            This bypasses real payment processing.
          </ThemedText>
          <TouchableOpacity
            style={[styles.buyButton, { backgroundColor: Colors.light.purple }]}
            onPress={handleDemoDeposit}
            disabled={loading || !amount}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {loading && <ActivityIndicator size="small" color="white" />}
              <ThemedText style={[styles.buyButtonText, { color: 'white' }]}>
                {loading ? 'Processing...' : `Demo Deposit ${amount ? `$${amount} ${selectedCrypto}` : selectedCrypto}`}
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Information */}
        <View style={[styles.infoSection, { backgroundColor: cardBackground }]}>
          <ThemedText style={[styles.infoTitle, { color: textColor }]}>
            How it works
          </ThemedText>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.light.success} />
              <ThemedText style={[styles.infoText, { color: subtextColor }]}>
                <ThemedText style={styles.bold}>Instant settlement:</ThemedText> Funds available immediately
              </ThemedText>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.light.success} />
              <ThemedText style={[styles.infoText, { color: subtextColor }]}>
                <ThemedText style={styles.bold}>Global coverage:</ThemedText> Available in 180+ countries
              </ThemedText>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.light.success} />
              <ThemedText style={[styles.infoText, { color: subtextColor }]}>
                <ThemedText style={styles.bold}>Secure payments:</ThemedText> Bank-grade security
              </ThemedText>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.light.success} />
              <ThemedText style={[styles.infoText, { color: subtextColor }]}>
                <ThemedText style={styles.bold}>Low fees:</ThemedText> Competitive exchange rates
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  cryptoSelector: {
    gap: 12,
    marginBottom: 12,
  },
  cryptoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cryptoInfo: {
    flex: 1,
  },
  cryptoSymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  cryptoName: {
    fontSize: 14,
  },
  minAmountText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  purchaseSummary: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  quickAmountButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buyButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  successText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  infoSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  bold: {
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
});

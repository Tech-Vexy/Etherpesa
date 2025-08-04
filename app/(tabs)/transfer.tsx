import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TextInput, StatusBar, ScrollView } from 'react-native';
import { useActiveAccount } from 'thirdweb/react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { WalletConnect } from '@/components/WalletConnect';
import { AmountInput, QuickAmountButtons } from '@/components/AmountInput';
import { WithAuthProtection, useAuthProtection } from '@/components/WithAuthProtection';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import { executeUSDTransfer, getUserUSDBalance, estimateTransactionCost, validateAddress, checkKYCStatus } from '@/utils/enhancedUSDTransactions';
import { formatUSDValue } from '@/utils/priceConversion';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TransferScreen() {
  const account = useActiveAccount();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const { withAuth, isAuthenticating } = useAuthProtection();
  
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const borderColor = useThemeColor({}, 'border');

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

  const executeTransfer = async () => {
    if (!account) {
      Alert.alert('Error', 'Please connect your wallet');
      return;
    }

    if (!recipient || !amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate recipient address format
    if (!validateAddress(recipient)) {
      Alert.alert('Invalid Address', 'Please enter a valid Ethereum address');
      return;
    }

    const amountUSD = parseFloat(amount);
    if (amountUSD <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amountUSD > userBalance) {
      Alert.alert(
        'Insufficient Balance', 
        `You have ${formatUSDValue(userBalance)} but need ${formatUSDValue(amountUSD)}`
      );
      return;
    }

    // Check KYC status before proceeding
    const isKYCVerified = await checkKYCStatus(account.address);
    if (!isKYCVerified) {
      Alert.alert(
        'KYC Verification Required',
        'You need to complete KYC verification before making transfers. Please visit the KYC tab to verify your account.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to KYC', onPress: () => {
            // Would navigate to KYC tab
            console.log('Navigate to KYC tab');
          }}
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const result = await executeUSDTransfer(
        account.address, // fromAddress
        recipient, // toAddress
        amountUSD, // amountUSD
        account // account
      );

      if (result.success) {
        Alert.alert(
          'Transfer Successful! 🎉',
          `Successfully sent ${formatUSDValue(amountUSD)} to ${recipient.slice(0, 6)}...${recipient.slice(-4)}\n\n` +
          `💰 Amount: ${formatUSDValue(amountUSD)}\n` +
          `⛽ Gas Cost: Free (Account Abstraction)\n` +
          `🔗 Transaction Hash: ${result.transactionHash?.slice(0, 10)}...\n\n` +
          `✨ Your transaction was processed instantly with zero gas fees using Account Abstraction!`,
          [{ text: 'OK', onPress: () => {
            setRecipient('');
            setAmount('');
            loadUserBalance(); // Refresh balance
          }}]
        );
      } else {
        Alert.alert('Transfer Failed', result.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('Transfer error:', error);
      Alert.alert('Transfer Failed', error.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = () => {
    withAuth(executeTransfer);
  };

  if (!account) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <StatusBar backgroundColor={Colors.light.tint} barStyle="light-content" />
        <View style={styles.centerContent}>
          <Ionicons name="wallet-outline" size={64} color={textColor} />
          <ThemedText style={[styles.connectTitle, { color: textColor }]}>Connect Wallet</ThemedText>
          <ThemedText style={[styles.connectSubtitle, { color: subtextColor }]}>
            Please connect your wallet to send transfers
          </ThemedText>
        </View>
        <WalletConnect />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar backgroundColor={Colors.light.tint} barStyle="light-content" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: textColor }]}>Send Money</ThemedText>
          <ThemedText style={[styles.subtitle, { color: subtextColor }]}>
            Transfer USD directly to any wallet address
          </ThemedText>
        </View>

        {/* Balance Display */}
        <View style={[styles.balanceCard, { backgroundColor: cardBackground, borderColor }]}>
          <View style={styles.balanceHeader}>
            <Ionicons name="wallet" size={20} color={textColor} />
            <ThemedText style={[styles.balanceLabel, { color: textColor }]}>
              Available Balance
            </ThemedText>
          </View>
          <ThemedText style={[styles.balanceAmount, { color: textColor }]}>
            {balanceLoading ? 'Loading...' : formatUSDValue(userBalance)}
          </ThemedText>
          <ThemedText style={[styles.balanceSubtext, { color: subtextColor }]}>
            Gasless transactions with Account Abstraction
          </ThemedText>
        </View>

        {/* Amount Input */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Amount (USD)</ThemedText>
          <AmountInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            currency="USD"
          />
          <QuickAmountButtons
            amounts={[5, 10, 25, 50, 100]}
            onAmountSelect={(selectedAmount) => setAmount(selectedAmount.toString())}
          />
        </View>

        {/* Recipient Input */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Send to</ThemedText>
          <View style={[styles.inputContainer, { borderColor }]}>
            <Ionicons name="person-outline" size={20} color={subtextColor} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              value={recipient}
              onChangeText={setRecipient}
              placeholder="Enter wallet address (0x...)"
              placeholderTextColor={subtextColor}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Send Button */}
        <View style={styles.buttonContainer}>
          <ThemedButton
            title={
              loading 
                ? 'Sending...' 
                : isAuthenticating 
                ? 'Authenticating...' 
                : 'Send Transfer'
            }
            onPress={handleTransfer}
            loading={loading || isAuthenticating}
          />
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: cardBackground }]}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.light.tint} />
            <ThemedText style={[styles.infoTitle, { color: textColor }]}>Transfer Info</ThemedText>
          </View>
          <View style={styles.infoContent}>
            <InfoRow 
              label="Network" 
              value="Etherlink" 
              textColor={textColor}
              subtextColor={subtextColor}
            />
            <InfoRow 
              label="Fee" 
              value="< $0.01" 
              textColor={textColor}
              subtextColor={subtextColor}
            />
            <InfoRow 
              label="Speed" 
              value="< 500ms" 
              textColor={textColor}
              subtextColor={subtextColor}
            />
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  textColor: string;
  subtextColor: string;
}

function InfoRow({ label, value, textColor, subtextColor }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <ThemedText style={[styles.infoLabel, { color: subtextColor }]}>{label}</ThemedText>
      <ThemedText style={[styles.infoValue, { color: textColor }]}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  connectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  connectSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  infoCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  balanceCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: -1,
  },
  balanceSubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
});
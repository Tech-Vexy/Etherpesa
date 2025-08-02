import React, { useState, useEffect } from 'react';
import { View, StyleSheet, RefreshControl, ScrollView, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { useActiveAccount, useDisconnect, useActiveWallet } from 'thirdweb/react';
import { readContract } from 'thirdweb';
import { walletContract, txManagerContract, agentContract, kycContract } from '@/constants/thirdweb';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { BalanceCard } from '@/components/BalanceCard';
import { QuickActions } from '@/components/QuickActions';
import { TransactionList } from '@/components/TransactionList';
import { WalletConnect } from '@/components/WalletConnect';
import { ThirdwebDashboardInfo } from '@/components/ThirdwebDashboardInfo';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function HomeScreen() {
  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [balance, setBalance] = useState<string>('0');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [isKycVerified, setIsKycVerified] = useState(false);
  const [userAssets, setUserAssets] = useState({
    usdc: '0',
    nativeBalance: '0',
  });
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');

  const fetchBalance = async () => {
    if (!account || !walletContract) return;
    
    try {
      const result = await readContract({
        contract: walletContract,
        method: "function getBalance(address) view returns (uint256)",
        params: [account.address],
      });
      const usdcBalance = (Number(result) / 1000000).toFixed(2);
      setBalance(usdcBalance);
      
      // Update assets
      setUserAssets(prev => ({
        ...prev,
        usdc: usdcBalance
      }));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const checkAgentStatus = async () => {
    if (!account || !agentContract) return;
    
    try {
      const isRegistered = await readContract({
        contract: agentContract,
        method: 'function registeredAgents(address) view returns (bool)',
        params: [account.address],
      });
      setIsAgent(isRegistered);
    } catch (error) {
      console.error('Error checking agent status:', error);
    }
  };

  const checkKycStatus = async () => {
    if (!account || !kycContract) return;
    
    try {
      const isVerified = await readContract({
        contract: kycContract,
        method: 'function verifyUser(address) view returns (bool)',
        params: [account.address],
      });
      setIsKycVerified(isVerified);
    } catch (error) {
      console.error('Error checking KYC status:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!account || !txManagerContract) return;
    
    try {
      const txIds = await readContract({
        contract: txManagerContract,
        method: "function getUserTransactions(address) view returns (uint256[])",
        params: [account.address],
      });
      
      const txDetails = await Promise.all(
        txIds.slice(-10).map(async (id: bigint) => {
          if (!txManagerContract) return null;
          return await readContract({
            contract: txManagerContract,
            method: "function getTransaction(uint256) view returns (tuple)",
            params: [id],
          });
        })
      );
      
      setTransactions(txDetails.filter(tx => tx !== null).reverse());
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchBalance(), fetchTransactions(), checkAgentStatus(), checkKycStatus()]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            if (activeWallet) {
              disconnect(activeWallet);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (account) {
      fetchBalance();
      fetchTransactions();
      checkAgentStatus();
      checkKycStatus();
    }
  }, [account]);

  if (!account) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <StatusBar backgroundColor={Colors.light.tint} barStyle="light-content" translucent={false} />
        <View style={styles.centerContent}>
          <ThemedText style={styles.connectTitle}>Welcome to EtherPesa</ThemedText>
          <ThemedText style={styles.connectSubtitle}>
            Connect your wallet to start sending and receiving money securely
          </ThemedText>
        </View>
        <WalletConnect 
          onConnect={() => {
            fetchBalance();
            fetchTransactions();
            checkAgentStatus();
            checkKycStatus();
          }}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar backgroundColor={Colors.light.tint} barStyle="light-content" translucent={false} />
      
      {/* Header with User Info and Logout */}
      <View style={[styles.header, { backgroundColor: Colors.light.tint }]}>
        <View style={styles.userInfo}>
          <View style={styles.userDetails}>
            <ThemedText style={[styles.welcomeText, { color: Colors.light.textInverted }]}>
              Welcome back!
            </ThemedText>
            <View style={styles.userStatus}>
              <ThemedText style={[styles.addressText, { color: Colors.light.textInverted }]}>
                {account.address.slice(0, 6)}...{account.address.slice(-4)}
              </ThemedText>
              <View style={styles.statusBadges}>
                {isKycVerified && (
                  <View style={[styles.badge, { backgroundColor: Colors.light.success }]}>
                    <Ionicons name="checkmark" size={12} color="white" />
                    <ThemedText style={styles.badgeText}>KYC</ThemedText>
                  </View>
                )}
                {isAgent && (
                  <View style={[styles.badge, { backgroundColor: Colors.light.purple }]}>
                    <Ionicons name="business" size={12} color="white" />
                    <ThemedText style={styles.badgeText}>Agent</ThemedText>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={Colors.light.textInverted} />
        </TouchableOpacity>
      </View>

      {/* Assets Summary Card */}
      <View style={[styles.assetsCard, { backgroundColor: useThemeColor({}, 'backgroundSecondary') }]}>
        <ThemedText style={[styles.assetsTitle, { color: textColor }]}>Available Assets</ThemedText>
        <View style={styles.assetsList}>
          <View style={styles.assetItem}>
            <View style={styles.assetIcon}>
              <Ionicons name="logo-usd" size={24} color={Colors.light.success} />
            </View>
            <View style={styles.assetDetails}>
              <ThemedText style={[styles.assetName, { color: textColor }]}>USDC</ThemedText>
              <ThemedText style={[styles.assetSymbol, { color: subtextColor }]}>USD Coin</ThemedText>
            </View>
            <View style={styles.assetBalance}>
              <ThemedText style={[styles.assetAmount, { color: textColor }]}>
                {isBalanceHidden ? '***' : userAssets.usdc}
              </ThemedText>
              <ThemedText style={[styles.assetValue, { color: subtextColor }]}>
                ${isBalanceHidden ? '***' : userAssets.usdc}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <BalanceCard
          balance={balance}
          address={account.address}
          onEyePress={() => setIsBalanceHidden(!isBalanceHidden)}
          isBalanceHidden={isBalanceHidden}
        />
        
        <QuickActions
          onSendPress={() => router.push('/transfer')}
          onReceivePress={() => {/* TODO: Implement receive */}}
          onWithdrawPress={() => router.push('/withdraw')}
          onTopUpPress={() => router.push('/buy')}
        />
        
        <TransactionList
          transactions={transactions}
          userAddress={account.address}
          onViewAllPress={() => router.push('/transactions')}
        />
        
        <ThirdwebDashboardInfo userAddress={account.address} />
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
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  userInfo: {
    flex: 1,
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'monospace',
    opacity: 0.9,
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  assetsCard: {
    marginHorizontal: 16,
    marginTop: 16,
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
  assetsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  assetsList: {
    gap: 12,
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assetDetails: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  assetSymbol: {
    fontSize: 12,
  },
  assetBalance: {
    alignItems: 'flex-end',
  },
  assetAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  assetValue: {
    fontSize: 12,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  connectTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  connectSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
});
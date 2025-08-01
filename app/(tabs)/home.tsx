import React, { useState, useEffect } from 'react';
import { View, StyleSheet, RefreshControl, ScrollView, StatusBar } from 'react-native';
import { useActiveAccount } from 'thirdweb/react';
import { readContract } from 'thirdweb';
import { walletContract, txManagerContract } from '@/constants/thirdweb';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { BalanceCard } from '@/components/BalanceCard';
import { QuickActions } from '@/components/QuickActions';
import { TransactionList } from '@/components/TransactionList';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

export default function HomeScreen() {
  const account = useActiveAccount();
  const router = useRouter();
  const [balance, setBalance] = useState<string>('0');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');

  const fetchBalance = async () => {
    if (!account || !walletContract) return;
    
    try {
      const result = await readContract({
        contract: walletContract,
        method: "function getBalance(address) view returns (uint256)",
        params: [account.address],
      });
      setBalance((Number(result) / 1000000).toFixed(2)); // Convert from 6 decimals
    } catch (error) {
      console.error('Error fetching balance:', error);
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
    await Promise.all([fetchBalance(), fetchTransactions()]);
    setRefreshing(false);
  };

  useEffect(() => {
    if (account) {
      fetchBalance();
      fetchTransactions();
    }
  }, [account]);

  if (!account) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <StatusBar backgroundColor={Colors.light.tint} barStyle="light-content" />
        <View style={styles.centerContent}>
          <ThemedText style={styles.connectTitle}>Welcome to EtherPesa</ThemedText>
          <ThemedText style={styles.connectSubtitle}>Connect your wallet to get started</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar backgroundColor={Colors.light.tint} barStyle="light-content" />
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
          onViewAllPress={() => {/* TODO: Implement view all */}}
        />
      </ScrollView>
    </ThemedView>
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
  scrollContent: {
    paddingBottom: 24,
  },
});
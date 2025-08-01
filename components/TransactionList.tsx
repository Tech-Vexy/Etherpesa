import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import Ionicons from '@expo/vector-icons/Ionicons';

interface TransactionItemProps {
  type: string;
  amount: string;
  address: string;
  timestamp: string;
  isIncoming: boolean;
}

interface TransactionListProps {
  transactions: any[];
  userAddress: string;
  onViewAllPress: () => void;
}

function TransactionItem({ type, amount, address, timestamp, isIncoming }: TransactionItemProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const positiveColor = '#10B981';
  const negativeColor = '#EF4444';

  return (
    <View style={[styles.transactionItem, { backgroundColor }]}>
      <View style={styles.transactionIcon}>
        <Ionicons 
          name={isIncoming ? "arrow-down" : "arrow-up"} 
          size={20} 
          color={isIncoming ? positiveColor : negativeColor} 
        />
      </View>
      
      <View style={styles.transactionDetails}>
        <ThemedText style={[styles.transactionType, { color: textColor }]}>
          {isIncoming ? 'Received from' : 'Sent to'}
        </ThemedText>
        <ThemedText style={[styles.transactionAddress, { color: subtextColor }]}>
          {address.slice(0, 10)}...
        </ThemedText>
        <ThemedText style={[styles.transactionTime, { color: subtextColor }]}>
          {new Date(Number(timestamp) * 1000).toLocaleDateString()}
        </ThemedText>
      </View>
      
      <View style={styles.amountContainer}>
        <ThemedText style={[
          styles.transactionAmount, 
          { color: isIncoming ? positiveColor : negativeColor }
        ]}>
          {isIncoming ? '+' : '-'}${amount}
        </ThemedText>
      </View>
    </View>
  );
}

export function TransactionList({ transactions, userAddress, onViewAllPress }: TransactionListProps) {
  const cardBackground = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBackground }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
          M-Pesa Statements
        </ThemedText>
        <TouchableOpacity onPress={onViewAllPress}>
          <Ionicons name="chevron-forward" size={20} color={subtextColor} />
        </TouchableOpacity>
      </View>
      
      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={48} color={subtextColor} />
          <ThemedText style={[styles.emptyText, { color: subtextColor }]}>
            No transactions yet
          </ThemedText>
        </View>
      ) : (
        <View style={styles.transactionsList}>
          {transactions.slice(0, 3).map((tx, index) => {
            const isIncoming = tx.recipient === userAddress;
            const otherAddress = isIncoming ? tx.sender : tx.recipient;
            const amount = (Number(tx.amount) / 1000000).toFixed(2);
            
            return (
              <TransactionItem
                key={index}
                type={tx.transactionType}
                amount={amount}
                address={otherAddress}
                timestamp={tx.timestamp}
                isIncoming={isIncoming}
              />
            );
          })}
          
          {transactions.length > 3 && (
            <TouchableOpacity style={styles.viewAllButton} onPress={onViewAllPress}>
              <ThemedText style={[styles.viewAllText, { color: subtextColor }]}>
                View all transactions
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionAddress: {
    fontSize: 12,
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 11,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewAllButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

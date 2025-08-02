import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity, 
  StatusBar,
  TextInput,
  Modal
} from 'react-native';
import { useActiveAccount } from 'thirdweb/react';
import { readContract } from 'thirdweb';
import { txManagerContract } from '@/constants/thirdweb';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Transaction {
  id: string;
  sender: string;
  recipient: string;
  amount: string;
  timestamp: string;
  transactionType: string;
  status?: string;
}

interface TransactionDetailProps {
  transaction: Transaction;
  userAddress: string;
  onClose: () => void;
  visible: boolean;
}

function TransactionDetail({ transaction, userAddress, onClose, visible }: TransactionDetailProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const isIncoming = transaction.recipient === userAddress;
  const positiveColor = '#10B981';
  const negativeColor = '#EF4444';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <ThemedView style={[styles.modalContainer, { backgroundColor }]}>
        <View style={[styles.modalHeader, { backgroundColor: Colors.light.tint }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.light.textInverted} />
          </TouchableOpacity>
          <ThemedText style={[styles.modalTitle, { color: Colors.light.textInverted }]}>
            Transaction Details
          </ThemedText>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={[styles.detailCard, { backgroundColor: useThemeColor({}, 'backgroundSecondary') }]}>
            <View style={styles.detailRow}>
              <View style={[styles.statusIcon, { 
                backgroundColor: isIncoming ? positiveColor + '20' : negativeColor + '20' 
              }]}>
                <Ionicons 
                  name={isIncoming ? "arrow-down" : "arrow-up"} 
                  size={32} 
                  color={isIncoming ? positiveColor : negativeColor} 
                />
              </View>
              <View style={styles.statusInfo}>
                <ThemedText style={[styles.statusTitle, { color: textColor }]}>
                  {isIncoming ? 'Money Received' : 'Money Sent'}
                </ThemedText>
                <ThemedText style={[styles.statusAmount, { 
                  color: isIncoming ? positiveColor : negativeColor 
                }]}>
                  {isIncoming ? '+' : '-'}${(Number(transaction.amount) / 1000000).toFixed(2)}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={[styles.detailCard, { backgroundColor: useThemeColor({}, 'backgroundSecondary') }]}>
            <ThemedText style={[styles.cardTitle, { color: textColor }]}>Transaction Information</ThemedText>
            
            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: subtextColor }]}>Date & Time</ThemedText>
              <ThemedText style={[styles.detailValue, { color: textColor }]}>
                {new Date(Number(transaction.timestamp) * 1000).toLocaleString()}
              </ThemedText>
            </View>

            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: subtextColor }]}>
                {isIncoming ? 'From' : 'To'}
              </ThemedText>
              <ThemedText style={[styles.detailValue, { color: textColor, fontFamily: 'monospace' }]}>
                {isIncoming ? transaction.sender : transaction.recipient}
              </ThemedText>
            </View>

            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: subtextColor }]}>Transaction Type</ThemedText>
              <ThemedText style={[styles.detailValue, { color: textColor }]}>
                {transaction.transactionType || 'Transfer'}
              </ThemedText>
            </View>

            <View style={styles.detailItem}>
              <ThemedText style={[styles.detailLabel, { color: subtextColor }]}>Status</ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: positiveColor + '20' }]}>
                <Ionicons name="checkmark-circle" size={16} color={positiveColor} />
                <ThemedText style={[styles.statusText, { color: positiveColor }]}>Completed</ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}

function TransactionItem({ 
  transaction, 
  userAddress, 
  onPress 
}: { 
  transaction: Transaction; 
  userAddress: string; 
  onPress: () => void;
}) {
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const isIncoming = transaction.recipient === userAddress;
  const otherAddress = isIncoming ? transaction.sender : transaction.recipient;
  const positiveColor = '#10B981';
  const negativeColor = '#EF4444';

  return (
    <TouchableOpacity 
      style={[styles.transactionItem, { backgroundColor }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.transactionIcon, { 
        backgroundColor: isIncoming ? positiveColor + '20' : negativeColor + '20' 
      }]}>
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
          {otherAddress.slice(0, 12)}...{otherAddress.slice(-4)}
        </ThemedText>
        <ThemedText style={[styles.transactionTime, { color: subtextColor }]}>
          {new Date(Number(transaction.timestamp) * 1000).toLocaleDateString()}
        </ThemedText>
      </View>
      
      <View style={styles.amountContainer}>
        <ThemedText style={[
          styles.transactionAmount, 
          { color: isIncoming ? positiveColor : negativeColor }
        ]}>
          {isIncoming ? '+' : '-'}${(Number(transaction.amount) / 1000000).toFixed(2)}
        </ThemedText>
        <Ionicons name="chevron-forward" size={16} color={subtextColor} />
      </View>
    </TouchableOpacity>
  );
}

export default function TransactionsScreen() {
  const account = useActiveAccount();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');

  const fetchAllTransactions = async () => {
    if (!account || !txManagerContract) return;
    
    try {
      setLoading(true);
      const txIds = await readContract({
        contract: txManagerContract,
        method: "function getUserTransactions(address) view returns (uint256[])",
        params: [account.address],
      });
      
      const txDetails = await Promise.all(
        txIds.map(async (id: bigint): Promise<Transaction | null> => {
          if (!txManagerContract) return null;
          try {
            const txResult = await readContract({
              contract: txManagerContract,
              method: "function getTransaction(uint256) view returns (tuple)",
              params: [id],
            });
            
            // Properly destructure the tuple result
            const txData = txResult as [string, string, bigint, bigint, string];
            
            return {
              id: id.toString(),
              sender: txData[0] || '',
              recipient: txData[1] || '',
              amount: txData[2]?.toString() || '0',
              timestamp: txData[3]?.toString() || '0',
              transactionType: txData[4] || 'Transfer',
              status: 'completed'
            } as Transaction;
          } catch (error) {
            console.error(`Error fetching transaction ${id}:`, error);
            return null;
          }
        })
      );
      
      const validTransactions = txDetails.filter((tx): tx is Transaction => tx !== null);
      // Sort by timestamp, newest first
      const sortedTransactions = validTransactions.sort((a, b) => 
        Number(b.timestamp) - Number(a.timestamp)
      );
      
      setTransactions(sortedTransactions);
      setFilteredTransactions(sortedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllTransactions();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredTransactions(transactions);
      return;
    }

    const filtered = transactions.filter(tx => {
      const otherAddress = tx.recipient === account?.address ? tx.sender : tx.recipient;
      return (
        otherAddress.toLowerCase().includes(query.toLowerCase()) ||
        tx.transactionType?.toLowerCase().includes(query.toLowerCase()) ||
        (Number(tx.amount) / 1000000).toFixed(2).includes(query)
      );
    });
    setFilteredTransactions(filtered);
  };

  const handleTransactionPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetail(true);
  };

  useEffect(() => {
    if (account) {
      fetchAllTransactions();
    }
  }, [account]);

  if (!account) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <StatusBar backgroundColor={Colors.light.tint} barStyle="light-content" translucent={false} />
        <View style={styles.centerContent}>
          <ThemedText style={[styles.connectTitle, { color: textColor }]}>
            Connect Wallet
          </ThemedText>
          <ThemedText style={[styles.connectSubtitle, { color: subtextColor }]}>
            Connect your wallet to view transaction history
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar backgroundColor={Colors.light.tint} barStyle="light-content" translucent={false} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.light.tint }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.textInverted} />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: Colors.light.textInverted }]}>
          Transaction History
        </ThemedText>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: useThemeColor({}, 'backgroundSecondary') }]}>
        <Ionicons name="search" size={20} color={subtextColor} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search transactions..."
          placeholderTextColor={subtextColor}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={subtextColor} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Transaction Stats */}
      <View style={[styles.statsContainer, { backgroundColor: useThemeColor({}, 'backgroundSecondary') }]}>
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: textColor }]}>
            {filteredTransactions.length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: subtextColor }]}>
            Total Transactions
          </ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: '#10B981' }]}>
            {filteredTransactions.filter(tx => tx.recipient === account.address).length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: subtextColor }]}>
            Received
          </ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: '#EF4444' }]}>
            {filteredTransactions.filter(tx => tx.sender === account.address).length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: subtextColor }]}>
            Sent
          </ThemedText>
        </View>
      </View>

      {/* Transactions List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ThemedText style={[styles.loadingText, { color: subtextColor }]}>
              Loading transactions...
            </ThemedText>
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={subtextColor} />
            <ThemedText style={[styles.emptyText, { color: textColor }]}>
              {searchQuery ? 'No matching transactions' : 'No transactions yet'}
            </ThemedText>
            <ThemedText style={[styles.emptySubtext, { color: subtextColor }]}>
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Your transaction history will appear here'
              }
            </ThemedText>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {filteredTransactions.map((transaction, index) => (
              <TransactionItem
                key={transaction.id || index}
                transaction={transaction}
                userAddress={account.address}
                onPress={() => handleTransactionPress(transaction)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetail
          transaction={selectedTransaction}
          userAddress={account.address}
          visible={showDetail}
          onClose={() => {
            setShowDetail(false);
            setSelectedTransaction(null);
          }}
        />
      )}
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
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 20,
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 16,
  },
  scrollView: {
    flex: 1,
    marginTop: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  transactionsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionAddress: {
    fontSize: 13,
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  transactionTime: {
    fontSize: 12,
  },
  amountContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
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
    marginBottom: 12,
  },
  connectSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  detailCard: {
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

import React, { useState } from 'react';
import { View, StyleSheet, Alert, TextInput, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useActiveAccount } from 'thirdweb/react';
import { prepareContractCall, sendTransaction } from 'thirdweb';
import { walletContract, agentContract, txManagerContract } from '@/constants/thirdweb';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { WalletConnect } from '@/components/WalletConnect';
import { useRegisteredAgents } from '@/hooks/useRegisteredAgents';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import { createTransactionMetadata, formatSuccessMessage, formatErrorMessage, TRANSACTION_CATEGORIES } from '@/utils/thirdwebTracking';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function WithdrawScreen() {
  const account = useActiveAccount();
  const [amount, setAmount] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [loading, setLoading] = useState(false);
  const { agents, loading: agentsLoading, error: agentsError, refetch } = useRegisteredAgents();
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBackground = useThemeColor({}, 'backgroundSecondary');

  const handleWithdrawal = async () => {
    if (!account) {
      Alert.alert('Error', 'Please connect your wallet');
      return;
    }

    if (!txManagerContract) {
      Alert.alert('Error', 'Transaction manager contract not loaded. Please check your configuration.');
      return;
    }

    if (!amount || !selectedAgent) {
      Alert.alert('Error', 'Please fill in all fields and select an agent');
      return;
    }

    const amountInWei = Math.floor(parseFloat(amount) * 1000000); // Convert to 6 decimals
    if (amountInWei <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // Use transaction manager to process withdrawal with tracking
      const transaction = prepareContractCall({
        contract: txManagerContract,
        method: 'function executeWithdrawal(uint256 amount, address agent)',
        params: [BigInt(amountInWei), selectedAgent],
      });

      const selectedAgentInfo = agents.find(agent => agent.address === selectedAgent);
      const result = await sendTransaction({
        transaction,
        account,
      });

      Alert.alert(
        'Success!',
        formatSuccessMessage(
          "Withdrawal",
          amount,
          result.transactionHash,
          `🏪 Agent: ${selectedAgentInfo?.name || 'Selected Agent'}\n� Processing through local agent network`
        )
      );
      
      setAmount('');
      setSelectedAgent('');
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      Alert.alert('Withdrawal Failed', formatErrorMessage("Withdrawal", error.message));
    } finally {
      setLoading(false);
    }
  };

  const openTransakWidget = () => {
    Alert.alert(
      'Transak Integration',
      'In production, this would open the Transak widget for direct fiat off-ramp. For now, use the agent withdrawal system.',
      [{ text: 'OK' }]
    );
  };

  if (!account) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <StatusBar backgroundColor={Colors.light.tint} barStyle="light-content" />
        <View style={styles.centerContent}>
          <ThemedText style={[styles.title, { color: textColor }]}>Connect Wallet</ThemedText>
          <ThemedText style={[styles.subtitle, { color: textColor }]}>
            Please connect your wallet to withdraw funds
          </ThemedText>
        </View>
        <WalletConnect />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar backgroundColor={Colors.light.tint} barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={[styles.title, { color: textColor }]}>Withdraw Funds</ThemedText>
        <ThemedText style={[styles.subtitle, { color: textColor }]}>
          Choose an agent to process your withdrawal
        </ThemedText>
        
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: textColor }]}>Amount (USDC)</ThemedText>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: Colors.light.border }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: textColor }]}>Select Agent</ThemedText>
            
            {agentsLoading ? (
              <View style={[styles.loadingContainer, { backgroundColor: cardBackground }]}>
                <ThemedText style={[styles.loadingText, { color: textColor }]}>
                  Loading registered agents...
                </ThemedText>
              </View>
            ) : agentsError ? (
              <View style={[styles.errorContainer, { backgroundColor: cardBackground }]}>
                <ThemedText style={[styles.errorText, { color: Colors.light.error }]}>
                  Error loading agents: {agentsError}
                </ThemedText>
                <TouchableOpacity onPress={refetch} style={styles.retryButton}>
                  <ThemedText style={[styles.retryText, { color: Colors.light.tint }]}>
                    Retry
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : agents.length === 0 ? (
              <View style={[styles.noAgentsContainer, { backgroundColor: cardBackground }]}>
                <Ionicons name="business-outline" size={48} color={Colors.light.subtext} />
                <ThemedText style={[styles.noAgentsText, { color: textColor }]}>
                  No registered agents found
                </ThemedText>
                <ThemedText style={[styles.noAgentsSubtext, { color: Colors.light.subtext }]}>
                  Agents need to be registered before they can process withdrawals
                </ThemedText>
              </View>
            ) : (
              <View style={styles.agentsList}>
                {agents.map((agent) => (
                  <TouchableOpacity
                    key={agent.address}
                    style={[
                      styles.agentButton,
                      { backgroundColor: cardBackground },
                      selectedAgent === agent.address && styles.selectedAgent
                    ]}
                    onPress={() => setSelectedAgent(agent.address)}
                  >
                    <View style={styles.agentInfo}>
                      <ThemedText style={[styles.agentName, { color: textColor }]}>
                        {agent.name}
                      </ThemedText>
                      <ThemedText style={[styles.agentAddress, { color: Colors.light.subtext }]}>
                        {agent.address.slice(0, 10)}...{agent.address.slice(-8)}
                      </ThemedText>
                    </View>
                    {selectedAgent === agent.address && (
                      <Ionicons name="checkmark-circle" size={24} color={Colors.light.success} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <ThemedButton
              title={loading ? 'Processing...' : 'Withdraw via Agent'}
              onPress={handleWithdrawal}
              loading={loading}
            />
            
            <TouchableOpacity 
              style={[styles.transakButton, { backgroundColor: Colors.light.purple }]}
              onPress={openTransakWidget}
            >
              <ThemedText style={styles.transakButtonText}>
                Direct Withdrawal (Transak)
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: cardBackground }]}>
          <ThemedText style={[styles.infoTitle, { color: textColor }]}>Withdrawal Options</ThemedText>
          <ThemedText style={[styles.infoText, { color: textColor }]}>
            • <ThemedText style={styles.bold}>Agent withdrawal:</ThemedText> Cash pickup at selected location
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: textColor }]}>
            • <ThemedText style={styles.bold}>Processing time:</ThemedText> 5-30 minutes
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: textColor }]}>
            • <ThemedText style={styles.bold}>Service fee:</ThemedText> Small fee may apply
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: textColor }]}>
            • <ThemedText style={styles.bold}>Direct withdrawal:</ThemedText> Bank transfer via Transak
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: Colors.light.success }]}>
            📊 <ThemedText style={styles.bold}>All transactions tracked via thirdweb dashboard</ThemedText>
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
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
    opacity: 0.7,
    marginBottom: 32,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    padding: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noAgentsContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  noAgentsText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  noAgentsSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  agentsList: {
    gap: 12,
  },
  agentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  selectedAgent: {
    borderColor: Colors.light.success,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  agentAddress: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 16,
  },
  transakButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  transakButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
});
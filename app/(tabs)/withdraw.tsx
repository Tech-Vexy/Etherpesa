import React, { useState } from 'react';
import { View, StyleSheet, Alert, TextInput } from 'react-native';
import { useActiveAccount } from 'thirdweb/react';
import { prepareContractCall, sendTransaction } from 'thirdweb';
import { walletContract } from '@/constants/thirdweb';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';

// Mock agent addresses for demo
const MOCK_AGENTS = [
  { address: '0x1234567890123456789012345678901234567890', name: 'Agent John - Downtown' },
  { address: '0x0987654321098765432109876543210987654321', name: 'Agent Mary - Uptown' },
  { address: '0x1111222233334444555566667777888899990000', name: 'Agent Bob - Mall' },
];

export default function WithdrawScreen() {
  const account = useActiveAccount();
  const [amount, setAmount] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdrawal = async () => {
    if (!account) {
      Alert.alert('Error', 'Please connect your wallet');
      return;
    }

    if (!walletContract) {
      Alert.alert('Error', 'Wallet contract not loaded. Please check your configuration.');
      return;
    }

    if (!amount || !selectedAgent) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const amountInWei = Math.floor(parseFloat(amount) * 1000000); // Convert to 6 decimals
    if (amountInWei <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const transaction = prepareContractCall({
        contract: walletContract,
        method: 'function withdraw(uint256)',
        params: [BigInt(amountInWei)],
      });

      await sendTransaction({
        transaction,
        account,
      });

      Alert.alert(
        'Withdrawal Initiated',
        `Your withdrawal of $${amount} USDC has been initiated. The selected agent will process your request and transfer fiat to your account.`,
        [{ text: 'OK' }]
      );
      
      setAmount('');
      setSelectedAgent('');
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      Alert.alert('Error', error.message || 'Withdrawal failed');
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
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Connect Wallet</ThemedText>
        <ThemedText>Please connect your wallet to withdraw funds</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Withdraw Funds</ThemedText>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Amount (USDC)</ThemedText>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Select Agent</ThemedText>
          {MOCK_AGENTS.map((agent) => (
            <ThemedButton
              key={agent.address}
              title={agent.name}
              onPress={() => setSelectedAgent(agent.address)}
            />
          ))}
        </View>

        <ThemedButton
          title={loading ? 'Processing...' : 'Withdraw via Agent'}
          onPress={loading ? undefined : handleWithdrawal}
        />

        <ThemedButton
          title="Direct Withdrawal (Transak)"
          onPress={openTransakWidget}
        />
      </View>

      <View style={styles.infoCard}>
        <ThemedText style={styles.infoTitle}>Withdrawal Options</ThemedText>
        <ThemedText style={styles.infoText}>
          • Agent withdrawal: Cash pickup at selected location
        </ThemedText>
        <ThemedText style={styles.infoText}>
          • Processing time: 5-30 minutes
        </ThemedText>
        <ThemedText style={styles.infoText}>
          • Small service fee may apply
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
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
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  agentButton: {
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedAgent: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  agentButtonText: {
    color: '#333',
    fontSize: 14,
  },
  selectedAgentText: {
    color: '#fff',
  },
  button: {
    marginTop: 16,
  },
  transakButton: {
    backgroundColor: '#6C5CE7',
    marginTop: 8,
  },
  transakButtonText: {
    color: '#fff',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
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
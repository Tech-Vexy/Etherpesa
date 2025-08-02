import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TextInput, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { useActiveAccount } from 'thirdweb/react';
import { prepareContractCall, sendTransaction, readContract } from 'thirdweb';
import { agentContract } from '@/constants/thirdweb';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AgentScreen() {
  const account = useActiveAccount();
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [agentAddress, setAgentAddress] = useState('');
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBackground = useThemeColor({}, 'backgroundSecondary');

  useEffect(() => {
    checkAgentStatus();
  }, [account]);

  const checkAgentStatus = async () => {
    if (!account || !agentContract) {
      setChecking(false);
      return;
    }

    try {
      setChecking(true);
      const isAgentRegistered = await readContract({
        contract: agentContract,
        method: 'function registeredAgents(address) view returns (bool)',
        params: [account.address],
      });
      setIsRegistered(isAgentRegistered);
    } catch (error) {
      console.error('Error checking agent status:', error);
      Alert.alert('Error', 'Failed to check agent registration status');
    } finally {
      setChecking(false);
    }
  };

  const handleAgentRegistration = async () => {
    if (!account) {
      Alert.alert('Error', 'Please connect your wallet');
      return;
    }

    if (!agentContract) {
      Alert.alert('Error', 'Agent contract not loaded. Please check your configuration.');
      return;
    }

    if (!agentAddress) {
      Alert.alert('Error', 'Please enter an agent address');
      return;
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(agentAddress)) {
      Alert.alert('Error', 'Please enter a valid Ethereum address');
      return;
    }

    setLoading(true);
    try {
      const transaction = prepareContractCall({
        contract: agentContract,
        method: 'function registerAgent(address agent)',
        params: [agentAddress],
      });

      const result = await sendTransaction({
        transaction,
        account,
      });

      Alert.alert(
        'Agent Registered Successfully! 🎉', 
        `Agent has been registered successfully!\n\n` +
        `📊 Transaction ID: ${result.transactionHash}\n\n` +
        `✅ Agent registration is tracked in thirdweb dashboard with full transaction analytics.`,
        [{ text: 'OK', onPress: () => checkAgentStatus() }]
      );
      setAgentAddress('');
    } catch (error: any) {
      console.error('Agent registration error:', error);
      Alert.alert('Error', error.message || 'Failed to register agent');
    } finally {
      setLoading(false);
    }
  };

  const handleSelfRegistration = async () => {
    if (!account) {
      Alert.alert('Error', 'Please connect your wallet');
      return;
    }

    setAgentAddress(account.address);
    // Auto-trigger registration
    setTimeout(() => {
      handleAgentRegistration();
    }, 100);
  };

  if (checking) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <StatusBar backgroundColor={Colors.light.tint} barStyle="light-content" />
        <View style={styles.centerContent}>
          <ThemedText style={styles.title}>Checking Agent Status...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar backgroundColor={Colors.light.tint} barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={[styles.title, { color: textColor }]}>Agent Registration</ThemedText>
        <ThemedText style={[styles.subtitle, { color: textColor }]}>
          Register as an agent to facilitate withdrawals and deposits
        </ThemedText>

        {isRegistered ? (
          <View style={[styles.successCard, { backgroundColor: cardBackground }]}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.light.success} />
            <ThemedText style={[styles.successTitle, { color: Colors.light.success }]}>
              Agent Registered!
            </ThemedText>
            <ThemedText style={[styles.successText, { color: textColor }]}>
              You are registered as an agent and can now process withdrawals and deposits.
            </ThemedText>
            <ThemedText style={[styles.address, { color: textColor }]}>
              Agent Address: {account?.address}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={[styles.infoCard, { backgroundColor: cardBackground }]}>
              <ThemedText style={[styles.infoTitle, { color: textColor }]}>What is an Agent?</ThemedText>
              <ThemedText style={[styles.infoText, { color: textColor }]}>
                • Agents facilitate cash withdrawals and deposits
              </ThemedText>
              <ThemedText style={[styles.infoText, { color: textColor }]}>
                • Must be registered by the contract owner
              </ThemedText>
              <ThemedText style={[styles.infoText, { color: textColor }]}>
                • Provides local cash-in/cash-out services
              </ThemedText>
              <ThemedText style={[styles.infoText, { color: textColor }]}>
                • Earns fees for processing transactions
              </ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: textColor }]}>Agent Address</ThemedText>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: Colors.light.border }]}
                value={agentAddress}
                onChangeText={setAgentAddress}
                placeholder="0x..."
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <ThemedText style={[styles.inputHint, { color: textColor }]}>
                Enter the Ethereum address to register as an agent
              </ThemedText>
            </View>

            <TouchableOpacity 
              style={[styles.selfRegisterButton, { backgroundColor: Colors.light.purple }]}
              onPress={handleSelfRegistration}
            >
              <Ionicons name="person-add" size={20} color="#FFFFFF" />
              <ThemedText style={styles.selfRegisterText}>
                Register My Address as Agent
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.button}>
              <ThemedButton
                title={loading ? 'Registering...' : 'Register Agent'}
                onPress={handleAgentRegistration}
                loading={loading}
              />
            </View>
          </View>
        )}

        <View style={[styles.infoCard, { backgroundColor: cardBackground }]}>
          <ThemedText style={[styles.infoTitle, { color: textColor }]}>Agent Network</ThemedText>
          <ThemedText style={[styles.infoText, { color: textColor }]}>
            Our agent network provides local access to digital money services, enabling:
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: textColor }]}>
            • Cash deposits and withdrawals
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: textColor }]}>
            • Local currency exchange
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: textColor }]}>
            • Financial services in remote areas
          </ThemedText>
          <ThemedText style={[styles.infoText, { color: textColor }]}>
            • Support for unbanked populations
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
    marginBottom: 4,
  },
  inputHint: {
    fontSize: 12,
    opacity: 0.6,
  },
  selfRegisterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  selfRegisterText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    marginTop: 16,
  },
  successCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  address: {
    fontSize: 12,
    opacity: 0.6,
    fontFamily: 'monospace',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
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
    marginBottom: 4,
    opacity: 0.8,
  },
});

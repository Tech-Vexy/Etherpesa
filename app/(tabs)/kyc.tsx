import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TextInput, StatusBar, ScrollView } from 'react-native';
import { useActiveAccount } from 'thirdweb/react';
import { prepareContractCall, sendTransaction, readContract } from 'thirdweb';
import { kycContract } from '@/constants/thirdweb';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import { keccak256, toUtf8Bytes } from 'ethers';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function KYCScreen() {
  const account = useActiveAccount();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<boolean | null>(null);

  const checkKYCStatus = async () => {
    if (!account || !kycContract) return;
    
    try {
      const verified = await readContract({
        contract: kycContract,
        method: 'function verifyUser(address) view returns (bool)',
        params: [account.address],
      });
      setKycStatus(verified);
    } catch (error) {
      console.error('Error checking KYC status:', error);
    }
  };

  const handleKYCSubmission = async () => {
    if (!account) {
      Alert.alert('Error', 'Please connect your wallet');
      return;
    }

    if (!kycContract) {
      Alert.alert('Error', 'KYC contract not loaded. Please check your configuration.');
      return;
    }

    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[\d\s-()]+$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      // Hash the KYC data for privacy
      const kycHash = keccak256(toUtf8Bytes(`phone:${phoneNumber}`)) as `0x${string}`;
      
      const transaction = prepareContractCall({
        contract: kycContract,
        method: 'function submitKYC(address user, bytes32 kycHash)',
        params: [account.address, kycHash],
      });

      const result = await sendTransaction({
        transaction,
        account,
      });

      Alert.alert(
        'KYC Submitted Successfully! ✅', 
        `Your KYC verification has been submitted and processed.

` +
        `📊 Transaction ID: ${result.transactionHash}

` +
        `🔒 Your data is securely hashed and stored on-chain.
` +
        `📈 This verification is tracked in thirdweb dashboard.`
      );
      
      // Refresh KYC status
      checkKYCStatus();
    } catch (error: any) {
      console.error('KYC submission error:', error);
      Alert.alert('KYC Submission Failed', error.message || 'KYC submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      checkKYCStatus();
    }
  }, [account]);

  if (!account) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Connect Wallet</ThemedText>
        <ThemedText>Please connect your wallet to complete KYC</ThemedText>
      </ThemedView>
    );
  }

  if (kycStatus === true) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.successCard}>
          <ThemedText style={styles.successTitle}>✅ KYC Verified</ThemedText>
          <ThemedText style={styles.successText}>
            Your account is verified and ready to use EtherPesa!
          </ThemedText>
          <ThemedText style={styles.address}>
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </ThemedText>
        </View>
        
        <View style={styles.infoCard}>
          <ThemedText style={styles.infoTitle}>What's Next?</ThemedText>
          <ThemedText style={styles.infoText}>
            • You can now send and receive transfers
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Deposit funds via Transak integration
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Withdraw to your bank account through agents
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Complete KYC</ThemedText>
      <ThemedText style={styles.subtitle}>
        Verify your identity to use EtherPesa
      </ThemedText>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Phone Number</ThemedText>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+1234567890"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            autoCapitalize="none"
          />
          <ThemedText style={styles.inputHint}>
            Your phone number will be hashed for privacy
          </ThemedText>
        </View>

        <View style={styles.button}>
          <ThemedButton
            title={loading ? 'Submitting...' : 'Submit KYC'}
            onPress={handleKYCSubmission}
          />
        </View>
      </View>

      <View style={styles.infoCard}>
        <ThemedText style={styles.infoTitle}>Why KYC?</ThemedText>
        <ThemedText style={styles.infoText}>
          • Required for regulatory compliance
        </ThemedText>
        <ThemedText style={styles.infoText}>
          • Enables fiat on/off-ramp services
        </ThemedText>
        <ThemedText style={styles.infoText}>
          • Protects against fraud and money laundering
        </ThemedText>
        <ThemedText style={styles.infoText}>
          • Your data is hashed and stored securely on-chain
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
    borderColor: '#ddd',
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
  button: {
    marginTop: 16,
  },
  successCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#e8f5e8',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d5a2d',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#2d5a2d',
    textAlign: 'center',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    opacity: 0.6,
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
    marginBottom: 4,
    opacity: 0.8,
  },
});
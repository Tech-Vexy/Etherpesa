import React, { useState } from 'react';
import { View, StyleSheet, Alert, TextInput, Modal } from 'react-native';
import { useConnect, useActiveAccount, useDisconnect, useActiveWallet } from 'thirdweb/react';
import { createWallet, inAppWallet } from 'thirdweb/wallets';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { ThemedButton } from './ThemedButton';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { client, chain } from '@/constants/thirdweb';
import { useRouter } from 'expo-router';

interface WalletConnectProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'google' | 'facebook' | 'passkey'>('email');

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');

  const handleConnect = async (method: 'email' | 'phone' | 'google' | 'facebook' | 'passkey') => {
    setIsConnecting(true);
    try {
      let strategy: any;
      
      switch (method) {
        case 'email':
          if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            setIsConnecting(false);
            return;
          }
          strategy = "email";
          break;
        case 'phone':
          if (!phoneNumber) {
            Alert.alert('Error', 'Please enter your phone number');
            setIsConnecting(false);
            return;
          }
          strategy = "phone";
          break;
        case 'google':
          strategy = "google";
          break;
        case 'facebook':
          strategy = "facebook";
          break;
        case 'passkey':
          strategy = "passkey";
          break;
      }

      // Create in-app wallet with enhanced configuration for transaction tracking
      const wallet = inAppWallet({
        auth: {
          options: [strategy],
          // Configure auth domain for better tracking
          passkeyDomain: "etherpesa.app",
        },
        // Enable smart account features for better UX and tracking
        smartAccount: {
          chain,
          sponsorGas: true, // Enable gasless transactions where possible
        },
      });

      const result = await connect(async () => {
        await wallet.connect({
          client,
          chain,
          strategy,
          ...(method === 'email' && { email }),
          ...(method === 'phone' && { phoneNumber }),
        });
        return wallet;
      });

      setShowLoginModal(false);
      setEmail('');
      setPhoneNumber('');
      onConnect?.();
      
      // Navigate to home page immediately after successful connection
      router.replace('/home');
      
      Alert.alert(
        'Success', 
        `Wallet connected successfully! 🎉\n\n📊 All your transactions will be automatically tracked in the thirdweb dashboard for analytics and insights.`
      );
    } catch (error: any) {
      console.error('Connection error:', error);
      Alert.alert('Connection Failed', error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };
  const handleDisconnect = async () => {
  try {
    if (!activeWallet) {
      Alert.alert('Error', 'No wallet is currently connected');
      return;
    }
    await disconnect(activeWallet);
    onDisconnect?.();
    Alert.alert('Disconnected', 'Wallet has been disconnected');
  } catch (error) {
    console.error('Disconnect error:', error);
    Alert.alert('Error', 'Failed to disconnect wallet');
  }
};

  if (account) {
    return (
      <ThemedView style={[styles.connectedContainer, { backgroundColor: cardBackground }]}>
        <View style={styles.walletInfo}>
          <Ionicons name="wallet" size={24} color={Colors.light.success} />
          <View style={styles.addressContainer}>
            <ThemedText style={[styles.connectedLabel, { color: textColor }]}>
              Connected Wallet
            </ThemedText>
            <ThemedText style={[styles.address, { color: textColor }]}>
              {account.address.slice(0, 10)}...{account.address.slice(-8)}
            </ThemedText>
            <ThemedText style={[styles.trackingLabel, { color: Colors.light.success }]}>
              📊 Tracked via thirdweb
            </ThemedText>
          </View>
        </View>
        <ThemedButton
          title="Disconnect"
          onPress={handleDisconnect}
        />
      </ThemedView>
    );
  }

  return (
    <>
      <ThemedView style={[styles.container, { backgroundColor: cardBackground }]}>
        <ThemedText style={[styles.title, { color: textColor }]}>
          Connect Your Wallet
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: textColor }]}>
          Use thirdweb in-app wallet for seamless transactions and comprehensive tracking
        </ThemedText>
        
        <View style={styles.buttonContainer}>
          <ThemedButton
            title="🔑 Connect with Passkey"
            onPress={() => handleConnect('passkey')}
            loading={isConnecting}
          />
          <ThemedButton
            title="📧 Connect with Email"
            onPress={() => {
              setLoginMethod('email');
              setShowLoginModal(true);
            }}
            loading={isConnecting}
          />
          <ThemedButton
            title="📱 Connect with Phone"
            onPress={() => {
              setLoginMethod('phone');
              setShowLoginModal(true);
            }}
            loading={isConnecting}
          />
          <ThemedButton
            title="🔍 Connect with Google"
            onPress={() => handleConnect('google')}
            loading={isConnecting}
          />
          <ThemedButton
            title="📘 Connect with Facebook"
            onPress={() => handleConnect('facebook')}
            loading={isConnecting}
          />
        </View>
        
        <ThemedText style={[styles.trackingInfo, { color: textColor }]}>
          ⚡ Enhanced with smart account features
        </ThemedText>
      </ThemedView>

      <Modal
        visible={showLoginModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLoginModal(false)}
      >
        <ThemedView style={[styles.modalContainer, { backgroundColor }]}>
              <View style={styles.modalHeader}>
                <ThemedText style={[styles.modalTitle, { color: textColor }]}>
                  {loginMethod === 'email' ? 'Enter Email' : 'Enter Phone Number'}
                </ThemedText>
                <ThemedButton
                  title="Cancel"
                  onPress={() => setShowLoginModal(false)}
                />
              </View>
              
              <View style={styles.inputContainer}>
                {loginMethod === 'email' ? (
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor: Colors.light.border }]}
                    placeholder="Enter your email address"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                ) : (
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor: Colors.light.border }]}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#999"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                  />
                )}
                
                <ThemedButton
                  title={isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  onPress={() => handleConnect(loginMethod)}
                  loading={isConnecting}
                />
              </View>
            </ThemedView>
          </Modal>
        </>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        padding: 20,
        borderRadius: 16,
        margin: 16,
        elevation: 2,
        shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  connectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  connectedLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  address: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  trackingLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 16,
  },
  connectButton: {
    marginVertical: 4,
  },
  disconnectButton: {
    backgroundColor: Colors.light.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  trackingInfo: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: Colors.light.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputContainer: {
    gap: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  submitButton: {
    marginTop: 16,
  },
});

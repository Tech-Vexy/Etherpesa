import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import Ionicons from '@expo/vector-icons/Ionicons';

interface BalanceCardProps {
  balance: string;
  address: string;
  onEyePress?: () => void;
  isBalanceHidden?: boolean;
}

export function BalanceCard({ balance, address, onEyePress, isBalanceHidden = false }: BalanceCardProps) {
  const backgroundColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'textInverted');
  const iconColor = useThemeColor({}, 'textInverted');

  return (
    <ThemedView style={[styles.card, { backgroundColor }]}>
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <ThemedText style={[styles.greeting, { color: textColor }]}>Good Morning</ThemedText>
          <ThemedText style={[styles.accountType, { color: textColor }]}>EtherPesa Account</ThemedText>
        </View>
        <TouchableOpacity onPress={onEyePress} style={styles.eyeButton}>
          <Ionicons 
            name={isBalanceHidden ? "eye-off" : "eye"} 
            size={24} 
            color={iconColor} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.balanceSection}>
        <ThemedText style={[styles.balance, { color: textColor }]}>
          {isBalanceHidden ? '***,*** MT' : `${Number(balance).toLocaleString('en-US')} MT`}
        </ThemedText>
        <TouchableOpacity style={styles.hideBalanceButton}>
          <ThemedText style={[styles.hideBalanceText, { color: textColor }]}>
            ⚡ Hide balance
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.bottomSection}>
        <ThemedText style={[styles.availableBalance, { color: textColor }]}>
          Available Bal: Ksh {isBalanceHidden ? '***,***' : Number(balance).toLocaleString('en-US')}
        </ThemedText>
        <ThemedText style={[styles.address, { color: textColor }]}>
          Wallet: {address.slice(0, 6)}...{address.slice(-4)}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 16,
    minHeight: 200,
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    opacity: 0.8,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  balanceSection: {
    marginVertical: 12,
  },
  balance: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: -1,
  },
  hideBalanceButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  hideBalanceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bottomSection: {
    marginTop: 8,
  },
  availableBalance: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  address: {
    fontSize: 12,
    opacity: 0.8,
    fontFamily: 'monospace',
  },
});

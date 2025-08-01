import React from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import Ionicons from '@expo/vector-icons/Ionicons';

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  currency?: string;
}

interface QuickAmountProps {
  amounts: number[];
  onAmountSelect: (amount: number) => void;
}

export function AmountInput({ value, onChangeText, placeholder = "0.00", currency = "USDC" }: AmountInputProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const borderColor = useThemeColor({}, 'border');

  return (
    <ThemedView style={[styles.container, { backgroundColor, borderColor }]}>
      <View style={styles.currencyContainer}>
        <ThemedText style={[styles.currencySymbol, { color: textColor }]}>$</ThemedText>
      </View>
      <TextInput
        style={[styles.input, { color: textColor }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={subtextColor}
        keyboardType="decimal-pad"
        autoFocus
      />
      <View style={styles.currencyLabelContainer}>
        <ThemedText style={[styles.currencyLabel, { color: subtextColor }]}>{currency}</ThemedText>
      </View>
    </ThemedView>
  );
}

export function QuickAmountButtons({ amounts, onAmountSelect }: QuickAmountProps) {
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <View style={styles.quickAmountsContainer}>
      <ThemedText style={[styles.quickAmountsTitle, { color: textColor }]}>Quick amounts</ThemedText>
      <View style={styles.quickAmountsGrid}>
        {amounts.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={[styles.quickAmountButton, { backgroundColor, borderColor: tintColor }]}
            onPress={() => onAmountSelect(amount)}
          >
            <ThemedText style={[styles.quickAmountText, { color: tintColor }]}>
              ${amount}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 8,
  },
  currencyContainer: {
    marginRight: 8,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'left',
  },
  currencyLabelContainer: {
    marginLeft: 8,
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  quickAmountsContainer: {
    marginVertical: 16,
  },
  quickAmountsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAmountButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

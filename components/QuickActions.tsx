import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import Ionicons from '@expo/vector-icons/Ionicons';

interface QuickActionProps {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
}

interface QuickActionsProps {
  onSendPress: () => void;
  onReceivePress: () => void;
  onWithdrawPress: () => void;
  onTopUpPress: () => void;
}

function QuickAction({ icon, label, onPress, color }: QuickActionProps) {
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const iconColor = color || useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
        <Ionicons name={icon as any} size={26} color="#FFFFFF" />
      </View>
      <ThemedText style={[styles.actionLabel, { color: textColor }]}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

export function QuickActions({ onSendPress, onReceivePress, onWithdrawPress, onTopUpPress }: QuickActionsProps) {
  const cardBackground = useThemeColor({}, 'backgroundSecondary');

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBackground }]}>
      <View style={styles.actionsRow}>
        <QuickAction
          icon="send"
          label="Send money"
          onPress={onSendPress}
          color="#10B981"
        />
        <QuickAction
          icon="qr-code"
          label="Receive"
          onPress={onReceivePress}
          color="#8B5CF6"
        />
        <QuickAction
          icon="arrow-down-circle"
          label="Withdraw"
          onPress={onWithdrawPress}
          color="#F59E0B"
        />
        <QuickAction
          icon="flash"
          label="Pay LUKU"
          onPress={onTopUpPress}
          color="#EF4444"
        />
      </View>
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
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  actionLabel: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 80,
    fontWeight: '500',
  },
});

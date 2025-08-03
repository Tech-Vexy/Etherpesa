import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useSecurity } from '@/contexts/SecurityContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';

interface EnhancedSecurityCardProps {
  onPress?: () => void;
}

export function EnhancedSecurityCard({ onPress }: EnhancedSecurityCardProps) {
  const { 
    isSecurityEnabled, 
    failedAttempts, 
    isTemporarilyBlocked, 
    blockTimeRemaining,
    getSecurityMetrics 
  } = useSecurity();
  
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const tintColor = useThemeColor({}, 'tint');
  
  const metrics = getSecurityMetrics();
  
  const getSecurityStatusColor = () => {
    if (isTemporarilyBlocked) return Colors.light.error;
    if (!isSecurityEnabled) return Colors.light.warning;
    if (failedAttempts > 0) return Colors.light.warning;
    return Colors.light.success;
  };

  const getSecurityStatusIcon = () => {
    if (isTemporarilyBlocked) return 'lock-closed';
    if (!isSecurityEnabled) return 'shield-outline';
    if (failedAttempts > 0) return 'warning';
    return 'shield-checkmark';
  };

  const getSecurityStatusText = () => {
    if (isTemporarilyBlocked) {
      const minutes = Math.ceil(blockTimeRemaining / 60000);
      return `Blocked for ${minutes}m`;
    }
    if (!isSecurityEnabled) return 'Not Protected';
    if (failedAttempts > 0) return `${failedAttempts} Failed Attempts`;
    return 'Protected';
  };

  const getSecurityLevelColor = () => {
    switch (metrics.securityLevel) {
      case 'MAXIMUM': return Colors.light.success;
      case 'HIGH': return Colors.light.tint;
      case 'MEDIUM': return Colors.light.warning;
      case 'LOW': return Colors.light.error;
      default: return Colors.light.warning;
    }
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <ThemedView style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="shield-checkmark" size={24} color={tintColor} />
            <ThemedText style={[styles.title, { color: textColor }]}>
              Passkey Protection
            </ThemedText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getSecurityStatusColor() }]}>
            <Ionicons name={getSecurityStatusIcon()} size={16} color="white" />
            <ThemedText style={styles.statusText}>
              {getSecurityStatusText()}
            </ThemedText>
          </View>
        </View>

        {/* Security Level */}
        <View style={styles.row}>
          <ThemedText style={[styles.label, { color: subtextColor }]}>
            Security Level
          </ThemedText>
          <View style={[styles.levelBadge, { backgroundColor: getSecurityLevelColor() }]}>
            <ThemedText style={styles.levelText}>
              {metrics.securityLevel}
            </ThemedText>
          </View>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metric}>
            <ThemedText style={[styles.metricValue, { color: textColor }]}>
              {metrics.successfulUnlocks}
            </ThemedText>
            <ThemedText style={[styles.metricLabel, { color: subtextColor }]}>
              Successful
            </ThemedText>
          </View>
          
          <View style={styles.metric}>
            <ThemedText style={[styles.metricValue, { color: textColor }]}>
              {metrics.failedUnlocks}
            </ThemedText>
            <ThemedText style={[styles.metricLabel, { color: subtextColor }]}>
              Failed
            </ThemedText>
          </View>
          
          <View style={styles.metric}>
            <ThemedText style={[styles.metricValue, { color: textColor }]}>
              {Math.round(metrics.averageUnlockTime)}ms
            </ThemedText>
            <ThemedText style={[styles.metricLabel, { color: subtextColor }]}>
              Avg Time
            </ThemedText>
          </View>
        </View>

        {/* Last Unlock */}
        <View style={styles.row}>
          <ThemedText style={[styles.label, { color: subtextColor }]}>
            Last Unlock
          </ThemedText>
          <ThemedText style={[styles.value, { color: textColor }]}>
            {formatTime(metrics.lastUnlockTime)}
          </ThemedText>
        </View>

        {/* Quick Info */}
        <View style={styles.infoRow}>
          <Ionicons name="information-circle" size={16} color={tintColor} />
          <ThemedText style={[styles.infoText, { color: subtextColor }]}>
            {isSecurityEnabled 
              ? 'Your wallet is protected with passkey authentication'
              : 'Enable passkey protection in Security settings'
            }
          </ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
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
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});

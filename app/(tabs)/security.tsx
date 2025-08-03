import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { useSecurity, AUTO_LOCK_DELAYS } from '@/contexts/SecurityContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SecurityScreen() {
  const {
    isSecurityEnabled,
    autoLockDelay,
    enableSecurity,
    disableSecurity,
    setAutoLockDelay,
    lockApp,
    requireAuth,
    checkPasskeySupport,
    // Enhanced security features
    failedAttempts,
    isTemporarilyBlocked,
    blockTimeRemaining,
    enableEnhancedSecurity,
    resetFailedAttempts,
    getSecurityMetrics,
  } = useSecurity();

  const [passkeySupported, setPasskeySupported] = useState(false);
  const [loading, setLoading] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    const checkSupport = async () => {
      const supported = await checkPasskeySupport();
      setPasskeySupported(supported);
    };
    checkSupport();
  }, []);

  const handleToggleSecurity = async () => {
    if (!passkeySupported) {
      Alert.alert(
        'Not Supported',
        'Passkeys are not supported on this device. Please ensure you have a compatible device with biometric authentication enabled.'
      );
      return;
    }

    setLoading(true);
    try {
      if (isSecurityEnabled) {
        const success = await disableSecurity();
        if (success) {
          Alert.alert(
            'Security Disabled',
            'App protection has been disabled successfully.'
          );
        } else {
          Alert.alert(
            'Authentication Failed',
            'Could not disable security. Please try again.'
          );
        }
      } else {
        const success = await enableSecurity();
        if (success) {
          Alert.alert(
            'Security Enabled',
            'App protection has been enabled successfully. Your app will now be protected with passkey authentication.'
          );
        } else {
          Alert.alert(
            'Setup Failed',
            'Could not enable security. Please ensure your device supports passkeys and try again.'
          );
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred while updating security settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoLockChange = async (delay: number) => {
    try {
      await setAutoLockDelay(delay);
    } catch (error) {
      Alert.alert('Error', 'Failed to update auto-lock setting.');
    }
  };

  const handleLockNow = async () => {
    if (!isSecurityEnabled) {
      Alert.alert(
        'Security Not Enabled',
        'Please enable app protection first to use this feature.'
      );
      return;
    }

    Alert.alert(
      'Lock App Now',
      'Are you sure you want to lock the app now?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Lock',
          style: 'default',
          onPress: () => lockApp(),
        },
      ]
    );
  };

  const handleTestAuth = async () => {
    if (!isSecurityEnabled) {
      Alert.alert(
        'Security Not Enabled',
        'Please enable app protection first to test authentication.'
      );
      return;
    }

    setLoading(true);
    try {
      const success = await requireAuth();
      if (success) {
        Alert.alert('Success', 'Authentication test passed! 🎉');
      } else {
        Alert.alert('Failed', 'Authentication test failed. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication test failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableEnhancedSecurity = async () => {
    if (!passkeySupported) {
      Alert.alert(
        'Not Supported',
        'Enhanced security requires passkey support on your device.'
      );
      return;
    }

    Alert.alert(
      'Enable Enhanced Security',
      'This will enable maximum security with stricter auto-lock settings and advanced threat detection. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Enable',
          style: 'default',
          onPress: async () => {
            setLoading(true);
            try {
              const success = await enableEnhancedSecurity();
              if (success) {
                Alert.alert(
                  'Enhanced Security Enabled',
                  'Your app is now protected with maximum security settings.'
                );
              } else {
                Alert.alert('Error', 'Failed to enable enhanced security.');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to enable enhanced security.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleResetFailedAttempts = () => {
    Alert.alert(
      'Reset Failed Attempts',
      'This will reset the failed authentication attempt counter. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'default',
          onPress: () => {
            resetFailedAttempts();
            Alert.alert('Success', 'Failed attempt counter has been reset.');
          },
        },
      ]
    );
  };

  const getAutoLockLabel = (delay: number): string => {
    switch (delay) {
      case AUTO_LOCK_DELAYS.IMMEDIATE:
        return 'Immediately';
      case AUTO_LOCK_DELAYS.THIRTY_SECONDS:
        return '30 seconds';
      case AUTO_LOCK_DELAYS.ONE_MINUTE:
        return '1 minute';
      case AUTO_LOCK_DELAYS.FIVE_MINUTES:
        return '5 minutes';
      case AUTO_LOCK_DELAYS.FIFTEEN_MINUTES:
        return '15 minutes';
      case AUTO_LOCK_DELAYS.NEVER:
        return 'Never';
      default:
        return 'Custom';
    }
  };

  const autoLockOptions = [
    { label: 'Immediately', value: AUTO_LOCK_DELAYS.IMMEDIATE },
    { label: '30 seconds', value: AUTO_LOCK_DELAYS.THIRTY_SECONDS },
    { label: '1 minute', value: AUTO_LOCK_DELAYS.ONE_MINUTE },
    { label: '5 minutes', value: AUTO_LOCK_DELAYS.FIVE_MINUTES },
    { label: '15 minutes', value: AUTO_LOCK_DELAYS.FIFTEEN_MINUTES },
    { label: 'Never', value: AUTO_LOCK_DELAYS.NEVER },
  ];

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="shield-checkmark" size={32} color={tintColor} />
          </View>
          <ThemedText style={[styles.title, { color: textColor }]}>
            Security & Privacy
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: subtextColor }]}>
            Protect your wallet and transactions with biometric authentication
          </ThemedText>
        </View>

        {/* Passkey Support Status */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name={passkeySupported ? "checkmark-circle" : "close-circle"}
              size={24}
              color={passkeySupported ? Colors.light.success : Colors.light.error}
            />
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Device Compatibility
            </ThemedText>
          </View>
          <ThemedText style={[styles.sectionDescription, { color: subtextColor }]}>
            {passkeySupported
              ? 'Your device supports passkey authentication and biometric security.'
              : 'Your device does not support passkey authentication. Some security features may not be available.'
            }
          </ThemedText>
        </View>

        {/* App Protection Toggle */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <Ionicons name="lock-closed" size={20} color={tintColor} />
                <ThemedText style={[styles.settingTitle, { color: textColor }]}>
                  App Protection
                </ThemedText>
              </View>
              <ThemedText style={[styles.settingDescription, { color: subtextColor }]}>
                Require passkey authentication to access the app
              </ThemedText>
            </View>
            <Switch
              value={isSecurityEnabled}
              onValueChange={handleToggleSecurity}
              disabled={loading || !passkeySupported}
              trackColor={{ false: '#767577', true: tintColor }}
              thumbColor={isSecurityEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Auto-lock Settings */}
        {isSecurityEnabled && (
          <View style={[styles.section, { backgroundColor: cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={24} color={tintColor} />
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                Auto-lock
              </ThemedText>
            </View>
            <ThemedText style={[styles.sectionDescription, { color: subtextColor }]}>
              Automatically lock the app after a period of inactivity
            </ThemedText>
            
            <View style={styles.autoLockOptions}>
              {autoLockOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.autoLockOption,
                    autoLockDelay === option.value && styles.autoLockOptionSelected,
                  ]}
                  onPress={() => handleAutoLockChange(option.value)}
                >
                  <ThemedText
                    style={[
                      styles.autoLockOptionText,
                      { color: autoLockDelay === option.value ? '#ffffff' : textColor },
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                  {autoLockDelay === option.value && (
                    <Ionicons name="checkmark" size={20} color="#ffffff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Security Actions */}
        {isSecurityEnabled && (
          <View style={[styles.section, { backgroundColor: cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings" size={24} color={tintColor} />
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                Security Actions
              </ThemedText>
            </View>
            
            <View style={styles.actionButtons}>
              <ThemedButton
                title="🔒 Lock App Now"
                onPress={handleLockNow}
              />
              
              <ThemedButton
                title={loading ? "Testing..." : "🔐 Test Authentication"}
                onPress={loading ? () => {} : handleTestAuth}
              />
              
              <ThemedButton
                title={getSecurityMetrics().securityLevel === 'MAXIMUM' ? "✅ Maximum Security Active" : "🛡️ Enable Enhanced Security"}
                onPress={(!passkeySupported || getSecurityMetrics().securityLevel === 'MAXIMUM') ? () => {} : handleEnableEnhancedSecurity}
              />
            </View>
          </View>
        )}

        {/* Security Status */}
        {isSecurityEnabled && (
          <View style={[styles.section, { backgroundColor: cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="analytics" size={24} color={tintColor} />
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                Security Status & Metrics
              </ThemedText>
            </View>
            
            <View style={styles.statusGrid}>
              <View style={styles.statusItem}>
                <ThemedText style={[styles.statusLabel, { color: subtextColor }]}>
                  Failed Attempts
                </ThemedText>
                <ThemedText style={[styles.statusValue, { 
                  color: failedAttempts > 0 ? Colors.light.error : Colors.light.success 
                }]}>
                  {failedAttempts}
                </ThemedText>
              </View>
              
              <View style={styles.statusItem}>
                <ThemedText style={[styles.statusLabel, { color: subtextColor }]}>
                  Security Level
                </ThemedText>
                <ThemedText style={[styles.statusValue, { 
                  color: getSecurityMetrics().securityLevel === 'MAXIMUM' ? Colors.light.success : Colors.light.warning 
                }]}>
                  {getSecurityMetrics().securityLevel}
                </ThemedText>
              </View>
              
              <View style={styles.statusItem}>
                <ThemedText style={[styles.statusLabel, { color: subtextColor }]}>
                  Status
                </ThemedText>
                <ThemedText style={[styles.statusValue, { 
                  color: isTemporarilyBlocked ? Colors.light.error : Colors.light.success 
                }]}>
                  {isTemporarilyBlocked ? 'BLOCKED' : 'ACTIVE'}
                </ThemedText>
              </View>
            </View>
            
            {/* Metrics Display */}
            <View style={styles.metricsRow}>
              <View style={styles.metricBox}>
                <ThemedText style={[styles.metricValue, { color: Colors.light.success }]}>
                  {getSecurityMetrics().successfulUnlocks}
                </ThemedText>
                <ThemedText style={[styles.metricLabel, { color: subtextColor }]}>
                  Successful
                </ThemedText>
              </View>
              <View style={styles.metricBox}>
                <ThemedText style={[styles.metricValue, { color: Colors.light.error }]}>
                  {getSecurityMetrics().failedUnlocks}
                </ThemedText>
                <ThemedText style={[styles.metricLabel, { color: subtextColor }]}>
                  Failed
                </ThemedText>
              </View>
              <View style={styles.metricBox}>
                <ThemedText style={[styles.metricValue, { color: tintColor }]}>
                  {Math.round(getSecurityMetrics().averageUnlockTime)}ms
                </ThemedText>
                <ThemedText style={[styles.metricLabel, { color: subtextColor }]}>
                  Avg Time
                </ThemedText>
              </View>
            </View>
            
            {isTemporarilyBlocked && (
              <View style={[styles.warningBanner, { backgroundColor: Colors.light.error + '20' }]}>
                <Ionicons name="warning" size={20} color={Colors.light.error} />
                <ThemedText style={[styles.warningText, { color: Colors.light.error }]}>
                  Account temporarily blocked for {Math.ceil(blockTimeRemaining / 60000)} minutes
                </ThemedText>
              </View>
            )}
            
            {failedAttempts > 0 && !isTemporarilyBlocked && (
              <View style={styles.resetButtonContainer}>
                <ThemedButton
                  title="Reset Failed Attempts"
                  onPress={handleResetFailedAttempts}
                />
              </View>
            )}
          </View>
        )}

        {/* Security Information */}
        <View style={[styles.section, { backgroundColor: cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color={tintColor} />
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Security Information
            </ThemedText>
          </View>
          
          <View style={styles.securityFeatures}>
            <View style={styles.securityFeature}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.light.success} />
              <ThemedText style={[styles.securityFeatureText, { color: subtextColor }]}>
                <ThemedText style={styles.bold}>Passkey Protection:</ThemedText> Uses device biometrics or PIN
              </ThemedText>
            </View>
            
            <View style={styles.securityFeature}>
              <Ionicons name="timer" size={16} color={Colors.light.success} />
              <ThemedText style={[styles.securityFeatureText, { color: subtextColor }]}>
                <ThemedText style={styles.bold}>Auto-lock:</ThemedText> Automatically secures app when inactive
              </ThemedText>
            </View>
            
            <View style={styles.securityFeature}>
              <Ionicons name="eye-off" size={16} color={Colors.light.success} />
              <ThemedText style={[styles.securityFeatureText, { color: subtextColor }]}>
                <ThemedText style={styles.bold}>Privacy:</ThemedText> No biometric data is stored by the app
              </ThemedText>
            </View>
            
            <View style={styles.securityFeature}>
              <Ionicons name="lock-open" size={16} color={Colors.light.success} />
              <ThemedText style={[styles.securityFeatureText, { color: subtextColor }]}>
                <ThemedText style={styles.bold}>Local Only:</ThemedText> All authentication happens on your device
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  autoLockOptions: {
    gap: 8,
  },
  autoLockOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  autoLockOptionSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  autoLockOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    marginVertical: 4,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  metricBox: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    minWidth: 80,
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  resetButtonContainer: {
    marginTop: 16,
  },
  securityFeatures: {
    gap: 12,
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  securityFeatureText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
  },
});

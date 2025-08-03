import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { useSecurity } from '@/contexts/SecurityContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

interface AppLockScreenProps {
  onUnlock: () => void;
}

export function AppLockScreen({ onUnlock }: AppLockScreenProps) {
  const { unlockApp, isSecurityEnabled } = useSecurity();
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const tintColor = useThemeColor({}, 'tint');

  // Block for 30 seconds after 3 failed attempts
  const MAX_ATTEMPTS = 3;
  const BLOCK_DURATION = 30000; // 30 seconds

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isBlocked && blockTimeRemaining > 0) {
      interval = setInterval(() => {
        setBlockTimeRemaining(prev => {
          if (prev <= 1000) {
            setIsBlocked(false);
            setAttemptCount(0);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBlocked, blockTimeRemaining]);

  const handleUnlock = async () => {
    if (isBlocked) {
      Alert.alert(
        'Too Many Attempts',
        `Please wait ${Math.ceil(blockTimeRemaining / 1000)} seconds before trying again.`
      );
      return;
    }

    setIsUnlocking(true);
    try {
      const success = await unlockApp();
      if (success) {
        setAttemptCount(0);
        onUnlock();
      } else {
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);
        
        if (newAttemptCount >= MAX_ATTEMPTS) {
          setIsBlocked(true);
          setBlockTimeRemaining(BLOCK_DURATION);
          Alert.alert(
            'Too Many Failed Attempts',
            `App is temporarily blocked for ${BLOCK_DURATION / 1000} seconds.`
          );
        } else {
          Alert.alert(
            'Authentication Failed',
            `Failed to authenticate. ${MAX_ATTEMPTS - newAttemptCount} attempts remaining.`
          );
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setIsUnlocking(false);
    }
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Background blur effect */}
      <View style={styles.blurOverlay} />
      
      {/* Main content */}
      <View style={styles.content}>
        {/* App logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
          />
          <ThemedText style={[styles.appName, { color: textColor }]}>
            EtherPesa
          </ThemedText>
        </View>

        {/* Lock icon */}
        <View style={[styles.lockIconContainer, { backgroundColor: tintColor }]}>
          <Ionicons
            name={isBlocked ? "alert-circle" : "lock-closed"}
            size={60}
            color="white"
          />
        </View>

        {/* Title and description */}
        <View style={styles.textContainer}>
          <ThemedText style={[styles.title, { color: textColor }]}>
            {isBlocked ? "Temporarily Blocked" : "App Locked"}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: subtextColor }]}>
            {isBlocked
              ? `Too many failed attempts. Try again in ${formatTime(blockTimeRemaining)}.`
              : "Use your passkey or biometric authentication to unlock EtherPesa"
            }
          </ThemedText>
        </View>

        {/* Unlock button */}
        <View style={styles.buttonContainer}>
          <ThemedButton
            title={
              isUnlocking
                ? "Authenticating..."
                : isBlocked
                ? `Wait ${formatTime(blockTimeRemaining)}`
                : "Unlock with Passkey"
            }
            onPress={isUnlocking || isBlocked ? () => {} : handleUnlock}
          />
          
          {isUnlocking && (
            <ActivityIndicator
              size="small"
              color={tintColor}
              style={styles.loadingIndicator}
            />
          )}
        </View>

        {/* Security info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={16} color={Colors.light.success} />
            <ThemedText style={[styles.infoText, { color: subtextColor }]}>
              Your data is protected with biometric authentication
            </ThemedText>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="lock-closed" size={16} color={Colors.light.success} />
            <ThemedText style={[styles.infoText, { color: subtextColor }]}>
              App automatically locks for your security
            </ThemedText>
          </View>
          {attemptCount > 0 && !isBlocked && (
            <View style={styles.warningItem}>
              <Ionicons name="warning" size={16} color={Colors.light.warning} />
              <ThemedText style={[styles.warningText, { color: Colors.light.warning }]}>
                {MAX_ATTEMPTS - attemptCount} attempts remaining
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  lockIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  unlockButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingIndicator: {
    marginTop: 12,
  },
  infoContainer: {
    width: '100%',
    maxWidth: 320,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 8,
  },
  warningText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    fontWeight: '600',
  },
});

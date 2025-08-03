import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { Passkey } from 'react-native-passkey';
import type { PasskeyCreateRequest, PasskeyGetRequest } from 'react-native-passkey';

export interface SecurityContextType {
  isLocked: boolean;
  isSecurityEnabled: boolean;
  autoLockDelay: number;
  lastActiveTime: number;
  unlockApp: () => Promise<boolean>;
  lockApp: () => void;
  enableSecurity: () => Promise<boolean>;
  disableSecurity: () => Promise<boolean>;
  setAutoLockDelay: (delay: number) => Promise<void>;
  requireAuth: () => Promise<boolean>;
  checkPasskeySupport: () => Promise<boolean>;
  // Enhanced security features
  failedAttempts: number;
  isTemporarilyBlocked: boolean;
  blockTimeRemaining: number;
  enableEnhancedSecurity: () => Promise<boolean>;
  resetFailedAttempts: () => void;
  getSecurityMetrics: () => SecurityMetrics;
}

export interface SecurityMetrics {
  totalUnlockAttempts: number;
  successfulUnlocks: number;
  failedUnlocks: number;
  lastUnlockTime: number;
  averageUnlockTime: number;
  securityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM';
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityProviderProps {
  children: ReactNode;
}

const STORAGE_KEYS = {
  SECURITY_ENABLED: '@etherpesa_security_enabled',
  AUTO_LOCK_DELAY: '@etherpesa_auto_lock_delay',
  LAST_ACTIVE_TIME: '@etherpesa_last_active_time',
  PASSKEY_CREDENTIAL_ID: '@etherpesa_passkey_credential_id',
  SECURITY_METRICS: '@etherpesa_security_metrics',
  FAILED_ATTEMPTS: '@etherpesa_failed_attempts',
  BLOCK_UNTIL: '@etherpesa_block_until',
};

// Auto-lock delays in milliseconds
export const AUTO_LOCK_DELAYS = {
  IMMEDIATE: 0,
  THIRTY_SECONDS: 30 * 1000,
  ONE_MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  FIFTEEN_MINUTES: 15 * 60 * 1000,
  NEVER: -1,
};

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [isSecurityEnabled, setIsSecurityEnabled] = useState(false);
  const [autoLockDelay, setAutoLockDelayState] = useState(AUTO_LOCK_DELAYS.FIVE_MINUTES);
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isTemporarilyBlocked, setIsTemporarilyBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    totalUnlockAttempts: 0,
    successfulUnlocks: 0,
    failedUnlocks: 0,
    lastUnlockTime: 0,
    averageUnlockTime: 0,
    securityLevel: 'MEDIUM',
  });

  // Enhanced security settings
  const MAX_FAILED_ATTEMPTS = 5;
  const BLOCK_DURATION = 300000; // 5 minutes

  // Initialize security settings
  useEffect(() => {
    const initializeSecurity = async () => {
      try {
        const [
          securityEnabled,
          storedAutoLockDelay,
          storedLastActiveTime,
          storedFailedAttempts,
          storedBlockUntil,
          storedMetrics,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.SECURITY_ENABLED),
          AsyncStorage.getItem(STORAGE_KEYS.AUTO_LOCK_DELAY),
          AsyncStorage.getItem(STORAGE_KEYS.LAST_ACTIVE_TIME),
          AsyncStorage.getItem(STORAGE_KEYS.FAILED_ATTEMPTS),
          AsyncStorage.getItem(STORAGE_KEYS.BLOCK_UNTIL),
          AsyncStorage.getItem(STORAGE_KEYS.SECURITY_METRICS),
        ]);

        const isEnabled = securityEnabled === 'true';
        setIsSecurityEnabled(isEnabled);
        
        if (storedAutoLockDelay) {
          setAutoLockDelayState(parseInt(storedAutoLockDelay, 10));
        }

        if (storedLastActiveTime) {
          setLastActiveTime(parseInt(storedLastActiveTime, 10));
        }

        if (storedFailedAttempts) {
          setFailedAttempts(parseInt(storedFailedAttempts, 10));
        }

        if (storedBlockUntil) {
          const blockUntil = parseInt(storedBlockUntil, 10);
          const now = Date.now();
          if (blockUntil > now) {
            setIsTemporarilyBlocked(true);
            setBlockTimeRemaining(blockUntil - now);
            
            // Start countdown timer
            const interval = setInterval(() => {
              setBlockTimeRemaining(prev => {
                if (prev <= 1000) {
                  setIsTemporarilyBlocked(false);
                  setFailedAttempts(0);
                  clearInterval(interval);
                  AsyncStorage.removeItem(STORAGE_KEYS.BLOCK_UNTIL);
                  AsyncStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
                  return 0;
                }
                return prev - 1000;
              });
            }, 1000);
          } else {
            // Block period expired
            AsyncStorage.removeItem(STORAGE_KEYS.BLOCK_UNTIL);
            AsyncStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
          }
        }

        if (storedMetrics) {
          try {
            const metrics = JSON.parse(storedMetrics);
            setSecurityMetrics(metrics);
          } catch (error) {
            console.error('Error parsing security metrics:', error);
          }
        }

        // Check if app should be locked based on time since last activity
        if (isEnabled) {
          const timeSinceLastActive = Date.now() - (storedLastActiveTime ? parseInt(storedLastActiveTime, 10) : Date.now());
          const currentAutoLockDelay = storedAutoLockDelay ? parseInt(storedAutoLockDelay, 10) : AUTO_LOCK_DELAYS.FIVE_MINUTES;
          
          if (currentAutoLockDelay !== AUTO_LOCK_DELAYS.NEVER && timeSinceLastActive > currentAutoLockDelay) {
            setIsLocked(true);
          }
        }
      } catch (error) {
        console.error('Error initializing security:', error);
      }
    };

    initializeSecurity();
  }, []);

  // Handle app state changes for auto-lock
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground
        const now = Date.now();
        if (isSecurityEnabled && autoLockDelay !== AUTO_LOCK_DELAYS.NEVER) {
          const timeSinceLastActive = now - lastActiveTime;
          if (timeSinceLastActive > autoLockDelay) {
            setIsLocked(true);
          }
        }
        updateLastActiveTime();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App went to background
        updateLastActiveTime();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isSecurityEnabled, autoLockDelay, lastActiveTime]);

  const updateLastActiveTime = async () => {
    const now = Date.now();
    setLastActiveTime(now);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_TIME, now.toString());
    } catch (error) {
      console.error('Error updating last active time:', error);
    }
  };

  const checkPasskeySupport = async (): Promise<boolean> => {
    try {
      return Passkey.isSupported();
    } catch (error) {
      console.error('Error checking passkey support:', error);
      return false;
    }
  };

  const createPasskey = async (): Promise<string | null> => {
    try {
      const isSupported = checkPasskeySupport();
      if (!isSupported) {
        throw new Error('Passkeys are not supported on this device');
      }

      const challenge = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const credentialCreationOptions: PasskeyCreateRequest = {
        rp: {
          id: 'etherpesa.app',
          name: 'EtherPesa',
        },
        user: {
          id: Array.from(new TextEncoder().encode('etherpesa-user'))
            .map(b => b.toString(16).padStart(2, '0'))
            .join(''),
          name: 'EtherPesa User',
          displayName: 'EtherPesa User',
        },
        challenge,
        pubKeyCredParams: [
          {
            type: 'public-key',
            alg: -7, // ES256
          },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
        attestation: 'none',
      };

      const credential = await Passkey.create(credentialCreationOptions);
      
      if (credential && credential.id) {
        await AsyncStorage.setItem(STORAGE_KEYS.PASSKEY_CREDENTIAL_ID, credential.id);
        return credential.id;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating passkey:', error);
      throw error;
    }
  };

  const authenticateWithPasskey = async (): Promise<boolean> => {
    try {
      const credentialId = await AsyncStorage.getItem(STORAGE_KEYS.PASSKEY_CREDENTIAL_ID);
      if (!credentialId) {
        throw new Error('No passkey found. Please set up app protection first.');
      }

      const challenge = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const credentialRequestOptions: PasskeyGetRequest = {
        challenge,
        rpId: 'etherpesa.app',
        allowCredentials: [
          {
            type: 'public-key',
            id: credentialId,
          },
        ],
        userVerification: 'required',
        timeout: 60000,
      };

      const assertion = await Passkey.get(credentialRequestOptions);
      return assertion !== null;
    } catch (error) {
      console.error('Error authenticating with passkey:', error);
      return false;
    }
  };

  const unlockApp = async (): Promise<boolean> => {
    const startTime = Date.now();
    try {
      if (!isSecurityEnabled) {
        setIsLocked(false);
        return true;
      }

      if (isTemporarilyBlocked) {
        return false;
      }

      const success = await authenticateWithPasskey();
      const unlockTime = Date.now() - startTime;
      
      // Update metrics
      const newMetrics = {
        ...securityMetrics,
        totalUnlockAttempts: securityMetrics.totalUnlockAttempts + 1,
        lastUnlockTime: Date.now(),
        averageUnlockTime: (securityMetrics.averageUnlockTime + unlockTime) / 2,
      };
      
      if (success) {
        setIsLocked(false);
        setFailedAttempts(0);
        newMetrics.successfulUnlocks += 1;
        await updateLastActiveTime();
        await AsyncStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
      } else {
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);
        newMetrics.failedUnlocks += 1;
        
        await AsyncStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, newFailedAttempts.toString());
        
        if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
          const blockUntil = Date.now() + BLOCK_DURATION;
          setIsTemporarilyBlocked(true);
          setBlockTimeRemaining(BLOCK_DURATION);
          await AsyncStorage.setItem(STORAGE_KEYS.BLOCK_UNTIL, blockUntil.toString());
          
          // Start countdown timer
          const interval = setInterval(() => {
            setBlockTimeRemaining(prev => {
              if (prev <= 1000) {
                setIsTemporarilyBlocked(false);
                setFailedAttempts(0);
                clearInterval(interval);
                AsyncStorage.removeItem(STORAGE_KEYS.BLOCK_UNTIL);
                AsyncStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
                return 0;
              }
              return prev - 1000;
            });
          }, 1000);
        }
      }
      
      setSecurityMetrics(newMetrics);
      await AsyncStorage.setItem(STORAGE_KEYS.SECURITY_METRICS, JSON.stringify(newMetrics));
      return success;
    } catch (error) {
      console.error('Error unlocking app:', error);
      return false;
    }
  };

  const lockApp = () => {
    if (isSecurityEnabled) {
      setIsLocked(true);
    }
  };

  const enableSecurity = async (): Promise<boolean> => {
    try {
      const isSupported = checkPasskeySupport();
      if (!isSupported) {
        throw new Error('Passkeys are not supported on this device');
      }

      const credentialId = await createPasskey();
      if (credentialId) {
        await AsyncStorage.setItem(STORAGE_KEYS.SECURITY_ENABLED, 'true');
        setIsSecurityEnabled(true);
        await updateLastActiveTime();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error enabling security:', error);
      throw error;
    }
  };

  const enableEnhancedSecurity = async (): Promise<boolean> => {
    try {
      const success = await enableSecurity();
      if (success) {
        // Set enhanced security level
        const enhancedMetrics = {
          ...securityMetrics,
          securityLevel: 'MAXIMUM' as const,
        };
        setSecurityMetrics(enhancedMetrics);
        await AsyncStorage.setItem(STORAGE_KEYS.SECURITY_METRICS, JSON.stringify(enhancedMetrics));
        
        // Set stricter auto-lock
        await setAutoLockDelay(AUTO_LOCK_DELAYS.ONE_MINUTE);
      }
      return success;
    } catch (error) {
      console.error('Error enabling enhanced security:', error);
      throw error;
    }
  };

  const resetFailedAttempts = () => {
    setFailedAttempts(0);
    setIsTemporarilyBlocked(false);
    setBlockTimeRemaining(0);
    AsyncStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
    AsyncStorage.removeItem(STORAGE_KEYS.BLOCK_UNTIL);
  };

  const getSecurityMetrics = (): SecurityMetrics => {
    return securityMetrics;
  };

  const disableSecurity = async (): Promise<boolean> => {
    try {
      // First authenticate to disable security
      const authenticated = await authenticateWithPasskey();
      if (!authenticated) {
        return false;
      }

      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.SECURITY_ENABLED),
        AsyncStorage.removeItem(STORAGE_KEYS.PASSKEY_CREDENTIAL_ID),
      ]);
      
      setIsSecurityEnabled(false);
      setIsLocked(false);
      return true;
    } catch (error) {
      console.error('Error disabling security:', error);
      return false;
    }
  };

  const setAutoLockDelay = async (delay: number): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTO_LOCK_DELAY, delay.toString());
      setAutoLockDelayState(delay);
    } catch (error) {
      console.error('Error setting auto-lock delay:', error);
      throw error;
    }
  };

  const requireAuth = async (): Promise<boolean> => {
    if (!isSecurityEnabled) {
      return true;
    }

    if (isLocked) {
      return false;
    }

    try {
      return await authenticateWithPasskey();
    } catch (error) {
      console.error('Error requiring auth:', error);
      return false;
    }
  };

  const contextValue: SecurityContextType = {
    isLocked,
    isSecurityEnabled,
    autoLockDelay,
    lastActiveTime,
    unlockApp,
    lockApp,
    enableSecurity,
    disableSecurity,
    setAutoLockDelay,
    requireAuth,
    checkPasskeySupport,
    // Enhanced security features
    failedAttempts,
    isTemporarilyBlocked,
    blockTimeRemaining,
    enableEnhancedSecurity,
    resetFailedAttempts,
    getSecurityMetrics,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

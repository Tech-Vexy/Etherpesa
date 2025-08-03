import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useSecurity } from '@/contexts/SecurityContext';

interface WithAuthProtectionProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  onAuthRequired?: () => void;
  onAuthSuccess?: () => void;
  onAuthFailure?: () => void;
}

export function WithAuthProtection({
  children,
  requireAuth = true,
  onAuthRequired,
  onAuthSuccess,
  onAuthFailure,
}: WithAuthProtectionProps) {
  const { isSecurityEnabled, requireAuth: authenticate } = useSecurity();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleRequireAuth = async (): Promise<boolean> => {
    if (!requireAuth || !isSecurityEnabled) {
      return true;
    }

    if (isAuthenticating) {
      return false;
    }

    setIsAuthenticating(true);
    onAuthRequired?.();

    try {
      const success = await authenticate();
      if (success) {
        onAuthSuccess?.();
        return true;
      } else {
        onAuthFailure?.();
        Alert.alert(
          'Authentication Required',
          'Please authenticate to access this feature.'
        );
        return false;
      }
    } catch (error: any) {
      onAuthFailure?.();
      Alert.alert(
        'Authentication Error',
        error.message || 'Authentication failed. Please try again.'
      );
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Enhanced children with auth protection
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // If it's a button or touchable component, wrap the onPress
      const childProps = child.props as any;
      if (childProps.onPress) {
        const originalOnPress = childProps.onPress;
        return React.cloneElement(child as React.ReactElement<any>, {
          onPress: async (...args: any[]) => {
            const authSuccess = await handleRequireAuth();
            if (authSuccess) {
              originalOnPress(...args);
            }
          },
          disabled: childProps.disabled || isAuthenticating,
        } as any);
      }
    }
    return child;
  });

  return <>{enhancedChildren}</>;
}

// Hook for manual auth requirement
export function useAuthProtection() {
  const { isSecurityEnabled, requireAuth } = useSecurity();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const withAuth = async (callback: () => void | Promise<void>): Promise<void> => {
    if (!isSecurityEnabled) {
      await callback();
      return;
    }

    if (isAuthenticating) {
      return;
    }

    setIsAuthenticating(true);
    try {
      const success = await requireAuth();
      if (success) {
        await callback();
      } else {
        Alert.alert(
          'Authentication Required',
          'Please authenticate to perform this action.'
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Authentication Error',
        error.message || 'Authentication failed. Please try again.'
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  return {
    withAuth,
    isAuthenticating,
    isSecurityEnabled,
  };
}

import { useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useRouter, usePathname } from 'expo-router';

/**
 * AutoNavigateOnConnect - Automatically navigates to home page when wallet is connected
 * This component should be placed at the root level to handle global navigation
 */
export function AutoNavigateOnConnect() {
  const account = useActiveAccount();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only navigate if user just connected (has account) and is on index page
    if (account && pathname === '/') {
      // Add a small delay to ensure the connection is fully established
      setTimeout(() => {
        router.replace('/home');
      }, 100);
    }
  }, [account, pathname, router]);

  return null; // This component doesn't render anything
}

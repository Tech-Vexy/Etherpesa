/**
 * Thirdweb Transaction Tracking Utilities
 * 
 * This file contains utilities for enhanced transaction tracking
 * and analytics via the thirdweb dashboard.
 */

export interface TransactionMetadata {
  name: string;
  description: string;
  app: string;
  version: string;
  category?: 'transfer' | 'withdrawal' | 'kyc' | 'agent' | 'deposit';
  userAgent?: string;
  timestamp?: string;
}

/**
 * Create standardized transaction metadata for thirdweb tracking
 */
export function createTransactionMetadata(
  name: string,
  description: string,
  category?: TransactionMetadata['category']
): TransactionMetadata {
  return {
    name,
    description,
    app: "EtherPesa",
    version: "1.0.0",
    category,
    timestamp: new Date().toISOString(),
    userAgent: 'EtherPesa Mobile App'
  };
}

/**
 * Format transaction success message with tracking info
 */
export function formatSuccessMessage(
  action: string,
  amount?: string,
  transactionHash?: string,
  additionalInfo?: string
): string {
  let message = `${action} completed successfully! 🎉\n\n`;
  
  if (amount) {
    message += `💰 Amount: ${amount} USDC\n`;
  }
  
  if (transactionHash) {
    message += `📊 Transaction ID: ${transactionHash}\n`;
  }
  
  if (additionalInfo) {
    message += `${additionalInfo}\n`;
  }
  
  message += `\n✅ This transaction is tracked in your thirdweb dashboard with detailed analytics and insights.`;
  
  return message;
}

/**
 * Format transaction error message
 */
export function formatErrorMessage(action: string, error?: string): string {
  return `${action} failed. ${error || 'Please try again.'}\n\nIf the problem persists, check your connection and try again.`;
}

/**
 * Transaction analytics categories for dashboard filtering
 */
export const TRANSACTION_CATEGORIES = {
  TRANSFER: 'transfer',
  WITHDRAWAL: 'withdrawal', 
  DEPOSIT: 'deposit',
  KYC: 'kyc',
  AGENT: 'agent'
} as const;

/**
 * Get thirdweb dashboard URL for transaction viewing
 */
export function getDashboardUrl(clientId: string): string {
  return `https://thirdweb.com/dashboard/${clientId}/analytics`;
}

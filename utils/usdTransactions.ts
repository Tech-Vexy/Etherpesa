/**
 * USD Transaction Utilities with Account Abstraction
 * 
 * This module provides utilities for handling USD-based transactions
 * using Thirdweb's Account Abstraction and Transaction API
 */

import { 
  sendTransaction, 
  prepareContractCall,
  readContract
} from "thirdweb";
import { client, etherlink, TX_MANAGER_CONTRACT_ADDRESS, WALLET_CONTRACT_ADDRESS } from "@/constants/thirdweb";
import { Account } from "thirdweb/wallets";
import { convertToUSD, fetchCryptoPrices, formatUSDValue } from "./priceConversion";

export interface USDTransactionParams {
  sender: Account;
  recipient: string;
  amountUSD: number; // Amount in USD
  description?: string;
}

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  gasCost?: string;
  actualAmountUSD?: number;
}

/**
 * Convert USD amount to contract format (6 decimals)
 */
export function usdToContractAmount(usdAmount: number): bigint {
  return BigInt(Math.floor(usdAmount * 1_000_000)); // 6 decimals for USD
}

/**
 * Convert contract amount to USD (from 6 decimals)
 */
export function contractAmountToUSD(contractAmount: bigint): number {
  return Number(contractAmount) / 1_000_000;
}

/**
 * Get user's USD balance from the wallet contract
 */
export async function getUserUSDBalance(userAddress: string): Promise<number> {
  try {
    if (!WALLET_CONTRACT_ADDRESS) {
      throw new Error("Wallet contract address not configured");
    }

    const balance = await readContract({
      contract: {
        client,
        chain: etherlink,
        address: WALLET_CONTRACT_ADDRESS as `0x${string}`,
      },
      method: "function getBalance(address user) view returns (uint256)",
      params: [userAddress],
    });

    return contractAmountToUSD(balance);
  } catch (error) {
    console.error("Error fetching USD balance:", error);
    return 0;
  }
}

/**
 * Execute a USD-based P2P transfer using Account Abstraction
 */
export async function executeUSDTransfer(params: USDTransactionParams): Promise<TransactionResult> {
  const { sender, recipient, amountUSD, description } = params;

  try {
    // Validate inputs
    if (!recipient || !amountUSD || amountUSD <= 0) {
      throw new Error("Invalid recipient or amount");
    }

    if (!TX_MANAGER_CONTRACT_ADDRESS) {
      throw new Error("Transaction manager contract not configured");
    }

    // Check sender balance
    const senderBalance = await getUserUSDBalance(sender.address);
    if (senderBalance < amountUSD) {
      throw new Error(`Insufficient balance. You have $${formatUSDValue(senderBalance)} but need $${formatUSDValue(amountUSD)}`);
    }

    // Convert USD to contract amount
    const contractAmount = usdToContractAmount(amountUSD);

    // Prepare the transaction
    const transaction = prepareContractCall({
      contract: {
        client,
        chain: etherlink,
        address: TX_MANAGER_CONTRACT_ADDRESS as `0x${string}`,
      },
      method: "function executeP2PTransfer(address recipient, uint256 amount)",
      params: [recipient, contractAmount],
    });

    // Send transaction with Account Abstraction
    const result = await sendTransaction({
      transaction,
      account: sender,
    });

    return {
      success: true,
      transactionHash: result.transactionHash,
      actualAmountUSD: amountUSD,
      gasCost: "0", // Gasless with Account Abstraction
    };

  } catch (error: any) {
    console.error("USD Transfer error:", error);
    
    return {
      success: false,
      error: error.message || "Transfer failed",
    };
  }
}

/**
 * Execute a deposit transaction (for demo purposes)
 */
export async function executeUSDDeposit(account: Account, amountUSD: number): Promise<TransactionResult> {
  try {
    if (!WALLET_CONTRACT_ADDRESS) {
      throw new Error("Wallet contract address not configured");
    }

    const contractAmount = usdToContractAmount(amountUSD);

    const transaction = prepareContractCall({
      contract: {
        client,
        chain: etherlink,
        address: WALLET_CONTRACT_ADDRESS as `0x${string}`,
      },
      method: "function deposit(uint256 amount)",
      params: [contractAmount],
    });

    const result = await sendTransaction({
      transaction,
      account,
    });

    return {
      success: true,
      transactionHash: result.transactionHash,
      actualAmountUSD: amountUSD,
      gasCost: "0",
    };

  } catch (error: any) {
    console.error("USD Deposit error:", error);
    
    return {
      success: false,
      error: error.message || "Deposit failed",
    };
  }
}

/**
 * Execute a withdrawal transaction
 */
export async function executeUSDWithdrawal(account: Account, amountUSD: number): Promise<TransactionResult> {
  try {
    if (!WALLET_CONTRACT_ADDRESS) {
      throw new Error("Wallet contract address not configured");
    }

    const contractAmount = usdToContractAmount(amountUSD);

    const transaction = prepareContractCall({
      contract: {
        client,
        chain: etherlink,
        address: WALLET_CONTRACT_ADDRESS as `0x${string}`,
      },
      method: "function withdraw(uint256 amount)",
      params: [contractAmount],
    });

    const result = await sendTransaction({
      transaction,
      account,
    });

    return {
      success: true,
      transactionHash: result.transactionHash,
      actualAmountUSD: amountUSD,
      gasCost: "0",
    };

  } catch (error: any) {
    console.error("USD Withdrawal error:", error);
    
    return {
      success: false,
      error: error.message || "Withdrawal failed",
    };
  }
}

/**
 * Get transaction history for a user
 */
export async function getUserTransactionHistory(userAddress: string): Promise<any[]> {
  try {
    if (!TX_MANAGER_CONTRACT_ADDRESS) {
      throw new Error("Transaction manager contract not configured");
    }

    const txIds = await readContract({
      contract: {
        client,
        chain: etherlink,
        address: TX_MANAGER_CONTRACT_ADDRESS as `0x${string}`,
      },
      method: "function getUserTransactions(address user) view returns (uint256[])",
      params: [userAddress],
    });

    // Fetch details for each transaction
    const transactions = await Promise.all(
      txIds.map(async (txId: bigint) => {
        const tx = await readContract({
          contract: {
            client,
            chain: etherlink,
            address: TX_MANAGER_CONTRACT_ADDRESS as `0x${string}`,
          },
          method: "function getTransaction(uint256 txId) view returns ((address,address,uint256,string,uint256))",
          params: [txId],
        });

        return {
          id: Number(txId),
          sender: tx[0],
          recipient: tx[1],
          amount: contractAmountToUSD(tx[2]),
          type: tx[3],
          timestamp: Number(tx[4]),
        };
      })
    );

    return transactions.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return [];
  }
}

/**
 * Estimate transaction cost (returns 0 for gasless transactions)
 */
export async function estimateTransactionCost(): Promise<{
  gasCostUSD: number;
  gasless: boolean;
}> {
  return {
    gasCostUSD: 0,
    gasless: true, // Account Abstraction provides gasless transactions
  };
}

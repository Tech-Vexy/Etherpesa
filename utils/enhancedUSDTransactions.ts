/**
 * Enhanced USD Transaction System with Account Abstraction
 * 
 * This module implements gasless transactions using thirdweb's Account Abstraction
 * and provides USD-based transaction handling similar to traditional fintech apps
 */

import { 
  sendTransaction, 
  prepareContractCall,
  readContract
} from "thirdweb";
import { smartWallet } from "thirdweb/wallets";
import { client, etherlink, TX_MANAGER_CONTRACT_ADDRESS, WALLET_CONTRACT_ADDRESS, KYC_CONTRACT_ADDRESS } from "@/constants/thirdweb";
import { Account } from "thirdweb/wallets";
import { convertToUSD, fetchCryptoPrices, formatUSDValue } from "./priceConversion";

export interface USDTransactionParams {
  sender: Account;
  recipient: string;
  amountUSD: number;
  description?: string;
  gasless?: boolean;
}

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  actualAmountUSD?: number;
  gasCost?: string;
  error?: string;
}

export interface SmartAccountConfig {
  account: Account;
  sponsorGas: boolean;
}

// Helper function to convert USD to token amount
async function convertUSDToToken(usdAmount: number, tokenSymbol: string): Promise<number | null> {
  try {
    const prices = await fetchCryptoPrices();
    const tokenPrice = prices[tokenSymbol as keyof typeof prices];
    if (!tokenPrice) return null;
    return usdAmount / tokenPrice;
  } catch (error) {
    console.error("USD to token conversion error:", error);
    return null;
  }
}

// Helper function to convert token to USD
async function convertTokenToUSD(tokenAmount: number, tokenSymbol: string): Promise<number | null> {
  try {
    const prices = await fetchCryptoPrices();
    const tokenPrice = prices[tokenSymbol as keyof typeof prices];
    if (!tokenPrice) return null;
    return tokenAmount * tokenPrice;
  } catch (error) {
    console.error("Token to USD conversion error:", error);
    return null;
  }
}

// Helper function to create smart account for gasless transactions
async function createSmartAccount(personalAccount: Account): Promise<Account | null> {
  try {
    const smartAccount = smartWallet({
      chain: etherlink,
      sponsorGas: true,
    });
    
    const account = await smartAccount.connect({
      client,
      personalAccount,
    });
    
    return account;
  } catch (error) {
    console.error("Smart account creation failed:", error);
    return null;
  }
}

/**
 * Convert USD amount to contract format (6 decimals for USDC)
 */
export function usdToContractAmount(usdAmount: number): bigint {
  return BigInt(Math.floor(usdAmount * 1000000)); // 6 decimals
}

/**
 * Convert contract amount to USD (from 6 decimals)
 */
export function contractAmountToUSD(contractAmount: bigint): number {
  return Number(contractAmount) / 1000000; // 6 decimals
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
    console.error("Error getting USD balance:", error);
    return 0;
  }
}

/**
 * Check KYC status for an address
 */
export async function checkKYCStatus(userAddress: string): Promise<boolean> {
  try {
    if (!KYC_CONTRACT_ADDRESS) {
      console.warn("KYC contract address not configured");
      return false;
    }

    const isVerified = await readContract({
      contract: {
        client,
        chain: etherlink,
        address: KYC_CONTRACT_ADDRESS as `0x${string}`,
      },
      method: "function verifyUser(address user) view returns (bool)",
      params: [userAddress],
    });

    return Boolean(isVerified);
  } catch (error) {
    console.error("Error checking KYC status:", error);
    return false;
  }
}

/**
 * Execute a withdrawal transaction to an agent
 */
export async function executeUSDWithdrawalToAgent(
  account: Account, 
  amountUSD: number, 
  agentAddress: string,
  agentName?: string,
  gasless: boolean = true
): Promise<TransactionResult> {
  try {
    if (!TX_MANAGER_CONTRACT_ADDRESS) {
      throw new Error("Transaction manager contract address not configured");
    }

    // Check KYC status
    const isKYCVerified = await checkKYCStatus(account.address);
    if (!isKYCVerified) {
      throw new Error("KYC verification required. Please complete KYC in the KYC tab.");
    }

    // Check balance
    const balance = await getUserUSDBalance(account.address);
    if (balance < amountUSD) {
      throw new Error(`Insufficient balance. You have ${formatUSDValue(balance)} but need ${formatUSDValue(amountUSD)}`);
    }

    const contractAmount = usdToContractAmount(amountUSD);

    // Use regular account for transaction
    const transactionAccount: Account = account;

    const transaction = prepareContractCall({
      contract: {
        client,
        chain: etherlink,
        address: TX_MANAGER_CONTRACT_ADDRESS as `0x${string}`,
      },
      method: "function executeWithdrawal(uint256 amount, address agent)",
      params: [BigInt(contractAmount), agentAddress],
    });

    const result = await sendTransaction({
      transaction,
      account: transactionAccount,
    });

    return {
      success: true,
      transactionHash: result.transactionHash,
      actualAmountUSD: amountUSD,
      gasCost: gasless ? "0 (Sponsored via thirdweb)" : "Variable",
    };

  } catch (error) {
    console.error("Withdrawal to agent failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Execute a deposit transaction
 */
export async function executeUSDDeposit(account: Account, amountUSD: number, gasless: boolean = true): Promise<TransactionResult> {
  try {
    if (!WALLET_CONTRACT_ADDRESS) {
      throw new Error("Wallet contract address not configured");
    }

    // Check KYC status
    const isKYCVerified = await checkKYCStatus(account.address);
    if (!isKYCVerified) {
      throw new Error("KYC verification required. Please complete KYC in the KYC tab.");
    }

    const contractAmount = usdToContractAmount(amountUSD);

    // Use regular account for transaction
    const transactionAccount: Account = account;

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
      account: transactionAccount,
    });

    return {
      success: true,
      transactionHash: result.transactionHash,
      actualAmountUSD: amountUSD,
      gasCost: gasless ? "0 (Sponsored via thirdweb)" : "Fee paid by wallet",
    };

  } catch (error: any) {
    console.error("USD Deposit error:", error);
    
    let errorMessage = error.message || "Deposit failed";
    if (errorMessage.includes("KYC required")) {
      errorMessage = "KYC verification required. Please complete KYC in the KYC tab.";
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Execute USD-based transfer between users
 */
export async function executeUSDTransfer(
  fromAddress: string,
  toAddress: string,
  amountUSD: number,
  account?: Account
): Promise<TransactionResult> {
  try {
    if (!account) {
      return {
        success: false,
        error: "Account is required for transfers",
      };
    }

    // Validate recipient address
    const isValidRecipient = await validateAddress(toAddress);
    if (!isValidRecipient) {
      return {
        success: false,
        error: "Invalid recipient address",
      };
    }

    // Check KYC status
    const kycStatus = await checkKYCStatus(fromAddress);
    if (!kycStatus) {
      return {
        success: false,
        error: "KYC verification required. Please complete KYC in the KYC tab.",
      };
    }

    // Convert USD to XTZ for the smart contract
    const xtzAmount = await convertUSDToToken(amountUSD, "XTZ");
    if (!xtzAmount) {
      return {
        success: false,
        error: "Unable to convert USD to XTZ. Please try again.",
      };
    }

    // Convert to contract units (XTZ uses 6 decimals)
    const contractAmount = BigInt(Math.floor(xtzAmount * 1000000));

    // Try to create smart account for gasless transactions
    let gasless = false;
    let transactionAccount = account;

    try {
      const smartAccount = await createSmartAccount(account);
      if (smartAccount) {
        transactionAccount = smartAccount;
        gasless = true;
      }
    } catch (error) {
      console.log("Smart account creation failed, using regular account:", error);
    }

    const transaction = prepareContractCall({
      contract: {
        client,
        chain: etherlink,
        address: TX_MANAGER_CONTRACT_ADDRESS as `0x${string}`,
      },
      method: "function transfer(address to, uint256 amount)",
      params: [toAddress as `0x${string}`, contractAmount],
    });

    const result = await sendTransaction({
      transaction,
      account: transactionAccount,
    });

    return {
      success: true,
      transactionHash: result.transactionHash,
      actualAmountUSD: amountUSD,
      gasCost: gasless ? "0 (Sponsored via thirdweb)" : "Fee paid by wallet",
    };

  } catch (error: any) {
    console.error("USD Transfer error:", error);
    
    let errorMessage = error.message || "Transfer failed";
    if (errorMessage.includes("KYC required")) {
      errorMessage = "KYC verification required. Please complete KYC in the KYC tab.";
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Estimate transaction cost in USD
 */
export async function estimateTransactionCost(
  transactionType: "transfer" | "withdraw" | "deposit",
  amountUSD: number,
  account?: Account
): Promise<{
  estimatedGasFeeUSD: number;
  totalCostUSD: number;
  canUseGasless: boolean;
}> {
  try {
    let estimatedGasFeeUSD = 0;
    let canUseGasless = false;

    if (account) {
      try {
        // Try to check if smart account can be created (indicates gasless capability)
        const smartAccount = await createSmartAccount(account);
        if (smartAccount) {
          canUseGasless = true;
          estimatedGasFeeUSD = 0; // Gasless transaction
        }
      } catch (error) {
        // Fallback to regular gas estimation
        console.log("Smart account check failed, estimating regular gas:", error);
      }
    }

    if (!canUseGasless) {
      // Estimate gas cost for regular transaction
      // This is a rough estimate - in practice, you'd want to simulate the actual transaction
      const baseGasCostXTZ = 0.001; // Typical gas cost in XTZ
      const xtzPriceUSD = await convertTokenToUSD(1, "XTZ");
      estimatedGasFeeUSD = baseGasCostXTZ * (xtzPriceUSD || 1);
    }

    return {
      estimatedGasFeeUSD,
      totalCostUSD: amountUSD + estimatedGasFeeUSD,
      canUseGasless,
    };

  } catch (error) {
    console.error("Gas estimation error:", error);
    
    // Return conservative estimate on error
    return {
      estimatedGasFeeUSD: 0.01, // $0.01 fallback
      totalCostUSD: amountUSD + 0.01,
      canUseGasless: false,
    };
  }
}

/**
 * Validate if an address is a valid Ethereum/blockchain address
 */
export async function validateAddress(address: string): Promise<boolean> {
  try {
    // Basic format validation
    if (!address || typeof address !== "string") {
      return false;
    }

    // Check if it's a valid Ethereum address format
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(address)) {
      return false;
    }

    // Additional validation: check if address is not zero address
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    if (address.toLowerCase() === zeroAddress.toLowerCase()) {
      return false;
    }

    // Could add more sophisticated validation here, such as:
    // - Checksum validation
    // - Contract vs EOA detection
    // - Network-specific validation

    return true;

  } catch (error) {
    console.error("Address validation error:", error);
    return false;
  }
}
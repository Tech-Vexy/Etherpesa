import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { smartWallet, inAppWallet } from "thirdweb/wallets";

const clientId = process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID!;

if (!clientId) {
	throw new Error(
		"Missing EXPO_PUBLIC_THIRDWEB_CLIENT_ID - make sure to set it in your .env file",
	);
}

export const client = createThirdwebClient({
	clientId,
	// Enable transaction tracking and analytics via thirdweb dashboard
	secretKey: process.env.THIRDWEB_SECRET_KEY, // Optional: for server-side operations
});

// Etherlink testnet configuration
export const etherlink = defineChain({
	id: 128123,
	name: "Etherlink Testnet",
	nativeCurrency: {
		name: "XTZ",
		symbol: "XTZ",
		decimals: 18,
	},
	rpc: "https://node.ghostnet.etherlink.com",
	blockExplorers: [
		{
			name: "Etherlink Explorer",
			url: "https://testnet-explorer.etherlink.com",
		},
	],
});

export const chain = etherlink;

// Smart Wallet configuration for Account Abstraction
export const smartWalletConfig = smartWallet({
	chain: etherlink,
	factoryAddress: "0x4651fF0d8E8b5f7fcB55B3Ff8FF1ce4d5fd5a6B1", // Thirdweb's factory address
	gasless: true, // Enable gasless transactions
});

// Contract addresses (update after deployment)
export const KYC_CONTRACT_ADDRESS = process.env.EXPO_PUBLIC_KYC_CONTRACT || "";
export const WALLET_CONTRACT_ADDRESS = process.env.EXPO_PUBLIC_WALLET_CONTRACT || "";
export const AGENT_CONTRACT_ADDRESS = process.env.EXPO_PUBLIC_AGENT_CONTRACT || "";
export const TX_MANAGER_CONTRACT_ADDRESS = process.env.EXPO_PUBLIC_TX_MANAGER_CONTRACT || "";

// Helper function to safely create contract instances
function createContractSafely(address: string) {
	if (!address || address === "") {
		return null;
	}
	return getContract({
		client,
		address,
		chain: etherlink,
	});
}

// Contract instances (only created if address is valid)
export const kycContract = createContractSafely(KYC_CONTRACT_ADDRESS);
export const walletContract = createContractSafely(WALLET_CONTRACT_ADDRESS);
export const agentContract = createContractSafely(AGENT_CONTRACT_ADDRESS);
export const txManagerContract = createContractSafely(TX_MANAGER_CONTRACT_ADDRESS);

// Demo contracts for example screens (placeholder - replace with actual contract addresses if needed)
export const contract = createContractSafely("0x1234567890123456789012345678901234567890"); // Placeholder
export const usdcContract = createContractSafely("0x1234567890123456789012345678901234567890"); // Placeholder

const { ThirdwebSDK } = require("@thirdweb-dev/sdk");
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying EtherPesa contracts via Thirdweb...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy KYC Contract
  console.log("\n1. Deploying KYC Contract...");
  const KYCContract = await ethers.getContractFactory("KYCContract");
  const kycContract = await KYCContract.deploy();
  await kycContract.deployed();
  console.log("KYC Contract deployed to:", kycContract.address);

  // Deploy Wallet Contract
  console.log("\n2. Deploying Wallet Contract...");
  const WalletContract = await ethers.getContractFactory("WalletContract");
  const walletContract = await WalletContract.deploy(kycContract.address);
  await walletContract.deployed();
  console.log("Wallet Contract deployed to:", walletContract.address);

  // Deploy Agent Services Contract
  console.log("\n3. Deploying Agent Services Contract...");
  const AgentServicesContract = await ethers.getContractFactory("AgentServicesContract");
  const agentContract = await AgentServicesContract.deploy(
    walletContract.address,
    kycContract.address
  );
  await agentContract.deployed();
  console.log("Agent Services Contract deployed to:", agentContract.address);

  // Deploy Transaction Manager
  console.log("\n4. Deploying Transaction Manager...");
  const TransactionManager = await ethers.getContractFactory("TransactionManager");
  const txManager = await TransactionManager.deploy(
    walletContract.address,
    agentContract.address,
    kycContract.address
  );
  await txManager.deployed();
  console.log("Transaction Manager deployed to:", txManager.address);

  // Output for .env file
  console.log("\n=== UPDATE YOUR .ENV FILE ===");
  console.log(`EXPO_PUBLIC_KYC_CONTRACT=${kycContract.address}`);
  console.log(`EXPO_PUBLIC_WALLET_CONTRACT=${walletContract.address}`);
  console.log(`EXPO_PUBLIC_AGENT_CONTRACT=${agentContract.address}`);
  console.log(`EXPO_PUBLIC_TX_MANAGER_CONTRACT=${txManager.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
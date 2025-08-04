const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  console.log("Deploying EtherPesa contracts to Etherlink...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Get balance using provider
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy KYC Contract
  console.log("\n1. Deploying KYC Contract...");
  const KYCContract = await ethers.getContractFactory("KYCContract");
  const kycContract = await KYCContract.deploy();
  await kycContract.waitForDeployment();
  console.log("KYC Contract deployed to:", await kycContract.getAddress());

  // Deploy Wallet Contract
  console.log("\n2. Deploying Wallet Contract...");
  const WalletContract = await ethers.getContractFactory("WalletContract");
  const walletContract = await WalletContract.deploy(await kycContract.getAddress());
  await walletContract.waitForDeployment();
  console.log("Wallet Contract deployed to:", await walletContract.getAddress());

  // Deploy Agent Services Contract
  console.log("\n3. Deploying Agent Services Contract...");
  const AgentServicesContract = await ethers.getContractFactory("AgentServicesContract");
  const agentContract = await AgentServicesContract.deploy(
    await walletContract.getAddress(),
    await kycContract.getAddress()
  );
  await agentContract.waitForDeployment();
  console.log("Agent Services Contract deployed to:", await agentContract.getAddress());

  // Deploy Transaction Manager
  console.log("\n4. Deploying Transaction Manager...");
  const TransactionManager = await ethers.getContractFactory("TransactionManager");
  const txManager = await TransactionManager.deploy(
    await walletContract.getAddress(),
    await agentContract.getAddress(),
    await kycContract.getAddress()
  );
  await txManager.waitForDeployment();
  console.log("Transaction Manager deployed to:", await txManager.getAddress());

  // Set Transaction Manager in Wallet Contract
  console.log("\n5. Setting Transaction Manager in Wallet Contract...");
  const setTxManagerTx = await walletContract.setTxManager(await txManager.getAddress());
  await setTxManagerTx.wait();
  console.log("Transaction Manager set in Wallet Contract");

  // Save deployment addresses
  const deploymentInfo = {
    network: "etherlink",
    chainId: 128123,
    contracts: {
      KYCContract: await kycContract.getAddress(),
      WalletContract: await walletContract.getAddress(),
      AgentServicesContract: await agentContract.getAddress(),
      TransactionManager: await txManager.getAddress(),
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Output for .env file
  console.log("\n=== UPDATE YOUR .ENV FILE ===");
  console.log(`EXPO_PUBLIC_KYC_CONTRACT=${await kycContract.getAddress()}`);
  console.log(`EXPO_PUBLIC_WALLET_CONTRACT=${await walletContract.getAddress()}`);
  console.log(`EXPO_PUBLIC_AGENT_CONTRACT=${await agentContract.getAddress()}`);
  console.log(`EXPO_PUBLIC_TX_MANAGER_CONTRACT=${await txManager.getAddress()}`);

  // Verify contracts (optional)
  if (process.env.VERIFY_CONTRACTS === "true") {
    console.log("\nVerifying contracts...");
    try {
      await hre.run("verify:verify", {
        address: await kycContract.getAddress(),
        constructorArguments: [],
      });
      
      await hre.run("verify:verify", {
        address: await walletContract.getAddress(),
        constructorArguments: [await kycContract.getAddress()],
      });
      
      await hre.run("verify:verify", {
        address: await agentContract.getAddress(),
        constructorArguments: [await walletContract.getAddress(), await kycContract.getAddress()],
      });
      
      await hre.run("verify:verify", {
        address: await txManager.getAddress(),
        constructorArguments: [await walletContract.getAddress(), await agentContract.getAddress(), await kycContract.getAddress()],
      });
      
      console.log("All contracts verified!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
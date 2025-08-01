const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying EtherPesa contracts to Etherlink...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

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

  // Save deployment addresses
  const deploymentInfo = {
    network: "etherlink",
    chainId: 128123,
    contracts: {
      KYCContract: kycContract.address,
      WalletContract: walletContract.address,
      AgentServicesContract: agentContract.address,
      TransactionManager: txManager.address,
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Verify contracts (optional)
  if (process.env.VERIFY_CONTRACTS === "true") {
    console.log("\nVerifying contracts...");
    try {
      await hre.run("verify:verify", {
        address: kycContract.address,
        constructorArguments: [],
      });
      
      await hre.run("verify:verify", {
        address: walletContract.address,
        constructorArguments: [kycContract.address],
      });
      
      await hre.run("verify:verify", {
        address: agentContract.address,
        constructorArguments: [walletContract.address, kycContract.address],
      });
      
      await hre.run("verify:verify", {
        address: txManager.address,
        constructorArguments: [walletContract.address, agentContract.address, kycContract.address],
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
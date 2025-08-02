const { ethers } = require("hardhat");

async function main() {
  console.log("Registering demo agents...");

  // Get deployer account (should be contract owner)
  const [deployer] = await ethers.getSigners();
  console.log("Registering with account:", deployer.address);

  // Get the deployed agent contract (update with actual address)
  const agentContractAddress = process.env.EXPO_PUBLIC_AGENT_CONTRACT || "YOUR_AGENT_CONTRACT_ADDRESS";
  
  if (!agentContractAddress || agentContractAddress === "YOUR_AGENT_CONTRACT_ADDRESS") {
    console.error("Please set EXPO_PUBLIC_AGENT_CONTRACT in your .env file");
    process.exit(1);
  }

  const AgentServicesContract = await ethers.getContractFactory("AgentServicesContract");
  const agentContract = AgentServicesContract.attach(agentContractAddress);

  // Demo agent addresses to register
  const demoAgents = [
    '0x742d35Cc8Cd4c6478F3B0B5d6d51a66D26c2C7e6',
    '0x8ba1f109551bD432803012645Hac136c5E96bb1',
    '0x2dF1a3b5F8eF7d3B5e6c7d8F9eA1bC2d3e4F5a67',
    '0x9aB3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R9s0T1',
    '0x1a2B3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R9s0',
  ];

  console.log(`\nRegistering ${demoAgents.length} demo agents...`);

  for (let i = 0; i < demoAgents.length; i++) {
    const agentAddress = demoAgents[i];
    
    try {
      // Check if already registered
      const isRegistered = await agentContract.registeredAgents(agentAddress);
      
      if (isRegistered) {
        console.log(`${i + 1}. Agent ${agentAddress} is already registered`);
        continue;
      }

      // Register the agent
      console.log(`${i + 1}. Registering agent: ${agentAddress}`);
      const tx = await agentContract.registerAgent(agentAddress);
      await tx.wait();
      
      console.log(`   ✅ Agent registered! Transaction: ${tx.hash}`);
      
    } catch (error) {
      console.error(`   ❌ Failed to register agent ${agentAddress}:`, error.message);
    }
  }

  console.log("\n=== Registration Summary ===");
  console.log("Checking final registration status:");

  for (let i = 0; i < demoAgents.length; i++) {
    const agentAddress = demoAgents[i];
    try {
      const isRegistered = await agentContract.registeredAgents(agentAddress);
      console.log(`${i + 1}. ${agentAddress}: ${isRegistered ? '✅ Registered' : '❌ Not Registered'}`);
    } catch (error) {
      console.log(`${i + 1}. ${agentAddress}: ❌ Error checking status`);
    }
  }

  console.log("\nDemo agents registration completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

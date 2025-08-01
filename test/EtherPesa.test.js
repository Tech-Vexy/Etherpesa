const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EtherPesa P2P System", function () {
  let kycContract, walletContract, agentContract, txManager;
  let owner, user1, user2, agent;

  beforeEach(async function () {
    [owner, user1, user2, agent] = await ethers.getSigners();

    // Deploy contracts
    const KYCContract = await ethers.getContractFactory("KYCContract");
    kycContract = await KYCContract.deploy();

    const WalletContract = await ethers.getContractFactory("WalletContract");
    walletContract = await WalletContract.deploy(kycContract.address);

    const AgentServicesContract = await ethers.getContractFactory("AgentServicesContract");
    agentContract = await AgentServicesContract.deploy(
      walletContract.address,
      kycContract.address
    );

    const TransactionManager = await ethers.getContractFactory("TransactionManager");
    txManager = await TransactionManager.deploy(
      walletContract.address,
      agentContract.address,
      kycContract.address
    );
  });

  describe("KYC Contract", function () {
    it("Should submit and verify KYC", async function () {
      const kycHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("phone:+1234567890"));
      
      await kycContract.submitKYC(user1.address, kycHash);
      expect(await kycContract.verifyUser(user1.address)).to.be.true;
    });

    it("Should revoke KYC", async function () {
      const kycHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("phone:+1234567890"));
      
      await kycContract.submitKYC(user1.address, kycHash);
      await kycContract.revokeKYC(user1.address);
      expect(await kycContract.verifyUser(user1.address)).to.be.false;
    });
  });

  describe("Wallet Contract", function () {
    beforeEach(async function () {
      // KYC verify users
      const kycHash1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("phone:+1234567890"));
      const kycHash2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("phone:+0987654321"));
      
      await kycContract.submitKYC(user1.address, kycHash1);
      await kycContract.submitKYC(user2.address, kycHash2);
    });

    it("Should deposit funds", async function () {
      await walletContract.connect(user1).deposit(1000000); // 1 USDC
      expect(await walletContract.getBalance(user1.address)).to.equal(1000000);
    });

    it("Should transfer between users", async function () {
      await walletContract.connect(user1).deposit(1000000);
      await walletContract.connect(user1).transfer(user2.address, 500000);
      
      expect(await walletContract.getBalance(user1.address)).to.equal(500000);
      expect(await walletContract.getBalance(user2.address)).to.equal(500000);
    });

    it("Should fail transfer without KYC", async function () {
      const [, , , nonKycUser] = await ethers.getSigners();
      await walletContract.connect(user1).deposit(1000000);
      
      await expect(
        walletContract.connect(user1).transfer(nonKycUser.address, 500000)
      ).to.be.revertedWith("Recipient not KYC verified");
    });

    it("Should withdraw funds", async function () {
      await walletContract.connect(user1).deposit(1000000);
      await walletContract.connect(user1).withdraw(300000);
      
      expect(await walletContract.getBalance(user1.address)).to.equal(700000);
    });
  });

  describe("Agent Services", function () {
    beforeEach(async function () {
      const kycHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("phone:+1234567890"));
      await kycContract.submitKYC(user1.address, kycHash);
      await agentContract.registerAgent(agent.address);
    });

    it("Should register agent", async function () {
      expect(await agentContract.registeredAgents(agent.address)).to.be.true;
    });

    it("Should process agent top-up", async function () {
      await expect(agentContract.connect(agent).topUp(user1.address, 1000000))
        .to.emit(agentContract, "TopUp")
        .withArgs(agent.address, user1.address, 1000000);
    });
  });

  describe("Transaction Manager", function () {
    beforeEach(async function () {
      const kycHash1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("phone:+1234567890"));
      const kycHash2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("phone:+0987654321"));
      
      await kycContract.submitKYC(user1.address, kycHash1);
      await kycContract.submitKYC(user2.address, kycHash2);
      await agentContract.registerAgent(agent.address);
      
      // Fund user1
      await walletContract.connect(user1).deposit(1000000);
    });

    it("Should execute P2P transfer with logging", async function () {
      await expect(txManager.connect(user1).executeP2PTransfer(user2.address, 500000))
        .to.emit(txManager, "TransactionLogged");
      
      const userTxs = await txManager.getUserTransactions(user1.address);
      expect(userTxs.length).to.equal(1);
    });

    it("Should get transaction details", async function () {
      await txManager.connect(user1).executeP2PTransfer(user2.address, 500000);
      
      const tx = await txManager.getTransaction(0);
      expect(tx.sender).to.equal(user1.address);
      expect(tx.recipient).to.equal(user2.address);
      expect(tx.amount).to.equal(500000);
      expect(tx.transactionType).to.equal("P2P_TRANSFER");
    });
  });
});
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./WalletContract.sol";
import "./AgentServicesContract.sol";
import "./interfaces/IKYC.sol";

/**
 * @title TransactionManager
 * @dev Coordinates P2P transfers, withdrawals, and agent interactions
 */
contract TransactionManager {
    WalletContract public walletContract;
    AgentServicesContract public agentContract;
    IKYC public kycContract;
    
    struct Transaction {
        address sender;
        address recipient;
        uint256 amount;
        string transactionType;
        uint256 timestamp;
    }
    
    Transaction[] public transactions;
    mapping(address => uint256[]) public userTransactions;
    
    event TransactionLogged(
        uint256 indexed txId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        string transactionType
    );
    
    constructor(
        address _walletContract,
        address _agentContract,
        address _kycContract
    ) {
        walletContract = WalletContract(_walletContract);
        agentContract = AgentServicesContract(_agentContract);
        kycContract = IKYC(_kycContract);
    }
    
    /**
     * @dev Execute P2P transfer with logging
     * @param recipient Recipient address
     * @param amount Amount to transfer in USD (6 decimals)
     */
    function executeP2PTransfer(address recipient, uint256 amount) external {
        require(kycContract.verifyUser(msg.sender), "Sender not KYC verified");
        require(kycContract.verifyUser(recipient), "Recipient not KYC verified");
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        
        // Check sender has sufficient balance
        require(walletContract.getBalance(msg.sender) >= amount, "Insufficient balance");
        
        // Execute transfer through wallet contract using transferFrom
        walletContract.transferFrom(msg.sender, recipient, amount);
        
        // Log transaction
        logTransaction(msg.sender, recipient, amount, "P2P_TRANSFER");
    }
    
    /**
     * @dev Execute withdrawal through agent
     * @param amount Amount to withdraw
     * @param agent Agent address
     */
    function executeWithdrawal(uint256 amount, address agent) external {
        require(kycContract.verifyUser(msg.sender), "User not KYC verified");
        require(agentContract.registeredAgents(agent), "Invalid agent");
        
        // Process withdrawal through agent contract
        agentContract.processWithdrawal(msg.sender, amount);
        
        // Log transaction
        logTransaction(msg.sender, agent, amount, "WITHDRAWAL");
    }
    
    /**
     * @dev Log transaction details
     * @param sender Sender address
     * @param recipient Recipient address
     * @param amount Transaction amount
     * @param transactionType Type of transaction
     */
    function logTransaction(
        address sender,
        address recipient,
        uint256 amount,
        string memory transactionType
    ) public {
        uint256 txId = transactions.length;
        
        transactions.push(Transaction({
            sender: sender,
            recipient: recipient,
            amount: amount,
            transactionType: transactionType,
            timestamp: block.timestamp
        }));
        
        userTransactions[sender].push(txId);
        if (sender != recipient) {
            userTransactions[recipient].push(txId);
        }
        
        emit TransactionLogged(txId, sender, recipient, amount, transactionType);
    }
    
    /**
     * @dev Get user transaction history
     * @param user User address
     * @return uint256[] Array of transaction IDs
     */
    function getUserTransactions(address user) external view returns (uint256[] memory) {
        return userTransactions[user];
    }
    
    /**
     * @dev Get transaction details
     * @param txId Transaction ID
     * @return Transaction details
     */
    function getTransaction(uint256 txId) external view returns (Transaction memory) {
        require(txId < transactions.length, "Invalid transaction ID");
        return transactions[txId];
    }
}
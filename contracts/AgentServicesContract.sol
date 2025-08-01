// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./WalletContract.sol";
import "./interfaces/IKYC.sol";

/**
 * @title AgentServicesContract
 * @dev Manages agent roles for topping up accounts and processing withdrawals
 */
contract AgentServicesContract {
    address public owner;
    WalletContract public walletContract;
    IKYC public kycContract;
    
    mapping(address => bool) public registeredAgents;
    
    event AgentRegistered(address indexed agent);
    event TopUp(address indexed agent, address indexed user, uint256 amount);
    event WithdrawalProcessed(address indexed agent, address indexed user, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyAgent() {
        require(registeredAgents[msg.sender], "Only registered agents");
        _;
    }
    
    constructor(address _walletContract, address _kycContract) {
        owner = msg.sender;
        walletContract = WalletContract(_walletContract);
        kycContract = IKYC(_kycContract);
    }
    
    /**
     * @dev Register a new agent
     * @param agent Agent address to register
     */
    function registerAgent(address agent) external onlyOwner {
        require(agent != address(0), "Invalid agent address");
        require(!registeredAgents[agent], "Agent already registered");
        
        registeredAgents[agent] = true;
        emit AgentRegistered(agent);
    }
    
    /**
     * @dev Agent tops up user account via Transak
     * @param user User address to top up
     * @param amount Amount to deposit
     */
    function topUp(address user, uint256 amount) external onlyAgent {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Invalid amount");
        require(kycContract.verifyUser(user), "User not KYC verified");
        
        // Simulate deposit to wallet contract
        // In production, this would integrate with Transak
        walletContract.deposit(amount);
        
        emit TopUp(msg.sender, user, amount);
    }
    
    /**
     * @dev Agent processes withdrawal for user
     * @param user User address requesting withdrawal
     * @param amount Amount to withdraw
     */
    function processWithdrawal(address user, uint256 amount) external onlyAgent {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Invalid amount");
        require(kycContract.verifyUser(user), "User not KYC verified");
        require(walletContract.getBalance(user) >= amount, "Insufficient balance");
        
        // Process withdrawal through wallet contract
        walletContract.withdraw(amount);
        
        emit WithdrawalProcessed(msg.sender, user, amount);
    }
}
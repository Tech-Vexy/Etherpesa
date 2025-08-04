// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./interfaces/IKYC.sol";

/**
 * @title WalletContract
 * @dev Manages user accounts and USDC balances for P2P transactions on Etherlink
 */
contract WalletContract {
    IKYC public kycContract;
    address public txManager; // Transaction manager contract address
    
    // User balances in USDC (6 decimals)
    mapping(address => uint256) public balances;
    
    event Deposit(address indexed user, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
    modifier onlyKYC() {
        require(kycContract.verifyUser(msg.sender), "KYC required");
        _;
    }
    
    modifier onlyKYCOrTxManager(address user) {
        require(
            (msg.sender == user && kycContract.verifyUser(user)) || 
            msg.sender == txManager,
            "KYC required or unauthorized"
        );
        _;
    }
    
    constructor(address _kycContract) {
        kycContract = IKYC(_kycContract);
    }
    
    /**
     * @dev Set the transaction manager address (only once during deployment)
     * @param _txManager Transaction manager contract address
     */
    function setTxManager(address _txManager) external {
        require(txManager == address(0), "TxManager already set");
        require(_txManager != address(0), "Invalid address");
        txManager = _txManager;
    }
    
    /**
     * @dev Deposit USDC via Transak on-ramp
     * @param amount Amount in USDC (6 decimals)
     */
    function deposit(uint256 amount) external onlyKYC {
        require(amount > 0, "Invalid amount");
        
        balances[msg.sender] += amount;
        emit Deposit(msg.sender, amount);
    }
    
    /**
     * @dev P2P transfer between users (can be called by user or tx manager)
     * @param sender Sender address
     * @param recipient Recipient address  
     * @param amount Amount to transfer in USD (6 decimals)
     */
    function transferFrom(address sender, address recipient, uint256 amount) external onlyKYCOrTxManager(sender) {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(balances[sender] >= amount, "Insufficient balance");
        require(kycContract.verifyUser(sender), "Sender not KYC verified");
        require(kycContract.verifyUser(recipient), "Recipient not KYC verified");
        
        balances[sender] -= amount;
        balances[recipient] += amount;
        
        emit Transfer(sender, recipient, amount);
    }

    /**
     * @dev P2P transfer between users (direct user call)
     * @param recipient Recipient address
     * @param amount Amount to transfer in USD (6 decimals)
     */
    function transfer(address recipient, uint256 amount) external onlyKYC {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        require(kycContract.verifyUser(recipient), "Recipient not KYC verified");
        
        balances[msg.sender] -= amount;
        balances[recipient] += amount;
        
        emit Transfer(msg.sender, recipient, amount);
    }
    
    /**
     * @dev Withdraw USDC via Transak off-ramp
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external onlyKYC {
        require(amount > 0, "Invalid amount");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        emit Withdrawal(msg.sender, amount);
    }
    
    /**
     * @dev Get user balance
     * @param user User address
     * @return uint256 User balance
     */
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
}
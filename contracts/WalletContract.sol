// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./interfaces/IKYC.sol";

/**
 * @title WalletContract
 * @dev Manages user accounts and USDC balances for P2P transactions on Etherlink
 */
contract WalletContract {
    IKYC public kycContract;
    
    // User balances in USDC (6 decimals)
    mapping(address => uint256) public balances;
    
    event Deposit(address indexed user, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
    modifier onlyKYC() {
        require(kycContract.verifyUser(msg.sender), "KYC required");
        _;
    }
    
    constructor(address _kycContract) {
        kycContract = IKYC(_kycContract);
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
     * @dev P2P transfer between users
     * @param recipient Recipient address
     * @param amount Amount to transfer
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
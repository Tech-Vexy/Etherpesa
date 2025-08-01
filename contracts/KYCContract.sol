// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./interfaces/IKYC.sol";

/**
 * @title KYCContract
 * @dev Manages minimal KYC data on-chain for Etherlink P2P system
 */
contract KYCContract is IKYC {
    address public owner;
    
    // User address => KYC status
    mapping(address => bool) public kycVerified;
    // User address => KYC hash (phone/ID hash)
    mapping(address => bytes32) public kycHashes;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Submit KYC hash for a user
     * @param user User address
     * @param kycHash Hashed KYC data (phone number or ID)
     */
    function submitKYC(address user, bytes32 kycHash) external override {
        require(user != address(0), "Invalid address");
        require(kycHash != bytes32(0), "Invalid hash");
        
        kycHashes[user] = kycHash;
        kycVerified[user] = true;
        
        emit KYCSubmitted(user, kycHash);
        emit KYCVerified(user);
    }
    
    /**
     * @dev Check if user is KYC verified
     * @param user User address to check
     * @return bool KYC verification status
     */
    function verifyUser(address user) external view override returns (bool) {
        return kycVerified[user];
    }
    
    /**
     * @dev Revoke KYC status for a user
     * @param user User address
     */
    function revokeKYC(address user) external override onlyOwner {
        kycVerified[user] = false;
        emit KYCRevoked(user);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IKYC {
    event KYCSubmitted(address indexed user, bytes32 kycHash);
    event KYCVerified(address indexed user);
    event KYCRevoked(address indexed user);

    function submitKYC(address user, bytes32 kycHash) external;
    function verifyUser(address user) external view returns (bool);
    function revokeKYC(address user) external;
}
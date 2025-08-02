# EtherPesa - Decentralized P2P Transaction System

**Etherlink Hackathon 2025 - DeFi Track Submission**

A decentralized peer-to-peer transaction system built on Etherlink, an EVM-compatible Layer 2 blockchain with sub-500ms transaction confirmations and ultra-low fees. EtherPesa enables instant P2P transfers, agent-based withdrawals, and seamless fiat on/off-ramps through Transak integration.

## 🚀 Features

- **Instant P2P Transfers**: Send USDC between users with sub-500ms confirmations
- **Decentralized Agent Network**: Blockchain-based agent registration and management
- **Real Agent Withdrawals**: Cash withdrawals processed by verified registered agents
- **Minimal KYC**: On-chain KYC with hashed phone numbers for privacy
- **Fiat Integration**: Transak-powered on/off-ramps for seamless fiat conversion
- **Mobile-First**: React Native app optimized for low-end devices
- **Ultra-Low Fees**: Transactions cost fractions of a cent on Etherlink
- **M-Pesa Inspired**: Simple, accessible interface for non-crypto users
- **📊 Thirdweb Analytics**: Comprehensive transaction tracking and analytics via thirdweb dashboard
- **🔐 In-App Wallets**: Seamless authentication with email, phone, social, and passkey options

## 🏗️ Architecture

### Smart Contracts (Solidity)

1. **KYCContract**: Manages minimal on-chain KYC verification
2. **WalletContract**: Handles user balances and P2P transfers
3. **AgentServicesContract**: Manages agent registrations and operations
4. **TransactionManager**: Coordinates all transactions with logging

### Mobile App (React Native + TypeScript)

- **Home Screen**: Balance display, transaction history, and analytics dashboard
- **Transfer Screen**: P2P money transfers with comprehensive tracking
- **Withdraw Screen**: Agent-based and Transak withdrawals with real registered agents
- **Agent Screen**: Agent registration and management interface
- **KYC Screen**: User verification interface
- **🆕 Analytics Dashboard**: Direct access to thirdweb transaction analytics

### 🔗 Thirdweb Integration

EtherPesa leverages thirdweb's powerful infrastructure for:

- **In-App Wallets**: Multiple authentication methods (email, phone, Google, Facebook, passkey)
- **Smart Accounts**: Enhanced UX with gasless transactions where possible
- **Transaction Tracking**: Automatic tracking of all transactions with detailed metadata
- **Analytics Dashboard**: Comprehensive insights into user behavior and transaction patterns
- **Security Monitoring**: Advanced fraud detection and risk assessment

[View detailed thirdweb integration documentation](./THIRDWEB_INTEGRATION.md)

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- Yarn or npm
- Android Studio / Xcode for mobile development
- Thirdweb account and client ID
- Transak API key (optional)

### 1. Clone and Install

```bash
git clone <repository-url>
cd etherpesa
yarn install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Thirdweb client ID (required)
EXPO_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id

# Contract addresses (update after deployment)
EXPO_PUBLIC_KYC_CONTRACT=0x...
EXPO_PUBLIC_WALLET_CONTRACT=0x...
EXPO_PUBLIC_AGENT_CONTRACT=0x...
EXPO_PUBLIC_TX_MANAGER_CONTRACT=0x...

# Transak integration (optional)
EXPO_PUBLIC_TRANSAK_API_KEY=your_transak_api_key

# Deployment private key (for scripts only)
PRIVATE_KEY=your_private_key
```

### 3. Deploy Smart Contracts

```bash
# Install Hardhat dependencies
yarn add --dev @nomicfoundation/hardhat-toolbox dotenv

```bash
# Deploy to Etherlink testnet
npx hardhat run scripts/deploy.js --network etherlink

# Register demo agents for testing
npx hardhat run scripts/register-agents.js --network etherlink

# Update .env with deployed contract addresses
```
```

### 4. Build Mobile App

```bash
# Prebuild native directories
npx expo prebuild

# Run on Android
yarn android

# Run on iOS
yarn ios
```

## 🧪 Testing

### Smart Contract Tests

```bash
# Run contract tests
npx hardhat test

# Test with coverage
npx hardhat coverage
```

### Mobile App Testing

```bash
# Run React Native tests
yarn test
```

## 🌐 Etherlink Integration

### Network Configuration

- **Chain ID**: 128123
- **RPC URL**: https://node.ghostnet.etherlink.com
- **Explorer**: https://testnet-explorer.etherlink.com
- **Native Token**: XTZ

### Key Benefits

- **Sub-500ms Confirmations**: Near-instant transaction finality
- **Ultra-Low Fees**: Fractions of a cent per transaction
- **EVM Compatible**: Full Ethereum tooling support
- **Scalable**: High throughput for mass adoption

## 💰 User Flow

### 1. Onboarding
1. Download EtherPesa app
2. Connect wallet (in-app or external)
3. Complete KYC verification
4. Ready to transact!

### 2. P2P Transfer
1. Enter recipient address/phone
2. Specify amount in USDC
3. Confirm transaction
4. Instant settlement on Etherlink

### 3. Cash Out
1. Select withdrawal amount
2. Choose local agent or Transak
3. Receive fiat in bank account/cash
4. Transaction logged on-chain

## 🔧 Development

### Project Structure

```
etherpesa/
├── contracts/           # Solidity smart contracts
│   ├── interfaces/      # Contract interfaces
│   ├── KYCContract.sol
│   ├── WalletContract.sol
│   ├── AgentServicesContract.sol
│   └── TransactionManager.sol
├── app/(tabs)/          # React Native screens
│   ├── home.tsx
│   ├── transfer.tsx
│   ├── withdraw.tsx
│   └── kyc.tsx
├── utils/               # Utility functions
│   └── transak.ts       # Transak integration
├── scripts/             # Deployment scripts
│   └── deploy.js
├── test/                # Contract tests
│   └── EtherPesa.test.js
└── constants/           # App configuration
    └── thirdweb.ts      # Thirdweb setup
```

### Key Technologies

- **Blockchain**: Etherlink (EVM-compatible L2)
- **Smart Contracts**: Solidity 0.8.28
- **Frontend**: React Native + TypeScript
- **Web3 SDK**: Thirdweb v5
- **Fiat Integration**: Transak
- **Development**: Hardhat, Expo

## 🚀 Demo Script (3 minutes)

### Minute 1: Introduction
- "EtherPesa brings M-Pesa's simplicity to DeFi"
- Show Etherlink's sub-500ms confirmations
- Highlight ultra-low transaction fees

### Minute 2: Live Demo
1. **KYC Verification**: Submit phone number hash
2. **P2P Transfer**: Send $10 USDC instantly
3. **Balance Update**: Real-time balance changes
4. **Transaction History**: View logged transactions

### Minute 3: Scaling Vision
- **Agent Network**: Local cash-in/cash-out points
- **Transak Integration**: Direct bank transfers
- **Future Features**: Microfinancing, merchant payments
- **Financial Inclusion**: Banking the unbanked

## 🔮 Post-Hackathon Scaling

### Phase 1: Enhanced Features
- **Microfinancing**: Collateralized loans via smart contracts
- **Merchant Payments**: QR-code based business transactions
- **Multi-Currency**: Support for multiple stablecoins

### Phase 2: Network Effects
- **Global Agent Network**: Decentralized marketplace for agents
- **Cross-Chain Bridging**: Expand to other EVM chains
- **DAO Governance**: Community-driven fee and upgrade decisions

### Phase 3: Financial Ecosystem
- **Savings Products**: Yield-generating accounts
- **Insurance**: Decentralized coverage for transactions
- **Credit Scoring**: On-chain reputation system

## 🤝 Hackathon Partners

- **Etherlink**: Ultra-fast, low-cost blockchain infrastructure
- **Thirdweb**: Web3 development platform and SDK
- **Transak**: Fiat on/off-ramp infrastructure
- **Trilitech**: Etherlink ecosystem support

## 📚 Additional Resources

- [Etherlink Documentation](https://docs.etherlink.com)
- [Thirdweb SDK Docs](https://portal.thirdweb.com)
- [Transak Integration Guide](https://docs.transak.com)
- [Hardhat Documentation](https://hardhat.org/docs)

## 🆘 Support

For technical support or questions:
- Create an issue in this repository
- Join the Etherlink Discord
- Contact the development team

---

**Built for Etherlink Hackathon 2025 - Empowering Financial Inclusion Through DeFi**

# Financial Platform - Decentralized Transaction Management System

A comprehensive decentralized financial platform built with Next.js and Ethereum smart contracts, featuring user management, transaction workflows, and multi-level approval systems with real-time Web3 integration.

## 🚀 Features

### Core Business Logic

- **Role-Based User Management**: Three-tier access control (Regular, Manager, Admin)
- **Transaction Lifecycle**: Create → Request Approval → Approve/Reject → Complete
- **Multi-Level Approval System**: Managers and Admins can approve transactions
- **Real-time Web3 Integration**: Live updates via smart contract events
- **Audit Trail**: Complete transaction and approval history with reasons

### User Experience

- **Responsive Dashboard**: Mobile-first design with Tailwind CSS
- **Wallet Integration**: MetaMask support with automatic network detection
- **Real-time Notifications**: Pending approval alerts for managers/admins
- **Form Validation**: Comprehensive validation with React Hook Form and Zod
- **Loading States**: Smooth UX with loading indicators and error handling

### Security Features

- **Access Control**: OpenZeppelin role-based permissions
- **Reentrancy Protection**: Smart contract security with ReentrancyGuard
- **Input Validation**: Both frontend and smart contract validation
- **Owner Verification**: Only transaction creators can complete their transactions

## 🛠 Technology Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible UI primitives
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Smart Contracts

- **Solidity ^0.8.20** - Smart contract language
- **Hardhat** - Development and testing environment
- **OpenZeppelin** - Secure contract libraries
- **Ethers.js v6** - Ethereum interaction

### Web3 Integration

- **MetaMask** - Wallet connection and transaction signing
- **Event Listening** - Real-time contract state updates
- **Multi-Network Support** - Localhost and Holesky testnet

## 📁 Project Structure

```
contract-technical-assignment/
├── client/                          # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                     # Next.js App Router
│   │   │   ├── page.tsx             # Dashboard home page
│   │   │   ├── transactions/        # Transaction management pages
│   │   │   ├── approvals/          # Approval workflow pages
│   │   │   ├── users/              # User management pages
│   │   │   ├── layout.tsx          # Root layout with providers
│   │   │   └── globals.css         # Global styles and Tailwind
│   │   ├── components/
│   │   │   ├── layout/             # Header, Sidebar, WalletConnection
│   │   │   ├── ui/                 # Reusable UI components (Button, Card, etc.)
│   │   │   ├── dashboard/          # Dashboard widgets and charts
│   │   │   ├── transactions/       # Transaction forms and lists
│   │   │   ├── approvals/          # Approval processing components
│   │   │   ├── users/              # User management components
│   │   │   └── providers/          # React Query and Web3 providers
│   │   ├── contexts/
│   │   │   └── Web3Provider.tsx    # Web3 context with wallet state
│   │   ├── hooks/
│   │   │   ├── useWallet.ts        # Wallet connection logic
│   │   │   ├── useContract.ts      # Smart contract interaction
│   │   │   └── useContractData.ts  # Contract data fetching hooks
│   │   ├── lib/
│   │   │   ├── contracts.ts        # Contract ABI and configuration
│   │   │   └── schemas.ts          # Zod validation schemas
│   │   ├── types/
│   │   │   └── contract.ts         # TypeScript type definitions
│   │   └── utils/
│   │       └── cn.ts               # Utility functions
│   ├── package.json                # Frontend dependencies
│   └── next.config.ts              # Next.js configuration
└── contract/                       # Smart Contract Development
    ├── contracts/
    │   ├── FinancialPlatform.sol   # Main platform contract
    │   └── MockToken.sol           # ERC20 token for testing
    ├── scripts/
    │   ├── deploy.js               # Deployment script with test data
    │   └── test-setup.js           # Test environment setup
    ├── test/
    │   └── FinancialPlatform.test.js # Comprehensive contract tests
    ├── hardhat.config.js           # Hardhat configuration
    └── package.json                # Contract dependencies
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **MetaMask** browser extension
- **Git** for version control

### 1. Clone and Install

```bash
git clone <repository-url>
cd contract-technical-assignment

# Install contract dependencies
cd contract
npm install

# Install frontend dependencies
cd client
npm install
```

### 2. Environment Setup

Create `.env.local` in the `client` directory:

```env
NEXT_PUBLIC_FINANCIAL_PLATFORM_ADDRESS=
NEXT_PUBLIC_MOCK_TOKEN_ADDRESS=
```

Create `.env` in the `contract` directory (for testnet deployment):

```env
PRIVATE_KEY=your_wallet_private_key_for_deployment
SEPOLIA_RPC_URL=your_holesky_rpc_endpoint
ETHERSCAN_API_KEY=your_etherscan_api_key_for_verification
```

### 3. Deploy Smart Contracts

```bash
# Terminal 1: Start local Hardhat network
cd contract
npx hardhat node

# In a new terminal: Deploy contracts locally or to sepolia testnet
npx run deploy:hardhat

npx run deploy:sepolia
```

### 4. Start the Frontend

```bash
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Connect Wallet and Test

1. **Connect MetaMask** to localhost network (Chain ID: 31337)
2. **Import test accounts** from Hardhat node output
3. **Explore the platform** with pre-populated test data

## 🎯 Demo Workflows

### 1. First-Time Setup

1. Connect MetaMask wallet
2. Switch to Hardhat Network (localhost:8545)
3. Use one of the pre-deployed test accounts

### 2. User Registration (Admin Only)

1. Navigate to **Users** page
2. Connect with deployer account (auto-registered as Admin)
3. Register new users:
   - **Wallet Address**: Valid Ethereum address
   - **Name**: User's full name
   - **Email**: Contact email
   - **Role**: Regular/Manager/Admin

### 3. Transaction Creation

1. Navigate to **Transactions** page
2. Click **"Create New Transaction"**
3. Fill the form:
   - **Recipient**: Valid Ethereum address
   - **Amount**: ETH amount (e.g., "1.5")
   - **Description**: Transaction purpose
4. **Submit** and confirm in MetaMask
5. **Request Approval** (automatic after creation)

### 4. Approval Process (Manager/Admin)

1. Navigate to **Approvals** page
2. View pending approval requests
3. Click **"Process Approval"** on any pending item
4. Choose **Approve** or **Reject**
5. Provide reason for decision
6. Confirm transaction in MetaMask

### 5. Transaction Completion

1. Navigate to **Transactions** page
2. Find an **Active** (approved) transaction
3. Click on transaction to view details
4. Click **"Complete Transaction"** (only visible to transaction owner)
5. Confirm in MetaMask

## 🧪 Testing

### Smart Contract Tests

```bash
cd contract
npm test
```

The test suite covers:
- User registration and role management
- Transaction creation and lifecycle
- Approval workflow and access control
- Security validations and error handling
- Event emissions and state changes

### Frontend Development

```bash
cd client
npm run dev          # Development server
npm run build        # Production build
npm start           # Start production server
npm run lint        # ESLint checking
```

## 🌐 Network Configuration

### Supported Networks

- **Localhost (31337)**: Development and testing
- **Holesky Testnet (17000)**: Testnet deployment

### Testnet Deployment

```bash
cd contract

# Deploy to Holesky testnet
npm run deploy:holesky

# Verify on Etherscan (optional)
npx hardhat verify --network holesky <CONTRACT_ADDRESS>
```

### Network Switching

The frontend automatically detects network changes and provides quick switch buttons for unsupported networks.

## 🔧 Smart Contract Functions

### User Management
- `registerUser(address, string, string, UserRole)` - Register new user (Admin only)
- `updateUserRole(address, UserRole)` - Update user role (Admin only)
- `getUser(address)` - Get user information
- `getAllRegisteredUsers()` - Get all users (Admin only)

### Transaction Management
- `createTransaction(address, uint256, string)` - Create new transaction
- `requestApproval(uint256, string)` - Request approval for transaction
- `completeTransaction(uint256)` - Complete approved transaction (owner only)
- `getTransaction(uint256)` - Get transaction details
- `getUserTransactions(address)` - Get user's transactions

### Approval System
- `processApproval(uint256, bool, string)` - Process approval (Manager/Admin only)
- `getApproval(uint256)` - Get approval details
- `getPendingApprovals()` - Get all pending approvals

### Utility Functions
- `getTransactionCount()` - Total transaction count
- `getApprovalCount()` - Total approval count
- `getUserCount()` - Total user count

## 📊 Frontend Features

### Dashboard
- **Metrics Overview**: Transaction volume, pending approvals, user counts
- **Recent Activity**: Latest transactions and approvals
- **Analytics Charts**: Transaction trends and status distribution

### Transaction Management
- **Create Transactions**: User-friendly form with validation
- **Transaction List**: Filterable and sortable transaction history
- **Status Tracking**: Real-time status updates with color coding
- **Details Modal**: Comprehensive transaction information

### Approval Workflow
- **Pending Approvals**: Manager/Admin view of approval requests
- **Quick Actions**: One-click approve/reject with reason tracking
- **Approval History**: Complete audit trail of all decisions

### User Management
- **User Registration**: Admin-only user onboarding
- **Role Management**: Dynamic role updates with permission changes
- **User Directory**: Searchable list of all platform users

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add some feature'`
5. Push to the branch: `git push origin feature/your-feature`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:

1. Check existing documentation
2. Review the test files for usage examples
3. Create an issue with detailed information
4. Include error messages and steps to reproduce

## 🙏 Acknowledgments

- **OpenZeppelin** for secure smart contract libraries
- **Hardhat** for excellent development tooling
- **Next.js** for the robust React framework
- **Radix UI** for accessible component primitives

---

**Built with ❤️ using Next.js, Solidity, and modern Web3 technologies** 

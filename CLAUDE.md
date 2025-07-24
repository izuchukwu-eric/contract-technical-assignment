# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# TODOs

✅ Set up Web3 provider and wallet connection system 
✅ Create contract ABIs and configuration
✅ Build dashboard layout with sidebar navigation
✅ Implement wallet connection component
✅ Create dashboard overview page with metrics
🔄 Build transaction management interface
- Implement approval workflow system
- Create user management interface (admin only)
- Add real-time event listening for contract updates
- Implement role-based access control throughout app

## Setup Instructions

### Contract Deployment & Configuration

1. **Deploy the smart contract** (see README.md for deployment instructions)
2. **Update the contract address** in `client/.env.local`:
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
   ```
3. **Start the frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

### Environment Configuration

The client uses the following environment variables:
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Deployed contract address (required)
- `NEXT_PUBLIC_NETWORK_ID` - Network ID (31337 for Hardhat, 11155111 for Sepolia)
- `NEXT_PUBLIC_RPC_URL` - RPC endpoint (http://127.0.0.1:8545 for Hardhat)

### Current Status

✅ **Completed:**
- Next.js 15 project setup with TypeScript
- Web3 provider and wallet connection system
- MetaMask integration with network switching
- Dashboard layout with sidebar navigation
- Smart contract ABI integration
- Dashboard overview with blockchain metrics
- Real-time data fetching with React Query
- Responsive UI with Tailwind CSS and shadcn/ui components

🔄 **In Progress:**
- Transaction management interface
- Form validation with React Hook Form + Zod

⏳ **Todo:**
- Approval workflow system
- User management (admin only)
- Real-time event listening
- Role-based access control

# Project Overview

Build a comprehensive dashboard for managing financial transactions, approvals, and users with **Web3 integration**. The frontend should integrate with smart contracts to provide a real blockchain-based financial management system.

---

## NOTE
- All frontend things should go in a **client** folder
- Instructions on how to deploy the contracts are in the **README.md** file

---


## Tech Stack

- **Next.js 15** with App Router
- **TypeScript**
- **Tailwind CSS** (no hardcoded CSS)
- **React Query** (for local/sample/mock data fetching)
- **Shadcn/ui** components
- **React Hook Form** + Zod for forms
- **Web3 Integration**: Ethers.js

## Core Functionalities

### 1. Dashboard Overview

- Display key metrics from blockchain (total transactions, pending approvals, active deals)
- Show recent activity from smart contract events
- Simple data visualization chart
- **Web3 Integration**: Connect wallet and display user's blockchain address and role

### 2. Transaction Management

- View list of all transactions from blockchain with filtering and search
- Create new transactions through smart contract calls
- View transaction details from blockchain
- Track transaction status (Pending, Active, Completed, Rejected)
- **Web3 Integration**: Use smart contract functions for all transaction operations

### 3. Approval Workflow

- View pending approvals from blockchain
- Approve or reject requests through smart contract calls
- Track approval history from blockchain events
- Show notifications for new approvals (real-time from contract events)
- **Web3 Integration**: Process approvals using smart contract functions

### 4. User Management

- View user profiles from blockchain
- Manage user roles and permissions through smart contract calls
- Track user activity from blockchain data
- **Web3 Integration**: Admin-only functions for user management

## Web3 Integration Requirements

### 1. Wallet Connection

- **MetaMask Integration**: Connect to MetaMask or other Web3 wallets
- **Account Switching**: Handle account switching and display current account
- **Network Support**: Support localhost (development) and Sepolia (testing)
- **Connection Status**: Show connection status and handle disconnections

### 2. Smart Contract Integration

### Contract Functions to Integrate

**User Management:**

- `getUser(address)` - Get user information
- `registerUser(address, name, email, role)` - Register new user (admin only)
- `updateUserRole(address, role)` - Update user role (admin only)

**Transaction Management:**

- `createTransaction(to, amount)` - Create new transaction
- `getTransaction(id)` - Get transaction details
- `getUserTransactions(address)` - Get user's transactions
- `completeTransaction(id)` - Complete approved transaction

**Approval Workflow:**

- `requestApproval(transactionId)` - Request approval for transaction
- `processApproval(approvalId, approved)` - Process approval
- `getApproval(id)` - Get approval details
- `getPendingApprovals()` - Get all pending approvals

**Data Retrieval:**

- `getTransactionCount()` - Get total transaction count
- `getApprovalCount()` - Get total approval count
- `getUserCount()` - Get total user count

### 3. Real-time Updates

- **Event Listening**: Listen to smart contract events for real-time updates
- **UI Updates**: Update UI when transactions are created, approved, or completed
- **Status Changes**: Show real-time transaction status changes
- **Notifications**: Display notifications for new approvals and transactions

### 4. Role-Based Access Control

- **User Roles**: Regular, Manager, Admin
- **Permission Checks**: Check user roles before showing/hiding features
- **Admin Functions**: Only admins can register users and update roles
- **Approver Functions**: Only managers/admins can process approvals

# Assignments

# Project Overview

Build a comprehensive dashboard for managing financial transactions, approvals, and users with **Web3 integration**. The frontend should integrate with smart contracts to provide a real blockchain-based financial management system.

---

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript**
- **Tailwind CSS** (no hardcoded CSS)
- **React Query** (for local/sample/mock data fetching)
- **Shadcn/ui** components
- **React Hook Form** + Zod for forms
- **Web3 Integration**: Ethers.js

---

## Core Functionalities

### 1. Dashboard Overview

- Display key metrics from blockchain (total transactions, pending approvals, active deals)
- Show recent activity from smart contract events
- Simple data visualization chart
- **Web3 Integration**: Connect wallet and display user's blockchain address and role

### 2. Transaction Management

- View list of all transactions from blockchain with filtering and search
- Create new transactions through smart contract calls
- View transaction details from blockchain
- Track transaction status (Pending, Active, Completed, Rejected)
- **Web3 Integration**: Use smart contract functions for all transaction operations

### 3. Approval Workflow

- View pending approvals from blockchain
- Approve or reject requests through smart contract calls
- Track approval history from blockchain events
- Show notifications for new approvals (real-time from contract events)
- **Web3 Integration**: Process approvals using smart contract functions

### 4. User Management

- View user profiles from blockchain
- Manage user roles and permissions through smart contract calls
- Track user activity from blockchain data
- **Web3 Integration**: Admin-only functions for user management

---

## Web3 Integration Requirements

### 1. Wallet Connection

- **MetaMask Integration**: Connect to MetaMask or other Web3 wallets
- **Account Switching**: Handle account switching and display current account
- **Network Support**: Support localhost (development) and Sepolia (testing)
- **Connection Status**: Show connection status and handle disconnections

### 2. Smart Contract Integration

### Contract Functions to Integrate

**User Management:**

- `getUser(address)` - Get user information
- `registerUser(address, name, email, role)` - Register new user (admin only)
- `updateUserRole(address, role)` - Update user role (admin only)

**Transaction Management:**

- `createTransaction(to, amount)` - Create new transaction
- `getTransaction(id)` - Get transaction details
- `getUserTransactions(address)` - Get user's transactions
- `completeTransaction(id)` - Complete approved transaction

**Approval Workflow:**

- `requestApproval(transactionId)` - Request approval for transaction
- `processApproval(approvalId, approved)` - Process approval
- `getApproval(id)` - Get approval details
- `getPendingApprovals()` - Get all pending approvals

**Data Retrieval:**

- `getTransactionCount()` - Get total transaction count
- `getApprovalCount()` - Get total approval count
- `getUserCount()` - Get total user count

### 3. Real-time Updates

- **Event Listening**: Listen to smart contract events for real-time updates
- **UI Updates**: Update UI when transactions are created, approved, or completed
- **Status Changes**: Show real-time transaction status changes
- **Notifications**: Display notifications for new approvals and transactions

### 4. Role-Based Access Control

- **User Roles**: Regular, Manager, Admin
- **Permission Checks**: Check user roles before showing/hiding features
- **Admin Functions**: Only admins can register users and update roles
- **Approver Functions**: Only managers/admins can process approvals

---

## Evaluation Focus

### Technical Implementation

- **Clean, maintainable code structure**
- **Proper TypeScript usage**
- **Component reusability**
- **Error handling and edge cases**
- **Performance considerations**
- **Web3 integration quality**

### User Experience

- **Intuitive navigation**
- **Responsive design**
- **Loading states and feedback**
- **Form validation and error messages**
- **Consistent visual design**
- **Wallet connection UX**

### Web3 Integration Quality

- **Proper wallet connection handling**
- **Smart contract interaction patterns**
- **Real-time event listening**
- **Error handling for blockchain operations**
- **Role-based access control implementation**
- **Transaction confirmation UX**

---

## Required Components

### 1. Wallet Connection

- Connect/disconnect wallet
- Display account information
- Show network status
- Handle connection errors

### 2. Dashboard

- Display blockchain metrics
- Show user's role and permissions
- Real-time transaction updates
- Recent activity feed

### 3. Transaction Management

- Transaction list with blockchain data
- Create transaction form with contract integration
- Transaction details modal
- Status tracking and updates

### 4. Approval Workflow

- Pending approvals list
- Approval processing interface
- Approval history
- Real-time approval notifications

### 5. User Management

- User list (admin only)
- User registration form (admin only)
- Role management interface
- User activity tracking

---

## Submission Requirements

1. **Working application** with Web3 integration
2. **Smart contract integration** for all core features
3. **README** with setup and running instructions
4. **Clean codebase** with good structure
5. **Demo** showing key user workflows with wallet connection
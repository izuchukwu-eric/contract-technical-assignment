export enum UserRole {
  User = 0,
  Manager = 1,
  Admin = 2,
}

export enum TransactionStatus {
  Pending = 0,
  Active = 1,
  Completed = 2,
  Rejected = 3,
}

export enum ApprovalStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export enum ApprovalType {
  Transaction = 0,
  UserRegistration = 1,
  RoleUpdate = 2,
}

export interface User {
  id: bigint;
  walletAddress: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: bigint;
}

export interface Transaction {
  id: bigint;
  from: string;
  to: string;
  amount: bigint;
  description: string;
  status: TransactionStatus;
  timestamp: bigint;
  approvalId: bigint;
}

export interface Approval {
  id: bigint;
  transactionId: bigint;
  requester: string;
  approver: string;
  approvalType: ApprovalType;
  status: ApprovalStatus;
  reason: string;
  timestamp: bigint;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isLoading: boolean;
  error: string | null;
}

export interface ContractMetrics {
  totalTransactions: number;
  pendingApprovals: number;
  totalUsers: number;
  activeDeals: number;
}
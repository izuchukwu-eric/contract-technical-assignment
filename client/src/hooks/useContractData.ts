'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWeb3 } from '@/contexts/Web3Provider';
import type { ContractMetrics, Transaction, Approval, User } from '@/types/contract';

export const useContractMetrics = () => {
  const { readContract, isConnected } = useWeb3();

  return useQuery({
    queryKey: ['contract-metrics'],
    queryFn: async (): Promise<ContractMetrics> => {
      if (!readContract) throw new Error('Contract not available');

      const [
        totalTransactions,
        pendingApprovals,
        totalUsers,
      ] = await Promise.all([
        readContract.getTransactionCount(),
        readContract.getPendingApprovals(),
        readContract.getUserCount(),
      ]);

      return {
        totalTransactions: Number(totalTransactions),
        pendingApprovals: pendingApprovals.length,
        totalUsers: Number(totalUsers),
        activeDeals: Number(totalTransactions) - pendingApprovals.length,
      };
    },
    enabled: isConnected && !!readContract,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useRecentTransactions = (limit = 3) => {
  const { readContract, isConnected } = useWeb3();

  return useQuery({
    queryKey: ['recent-transactions', limit],
    queryFn: async (): Promise<Transaction[]> => {
      if (!readContract) throw new Error('Contract not available');

      const transactionIds = await readContract.getAllTransactions();
      
      if (transactionIds.length === 0) {
        return [];
      }
      
      // Fetch ALL transactions
      const allTransactions = await Promise.all(
        transactionIds.map((id: bigint) => readContract.getTransaction(id))
      );

      // Convert all transactions to proper format
      const formattedTransactions = allTransactions.map((tx: any) => ({
        id: tx.id,
        from: tx.from,
        to: tx.to,
        amount: tx.amount,
        description: tx.description,
        status: Number(tx.status),
        timestamp: tx.timestamp,
        approvalId: tx.approvalId,
      }));

      // Sort by timestamp (most recent first) and return only the latest 3
      return formattedTransactions
        .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
        .slice(0, limit);
    },
    enabled: isConnected && !!readContract,
    refetchInterval: 30000,
  });
};

export const useAllTransactions = () => {
  const { readContract, isConnected } = useWeb3();

  return useQuery({
    queryKey: ['all-transactions'],
    queryFn: async (): Promise<Transaction[]> => {
      if (!readContract) throw new Error('Contract not available');

      const transactionIds = await readContract.getAllTransactions();
      
      const transactions = await Promise.all(
        transactionIds.map((id: bigint) => readContract.getTransaction(id))
      );

      return transactions.map((tx: any) => ({
        id: tx.id,
        from: tx.from,
        to: tx.to,
        amount: tx.amount,
        description: tx.description,
        status: Number(tx.status),
        timestamp: tx.timestamp,
        approvalId: tx.approvalId,
      })).reverse(); // Most recent first
    },
    enabled: isConnected && !!readContract,
    refetchInterval: 30000,
  });
};

export const useUserTransactions = (userAddress?: string) => {
  const { readContract, isConnected, address } = useWeb3();
  const targetAddress = userAddress || address;

  return useQuery({
    queryKey: ['user-transactions', targetAddress],
    queryFn: async (): Promise<Transaction[]> => {
      if (!readContract || !targetAddress) throw new Error('Contract or address not available');

      const transactionIds = await readContract.getUserTransactions(targetAddress);
      
      const transactions = await Promise.all(
        transactionIds.map((id: bigint) => readContract.getTransaction(id))
      );

      return transactions.map((tx: any) => ({
        id: tx.id,
        from: tx.from,
        to: tx.to,
        amount: tx.amount,
        description: tx.description,
        status: Number(tx.status),
        timestamp: tx.timestamp,
        approvalId: tx.approvalId,
      })).reverse();
    },
    enabled: isConnected && !!readContract && !!targetAddress,
    refetchInterval: 30000,
  });
};

export const useRecentApprovals = (limit = 5) => {
  const { readContract, isConnected } = useWeb3();

  return useQuery({
    queryKey: ['recent-approvals', limit],
    queryFn: async (): Promise<Approval[]> => {
      if (!readContract) throw new Error('Contract not available');

      const pendingIds = await readContract.getPendingApprovals();
      const recentIds = pendingIds.slice(-limit).reverse();
      
      const approvals = await Promise.all(
        recentIds.map((id: bigint) => readContract.getApproval(id))
      );

      return approvals.map((approval: any) => ({
        id: approval.id,
        transactionId: approval.transactionId,
        requester: approval.requester,
        approver: approval.approver,
        approvalType: Number(approval.approvalType),
        status: Number(approval.status),
        reason: approval.reason,
        timestamp: approval.timestamp,
      }));
    },
    enabled: isConnected && !!readContract,
    refetchInterval: 30000,
  });
};

export const usePendingApprovals = () => {
  const { readContract, isConnected } = useWeb3();

  return useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async (): Promise<Approval[]> => {
      if (!readContract) throw new Error('Contract not available');

      const pendingIds = await readContract.getPendingApprovals();
      
      const approvals = await Promise.all(
        pendingIds.map((id: bigint) => readContract.getApproval(id))
      );

      return approvals.map((approval: any) => ({
        id: approval.id,
        transactionId: approval.transactionId,
        requester: approval.requester,
        approver: approval.approver,
        approvalType: Number(approval.approvalType),
        status: Number(approval.status),
        reason: approval.reason,
        timestamp: approval.timestamp,
      })).reverse(); // Most recent first
    },
    enabled: isConnected && !!readContract,
    refetchInterval: 15000, // More frequent updates for pending approvals
  });
};

export const useApprovalHistory = () => {
  const { readContract, isConnected } = useWeb3();

  return useQuery({
    queryKey: ['approval-history'],
    queryFn: async (): Promise<Approval[]> => {
      if (!readContract) throw new Error('Contract not available');

      // Get all approvals (this assumes there's a function to get all approval IDs)
      // For now, we'll get pending ones and can extend this based on contract capabilities
      const allApprovalIds = await readContract.getPendingApprovals();
      
      const approvals = await Promise.all(
        allApprovalIds.map((id: bigint) => readContract.getApproval(id))
      );

      return approvals.map((approval: any) => ({
        id: approval.id,
        transactionId: approval.transactionId,
        requester: approval.requester,
        approver: approval.approver,
        approvalType: Number(approval.approvalType),
        status: Number(approval.status),
        reason: approval.reason,
        timestamp: approval.timestamp,
      })).reverse();
    },
    enabled: isConnected && !!readContract,
    refetchInterval: 30000,
  });
};

export const useProcessApproval = () => {
  const { contract, isConnected } = useWeb3();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ approvalId, approved, reason }: { 
      approvalId: bigint; 
      approved: boolean; 
      reason?: string; 
    }) => {
      if (!contract) throw new Error('Contract not available');
      
      const tx = await contract.processApproval(approvalId, approved);
      await tx.wait();
      return tx;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['approval-history'] });
      queryClient.invalidateQueries({ queryKey: ['recent-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['contract-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
    },
    onError: (error) => {
      console.error('Approval processing failed:', error);
    },
  });
};

export const useRequestApproval = () => {
  const { contract, isConnected } = useWeb3();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId }: { transactionId: bigint }) => {
      if (!contract) throw new Error('Contract not available');
      
      const tx = await contract.requestApproval(transactionId);
      await tx.wait();
      return tx;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['contract-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
    },
    onError: (error) => {
      console.error('Approval request failed:', error);
    },
  });
};

// User Management Hooks

export const useAllUsers = () => {
  const { readContract, isConnected } = useWeb3();

  return useQuery({
    queryKey: ['all-users'],
    queryFn: async (): Promise<User[]> => {
      if (!readContract) throw new Error('Contract not available');

      const userAddresses = await readContract.getAllRegisteredUsers();
      
      const users = await Promise.all(
        userAddresses.map((address: string) => readContract.getUser(address))
      );

      return users.map((user: any) => ({
        id: BigInt(user.id),
        walletAddress: user.walletAddress,
        name: user.name,
        email: user.email,
        role: Number(user.role),
        isActive: user.isActive,
        createdAt: BigInt(user.createdAt),
      })).sort((a, b) => Number(b.createdAt) - Number(a.createdAt)); // Most recent first
    },
    enabled: isConnected && !!readContract,
    refetchInterval: 30000,
  });
};

export const useUser = (userAddress?: string) => {
  const { readContract, isConnected, address } = useWeb3();
  const targetAddress = userAddress || address;

  return useQuery({
    queryKey: ['user', targetAddress],
    queryFn: async (): Promise<User | null> => {
      if (!readContract || !targetAddress) return null;

      try {
        const user = await readContract.getUser(targetAddress);
        return {
          id: BigInt(user.id),
          walletAddress: user.walletAddress,
          name: user.name,
          email: user.email,
          role: Number(user.role),
          isActive: user.isActive,
          createdAt: BigInt(user.createdAt),
        };
      } catch (error) {
        // User might not be registered
        return null;
      }
    },
    enabled: isConnected && !!readContract && !!targetAddress,
    refetchInterval: 30000,
  });
};

export const useRegisterUser = () => {
  const { contract, isConnected } = useWeb3();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      walletAddress, 
      name, 
      email, 
      role 
    }: { 
      walletAddress: string; 
      name: string; 
      email: string; 
      role: number; 
    }) => {
      if (!contract) throw new Error('Contract not available');
      
      const tx = await contract.registerUser(walletAddress, name, email, role);
      await tx.wait();
      return tx;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      queryClient.invalidateQueries({ queryKey: ['contract-metrics'] });
    },
    onError: (error) => {
      console.error('User registration failed:', error);
    },
  });
};

export const useUpdateUserRole = () => {
  const { contract, isConnected } = useWeb3();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userAddress, 
      newRole 
    }: { 
      userAddress: string; 
      newRole: number; 
    }) => {
      if (!contract) throw new Error('Contract not available');
      
      const tx = await contract.updateUserRole(userAddress, newRole);
      await tx.wait();
      return tx;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      console.error('User role update failed:', error);
    },
  });
};
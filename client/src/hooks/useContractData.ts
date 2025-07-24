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
  const { contract, isConnected, address } = useWeb3();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ approvalId, approved, reason }: { 
      approvalId: bigint; 
      approved: boolean; 
      reason?: string; 
    }) => {
      if (!isConnected) {
        throw new Error('Wallet not connected. Please connect your wallet to continue.');
      }
      
      if (!address) {
        throw new Error('No wallet address found. Please reconnect your wallet.');
      }
      
      if (!contract) {
        throw new Error('Contract not available. Please ensure your wallet is connected and try again.');
      }
      
      console.log('Processing approval:', { approvalId: approvalId.toString(), approved, reason });
      
      try {
        const tx = await contract.processApproval(approvalId, approved, reason || '');
        console.log('Transaction sent:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt);
        
        return receipt;
      } catch (error: any) {
        console.error('Transaction failed:', error);
        
        // Handle specific error types
        if (error.code === 'UNSUPPORTED_OPERATION') {
          throw new Error('Wallet connection issue. Please reconnect your wallet and try again.');
        }
        if (error.code === 'ACTION_REJECTED') {
          throw new Error('Transaction was rejected by user.');
        }
        if (error.code === 'INSUFFICIENT_FUNDS') {
          throw new Error('Insufficient funds to complete the transaction.');
        }
        
        throw new Error(error.message || 'Failed to process approval. Please try again.');
      }
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
  const { contract, isConnected, address } = useWeb3();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, reason }: { transactionId: bigint; reason?: string }) => {
      if (!isConnected) {
        throw new Error('Wallet not connected. Please connect your wallet to continue.');
      }
      
      if (!address) {
        throw new Error('No wallet address found. Please reconnect your wallet.');
      }
      
      if (!contract) {
        throw new Error('Contract not available. Please ensure your wallet is connected and try again.');
      }
      
      console.log('Requesting approval for transaction ID:', transactionId.toString());
      
      try {
        const tx = await contract.requestApproval(transactionId, reason || 'Automatic approval request after transaction creation');
        console.log('Approval request sent:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('Approval request confirmed:', receipt);
        
        return receipt;
      } catch (error: any) {
        console.error('Approval request failed:', error);
        
        // Handle specific error types
        if (error.code === 'UNSUPPORTED_OPERATION') {
          throw new Error('Wallet connection issue. Please reconnect your wallet and try again.');
        }
        if (error.code === 'ACTION_REJECTED') {
          throw new Error('Approval request was rejected by user.');
        }
        if (error.code === 'INSUFFICIENT_FUNDS') {
          throw new Error('Insufficient funds to complete the approval request.');
        }
        
        throw new Error(error.message || 'Failed to request approval. Please try again.');
      }
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
  const { contract, isConnected, address } = useWeb3();
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
      if (!isConnected) {
        throw new Error('Wallet not connected. Please connect your wallet to continue.');
      }
      
      if (!address) {
        throw new Error('No wallet address found. Please reconnect your wallet.');
      }
      
      if (!contract) {
        throw new Error('Contract not available. Please ensure your wallet is connected and try again.');
      }
      
      console.log('Registering user:', { walletAddress, name, email, role });
      
      try {
        const tx = await contract.registerUser(walletAddress, name, email, role);
        console.log('User registration sent:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('User registration confirmed:', receipt);
        
        return receipt;
      } catch (error: any) {
        console.error('User registration failed:', error);
        
        // Handle specific error types
        if (error.code === 'UNSUPPORTED_OPERATION') {
          throw new Error('Wallet connection issue. Please reconnect your wallet and try again.');
        }
        if (error.code === 'ACTION_REJECTED') {
          throw new Error('User registration was rejected by user.');
        }
        if (error.code === 'INSUFFICIENT_FUNDS') {
          throw new Error('Insufficient funds to complete the registration.');
        }
        
        throw new Error(error.message || 'Failed to register user. Please try again.');
      }
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
  const { contract, isConnected, address } = useWeb3();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userAddress, 
      newRole 
    }: { 
      userAddress: string; 
      newRole: number; 
    }) => {
      if (!isConnected) {
        throw new Error('Wallet not connected. Please connect your wallet to continue.');
      }
      
      if (!address) {
        throw new Error('No wallet address found. Please reconnect your wallet.');
      }
      
      if (!contract) {
        throw new Error('Contract not available. Please ensure your wallet is connected and try again.');
      }
      
      console.log('Updating user role:', { userAddress, newRole });
      
      try {
        const tx = await contract.updateUserRole(userAddress, newRole);
        console.log('Role update sent:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('Role update confirmed:', receipt);
        
        return receipt;
      } catch (error: any) {
        console.error('User role update failed:', error);
        
        // Handle specific error types
        if (error.code === 'UNSUPPORTED_OPERATION') {
          throw new Error('Wallet connection issue. Please reconnect your wallet and try again.');
        }
        if (error.code === 'ACTION_REJECTED') {
          throw new Error('Role update was rejected by user.');
        }
        if (error.code === 'INSUFFICIENT_FUNDS') {
          throw new Error('Insufficient funds to complete the role update.');
        }
        
        throw new Error(error.message || 'Failed to update user role. Please try again.');
      }
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

export const useCompleteTransaction = () => {
  const { contract, isConnected, address } = useWeb3();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId }: { transactionId: bigint }) => {
      if (!isConnected) {
        throw new Error('Wallet not connected. Please connect your wallet to continue.');
      }
      
      if (!address) {
        throw new Error('No wallet address found. Please reconnect your wallet.');
      }
      
      if (!contract) {
        throw new Error('Contract not available. Please ensure your wallet is connected and try again.');
      }
      
      console.log('Completing transaction:', { transactionId: transactionId.toString() });
      
      try {
        const tx = await contract.completeTransaction(transactionId);
        console.log('Complete transaction sent:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('Complete transaction confirmed:', receipt);
        
        return receipt;
      } catch (error: any) {
        console.error('Transaction completion failed:', error);
        
        // Handle specific error types
        if (error.code === 'UNSUPPORTED_OPERATION') {
          throw new Error('Wallet connection issue. Please reconnect your wallet and try again.');
        }
        if (error.code === 'ACTION_REJECTED') {
          throw new Error('Transaction completion was rejected by user.');
        }
        if (error.code === 'INSUFFICIENT_FUNDS') {
          throw new Error('Insufficient funds to complete the transaction.');
        }
        
        throw new Error(error.message || 'Failed to complete transaction. Please try again.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['contract-metrics'] });
    },
    onError: (error) => {
      console.error('Transaction completion failed:', error);
    },
  });
};
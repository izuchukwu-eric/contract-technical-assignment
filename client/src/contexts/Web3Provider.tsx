'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useContract } from '@/hooks/useContract';
import type { WalletState } from '@/types/contract';
import type { BrowserProvider } from 'ethers';

interface Web3ContextType extends WalletState {
  provider: BrowserProvider | null;
  contract: any;
  readContract: any;
  isReady: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: string) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const walletData = useWallet();
  const { contract, readContract, isReady } = useContract();

  const value: Web3ContextType = {
    ...walletData,
    contract,
    readContract,
    isReady,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};
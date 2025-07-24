'use client';

import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import type { WalletState } from '@/types/contract';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    isLoading: false,
    error: null,
  });

  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setWalletState(prev => ({ ...prev, error: 'MetaMask is not installed' }));
      return;
    }

    try {
      setWalletState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();
      
      setProvider(provider);
      setWalletState({
        isConnected: true,
        address: accounts[0],
        chainId: Number(network.chainId),
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to connect wallet',
      }));
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setWalletState({
      isConnected: false,
      address: null,
      chainId: null,
      isLoading: false,
      error: null,
    });
  }, []);

  const switchNetwork = useCallback(async (chainId: string) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        console.log('Network not added to wallet');
      }
      setWalletState(prev => ({ ...prev, error: error.message }));
    }
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return;

      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          setProvider(provider);
          setWalletState({
            isConnected: true,
            address: accounts[0].address,
            chainId: Number(network.chainId),
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.log('No connection found');
      }
    };

    checkConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWalletState(prev => ({ ...prev, address: accounts[0] }));
        }
      };

      const handleChainChanged = (chainId: string) => {
        setWalletState(prev => ({ ...prev, chainId: parseInt(chainId, 16) }));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [disconnectWallet]);

  return {
    ...walletState,
    provider,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  };
};
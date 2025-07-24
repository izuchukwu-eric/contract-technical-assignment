'use client';

import { useMemo } from 'react';
import { useWallet } from './useWallet';
import { getContract } from '@/lib/contracts';

export const useContract = () => {
  const { provider, address, isConnected } = useWallet();

  const contract = useMemo(() => {
    if (!provider) return null;
    
    const signer = isConnected && address ? provider.getSigner() : null;
    return getContract(provider, signer);
  }, [provider, address, isConnected]);

  const readContract = useMemo(() => {
    if (!provider) return null;
    return getContract(provider);
  }, [provider]);

  return {
    contract,
    readContract,
    isReady: !!contract,
  };
};
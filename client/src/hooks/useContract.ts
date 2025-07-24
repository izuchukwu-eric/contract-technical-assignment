'use client';

import { useMemo, useEffect, useState } from 'react';
import { useWallet } from './useWallet';
import { getContract } from '@/lib/contracts';

export const useContract = () => {
  const { provider, address, isConnected } = useWallet();
  const [signer, setSigner] = useState<any>(null);

  useEffect(() => {
    const getSigner = async () => {
      if (!provider || !isConnected || !address) {
        setSigner(null);
        return;
      }

      try {
        const signerInstance = await provider.getSigner();
        setSigner(signerInstance);
      } catch (error) {
        console.error('Failed to get signer:', error);
        setSigner(null);
      }
    };

    getSigner();
  }, [provider, address, isConnected]);

  const contract = useMemo(() => {
    if (!provider || !signer) return null;
    return getContract(provider, signer);
  }, [provider, signer]);

  const readContract = useMemo(() => {
    if (!provider) return null;
    return getContract(provider);
  }, [provider]);

  return {
    contract,
    readContract,
    isReady: !!contract && !!signer,
  };
};
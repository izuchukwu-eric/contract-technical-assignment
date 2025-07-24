'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/contexts/Web3Provider';
import { Wallet, WifiOff, AlertCircle, Bell, Copy } from 'lucide-react';

interface WalletConnectionProps {
  user?: {
    name: string;
    address: string;
  };
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({ user }) => {
  const { 
    isConnected, 
    address, 
    chainId, 
    isLoading, 
    error, 
    connectWallet, 
    disconnectWallet,
    switchNetwork
  } = useWeb3();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleNetworkSwitch = async (targetChainId: string) => {
    await switchNetwork(targetChainId);
  };

  const getNetworkInfo = () => {
    const isLocalhost = chainId === 31337;
    const isSepolia = chainId === 11155111;
    const isUnsupportedNetwork = !isLocalhost && !isSepolia;

    if (isLocalhost) return { name: 'Hardhat Network', color: 'green' };
    if (isSepolia) return { name: 'Sepolia Network', color: 'blue' };
    return { name: `Chain ${chainId}`, color: 'red' };
  };

  const handleCopyAddress = () => {
    if (user?.address) {
      navigator.clipboard.writeText(user.address);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <Button disabled className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          Connecting...
        </Button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-4">
        <Button onClick={connectWallet} className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
        {error && (
          <div className="flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>
    );
  }

  const networkInfo = getNetworkInfo();
  const isUnsupportedNetwork = networkInfo.color === 'red';

  return (
    <div className="flex items-center gap-4">
      {/* Network Indicator */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
        networkInfo.color === 'green' 
          ? 'bg-green-50 border-green-200' 
          : networkInfo.color === 'blue'
          ? 'bg-blue-50 border-blue-200'
          : 'bg-red-50 border-red-200'
      }`}>
        <div className={`w-2 h-2 rounded-full animate-pulse ${
          networkInfo.color === 'green' 
            ? 'bg-green-500' 
            : networkInfo.color === 'blue'
            ? 'bg-blue-500'
            : 'bg-red-500'
        }`}></div>
        <span className={`text-sm font-medium ${
          networkInfo.color === 'green' 
            ? 'text-green-700' 
            : networkInfo.color === 'blue'
            ? 'text-blue-700'
            : 'text-red-700'
        }`}>
          {networkInfo.name}
        </span>
      </div>
      
      {/* Network Switch Buttons for Unsupported Networks */}
      {isUnsupportedNetwork && (
        <div className="flex gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleNetworkSwitch('0x7A69')}
            className="text-xs"
          >
            Switch to Hardhat
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleNetworkSwitch('0xAA36A7')}
            className="text-xs"
          >
            Switch to Sepolia
          </Button>
        </div>
      )}
      
      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative hover:bg-slate-100">
        <Bell className="h-5 w-5 text-slate-600" />
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-medium">
          1
        </span>
      </Button>
      
      {/* User Info & Disconnect */}
      {user && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
            <div className="w-6 h-6 items-center flex justify-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <span className="text-white font-semibold text-xs">
                {user.name.charAt(0)}
              </span>
            </div>
            <span className="text-sm font-medium text-slate-700">{user.address}</span>
            <Button variant="ghost" size="sm" onClick={handleCopyAddress} className="p-1 h-auto">
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={disconnectWallet}>
            <WifiOff className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/contexts/Web3Provider';
import {
  Wallet,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface WalletAlertProps {
  title?: string;
  message?: string;
  showConnectButton?: boolean;
  className?: string;
}

export const WalletAlert: React.FC<WalletAlertProps> = ({
  title = "Wallet Not Connected",
  message = "Please connect your wallet to view this data.",
  showConnectButton = true,
  className = ""
}) => {
  const { isConnected, isLoading, connectWallet, error } = useWeb3();

  // Don't show anything if wallet is connected
  if (isConnected) {
    return null;
  }

  return (
    <Card className={`shadow-lg border-0 bg-white/80 backdrop-blur-sm ${className}`}>
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
            ) : (
              <Wallet className="w-8 h-8 text-amber-600" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="text-slate-600 max-w-md mx-auto">{message}</p>
            
            {error && (
              <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          {showConnectButton && (
            <div className="pt-2">
              <Button
                onClick={connectWallet}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 
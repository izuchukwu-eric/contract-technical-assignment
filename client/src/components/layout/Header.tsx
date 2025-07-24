'use client';

import React from 'react';
import { WalletConnection } from './WalletConnection';

interface HeaderProps {
  title?: string;
  user?: {
    name: string;
    address: string;
  };
}

export const Header: React.FC<HeaderProps> = ({ title = 'Dashboard', user }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Title Section */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-600 mt-1">Welcome back, manage your blockchain finances</p>
        </div>
        
        {/* Wallet Connection with integrated Right Section */}
        <WalletConnection user={user} />
      </div>
    </header>
  );
};
'use client';

import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useWeb3 } from '@/contexts/Web3Provider';
import { useUser } from '@/hooks/useContractData';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title 
}) => {
  const { address } = useWeb3();
  const { data: currentUser } = useUser(address ?? undefined);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar 
        userRole={currentUser?.role} 
        user={address ? { 
          name: currentUser?.name || 'User', 
          address: `${address.slice(0, 6)}...${address.slice(-4)}` 
        } : undefined}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title={title} 
          user={address ? { 
            name: currentUser?.name || 'User', 
            address: `${address.slice(0, 6)}...${address.slice(-4)}` 
          } : undefined}
        />
        
        <main className="flex-1 overflow-auto p-6 bg-slate-50 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};
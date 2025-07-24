'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  CheckCircle, 
  Users, 
  Wallet
} from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: LayoutDashboard 
  },
  { 
    name: 'Transactions', 
    href: '/transactions', 
    icon: ArrowRightLeft 
  },
  { 
    name: 'Approvals', 
    href: '/approvals', 
    icon: CheckCircle 
  },
  { 
    name: 'Users', 
    href: '/users', 
    icon: Users,
    adminOnly: true 
  },
];

interface SidebarProps {
  userRole?: number;
  user?: {
    name: string;
    address: string;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole, user }) => {
  const pathname = usePathname();
  
  const isAdmin = userRole === 2; // Admin role

  return (
    <div className="flex flex-col w-64 bg-slate-800 min-h-screen shadow-xl">
      {/* Logo/Brand Section */}
      <div className="flex items-center justify-start h-16 px-6 bg-slate-900/50 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Oumla
          </h1>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          
          // Hide admin-only items if user is not admin
          if (item.adminOnly && !isAdmin) {
            return null;
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-smooth group',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-smooth",
                isActive ? "text-white" : "text-slate-400 group-hover:text-white"
              )} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* User Role Badge */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-slate-600">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
              <span className="text-white font-semibold text-xs">
                {user?.name}
              </span>
            </AvatarFallback>
          </Avatar>
        
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.address}</p>
          </div>
      </div>
      </div>
    </div>
  );
};
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAllUsers } from '@/hooks/useContractData';
import { UserRole } from '@/types/contract';
import { cn } from '@/utils/cn';
import {
  Shield,
  Activity,
  Users,
  Crown,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

interface UserSidebarProps {
  isAdmin: boolean;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({ isAdmin }) => {
  const { data: users } = useAllUsers();

  const roleStats = React.useMemo(() => {
    if (!users) return [];

    const adminCount = users.filter(user => user.role === UserRole.Admin).length;
    const managerCount = users.filter(user => user.role === UserRole.Manager).length;
    const userCount = users.filter(user => user.role === UserRole.User).length;

    return [
      { role: "Users", count: userCount, color: "blue", icon: Users },
      { role: "Managers", count: managerCount, color: "emerald", icon: Shield },
      { role: "Admins", count: adminCount, color: "purple", icon: Crown },
    ];
  }, [users]);

  const activityStats = React.useMemo(() => {
    if (!users) return { active: 0, inactive: 0, suspended: 0 };

    const activeCount = users.filter(user => user.isActive).length;
    const inactiveCount = users.filter(user => !user.isActive).length;

    return {
      active: activeCount,
      inactive: inactiveCount,
      suspended: 0 // Not implemented in contract yet so default to 0
    };
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Role Distribution */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-slate-900">User Roles</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {roleStats.map((role, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      role.color === "blue" && "bg-blue-100 text-blue-600",
                      role.color === "emerald" && "bg-emerald-100 text-emerald-600",
                      role.color === "purple" && "bg-purple-100 text-purple-600",
                    )}
                  >
                    <role.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-slate-700">{role.role}</span>
                </div>
                <span className="text-lg font-bold text-slate-900">{role.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Overview */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-slate-900">Activity Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-emerald-700">Active</span>
              </div>
              <span className="text-lg font-bold text-emerald-900">{activityStats.active}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-700">Inactive</span>
              </div>
              <span className="text-lg font-bold text-amber-900">{activityStats.inactive}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-700">Suspended</span>
              </div>
              <span className="text-lg font-bold text-red-900">{activityStats.suspended}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
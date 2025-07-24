'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAllUsers } from '@/hooks/useContractData';
import { UserRole } from '@/types/contract';
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  Activity,
  TrendingUp,
  TrendingDown 
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const UserStats: React.FC = () => {
  const { data: users } = useAllUsers();

  const stats = React.useMemo(() => {
    if (!users) return null;

    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;
    const adminCount = users.filter(user => user.role === UserRole.Admin).length;
    const managerCount = users.filter(user => user.role === UserRole.Manager).length;

    return {
      totalUsers,
      activeUsers,
      adminCount,
      managerCount,
      inactiveUsers: totalUsers - activeUsers
    };
  }, [users]);

  const quickStats: Array<{
    title: string;
    value: string;
    subtitle: string;
    change: string;
    trend: "up" | "down" | "neutral";
    icon: any;
    color: "blue" | "emerald" | "purple" | "amber";
  }> = [
    {
      title: "Total Users",
      value: stats?.totalUsers.toString() || '0',
      subtitle: "Registered",
      change: "+2",
      trend: "up",
      icon: Users,
      color: "blue",
    },
    {
      title: "Active Users", 
      value: stats?.activeUsers.toString() || '0',
      subtitle: "Currently Active",
      change: "+1",
      trend: "up",
      icon: UserCheck,
      color: "emerald",
    },
    {
      title: "Administrators",
      value: stats?.adminCount.toString() || '0',
      subtitle: "Admin Users",
      change: "0",
      trend: "neutral",
      icon: DollarSign,
      color: "purple",
    },
    {
      title: "Managers",
      value: stats?.managerCount.toString() || '0',
      subtitle: "Manager Users", 
      change: "+1",
      trend: "up",
      icon: Activity,
      color: "amber",
    },
  ];

  const getStatColor = (color: string) => {
    switch (color) {
      case "blue":
        return "from-blue-50 to-blue-100 border-blue-200 text-blue-700";
      case "emerald":
        return "from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700";
      case "purple":
        return "from-purple-50 to-purple-100 border-purple-200 text-purple-700";
      case "amber":
        return "from-amber-50 to-amber-100 border-amber-200 text-amber-700";
      default:
        return "from-gray-50 to-gray-100 border-gray-200 text-gray-700";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {quickStats.map((stat, index) => (
        <Card
          key={index}
          className={cn(
            "bg-gradient-to-br border shadow-lg hover:shadow-xl transition-all duration-300",
            getStatColor(stat.color),
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium opacity-80">{stat.title}</p>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm opacity-70">{stat.subtitle}</p>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {stat.trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                  {stat.trend === "down" && <TrendingDown className="w-3 h-3 text-red-600" />}
                  <span
                    className={cn(
                      stat.trend === "up" && "text-emerald-600",
                      stat.trend === "down" && "text-red-600", 
                      stat.trend === "neutral" && "text-gray-600",
                    )}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}; 
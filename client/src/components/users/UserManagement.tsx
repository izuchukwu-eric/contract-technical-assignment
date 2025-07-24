'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAllUsers, useUpdateUserRole } from '@/hooks/useContractData';
import { UserRole } from '@/types/contract';
import { cn } from '@/utils/cn';
import { AddUserModal } from './AddUserModal';
import { RoleUpdateModal } from './RoleUpdateModal';
import { UserDetailsModal } from './UserDetailsModal';
import {
  Search,
  Plus,
  Users,
  Crown,
  Shield,
  Eye,
  Edit,
  Copy,
  Mail,
  Calendar,
} from 'lucide-react';

interface UserManagementProps {
  isAdmin: boolean;
}

export const UserManagement: React.FC<UserManagementProps> = ({ isAdmin }) => {
  const { data: users, isLoading } = useAllUsers();
  const updateRoleMutation = useUpdateUserRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [roleUpdateUser, setRoleUpdateUser] = useState<any>(null);

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.walletAddress.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || 
        (roleFilter === 'admin' && user.role === UserRole.Admin) ||
        (roleFilter === 'manager' && user.role === UserRole.Manager) ||
        (roleFilter === 'user' && user.role === UserRole.User);
      
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'inactive' && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const getRoleColor = (role: number) => {
    switch (role) {
      case UserRole.Admin:
        return "text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100";
      case UserRole.Manager:
        return "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100";
      case UserRole.User:
        return "text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200 hover:bg-gray-100";
    }
  };

    const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : "text-amber-700 bg-amber-50 border-amber-200";
  };

  const getRoleIcon = (role: number) => {
    switch (role) {
      case UserRole.Admin: return Crown;
      case UserRole.Manager: return Shield;
      case UserRole.User: return Users;
      default: return Users;
    }
  };

  const getRoleText = (role: number) => {
    switch (role) {
      case UserRole.Admin: return 'Admin';
      case UserRole.Manager: return 'Manager';
      case UserRole.User: return 'User';
      default: return 'Unknown';
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleUpdateRole = async (userAddress: string, newRole: number) => {
    try {
      await updateRoleMutation.mutateAsync({ userAddress, newRole });
      setRoleUpdateUser(null);
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-xl" />
              <div>
                <div className="h-6 bg-slate-200 rounded w-40 mb-1" />
                <div className="h-4 bg-slate-200 rounded w-20" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 border-b border-slate-100 last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-slate-200 rounded" />
                  <div className="w-12 h-12 bg-slate-200 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-32" />
                    <div className="h-3 bg-slate-200 rounded w-48" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">User Management</CardTitle>
              <p className="text-sm text-slate-600">({filteredUsers.length} total users)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedUsers.length > 0 && (
              <Button variant="outline" className="bg-white border-slate-200">
                Bulk Actions ({selectedUsers.length})
              </Button>
            )}
            {isAdmin && (
              <Button 
                onClick={() => setIsAddUserModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search users, names, or wallet addresses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40 bg-white border-slate-200">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all" className="cursor-pointer">All Roles</SelectItem>
                <SelectItem value="admin" className="cursor-pointer">Admins</SelectItem>
                <SelectItem value="manager" className="cursor-pointer">Managers</SelectItem>
                <SelectItem value="user" className="cursor-pointer">Users</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-white border-slate-200">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all" className="cursor-pointer">All Status</SelectItem>
                <SelectItem value="active" className="cursor-pointer">Active</SelectItem>
                <SelectItem value="inactive" className="cursor-pointer">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-0">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const RoleIcon = getRoleIcon(user.role);
              return (
                <div
                  key={user.walletAddress}
                  className="group p-6 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-300 border-b border-slate-100 last:border-b-0"
                >
                  <div className="space-y-4">
                    {/* Header Row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.walletAddress]);
                            } else {
                              setSelectedUsers(selectedUsers.filter((addr) => addr !== user.walletAddress));
                            }
                          }}
                        />
                        <Avatar className="w-12 h-12 border-2 border-slate-200">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg text-slate-900">{user.name}</h3>
                            <Badge className={cn("text-xs font-medium", getRoleColor(user.role))}>
                              <RoleIcon className="w-3 h-3 mr-1" />
                              {getRoleText(user.role)}
                            </Badge>
                            <Badge className={cn("text-xs font-medium", getStatusColor(user.isActive))}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {formatAddress(user.walletAddress)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details Row */}
                    <div className="ml-16 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs">{user.walletAddress}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleCopyAddress(user.walletAddress)}
                          className="h-6 w-6 p-0 cursor-pointer hover:bg-slate-200 transition-colors"
                          title="Copy wallet address"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-slate-500">Role</p>
                          <p className="font-medium text-slate-700">{getRoleText(user.role)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-500">Status</p>
                          <p className="font-medium text-slate-700">{user.isActive ? 'Active' : 'Inactive'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-500">Registered</p>
                          <p className="font-medium text-slate-700">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Joined {formatDate(user.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:shadow-md cursor-pointer"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRoleUpdateUser(user)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm hover:shadow-md cursor-pointer"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-slate-500 py-12">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="font-medium">No users found</p>
              <p className="text-sm text-slate-400">
                {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No users have been registered yet'
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Add User Modal */}
      <AddUserModal 
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
      />

      {/* Role Update Modal */}
      {roleUpdateUser && (
        <RoleUpdateModal
          user={roleUpdateUser}
          onClose={() => setRoleUpdateUser(null)}
          onUpdate={handleUpdateRole}
          isUpdating={updateRoleMutation.isPending}
        />
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </Card>
  );
}; 
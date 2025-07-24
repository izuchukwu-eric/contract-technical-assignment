'use client';

import React, { useState, useMemo } from 'react';
import { useAllUsers, useUpdateUserRole, useUserTransactions } from '@/hooks/useContractData';
import { useWeb3 } from '@/contexts/Web3Provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types/contract';
import { 
  Users, 
  Search, 
  Edit3, 
  Eye, 
  User,
  Shield,
  Crown,
  Mail,
  Calendar,
  Activity,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface UserListProps {
  isAdmin: boolean;
}

interface RoleUpdateModalProps {
  user: any;
  onClose: () => void;
  onUpdate: (userAddress: string, newRole: number) => void;
  isUpdating: boolean;
}

const RoleUpdateModal: React.FC<RoleUpdateModalProps> = ({
  user,
  onClose,
  onUpdate,
  isUpdating
}) => {
  const [selectedRole, setSelectedRole] = useState<number>(user.role);

  const getRoleInfo = (role: number) => {
    switch (role) {
      case UserRole.User:
        return {
          icon: <User className="h-4 w-4 text-blue-600" />,
          name: 'User',
          description: 'Can create transactions and view personal data',
          color: 'text-blue-600'
        };
      case UserRole.Manager:
        return {
          icon: <Shield className="h-4 w-4 text-green-600" />,
          name: 'Manager',
          description: 'Can approve transactions and manage operations',
          color: 'text-green-600'
        };
      case UserRole.Admin:
        return {
          icon: <Crown className="h-4 w-4 text-purple-600" />,
          name: 'Admin',
          description: 'Full system access and user management',
          color: 'text-purple-600'
        };
      default:
        return null;
    }
  };

  const handleSubmit = () => {
    if (selectedRole !== user.role) {
      onUpdate(user.walletAddress, selectedRole);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Update User Role</h3>
          <Button variant="outline" size="sm" onClick={onClose}>×</Button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">User Details</h4>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-600">Name:</span> {user.name}</p>
              <p><span className="text-gray-600">Email:</span> {user.email}</p>
              <p><span className="text-gray-600">Address:</span> <span className="font-mono text-xs">{user.walletAddress.slice(0, 10)}...</span></p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Select New Role</label>
            <div className="space-y-2">
              {[UserRole.User, UserRole.Manager, UserRole.Admin].map((role) => {
                const roleInfo = getRoleInfo(role);
                if (!roleInfo) return null;

                return (
                  <label
                    key={role}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedRole === role
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={selectedRole === role}
                      onChange={(e) => setSelectedRole(Number(e.target.value))}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2">
                      {roleInfo.icon}
                      <div>
                        <div className={`font-medium ${roleInfo.color}`}>
                          {roleInfo.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {roleInfo.description}
                        </div>
                      </div>
                    </div>
                    {selectedRole === role && (
                      <CheckCircle className="h-5 w-5 text-blue-600 ml-auto" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="flex-1"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              'Update Role'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const UserList: React.FC<UserListProps> = ({ isAdmin }) => {
  const { data: users, isLoading, error } = useAllUsers();
  const updateRoleMutation = useUpdateUserRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [roleUpdateUser, setRoleUpdateUser] = useState<any>(null);

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role.toString() === roleFilter);
    }

    return filtered;
  }, [users, searchTerm, roleFilter]);

  const getRoleInfo = (role: number) => {
    switch (role) {
      case UserRole.User:
        return {
          icon: <User className="h-4 w-4 text-blue-600" />,
          name: 'User',
          color: 'bg-blue-100 text-blue-800'
        };
      case UserRole.Manager:
        return {
          icon: <Shield className="h-4 w-4 text-green-600" />,
          name: 'Manager',
          color: 'bg-green-100 text-green-800'
        };
      case UserRole.Admin:
        return {
          icon: <Crown className="h-4 w-4 text-purple-600" />,
          name: 'Admin',
          color: 'bg-purple-100 text-purple-800'
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4 text-gray-600" />,
          name: 'Unknown',
          color: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-48" />
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Failed to load users</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users
            <span className="text-sm font-normal text-gray-500">
              ({filteredUsers.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="0">Users</option>
              <option value="1">Managers</option>
              <option value="2">Admins</option>
            </select>
          </div>

          {/* User List */}
          <div className="space-y-3">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                
                return (
                  <div
                    key={user.walletAddress}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium">{user.name}</span>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                          {roleInfo.icon}
                          {roleInfo.name}
                        </div>
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <div className="h-1.5 w-1.5 bg-gray-500 rounded-full" />
                            Inactive
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{formatAddress(user.walletAddress)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Joined {formatDate(user.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRoleUpdateUser(user)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">User Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUser(null)}
              >×</Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-sm">{selectedUser.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-sm">{selectedUser.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Wallet Address</label>
                <p className="text-sm font-mono">{selectedUser.walletAddress}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Role</label>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleInfo(selectedUser.role).color}`}>
                  {getRoleInfo(selectedUser.role).icon}
                  {getRoleInfo(selectedUser.role).name}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className="text-sm">{selectedUser.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Registered</label>
                <p className="text-sm">{formatDate(selectedUser.createdAt)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">User ID</label>
                <p className="text-sm">#{Number(selectedUser.id)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 
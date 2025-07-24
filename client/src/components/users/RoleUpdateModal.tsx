'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types/contract';
import { cn } from '@/utils/cn';
import {
  User,
  Crown,
  Shield,
  Edit,
  CheckCircle,
  Loader2,
  X
} from 'lucide-react';

interface RoleUpdateModalProps {
  user: any;
  onClose: () => void;
  onUpdate: (userAddress: string, newRole: number) => void;
  isUpdating: boolean;
}

export const RoleUpdateModal: React.FC<RoleUpdateModalProps> = ({
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
          icon: <User className="h-4 w-4" />,
          name: 'User',
          description: 'Can create transactions and view personal data',
          color: 'bg-blue-100 text-blue-700 border-blue-200'
        };
      case UserRole.Manager:
        return {
          icon: <Shield className="h-4 w-4" />,
          name: 'Manager',
          description: 'Can approve transactions and manage operations',
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        };
      case UserRole.Admin:
        return {
          icon: <Crown className="h-4 w-4" />,
          name: 'Admin',
          description: 'Full system access and user management',
          color: 'bg-purple-100 text-purple-700 border-purple-200'
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
        aria-label="Close modal"
      />
      
      <Card className="relative bg-white shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="flex items-center justify-between text-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Edit className="w-4 h-4 text-white" />
              </div>
              Update User Role
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-slate-600 cursor-pointer hover:text-slate-900 hover:bg-slate-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium mb-3 text-slate-900">User Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Name:</span>
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Address:</span>
                  <span className="font-mono text-xs">{user.walletAddress.slice(0, 10)}...</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-700">Select New Role</label>
              <div className="space-y-3">
                {[UserRole.User, UserRole.Manager, UserRole.Admin].map((role) => {
                  const roleInfo = getRoleInfo(role);
                  if (!roleInfo) return null;

                  return (
                    <label
                      key={role}
                      className={cn(
                        "flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md",
                        selectedRole === role
                          ? "border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      )}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={selectedRole === role}
                        onChange={(e) => setSelectedRole(Number(e.target.value))}
                        className="sr-only"
                      />
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        selectedRole === role ? roleInfo.color : "bg-slate-100 text-slate-600"
                      )}>
                        {roleInfo.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 mb-1">
                          {roleInfo.name}
                        </div>
                        <p className="text-sm text-slate-600">
                          {roleInfo.description}
                        </p>
                      </div>
                      {selectedRole === role && (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 cursor-pointer"
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isUpdating}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
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
        </CardContent>
      </Card>
    </div>
  );
}; 
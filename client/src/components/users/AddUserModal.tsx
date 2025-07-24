'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegisterUser } from '@/hooks/useContractData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { registerUserSchema, type RegisterUserFormData } from '@/lib/schemas';
import { cn } from '@/utils/cn';
import { 
  UserPlus, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  User,
  Shield,
  Crown,
  X,
  Mail,
  Wallet
} from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
  const registerUserMutation = useRegisterUser();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegisterUserFormData>({
    resolver: zodResolver(registerUserSchema),
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterUserFormData) => {
    try {
      await registerUserMutation.mutateAsync({
        walletAddress: data.walletAddress,
        name: data.name,
        email: data.email,
        role: parseInt(data.role),
      });
      reset();
      onClose();
    } catch (error) {
      console.error('User registration failed:', error);
    }
  };

  const getRoleInfo = (roleValue: string) => {
    switch (roleValue) {
      case '0':
        return {
          icon: <User className="h-4 w-4" />,
          name: 'User',
          description: 'Can create transactions and view personal data',
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          iconColor: 'text-blue-600'
        };
      case '1':
        return {
          icon: <Shield className="h-4 w-4" />,
          name: 'Manager',
          description: 'Can approve transactions and manage operations',
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          iconColor: 'text-emerald-600'
        };
      case '2':
        return {
          icon: <Crown className="h-4 w-4" />,
          name: 'Admin',
          description: 'Full system access and user management',
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          iconColor: 'text-purple-600'
        };
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
        aria-label="Close modal"
      />
      
      <Card className="relative bg-white shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="flex items-center justify-between text-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-white" />
              </div>
              Add New User
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="walletAddress" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Wallet Address *
                </label>
                <Input
                  id="walletAddress"
                  type="text"
                  placeholder="0x..."
                  className={cn(
                    "bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500",
                    errors.walletAddress && "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                  {...register('walletAddress')}
                />
                {errors.walletAddress && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.walletAddress.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name *
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className={cn(
                    "bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500",
                    errors.name && "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address *
              </label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                className={cn(
                  "bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500",
                  errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-700">
                User Role *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {['0', '1', '2'].map((roleValue) => {
                  const roleInfo = getRoleInfo(roleValue);
                  if (!roleInfo) return null;

                  return (
                    <label
                      key={roleValue}
                      className={cn(
                        "flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md",
                        selectedRole === roleValue
                          ? "border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      )}
                    >
                      <input
                        type="radio"
                        value={roleValue}
                        className="sr-only"
                        {...register('role')}
                      />
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        selectedRole === roleValue ? roleInfo.color : "bg-slate-100 text-slate-600"
                      )}>
                        {roleInfo.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900">
                            {roleInfo.name}
                          </span>
                          <Badge className={cn("text-xs", roleInfo.color)}>
                            {roleInfo.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          {roleInfo.description}
                        </p>
                      </div>
                      {selectedRole === roleValue && (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </label>
                  );
                })}
              </div>
              {errors.role && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.role.message}
                </p>
              )}
            </div>

            {registerUserMutation.error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">
                  {registerUserMutation.error.message || 'Failed to register user'}
                </p>
              </div>
            )}

            {registerUserMutation.isSuccess && (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-700">
                  User registered successfully!
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 cursor-pointer"
                disabled={isSubmitting || registerUserMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || registerUserMutation.isPending}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {isSubmitting || registerUserMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating User...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create User
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegisterUser } from '@/hooks/useContractData';
import { useWeb3 } from '@/contexts/Web3Provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { registerUserSchema, type RegisterUserFormData } from '@/lib/schemas';
import { UserRole } from '@/types/contract';
import { 
  UserPlus, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  User,
  Shield,
  Crown
} from 'lucide-react';

interface UserRegistrationFormProps {
  isAdmin: boolean;
}

export const UserRegistrationForm: React.FC<UserRegistrationFormProps> = ({ isAdmin }) => {
  const { isConnected } = useWeb3();
  const registerUserMutation = useRegisterUser();
  const [isExpanded, setIsExpanded] = useState(false);

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
      setIsExpanded(false);
    } catch (error) {
      console.error('User registration failed:', error);
    }
  };

  const getRoleInfo = (roleValue: string) => {
    switch (roleValue) {
      case '0':
        return {
          icon: <User className="h-4 w-4 text-blue-600" />,
          name: 'User',
          description: 'Can create transactions and view personal data',
          color: 'text-blue-600'
        };
      case '1':
        return {
          icon: <Shield className="h-4 w-4 text-green-600" />,
          name: 'Manager',
          description: 'Can approve transactions and manage operations',
          color: 'text-green-600'
        };
      case '2':
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

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Admin access required to register users</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Connect your wallet to register users</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isExpanded) {
    return (
      <Card>
        <CardContent className="p-6">
          <Button 
            onClick={() => setIsExpanded(true)}
            className="w-full flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Register New User
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Register New User
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsExpanded(false)}
          >
            Cancel
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="walletAddress" className="text-sm font-medium text-gray-700">
                Wallet Address *
              </label>
              <input
                id="walletAddress"
                type="text"
                placeholder="0x..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.walletAddress ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('walletAddress')}
              />
              {errors.walletAddress && (
                <p className="text-sm text-red-600">{errors.walletAddress.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              placeholder="john@example.com"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              User Role *
            </label>
            <div className="space-y-3">
              {['0', '1', '2'].map((roleValue) => {
                const roleInfo = getRoleInfo(roleValue);
                if (!roleInfo) return null;

                return (
                  <label
                    key={roleValue}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedRole === roleValue
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={roleValue}
                      className="sr-only"
                      {...register('role')}
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
                    {selectedRole === roleValue && (
                      <CheckCircle className="h-5 w-5 text-blue-600 ml-auto" />
                    )}
                  </label>
                );
              })}
            </div>
            {errors.role && (
              <p className="text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          {registerUserMutation.error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600">
                {registerUserMutation.error.message || 'Failed to register user'}
              </p>
            </div>
          )}

          {registerUserMutation.isSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-600">
                User registered successfully!
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || registerUserMutation.isPending}
              className="flex-1"
            >
              {isSubmitting || registerUserMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register User
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 
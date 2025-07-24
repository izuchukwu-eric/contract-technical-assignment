'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { parseEther } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/contexts/Web3Provider';
import { createTransactionSchema, type CreateTransactionFormData } from '@/lib/schemas';
import { Plus, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

export const CreateTransactionForm: React.FC = () => {
  const { contract, isConnected } = useWeb3();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateTransactionFormData>({
    resolver: zodResolver(createTransactionSchema),
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: CreateTransactionFormData) => {
      if (!contract) throw new Error('Contract not available');
      
      const amountInWei = parseEther(data.amount);
      const tx = await contract.createTransaction(data.to, amountInWei, data.description);
      await tx.wait();
      return tx;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
      reset();
      setIsModalOpen(false);
    },
  });

  const onSubmit = async (data: CreateTransactionFormData) => {
    try {
      await createTransactionMutation.mutateAsync(data);
    } catch (error) {
      console.error('Transaction creation failed:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
    createTransactionMutation.reset();
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  if (!isConnected) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Connect your wallet to create transactions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Create New Transaction Button */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gradient-to-r cursor-pointer from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Transaction
          </Button>
        </CardContent>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed h-full inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div 
            className="fixed inset-0" 
            onClick={closeModal}
            aria-label="Close modal"
          />
          
          <Card className="relative bg-white shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="flex items-center justify-between text-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  Create New Transaction
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={closeModal}
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="to" className="text-sm font-medium text-slate-700">
                      Recipient Address *
                    </label>
                    <input
                      id="to"
                      type="text"
                      placeholder="0x..."
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 ${
                        errors.to ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'
                      }`}
                      {...register('to')}
                    />
                    {errors.to && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.to.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-medium text-slate-700">
                      Amount (ETH) *
                    </label>
                    <input
                      id="amount"
                      type="text"
                      placeholder="0.1"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 ${
                        errors.amount ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'
                      }`}
                      {...register('amount')}
                    />
                    {errors.amount && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.amount.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium text-slate-700">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Enter transaction description..."
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 resize-none ${
                      errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'
                    }`}
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {createTransactionMutation.error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">
                      {createTransactionMutation.error.message || 'Failed to create transaction'}
                    </p>
                  </div>
                )}

                {createTransactionMutation.isSuccess && (
                  <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-700">
                      Transaction created successfully!
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <Button
                    type="submit"
                    disabled={isSubmitting || createTransactionMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isSubmitting || createTransactionMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating Transaction...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Transaction
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}; 
import { z } from 'zod';

export const createTransactionSchema = z.object({
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
});

export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;

export const registerUserSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['0', '1', '2'], { message: 'Please select a role' }),
});

export type RegisterUserFormData = z.infer<typeof registerUserSchema>;

export const processApprovalSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason too long'),
});

export type ProcessApprovalFormData = z.infer<typeof processApprovalSchema>;
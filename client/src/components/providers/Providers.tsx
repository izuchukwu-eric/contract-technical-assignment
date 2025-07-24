'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Web3Provider } from '@/contexts/Web3Provider';
import { ReactNode, useState } from 'react';

export const Providers: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        {children}
      </Web3Provider>
    </QueryClientProvider>
  );
};
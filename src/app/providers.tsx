'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useTaxpayerStore } from '@/store/useTaxpayerStore';

export default function Providers({ children }: { children: ReactNode }) {
  const clearStore = useTaxpayerStore((state) => state.clearStore);
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // Data dianggap segar selama 5 menit
        retry: 1,
      },
    },
  }));

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearStore();
        queryClient.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, [clearStore, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

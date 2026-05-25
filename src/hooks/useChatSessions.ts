import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function isMissingChatTable(error: { code?: string; message?: string } | null) {
  const message = String(error?.message || '');
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    message.includes('Could not find the table') ||
    message.includes("Could not find the table 'public.chat_sessions'")
  );
}

export function useFetchChatSessions() {
  return useQuery<ChatSession[]>({
    queryKey: ['chat_sessions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        if (isMissingChatTable(error)) {
          throw new Error('Tabel chat_sessions belum dibuat.');
        }
        throw new Error(error.message);
      }
      return data as ChatSession[];
    },
  });
}

export function useCreateChatSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (title: string = 'Percakapan Baru') => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthenticated');

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        if (isMissingChatTable(error)) {
          throw new Error('Tabel chat_sessions belum dibuat. Jalankan migrasi Fase 6 terlebih dahulu.');
        }
        throw new Error(error.message);
      }
      return data as ChatSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_sessions'] });
    }
  });
}

export function useUpdateChatSessionTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title }: { id: string, title: string }) => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data as ChatSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_sessions'] });
    }
  });
}

export function useDeleteChatSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', id);
        
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['chat_sessions'] });
      // Remove related messages cache
      queryClient.removeQueries({ queryKey: ['chat_messages', id] });
    }
  });
}

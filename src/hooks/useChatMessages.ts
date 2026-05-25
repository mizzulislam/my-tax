import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  metadata: Record<string, string | number | boolean | null>;
  created_at: string;
}

function isMissingChatTable(error: { code?: string; message?: string } | null) {
  const message = String(error?.message || '');
  return (
    error?.code === '42P01' ||
    error?.code === 'PGRST205' ||
    message.includes('Could not find the table')
  );
}

export function useFetchChatMessages(sessionId: string | null) {
  return useQuery<ChatMessage[]>({
    queryKey: ['chat_messages', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        if (isMissingChatTable(error)) {
          return []; // Skip if table doesn't exist yet
        }
        throw new Error(error.message);
      }
      return data as ChatMessage[];
    },
    enabled: !!sessionId,
  });
}

export function useCreateChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { session_id: string, role: 'user'|'ai'|'system', content: string, metadata?: Record<string, string | number | boolean | null> }) => {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: payload.session_id,
          role: payload.role,
          content: payload.content,
          metadata: payload.metadata || {}
        })
        .select()
        .single();
      
      if (error) {
        if (isMissingChatTable(error)) {
          throw new Error('Tabel chat_messages belum dibuat. Jalankan migrasi Fase 6 terlebih dahulu.');
        }
        throw new Error(error.message);
      }

      // Update the updated_at timestamp of the session to bump it up in the sidebar
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', payload.session_id);

      return data as ChatMessage;
    },
    onSuccess: (data) => {
      // Invalidate messages for this session
      queryClient.invalidateQueries({ queryKey: ['chat_messages', data.session_id] });
      // Invalidate sessions to update ordering/timestamps
      queryClient.invalidateQueries({ queryKey: ['chat_sessions'] });
    }
  });
}

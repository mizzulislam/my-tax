import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface NotificationData {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function useFetchNotifications() {
  return useQuery<NotificationData[]>({
    queryKey: ['notifications_list'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // Mencegah crash jika tabel belum dibuat di Supabase
        if (
          error.message.includes('relation "public.notifications" does not exist') || 
          error.message.includes('relation "notifications" does not exist') || 
          error.code === '42P01' || 
          error.code === 'P0001'
        ) {
          console.warn('Tabel notifications belum dimigrasikan.');
          return [];
        }
        throw new Error(error.message);
      }
      return data as NotificationData[];
    },
    refetchInterval: 10000, // Sync otomatis setiap 10 detik secara real-time
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications_list'] });
    },
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; message: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Pengguna tidak terautentikasi.');

      // Mencegah duplikasi spam notifikasi sejenis dalam 24 jam terakhir
      const { data: existing, error: checkError } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('title', payload.title)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (checkError) {
        if (checkError.code === '42P01') return; // Abaikan jika tabel tidak ada
        throw checkError;
      }

      if (existing && existing.length > 0) {
        return; // Sudah diingatkan dalam 24 jam terakhir
      }

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: payload.title,
          message: payload.message,
          is_read: false,
        });

      if (error) {
        if (error.code === '42P01') return;
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications_list'] });
    },
  });
}

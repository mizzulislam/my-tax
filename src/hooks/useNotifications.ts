import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface NotificationData {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  notification_type: string;
  priority: string;
  action_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function useFetchNotifications() {
  const queryClient = useQueryClient();

  // 1. Fetch initial data
  const queryInfo = useQuery<NotificationData[]>({
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
        if (
          error.message.includes('does not exist') || 
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
  });

  // 2. Setup Realtime Subscription
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase.channel(`realtime_notifications_${user.id}_${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Realtime Notification Received:', payload);
            const newNotif = payload.new as NotificationData;
            
            // Perbarui cache React Query
            queryClient.setQueryData<NotificationData[]>(['notifications_list'], (oldData) => {
              if (!oldData) return [newNotif];
              // Cegah duplikasi
              if (oldData.find(n => n.id === newNotif.id)) return oldData;
              return [newNotif, ...oldData];
            });

            // Picu Browser API Notification jika didukung dan prioritas tinggi
            if (
              typeof window !== 'undefined' && 
              'Notification' in window && 
              Notification.permission === 'granted' &&
              ['high', 'urgent'].includes(newNotif.priority)
            ) {
              new Notification(newNotif.title, {
                body: newNotif.message,
                icon: '/favicon.ico', // Sesuaikan icon app
              });
            }
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [queryClient]);

  return queryInfo;
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
    mutationFn: async (payload: { 
      title: string; 
      message: string;
      notification_type?: string;
      priority?: string;
      action_url?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Pengguna tidak terautentikasi.');

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: payload.title,
          message: payload.message,
          is_read: false,
          notification_type: payload.notification_type || 'system',
          priority: payload.priority || 'normal',
          action_url: payload.action_url || null,
          metadata: payload.metadata || {},
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

import { supabase } from '@/lib/supabase';

// Helper function to check existing unread notifications to avoid spamming
async function hasRecentNotification(userId: string, title: string): Promise<boolean> {
  const { data } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', userId)
    .eq('title', title)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(1);
    
  return (data && data.length > 0) || false;
}

export async function runAutomaticReminders() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load User Notification Preferences
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // If push notification is disabled entirely in preferences, stop. 
    // (Assuming this handles internal app notifications too for simplicity, or we can just respect it for specific types).
    // Let's assume we still show internal system notifications but respect preferences for marketing/spam.
    
    const reminderDays = prefs?.deadline_reminder_days || 3;

    // 1. Cek Kelengkapan Profil Wajib Pajak
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      const isIncomplete = 
        !profile.occupation || 
        !profile.marital_status || 
        profile.dependents === null;

      if (isIncomplete) {
        const title = 'Profil Pajak Belum Lengkap';
        if (!(await hasRecentNotification(user.id, title))) {
          await supabase.from('notifications').insert({
            user_id: user.id,
            title,
            message: 'Lengkapi profil Wajib Pajak Anda (pekerjaan, status pernikahan, & tanggungan) di halaman Pengaturan Profil untuk personalisasi AI yang akurat!',
            notification_type: 'system',
            priority: 'normal',
            action_url: '/dashboard/profile'
          });
        }
      }
    }

    // 2. Cek Tanggal Batas Jatuh Tempo Pajak
    const today = new Date();
    const dateOfMonth = today.getDate();
    const currentMonth = today.getMonth(); // 0 = Jan, 2 = Mar, 3 = Apr

    // Deadline Masa (tanggal 20)
    // Ingatkan H-`reminderDays` (misal H-3 = tgl 17, 18, 19, 20)
    if (dateOfMonth >= (20 - reminderDays) && dateOfMonth <= 20) {
      const title = 'Reminder Pajak Masa Bulanan';
      if (!(await hasRecentNotification(user.id, title))) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          title,
          message: `Batas akhir pelaporan dan penyetoran pajak Masa adalah tanggal 20! Segera siapkan dokumen bulan ini.`,
          notification_type: 'deadline',
          priority: dateOfMonth === 20 ? 'urgent' : 'high',
          action_url: '/dashboard'
        });
      }
    }

    // Deadline Tahunan OP (31 Maret)
    if (currentMonth === 2 && dateOfMonth >= (31 - reminderDays)) {
      const title = 'Batas Lapor SPT Tahunan (OP)';
      if (!(await hasRecentNotification(user.id, title))) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          title,
          message: 'Batas akhir pelaporan SPT Tahunan Wajib Pajak Orang Pribadi adalah 31 Maret. Segera lapor agar terhindar dari denda!',
          notification_type: 'deadline',
          priority: 'urgent',
          action_url: '/dashboard'
        });
      }
    }

    // Deadline Tahunan Badan (30 April)
    if (currentMonth === 3 && dateOfMonth >= (30 - reminderDays)) {
      const title = 'Batas Lapor SPT Tahunan (Badan)';
      if (!(await hasRecentNotification(user.id, title))) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          title,
          message: 'Batas akhir pelaporan SPT Tahunan Wajib Pajak Badan adalah 30 April. Pastikan pembukuan telah selesai direkap.',
          notification_type: 'deadline',
          priority: 'urgent',
          action_url: '/dashboard'
        });
      }
    }

  } catch (err) {
    console.error('Gagal memproses notifikasi pengingat otomatis:', err);
  }
}

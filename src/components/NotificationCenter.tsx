'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  useFetchNotifications, 
  useMarkAsRead, 
  useCreateNotification 
} from '@/hooks/useNotifications';

export default function NotificationCenter() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: notifications = [], isLoading } = useFetchNotifications();
  const markAsRead = useMarkAsRead();
  const createNotification = useCreateNotification();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // RUNTIME REMINDER TAX Deadline & Profile Completion Checker (FR-14)
  useEffect(() => {
    const runAutomaticReminders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

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
            createNotification.mutate({
              title: 'Profil Pajak Belum Lengkap',
              message: 'Lengkapi profil Wajib Pajak Anda (pekerjaan, status pernikahan, & tanggungan) di halaman Pengaturan Profil untuk personalisasi AI yang akurat!',
            });
          }
        }

        // 2. Cek Tanggal Batas Jatuh Tempo Pajak
        const today = new Date();
        const dateOfMonth = today.getDate();
        const currentMonth = today.getMonth(); // 0 = Jan, 2 = Mar, 3 = Apr

        // Deadline pelaporan bulanan/Masa (setiap tanggal 20)
        if (dateOfMonth >= 15 && dateOfMonth <= 20) {
          createNotification.mutate({
            title: 'Reminder Pajak Masa Bulanan',
            message: `Tanggal saat ini (${dateOfMonth} ${today.toLocaleDateString('id-ID', { month: 'long' })}). Ingat, batas akhir pelaporan dan penyetoran pajak Masa adalah tanggal 20!`,
          });
        }

        // Deadline pelaporan SPT Tahunan OP (Maret - 31 Maret)
        if (currentMonth === 2) { // Maret
          createNotification.mutate({
            title: 'Batas SPT Tahunan Orang Pribadi',
            message: 'Bulan Maret telah tiba! Batas akhir pelaporan SPT Tahunan Wajib Pajak Orang Pribadi adalah tanggal 31 Maret. Segera laporkan kalkulasi Anda!',
          });
        }

        // Deadline pelaporan SPT Tahunan Badan (April - 30 April)
        if (currentMonth === 3) { // April
          createNotification.mutate({
            title: 'Batas SPT Tahunan Badan',
            message: 'Bulan April telah tiba! Batas akhir pelaporan SPT Tahunan Wajib Pajak Badan adalah tanggal 30 April. Pastikan data keuangan perusahaan Anda siap!',
          });
        }
      } catch (err) {
        console.error('Gagal memproses notifikasi pengingat otomatis:', err);
      }
    };

    // Jalankan pengingat otomatis saat component di-mount
    const timeout = setTimeout(() => {
      runAutomaticReminders();
    }, 3000); // Tunggu 3 detik setelah memuat agar transisi halaman mulus

    return () => clearTimeout(timeout);
  }, []);

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    unread.forEach((n) => {
      markAsRead.mutate(n.id);
    });
  };

  return (
    <div className="relative z-40">
      {/* BELL BELL BELL ICON WITH UNREAD BADGE */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative p-2.5 bg-slate-900 border border-slate-800/40 text-slate-300 rounded-xl hover:bg-slate-800 hover:text-white transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 flex items-center justify-center shadow-lg cursor-pointer"
        aria-label="Notifikasi Perpajakan"
      >
        <svg className={`w-5 h-5 ${unreadCount > 0 ? 'animate-[swing_1.5s_ease-in-out_infinite] text-yellow-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.02 6.02 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1.5 flex items-center justify-center bg-red-500 text-[10px] font-black text-white rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] border border-slate-950 animate-pulse font-mono">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN GLASSMORPHIC POPOVER LIST */}
      {dropdownOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div 
            onClick={() => setDropdownOpen(false)}
            className="fixed inset-0 z-40 bg-transparent"
          />

          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-950/95 backdrop-blur-2xl border border-slate-800/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-250">
            {/* Header */}
            <div className="p-5 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/40">
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">Notifikasi Sistem</h4>
                <p className="text-[10px] text-slate-500 font-medium">Pengingat & pembaruan status pajak Anda</p>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] font-extrabold text-blue-400 hover:text-blue-300 uppercase tracking-wider transition-colors focus:outline-none"
                >
                  Tandai Semua Dibaca
                </button>
              )}
            </div>

            {/* Notifications Body */}
            <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-900/60 custom-scrollbar">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border border-blue-500 border-t-transparent"></div>
                  Memuat notifikasi...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-3 border border-slate-800/50">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
                    </svg>
                  </div>
                  <h5 className="text-xs font-bold text-slate-400 mb-1">Semua Bersih</h5>
                  <p className="text-[10px] text-slate-500 max-w-[200px]">Belum ada notifikasi baru untuk Anda saat ini.</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-4.5 transition-all relative flex gap-3 hover:bg-slate-900/30 ${!item.is_read ? 'bg-blue-500/5 border-l-2 border-blue-500' : ''}`}
                  >
                    {/* Glowing blue dot if unread */}
                    {!item.is_read && (
                      <span className="absolute top-4.5 right-4 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    )}

                    {/* Icon Category Indicator */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${!item.is_read ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-slate-900 border-slate-800/40 text-slate-500'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>

                    <div className="space-y-1 pr-4">
                      <p className={`text-xs font-bold leading-tight ${!item.is_read ? 'text-white' : 'text-slate-300'}`}>
                        {item.title}
                      </p>
                      
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                        {item.message}
                      </p>

                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-[9px] text-slate-500 font-semibold font-mono">
                          {new Date(item.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        {!item.is_read && (
                          <button
                            onClick={() => markAsRead.mutate(item.id)}
                            className="text-[9px] text-blue-400 hover:text-blue-300 font-extrabold uppercase tracking-wider"
                          >
                            Tandai Dibaca
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

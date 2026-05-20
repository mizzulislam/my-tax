'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taxpayerProfileSchema, TaxpayerProfile } from '@/types/taxpayer';
import { useMutateProfile } from '@/hooks/useMutateProfile';
import { supabase } from '@/lib/supabase';
import { useTaxpayerStore } from '@/store/useTaxpayerStore';
import Link from 'next/link';

export default function ProfileSettingsPage() {
  const { mutate, isPending, error: mutationError } = useMutateProfile();
  const setProfile = useTaxpayerStore((state) => state.setProfile);
  const currentProfile = useTaxpayerStore((state) => state.profile);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaxpayerProfile>({
    resolver: zodResolver(taxpayerProfileSchema),
    defaultValues: {
      fullName: '',
      taxpayerType: 'pribadi',
      nik: '',
      npwp: '',
      phoneNumber: '',
      occupation: '',
      education: 'S1',
      maritalStatus: 'TK',
      dependents: 0,
      hobbies: '',
    },
  });

  // Fetch data profil dari database
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const profileData: TaxpayerProfile = {
            fullName: data.full_name || '',
            taxpayerType: (data.taxpayer_type as 'pribadi' | 'badan') || 'pribadi',
            nik: data.nik || '',
            npwp: data.npwp || '',
            phoneNumber: data.phone_number || '',
            occupation: data.occupation || '',
            education: data.education || 'S1',
            maritalStatus: data.marital_status || 'TK',
            dependents: data.dependents !== undefined ? data.dependents : 0,
            hobbies: data.hobbies || '',
          };
          
          reset(profileData);
          setProfile(profileData);
        }
      } catch (err: any) {
        console.error('Gagal mengambil data profil:', err.message);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [reset, setProfile]);

  const onSubmit = (data: TaxpayerProfile) => {
    setSuccessMsg(null);
    mutate(data, {
      onSuccess: () => {
        setSuccessMsg('Profil Wajib Pajak Anda berhasil diperbarui di database & Zustand store!');
        setTimeout(() => setSuccessMsg(null), 5000);
      },
    });
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="relative flex justify-center items-center">
          <div className="absolute animate-ping w-16 h-16 rounded-full bg-blue-500/20"></div>
          <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500/30 overflow-hidden relative">
      {/* Background Decorative Circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12 lg:px-24">
        
        {/* Header */}
        <header className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
              Pengaturan <span className="text-blue-500">Profil</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-lg">
              Kelola data identitas dan kustomisasi wajib pajak Anda demi menunjang personalisasi asisten AI.
            </p>
          </div>
          
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl transition-all font-medium text-sm self-start sm:self-center shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Kembali ke Dasbor
          </Link>
        </header>

        {successMsg && (
          <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 rounded-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
            {successMsg}
          </div>
        )}

        {mutationError && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-sm text-red-400 rounded-2xl backdrop-blur-md">
            {mutationError.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Bagian Kiri: Identitas Utama */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-white tracking-tight border-b border-slate-800/80 pb-4">
              Identitas Wajib Pajak Utama
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Nama Lengkap</label>
              <input
                {...register('fullName')}
                className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="Sesuai KTP"
              />
              {errors.fullName && <p className="text-xs text-red-400 font-medium">{errors.fullName.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Jenis Wajib Pajak</label>
                <select
                  {...register('taxpayerType')}
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm appearance-none"
                >
                  <option value="pribadi">Orang Pribadi</option>
                  <option value="badan">Badan / Perusahaan</option>
                </select>
                {errors.taxpayerType && <p className="text-xs text-red-400 font-medium">{errors.taxpayerType.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Nomor Telepon</label>
                <input
                  {...register('phoneNumber')}
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm font-mono"
                  placeholder="081234567890"
                />
                {errors.phoneNumber && <p className="text-xs text-red-400 font-medium">{errors.phoneNumber.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">NIK (16 Digit KTP)</label>
              <input
                {...register('nik')}
                maxLength={16}
                className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm tracking-widest font-mono"
                placeholder="3171xxxxxxxxxxxx"
              />
              {errors.nik && <p className="text-xs text-red-400 font-medium">{errors.nik.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">NPWP (15/16 Digit)</label>
              <input
                {...register('npwp')}
                maxLength={16}
                className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm tracking-widest font-mono"
                placeholder="Hanya angka tanpa spasi/tanda baca"
              />
              {errors.npwp && <p className="text-xs text-red-400 font-medium">{errors.npwp.message}</p>}
            </div>
          </div>

          {/* Bagian Kanan: Profil Tambahan FR-03 (Personalisasi AI) */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-white tracking-tight border-b border-slate-800/80 pb-4">
              Kustomisasi & Personalisasi AI (FR-03)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Pekerjaan</label>
                <input
                  {...register('occupation')}
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="Contoh: Software Engineer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Pendidikan Terakhir</label>
                <select
                  {...register('education')}
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm appearance-none"
                >
                  <option value="SMA/SMK">SMA / SMK / Sederajat</option>
                  <option value="D3">Diploma (D3)</option>
                  <option value="S1">Sarjana (S1)</option>
                  <option value="S2">Magister (S2)</option>
                  <option value="S3">Doktor (S3)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Status Pernikahan</label>
                <select
                  {...register('maritalStatus')}
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm appearance-none"
                >
                  <option value="TK">TK - Belum Kawin</option>
                  <option value="K">K - Kawin</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Jumlah Tanggungan</label>
                <input
                  type="number"
                  {...register('dependents', { valueAsNumber: true })}
                  min={0}
                  max={10}
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm font-mono"
                />
                {errors.dependents && <p className="text-xs text-red-400 font-medium">{errors.dependents.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Hobi / Minat Utama</label>
              <textarea
                {...register('hobbies')}
                rows={3}
                className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm resize-none"
                placeholder="Tuliskan minat Anda (misal: Investasi Kripto, Memasak, Otomotif) untuk memudahkan visualisasi contoh kasus oleh asisten AI"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="relative w-full overflow-hidden rounded-xl bg-blue-600 px-4 py-4 font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-50 outline-none group/btn mt-4 text-sm uppercase tracking-wider"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
              {isPending ? 'Sedang Memperbarui...' : 'Simpan Perubahan'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

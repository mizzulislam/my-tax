'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taxpayerProfileSchema, TaxpayerProfile } from '@/types/taxpayer';
import { useMutateProfile } from '@/hooks/useMutateProfile';
import { useRouter } from 'next/navigation';

export default function TaxpayerForm() {
  const router = useRouter();
  const { mutate, isPending, error: mutationError } = useMutateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaxpayerProfile>({
    resolver: zodResolver(taxpayerProfileSchema),
    defaultValues: {
      fullName: '',
      taxpayerType: 'pribadi',
      nik: '',
      npwp: '',
      phoneNumber: '',
    },
  });

  const onSubmit = (data: TaxpayerProfile) => {
    mutate(data, {
      onSuccess: () => {
        router.push('/dashboard');
      },
    });
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[24px] p-8 shadow-2xl relative z-10 w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Nama Lengkap</label>
          <input
            {...register('fullName')}
            className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
            placeholder="Sesuai KTP"
          />
          {errors.fullName && <p className="text-xs text-red-400 font-medium">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Jenis Wajib Pajak</label>
          <select
            {...register('taxpayerType')}
            className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none"
          >
            <option value="pribadi">Orang Pribadi</option>
            <option value="badan">Badan / Perusahaan</option>
          </select>
          {errors.taxpayerType && <p className="text-xs text-red-400 font-medium">{errors.taxpayerType.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">NIK (16 Digit)</label>
          <input
            {...register('nik')}
            maxLength={16}
            className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all tracking-widest font-mono"
            placeholder="3171xxxxxxxxxxxx"
          />
          {errors.nik && <p className="text-xs text-red-400 font-medium">{errors.nik.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">NPWP (15/16 Digit)</label>
          <input
            {...register('npwp')}
            maxLength={16}
            className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all tracking-widest font-mono"
            placeholder="Hanya angka tanpa tanda baca"
          />
          {errors.npwp && <p className="text-xs text-red-400 font-medium">{errors.npwp.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Nomor Telepon</label>
          <input
            {...register('phoneNumber')}
            className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-mono"
            placeholder="081234567890"
          />
          {errors.phoneNumber && <p className="text-xs text-red-400 font-medium">{errors.phoneNumber.message}</p>}
        </div>

        {mutationError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-sm text-red-400 rounded-xl backdrop-blur-md">
            {mutationError.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="relative w-full overflow-hidden rounded-xl bg-blue-600 px-4 py-4 font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:hover:bg-blue-600 disabled:hover:shadow-none outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 group/btn mt-6"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
          <span className="relative flex items-center justify-center gap-2 text-[15px] tracking-wide">
            {isPending ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menyimpan...
              </>
            ) : 'Simpan Profil'}
          </span>
        </button>
      </form>
    </div>
  );
}

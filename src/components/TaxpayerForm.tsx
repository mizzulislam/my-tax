'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taxpayerProfileSchema, TaxpayerProfile } from '@/types/taxpayer';
import { useMutateProfile } from '@/hooks/useMutateProfile';
import { useRouter } from 'next/navigation';
import { ModernSelect } from '@/components/ui/ModernSelect';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function TaxpayerForm() {
  const router = useRouter();
  const { mutate, isPending, error: mutationError } = useMutateProfile();

  const {
    register,
    control,
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
        
        <Input
          label="Nama Lengkap"
          placeholder="Sesuai KTP"
          {...register('fullName')}
          error={errors.fullName?.message}
        />

        <div className="space-y-2 z-50 relative">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Jenis Wajib Pajak</label>
          <Controller
            name="taxpayerType"
            control={control}
            render={({ field }) => (
              <ModernSelect
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'pribadi', label: 'Orang Pribadi' },
                  { value: 'badan', label: 'Badan / Perusahaan' },
                ]}
              />
            )}
          />
          {errors.taxpayerType && <p className="text-xs text-red-400 font-medium">{errors.taxpayerType.message}</p>}
        </div>

        <Input
          label="NIK (16 Digit)"
          placeholder="3171xxxxxxxxxxxx"
          maxLength={16}
          className="tracking-widest font-mono"
          {...register('nik')}
          error={errors.nik?.message}
        />

        <Input
          label="NPWP (15/16 Digit)"
          placeholder="Hanya angka tanpa tanda baca"
          maxLength={16}
          className="tracking-widest font-mono"
          {...register('npwp')}
          error={errors.npwp?.message}
        />

        <Input
          label="Nomor Telepon"
          placeholder="081234567890"
          className="font-mono"
          {...register('phoneNumber')}
          error={errors.phoneNumber?.message}
        />

        {mutationError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-sm text-red-400 rounded-xl backdrop-blur-md">
            {mutationError.message}
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending}
          isLoading={isPending}
          fullWidth
          size="lg"
          className="mt-6"
        >
          {isPending ? 'Menyimpan...' : 'Simpan Profil'}
        </Button>
      </form>
    </div>
  );
}

'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { incomeSourceSchema, IncomeSourceInput } from '@/types/taxpayer';
import { useMutateIncomeSource } from '@/hooks/useIncomeSources';
import { useEffect } from 'react';
import Tooltip from './Tooltip';
import type { z } from 'zod';

// RHF form values type — uses Zod output (with defaults resolved) to match zodResolver output
type IncomeSourceFormValues = z.infer<typeof incomeSourceSchema>;

interface IncomeSourceFormProps {
  editSource?: { id: string } & IncomeSourceInput;
  onSuccess?: () => void;
  onCancel?: () => void;
  activeTaxYear?: number;
}

export default function IncomeSourceForm({
  editSource,
  onSuccess,
  onCancel,
  activeTaxYear = new Date().getFullYear(),
}: IncomeSourceFormProps) {
  const { mutate, isPending, error: mutationError } = useMutateIncomeSource();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<IncomeSourceFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(incomeSourceSchema) as any,
    defaultValues: {
      sourceName: '',
      sourceType: 'pekerjaan_tetap',
      annualIncome: 0,
      taxYear: activeTaxYear,
      npwpPemotong: '',
      isTaxWithheld: false,
      withheldAmount: 0,
      notes: '',
    },
  });

  // Watch fields dynamically
  const isTaxWithheld = useWatch({ control, name: 'isTaxWithheld' });
  const annualIncome = useWatch({ control, name: 'annualIncome' }) || 0;
  const sourceType = useWatch({ control, name: 'sourceType' });

  // Sync edit state or activeTaxYear change
  useEffect(() => {
    if (editSource) {
      reset({
        sourceName: editSource.sourceName,
        sourceType: editSource.sourceType,
        annualIncome: editSource.annualIncome,
        taxYear: editSource.taxYear,
        npwpPemotong: editSource.npwpPemotong || '',
        isTaxWithheld: editSource.isTaxWithheld,
        withheldAmount: editSource.withheldAmount || 0,
        notes: editSource.notes || '',
      });
    } else {
      reset({
        sourceName: '',
        sourceType: 'pekerjaan_tetap',
        annualIncome: 0,
        taxYear: activeTaxYear,
        npwpPemotong: '',
        isTaxWithheld: false,
        withheldAmount: 0,
        notes: '',
      });
    }
  }, [editSource, activeTaxYear, reset]);

  // Suggesting withheld amount automatically for convenience (e.g. standard withholding)
  useEffect(() => {
    if (isTaxWithheld && annualIncome > 0) {
      // Pekerjaan Tetap: standard withholding is progressive but let's mock/suggest a standard ~5%
      // as a helpful default suggestion for the user, while keeping it editable.
      if (sourceType === 'pekerjaan_tetap') {
        const suggested = Math.round(annualIncome * 0.05);
        setValue('withheldAmount', suggested);
      } else if (sourceType === 'pekerjaan_bebas') {
        // Bukan pegawai: 50% x tarif progresif (typically standard 2.5% of gross)
        const suggested = Math.round(annualIncome * 0.025);
        setValue('withheldAmount', suggested);
      } else if (sourceType === 'sewa') {
        // Final Rent 10%
        const suggested = Math.round(annualIncome * 0.10);
        setValue('withheldAmount', suggested);
      } else if (sourceType === 'investasi') {
        // Final Investment 10%
        const suggested = Math.round(annualIncome * 0.10);
        setValue('withheldAmount', suggested);
      }
    } else if (!isTaxWithheld) {
      setValue('withheldAmount', 0);
    }
  }, [isTaxWithheld, annualIncome, sourceType, setValue]);

  const onSubmit = (data: IncomeSourceFormValues) => {
    // IncomeSourceFormValues is compatible with IncomeSourceInput (same shape, defaults resolved)
    const payload: IncomeSourceInput = {
      ...data,
      isTaxWithheld: data.isTaxWithheld ?? false,
      withheldAmount: data.withheldAmount ?? 0,
    };
    mutate(
      {
        id: editSource?.id,
        ...payload,
      },
      {
        onSuccess: () => {
          reset();
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  return (
    <div className="relative p-[1px] rounded-3xl overflow-hidden group shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/30 via-indigo-500/5 to-transparent opacity-40"></div>
      
      <div className="relative bg-slate-900/85 backdrop-blur-2xl p-6 md:p-8 rounded-[23px] space-y-6">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none"></div>

        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            {editSource ? 'Edit Sumber Penghasilan' : 'Catat Sumber Penghasilan'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            UU HPP: Pengelompokan & kalkulasi pajak gabungan otomatis.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
              Nama Sumber / Instansi
              <Tooltip content="Nama perusahaan, pemberi kerja, client freelance, atau nama instansi investasi Anda." />
            </label>
            <input
              {...register('sourceName')}
              placeholder="Contoh: PT Telkom Indonesia, Freelance UI Design"
              className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-medium"
            />
            {errors.sourceName && (
              <p className="text-xs text-red-400 font-medium">{errors.sourceName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                Jenis Penghasilan
                <Tooltip content="Menentukan regulasi pemotongan pajak (PPh Pasal 21, Pasal 23, Final PP 23, dll.)." />
              </label>
              <select
                {...register('sourceType')}
                className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none"
              >
                <option value="pekerjaan_tetap">Pekerjaan Tetap (Gaji/PPh 21)</option>
                <option value="pekerjaan_bebas">Pekerjaan Bebas (Freelance)</option>
                <option value="usaha">Usaha / UMKM (PP 23)</option>
                <option value="sewa">Sewa Properti (Final 10%)</option>
                <option value="investasi">Investasi (Dividen/Bunga)</option>
                <option value="lainnya">Penghasilan Lainnya</option>
              </select>
              {errors.sourceType && (
                <p className="text-xs text-red-400 font-medium">{errors.sourceType.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                Tahun Pajak
                <Tooltip content="Tahun buku kalender pelaporan perpajakan." />
              </label>
              <input
                type="number"
                {...register('taxYear', { valueAsNumber: true })}
                className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-mono"
              />
              {errors.taxYear && (
                <p className="text-xs text-red-400 font-medium">{errors.taxYear.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
              Penghasilan Bruto Setahun
              <Tooltip content="Total penghasilan kotor dalam satu tahun buku sebelum dikurangi biaya jabatan/potongan lainnya." />
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs font-semibold text-slate-500">Rp</span>
              <input
                type="number"
                {...register('annualIncome', { valueAsNumber: true })}
                placeholder="0"
                className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-mono"
              />
            </div>
            {errors.annualIncome && (
              <p className="text-xs text-red-400 font-medium">{errors.annualIncome.message}</p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-blue-400 flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isTaxWithheld')}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-800 focus:ring-blue-500 focus:ring-offset-slate-900 mr-2.5"
                />
                Sudah Dipotong Pajak Pihak Lain?
                <Tooltip content="Centang jika pihak pemotong (pemberi kerja/klien) sudah memotong PPh Anda secara resmi dan menerbitkan Bukti Potong." />
              </label>
            </div>

            {isTaxWithheld && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                    NPWP Pemotong (Opsional)
                    <Tooltip content="NPWP Perusahaan/Pemberi Kerja yang memotong pajak Anda (15/16 digit)." />
                  </label>
                  <input
                    {...register('npwpPemotong')}
                    maxLength={16}
                    placeholder="Hanya angka tanpa tanda baca"
                    className="w-full bg-slate-950/40 border border-slate-800/80 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono tracking-wider"
                  />
                  {errors.npwpPemotong && (
                    <p className="text-xs text-red-400 font-medium">{errors.npwpPemotong.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                    Nominal PPh Dipotong
                    <Tooltip content="Jumlah nominal PPh yang dipotong pihak lain (akan dihitung sebagai Kredit Pajak Pengurang pada SPT Tahunan)." />
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                    <input
                      type="number"
                      {...register('withheldAmount', { valueAsNumber: true })}
                      placeholder="0"
                      className="w-full bg-slate-950/40 border border-slate-800/80 text-white rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono"
                    />
                  </div>
                  {errors.withheldAmount && (
                    <p className="text-xs text-red-400 font-medium">{errors.withheldAmount.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catatan Tambahan (Opsional)</label>
            <textarea
              {...register('notes')}
              placeholder="Tuliskan catatan tambahan atau keterangan bukti potong..."
              rows={2}
              className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none font-medium"
            />
          </div>

          {mutationError && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-xs text-red-400 rounded-xl font-medium">
              {mutationError.message}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-300 font-bold rounded-xl transition-all text-xs uppercase tracking-wider"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="relative flex-1 overflow-hidden rounded-xl bg-blue-600 py-3 font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50 outline-none group/btn text-xs uppercase tracking-wider"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
              {isPending ? 'Menyimpan...' : editSource ? 'Simpan Perubahan' : 'Catat Penghasilan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

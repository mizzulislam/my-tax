'use client';

import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assetSchema, AssetInput } from '@/types/taxpayer';
import { useMutateAsset } from '@/hooks/useAssets';
import { useEffect } from 'react';
import Tooltip from './Tooltip';
import { ModernSelect } from '@/components/ui/ModernSelect';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { calculateFiscalDepreciation } from '@/lib/taxEngine';

const formatNumberInput = (value: number) => value > 0 ? Math.round(value).toLocaleString('id-ID') : '';
const parseFormattedNumber = (value: string) => {
  const normalized = value.replace(/[^\d]/g, '');
  return normalized ? Number(normalized) : 0;
};
interface AssetFormProps {
  editAsset?: { id: string } & AssetInput;
  onSuccess?: () => void;
  onCancel?: () => void;
  activeTaxYear?: number;
}

export default function AssetForm({
  editAsset,
  onSuccess,
  onCancel,
  activeTaxYear = new Date().getFullYear(),
}: AssetFormProps) {
  const { mutate, isPending, error: mutationError } = useMutateAsset();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<AssetInput>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      assetName: '',
      assetType: 'tanah_bangunan',
      acquisitionYear: new Date().getFullYear() - 1,
      acquisitionValue: 0,
      currentValue: 0,
      description: '',
      taxYear: activeTaxYear,
    },
  });

  const acquisitionValue = useWatch({ control, name: 'acquisitionValue' }) || 0;
  const acquisitionYear = useWatch({ control, name: 'acquisitionYear' }) || activeTaxYear;
  const taxYear = useWatch({ control, name: 'taxYear' }) || activeTaxYear;
  const assetType = useWatch({ control, name: 'assetType' }) || 'lainnya';
  const assetName = useWatch({ control, name: 'assetName' }) || '';

  // Sync edit state or activeTaxYear change
  useEffect(() => {
    if (editAsset) {
      reset({
        assetName: editAsset.assetName,
        assetType: editAsset.assetType,
        acquisitionYear: editAsset.acquisitionYear,
        acquisitionValue: editAsset.acquisitionValue,
        currentValue: editAsset.currentValue || 0,
        description: editAsset.description || '',
        taxYear: editAsset.taxYear,
      });
    } else {
      reset({
        assetName: '',
        assetType: 'tanah_bangunan',
        acquisitionYear: new Date().getFullYear() - 1,
        acquisitionValue: 0,
        currentValue: 0,
        description: '',
        taxYear: activeTaxYear,
      });
    }
  }, [editAsset, activeTaxYear, reset]);


  // Proactively suggest current value based on fiscal depreciation rules
  useEffect(() => {
    if (acquisitionValue > 0) {
      const depreciatedValue = calculateFiscalDepreciation(
        acquisitionValue,
        acquisitionYear,
        taxYear,
        assetType,
        assetName
      );
      setValue('currentValue', depreciatedValue);
    } else {
      setValue('currentValue', 0);
    }
  }, [acquisitionValue, acquisitionYear, taxYear, assetType, assetName, setValue]);

  const onSubmit = (data: AssetInput) => {
    mutate(
      {
        id: editAsset?.id,
        ...data,
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
    <div className="relative p-[1px] rounded-3xl group shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/30 via-indigo-500/5 to-transparent opacity-40 rounded-3xl"></div>
      
      <div className="relative bg-slate-900/85 backdrop-blur-2xl p-6 md:p-8 rounded-[23px] space-y-6">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none"></div>

        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            {editAsset ? 'Edit Harta / Aset' : 'Catat Harta / Aset Baru'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            UU HPP: Daftar harta wajib dilaporkan pada SPT Tahunan.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Aset / Harta</span>
              <Tooltip content="Sebutkan nama harta secara spesifik. Contoh: Mobil Honda HRV 2022, Saham PT BBRI, Emas Antam 50gr, Rumah Tinggal Pondok Indah." />
            </div>
            <Input
              placeholder="Contoh: Rumah Tinggal, Deposito BRI, dsb."
              {...register('assetName')}
              error={errors.assetName?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                Kategori Harta
                <Tooltip content="Pengelompokan jenis aset sesuai standar formulir SPT DJP." />
              </label>
              <Controller
                name="assetType"
                control={control}
                render={({ field }) => (
                  <ModernSelect
                    value={field.value}
                    onChange={field.onChange}
                    className="z-50"
                    options={[
                      { value: 'tanah_bangunan', label: 'Tanah & Bangunan' },
                      { value: 'kendaraan', label: 'Kendaraan (Mobil/Motor)' },
                      { value: 'deposito_tabungan', label: 'Simpanan Bank / Deposito' },
                      { value: 'saham_obligasi', label: 'Surat Berharga / Investasi' },
                      { value: 'piutang', label: 'Piutang Dana' },
                      { value: 'perhiasan', label: 'Logam Mulia / Emas / Perhiasan' },
                      { value: 'peralatan', label: 'Peralatan Bernilai (Elektronik)' },
                      { value: 'lainnya', label: 'Aset Lain-lain' },
                    ]}
                  />
                )}
              />
              {errors.assetType && (
                <p className="text-xs text-red-400 font-medium">{errors.assetType.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tahun Pajak SPT</span>
                <Tooltip content="Harta akan dilaporkan dalam daftar aset SPT Tahunan pada tahun bersangkutan." />
              </div>
              <Input
                type="number"
                {...register('taxYear', { valueAsNumber: true })}
                className="font-mono"
                error={errors.taxYear?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tahun Perolehan</span>
                <Tooltip content="Tahun ketika Anda membeli/mendapatkan kepemilikan harta tersebut." />
              </div>
              <Input
                type="number"
                {...register('acquisitionYear', { valueAsNumber: true })}
                className="font-mono"
                error={errors.acquisitionYear?.message}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nilai Perolehan</span>
                <Tooltip content="Harga beli aset saat pertama kali diperoleh dalam Rupiah." />
              </div>
              <Controller
                name="acquisitionValue"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formatNumberInput(field.value)}
                    onChange={(e) => field.onChange(parseFormattedNumber(e.target.value))}
                    placeholder="0"
                    leftIcon={<span className="text-xs font-semibold text-slate-500">Rp</span>}
                    className="font-mono"
                    error={errors.acquisitionValue?.message}
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimasi Nilai Wajar Saat Ini (Opsional)</span>
              <Tooltip content="Nilai pasar atau estimasi harga wajar aset pada tahun pajak berjalan (untuk analisis kekayaan pribadi)." />
            </div>
            <Controller
              name="currentValue"
              control={control}
              render={({ field }) => (
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatNumberInput(field.value || 0)}
                  onChange={(e) => field.onChange(parseFormattedNumber(e.target.value))}
                  placeholder="0"
                  leftIcon={<span className="text-xs font-semibold text-slate-500">Rp</span>}
                  className="font-mono"
                  error={errors.currentValue?.message}
                />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keterangan / Nomor Dokumen (Opsional)</label>
            <textarea
              {...register('description')}
              placeholder="Tuliskan keterangan tambahan atau detail aset..."
              rows={2}
              className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none font-medium"
            />
          </div>

          {mutationError && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-xs text-red-400 rounded-xl font-medium">
              {mutationError.message}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {onCancel && (
              <Button
                variant="secondary"
                onClick={onCancel}
                type="button"
                className="w-1/3"
              >
                Batal
              </Button>
            )}
            <Button
              variant="primary"
              type="submit"
              isLoading={isPending}
              className="flex-1"
            >
              {isPending ? 'Menyimpan...' : editAsset ? 'Simpan Perubahan' : 'Catat Aset'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

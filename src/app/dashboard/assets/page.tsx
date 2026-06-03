'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AssetForm from '@/components/AssetForm';
import AssetTable from '@/components/AssetTable';
import { Asset } from '@/types/taxpayer';

export default function AssetsPage() {
  const router = useRouter();
  const [taxYear, setTaxYear] = useState<number>(new Date().getFullYear());
  const [editAsset, setEditAsset] = useState<Asset | undefined>(undefined);

  useEffect(() => {
    router.prefetch('/dashboard/documents');
  }, [router]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
          Manajemen <span className="text-blue-500 font-extrabold">Aset & Harta</span>
        </h1>
        <p className="text-slate-400 max-w-2xl text-md leading-relaxed font-medium">
          Kelola portofolio aset Anda dari tahun ke tahun sesuai dengan persyaratan pelaporan SPT Tahunan PPh Orang Pribadi.
        </p>
      </div>

      <div className="flex flex-col gap-10 w-full">
        <div className="tour-target-asset-form w-full relative z-10">
          <AssetForm
            editAsset={editAsset}
            activeTaxYear={taxYear}
            onSuccess={() => {
              setEditAsset(undefined);
            }}
            onCancel={editAsset ? () => setEditAsset(undefined) : undefined}
          />
        </div>

        <div className="w-full space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pilih Tahun Pajak
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTaxYear(taxYear - 1)}
                className="p-2 bg-slate-950/50 border border-slate-800 text-white hover:text-blue-400 rounded-lg transition-colors text-xs font-bold"
              >
                &larr;
              </button>
              <span className="text-sm font-black text-white px-3 font-mono">{taxYear}</span>
              <button
                onClick={() => setTaxYear(taxYear + 1)}
                className="p-2 bg-slate-950/50 border border-slate-800 text-white hover:text-blue-400 rounded-lg transition-colors text-xs font-bold"
              >
                &rarr;
              </button>
            </div>
          </div>

          <AssetTable
            taxYear={taxYear}
            onEdit={(asset) => {
              setEditAsset(asset);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      </div>
    </div>
  );
}

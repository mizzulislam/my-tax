'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AssetForm from '@/components/AssetForm';
import AssetTable from '@/components/AssetTable';
import { Asset } from '@/types/taxpayer';

const MIGRATION_SQL = `-- 1. Buat Tabel Baru public.assets
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_name TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN (
        'tanah_bangunan',
        'kendaraan',
        'deposito_tabungan',
        'saham_obligasi',
        'piutang',
        'perhiasan',
        'peralatan',
        'lainnya'
    )),
    acquisition_year INT NOT NULL,
    acquisition_value NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (acquisition_value >= 0),
    current_value NUMERIC(15,2) DEFAULT 0 CHECK (current_value >= 0),
    description TEXT,
    tax_year INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- 3. Definisikan Kebijakan RLS (Policy)
CREATE POLICY "User own assets SELECT" ON public.assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User own assets INSERT" ON public.assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User own assets UPDATE" ON public.assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "User own assets DELETE" ON public.assets FOR DELETE USING (auth.uid() = user_id);`;

export default function AssetsPage() {
  const [taxYear, setTaxYear] = useState<number>(new Date().getFullYear());
  const [editAsset, setEditAsset] = useState<Asset | undefined>(undefined);
  const [isTableMissing, setIsTableMissing] = useState(false);
  const [checkingTable, setCheckingTable] = useState(true);

  const checkTableExistence = async () => {
    try {
      setCheckingTable(true);
      const { error } = await supabase
        .from('assets')
        .select('id')
        .limit(1);

      if (error) {
        if (error.message.includes("Could not find the table") || error.code === 'P0001') {
          setIsTableMissing(true);
          return;
        }
      }
      setIsTableMissing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingTable(false);
    }
  };

  useEffect(() => {
    checkTableExistence();
  }, []);

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

      {checkingTable ? (
        <div className="py-20 text-center text-slate-500 font-medium">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-sm">Menghubungkan ke database perpajakan...</p>
        </div>
      ) : isTableMissing ? (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-red-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3 text-red-450">
            <svg className="w-6 h-6 flex-shrink-0 animate-pulse text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h3 className="text-lg font-black text-white">Migrasi Database Diperlukan!</h3>
          </div>
          
          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            Tabel <code className="text-red-300 bg-red-950/40 px-1.5 py-0.5 rounded font-mono font-bold">public.assets</code> belum terbuat di database Supabase Anda. Untuk melanjutkan, silakan salin script SQL migrasi di bawah ini dan jalankan di **SQL Editor Console Supabase** Anda:
          </p>

          <div className="relative">
            <button
              onClick={() => { navigator.clipboard.writeText(MIGRATION_SQL); const b = document.getElementById('copy-sql-assets'); if(b){b.textContent='✅ Tersalin!'; setTimeout(()=>{b.textContent='📋 Salin SQL'},2000);} }}
              id="copy-sql-assets"
              className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition-all shadow-lg uppercase tracking-wider"
            >📋 Salin SQL</button>
            <pre className="bg-slate-950/90 border border-slate-800 text-slate-300 text-xs p-5 rounded-2xl font-mono overflow-x-auto max-h-[320px] leading-relaxed shadow-inner font-semibold whitespace-pre">{MIGRATION_SQL}</pre>
          </div>

          <button
            onClick={checkTableExistence}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3"></path>
            </svg>
            Periksa Ulang Koneksi Database
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <AssetForm
              editAsset={editAsset}
              activeTaxYear={taxYear}
              onSuccess={() => {
                setEditAsset(undefined);
              }}
              onCancel={editAsset ? () => setEditAsset(undefined) : undefined}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
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
      )}
    </div>
  );
}

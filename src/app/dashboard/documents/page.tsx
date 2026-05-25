'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useFetchDocuments } from '@/hooks/useDocuments';
import DocumentUploader from '@/components/documents/DocumentUploader';
import DocumentCard from '@/components/documents/DocumentCard';

const MIGRATION_SQL = `-- 1. Buat Tabel Baru public.documents
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    file_type TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'bukti_potong',
        'faktur_pajak',
        'spt_tahunan',
        'nota_transaksi',
        'surat_keterangan',
        'identitas',
        'lainnya'
    )),
    tax_year INT,
    description TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Aktifkan RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 3. Definisikan Policy
CREATE POLICY "User own documents SELECT" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User own documents INSERT" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User own documents DELETE" ON public.documents FOR DELETE USING (auth.uid() = user_id);
`;

const CATEGORIES = [
  { id: '', label: 'Semua Kategori' },
  { id: 'bukti_potong', label: 'Bukti Potong' },
  { id: 'faktur_pajak', label: 'Faktur Pajak PPN' },
  { id: 'spt_tahunan', label: 'SPT Tahunan' },
  { id: 'nota_transaksi', label: 'Nota / Kuitansi' },
  { id: 'laporan_keuangan', label: 'Laporan Keuangan' },
  { id: 'rekening_koran', label: 'Rekening Koran' },
  { id: 'surat_keterangan', label: 'Surat Keterangan' },
  { id: 'identitas', label: 'KTP / NPWP' },
  { id: 'lainnya', label: 'Lainnya' },
];

export default function DocumentsPage() {
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterYear, setFilterYear] = useState<number | undefined>(undefined);
  
  const [isTableMissing, setIsTableMissing] = useState(false);
  const [checkingTable, setCheckingTable] = useState(true);

  const [previewData, setPreviewData] = useState<{ url: string; type: string; name: string } | null>(null);

  const { data: documents, isLoading } = useFetchDocuments(filterCategory || undefined, filterYear);

  const checkTableExistence = async () => {
    try {
      setCheckingTable(true);
      const { error } = await supabase
        .from('documents')
        .select('id')
        .limit(1);

      if (error) {
        if (error.message.includes("Could not find the table") || error.code === 'P0001' || error.code === '42P01') {
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
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
          Berkas <span className="text-blue-500 font-extrabold">Pendukung</span>
        </h1>
        <p className="text-slate-400 max-w-2xl text-md leading-relaxed font-medium">
          Sistem manajemen lampiran perpajakan Anda. Terintegrasi dengan penyimpanan awan yang aman.
        </p>
      </div>

      {checkingTable ? (
        <div className="py-20 text-center text-slate-500 font-medium">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-sm">Menghubungkan ke Storage Cloud...</p>
        </div>
      ) : isTableMissing ? (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-red-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3 text-red-450">
            <svg className="w-6 h-6 flex-shrink-0 animate-pulse text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h3 className="text-lg font-black text-white">Konfigurasi Database & Storage Diperlukan!</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              1. Tabel <code className="text-red-300 bg-red-950/40 px-1.5 py-0.5 rounded font-mono font-bold">public.documents</code> belum terbuat di database Anda. Salin script SQL berikut dan jalankan di SQL Editor Supabase:
            </p>
            <div className="relative">
              <button
                onClick={() => { navigator.clipboard.writeText(MIGRATION_SQL); const b = document.getElementById('copy-sql-docs'); if(b){b.textContent='✅ Tersalin!'; setTimeout(()=>{b.textContent='📋 Salin SQL'},2000);} }}
                id="copy-sql-docs"
                className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition-all shadow-lg uppercase tracking-wider"
              >📋 Salin SQL</button>
              <pre className="bg-slate-950/90 border border-slate-800 text-slate-300 text-xs p-5 rounded-2xl font-mono overflow-x-auto max-h-[200px] leading-relaxed shadow-inner font-semibold whitespace-pre">{MIGRATION_SQL}</pre>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-medium mt-6">
              2. Anda juga perlu membuat **Storage Bucket** baru bernama <code className="text-blue-300 bg-blue-950/40 px-1.5 py-0.5 rounded font-mono font-bold">tax-documents</code> (Private) di Supabase Dashboard bagian Storage.
            </p>
          </div>

          <button
            onClick={checkTableExistence}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center gap-2"
          >
            Periksa Ulang Konfigurasi
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          
          <div className="xl:col-span-1">
            <DocumentUploader />
          </div>

          <div className="xl:col-span-2 space-y-6">
            {/* Filter Bar */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saring Berdasarkan Kategori</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none"
                >
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>

              <div className="w-full sm:w-48 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tahun Pajak</label>
                <input
                  type="number"
                  placeholder="Semua Tahun"
                  value={filterYear || ''}
                  onChange={(e) => setFilterYear(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-2xl h-48 animate-pulse"></div>
                ))}
              </div>
            ) : documents && documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {documents.map(doc => (
                  <DocumentCard 
                    key={doc.id} 
                    document={doc} 
                    onPreview={(url, type, name) => setPreviewData({ url, type, name })}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl py-20 px-6 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 text-slate-500">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <h4 className="text-lg font-bold text-slate-300 mb-1">Belum Ada Dokumen</h4>
                <p className="text-sm text-slate-500 max-w-sm">
                  Tidak ada dokumen yang ditemukan untuk filter yang Anda pilih. Silakan unggah dokumen baru atau ubah kriteria pencarian.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm cursor-pointer"
            onClick={() => setPreviewData(null)}
          ></div>
          <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
              <h3 className="text-white font-bold truncate max-w-lg">{previewData.name}</h3>
              <div className="flex gap-2">
                <a 
                  href={previewData.url} 
                  download={previewData.name}
                  className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                  title="Download File"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0L8 8m4-4v12"></path></svg>
                </a>
                <button 
                  onClick={() => setPreviewData(null)}
                  className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/50 min-h-[50vh]">
              {previewData.type === 'application/pdf' ? (
                <iframe 
                  src={`${previewData.url}#toolbar=0`} 
                  className="w-full h-[75vh] rounded-xl border border-slate-800"
                  title="PDF Preview"
                ></iframe>
              ) : previewData.type.startsWith('image/') ? (
                <Image
                  src={previewData.url}
                  alt={previewData.name}
                  width={1200}
                  height={900}
                  unoptimized
                  className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-lg border border-slate-800"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  <p>Pratinjau tidak tersedia untuk format file ini.</p>
                  <a href={previewData.url} download className="text-blue-400 hover:underline mt-2 inline-block">Silakan unduh file</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

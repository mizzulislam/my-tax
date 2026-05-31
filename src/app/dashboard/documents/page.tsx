'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useFetchDocuments } from '@/hooks/useDocuments';
import DocumentUploader from '@/components/documents/DocumentUploader';
import DocumentCard from '@/components/documents/DocumentCard';
import DocumentPreviewModal from '@/components/documents/DocumentPreviewModal';
import { ModernSelect } from '@/components/ui/ModernSelect';



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

      setCheckingTable(true);
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
      ) : (
        <div className="flex flex-col gap-10 w-full">
          
          <div className="tour-target-document-upload w-full relative z-10">
            <DocumentUploader />
          </div>

          <div className="w-full space-y-6">
            {/* Filter Bar */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saring Berdasarkan Kategori</label>
                <ModernSelect
                  value={filterCategory}
                  onChange={setFilterCategory}
                  className="z-50"
                  options={CATEGORIES.map(c => ({ value: c.id, label: c.label }))}
                />
              </div>

              <div className="w-full sm:w-48 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tahun Pajak</label>
                <input
                  type="number"
                  placeholder="Semua Tahun"
                  value={filterYear || ''}
                  onChange={(e) => setFilterYear(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-mono"
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
      <DocumentPreviewModal 
        previewData={previewData} 
        onClose={() => setPreviewData(null)} 
      />
    </div>
  );
}

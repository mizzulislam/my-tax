'use client';

import { useState, useCallback } from 'react';
import { useUploadDocument } from '@/hooks/useDocuments';
import { ModernSelect } from '@/components/ui/ModernSelect';

interface DocumentUploaderProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  activeTaxYear?: number;
}

const CATEGORIES = [
  { id: 'bukti_potong', label: 'Bukti Potong (1721-A1/A2, dll)' },
  { id: 'faktur_pajak', label: 'Faktur Pajak PPN' },
  { id: 'spt_tahunan', label: 'Salinan SPT Tahunan' },
  { id: 'nota_transaksi', label: 'Nota / Kuitansi Transaksi' },
  { id: 'laporan_keuangan', label: 'Laporan Keuangan / Rekap Omzet' },
  { id: 'rekening_koran', label: 'Rekening Koran Bank' },
  { id: 'surat_keterangan', label: 'Surat Keterangan (Fiskal, Domisili)' },
  { id: 'identitas', label: 'KTP / NPWP / Kartu Keluarga' },
  { id: 'lainnya', label: 'Dokumen Lainnya' },
];

export default function DocumentUploader({ onSuccess, onCancel, activeTaxYear }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>('bukti_potong');
  const [description, setDescription] = useState('');
  const [taxYear, setTaxYear] = useState<number>(activeTaxYear || new Date().getFullYear());
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutate: uploadDoc, isPending } = useUploadDocument();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (selectedFile: File) => {
    setErrorMsg(null);
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMsg('Hanya format PDF, JPG, atau PNG yang diperbolehkan.');
      return false;
    }
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
      setErrorMsg('Ukuran file maksimal adalah 10 MB.');
      return false;
    }
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Silakan pilih file terlebih dahulu.');
      return;
    }

    uploadDoc(
      { file, category, taxYear, description },
      {
        onSuccess: () => {
          setFile(null);
          setDescription('');
          if (onSuccess) onSuccess();
        },
        onError: (err: unknown) => {
          const message = err instanceof Error ? err.message : 'Gagal mengunggah dokumen.';
          setErrorMsg(message);
        }
      }
    );
  };

  return (
    <div className="relative p-[1px] rounded-3xl overflow-hidden group shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/30 via-indigo-500/5 to-transparent opacity-40"></div>
      
      <div className="relative bg-slate-900/85 backdrop-blur-2xl p-6 md:p-8 rounded-[23px] space-y-6">
        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">Unggah Berkas Pendukung</h3>
          <p className="text-xs text-slate-400 mt-1">Upload bukti potong, faktur, atau laporan keuangan.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* File Dropzone */}
          <div 
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dragActive ? 'border-blue-500 bg-blue-500/10' : file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/30'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isPending}
            />
            
            <div className="pointer-events-none flex flex-col items-center justify-center space-y-3">
              {file ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div className="text-sm font-semibold text-white truncate max-w-xs">{file.name}</div>
                  <div className="text-xs text-emerald-400/80">{(file.size / 1024 / 1024).toFixed(2)} MB siap diunggah</div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  </div>
                  <div className="text-sm font-semibold text-slate-300">
                    <span className="text-blue-400">Klik untuk memilih</span> atau seret file ke sini
                  </div>
                  <div className="text-xs text-slate-500 font-medium">PDF, JPG, atau PNG (Maks. 10MB)</div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori Dokumen</label>
              <ModernSelect
                value={category}
                onChange={setCategory}
                className="z-50"
                options={CATEGORIES.map(c => ({ value: c.id, label: c.label }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tahun Pajak</label>
              <input
                type="number"
                value={taxYear}
                onChange={(e) => setTaxYear(Number(e.target.value))}
                disabled={isPending}
                className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keterangan Tambahan</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Bukti Potong PPh 21 PT ABC Jan-Des 2025"
              disabled={isPending}
              className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs text-red-400 rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isPending}
                className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-300 font-bold rounded-xl transition-all text-xs uppercase tracking-wider disabled:opacity-50"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={isPending || !file}
              className="relative flex-1 overflow-hidden rounded-xl bg-blue-600 py-3 font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:hover:shadow-none outline-none group/btn text-xs uppercase tracking-wider"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
              {isPending ? 'Mengunggah...' : 'Unggah Dokumen'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

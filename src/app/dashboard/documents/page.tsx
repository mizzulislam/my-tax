'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface TaxDocument {
  id: string;
  file_name: string;
  file_size: number;
  document_url: string;
  created_at: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<TaxDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTableMissing, setIsTableMissing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ambil list dokumen terunggah
  const fetchDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tax_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Deteksi apakah tabel belum dibuat di database
        if (
          error.message.includes('schema cache') || 
          error.message.includes('does not exist') ||
          error.code === 'PGRST116' ||
          error.code === '42P01'
        ) {
          console.warn('Tabel public.tax_documents belum dibuat di database.');
          setIsTableMissing(true);
          setErrorMsg('Tabel perpajakan "tax_documents" belum terkonfigurasi di database Supabase Anda.');
        } else {
          setErrorMsg(error.message);
        }
      } else {
        setDocuments(data || []);
        setIsTableMissing(false);
      }
    } catch (err: any) {
      console.error('Fetch Documents Error:', err.message);
      setErrorMsg('Gagal memuat daftar dokumen.');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Upload File Logic
  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);
    if (!file) return;

    if (isTableMissing) {
      setErrorMsg('Harap jalankan konfigurasi SQL terlebih dahulu sebelum mengunggah.');
      return;
    }

    // Validasi Ukuran (Maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file melebihi batas maksimum 5MB.');
      return;
    }

    // Validasi Format (PDF / PNG)
    const allowedTypes = ['application/pdf', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Hanya file PDF dan PNG yang diperbolehkan.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Pengguna tidak terautentikasi.');

      // 1. Upload ke Supabase Storage
      const fileExt = file.name.split('.').pop();
      const uniqueFileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      setUploadProgress(40);

      const { data: storageData, error: storageError } = await supabase.storage
        .from('tax-documents')
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;

      setUploadProgress(70);

      // 2. Simpan metadata ke tabel Database 'tax_documents'
      const { error: dbError } = await supabase
        .from('tax_documents')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_size: file.size,
          document_url: uniqueFileName,
        });

      if (dbError) {
        // Hapus file di storage jika simpan DB gagal
        await supabase.storage.from('tax-documents').remove([uniqueFileName]);
        throw dbError;
      }

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        fetchDocuments();
      }, 500);

    } catch (err: any) {
      console.error('Upload Error:', err.message);
      setErrorMsg(err.message || 'Gagal mengunggah berkas.');
      setIsUploading(false);
    }
  };

  // Drag & Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Unduh Berkas dengan Signed URL
  const handleDownload = async (docUrl: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('tax-documents')
        .createSignedUrl(docUrl, 60);

      if (error) throw error;

      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(`Gagal mengunduh file: ${err.message}`);
    }
  };

  // Hapus Berkas
  const handleDelete = async (id: string, docUrl: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus berkas pendukung ini?')) return;

    try {
      const { error: storageError } = await supabase.storage
        .from('tax-documents')
        .remove([docUrl]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('tax_documents')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      fetchDocuments();
    } catch (err: any) {
      alert(`Gagal menghapus berkas: ${err.message}`);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500/30 overflow-hidden relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12 lg:px-24">
        <header className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
              Berkas <span className="text-blue-500">Pendukung</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-lg">
              Unggah dan kelola lampiran berkas pajak Anda secara aman yang diisolasi penuh oleh aturan RLS Supabase.
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

        {errorMsg && (
          <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 text-sm text-red-400 rounded-3xl backdrop-blur-md">
            <h4 className="font-bold text-red-300 text-md mb-2">Pemberitahuan Sistem</h4>
            <p>{errorMsg}</p>
          </div>
        )}

        {isTableMissing ? (
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 text-orange-400">
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Konfigurasi Database Diperlukan</h3>
                <p className="text-sm text-slate-400 mt-0.5">Tabel metadata berkas pajak belum tersedia di akun Supabase Anda.</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              Silakan salin seluruh kode SQL di bawah ini, buka tab **SQL Editor** pada Dashboard Supabase Anda, lalu klik tombol **Run** untuk membuat tabel dan sistem keamanan RLS.
            </p>

            <pre className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs text-slate-400 overflow-x-auto font-mono select-all leading-normal max-h-[300px]">
{`-- Salin kode ini ke Supabase SQL Editor lalu tekan Run
CREATE TABLE public.tax_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_size INT NOT NULL,
    document_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.tax_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pengguna hanya bisa melihat dokumen sendiri" 
ON public.tax_documents FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya bisa membuat dokumen sendiri" 
ON public.tax_documents FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pengguna hanya bisa menghapus dokumen sendiri" 
ON public.tax_documents FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);`}
            </pre>

            <button 
              onClick={fetchDocuments}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors shadow-md outline-none"
            >
              Cek Ulang Database
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Kolom Kiri: Dropzone Upload */}
            <div className="lg:col-span-1 space-y-6">
              <h3 className="text-xl font-bold text-white tracking-tight px-1">Unggah Berkas Baru</h3>
              
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 h-80 relative overflow-hidden backdrop-blur-xl ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'}`}
              >
                <input 
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.png"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                
                {isUploading ? (
                  <div className="space-y-4 w-full px-4 relative z-10">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-500 animate-pulse">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">Sedang Mengunggah...</p>
                      <p className="text-xs text-slate-500 mt-1">{uploadProgress}% Selesai</p>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-1.5 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 relative z-10">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-500 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">Tarik & Lepas File di Sini</p>
                      <p className="text-xs text-slate-400 mt-1">atau klik untuk memilih dari komputer</p>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">Hanya format PDF dan PNG (Maksimal 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Kolom Kanan: Tabel Dokumen Terunggah */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-bold text-white tracking-tight px-1">Daftar Berkas Terunggah</h3>

              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                {documents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 text-slate-600">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <h4 className="text-md font-bold text-slate-300 mb-1">Belum Ada Berkas</h4>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed">Gunakan panel di samping untuk mengunggah berkas pendukung Anda.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-slate-950/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800/50">
                          <th className="p-5">Nama Berkas</th>
                          <th className="p-5">Ukuran</th>
                          <th className="p-5">Tanggal Unggah</th>
                          <th className="p-5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 text-sm">
                        {documents.map((doc) => (
                          <tr key={doc.id} className="group hover:bg-slate-800/30 transition-all duration-300">
                            <td className="p-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                                  {doc.file_name.endsWith('.pdf') ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                  )}
                                </div>
                                <span className="font-semibold text-slate-200 truncate max-w-[200px]" title={doc.file_name}>
                                  {doc.file_name}
                                </span>
                              </div>
                            </td>
                            <td className="p-5 text-slate-400 font-medium text-xs">{formatBytes(doc.file_size)}</td>
                            <td className="p-5 text-slate-500 text-xs">
                              {new Date(doc.created_at).toLocaleDateString('id-ID', {
                                year: 'numeric', month: 'short', day: 'numeric',
                              })}
                            </td>
                            <td className="p-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => handleDownload(doc.document_url, doc.file_name)}
                                  className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white rounded-lg text-slate-300 transition-colors"
                                  title="Download / View"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0L8 8m4-4v12"></path></svg>
                                </button>
                                <button 
                                  onClick={() => handleDelete(doc.id, doc.document_url)}
                                  className="p-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-400 transition-colors border border-transparent hover:border-red-500/30"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

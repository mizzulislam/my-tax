'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

interface DocumentPreviewModalProps {
  previewData: { url: string; type: string; name: string } | null;
  onClose: () => void;
}

export default function DocumentPreviewModal({ previewData, onClose }: DocumentPreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loadingPdf, setLoadingPdf] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (previewData && previewData.type === 'application/pdf') {
      setLoadingPdf(true);
      fetch(previewData.url)
        .then(res => res.blob())
        .then(blob => {
          const objectUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
          setPdfUrl(objectUrl);
          setLoadingPdf(false);
        })
        .catch(err => {
          console.error('Failed to load PDF blob:', err);
          setPdfUrl(previewData.url); // Fallback to raw URL
          setLoadingPdf(false);
        });
    }

    return () => {
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [previewData]);

  if (!mounted || !previewData) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8">
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl cursor-pointer"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-4xl bg-slate-900/95 backdrop-blur-3xl border border-slate-700/50 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300" style={{ maxHeight: '85vh' }}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <h3 className="text-white font-bold truncate max-w-lg">{previewData.name}</h3>
          <div className="flex gap-2">
            <a 
              href={previewData.url} 
              download={previewData.name}
              className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
              title="Unduh File"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"></path></svg>
            </a>
            <button 
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-950/50 min-h-[50vh] relative">
          {previewData.type === 'application/pdf' ? (
            loadingPdf ? (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4"></div>
                <span className="text-sm font-semibold">Memuat Pratinjau PDF...</span>
              </div>
            ) : (
              <iframe 
                src={`${pdfUrl}#toolbar=0`} 
                className="w-full h-[65vh] rounded-xl border border-slate-800 shadow-inner"
                title="PDF Preview"
              ></iframe>
            )
          ) : previewData.type.startsWith('image/') ? (
            <Image
              src={previewData.url}
              alt={previewData.name}
              width={1200}
              height={900}
              unoptimized
              className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-2xl border border-slate-800"
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
  );

  return createPortal(modalContent, document.body);
}

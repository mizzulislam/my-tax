import React from 'react';

export function DisclaimerBox() {
  return (
    <div className="my-4 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 shadow-lg shadow-amber-950/10">
      <p className="flex items-center gap-2 text-sm font-black text-amber-200">
        <svg className="h-4 w-4 flex-shrink-0 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 9v3.75m0 3.75h.008v.008H12V16.5Zm-8.5 2.25h17L12 3.75 3.5 18.75Z" />
        </svg>
        Perhatian Penting
      </p>
      <p className="mt-2 text-xs leading-relaxed text-amber-100/80 sm:text-sm">
        Hasil kalkulasi ini adalah <strong>estimasi</strong> dan bukan angka pajak resmi. 
        Angka aktual dapat berbeda tergantung kondisi dan kebijakan perpajakan terbaru. 
        Selalu verifikasi dengan konsultan pajak bersertifikat (BKP) atau langsung 
        melalui sistem resmi DJP di{" "}
        <a href="https://pajak.go.id" target="_blank" rel="noopener noreferrer" 
           className="font-semibold text-amber-100 underline underline-offset-2 transition hover:text-white">
          pajak.go.id
        </a>.
      </p>
    </div>
  );
}

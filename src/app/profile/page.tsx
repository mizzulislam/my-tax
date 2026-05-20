'use client';

import TaxpayerForm from '@/components/TaxpayerForm';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="relative z-10 max-w-lg mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Profil Wajib Pajak</h1>
          <p className="text-slate-400 text-sm">Lengkapi data identitas perpajakan Anda sebelum melanjutkan ke dashboard.</p>
        </div>
        
        <TaxpayerForm />
      </div>
    </div>
  );
}

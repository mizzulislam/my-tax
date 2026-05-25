'use client';

import { AiTaxContext } from '@/hooks/useAiTaxContext';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  context?: AiTaxContext;
}

type QuestionIcon = 'chart' | 'laptop' | 'users' | 'warning' | 'store' | 'coin' | 'document' | 'spark' | 'receipt';

interface SuggestedQuestion {
  title: string;
  text: string;
  icon: QuestionIcon;
}

function QuestionIcon({ type }: { type: QuestionIcon }) {
  const baseClass = "w-5 h-5";

  if (type === 'chart') {
    return (
      <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 19V5m0 14h16M8 16V9m4 7V7m4 9v-4" />
      </svg>
    );
  }

  if (type === 'laptop') {
    return (
      <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5h16v10H4V5Zm-1 14h18" />
      </svg>
    );
  }

  if (type === 'users') {
    return (
      <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11a4 4 0 1 0-8 0m8 0a4 4 0 1 1-8 0m8 0c2.5.7 4 2.2 4 4v2H4v-2c0-1.8 1.5-3.3 4-4" />
      </svg>
    );
  }

  if (type === 'warning') {
    return (
      <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01M10.3 4.6 2.7 18a1.5 1.5 0 0 0 1.3 2.2h16a1.5 1.5 0 0 0 1.3-2.2L13.7 4.6a1.9 1.9 0 0 0-3.4 0Z" />
      </svg>
    );
  }

  if (type === 'store') {
    return (
      <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10h16l-1-5H5l-1 5Zm1 0v9h14v-9M8 19v-5h8v5" />
      </svg>
    );
  }

  if (type === 'coin') {
    return (
      <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6c4.4 0 8 1.8 8 4s-3.6 4-8 4-8-1.8-8-4 3.6-4 8-4Zm-8 4v4c0 2.2 3.6 4 8 4s8-1.8 8-4v-4" />
      </svg>
    );
  }

  if (type === 'document') {
    return (
      <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 3h7l5 5v13H7V3Zm7 0v5h5M10 13h6m-6 4h4" />
      </svg>
    );
  }

  if (type === 'receipt') {
    return (
      <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 3h12v18l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2L6 21V3Zm4 6h8m-8 4h8m-8 4h5" />
      </svg>
    );
  }

  return (
    <svg className={baseClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 10 .8 2.2L22 16l-2.2.8L19 19l-.8-2.2L16 16l2.2-.8L19 13Z" />
    </svg>
  );
}

export default function SuggestedQuestions({ onSelect, context }: SuggestedQuestionsProps) {
  const dynamicQuestions = [
    context && context.draftCount > 0 ? {
      title: 'Draft Laporan',
      text: `Saya punya ${context.draftCount} draft laporan. Apa prioritas pengecekan sebelum disubmit?`,
      icon: 'document' as const
    } : null,
    context && context.incomeSources.length > 0 ? {
      title: 'Optimasi Penghasilan',
      text: `Bantu analisis sumber penghasilan terbesar saya (${context.incomeSources[0].name}) dan risiko pajaknya.`,
      icon: 'spark' as const
    } : null,
    context && context.recentTransactions.length > 0 ? {
      title: 'Transaksi Terbaru',
      text: `Tinjau transaksi terakhir saya kategori ${context.recentTransactions[0].category}. Pajak apa yang perlu diperhatikan?`,
      icon: 'receipt' as const
    } : null,
  ].filter(Boolean) as SuggestedQuestion[];

  const staticQuestions: SuggestedQuestion[] = [
    {
      title: 'PPh 21 Pegawai',
      text: 'Bagaimana cara perhitungan PPh 21 dengan skema TER terbaru?',
      icon: 'chart'
    },
    {
      title: 'Freelancer',
      text: 'Saya bekerja sebagai freelancer, apa saja pajak yang harus saya bayar?',
      icon: 'laptop'
    },
    {
      title: 'Batas PTKP',
      text: 'Apa itu PTKP dan berapa batasannya jika saya sudah menikah dan punya 1 anak?',
      icon: 'users'
    },
    {
      title: 'Denda Pajak',
      text: 'Berapa denda jika saya terlambat melaporkan SPT Tahunan Orang Pribadi?',
      icon: 'warning'
    },
    {
      title: 'Pajak UMKM',
      text: 'Jelaskan syarat dan cara pakai tarif PPh Final 0.5% untuk UMKM.',
      icon: 'store'
    },
    {
      title: 'Pajak Kripto',
      text: 'Bagaimana aturan pengenaan pajak untuk investasi aset kripto?',
      icon: 'coin'
    }
  ];

  const questions = [...dynamicQuestions, ...staticQuestions].slice(0, 6);

  return (
    <div className="w-full max-w-4xl mx-auto mt-auto mb-8 p-6">
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)] mb-2 text-blue-300">
          <QuestionIcon type="spark" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight">Hai, Saya Feyn!</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Asisten cerdas perpajakan Anda. Mari berdiskusi tentang perhitungan, regulasi, atau masalah pajak yang sedang Anda hadapi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full mt-6">
          {questions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(q.text)}
              className="flex flex-col text-left p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/10 text-blue-400 flex items-center justify-center group-hover:text-blue-300 group-hover:border-blue-500/30 transition-colors">
                  <QuestionIcon type={q.icon} />
                </span>
                <span className="text-sm font-bold text-slate-300 group-hover:text-blue-400 transition-colors">
                  {q.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium line-clamp-2">
                &quot;{q.text}&quot;
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

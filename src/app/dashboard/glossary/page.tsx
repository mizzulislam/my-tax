'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { FAQ_ITEMS } from '@/data/glossaryData';
import { TAX_LEARNING_MODULES, TaxDifficulty, TaxLearningModule } from '@/data/taxLearningModules';
import { CmsTaxModule } from '@/types/taxpayer';

const difficultyLabel: Record<TaxDifficulty, string> = {
  dasar: 'Dasar',
  menengah: 'Menengah',
  lanjut: 'Lanjut',
};

const difficultyStyle: Record<TaxDifficulty, string> = {
  dasar: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  menengah: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  lanjut: 'bg-red-500/10 text-red-300 border-red-500/20',
};

function TopicIcon({ type }: { type: TaxLearningModule['icon'] }) {
  const common = 'h-8 w-8';
  const colorMap: Record<TaxLearningModule['icon'], string> = {
    landmark: 'text-pink-400',
    calculator: 'text-indigo-400',
    file: 'text-emerald-400',
    scale: 'text-amber-400',
    briefcase: 'text-blue-400',
    building: 'text-slate-300',
    home: 'text-teal-400',
    spreadsheet: 'text-purple-400',
  };

  if (type === 'calculator') {
    return (
      <svg className={`${common} ${colorMap[type]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8M8 11h2m4 0h2M8 15h2m4 0h2" />
      </svg>
    );
  }

  if (type === 'file' || type === 'spreadsheet') {
    return (
      <svg className={`${common} ${colorMap[type]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 3v5h5M8 13h8M8 17h6" />
      </svg>
    );
  }

  if (type === 'scale') {
    return (
      <svg className={`${common} ${colorMap[type]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v18M5 7h14M7 7l-4 7h8L7 7Zm10 0-4 7h8l-4-7Z" />
      </svg>
    );
  }

  if (type === 'home') {
    return (
      <svg className={`${common} ${colorMap[type]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m3 11 9-8 9 8M5 10v10h14V10M9 20v-6h6v6" />
      </svg>
    );
  }

  if (type === 'briefcase') {
    return (
      <svg className={`${common} ${colorMap[type]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1m-9 0h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm-2 6h18" />
      </svg>
    );
  }

  if (type === 'building') {
    return (
      <svg className={`${common} ${colorMap[type]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 21h16M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1" />
      </svg>
    );
  }

  return (
    <svg className={`${common} ${colorMap[type]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M4 10h16M6 10V7l6-4 6 4v3M7 10v8m5-8v8m5-8v8" />
    </svg>
  );
}

const allowedIcons: TaxLearningModule['icon'][] = ['landmark', 'calculator', 'file', 'scale', 'briefcase', 'building', 'home', 'spreadsheet'];

function normalizeCmsModule(module: CmsTaxModule): TaxLearningModule {
  return {
    slug: module.slug,
    title: module.title,
    shortTitle: module.shortTitle,
    description: module.description,
    difficulty: module.difficulty,
    category: module.category as TaxLearningModule['category'],
    status: module.status,
    quizScore: module.quizScore ?? undefined,
    estimatedMinutes: module.estimatedMinutes,
    icon: allowedIcons.includes(module.icon as TaxLearningModule['icon']) ? module.icon as TaxLearningModule['icon'] : 'file',
    intro: module.intro,
    learningGoals: module.learningGoals,
    coreConcept: module.coreConcept,
    keyPoints: module.keyPoints,
    analogyTitle: module.analogyTitle,
    analogy: module.analogy,
    relevanceTitle: module.relevanceTitle,
    relevance: module.relevance,
    practicalChecklist: module.practicalChecklist,
    nextSteps: module.nextSteps,
    caution: module.caution,
  };
}

async function fetchCmsModules() {
  const response = await fetch('/api/modules');
  const payload = await response.json().catch(() => ({ items: [] }));
  if (!response.ok) return [];
  return Array.isArray(payload.items) ? (payload.items as CmsTaxModule[]).map(normalizeCmsModule) : [];
}

export default function GlossaryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const { data: cmsModules } = useQuery({
    queryKey: ['published_tax_modules'],
    queryFn: fetchCmsModules,
  });
  const modules = cmsModules && cmsModules.length > 0 ? cmsModules : TAX_LEARNING_MODULES;

  const filteredModules = modules.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || difficultyLabel[item.difficulty] === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Semua', 'Dasar', 'Menengah', 'Lanjut'];
  const completedCount = modules.filter((learningModule) => learningModule.status === 'selesai').length;
  const progressRatio = modules.length > 0 ? (completedCount / modules.length) * 100 : 0;

  const toggleFaq = (index: number) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
          Modul <span className="text-blue-500">Pajak</span>
        </h1>
        <p className="text-slate-400 max-w-2xl text-md leading-relaxed">
          Kurikulum pembelajaran pajak berbasis materi brevet: dari pengantar hukum, KUP, PPh, PPN, pemeriksaan, akuntansi perpajakan, sampai aplikasi pelaporan pajak modern.
        </p>
      </div>

      {/* LEARNING MODULES */}
      <div className="bg-slate-900/30 rounded-3xl p-6 md:p-8 space-y-8 border border-slate-800/40 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-slate-950/45 border border-slate-800 rounded-3xl p-5 md:p-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400 mb-2">Modul Pembelajaran</p>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Daftar Materi Brevet Pajak</h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
              Pilih topik untuk membuka materi bergaya Feynman yang lebih detail, lengkap dengan tujuan belajar, poin penting, analogi, checklist, dan langkah lanjut.
            </p>
          </div>

          <div className="w-full lg:max-w-xs space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>Progresmu</span>
              <span>{completedCount} dari {modules.length} topik selesai</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div 
                className="h-full rounded-full bg-blue-500 transition-all duration-700"
                style={{ width: `${progressRatio}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input
              type="text"
              placeholder="Cari modul pajak (misal: KUP, PPh Badan, Coretax)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-medium placeholder-slate-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border-0 ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.25)]' : 'bg-slate-950/50 text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* MODULE CARD GRID DISPLAY */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {filteredModules.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 font-medium text-sm leading-relaxed">
              Modul pajak yang Anda cari tidak ditemukan.
            </div>
          ) : (
            filteredModules.map((item) => (
              <Link
                key={item.slug}
                href={`/dashboard/glossary/${item.slug}`}
                className="cursor-pointer group flex min-h-[290px] flex-col bg-slate-950/45 p-6 rounded-3xl shadow-xl border border-slate-800/80 hover:border-blue-500/45 hover:bg-slate-900/60 hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex justify-between flex-wrap gap-2 items-start mb-6">
                  <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl group-hover:scale-105 group-hover:border-blue-500/30 transition-transform">
                    <TopicIcon type={item.icon} />
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold border ${difficultyStyle[item.difficulty]}`}>
                    {difficultyLabel[item.difficulty]}
                  </span>
                </div>

                <h3 className="font-black text-xl text-white mb-3 group-hover:text-blue-400 transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  {item.description}
                </p>

                <div className="mt-auto border-t border-slate-800/70 pt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    {item.status === 'selesai' ? (
                      <span className="text-emerald-400 flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M9 12.5 11 14.5 15.5 9.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        Selesai
                        {item.quizScore !== undefined && (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded-md text-xs border border-emerald-500/20 shadow-sm">
                            Skor: {item.quizScore}
                          </span>
                        )}
                      </span>
                    ) : item.status === 'sedang' ? (
                      <span className="text-blue-300 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                        Sedang dipelajari
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full border border-slate-600" />
                        Belum dipelajari
                      </span>
                    )}
                  </div>
                  <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-all translate-x-[-8px] group-hover:translate-x-0 font-bold text-sm whitespace-nowrap">
                    {item.status === 'selesai' ? 'Ulangi' : 'Mulai'} &rarr;
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* FAQ SECTION WITH ACCORDION EFFECT */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white tracking-tight px-1">Pertanyaan Umum Perpajakan (FAQ)</h3>
        
        <div className="space-y-4">
          {FAQ_ITEMS.map((faq, idx) => {
            const isOpen = activeFaqIndex === idx;
            return (
              <div 
                key={idx}
                className="bg-slate-900/20 rounded-2xl overflow-hidden transition-all duration-300 border-0"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 focus:outline-none hover:bg-slate-900/30 transition-colors"
                >
                  <span className="text-sm font-bold text-white tracking-tight">{faq.question}</span>
                  <span className={`transform transition-transform duration-300 text-slate-500 flex-shrink-0 ${isOpen ? 'rotate-180 text-blue-400' : 'rotate-0'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                  </span>
                </button>

                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
                >
                  <p className="p-5 text-xs text-slate-400 leading-relaxed font-medium bg-slate-950/20">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

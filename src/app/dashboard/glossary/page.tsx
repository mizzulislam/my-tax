'use client';

import { useState } from 'react';
import { GLOSSARY_ITEMS, FAQ_ITEMS } from '@/data/glossaryData';

export default function GlossaryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  // Filter & Search Logic
  const filteredGlossary = GLOSSARY_ITEMS.filter((item) => {
    const matchesSearch = 
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Semua', 'Dasar', 'Pengurang', 'Tarif', 'Dokumen'];

  const toggleFaq = (index: number) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
          Glosarium & <span className="text-blue-500">Edukasi</span>
        </h1>
        <p className="text-slate-400 max-w-2xl text-md leading-relaxed">
          FR-12: Kamus istilah perpajakan interaktif dan tanya jawab (FAQ) seputar regulasi UU HPP untuk membantu pemahaman finansial Anda secara mandiri.
        </p>
      </div>

      {/* SEARCH BAR & CATEGORY PILLS FILTER */}
      <div className="bg-slate-900/30 rounded-3xl p-6 md:p-8 space-y-6 border-0 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input
              type="text"
              placeholder="Cari istilah perpajakan (misal: PTKP, PKP, Biaya Jabatan)..."
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

        {/* GLOSSARY ITEMS GRID DISPLAY */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {filteredGlossary.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 font-medium text-sm leading-relaxed">
              Istilah atau kata kunci perpajakan yang Anda cari tidak ditemukan.
            </div>
          ) : (
            filteredGlossary.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-slate-950/30 rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group border-0"
              >
                {/* Category Badge */}
                <div className="flex justify-between items-center mb-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-bold border-0 uppercase tracking-wider ${item.category === 'Dasar' ? 'bg-blue-500/10 text-blue-400' : item.category === 'Pengurang' ? 'bg-indigo-500/10 text-indigo-400' : item.category === 'Tarif' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {item.category}
                  </span>
                </div>
                
                <h4 className="text-md font-bold text-white mb-2.5 group-hover:text-blue-400 transition-colors">
                  {item.term}
                </h4>
                
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {item.definition}
                </p>
              </div>
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

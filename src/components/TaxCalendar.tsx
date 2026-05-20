'use client';

import { useState } from 'react';

interface TaxDeadline {
  day: number;
  title: string;
  desc: string;
  type: 'pph-setor' | 'spt-lapor' | 'ppn-tahunan';
  color: string;
  bgGlow: string;
}

export default function TaxCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 19)); // Mei 2026 sesuai tanggal server 2026
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Dapatkan detail tanggal
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Sesuaikan hari pertama agar Senin di index 0
  const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // Navigasi Bulan
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Batas Waktu Perpajakan
  const getDeadlinesForMonth = (m: number): TaxDeadline[] => {
    const lastDay = new Date(year, m + 1, 0).getDate();
    const list: TaxDeadline[] = [
      {
        day: 15,
        title: 'Penyetoran PPh Masa',
        desc: 'Batas akhir pembayaran/penyetoran PPh Masa (PPh Pasal 21, 23, 25, dll) yang dipotong/dipungut.',
        type: 'pph-setor',
        color: 'text-orange-400 border-orange-500/30',
        bgGlow: 'bg-orange-500/10'
      },
      {
        day: 20,
        title: 'Pelaporan SPT Masa',
        desc: 'Batas akhir pelaporan SPT Masa (PPh Pasal 21, 23, dll) untuk masa pajak bulan sebelumnya.',
        type: 'spt-lapor',
        color: 'text-blue-400 border-blue-500/30',
        bgGlow: 'bg-blue-500/10'
      },
      {
        day: lastDay,
        title: 'Pelaporan PPN & PPnBM',
        desc: 'Batas akhir pelaporan dan penyetoran PPN/PPnBM yang dipungut oleh Pengusaha Kena Pajak (PKP).',
        type: 'ppn-tahunan',
        color: 'text-emerald-400 border-emerald-500/30',
        bgGlow: 'bg-emerald-500/10'
      }
    ];

    // Khusus Maret (Batas SPT Tahunan Orang Pribadi)
    if (m === 2) {
      list.push({
        day: lastDay,
        title: 'SPT Tahunan Orang Pribadi',
        desc: 'Batas akhir pelaporan Surat Pemberitahuan (SPT) Tahunan Pajak Penghasilan Wajib Pajak Orang Pribadi.',
        type: 'ppn-tahunan',
        color: 'text-rose-400 border-rose-500/30',
        bgGlow: 'bg-rose-500/10'
      });
    }

    // Khusus April (Batas SPT Tahunan Badan)
    if (m === 3) {
      list.push({
        day: lastDay,
        title: 'SPT Tahunan Wajib Pajak Badan',
        desc: 'Batas akhir pelaporan Surat Pemberitahuan (SPT) Tahunan Pajak Penghasilan Wajib Pajak Badan.',
        type: 'ppn-tahunan',
        color: 'text-purple-400 border-purple-500/30',
        bgGlow: 'bg-purple-500/10'
      });
    }

    return list;
  };

  const deadlines = getDeadlinesForMonth(month);

  const getDayDeadlineType = (dayNum: number): TaxDeadline[] => {
    return deadlines.filter((d) => d.day === dayNum);
  };

  // Render Grid Hari
  const renderDays = () => {
    const dayCells = [];
    
    // Kosongkan hari sebelum awal bulan
    for (let i = 0; i < adjustedFirstDayIndex; i++) {
      dayCells.push(<div key={`empty-${i}`} className="h-12 w-full"></div>);
    }

    // Isi hari aktif
    for (let d = 1; d <= daysInMonth; d++) {
      const dayDeadlines = getDayDeadlineType(d);
      const isHighlighted = dayDeadlines.length > 0;
      
      let highlightClass = "text-slate-400 hover:bg-slate-800/50";
      
      if (isHighlighted) {
        const types = dayDeadlines.map(x => x.type);
        if (types.includes('pph-setor')) {
          highlightClass = "bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold shadow-[0_0_15px_rgba(249,115,22,0.15)]";
        } else if (types.includes('spt-lapor')) {
          highlightClass = "bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold shadow-[0_0_15px_rgba(59,130,246,0.15)]";
        } else if (types.includes('ppn-tahunan')) {
          highlightClass = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]";
        }
      }

      dayCells.push(
        <div 
          key={`day-${d}`} 
          className={`h-12 w-full rounded-xl flex items-center justify-center text-sm transition-all duration-300 relative group cursor-pointer ${highlightClass}`}
        >
          {d}
          
          {/* Tooltip Hover */}
          {isHighlighted && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 z-30 shadow-2xl leading-normal">
              {dayDeadlines.map((dl, idx) => (
                <div key={idx} className="mb-1.5 last:mb-0">
                  <p className="font-bold text-slate-200">{dl.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{dl.desc.substring(0, 50)}...</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return dayCells;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* Kolom Kalender */}
      <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{monthNames[month]} {year}</h2>
            <p className="text-sm text-slate-500 mt-1">Gunakan navigasi untuk memantau bulan perpajakan lainnya.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrevMonth}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors focus:ring-2 focus:ring-slate-700 outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button 
              onClick={handleNextMonth}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors focus:ring-2 focus:ring-slate-700 outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>

        {/* Kalender Header Hari */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
          <div>Sen</div>
          <div>Sel</div>
          <div>Rab</div>
          <div>Kam</div>
          <div>Jum</div>
          <div>Sab</div>
          <div>Min</div>
        </div>

        {/* Kalender Hari Grid */}
        <div className="grid grid-cols-7 gap-2">
          {renderDays()}
        </div>

        {/* Legenda Warna */}
        <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500/20 border border-orange-500/40"></span>
            <span className="text-slate-400">Penyetoran PPh Masa (Tgl 15)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500/40"></span>
            <span className="text-slate-400">Pelaporan SPT Masa (Tgl 20)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40"></span>
            <span className="text-slate-400">Pelaporan PPN / SPT Tahunan (Akhir Bulan)</span>
          </div>
        </div>
      </div>

      {/* Kolom Pengingat */}
      <div className="lg:col-span-1 space-y-6">
        <h3 className="text-xl font-bold text-white tracking-tight px-1">Pengingat Penting Bulan Ini</h3>
        
        {deadlines.map((dl, idx) => (
          <div 
            key={idx} 
            className={`group relative overflow-hidden rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 transition-all hover:bg-slate-800/50 hover:border-slate-700 hover:shadow-2xl`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${dl.color} ${dl.bgGlow}`}>
                  Tanggal {dl.day}
                </span>
                <span className="text-xs text-slate-500 font-medium">Batas Akhir</span>
              </div>
              <h4 className="font-bold text-white text-md tracking-tight group-hover:text-blue-400 transition-colors">{dl.title}</h4>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{dl.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

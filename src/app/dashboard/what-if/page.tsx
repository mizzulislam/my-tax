'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useTaxpayerStore } from '@/store/useTaxpayerStore';
import { calculateProgressiveTax } from '@/lib/taxEngine';
import Link from 'next/link';

interface TaxSummary {
  gross: number;
  biayaJabatan: number;
  iuran: number;
  totalPengurang: number;
  netIncome: number;
  ptkpStatus: string;
  ptkpValue: number;
  pkp: number;
  taxPayable: number;
}

export default function WhatIfPage() {
  const currentProfile = useTaxpayerStore((state) => state.profile);
  const [latestReport, setLatestReport] = useState<{ gross_income: number; tax_payable: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Skenario 1: Kondisi Riil Saat Ini
  const [currentGross, setCurrentGross] = useState(120000000); // Default 10jt/bulan setahun
  const [currentIuran, setCurrentIuran] = useState(2400000);   // Default 200rb/bulan setahun
  const [currentMarital, setCurrentMarital] = useState<'TK' | 'K'>('TK');
  const [currentDependents, setCurrentDependents] = useState<number>(0);

  // Skenario 2: Simulasi "What-If"
  const [simGross, setSimGross] = useState(180000000); // Simulasi 15jt/bulan setahun
  const [simIuran, setSimIuran] = useState(3600000);   // Simulasi 300rb/bulan setahun
  const [simMarital, setSimMarital] = useState<'TK' | 'K'>('K');
  const [simDependents, setSimDependents] = useState<number>(1);

  // Load profile aktual & laporan pajak terbaru dari Supabase
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Ambil Profil untuk inisialisasi Status PTKP Aktual
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          // Parsing status pernikahan dan tanggungan dari profil database
          const dbMarital = profile.marital_status === 'K' ? 'K' : 'TK';
          const dbDependents = profile.dependents || 0;
          setCurrentMarital(dbMarital);
          setCurrentDependents(dbDependents);
          
          // Sinkronisasi skenario simulasi dengan kondisi riil sebagai awal
          setSimMarital(dbMarital);
          setSimDependents(dbDependents);
        }

        // 2. Ambil Laporan Pajak Terakhir untuk inisialisasi Nominal Bruto Aktual
        const { data: reports } = await supabase
          .from('tax_reports')
          .select('gross_income, tax_payable')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (reports && reports.length > 0) {
          const latest = reports[0];
          setLatestReport({
            gross_income: Number(latest.gross_income),
            tax_payable: Number(latest.tax_payable),
          });
          setCurrentGross(Number(latest.gross_income));
          setSimGross(Number(latest.gross_income) * 1.25); // Set simulasi +25% sebagai default cerdas
        }
      } catch (err: any) {
        console.error('Error loading what-if baseline data:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Helper kalkulator detail perpajakan UU HPP
  const computeDetails = (
    gross: number,
    iuran: number,
    marital: 'TK' | 'K',
    dependents: number
  ): TaxSummary => {
    // Penentu status PTKP (maksimal tanggungan K/3 atau TK/3)
    const fixedDependents = Math.min(Math.max(0, dependents), 3);
    const ptkpStatus = `${marital}/${fixedDependents}`;

    const ptkpMap: Record<string, number> = {
      'TK/0': 54000000,
      'TK/1': 58500000,
      'TK/2': 63000000,
      'TK/3': 67500000,
      'K/0': 58500000,
      'K/1': 63000000,
      'K/2': 67500000,
      'K/3': 72000000,
    };

    const ptkpValue = ptkpMap[ptkpStatus] || 54000000;
    const biayaJabatan = Math.min(gross * 0.05, 6000000); // 5% bruto, max 6jt setahun
    const totalPengurang = biayaJabatan + iuran;
    const netIncome = Math.max(0, gross - totalPengurang);
    const pkp = Math.max(0, netIncome - ptkpValue);
    const taxPayable = calculateProgressiveTax(pkp);

    return {
      gross,
      biayaJabatan,
      iuran,
      totalPengurang,
      netIncome,
      ptkpStatus,
      ptkpValue,
      pkp,
      taxPayable,
    };
  };

  // Kalkulasi Hasil Kedua Skenario secara Instan (Real-time di sisi Client)
  const currentSummary = computeDetails(currentGross, currentIuran, currentMarital, currentDependents);
  const simSummary = computeDetails(simGross, simIuran, simMarital, simDependents);

  // Selisih Pajak Terutang (Skenario Baru - Skenario Riil)
  const taxDifference = simSummary.taxPayable - currentSummary.taxPayable;
  const isTaxIncreased = taxDifference > 0;
  const isTaxDecreased = taxDifference < 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="relative flex justify-center items-center">
          <div className="absolute animate-ping w-16 h-16 rounded-full bg-blue-500/20"></div>
          <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Title */}
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
          Simulasi <span className="text-blue-500">What-If</span>
        </h1>
        <p className="text-slate-400 max-w-2xl text-md leading-relaxed">
          FR-11: Proyeksikan beban pajak Anda di bawah 2 detik! Ubah variabel keuangan dan status sosial secara bebas untuk melihat perubahan beban progresif UU HPP.
        </p>
      </div>

      {/* BANNER HASIL PERBANDINGAN STRATEGIS (HIGH-IMPACT INTERACTIVE GLOW) */}
      <div className={`p-6 rounded-3xl border backdrop-blur-xl relative overflow-hidden transition-all duration-500 ${taxDifference === 0 ? 'bg-slate-900/50 border-slate-800' : isTaxDecreased ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.1)]'}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-5 blur-[40px] rounded-full pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Proyeksi Selisih Beban Pajak</span>
            <p className="text-3xl font-black text-white mt-1.5 flex items-baseline gap-1">
              <span className="text-sm font-medium text-slate-400">Rp</span>
              {Math.abs(taxDifference).toLocaleString('id-ID')}
              <span className="text-xs text-slate-400 font-medium ml-1">/ tahun</span>
            </p>
          </div>

          <div className="max-w-md">
            {taxDifference === 0 ? (
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Kedua skenario menghasilkan beban PPh terutang yang identik. Silakan ubah variabel di formulir bawah untuk melihat perbedaan.
              </p>
            ) : isTaxDecreased ? (
              <p className="text-sm text-emerald-400 leading-relaxed font-medium">
                🎉 Luar biasa! Skenario baru Anda berpotensi **menghemat PPh terutang sebesar Rp {Math.abs(taxDifference).toLocaleString('id-ID')} setahun** lebih hemat dari beban saat ini!
              </p>
            ) : (
              <p className="text-sm text-rose-400 leading-relaxed font-medium">
                ⚠️ Peringatan: Skenario baru ini akan **meningkatkan beban PPh terutang Anda sebesar Rp {Math.abs(taxDifference).toLocaleString('id-ID')} setahun** lebih tinggi dari kondisi riil saat ini.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* PANEL FORM KIRI: PENGENDALI SKENARIO */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white tracking-tight px-1">Kontrol Skenario Simulasi</h3>
          
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            
            {/* Bagian 1: Pengubah Gaji */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">1. Pendapatan Bruto</span>
                <span className="text-xs text-slate-500 font-mono">Tahunan</span>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Bagaimana jika Gaji Setahun saya disetel menjadi:</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={simGross}
                    onChange={(e) => setSimGross(Number(e.target.value))}
                    className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-medium"
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 px-1">
                  <span>Skenario Riil: Rp {currentGross.toLocaleString('id-ID')}</span>
                  <span>Setara: Rp {Math.round(simGross / 12).toLocaleString('id-ID')} / bulan</span>
                </div>
              </div>
            </div>

            {/* Bagian 2: Pengubah PTKP (Status Pernikahan & Tanggungan) */}
            <div className="space-y-4 border-t border-slate-800/60 pt-6">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">2. Status Keluarga & PTKP</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Bagaimana jika Status Pernikahan:</label>
                  <select
                    value={simMarital}
                    onChange={(e) => setSimMarital(e.target.value as 'TK' | 'K')}
                    className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="TK">TK - Belum Kawin</option>
                    <option value="K">K - Kawin</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400">Jumlah Tanggungan Anak:</label>
                  <select
                    value={simDependents}
                    onChange={(e) => setSimDependents(Number(e.target.value))}
                    className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="0">0 Tanggungan</option>
                    <option value="1">1 Anak</option>
                    <option value="2">2 Anak</option>
                    <option value="3">3 Anak / Maksimal</option>
                  </select>
                </div>
              </div>
              
              <div className="text-[10px] text-slate-500 px-1">
                Kondisi Riil Saat Ini: Status **{currentMarital}/{currentDependents}** (Batas PTKP: Rp {currentSummary.ptkpValue.toLocaleString('id-ID')})
              </div>
            </div>

            {/* Bagian 3: Pengurang Tambahan */}
            <div className="space-y-4 border-t border-slate-800/60 pt-6">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">3. Iuran Pensiun / JHT</span>
              
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Bagaimana jika Iuran Pensiun Setahun:</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={simIuran}
                    onChange={(e) => setSimIuran(Number(e.target.value))}
                    className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-medium"
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 px-1">
                  <span>Skenario Riil: Rp {currentIuran.toLocaleString('id-ID')}</span>
                  <span>Setara: Rp {Math.round(simIuran / 12).toLocaleString('id-ID')} / bulan</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* PANEL VISUAL KANAN: PERBANDINGAN SIDE-BY-SIDE */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white tracking-tight px-1">Analisis Perbandingan Finansial</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Kartu Skenario Riil */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-800/10 blur-[30px] rounded-full pointer-events-none"></div>
              
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block mb-1">Kondisi Riil Aktual</span>
              <h4 className="text-md font-bold text-white mb-4">Skenario Berjalan</h4>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Penghasilan Bruto:</span>
                  <span className="font-semibold text-slate-300">Rp {currentSummary.gross.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Pengurang:</span>
                  <span className="font-semibold text-slate-300">Rp {currentSummary.totalPengurang.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status PTKP ({currentSummary.ptkpStatus}):</span>
                  <span className="font-semibold text-slate-300">Rp {currentSummary.ptkpValue.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800/50 pt-2.5 font-bold">
                  <span className="text-slate-400">PKP (Kena Pajak):</span>
                  <span className="text-white">Rp {currentSummary.pkp.toLocaleString('id-ID')}</span>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-center bg-slate-950/40 rounded-2xl p-3">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">PPh Terutang Setahun</span>
                  <span className="text-xl font-black text-slate-200 mt-1 block">
                    Rp {currentSummary.taxPayable.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Kartu Skenario Baru */}
            <div className="bg-blue-650/5 border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-[30px] rounded-full pointer-events-none"></div>
              
              <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase block mb-1">Simulasi What-If</span>
              <h4 className="text-md font-bold text-white mb-4">Skenario Baru</h4>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Penghasilan Bruto:</span>
                  <span className="font-semibold text-white">Rp {simSummary.gross.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Pengurang:</span>
                  <span className="font-semibold text-slate-300">Rp {simSummary.totalPengurang.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status PTKP ({simSummary.ptkpStatus}):</span>
                  <span className="font-semibold text-slate-300">Rp {simSummary.ptkpValue.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800/50 pt-2.5 font-bold">
                  <span className="text-slate-400">PKP (Kena Pajak):</span>
                  <span className="text-blue-400">Rp {simSummary.pkp.toLocaleString('id-ID')}</span>
                </div>
                
                <div className="mt-6 pt-4 border-t border-blue-900/40 text-center bg-blue-950/30 border border-blue-500/10 rounded-2xl p-3">
                  <span className="text-[10px] font-bold text-blue-400 block uppercase">PPh Terutang Setahun</span>
                  <span className="text-xl font-black text-white mt-1 block">
                    Rp {simSummary.taxPayable.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* DIAGRAM PROSPEK PRESENTASI BEBAN PAJAK (VISUAL BAR CHART COMPONENT) */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 space-y-5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Visualisasi Komparasi PPh</span>
            
            <div className="space-y-4">
              {/* Bar Skenario Lama */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>Skenario Riil</span>
                  <span>Rp {currentSummary.taxPayable.toLocaleString('id-ID')}</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-slate-600 h-3 rounded-full transition-all duration-500 shadow-inner"
                    style={{ width: `${Math.max(5, Math.min(100, (currentSummary.taxPayable / Math.max(1, currentSummary.taxPayable, simSummary.taxPayable)) * 100))}%` }}
                  ></div>
                </div>
              </div>

              {/* Bar Skenario Baru */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>Skenario Baru</span>
                  <span className="text-blue-400 font-bold">Rp {simSummary.taxPayable.toLocaleString('id-ID')}</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 shadow-inner ${isTaxDecreased ? 'bg-emerald-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.max(5, Math.min(100, (simSummary.taxPayable / Math.max(1, currentSummary.taxPayable, simSummary.taxPayable)) * 100))}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 text-center leading-relaxed italic border-t border-slate-800/50 pt-3">
              Perhitungan di atas bersifat estimasi dinamis (What-If) menggunakan *state* lokal Zustand tanpa memengaruhi atau menulis draf laporan resmi Anda di database.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

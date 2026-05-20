'use client';

import { useState } from 'react';
import { calculateProgressiveTax } from '@/lib/taxEngine';
import { useMutateReport } from '@/hooks/useMutateReport';
import Tooltip from './Tooltip';

type PTKPStatus = 'TK/0' | 'TK/1' | 'K/0' | 'K/1' | 'K/2' | 'K/3';

export default function TaxCalculatorForm() {
  const { mutate, isPending, error: serverError } = useMutateReport();
  const [step, setStep] = useState(1);

  // Step 1: Penghasilan Bruto
  const [taxYear, setTaxYear] = useState(2026);
  const [taxPeriod, setTaxPeriod] = useState('12');
  const [gaji, setGaji] = useState<number>(0);
  const [tunjangan, setTunjangan] = useState<number>(0);
  const [bonus, setBonus] = useState<number>(0);

  // Step 2: Pengurang & PTKP
  const [iuranPensiun, setIuranPensiun] = useState<number>(0);
  const [ptkpStatus, setPtkpStatus] = useState<PTKPStatus>('TK/0');

  // Perhitungan Otomatis
  const grossIncome = gaji + tunjangan + bonus;
  
  // Biaya Jabatan = 5% dari Bruto, maks 6.000.000 setahun
  const biayaJabatan = Math.min(grossIncome * 0.05, 6000000);
  const totalPengurang = biayaJabatan + iuranPensiun;
  const netIncome = Math.max(0, grossIncome - totalPengurang);

  // Peta PTKP UU HPP
  const ptkpMap: Record<PTKPStatus, number> = {
    'TK/0': 54000000,
    'TK/1': 58500000,
    'K/0': 58500000,
    'K/1': 63000000,
    'K/2': 67500000,
    'K/3': 72000000,
  };
  const ptkpValue = ptkpMap[ptkpStatus];
  
  // PKP = Neto - PTKP (tidak boleh negatif)
  const pkp = Math.max(0, netIncome - ptkpValue);
  
  // Pajak Terutang Progresif
  const estimatedTax = calculateProgressiveTax(pkp);

  // Handle Pengiriman
  const handleSave = (status: 'draft' | 'submitted') => {
    mutate({
      taxYear,
      taxPeriod,
      grossIncome,
      taxPayable: estimatedTax,
      status,
    }, {
      onSuccess: () => {
        alert(
          status === 'submitted' 
            ? 'Laporan Resmi Perpajakan Anda Berhasil Disubmit!' 
            : 'Draf Simulasi Berhasil Disimpan!'
        );
        // Reset Form ke Step 1
        setStep(1);
        setGaji(0);
        setTunjangan(0);
        setBonus(0);
        setIuranPensiun(0);
        setPtkpStatus('TK/0');
      }
    });
  };

  return (
    <div className="relative p-[1px] rounded-3xl overflow-hidden group shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/40 via-indigo-500/10 to-transparent opacity-50"></div>
      
      <div className="relative bg-slate-900/85 backdrop-blur-2xl p-8 rounded-[23px] h-full flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none"></div>

        <div>
          {/* Header & Step Tracker */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Kalkulator Pajak Wizard</h2>
              <p className="text-xs text-slate-400 mt-1">Multi-step Wizard UU HPP Terkini</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-800">
              <span className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-slate-700'}`}></span>
              <span className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-slate-700'}`}></span>
              <span className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-blue-500' : 'bg-slate-700'}`}></span>
              <span className="text-[10px] font-bold text-slate-400 ml-1">Step {step}/3</span>
            </div>
          </div>

          {/* STEP 1: PENGHASILAN BRUTO */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                    Tahun Pajak
                    <Tooltip content="Tahun buku kalender perpajakan yang dilaporkan (contoh: 2026)." />
                  </label>
                  <input
                    type="number"
                    value={taxYear}
                    onChange={(e) => setTaxYear(Number(e.target.value))}
                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                    Masa Pajak
                    <Tooltip content="Periode pelaporan pajak. Pilih 'Desember / Tahunan' untuk pelaporan SPT Pajak setahun penuh." />
                  </label>
                  <select 
                    value={taxPeriod}
                    onChange={(e) => setTaxPeriod(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="12">Desember / Tahunan</option>
                    <option value="01">01 - Januari</option>
                    <option value="06">06 - Juni</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                  Gaji Pokok Setahun
                  <Tooltip content="Total penghasilan rutin kotor (gross) setahun sebelum dikurangi potongan apapun seperti asuransi dan iuran." />
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={gaji || ''}
                    onChange={(e) => setGaji(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                  Tunjangan Setahun
                  <Tooltip content="Total seluruh tunjangan teratur/tidak teratur (kesehatan, makan, transportasi, keluarga) yang diterima dalam setahun." />
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={tunjangan || ''}
                    onChange={(e) => setTunjangan(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                  Bonus / THR / Lainnya
                  <Tooltip content="Pendapatan bruto sekali setahun yang tidak rutin, seperti Tunjangan Hari Raya (THR), bonus kinerja, atau jasa produksi." />
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={bonus || ''}
                    onChange={(e) => setBonus(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/50 flex justify-between items-center text-xs">
                <div>
                  <p className="text-slate-500">Total Bruto:</p>
                  <p className="text-sm font-bold text-white mt-0.5 font-mono">Rp {grossIncome.toLocaleString('id-ID')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-md text-xs uppercase tracking-wider"
                >
                  Lanjut Step 2
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PENGURANG & PTKP */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                  Iuran Pensiun / JHT Setahun
                  <Tooltip content="Dana pensiun bulanan BPJS Ketenagakerjaan / Jaminan Hari Tua yang dipotong atau dibayarkan mandiri yang sah sebagai pengurang pajak." />
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                  <input
                    type="number"
                    value={iuranPensiun || ''}
                    onChange={(e) => setIuranPensiun(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                  Status PTKP (UU HPP)
                  <Tooltip content="Batas Penghasilan Tidak Kena Pajak. Semakin banyak tanggungan anak (max 3), semakin besar pengurang PTKP Anda." />
                </label>
                <select
                  value={ptkpStatus}
                  onChange={(e) => setPtkpStatus(e.target.value as PTKPStatus)}
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none"
                >
                  <option value="TK/0">TK/0 - Tidak Kawin (Rp 54.000.000)</option>
                  <option value="TK/1">TK/1 - Tidak Kawin, 1 Tanggungan (Rp 58.500.000)</option>
                  <option value="K/0">K/0 - Kawin, Tanpa Tanggungan (Rp 58.500.000)</option>
                  <option value="K/1">K/1 - Kawin, 1 Tanggungan (Rp 63.000.000)</option>
                  <option value="K/2">K/2 - Kawin, 2 Tanggungan (Rp 67.500.000)</option>
                  <option value="K/3">K/3 - Kawin, 3 Tanggungan (Rp 72.000.000)</option>
                </select>
              </div>

              {/* Box Preview Biaya Jabatan */}
              <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl text-xs space-y-2 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center">
                    Biaya Jabatan (Otomatis 5%):
                    <Tooltip content="Fasilitas pengurang otomatis dari negara sebesar 5% dari pendapatan bruto setahun, dengan batas maksimal Rp 6.000.000." />
                  </span>
                  <span className="font-semibold text-slate-300 font-mono">Rp {biayaJabatan.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800/50 pt-2 font-bold">
                  <span className="text-slate-400">Total Pengurang:</span>
                  <span className="text-white font-mono">Rp {totalPengurang.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/50 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl font-bold transition-all text-[10px] uppercase tracking-wider"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all text-xs shadow-md uppercase tracking-wider"
                >
                  Lanjut Step 3
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: RINGKASAN & SUBMIT */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center relative overflow-hidden">
                <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">Estimasi Pajak Terutang</span>
                <p className="text-3xl font-black text-white mt-1 font-mono">
                  <span className="text-lg text-blue-400 font-medium mr-1">Rp</span>
                  {estimatedTax.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500">Penghasilan Bruto:</span>
                  <span className="font-semibold text-slate-300 font-mono">Rp {grossIncome.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Pengurang:</span>
                  <span className="font-semibold text-slate-300 font-mono">Rp {totalPengurang.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Penghasilan Neto:</span>
                  <span className="font-semibold text-slate-300 font-mono">Rp {netIncome.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/50 pb-2">
                  <span className="text-slate-500">PTKP ({ptkpStatus}):</span>
                  <span className="font-semibold text-slate-300 font-mono">Rp {ptkpValue.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pt-1.5 font-bold">
                  <span className="text-slate-400 flex items-center">
                    PKP (Kena Pajak):
                    <Tooltip content="Penghasilan Kena Pajak. Hasil sisa pendapatan bersih setelah dikurangi PTKP yang digunakan sebagai basis pengenaan PPh." />
                  </span>
                  <span className="text-white font-mono">Rp {pkp.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {serverError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs text-red-400 rounded-xl">
                  {serverError.message}
                </div>
              )}

              <div className="space-y-2.5 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all text-xs uppercase tracking-wider border border-slate-750"
                    disabled={isPending}
                  >
                    Edit Data
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave('draft')}
                    className="w-full py-3.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 font-bold rounded-xl transition-all text-xs uppercase tracking-wider"
                    disabled={isPending}
                  >
                    Simpan Draf
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleSave('submitted')}
                  className="relative w-full overflow-hidden rounded-xl bg-blue-600 py-3.5 font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-50 outline-none group/btn text-xs tracking-wider uppercase"
                  disabled={isPending}
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                  {isPending ? 'Mengirim Data...' : 'Submit Resmi Laporan'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

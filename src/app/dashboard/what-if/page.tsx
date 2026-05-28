'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { WhatIfScenarioInput } from '@/types/taxpayer';
import { calculateProgressiveTax, calculateUmkmTax, compareScenarios, calculateAdditionalDeductions } from '@/lib/taxEngine';
import ScenarioBuilder from '@/components/whatif/ScenarioBuilder';
import ScenarioComparisonCard from '@/components/whatif/ScenarioComparisonCard';
import { useWhatIfScenarios, useCreateScenario, useDeleteScenario } from '@/hooks/useWhatIfScenarios';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/contexts/AlertContext';

const MIGRATION_SQL = `-- 1. Buat Tabel Baru public.what_if_scenarios
CREATE TABLE IF NOT EXISTS public.what_if_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scenario_name TEXT NOT NULL,
    base_gross_income NUMERIC(15,2) NOT NULL DEFAULT 0,
    base_ptkp_status TEXT NOT NULL DEFAULT 'TK/0',
    base_tax_result NUMERIC(15,2) DEFAULT 0,
    sim_gross_income NUMERIC(15,2),
    sim_ptkp_status TEXT,
    sim_additional_income NUMERIC(15,2) DEFAULT 0,
    sim_additional_deductions NUMERIC(15,2) DEFAULT 0,
    sim_umkm_mode BOOLEAN DEFAULT false,
    sim_umkm_omzet NUMERIC(15,2) DEFAULT 0,
    sim_tax_result NUMERIC(15,2) DEFAULT 0,
    tax_difference NUMERIC(15,2) DEFAULT 0,
    savings_percentage NUMERIC(5,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Aktifkan RLS
ALTER TABLE public.what_if_scenarios ENABLE ROW LEVEL SECURITY;

-- 3. Definisikan Policy
CREATE POLICY "User own scenarios SELECT" ON public.what_if_scenarios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User own scenarios INSERT" ON public.what_if_scenarios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User own scenarios UPDATE" ON public.what_if_scenarios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "User own scenarios DELETE" ON public.what_if_scenarios FOR DELETE USING (auth.uid() = user_id);
`;

export default function WhatIfPage() {
  const router = useRouter();
  const { showAlert, showConfirm } = useAlert();
  
  const [isTableMissing, setIsTableMissing] = useState(false);
  const [checkingTable, setCheckingTable] = useState(true);

  // Queries
  const { data: savedScenarios, isLoading: isScenariosLoading } = useWhatIfScenarios();
  const { mutate: createScenario, isPending: isCreating } = useCreateScenario();
  const { mutate: deleteScenario, isPending: isDeleting } = useDeleteScenario();

  // State builder
  const [scenario, setScenario] = useState<Partial<WhatIfScenarioInput>>({
    scenarioName: '',
    simAdditionalIncome: 0,
    simAdditionalDeductions: 0,
    simUmkmMode: false,
    simUmkmOmzet: 0,
    notes: ''
  });

  // Base computation data
  const [baseGross, setBaseGross] = useState(0);
  const [basePtkp, setBasePtkp] = useState('TK/0');
  const [baseTax, setBaseTax] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Check table and load baseline data
  const checkTableAndLoadData = async () => {
    try {
      setCheckingTable(true);
      const { error: testError } = await supabase.from('what_if_scenarios').select('id').limit(1);

      if (testError) {
        if (testError.message.includes("Could not find the table") || testError.code === 'P0001' || testError.code === '42P01') {
          setIsTableMissing(true);
          return;
        }
      }
      setIsTableMissing(false);

      // Load Profile for PTKP
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      let initPtkp = 'TK/0';
      if (profile) {
        const d = Math.min(Math.max(0, profile.dependents || 0), 3);
        const m = profile.marital_status === 'K' ? 'K' : 'TK';
        initPtkp = `${m}/${d}`;
      }

      // Load latest report for base income
      const { data: reports } = await supabase.from('tax_reports').select('gross_income, tax_payable').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1);
      
      let initGross = 120000000;
      let initTax = 0;

      if (reports && reports.length > 0) {
        initGross = Number(reports[0].gross_income);
        initTax = Number(reports[0].tax_payable);
      } else {
        // Compute default tax if no report
        const ptkpMap: Record<string, number> = { 'TK/0': 54000000, 'TK/1': 58500000, 'TK/2': 63000000, 'TK/3': 67500000, 'K/0': 58500000, 'K/1': 63000000, 'K/2': 67500000, 'K/3': 72000000 };
        const ptkpValue = ptkpMap[initPtkp] || 54000000;
        const pkp = Math.max(0, initGross - ptkpValue);
        initTax = calculateProgressiveTax(pkp);
      }

      setBaseGross(initGross);
      setBasePtkp(initPtkp);
      setBaseTax(initTax);
      
      setScenario(prev => ({
        ...prev,
        baseGrossIncome: initGross,
        basePtkpStatus: initPtkp,
        baseTaxResult: initTax,
        simPtkpStatus: initPtkp,
      }));

      setIsDataLoaded(true);

    } catch (err) {
      console.error(err);
    } finally {
      setCheckingTable(false);
    }
  };

  useEffect(() => {
    checkTableAndLoadData();
  }, []);

  // Computation Logic
  const computeSimulation = () => {
    let simGross = baseGross + (scenario.simAdditionalIncome || 0);
    const deductions = calculateAdditionalDeductions(simGross, scenario.simAdditionalDeductions || 0);
    simGross = Math.max(0, simGross - deductions);

    const ptkpMap: Record<string, number> = { 'TK/0': 54000000, 'TK/1': 58500000, 'TK/2': 63000000, 'TK/3': 67500000, 'K/0': 58500000, 'K/1': 63000000, 'K/2': 67500000, 'K/3': 72000000 };
    const ptkpValue = ptkpMap[scenario.simPtkpStatus || basePtkp] || 54000000;

    let simTax = 0;

    if (scenario.simUmkmMode) {
      // Jika mode UMKM, gross income progresif tidak dihitung, langsung hitung tarif UMKM pada omzet simulasi
      simTax = calculateUmkmTax(scenario.simUmkmOmzet || 0);
    } else {
      // Mode Progresif
      const pkp = Math.max(0, simGross - ptkpValue);
      simTax = calculateProgressiveTax(pkp);
    }

    const { diff, pct } = compareScenarios(baseTax, simTax);

    return {
      simGross,
      simTax,
      diff,
      pct
    };
  };

  const { simGross: finalSimGross, simTax: finalSimTax, diff, pct } = computeSimulation();

  const handleSaveScenario = async () => {
    if (!scenario.scenarioName) {
      await showAlert('Peringatan', 'Nama skenario wajib diisi.', 'warning');
      return;
    }
    
    const payload: WhatIfScenarioInput = {
      scenarioName: scenario.scenarioName,
      baseGrossIncome: baseGross,
      basePtkpStatus: basePtkp,
      baseTaxResult: baseTax,
      simGrossIncome: finalSimGross,
      simPtkpStatus: scenario.simPtkpStatus || basePtkp,
      simAdditionalIncome: scenario.simAdditionalIncome || 0,
      simAdditionalDeductions: scenario.simAdditionalDeductions || 0,
      simUmkmMode: scenario.simUmkmMode || false,
      simUmkmOmzet: scenario.simUmkmOmzet || 0,
      simTaxResult: finalSimTax,
      taxDifference: diff,
      savingsPercentage: pct,
      notes: scenario.notes || ''
    };

    createScenario(payload, {
      onSuccess: () => {
        setScenario({
          scenarioName: '',
          simAdditionalIncome: 0,
          simAdditionalDeductions: 0,
          simUmkmMode: false,
          simUmkmOmzet: 0,
          notes: ''
        });
        showAlert('Berhasil', 'Skenario berhasil disimpan!', 'success');
      }
    });
  };

  const handleAskAI = () => {
    const contextStr = `Saya sedang membuat simulasi perencanaan pajak bernama "${scenario.scenarioName || 'Skenario Baru'}". 
Kondisi Awal: Pajak terutang Rp ${baseTax.toLocaleString('id-ID')}.
Kondisi Simulasi: Pajak terutang menjadi Rp ${finalSimTax.toLocaleString('id-ID')}.
Selisih: Rp ${diff.toLocaleString('id-ID')} (${pct.toFixed(2)}%).
Tambahan Penghasilan: Rp ${(scenario.simAdditionalIncome||0).toLocaleString('id-ID')}.
Mode UMKM: ${scenario.simUmkmMode ? 'Ya' : 'Tidak'}.

Bisakah Anda memberikan saran atau strategi perencanaan pajak lebih lanjut untuk mengoptimalkan skenario ini?`;

    localStorage.setItem('ai_initial_context', contextStr);
    router.push('/dashboard/chat');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
          Simulasi <span className="text-blue-500 font-extrabold">What-If</span>
        </h1>
        <p className="text-slate-400 max-w-2xl text-md leading-relaxed font-medium">
          Bangun skenario masa depan, bandingkan pajak Anda secara real-time, dan simpan strategi perencanaan keuangan Anda.
        </p>
      </div>

      {checkingTable ? (
        <div className="py-20 text-center text-slate-500 font-medium">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-sm">Menyiapkan Mesin Simulasi...</p>
        </div>
      ) : isTableMissing ? (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-red-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3 text-red-450">
            <svg className="w-6 h-6 flex-shrink-0 animate-pulse text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h3 className="text-lg font-black text-white">Konfigurasi Database Diperlukan!</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Tabel <code className="text-red-300 bg-red-950/40 px-1.5 py-0.5 rounded font-mono font-bold">public.what_if_scenarios</code> belum terbuat di database Anda. Salin script SQL berikut dan jalankan di SQL Editor Supabase:
            </p>
            <div className="relative">
              <button
                onClick={() => { navigator.clipboard.writeText(MIGRATION_SQL); const b = document.getElementById('copy-sql-whatif'); if(b){b.textContent='✅ Tersalin!'; setTimeout(()=>{b.textContent='📋 Salin SQL'},2000);} }}
                id="copy-sql-whatif"
                className="absolute top-3 right-3 z-10 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition-all shadow-lg uppercase tracking-wider"
              >📋 Salin SQL</button>
              <pre className="bg-slate-950/90 border border-slate-800 text-slate-300 text-xs p-5 rounded-2xl font-mono overflow-x-auto max-h-[200px] leading-relaxed shadow-inner font-semibold whitespace-pre">{MIGRATION_SQL}</pre>
            </div>
          </div>

          <button
            onClick={checkTableAndLoadData}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
          >
            Periksa Ulang Konfigurasi
          </button>
        </div>
      ) : isDataLoaded && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="lg:col-span-1">
              <ScenarioBuilder 
                value={scenario} 
                onChange={setScenario} 
              />
              
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleSaveScenario}
                  disabled={isCreating}
                  className="flex-1 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:opacity-50"
                >
                  {isCreating ? 'Menyimpan...' : 'Simpan Skenario'}
                </button>
                <button
                  onClick={handleAskAI}
                  className="flex-1 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Tanya Tax Feyments
                </button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <ScenarioComparisonCard 
                baseTaxResult={baseTax}
                simTaxResult={finalSimTax}
                taxDifference={diff}
                savingsPercentage={pct}
              />
            </div>
          </div>

          {/* Saved Scenarios List */}
          <div className="pt-12 border-t border-slate-800/80">
            <h3 className="text-xl font-bold text-white tracking-tight mb-6">Riwayat Perencanaan Anda</h3>
            
            {isScenariosLoading ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-slate-900/50 rounded-2xl animate-pulse"></div>)}
               </div>
            ) : savedScenarios && savedScenarios.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedScenarios.map(s => {
                  const isSaving = s.taxDifference > 0;
                  const isLosing = s.taxDifference < 0;
                  return (
                    <div key={s.id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-white text-sm line-clamp-1" title={s.scenarioName}>{s.scenarioName}</h4>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${isSaving ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : isLosing ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                            {isSaving ? `Hemat ${Math.abs(s.savingsPercentage).toFixed(1)}%` : isLosing ? 'Naik' : 'Tetap'}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-xs text-slate-400">
                          <div className="flex justify-between">
                            <span>Kondisi Awal:</span>
                            <span className="font-medium text-slate-300">Rp {s.baseTaxResult.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Skenario:</span>
                            <span className="font-medium text-white">Rp {s.simTaxResult.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                        {s.notes && <p className="mt-3 text-xs text-slate-500 italic line-clamp-2">&quot;{s.notes}&quot;</p>}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-800/80 flex justify-end">
                        <button 
                          onClick={async () => {
                            if(await showConfirm('Hapus Skenario', 'Hapus skenario ini?', 'Ya, Hapus', 'Batal')) deleteScenario(s.id);
                          }}
                          disabled={isDeleting}
                          className="text-xs text-red-400 hover:text-red-300 font-bold transition-colors disabled:opacity-50"
                        >
                          Hapus Skenario
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl py-12 text-center text-slate-500">
                <p className="text-sm">Belum ada skenario yang tersimpan.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

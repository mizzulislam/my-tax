'use client';

import { WhatIfScenarioInput } from '@/types/taxpayer';

interface ScenarioBuilderProps {
  value: Partial<WhatIfScenarioInput>;
  onChange: (value: Partial<WhatIfScenarioInput>) => void;
}

export default function ScenarioBuilder({ value, onChange }: ScenarioBuilderProps) {
  const handleChange = (
    field: keyof WhatIfScenarioInput,
    val: WhatIfScenarioInput[keyof WhatIfScenarioInput]
  ) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8">
      <div>
        <h3 className="text-xl font-bold text-white tracking-tight">Kustomisasi Skenario</h3>
        <p className="text-sm text-slate-400 mt-1">Sesuaikan variabel di bawah untuk melihat simulasi pajaknya secara langsung.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Skenario</label>
          <input
            type="text"
            placeholder="Contoh: Kalau Nikah 2027"
            value={value.scenarioName || ''}
            onChange={(e) => handleChange('scenarioName', e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Simulasi Status PTKP</label>
            <select
              value={value.simPtkpStatus || value.basePtkpStatus || 'TK/0'}
              onChange={(e) => handleChange('simPtkpStatus', e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none"
            >
              <option value="TK/0">TK/0 (Tidak Kawin, 0 Tanggungan)</option>
              <option value="TK/1">TK/1 (Tidak Kawin, 1 Tanggungan)</option>
              <option value="TK/2">TK/2 (Tidak Kawin, 2 Tanggungan)</option>
              <option value="TK/3">TK/3 (Tidak Kawin, 3 Tanggungan)</option>
              <option value="K/0">K/0 (Kawin, 0 Tanggungan)</option>
              <option value="K/1">K/1 (Kawin, 1 Tanggungan)</option>
              <option value="K/2">K/2 (Kawin, 2 Tanggungan)</option>
              <option value="K/3">K/3 (Kawin, 3 Tanggungan)</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tambahan Penghasilan (Rp)</label>
            <input
              type="number"
              placeholder="0"
              value={value.simAdditionalIncome === 0 ? '' : value.simAdditionalIncome || ''}
              onChange={(e) => handleChange('simAdditionalIncome', Number(e.target.value))}
              className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-mono"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tambahan Pengurang / Zakat / Donasi (Rp)</label>
          <input
            type="number"
            placeholder="0"
            value={value.simAdditionalDeductions === 0 ? '' : value.simAdditionalDeductions || ''}
            onChange={(e) => handleChange('simAdditionalDeductions', Number(e.target.value))}
            className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-mono"
          />
          <p className="text-[10px] text-slate-500 mt-1">Maksimal pengurang biasanya dibatasi aturan (misal 5% dari bruto).</p>
        </div>

        <div className="pt-4 border-t border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Simulasi Skema UMKM (PP 23)</h4>
              <p className="text-[10px] text-slate-400">Gunakan tarif final 0.5% dengan pembebasan PTKP Omzet 500 Juta</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={value.simUmkmMode || false}
                onChange={(e) => handleChange('simUmkmMode', e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {value.simUmkmMode && (
            <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Total Omzet UMKM Setahun (Rp)</label>
              <input
                type="number"
                placeholder="0"
                value={value.simUmkmOmzet === 0 ? '' : value.simUmkmOmzet || ''}
                onChange={(e) => handleChange('simUmkmOmzet', Number(e.target.value))}
                className="w-full bg-blue-500/5 border border-blue-500/30 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-mono"
              />
              <p className="text-[10px] text-blue-400/70">Pajak hanya dikenakan pada selisih omzet di atas Rp 500.000.000</p>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catatan Skenario (Opsional)</label>
          <textarea
            rows={2}
            value={value.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Catatan probabilitas skenario ini..."
            className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
}

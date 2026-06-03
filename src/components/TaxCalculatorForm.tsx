'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  PTKP_VALUES,
  calculateAnnualPph21,
  calculateBphtb,
  calculateCorporateIncomeTax,
  calculateFinalTax,
  calculateLocalTax,
  calculateMonthlyTerTax,
  calculatePbbP2,
  calculatePph23,
  calculatePph26,
  calculatePphUnification,
  calculatePpnBm,
  calculateStampDuty,
  calculateTaxPenalty,
  calculateVat,
  calculatePph21Final,
  calculatePph21TidakFinal,
  getMonthlyTerRate,
  getTerCategory,
  type LocalTaxObject,
  type TaxPenaltyObject,
  type Pph26Object,
  type PphUnificationObject,
  type PpnBmRateBand,
  type FinalTaxObject,
  type Pph23Object,
  type PtkpStatus,
  type VatMode,
  type CorporateTaxMode,
  type Pph21FinalObject,
  type Pph21TidakFinalCategory,
  type Pph21TidakFinalJenis,
} from '@/lib/taxEngine';
import Tooltip from './Tooltip';
import OcrUploader from './OcrUploader';
import { ModernSelect, SelectOption } from '@/components/ui/ModernSelect';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAlert } from '@/contexts/AlertContext';

import {
  TaxPeriod,
  EmploymentStatus,
  CalculationScheme,
  JenisPemotongan,
  jenisPemotonganOptions,
  CalculatorType,
  calculatorOptions,
  formatRupiah,
  formatNumberInput,
  parseFormattedNumber,
  parseDecimalNumber,
  currentYear,
  taxPeriodOptions,
  ptkpOptions,
  employmentStatusOptions,
  vatModeOptions,
  ppnbmRateOptions,
  pph23Options,
  pphUnificationOptions,
  finalTaxOptions,
  pph21FinalOptions,
  pnsGolonganOptions,
  pph21TidakFinalOptions,
  pph21TidakFinalJenisOptions,
  pph26Options,
  corporateTaxModeOptions,
  localTaxOptions,
  taxPenaltyOptions,
  taxYearOptions,
  YearCombobox,
  SchemeRadioPicker
} from './tax/TaxCalculatorShared';

interface TaxCalculatorFormProps {
  calculatorType: CalculatorType;
}

export default function TaxCalculatorForm({ calculatorType }: TaxCalculatorFormProps) {
  const { showAlert } = useAlert();
  const handleSave = (status: string) => showAlert('Info', 'Penyimpanan dari kalkulator belum diimplementasi', 'info');
  const [step, setStep] = useState(1);
  const [openSelect, setOpenSelect] = useState<string | null>(null);

  useEffect(() => {
    setStep(1);
    setOpenSelect(null);
  }, [calculatorType]);

  // Step 1: Penghasilan Bruto
  const [taxYear, setTaxYear] = useState(2026);
  const [taxPeriod, setTaxPeriod] = useState<TaxPeriod>('12');
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('21-100-01');
  const [gaji, setGaji] = useState<number>(0);
  const [tunjangan, setTunjangan] = useState<number>(0);
  const [bonus, setBonus] = useState<number>(0);

  // Step 2: Pengurang & PTKP
  const [calculationScheme, setCalculationScheme] = useState<CalculationScheme>('gross');
  const [iuranPensiun, setIuranPensiun] = useState<number>(0);
  const [zakatSumbangan, setZakatSumbangan] = useState<number>(0);
  const [previousNetIncome, setPreviousNetIncome] = useState<number>(0);
  const [withheldTaxCredit, setWithheldTaxCredit] = useState<number>(0);
  const [ptkpStatus, setPtkpStatus] = useState<PtkpStatus>('TK/0');

  // PPh 21 Tahunan Specific State
  const [jenisPemotongan, setJenisPemotongan] = useState<JenisPemotongan>('bulanan');
  const [tahunanGaji, setTahunanGaji] = useState<number>(0);
  const [tahunanTunjanganPph, setTahunanTunjanganPph] = useState<number>(0);
  const [tahunanTunjanganLainnya, setTahunanTunjanganLainnya] = useState<number>(0);
  const [tahunanHonorarium, setTahunanHonorarium] = useState<number>(0);
  const [tahunanPremiAsuransi, setTahunanPremiAsuransi] = useState<number>(0);
  const [tahunanNatura, setTahunanNatura] = useState<number>(0);
  const [tahunanBonus, setTahunanBonus] = useState<number>(0);

  // PPh 21 Final & Tidak Final Specific State
  const [finalTaxObjectPph21, setFinalTaxObjectPph21] = useState<Pph21FinalObject>('pesangon');
  const [finalGrossIncome, setFinalGrossIncome] = useState<number>(0);
  const [pnsGolongan, setPnsGolongan] = useState<string>('III');
  
  const [tidakFinalCategory, setTidakFinalCategory] = useState<Pph21TidakFinalCategory>('21-100-03');
  const [tidakFinalJenis, setTidakFinalJenis] = useState<Pph21TidakFinalJenis>('non_bulanan');
  const [tidakFinalGrossIncome, setTidakFinalGrossIncome] = useState<number>(0);
  const [tidakFinalHasNpwp, setTidakFinalHasNpwp] = useState<boolean>(true);
  const [tidakFinalBerkesinambungan, setTidakFinalBerkesinambungan] = useState<boolean>(false);

  // Kalkulator pajak lainnya
  const [transactionAmount, setTransactionAmount] = useState<number>(0);
  const [includeVat, setIncludeVat] = useState<boolean>(false);
  const [vatMode, setVatMode] = useState<VatMode>('non_luxury_2025');
  const [includePpnbm, setIncludePpnbm] = useState<boolean>(false);
  const [ppnbmRateBand, setPpnbmRateBand] = useState<PpnBmRateBand>('10');
  const [isPph23GrossUp, setIsPph23GrossUp] = useState<boolean>(false);
  const [isPphUnifikasiGrossUp, setIsPphUnifikasiGrossUp] = useState<boolean>(false);
  const [isPphFinalGrossUp, setIsPphFinalGrossUp] = useState<boolean>(false);
  const [isPph26GrossUp, setIsPph26GrossUp] = useState<boolean>(false);
  const [pph23Object, setPph23Object] = useState<Pph23Object>('service_rent');
  const [withoutNpwp, setWithoutNpwp] = useState(false);
  const [pphUnificationObject, setPphUnificationObject] = useState<PphUnificationObject>('pph23_service_rent');
  const [pph26Object, setPph26Object] = useState<Pph26Object>('gross_income');
  const [treatyRatePercent, setTreatyRatePercent] = useState<number>(20);
  const [finalTaxObject, setFinalTaxObject] = useState<FinalTaxObject>('umkm_individual');
  const [corporateTaxMode, setCorporateTaxMode] = useState<CorporateTaxMode>('general');
  const [corporateTaxableIncome, setCorporateTaxableIncome] = useState<number>(0);
  const [corporateGrossTurnover, setCorporateGrossTurnover] = useState<number>(0);
  const [useCorporateFacility, setUseCorporateFacility] = useState(true);
  const [propertyNjop, setPropertyNjop] = useState<number>(0);
  const [bphtbNpoptkp, setBphtbNpoptkp] = useState<number>(80000000);
  const [pbbNjoptkp, setPbbNjoptkp] = useState<number>(10000000);
  const [localTaxObject, setLocalTaxObject] = useState<LocalTaxObject>('pbjt_general');
  const [localTaxRatePercent, setLocalTaxRatePercent] = useState<number>(10);
  const [taxPenaltyObject, setTaxPenaltyObject] = useState<TaxPenaltyObject>('late_spt_annual_individual');
  const [penaltyMonths, setPenaltyMonths] = useState<number>(1);

  // Helper penanganan input angka yang aman dari NaN dan negatif
  const handleNumberInput = (value: string, setter: (val: number) => void) => {
    setter(Math.max(0, parseFormattedNumber(value)));
  };
  const handleDecimalInput = (value: string, setter: (val: number) => void) => {
    setter(Math.max(0, parseDecimalNumber(value)));
  };

  // Perhitungan Otomatis
  const grossIncome = jenisPemotongan === 'tahunan'
    ? tahunanGaji + tahunanTunjanganPph + tahunanTunjanganLainnya + tahunanHonorarium + tahunanPremiAsuransi + tahunanNatura + tahunanBonus
    : gaji + tunjangan + bonus;
  const isGrossUp = calculationScheme === 'gross_up';
  const isAnnual = jenisPemotongan === 'tahunan' || taxPeriod === '12';

  // Perhitungan Pajak Terutang berdasarkan jenis periode
  let estimatedTax = 0;
  let biayaJabatan = 0;
  let totalPengurang = 0;
  let pph21TaxAllowance = 0;
  
  const ptkpValue = PTKP_VALUES[ptkpStatus];
  let pkp = 0;
  const annualPph21BaseInput = {
    grossIncome,
    ptkpStatus,
    pensionContribution: iuranPensiun,
    religiousContribution: zakatSumbangan,
    previousNetIncome,
    withheldTaxCredit,
  };
  let annualPph21Result = calculateAnnualPph21(annualPph21BaseInput);

  if (isGrossUp) {
    if (isAnnual) {
      for (let iteration = 0; iteration < 24; iteration += 1) {
        const nextResult = calculateAnnualPph21({
          ...annualPph21BaseInput,
          grossIncome: grossIncome + pph21TaxAllowance,
        });
        const nextAllowance = nextResult.taxDue;
        annualPph21Result = nextResult;

        if (nextAllowance === pph21TaxAllowance) break;
        pph21TaxAllowance = nextAllowance;
      }
    } else {
      for (let iteration = 0; iteration < 24; iteration += 1) {
        const nextAllowance = calculateMonthlyTerTax(grossIncome + pph21TaxAllowance, ptkpStatus);
        if (nextAllowance === pph21TaxAllowance) break;
        pph21TaxAllowance = nextAllowance;
      }
    }
  }

  const pph21TaxableGrossIncome = grossIncome + pph21TaxAllowance;

  if (isAnnual) {
    biayaJabatan = annualPph21Result.jobExpense;
    totalPengurang = annualPph21Result.totalDeduction;
    pkp = annualPph21Result.taxableIncome;
    estimatedTax = annualPph21Result.annualTax;
  } else {
    // Bulanan dengan skema TER PPh 21 PP 58/2023
    estimatedTax = calculateMonthlyTerTax(pph21TaxableGrossIncome, ptkpStatus);
  }

  const terCategory = getTerCategory(ptkpStatus);
  const terRate = getMonthlyTerRate(pph21TaxableGrossIncome, ptkpStatus);
  const vatResult = calculateVat(transactionAmount, vatMode, includeVat);
  const ppnbmResult = calculatePpnBm(transactionAmount, ppnbmRateBand, includePpnbm);
  const pph23Result = calculatePph23(transactionAmount, pph23Object, withoutNpwp, isPph23GrossUp);
  const pphUnificationResult = calculatePphUnification(transactionAmount, pphUnificationObject, withoutNpwp, isPphUnifikasiGrossUp);
  const pph26Result = calculatePph26(transactionAmount, pph26Object, treatyRatePercent / 100, isPph26GrossUp);
  const finalTaxResult = calculateFinalTax(transactionAmount, finalTaxObject, isPphFinalGrossUp);
  const corporateTaxResult = calculateCorporateIncomeTax(corporateTaxableIncome, corporateGrossTurnover, useCorporateFacility, corporateTaxMode);
  const bphtbResult = calculateBphtb(transactionAmount, propertyNjop, bphtbNpoptkp);
  const pbbP2Result = calculatePbbP2(transactionAmount, pbbNjoptkp);
  const localTaxResult = calculateLocalTax(transactionAmount, localTaxObject, localTaxRatePercent / 100);
  const taxPenaltyResult = calculateTaxPenalty(transactionAmount, taxPenaltyObject, penaltyMonths);
  const stampDuty = calculateStampDuty(transactionAmount);
  const pph21DisplayTax = isAnnual ? annualPph21Result.taxDue : estimatedTax;
  const employmentStatusLabel = employmentStatusOptions.find((option) => option.value === employmentStatus)?.label || 'Pegawai Tetap';
  const calculationSchemeLabel = isGrossUp ? 'Gross Up' : 'Gross';
  const selectedCalculatorOption = calculatorOptions.find((option) => option.id === calculatorType);
  const stepTracker = (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1.5">
      <span className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-slate-700'}`}></span>
      <span className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-slate-700'}`}></span>
      <span className={`h-2 w-2 rounded-full ${step >= 3 ? 'bg-blue-500' : 'bg-slate-700'}`}></span>
      <span className="ml-1 text-[10px] font-bold text-slate-400">Step {step}/3</span>
    </div>
  );



  return (
    <>

      <div className="relative w-full self-start bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 mb-8">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Kalkulator Pajak Terpadu</h2>
              <p className="text-xs text-slate-400 mt-1">Masukkan dasar pengenaan, lalu lihat pajak terutang dan rincian tarifnya.</p>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Workflow</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {[
                  'Pilih jenis pajak',
                  'Isi dasar pengenaan',
                  'Baca perhitungan',
                ].map((item, index) => (
                  <div key={item} className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/45 px-3 py-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-500/25 bg-blue-500/10 text-[9px] font-black text-blue-300">{index + 1}</span>
                    <span className="min-w-0 whitespace-nowrap text-[10px] font-bold leading-snug text-slate-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Regulasi</p>
              <p className="mt-4 text-xs font-semibold leading-relaxed text-slate-400 sm:mt-6">
                PPh 21 memakai TER PP 58/2023 dan rekonsiliasi tahunan Pasal 17. Tarif daerah mengikuti Perda, sedangkan sanksi bunga memakai KMK 19/MK/EF.2/2026 periode Mei 2026.
              </p>
            </div>
          </div>
        </div>
        

        {calculatorType !== 'pph21' ? (
          <div className="relative z-10 space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                Kalkulator {selectedCalculatorOption?.title ?? 'Pajak'}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {selectedCalculatorOption?.subtitle ?? 'Masukkan dasar pengenaan, lalu lihat pajak terutangnya.'}
              </p>
            </div>

            <div className="space-y-6">
              <div className={['pph23', 'pphUnifikasi', 'pph26', 'pphBadan'].includes(calculatorType) ? "grid gap-5 sm:grid-cols-2" : "space-y-5"}>
                {calculatorType !== 'pphBadan' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                      Dasar Pengenaan / Nilai Transaksi
                      <Tooltip content="Masukkan nilai bruto, DPP, omzet, atau nilai dokumen sesuai jenis pajak yang dipilih." />
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-xs font-semibold text-slate-500">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatNumberInput(transactionAmount)}
                        onChange={(e) => handleNumberInput(e.target.value, setTransactionAmount)}
                        placeholder="0"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-12 pr-4 font-mono text-sm text-white outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>
                )}

                {calculatorType === 'ppn' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Metode Perhitungan
                      </label>
                      <ModernSelect
                        id="includeVat"
                        value={includeVat ? 'true' : 'false'}
                        options={[{value: 'false', label: 'Belum Termasuk PPN'}, {value: 'true', label: 'Sudah Termasuk PPN'}]}
                       
                       
                        onChange={(value) => setIncludeVat(value === 'true')}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Tarif PPN Berlaku
                      </label>
                      <ModernSelect
                        id="vatMode"
                        value={vatMode}
                        options={vatModeOptions}
                       
                       
                        onChange={(value) => setVatMode(value as VatMode)}
                      />
                    </div>
                  </>
                )}

                {calculatorType === 'ppnbm' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Metode Perhitungan
                      </label>
                      <ModernSelect
                        id="includePpnbm"
                        value={includePpnbm ? 'true' : 'false'}
                        options={[{value: 'false', label: 'Belum Termasuk PPnBM'}, {value: 'true', label: 'Sudah Termasuk PPnBM'}]}
                       
                       
                        onChange={(value) => setIncludePpnbm(value === 'true')}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Tarif PPnBM
                        <Tooltip content="PPnBM dikenakan atas BKP yang tergolong mewah. Pilih lapisan tarif umum sesuai kelompok barang: 10%, 20%, 40%, 50%, atau 75%." />
                      </label>
                      <ModernSelect
                        id="ppnbmRateBand"
                        value={ppnbmRateBand}
                        options={ppnbmRateOptions}
                       
                       
                        onChange={(value) => setPpnbmRateBand(value as PpnBmRateBand)}
                      />
                    </div>
                  </>
                )}

                {calculatorType === 'pph23' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Skema Perhitungan
                      </label>
                      <SchemeRadioPicker
                        value={isPph23GrossUp}
                        onChange={setIsPph23GrossUp}
                        options={[
                          { value: false, label: 'Gross', tooltip: 'Dipotong dari Penghasilan' },
                          { value: true, label: 'Gross Up', tooltip: 'Ditanggung Pemberi (Gross-Up)' }
                        ]}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Objek PPh 23
                        <Tooltip content="Tarif umum PPh 23 antara lain 15% untuk dividen/bunga/royalti/hadiah dan 2% untuk sewa atau jasa tertentu." />
                      </label>
                      <ModernSelect
                        id="pph23Object"
                        value={pph23Object}
                        options={pph23Options}
                       
                       
                        onChange={(value) => setPph23Object(value as Pph23Object)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Kepemilikan NPWP
                      </label>
                      <ModernSelect
                        id="withoutNpwp"
                        value={withoutNpwp ? 'true' : 'false'}
                        options={[{value: 'false', label: 'Ya, Memiliki NPWP'}, {value: 'true', label: 'Tidak Memiliki NPWP (+100%)'}]}
                       
                       
                        onChange={(value) => setWithoutNpwp(value === 'true')}
                      />
                    </div>
                  </>
                )}

                {calculatorType === 'pphUnifikasi' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Skema Perhitungan
                      </label>
                      <SchemeRadioPicker
                        value={isPphUnifikasiGrossUp}
                        onChange={setIsPphUnifikasiGrossUp}
                        options={[
                          { value: false, label: 'Gross', tooltip: 'Dipotong dari Penghasilan' },
                          { value: true, label: 'Gross Up', tooltip: 'Ditanggung Pemberi (Gross-Up)' }
                        ]}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Objek PPh Unifikasi
                        <Tooltip content="SPT Masa PPh Unifikasi menampung bukti potong/pungut untuk PPh Pasal 4(2), 15, 22, 23, dan 26." />
                      </label>
                      <ModernSelect
                        id="pphUnificationObject"
                        value={pphUnificationObject}
                        options={pphUnificationOptions}
                       
                       
                        onChange={(value) => setPphUnificationObject(value as PphUnificationObject)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Kepemilikan NPWP
                      </label>
                      <ModernSelect
                        id="withoutNpwp"
                        value={withoutNpwp ? 'true' : 'false'}
                        options={[{value: 'false', label: 'Ya, Memiliki NPWP'}, {value: 'true', label: 'Tidak Memiliki NPWP (+100%)'}]}
                       
                       
                        onChange={(value) => setWithoutNpwp(value === 'true')}
                      />
                    </div>
                  </>
                )}

                {calculatorType === 'pphFinal' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Skema Perhitungan
                      </label>
                      <SchemeRadioPicker
                        value={isPphFinalGrossUp}
                        onChange={setIsPphFinalGrossUp}
                        options={[
                          { value: false, label: 'Gross', tooltip: 'Dipotong dari Penghasilan' },
                          { value: true, label: 'Gross Up', tooltip: 'Ditanggung Pemberi (Gross-Up)' }
                        ]}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Objek PPh Final
                        <Tooltip content="Simulasi mencakup UMKM 0,5%, sewa tanah/bangunan 10%, dan pengalihan tanah/bangunan 2,5%." />
                      </label>
                      <ModernSelect
                        id="finalTaxObject"
                        value={finalTaxObject}
                        options={finalTaxOptions}
                       
                       
                        onChange={(value) => setFinalTaxObject(value as FinalTaxObject)}
                      />
                    </div>
                  </>
                )}

                {calculatorType === 'pph26' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Skema Perhitungan
                      </label>
                      <SchemeRadioPicker
                        value={isPph26GrossUp}
                        onChange={setIsPph26GrossUp}
                        options={[
                          { value: false, label: 'Gross', tooltip: 'Dipotong dari Penghasilan' },
                          { value: true, label: 'Gross Up', tooltip: 'Ditanggung Pemberi (Gross-Up)' }
                        ]}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Objek PPh 26
                        <Tooltip content="Tarif domestik umum PPh 26 adalah 20%, dapat menjadi lebih rendah jika memenuhi ketentuan tax treaty/P3B." />
                      </label>
                      <ModernSelect
                        id="pph26Object"
                        value={pph26Object}
                        options={pph26Options}
                       
                       
                        onChange={(value) => setPph26Object(value as Pph26Object)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Tarif P3B / Treaty (%)
                        <Tooltip content="Isi 20 jika tidak menggunakan tax treaty. Jika lawan transaksi punya SKD valid, masukkan tarif P3B yang berlaku." />
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={treatyRatePercent}
                          step="0.01"
                          min="0"
                          max="100"
                          onChange={(e) => handleDecimalInput(e.target.value, setTreatyRatePercent)}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-4 pr-10 font-mono text-sm text-white outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                        />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-semibold text-slate-500">%</span>
                      </div>
                    </div>
                  </>
                )}

                {calculatorType === 'pphBadan' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Skema PPh Badan
                        <Tooltip content="Pilih tarif badan umum 22%, perseroan terbuka yang memenuhi syarat 19%, atau PPh Final UMKM 0,5% dari omzet." />
                      </label>
                      <ModernSelect
                        id="corporateTaxMode"
                        value={corporateTaxMode}
                        options={corporateTaxModeOptions}
                       
                       
                        onChange={(value) => setCorporateTaxMode(value as CorporateTaxMode)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Penghasilan Kena Pajak Badan
                        <Tooltip content={corporateTaxMode === 'umkm_final' ? "Opsional untuk skema UMKM final karena pajak dihitung dari omzet bruto." : "Masukkan laba fiskal atau PKP badan setelah koreksi fiskal dan kompensasi rugi."} />
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-xs font-semibold text-slate-500">Rp</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatNumberInput(corporateTaxableIncome)}
                          onChange={(e) => handleNumberInput(e.target.value, setCorporateTaxableIncome)}
                          placeholder="0"
                          className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-12 pr-4 font-mono text-sm text-white outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Peredaran Bruto Setahun
                        <Tooltip content="Dipakai untuk simulasi fasilitas Pasal 31E bagi peredaran bruto sampai Rp 50 miliar." />
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-xs font-semibold text-slate-500">Rp</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatNumberInput(corporateGrossTurnover)}
                          onChange={(e) => handleNumberInput(e.target.value, setCorporateGrossTurnover)}
                          placeholder="0"
                          className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-12 pr-4 font-mono text-sm text-white outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Gunakan Fasilitas Pasal 31E
                      </label>
                      <ModernSelect
                        id="useCorporateFacility"
                        value={useCorporateFacility ? 'true' : 'false'}
                        options={[{value: 'false', label: 'Tidak Menggunakan'}, {value: 'true', label: 'Ya, Gunakan Fasilitas'}]}
                       
                       
                        onChange={(value) => setUseCorporateFacility(value === 'true')}
                      />
                    </div>
                  </>
                )}

                {calculatorType === 'bphtb' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        NJOP Pembanding
                        <Tooltip content="BPHTB memakai NPOP, umumnya nilai yang lebih tinggi antara harga transaksi dan NJOP." />
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-xs font-semibold text-slate-500">Rp</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatNumberInput(propertyNjop)}
                          onChange={(e) => handleNumberInput(e.target.value, setPropertyNjop)}
                          placeholder="0"
                          className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-12 pr-4 font-mono text-sm text-white outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        NPOPTKP Daerah
                        <Tooltip content="Nilai tidak kena pajak BPHTB ditetapkan daerah. Default simulasi memakai Rp80 juta sebagai batas minimal umum menurut UU HKPD." />
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-xs font-semibold text-slate-500">Rp</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatNumberInput(bphtbNpoptkp)}
                          onChange={(e) => handleNumberInput(e.target.value, setBphtbNpoptkp)}
                          placeholder="80000000"
                          className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-12 pr-4 font-mono text-sm text-white outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>
                  </>
                )}

                {calculatorType === 'pbbP2' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                      NJOPTKP
                      <Tooltip content="Nilai Jual Objek Pajak Tidak Kena Pajak PBB-P2 ditetapkan daerah. Default simulasi memakai Rp10 juta." />
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-xs font-semibold text-slate-500">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatNumberInput(pbbNjoptkp)}
                        onChange={(e) => handleNumberInput(e.target.value, setPbbNjoptkp)}
                        placeholder="10000000"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-12 pr-4 font-mono text-sm text-white outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>
                )}

                {calculatorType === 'pajakDaerah' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Jenis Pajak Daerah
                        <Tooltip content="Tarif daerah dapat berbeda per perda. Nilai default memakai batas umum UU HKPD/ketentuan daerah yang lazim, dan bisa disesuaikan." />
                      </label>
                      <ModernSelect
                        id="localTaxObject"
                        value={localTaxObject}
                        options={localTaxOptions}
                       
                       
                        onChange={(value) => setLocalTaxObject(value as LocalTaxObject)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Tarif Daerah (%)
                        <Tooltip content="Sesuaikan dengan Perda lokasi objek pajak. Contoh: PBJT restoran umumnya sampai 10%, reklame sampai 25%, air tanah sampai 20%." />
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={localTaxRatePercent}
                          step="0.01"
                          min="0"
                          max="100"
                          onChange={(e) => handleDecimalInput(e.target.value, setLocalTaxRatePercent)}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-4 pr-10 font-mono text-sm text-white outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                        />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-semibold text-slate-500">%</span>
                      </div>
                    </div>
                  </>
                )}

                {calculatorType === 'sanksiPajak' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Jenis Sanksi
                        <Tooltip content="Denda tetap mengikuti Pasal 7 KUP. Bunga memakai tarif KMK 19/MK/EF.2/2026 untuk periode 1-31 Mei 2026." />
                      </label>
                      <ModernSelect
                        id="taxPenaltyObject"
                        value={taxPenaltyObject}
                        options={taxPenaltyOptions}
                       
                       
                        onChange={(value) => setTaxPenaltyObject(value as TaxPenaltyObject)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                        Jumlah Bulan
                        <Tooltip content="Untuk sanksi bunga, jumlah bulan dibulatkan ke atas dan dibatasi maksimal 24 bulan. Untuk denda tetap, isian ini diabaikan." />
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={penaltyMonths}
                          onChange={(e) => handleNumberInput(e.target.value, setPenaltyMonths)}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 pl-4 pr-14 font-mono text-sm text-white outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                        />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-semibold text-slate-500">Bulan</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col">
                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl text-xs space-y-2 font-medium">
                  {calculatorType === 'ppn' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Dasar Pengenaan Pajak (DPP):</span>
                        <span className="font-semibold text-slate-300 font-mono">Rp {vatResult.dpp.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tarif Pajak:</span>
                        <span className="font-semibold text-indigo-400 font-mono">{vatResult.rate * 100}%</span>
                      </div>
                    </>
                  )}
                  {calculatorType === 'ppnbm' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Dasar Pengenaan Pajak (DPP):</span>
                        <span className="font-semibold text-slate-300 font-mono">Rp {ppnbmResult.base.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tarif Pajak:</span>
                        <span className="font-semibold text-indigo-400 font-mono">{ppnbmResult.rate * 100}%</span>
                      </div>
                    </>
                  )}
                  {calculatorType === 'pph23' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Dasar Pengenaan Pajak (DPP):</span>
                        <span className="font-semibold text-slate-300 font-mono">Rp {pph23Result.base.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tarif Pajak:</span>
                        <span className="font-semibold text-indigo-400 font-mono">{pph23Result.rate * 100}%</span>
                      </div>
                      {withoutNpwp && (
                        <div className="flex justify-between">
                          <span className="text-rose-400">Denda Tanpa NPWP:</span>
                          <span className="font-semibold text-rose-400 font-mono">+100%</span>
                        </div>
                      )}
                    </>
                  )}
                  {calculatorType === 'pphUnifikasi' && (
                    <>
                      <div className="flex justify-between"><span className="text-slate-500">Dasar potong/pungut:</span><span className="font-semibold text-slate-300 font-mono">{formatRupiah(pphUnificationResult.base)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Tarif:</span><span className="font-semibold text-indigo-400 font-mono">{(pphUnificationResult.rate * 100).toFixed(2)}%</span></div>
                    </>
                  )}
                  {calculatorType === 'pphFinal' && (
                    <>
                      <div className="flex justify-between"><span className="text-slate-500">Bagian kena pajak:</span><span className="font-semibold text-slate-300 font-mono">{formatRupiah(finalTaxResult.base)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Tarif:</span><span className="font-semibold text-indigo-400 font-mono">{(finalTaxResult.rate * 100).toFixed(2)}%</span></div>
                    </>
                  )}
                  {calculatorType === 'pph26' && (
                    <>
                      <div className="flex justify-between"><span className="text-slate-500">Basis pajak:</span><span className="font-semibold text-slate-300 font-mono">{formatRupiah(pph26Result.base)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Tarif efektif:</span><span className="font-semibold text-indigo-400 font-mono">{(pph26Result.rate * 100).toFixed(2)}%</span></div>
                    </>
                  )}
                  {calculatorType === 'pphBadan' && (
                    corporateTaxMode === 'umkm_final' ? (
                      <>
                        <div className="flex justify-between"><span className="text-slate-500">Omzet kena final:</span><span className="font-semibold text-slate-300 font-mono">{formatRupiah(corporateTaxResult.grossTurnover)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Tarif final:</span><span className="font-semibold text-indigo-400 font-mono">{(corporateTaxResult.rate * 100).toFixed(2)}%</span></div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between"><span className="text-slate-500">PKP fasilitas:</span><span className="font-semibold text-slate-300 font-mono">{formatRupiah(corporateTaxResult.facilityIncome)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">PKP tarif normal:</span><span className="font-semibold text-slate-300 font-mono">{formatRupiah(corporateTaxResult.normalIncome)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Tarif umum:</span><span className="font-semibold text-indigo-400 font-mono">{(corporateTaxResult.rate * 100).toFixed(0)}%</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Tarif efektif:</span><span className="font-semibold text-indigo-400 font-mono">{(corporateTaxResult.effectiveRate * 100).toFixed(2)}%</span></div>
                      </>
                    )
                  )}
                  {calculatorType === 'bphtb' && (
                    <>
                      <div className="flex justify-between"><span className="text-slate-500">NPOP:</span><span className="font-semibold text-slate-300 font-mono">{formatRupiah(bphtbResult.npop)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">NPOPTKP:</span><span className="font-semibold text-slate-300 font-mono">{formatRupiah(bphtbResult.npoptkp)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">NPOP kena pajak:</span><span className="font-semibold text-slate-300 font-mono">{formatRupiah(bphtbResult.taxableBase)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Tarif:</span><span className="font-semibold text-indigo-400 font-mono">{(bphtbResult.rate * 100).toFixed(0)}%</span></div>
                    </>
                  )}
                  {calculatorType === 'pbbP2' && (
                    <>
                      <div className="flex justify-between"><span className="text-slate-500">NJOP:</span><span className="font-semibold text-slate-300 font-mono">{formatRupiah(pbbP2Result.njop)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">NJOPTKP:</span><span className="font-semibold text-slate-300 font-mono">{formatRupiah(pbbP2Result.njoptkp)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">NJOP kena pajak:</span><span className="font-semibold text-slate-300 font-mono">{formatRupiah(pbbP2Result.taxableBase)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Tarif:</span><span className="font-semibold text-indigo-400 font-mono">{(pbbP2Result.rate * 100).toFixed(3)}%</span></div>
                    </>
                  )}
                  {calculatorType === 'pajakDaerah' && (
                    <>
                      <div className="flex justify-between"><span className="text-slate-500">Dasar pengenaan:</span><span className="font-semibold text-slate-300 font-mono">{formatRupiah(localTaxResult.base)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Tarif pajak daerah:</span><span className="font-semibold text-indigo-400 font-mono">{(localTaxResult.rate * 100).toFixed(2)}%</span></div>
                    </>
                  )}
                  {calculatorType === 'sanksiPajak' && (
                    <>
                      <div className="flex justify-between"><span className="text-slate-500">Dasar pengenaan denda:</span><span className="font-semibold text-slate-300 font-mono">{formatRupiah(taxPenaltyResult.base)}</span></div>
                      {taxPenaltyResult.months > 0 && (
                        <div className="flex justify-between"><span className="text-slate-500">Lama keterlambatan:</span><span className="font-semibold text-indigo-400 font-mono">{taxPenaltyResult.months} bulan</span></div>
                      )}
                      {taxPenaltyResult.rate > 0 && (
                        <div className="flex justify-between"><span className="text-slate-500">Tarif bunga sanksi:</span><span className="font-semibold text-indigo-400 font-mono">{(taxPenaltyResult.rate * 100).toFixed(2)}%/bulan</span></div>
                      )}
                      {taxPenaltyResult.fixedFine > 0 && (
                        <div className="flex justify-between"><span className="text-slate-500">Denda tetap:</span><span className="font-semibold text-slate-300 font-mono">{formatRupiah(taxPenaltyResult.fixedFine)}</span></div>
                      )}
                    </>
                  )}
                  {calculatorType === 'beaMeterai' && (
                    <div className="flex justify-between"><span className="text-slate-500">Nilai dokumen:</span><span className="font-semibold text-slate-300 font-mono">{formatRupiah(transactionAmount)}</span></div>
                  )}

                  <div className="flex justify-between border-t border-slate-800/50 pt-2 font-bold">
                    <span className="text-slate-400">Total {selectedCalculatorOption?.title || 'Terutang'}:</span>
                    <span className="text-white font-mono">
                      {calculatorType === 'ppn' && formatRupiah(vatResult.tax)}
                      {calculatorType === 'ppnbm' && formatRupiah(ppnbmResult.tax)}
                      {calculatorType === 'pph23' && formatRupiah(pph23Result.tax)}
                      {calculatorType === 'pphUnifikasi' && formatRupiah(pphUnificationResult.tax)}
                      {calculatorType === 'pphFinal' && formatRupiah(finalTaxResult.tax)}
                      {calculatorType === 'pph26' && formatRupiah(pph26Result.tax)}
                      {calculatorType === 'pphBadan' && formatRupiah(corporateTaxResult.tax)}
                      {calculatorType === 'bphtb' && formatRupiah(bphtbResult.tax)}
                      {calculatorType === 'pbbP2' && formatRupiah(pbbP2Result.tax)}
                      {calculatorType === 'pajakDaerah' && formatRupiah(localTaxResult.tax)}
                      {calculatorType === 'sanksiPajak' && formatRupiah(taxPenaltyResult.penalty)}
                      {calculatorType === 'beaMeterai' && formatRupiah(stampDuty)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs font-medium leading-relaxed text-amber-200">
              Hasil ini adalah simulasi awal. Untuk implementasi produksi semua jenis pajak, tiap objek pajak perlu modul aturan, pengecualian, bukti potong/pungut, kode akun pajak, dan validasi masa pajaknya sendiri.
            </div>
          </div>
        ) : (
        <div className="relative z-10">
          {/* Header & Step Tracker */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Kalkulator PPh 21</h2>
              </div>
              <p className="text-xs text-slate-400 mt-2 sm:mt-1">Isi penghasilan, pengurang, lalu lihat perhitungan PPh 21.</p>
            </div>
            {jenisPemotongan === 'tahunan' && (
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <div className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                <div className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                <div className={`h-2 w-2 rounded-full ${step >= 3 ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                <span className="ml-1 text-[10px] font-bold text-slate-400">Tahap {step}/3</span>
              </div>
            )}
          </div>

          {/* Jenis Pemotongan */}
          <div className="space-y-1.5 mb-6">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
              Jenis Pemotongan
              <Tooltip content="Pilih jenis pemotongan PPh 21 yang sesuai dengan kebutuhan Anda." />
            </label>
              <ModernSelect
                id="jenisPemotongan"
                value={jenisPemotongan}
                options={jenisPemotonganOptions}
               
               
                onChange={(value) => {
                  setJenisPemotongan(value as JenisPemotongan);
                  setStep(1); // Reset step if changing type
                }}
              />
            </div>

          {/* TAHUNAN VIEW */}
          {jenisPemotongan === 'tahunan' && (
            <div className="space-y-6">
              <div className="relative z-10">
                <OcrUploader onScanComplete={(data: { nominal: number, taxType: string }) => {
                  setTransactionAmount(data.nominal);
                  setTahunanGaji(data.nominal);
                }} />
              </div>

              {/* PENGHASILAN BRUTO - STEP 1 */}
              <div className={`transition-all duration-300 ${step === 1 ? 'block' : 'hidden'}`}>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/35">
                <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-800 rounded-t-[15px] flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">1. PENGHASILAN BRUTO</h3>
                </div>
                <div className="p-4 space-y-4">
                  {[
                    { label: 'GAJI/PENSIUN ATAU THT/JHT', state: tahunanGaji, setter: setTahunanGaji, num: 1 },
                    { label: 'TUNJANGAN PPh', state: tahunanTunjanganPph, setter: setTahunanTunjanganPph, num: 2 },
                    { label: 'TUNJANGAN LAINNYA, UANG LEMBUR DAN SEBAGAINYA', state: tahunanTunjanganLainnya, setter: setTahunanTunjanganLainnya, num: 3 },
                    { label: 'HONORARIUM DAN IMBALAN LAIN SEJENISNYA', state: tahunanHonorarium, setter: setTahunanHonorarium, num: 4 },
                    { label: 'PREMI ASURANSI YANG DIBAYARKAN PEMBERI KERJA', state: tahunanPremiAsuransi, setter: setTahunanPremiAsuransi, num: 5 },
                    { label: 'PENERIMAAN DALAM BENTUK NATURA DAN KENIKMATAN LAINNYA', state: tahunanNatura, setter: setTahunanNatura, num: 6 },
                    { label: 'TANTIEM, BONUS, GRATIFIKASI, JASA PRODUKSI DAN THR', state: tahunanBonus, setter: setTahunanBonus, num: 7 },
                  ].map((field) => (
                    <div key={field.num} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex gap-3 text-xs font-semibold text-slate-300 w-full sm:w-2/3">
                        <span className="w-5 flex-shrink-0">{field.num}</span>
                        <span>{field.label}</span>
                      </div>
                      <div className="relative w-full sm:w-1/3">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatNumberInput(field.state)}
                          onChange={(e) => handleNumberInput(e.target.value, field.setter)}
                          placeholder="0"
                          className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-mono"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/50">
                    <div className="flex gap-3 text-xs font-bold text-white w-full sm:w-2/3">
                      <span className="w-5 flex-shrink-0">8</span>
                      <span>JUMLAH PENGHASILAN BRUTO (1 S.D. 7)</span>
                    </div>
                    <div className="relative w-full sm:w-1/3">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                      <input
                        type="text"
                        readOnly
                        value={formatNumberInput(grossIncome)}
                        className="w-full bg-blue-900/10 border border-blue-500/20 text-blue-100 rounded-lg pl-9 pr-3 py-2 text-xs font-mono opacity-90 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-slate-800/80 flex justify-end">
                  <Button type="button" onClick={() => setStep(2)} variant="primary" className="flex items-center gap-2">
                    Lanjut Pengurangan
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </Button>
                </div>
              </div>
              </div>

              {/* PENGURANGAN - STEP 2 */}
              <div className={`transition-all duration-300 ${step === 2 ? 'block' : 'hidden'}`}>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/35">
                <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-800 rounded-t-[15px]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">2. PENGURANGAN</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex gap-3 text-xs font-semibold text-slate-300 w-full sm:w-2/3">
                      <span className="w-5 flex-shrink-0">9</span>
                      <span>BIAYA JABATAN/BIAYA PENSIUN</span>
                    </div>
                    <div className="relative w-full sm:w-1/3">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                      <input
                        type="text"
                        readOnly
                        value={formatNumberInput(annualPph21Result.jobExpense)}
                        className="w-full bg-slate-900/30 border border-slate-800 text-slate-400 rounded-lg pl-9 pr-3 py-2 text-xs font-mono opacity-80 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  {[
                    { label: 'IURAN PENSIUN ATAU IURAN THT/JHT', state: iuranPensiun, setter: setIuranPensiun, num: 10 },
                    { label: 'ZAKAT/SUMBANGAN KEAGAMAAN YANG BERSIFAT WAJIB YANG DIBAYARKAN MELALUI PEMBERI KERJA', state: zakatSumbangan, setter: setZakatSumbangan, num: 11 },
                  ].map((field) => (
                    <div key={field.num} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex gap-3 text-xs font-semibold text-slate-300 w-full sm:w-2/3">
                        <span className="w-5 flex-shrink-0">{field.num}</span>
                        <span>{field.label}</span>
                      </div>
                      <div className="relative w-full sm:w-1/3">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatNumberInput(field.state)}
                          onChange={(e) => handleNumberInput(e.target.value, field.setter)}
                          placeholder="0"
                          className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-mono"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/50">
                    <div className="flex gap-3 text-xs font-bold text-white w-full sm:w-2/3">
                      <span className="w-5 flex-shrink-0">12</span>
                      <span>JUMLAH PENGURANGAN (9 S.D. 11)</span>
                    </div>
                    <div className="relative w-full sm:w-1/3">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                      <input
                        type="text"
                        readOnly
                        value={formatNumberInput(annualPph21Result.totalDeduction)}
                        className="w-full bg-blue-900/10 border border-blue-500/20 text-blue-100 rounded-lg pl-9 pr-3 py-2 text-xs font-mono opacity-90 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-slate-800/80 flex justify-between items-center">
                  <Button type="button" onClick={() => setStep(1)} variant="secondary" className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    Kembali
                  </Button>
                  <Button type="button" onClick={() => setStep(3)} variant="primary" className="flex items-center gap-2">
                    Lanjut Hitung PPh
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </Button>
                </div>
              </div>
              </div>

              {/* PENGHITUNGAN PPh PASAL 21 - STEP 3 */}
              <div className={`transition-all duration-300 ${step === 3 ? 'block' : 'hidden'}`}>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/35">
                <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-800 rounded-t-[15px]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">3. PENGHITUNGAN PPh PASAL 21</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex gap-3 text-xs font-semibold text-slate-300 w-full sm:w-2/3">
                      <span className="w-5 flex-shrink-0">13</span>
                      <span>JUMLAH PENGHASILAN NETO (8 - 12)</span>
                    </div>
                    <div className="relative w-full sm:w-1/3">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                      <input
                        type="text"
                        readOnly
                        value={formatNumberInput(annualPph21Result.currentNetIncome)}
                        className="w-full bg-slate-900/30 border border-slate-800 text-slate-400 rounded-lg pl-9 pr-3 py-2 text-xs font-mono opacity-80 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex gap-3 text-xs font-semibold text-slate-300 w-full sm:w-2/3">
                      <span className="w-5 flex-shrink-0">14</span>
                      <span>PENGHASILAN NETO MASA PAJAK SEBELUMNYA</span>
                    </div>
                    <div className="relative w-full sm:w-1/3">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatNumberInput(previousNetIncome)}
                        onChange={(e) => handleNumberInput(e.target.value, setPreviousNetIncome)}
                        placeholder="0"
                        className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex gap-3 text-xs font-semibold text-slate-300 w-full sm:w-2/3">
                      <span className="w-5 flex-shrink-0">15</span>
                      <span>JUMLAH PENGHASILAN NETO UNTUK PENGHITUNGAN PPh PASAL 21 (SETAHUN/DISETAHUNKAN)</span>
                    </div>
                    <div className="relative w-full sm:w-1/3">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                      <input
                        type="text"
                        readOnly
                        value={formatNumberInput(annualPph21Result.netIncomeForTax)}
                        className="w-full bg-slate-900/30 border border-slate-800 text-slate-400 rounded-lg pl-9 pr-3 py-2 text-xs font-mono opacity-80 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex gap-3 text-xs font-semibold text-slate-300 w-full sm:w-2/3">
                      <span className="w-5 flex-shrink-0">16</span>
                      <span>PENGHASILAN TIDAK KENA PAJAK (PTKP)</span>
                    </div>
                    <div className="relative w-full sm:w-1/3">
                      <ModernSelect
                        id="ptkpStatusTahunan"
                        value={ptkpStatus}
                        options={ptkpOptions}
                       
                       
                        onChange={(value) => setPtkpStatus(value as PtkpStatus)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex gap-3 text-xs font-semibold text-slate-300 w-full sm:w-2/3">
                      <span className="w-5 flex-shrink-0">17</span>
                      <span>PENGHASILAN KENA PAJAK SETAHUN/DISETAHUNKAN (15 - 16)</span>
                    </div>
                    <div className="relative w-full sm:w-1/3">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                      <input
                        type="text"
                        readOnly
                        value={formatNumberInput(annualPph21Result.taxableIncome)}
                        className="w-full bg-slate-900/30 border border-slate-800 text-slate-400 rounded-lg pl-9 pr-3 py-2 text-xs font-mono opacity-80 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex gap-3 text-xs font-semibold text-slate-300 w-full sm:w-2/3">
                      <span className="w-5 flex-shrink-0">18</span>
                      <span>PPh PASAL 21 ATAS PENGHASILAN KENA PAJAK SETAHUN/DISETAHUNKAN</span>
                    </div>
                    <div className="relative w-full sm:w-1/3">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                      <input
                        type="text"
                        readOnly
                        value={formatNumberInput(annualPph21Result.annualTax)}
                        className="w-full bg-slate-900/30 border border-slate-800 text-slate-400 rounded-lg pl-9 pr-3 py-2 text-xs font-mono opacity-80 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex gap-3 text-xs font-semibold text-slate-300 w-full sm:w-2/3">
                      <span className="w-5 flex-shrink-0">19</span>
                      <span>PPh PASAL 21 YANG TELAH DIPOTONG MASA PAJAK SEBELUMNYA</span>
                    </div>
                    <div className="relative w-full sm:w-1/3">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatNumberInput(withheldTaxCredit)}
                        onChange={(e) => handleNumberInput(e.target.value, setWithheldTaxCredit)}
                        placeholder="0"
                        className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/50">
                    <div className="flex gap-3 text-xs font-bold text-white w-full sm:w-2/3">
                      <span className="w-5 flex-shrink-0">20</span>
                      <span>PPh PASAL 21 TERUTANG (18 - 19)</span>
                    </div>
                    <div className="relative w-full sm:w-1/3">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                      <input
                        type="text"
                        readOnly
                        value={formatNumberInput(annualPph21Result.taxDue)}
                        className="w-full bg-blue-900/10 border border-blue-500/20 text-blue-100 rounded-lg pl-9 pr-3 py-2 text-xs font-mono opacity-90 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
                </div>
                <div className="p-4 border-t border-slate-800/80 flex justify-start items-center">
                  <Button type="button" onClick={() => setStep(2)} variant="secondary" className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    Kembali
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 gap-3">
                <Button
                  type="button"
                  onClick={() => handleSave('draft')}
                  variant="secondary"
                >
                  Simpan sebagai Draf
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSave('submitted')}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Selesaikan Laporan
                </Button>
              </div>
            </div>
          )}

          {/* BULANAN VIEW */}
          {jenisPemotongan === 'bulanan' && (
            <div className="space-y-6">
              {/* Box Rincian Karyawan */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/35">
                <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-800 rounded-t-[15px]">
                  <h3 className="text-xs font-bold tracking-wider text-white uppercase">Rincian karyawan</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PPh bulan</label>
                      <ModernSelect id="taxPeriod" value={taxPeriod} options={taxPeriodOptions} onChange={(value) => setTaxPeriod(value as TaxPeriod)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kode Objek Pajak</label>
                      <ModernSelect id="employmentStatus" value={employmentStatus} options={employmentStatusOptions} onChange={(value) => setEmploymentStatus(value as EmploymentStatus)} />
                    </div>
                    {taxPeriod === '12' && (
                      <div className="sm:col-span-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-4 flex gap-3 text-amber-200/90 text-xs sm:text-sm leading-relaxed items-start">
                        <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                        <p>Penerapan TER tidak berlaku untuk bulan Desember. Agar lebih akurat, Anda bisa hitung pph bulan Desember <button type="button" onClick={() => { setJenisPemotongan('tahunan'); setStep(1); }} className="text-amber-400 font-semibold hover:underline decoration-amber-400/50 underline-offset-2">disini</button></p>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status PTKP</label>
                      <ModernSelect id="ptkpStatus" value={ptkpStatus} options={ptkpOptions} onChange={(value) => setPtkpStatus(value as PtkpStatus)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skema perhitungan</label>
                      <SchemeRadioPicker
                        value={calculationScheme}
                        onChange={setCalculationScheme}
                        options={[
                          { value: 'gross', label: 'Gross', tooltip: 'PPh 21 dipotong dari penghasilan bruto yang Anda masukkan.' },
                          { value: 'gross_up', label: 'Gross Up', tooltip: 'PPh 21 ditanggung sebagai tunjangan pajak, lalu ikut menambah dasar penghasilan bruto.' }
                        ]}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tunjangan PPh</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                          <input type="text" inputMode="numeric" value={formatNumberInput(tunjangan)} onChange={(e) => handleNumberInput(e.target.value, setTunjangan)} placeholder="0" className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-mono" />
                        </div>
                      </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Penghasilan bruto</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                        <input type="text" inputMode="numeric" value={formatNumberInput(gaji)} onChange={(e) => handleNumberInput(e.target.value, setGaji)} placeholder="0" className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-mono" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box Info TER */}
              <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl text-xs space-y-2 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500">Kategori TER Bulanan:</span>
                  <span className="font-semibold text-blue-400">Kategori {terCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tarif TER Efektif:</span>
                  <span className="font-semibold text-indigo-400 font-mono">{(terRate * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between border-t border-slate-800/50 pt-2 font-bold">
                  <span className="text-slate-400">PPh 21 Bulan Ini:</span>
                  <span className="text-white font-mono">Rp {estimatedTax.toLocaleString('id-ID')}</span>
                </div>
                {isGrossUp && (
                  <>
                    <div className="flex justify-between border-t border-slate-800/50 pt-2">
                      <span className="text-slate-500">Tunjangan Pajak Gross Up:</span>
                      <span className="font-semibold text-blue-300 font-mono">Rp {pph21TaxAllowance.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bruto Setelah Gross Up:</span>
                      <span className="font-semibold text-slate-300 font-mono">Rp {pph21TaxableGrossIncome.toLocaleString('id-ID')}</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex justify-end pt-2 gap-3">
                <Button type="button" onClick={() => { setGaji(0); setTunjangan(0); }} variant="danger">Reset</Button>
              </div>
            </div>
          )}

          {/* FINAL VIEW */}
          {jenisPemotongan === 'final' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/35">
                <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-800 rounded-t-[15px]">
                  <h3 className="text-xs font-bold tracking-wider text-white uppercase">Objek Pajak Final</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jenis Pemotongan Final</label>
                    <ModernSelect id="finalTaxObjectPph21" value={finalTaxObjectPph21} options={pph21FinalOptions} onChange={(value) => setFinalTaxObjectPph21(value as Pph21FinalObject)} />
                  </div>
                  {finalTaxObjectPph21 === 'honorarium_apbn' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Golongan PNS/TNI/Polri</label>
                      <ModernSelect id="pnsGolongan" value={pnsGolongan} options={pnsGolonganOptions} onChange={(value) => setPnsGolongan(value)} />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Penghasilan Bruto</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                      <input type="text" inputMode="numeric" value={formatNumberInput(finalGrossIncome)} onChange={(e) => handleNumberInput(e.target.value, setFinalGrossIncome)} placeholder="0" className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-mono" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl text-xs space-y-2 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tarif Pajak Final:</span>
                  <span className="font-semibold text-indigo-400 font-mono">{calculatePph21Final(finalGrossIncome, finalTaxObjectPph21, pnsGolongan).ratePercent}%</span>
                </div>
                <div className="flex justify-between border-t border-slate-800/50 pt-2 font-bold">
                  <span className="text-slate-400">Pajak Terutang (Final):</span>
                  <span className="text-white font-mono">Rp {calculatePph21Final(finalGrossIncome, finalTaxObjectPph21, pnsGolongan).taxDue.toLocaleString('id-ID')}</span>
                </div>
              </div>
              
              <div className="flex justify-end pt-2 gap-3">
                <Button type="button" onClick={() => setFinalGrossIncome(0)} variant="danger">Reset</Button>
              </div>
            </div>
          )}

          {/* TIDAK FINAL VIEW */}
          {jenisPemotongan === 'tidak_final' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/35">
                <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-800 rounded-t-[15px]">
                  <h3 className="text-xs font-bold tracking-wider text-white uppercase">Rincian Penerima Penghasilan</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kode Objek Pajak</label>
                      <ModernSelect id="tidakFinalCategory" value={tidakFinalCategory} options={pph21TidakFinalOptions} onChange={(value) => setTidakFinalCategory(value as Pph21TidakFinalCategory)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kepemilikan NPWP</label>
                      <ModernSelect id="tidakFinalHasNpwp" value={tidakFinalHasNpwp ? 'true' : 'false'} options={[{value: 'true', label: 'Ya, Memiliki NPWP'}, {value: 'false', label: 'Tidak Memiliki NPWP'}]} onChange={(value) => setTidakFinalHasNpwp(value === 'true')} />
                    </div>
                    {tidakFinalCategory === '21-100-03' && (
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jenis</label>
                        <ModernSelect id="tidakFinalJenis" value={tidakFinalJenis || 'non_bulanan'} options={pph21TidakFinalJenisOptions} onChange={(value) => setTidakFinalJenis(value as Pph21TidakFinalJenis)} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Penghasilan Bruto</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs font-semibold text-slate-500">Rp</span>
                      <input type="text" inputMode="numeric" value={formatNumberInput(tidakFinalGrossIncome)} onChange={(e) => handleNumberInput(e.target.value, setTidakFinalGrossIncome)} placeholder="0" className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-mono" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl text-xs space-y-2 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500">Dasar Pengenaan Pajak (DPP):</span>
                  <span className="font-semibold text-slate-300 font-mono">Rp {calculatePph21TidakFinal(tidakFinalGrossIncome, tidakFinalCategory, tidakFinalHasNpwp, tidakFinalJenis).dpp.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tarif Pajak:</span>
                  <span className="font-semibold text-indigo-400 font-mono">{calculatePph21TidakFinal(tidakFinalGrossIncome, tidakFinalCategory, tidakFinalHasNpwp, tidakFinalJenis).ratePercent}%</span>
                </div>
                {!tidakFinalHasNpwp && (
                  <div className="flex justify-between">
                    <span className="text-rose-400">Denda Tanpa NPWP:</span>
                    <span className="font-semibold text-rose-400 font-mono">+20%</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-800/50 pt-2 font-bold">
                  <span className="text-slate-400">Total PPh 21 Terutang:</span>
                  <span className="text-white font-mono">Rp {calculatePph21TidakFinal(tidakFinalGrossIncome, tidakFinalCategory, tidakFinalHasNpwp, tidakFinalJenis).taxDue.toLocaleString('id-ID')}</span>
                </div>
              </div>
              
              <div className="flex justify-end pt-2 gap-3">
                <Button type="button" onClick={() => setTidakFinalGrossIncome(0)} variant="danger">Reset</Button>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </>
  );
}

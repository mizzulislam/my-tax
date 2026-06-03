import Tooltip from '../Tooltip';
import { ModernSelect, SelectOption } from '@/components/ui/ModernSelect';

export type TaxPeriod = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12';
export type EmploymentStatus = '21-100-01' | '21-100-02';
export type CalculationScheme = 'gross' | 'gross_up';
export type JenisPemotongan = 'bulanan' | 'final' | 'tidak_final' | 'tahunan';

export const jenisPemotonganOptions = [
  { value: 'bulanan', label: 'PPh 21 Bulanan' },
  { value: 'final', label: 'PPh 21 Final' },
  { value: 'tidak_final', label: 'PPh 21 Tidak Final' },
  { value: 'tahunan', label: 'PPh 21 Tahunan' },
];

export type SaveDialog = {
  title: string;
  message: string;
  label: string;
};
export type CalculatorType = 'pph21' | 'ppn' | 'ppnbm' | 'pph23' | 'pphUnifikasi' | 'pphFinal' | 'pph26' | 'pphBadan' | 'bphtb' | 'pbbP2' | 'pajakDaerah' | 'sanksiPajak' | 'beaMeterai';

export const calculatorOptions: Array<{
  id: CalculatorType;
  title: string;
  subtitle: string;
  tone: string;
}> = [
  { id: 'pph21', title: 'PPh 21', subtitle: 'Karyawan dan OP', tone: 'from-cyan-400 to-blue-500' },
  { id: 'ppn', title: 'PPN', subtitle: 'BKP/JKP 2025', tone: 'from-blue-400 to-indigo-500' },
  { id: 'ppnbm', title: 'PPnBM', subtitle: 'Barang mewah', tone: 'from-rose-400 to-blue-400' },
  { id: 'pph23', title: 'PPh 23', subtitle: 'Jasa, sewa, royalti', tone: 'from-sky-400 to-emerald-400' },
  { id: 'pphUnifikasi', title: 'PPh Unifikasi', subtitle: '4(2), 15, 22, 23, 26', tone: 'from-cyan-400 to-violet-400' },
  { id: 'pphFinal', title: 'PPh Final', subtitle: 'UMKM dan properti', tone: 'from-amber-400 to-blue-400' },
  { id: 'pph26', title: 'PPh 26', subtitle: 'Subjek luar negeri', tone: 'from-indigo-300 to-emerald-400' },
  { id: 'pphBadan', title: 'PPh Badan', subtitle: 'Laba kena pajak', tone: 'from-violet-500 to-sky-400' },
  { id: 'bphtb', title: 'BPHTB', subtitle: 'Perolehan tanah/bangunan', tone: 'from-emerald-400 to-blue-400' },
  { id: 'pbbP2', title: 'PBB-P2', subtitle: 'Bumi bangunan daerah', tone: 'from-teal-300 to-blue-400' },
  { id: 'pajakDaerah', title: 'Pajak Daerah', subtitle: 'PKB, PBJT, reklame', tone: 'from-lime-300 to-cyan-400' },
  { id: 'sanksiPajak', title: 'Sanksi Pajak', subtitle: 'Denda & bunga KUP', tone: 'from-red-300 to-amber-300' },
  { id: 'beaMeterai', title: 'Bea Meterai', subtitle: 'Dokumen transaksi', tone: 'from-slate-300 to-blue-400' },
];

export const formatRupiah = (value: number) => `Rp ${Math.round(value).toLocaleString('id-ID')}`;
export const formatNumberInput = (value: number) => value > 0 ? Math.round(value).toLocaleString('id-ID') : '';
export const parseFormattedNumber = (value: string) => {
  const normalized = value.replace(/[^\d]/g, '');
  return normalized ? Number(normalized) : 0;
};
export const parseDecimalNumber = (value: string) => {
  const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
  const firstDotIndex = normalized.indexOf('.');
  const decimal = firstDotIndex === -1
    ? normalized
    : `${normalized.slice(0, firstDotIndex + 1)}${normalized.slice(firstDotIndex + 1).replace(/\./g, '')}`;
  const parsed = Number(decimal);
  return Number.isFinite(parsed) ? parsed : 0;
};
export const currentYear = new Date().getFullYear();

export const taxPeriodOptions: SelectOption[] = [
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

export const ptkpOptions: SelectOption[] = [
  { value: 'TK/0', label: 'TK/0' },
  { value: 'TK/1', label: 'TK/1' },
  { value: 'TK/2', label: 'TK/2' },
  { value: 'TK/3', label: 'TK/3' },
  { value: 'K/0', label: 'K/0' },
  { value: 'K/1', label: 'K/1' },
  { value: 'K/2', label: 'K/2' },
  { value: 'K/3', label: 'K/3' },
];

export const employmentStatusOptions: SelectOption[] = [
  { value: '21-100-01', label: '21-100-01 (Pegawai Tetap)' },
  { value: '21-100-02', label: '21-100-02 (Penerima Pensiun Berkala)' },
];

export const vatModeOptions: SelectOption[] = [
  { value: 'non_luxury_2025', label: 'BKP/JKP Non-Mewah 2025 - Efektif 11%' },
  { value: 'standard', label: 'DPP Normal - Tarif 12%' },
];

export const ppnbmRateOptions: SelectOption[] = [
  { value: '10', label: 'Kelompok 10%' },
  { value: '20', label: 'Kelompok 20%' },
  { value: '40', label: 'Kelompok 40%' },
  { value: '50', label: 'Kelompok 50%' },
  { value: '75', label: 'Kelompok 75%' },
];

export const pph23Options: SelectOption[] = [
  { value: 'service_rent', label: 'Sewa / Jasa - 2%' },
  { value: 'royalty_dividend_interest', label: 'Dividen / Bunga / Royalti / Hadiah - 15%' },
];

export const pphUnificationOptions: SelectOption[] = [
  { value: 'pph22_government_goods', label: 'PPh 22 Bendahara Pemerintah - 1,5%' },
  { value: 'pph22_import_api', label: 'PPh 22 Impor API - 2,5%' },
  { value: 'pph22_import_non_api', label: 'PPh 22 Impor Non-API - 7,5%' },
  { value: 'pph22_luxury_goods', label: 'PPh 22 Barang Sangat Mewah - 5%' },
  { value: 'pph23_service_rent', label: 'PPh 23 Sewa/Jasa - 2%' },
  { value: 'pph23_royalty_dividend_interest', label: 'PPh 23 Dividen/Bunga/Royalti - 15%' },
  { value: 'pph4_land_building_transfer', label: 'PPh 4(2) Pengalihan Tanah/Bangunan - 2,5%' },
  { value: 'pph4_land_building_rent', label: 'PPh 4(2) Sewa Tanah/Bangunan - 10%' },
  { value: 'pph15_domestic_shipping', label: 'PPh 15 Pelayaran Dalam Negeri - 1,2%' },
  { value: 'pph26_gross_income', label: 'PPh 26 Penghasilan Bruto - 20%' },
];

export const finalTaxOptions: SelectOption[] = [
  { value: 'umkm_individual', label: 'UMKM Orang Pribadi - 0,5% setelah Rp 500 juta' },
  { value: 'umkm_entity', label: 'UMKM Badan - 0,5%' },
  { value: 'land_building_rent', label: 'Sewa Tanah/Bangunan - 10%' },
  { value: 'land_building_transfer', label: 'Pengalihan Tanah/Bangunan - 2,5%' },
];

export const pph21FinalOptions: SelectOption[] = [
  { value: 'pesangon', label: 'Uang Pesangon' },
  { value: 'pensiun', label: 'Uang Manfaat Pensiun Sekaligus' },
  { value: 'honorarium_apbn', label: 'Honorarium/Imbalan PNS Beban APBN/APBD' },
];

export const pnsGolonganOptions: SelectOption[] = [
  { value: 'I_II', label: 'Gol. I & II / Tamtama & Bintara (0%)' },
  { value: 'III', label: 'Gol. III / Perwira Pertama (5%)' },
  { value: 'IV', label: 'Gol. IV / Perwira Menengah & Tinggi (15%)' },
];

export const pph21TidakFinalOptions: SelectOption[] = [
  { value: '21-100-03', label: '21-100-03 Pegawai Tidak Tetap' },
  { value: '21-100-04', label: '21-100-04 Distributor Pemasaran Berjenjang' },
  { value: '21-100-05', label: '21-100-05 Agen Asuransi' },
  { value: '21-100-06', label: '21-100-06 Penjaja Barang Dagangan' },
  { value: '21-100-07', label: '21-100-07 Tenaga Ahli' },
  { value: '21-100-08', label: '21-100-08 Seniman' },
  { value: '21-100-09', label: '21-100-09 Bukan Pegawai Lainnya' },
  { value: '21-100-10', label: '21-100-10 Anggota Dewan Komisaris...' },
  { value: '21-100-11', label: '21-100-11 Mantan Pegawai...' },
  { value: '21-100-12', label: '21-100-12 Pegawai yang Melakukan Penarikan...' },
  { value: '21-100-13', label: '21-100-13 Peserta Kegiatan' },
];

export const pph21TidakFinalJenisOptions: SelectOption[] = [
  { value: 'non_bulanan', label: '21-100-03 Upah Pegawai Tidak Tetap Non Bulanan' },
  { value: 'bulanan', label: '21-100-03 Upah Pegawai Tidak Tetap Bulanan' },
];

export const pph26Options: SelectOption[] = [
  { value: 'gross_income', label: 'Dividen/Bunga/Royalti/Jasa/Sewa - 20% bruto' },
  { value: 'asset_transfer', label: 'Pengalihan harta tertentu - efektif 5%' },
  { value: 'insurance_premium', label: 'Premi asuransi luar negeri - basis neto 50%' },
];

export const corporateTaxModeOptions: SelectOption[] = [
  { value: 'general', label: 'WP Badan umum - 22%' },
  { value: 'public_company', label: 'Perseroan terbuka memenuhi syarat - 19%' },
  { value: 'umkm_final', label: 'Badan UMKM final - 0,5% omzet' },
];

export const localTaxOptions: SelectOption[] = [
  { value: 'pkb_first', label: 'PKB pertama - maks 1,2%' },
  { value: 'pkb_progressive_max', label: 'PKB progresif - maks 6%' },
  { value: 'bbnkb', label: 'BBNKB - maks 12%' },
  { value: 'pbjt_general', label: 'PBJT umum - maks 10%' },
  { value: 'pbjt_specific_entertainment', label: 'PBJT hiburan tertentu - 40%' },
  { value: 'reklame', label: 'Pajak reklame - maks 25%' },
  { value: 'air_tanah', label: 'Pajak air tanah - maks 20%' },
  { value: 'pbbkb', label: 'PBBKB - maks 10%' },
  { value: 'rokok', label: 'Pajak rokok - 10%' },
  { value: 'mblb', label: 'Pajak MBLB - maks 20%' },
  { value: 'sarang_burung_walet', label: 'Pajak sarang burung walet - maks 10%' },
];

export const taxPenaltyOptions: SelectOption[] = [
  { value: 'late_spt_annual_individual', label: 'Terlambat SPT Tahunan OP - Rp100.000' },
  { value: 'late_spt_annual_corporate', label: 'Terlambat SPT Tahunan Badan - Rp1.000.000' },
  { value: 'late_spt_vat_period', label: 'Terlambat SPT Masa PPN - Rp500.000' },
  { value: 'late_spt_other_period', label: 'Terlambat SPT Masa lainnya - Rp100.000' },
  { value: 'interest_collection', label: 'Bunga penagihan/angsuran Pasal 19 - 0,55%/bulan' },
  { value: 'interest_correction_late_payment', label: 'Pembetulan/terlambat setor - 0,97%/bulan' },
  { value: 'interest_disclosure', label: 'Pengungkapan ketidakbenaran - 1,39%/bulan' },
  { value: 'interest_skpkb', label: 'SKPKB Pasal 13(2) - 1,80%/bulan' },
  { value: 'interest_skpkb_additional', label: 'Tambahan SKPKB Pasal 13(3b) - 2,22%/bulan' },
];

export const taxYearOptions: SelectOption[] = Array.from({ length: 9 }, (_, index) => {
  const year = currentYear + 3 - index;
  return { value: String(year), label: String(year) };
});

export function YearCombobox({
  id,
  value,
  options,
  open,
  onToggle,
  onChange,
}: {
  id: string;
  value: number;
  options: SelectOption[];
  open: boolean;
  onToggle: (id: string | null) => void;
  onChange: (value: number) => void;
}) {
  return (
    <div className="relative">
      <div className="group flex w-full items-center justify-between gap-3 rounded-md border border-slate-700/55 bg-slate-950/40 px-3.5 py-2.5 text-left text-sm text-white outline-none transition hover:border-blue-500/50 hover:bg-slate-950/70 focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/25">
        <input
          type="text"
          inputMode="numeric"
          value={String(value)}
          onFocus={() => onToggle(id)}
          onChange={(event) => {
            const parsed = parseFormattedNumber(event.target.value);
            onChange(parsed || currentYear);
          }}
          className="min-w-0 flex-1 bg-transparent font-mono text-sm text-white outline-none"
          aria-label="Tahun Pajak"
        />
        <button
          type="button"
          onClick={() => onToggle(open ? null : id)}
          className="flex-shrink-0 text-slate-300 transition hover:text-blue-300"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180 text-blue-300' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-blue-500/25 bg-slate-950/95 p-1.5 shadow-2xl shadow-blue-950/30 backdrop-blur-xl">
          <div className="max-h-64 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(59,130,246,0.45)_rgba(15,23,42,0.8)]" role="listbox">
            {options.map((option) => {
              const active = option.value === String(value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(Number(option.value));
                    onToggle(null);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                  role="option"
                  aria-selected={active}
                >
                  <span>{option.label}</span>
                  {active && (
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="m5 13 4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


export function SchemeRadioPicker<T extends string | boolean>({
  value,
  onChange,
  options
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; tooltip?: string }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Skema Perhitungan">
      {options.map((option, index) => {
        const selected = value === option.value;
        return (
          <div
            key={String(option.value) + index}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onChange(option.value);
              }
            }}
            tabIndex={0}
            className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left outline-none transition focus:ring-2 focus:ring-blue-500/30 ${
              selected
                ? 'border-blue-500/70 bg-blue-500/10 text-white shadow-lg shadow-blue-950/20'
                : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-blue-500/45 hover:bg-slate-950/70'
            }`}
            role="radio"
            aria-checked={selected}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${selected ? 'border-blue-400' : 'border-slate-500'}`}>
                {selected && <span className="h-2.5 w-2.5 rounded-full bg-blue-400"></span>}
              </span>
              <span className="truncate text-sm font-bold">{option.label}</span>
            </span>
            {option.tooltip && <Tooltip content={option.tooltip} />}
          </div>
        );
      })}
    </div>
  );
}



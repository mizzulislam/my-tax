import Tooltip from '../Tooltip';
import { SelectOption } from '@/components/ui/ModernSelect';

﻿export const formatNumberInput = (value: number) => value > 0 ? Math.round(value).toLocaleString('id-ID') : '';
export const parseFormattedNumber = (value: string) => {
  const normalized = value.replace(/[^\d]/g, '');
  return normalized ? Number(normalized) : 0;
};

export const toTitleCase = (str: string) => {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
};

export const currentYear = new Date().getFullYear();

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
    <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
      {options.map((option, index) => {
        const selected = value === option.value;
        return (
          <div
            key={String(option.value) + index}
            onClick={() => onChange(option.value)}
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
            {option.tooltip && <Tooltip content={option.tooltip} align={index % 2 !== 0 ? 'right' : 'center'} />}
          </div>
        );
      })}
    </div>
  );
}

export const taxPeriodOptions: SelectOption[] = [
  { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' }, { value: '03', label: 'Maret' },
  { value: '04', label: 'April' }, { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' }, { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
];

export const ptkpOptions: SelectOption[] = [
  { value: 'TK/0', label: 'TK/0' }, { value: 'TK/1', label: 'TK/1' }, { value: 'TK/2', label: 'TK/2' }, { value: 'TK/3', label: 'TK/3' },
  { value: 'K/0', label: 'K/0' }, { value: 'K/1', label: 'K/1' }, { value: 'K/2', label: 'K/2' }, { value: 'K/3', label: 'K/3' },
];

export const jenisPemotonganOptions: SelectOption[] = [
  { value: 'bulanan', label: 'PPh 21 Bulanan' },
  { value: 'tahunan', label: 'PPh 21 Tahunan' },
];

export const pph21TidakFinalOptions: SelectOption[] = [
  { value: '21-100-03', label: '21-100-03 Pegawai Tidak Tetap' },
  { value: '21-100-04', label: '21-100-04 Distributor Pemasaran Berjenjang' },
  { value: '21-100-05', label: '21-100-05 Agen Asuransi' },
  { value: '21-100-06', label: '21-100-06 Penjaja Barang Dagangan' },
  { value: '21-100-07', label: '21-100-07 Tenaga Ahli' },
  { value: '21-100-08', label: '21-100-08 Seniman' },
  { value: '21-100-09', label: '21-100-09 Bukan Pegawai Lainnya' },
];

export const corporateTaxModeOptions: SelectOption[] = [
  { value: 'general', label: 'WP Badan umum - 22%' },
  { value: 'public_company', label: 'Perseroan terbuka - 19%' },
  { value: 'umkm_final', label: 'Badan UMKM final - 0,5% omzet' },
];

export const pph23SewaOptions: SelectOption[] = [
  { value: 'pphFinal', label: 'Sewa Tanah/Bangunan (PPh Final 10%)' },
  { value: 'pph23', label: 'Sewa Harta Lainnya (PPh 23 - 2%)' },
];

export const investasiOptions: SelectOption[] = [
  { value: 'investasi_dividen', label: 'Dividen (PPh Final - 10%)' },
  { value: 'investasi_bunga', label: 'Bunga/Royalti (PPh 23 - 15%)' },
  { value: 'investasi_luar_negeri', label: 'Subjek Luar Negeri (PPh 26 - 20%)' },
];

export const pphUnificationOptions: SelectOption[] = [
  { value: 'pph22_government_goods', label: 'PPh 22 Bendahara Pemerintah - 1,5%' },
  { value: 'pph22_import_api', label: 'PPh 22 Impor API - 2,5%' },
  { value: 'pph22_import_non_api', label: 'PPh 22 Impor Non-API - 7,5%' },
  { value: 'pph4_land_building_transfer', label: 'PPh 4(2) Pengalihan Tanah/Bangunan - 2,5%' },
  { value: 'pph15_domestic_shipping', label: 'PPh 15 Pelayaran Dalam Negeri - 1,2%' },
];


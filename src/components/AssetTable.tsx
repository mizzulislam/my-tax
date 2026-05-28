'use client';

import { useFetchAssets, useDeleteAsset } from '@/hooks/useAssets';
import { Asset } from '@/types/taxpayer';
import { useAlert } from '@/contexts/AlertContext';

interface AssetTableProps {
  taxYear: number;
  onEdit: (asset: Asset) => void;
}

const TYPE_LABELS: Record<string, { label: string; badge: string }> = {
  tanah_bangunan: {
    label: 'Tanah & Bangunan',
    badge: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  },
  kendaraan: {
    label: 'Kendaraan (Mobil/Motor)',
    badge: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
  },
  deposito_tabungan: {
    label: 'Simpanan Bank / Deposito',
    badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  },
  saham_obligasi: {
    label: 'Investasi / Surat Berharga',
    badge: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
  },
  piutang: {
    label: 'Piutang Dana',
    badge: 'bg-slate-500/10 border-slate-500/30 text-slate-300',
  },
  perhiasan: {
    label: 'Emas / Perhiasan',
    badge: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  },
  peralatan: {
    label: 'Peralatan / Elektronik',
    badge: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  },
  lainnya: {
    label: 'Aset Lain-lain',
    badge: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
  },
};

export default function AssetTable({ taxYear, onEdit }: AssetTableProps) {
  const { data: assets = [], isLoading, isError, error } = useFetchAssets(taxYear);
  const deleteMutation = useDeleteAsset();
  const { showAlert, showConfirm } = useAlert();

  const handleDelete = async (id: string, name: string) => {
    if (await showConfirm('Hapus Aset', `Apakah Anda yakin ingin menghapus aset "${name}"?`, 'Ya, Hapus', 'Batal')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Kesalahan tidak dikenal.';
        await showAlert('Gagal', `Gagal menghapus data: ${message}`, 'error');
      }
    }
  };

  const totalAcquisition = assets.reduce((acc, curr) => acc + curr.acquisitionValue, 0);
  const totalCurrent = assets.reduce((acc, curr) => acc + (curr.currentValue || curr.acquisitionValue), 0);

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4">
      <div className="p-5 border-b border-slate-800 bg-slate-950/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Daftar Harta & Aset ({taxYear})
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            Rincian kekayaan pribadi yang wajib dilaporkan dalam lampiran SPT.
          </p>
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-4 px-6">Nama Harta / Aset</th>
              <th className="py-4 px-6">Kategori</th>
              <th className="py-4 px-6 font-mono">Tahun Perolehan</th>
              <th className="py-4 px-6">Nilai Perolehan</th>
              <th className="py-4 px-6">Nilai Pasar Saat Ini</th>
              <th className="py-4 px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-xs font-medium">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent mr-2"></div>
                  Memuat daftar harta/aset...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-red-400 font-medium">
                  Gagal memuat data: {error?.message}
                </td>
              </tr>
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 font-medium leading-relaxed">
                  Belum ada harta/aset yang tercatat untuk tahun pajak {taxYear}.
                </td>
              </tr>
            ) : (
              assets.map((a) => (
                <tr key={a.id} className="hover:bg-slate-900/20 transition-all duration-150">
                  <td className="py-4.5 px-6">
                    <span className="font-bold text-white block mb-0.5">{a.assetName}</span>
                    {a.description ? (
                      <span className="text-[10px] text-slate-500 block max-w-xs truncate">{a.description}</span>
                    ) : (
                      <span className="text-[10px] text-slate-600 block">Tidak ada deskripsi tambahan</span>
                    )}
                  </td>
                  <td className="py-4.5 px-6 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        TYPE_LABELS[a.assetType]?.badge || 'bg-slate-500/10 border-slate-500/30 text-slate-300'
                      }`}
                    >
                      {TYPE_LABELS[a.assetType]?.label || a.assetType}
                    </span>
                  </td>
                  <td className="py-4.5 px-6 font-mono text-slate-300 font-bold whitespace-nowrap">
                    {a.acquisitionYear}
                  </td>
                  <td className="py-4.5 px-6 font-bold text-white font-mono whitespace-nowrap">
                    Rp {a.acquisitionValue.toLocaleString('id-ID')}
                  </td>
                  <td className="py-4.5 px-6 font-bold text-blue-400 font-mono whitespace-nowrap">
                    Rp {(a.currentValue || a.acquisitionValue).toLocaleString('id-ID')}
                  </td>
                  <td className="py-4.5 px-6 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => onEdit(a)}
                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-lg transition-colors border border-blue-500/20"
                        title="Edit Harta"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          ></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(a.id, a.assetName)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors border border-red-500/20"
                        title="Hapus Harta"
                        disabled={deleteMutation.isPending}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4 p-4">
        {isLoading ? (
          <div className="py-8 text-center text-slate-500 font-medium text-xs">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent mr-2"></div>
            Memuat daftar harta/aset...
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-red-400 font-medium text-xs">
            Gagal memuat data: {error?.message}
          </div>
        ) : assets.length === 0 ? (
          <div className="py-8 text-center text-slate-500 font-medium text-xs leading-relaxed">
            Belum ada harta/aset yang tercatat untuk tahun pajak {taxYear}.
          </div>
        ) : (
          assets.map((a) => (
            <div key={a.id} className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h5 className="font-bold text-white text-sm leading-tight">{a.assetName}</h5>
                  <span
                    className={`mt-1.5 inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      TYPE_LABELS[a.assetType]?.badge || 'bg-slate-500/10 border-slate-500/30 text-slate-300'
                    }`}
                  >
                    {TYPE_LABELS[a.assetType]?.label || a.assetType}
                  </span>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => onEdit(a)}
                    className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors border border-blue-500/20"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button
                    onClick={() => handleDelete(a.id, a.assetName)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-800/50">
                <div>
                  <p className="text-slate-500 font-medium text-[10px] uppercase">Tahun Perolehan</p>
                  <p className="font-mono text-slate-300 font-bold mt-0.5">{a.acquisitionYear}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium text-[10px] uppercase">Nilai Perolehan</p>
                  <p className="font-mono text-white font-bold mt-0.5">Rp {a.acquisitionValue.toLocaleString('id-ID')}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500 font-medium text-[10px] uppercase">Nilai Pasar Saat Ini</p>
                  <p className="font-mono text-blue-400 font-bold mt-0.5">Rp {(a.currentValue || a.acquisitionValue).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {assets.length > 0 && (
        <div className="p-5 border-t border-slate-800 bg-slate-950/20 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="flex justify-between items-center md:border-r md:border-slate-800/80 md:pr-6">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Nilai Perolehan:</span>
            <span className="text-md font-black text-slate-300 font-mono">
              Rp {totalAcquisition.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between items-center md:pl-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Estimasi Nilai Pasar:</span>
            <span className="text-md font-black text-blue-400 font-mono">
              Rp {totalCurrent.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

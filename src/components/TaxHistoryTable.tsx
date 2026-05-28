import { useState } from 'react';
import { TaxReportData } from '@/hooks/useFetchReports';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { useCreateBillingCode } from '@/hooks/useBillingCodes';
import { buildDraftPaymentPayload } from '@/lib/billingGenerator';
import { useAlert } from '@/contexts/AlertContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export default function TaxHistoryTable({ 
  data,
  variant = 'full',
  onViewAll
}: { 
  data: TaxReportData[];
  variant?: 'full' | 'compact';
  onViewAll?: () => void;
}) {
  const createBilling = useCreateBillingCode();
  const { showAlert, showConfirm } = useAlert();
  const queryClient = useQueryClient();
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      const response = await fetch(`/api/tax-reports?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Terjadi kesalahan saat menghapus laporan.');
      }
    },
    onSuccess: (_, id) => {
      setDeletedIds(prev => {
        const newSet = new Set(prev);
        newSet.add(id);
        return newSet;
      });
      queryClient.setQueryData(['tax_reports_list'], (oldData: TaxReportData[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter((report) => report.id !== id);
      });
      queryClient.invalidateQueries({ queryKey: ['tax_reports_list'] });
      showAlert('Berhasil', 'Laporan berhasil dihapus.', 'success');
    },
    onError: (error) => {
      showAlert('Gagal', `Gagal menghapus laporan: ${error.message}`, 'error');
    }
  });

  const handleDelete = async (id: string) => {
    if (await showConfirm('Hapus Laporan', 'Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.', 'Ya, Hapus', 'Batal')) {
      deleteMutation.mutate(id);
    }
  };
  
  const getStatusBadge = (status: TaxReportData['status']) => {
    const baseClass = "px-3 py-1.5 text-xs font-bold rounded-full tracking-wider uppercase inline-flex items-center gap-2 shadow-sm backdrop-blur-md";
    switch (status) {
      case 'draft':
        return `${baseClass} bg-orange-500/10 text-orange-400 border border-orange-500/20`;
      case 'submitted':
        return `${baseClass} bg-blue-500/10 text-blue-400 border border-blue-500/20`;
      case 'paid':
        return `${baseClass} bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`;
      case 'overdue':
        return `${baseClass} bg-red-500/10 text-red-400 border border-red-500/20`;
      default:
        return `${baseClass} bg-slate-500/10 text-slate-400 border border-slate-500/20`;
    }
  };

  const getStatusLabel = (status: TaxReportData['status']) => {
    if (status === 'paid') return 'arsip lama';
    if (status === 'submitted') return 'ditinjau';
    return status;
  };

  const formatTaxPeriod = (period: string) => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const num = parseInt(period, 10);
    if (!isNaN(num) && num >= 1 && num <= 12) {
      return monthNames[num - 1];
    }
    return period;
  };

  const addDraftWatermark = (doc: jsPDF) => {
    const pageCount = doc.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page);
      doc.setTextColor(226, 232, 240);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.text('DRAF - BUKAN DOKUMEN RESMI DJP', 105, 150, {
        align: 'center',
        angle: 35,
      });
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text(`My Tax App - Halaman ${page} dari ${pageCount}`, 15, 288);
      doc.text(`Dibuat: ${new Date().toLocaleString('id-ID')}`, 195, 288, { align: 'right' });
    }
  };

  const handleExportPDF = async (report: TaxReportData) => {
    try {
      const doc = new jsPDF();
      const verificationCode = `DRAFT-${report.tax_year}-${report.tax_period}-${report.id.slice(0, 8).toUpperCase()}`;
      const qrDataUrl = await QRCode.toDataURL(buildDraftPaymentPayload({
        draftReference: verificationCode,
        amount: report.tax_payable,
        reportId: report.id,
      }), { margin: 1, width: 160 });
      
      doc.setFillColor(15, 23, 42); // slate 900
      doc.rect(0, 0, 210, 297, 'F');
      
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 6, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.text('MY TAX APP', 20, 44);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(203, 213, 225); // slate 300
      doc.text('Ringkasan Profesional Perhitungan PPh Orang Pribadi', 20, 54);
      doc.text('Simulasi internal untuk pelaporan SPT, bukan bukti resmi DJP.', 20, 62);

      doc.setFillColor(30, 41, 59);
      doc.roundedRect(20, 92, 170, 70, 4, 4, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Identitas Dokumen', 30, 110);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(203, 213, 225);
      doc.text(`ID Laporan: ${report.id}`, 30, 124);
      doc.text(`Tahun/Masa Pajak: ${report.tax_year} / ${report.tax_period}`, 30, 134);
      doc.text(`Status Internal: ${getStatusLabel(report.status).toUpperCase()}`, 30, 144);
      doc.text(`Referensi Draft: ${verificationCode}`, 30, 154);

      doc.addImage(qrDataUrl, 'PNG', 154, 112, 26, 26);
      doc.setFontSize(10);
      doc.setTextColor(147, 197, 253);
      doc.text('QR Draft', 156, 146);

      doc.setTextColor(226, 232, 240);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(`PPh Terutang: Rp ${Number(report.tax_payable).toLocaleString('id-ID')}`, 20, 204);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Penghasilan Bruto: Rp ${Number(report.gross_income).toLocaleString('id-ID')}`, 20, 214);
      doc.text(`Tanggal arsip: ${new Date(report.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 224);

      doc.addPage();
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Detail Perhitungan Pajak', 15, 24);

      autoTable(doc, {
        startY: 36,
        head: [['Komponen', 'Nilai', 'Catatan']],
        body: [
          ['Penghasilan Bruto', `Rp ${Number(report.gross_income).toLocaleString('id-ID')}`, 'Total penghasilan yang menjadi dasar simulasi.'],
          ['PPh Terutang', `Rp ${Number(report.tax_payable).toLocaleString('id-ID')}`, 'Hasil perhitungan engine aplikasi.'],
          ['Tarif Efektif', `${report.gross_income > 0 ? ((report.tax_payable / report.gross_income) * 100).toFixed(2) : '0.00'}%`, 'PPh terutang dibanding penghasilan bruto.'],
          ['Status Internal', getStatusLabel(report.status).toUpperCase(), 'Status internal aplikasi.'],
        ],
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        alternateRowStyles: { fillColor: [241, 245, 249] },
      });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Catatan Kepatuhan', 15, 112);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text([
        '1. Simpan bukti potong, dokumen penghasilan, dan bukti pembayaran untuk arsip SPT.',
        '2. Pastikan angka final sesuai dokumen resmi pemberi kerja atau pembukuan usaha.',
        '3. Dokumen ini adalah ringkasan aplikasi, bukan pengganti BPE, SPT, atau kode billing DJP.',
      ], 15, 122);

      doc.addPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text('Visual Ringkasan dan Referensi Draft', 15, 24);

      const taxRatio = report.gross_income > 0 ? Math.min(report.tax_payable / report.gross_income, 1) : 0;
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(20, 52, 170, 18, 3, 3, 'F');
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(20, 52, 170 * taxRatio, 18, 3, 3, 'F');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`Rasio PPh terhadap bruto: ${(taxRatio * 100).toFixed(2)}%`, 20, 82);

      doc.addImage(qrDataUrl, 'PNG', 82, 102, 46, 46);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(verificationCode, 105, 158, { align: 'center' });

      addDraftWatermark(doc);

      doc.save(`Ringkasan_Pajak_${report.tax_year}_${report.tax_period}.pdf`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan tidak dikenal.';
      await showAlert('Ekspor Gagal', 'Gagal mengekspor PDF: ' + message, 'error');
    }
  };

  const handleCreateBilling = (report: TaxReportData) => {
    createBilling.mutate(report, {
      onSuccess: (billing) => {
        showAlert('Draft Disiapkan', `Draft pembayaran ${billing.billingCode} disiapkan. Ini bukan kode billing DJP dan tidak dapat dipakai untuk membayar pajak.`, 'success');
      },
      onError: (error) => {
        showAlert('Gagal', `Gagal menyiapkan draft pembayaran: ${error.message}`, 'error');
      },
    });
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500">
      <div className="p-4 md:p-8 border-b border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
        <div>
          <h3 className="font-bold text-lg md:text-xl text-white tracking-tight">Riwayat Pelaporan</h3>
          <p className="text-xs md:text-sm text-slate-500 mt-1">Pantau arsip kalkulasi, status internal aplikasi, dan ekspor ringkasan pendukung.</p>
        </div>
      </div>
      
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 md:py-24 px-5 md:px-6 text-center">
          <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 md:mb-6 shadow-inner">
            <svg className="w-7 h-7 md:w-10 md:h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h4 className="text-base md:text-lg font-medium text-slate-300 mb-2">Belum Ada Dokumen</h4>
          <p className="text-xs md:text-sm text-slate-500 max-w-sm">Mulai simulasi pertama Anda menggunakan panel di samping untuk melihat riwayat tersimpan.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto w-full [scrollbar-width:thin] [scrollbar-color:rgba(59,130,246,0.5)_transparent]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider md:tracking-widest border-b border-slate-800/50 divide-x divide-slate-800/30">
                  <th className="p-2 md:p-4 whitespace-nowrap text-center">Tahun / Masa</th>
                  <th className="p-2 md:p-4 whitespace-nowrap text-center">Penghasilan Bruto</th>
                  <th className="p-2 md:p-4 whitespace-nowrap text-center">Jenis Pajak</th>
                  <th className="p-2 md:p-4 whitespace-nowrap text-center">Pajak Terutang</th>
                  {variant === 'full' && (
                    <th className="p-2 md:p-4 whitespace-nowrap hidden sm:table-cell text-center">Tanggal</th>
                  )}
                  <th className="p-2 md:p-4 whitespace-nowrap text-center">Status</th>
                  {variant === 'full' && (
                    <th className="p-2 md:p-4 whitespace-nowrap text-center">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-[10px] md:text-xs">
                {data.filter(r => !deletedIds.has(r.id)).map((report) => (
                  <tr key={report.id} className="group hover:bg-slate-800/30 transition-all duration-300 divide-x divide-slate-800/30">
                    <td className="p-2 md:p-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                          <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{report.tax_year}</p>
                          <p className="text-[10px] md:text-xs text-slate-500 mt-0.5">{formatTaxPeriod(report.tax_period)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 md:p-4 text-slate-300 font-medium font-mono font-bold whitespace-nowrap">Rp {report.gross_income.toLocaleString('id-ID')}</td>
                    <td className="p-2 md:p-4 text-center whitespace-nowrap">
                      <span className="px-2 py-1 bg-slate-800/60 text-slate-300 rounded text-[10px] font-semibold">PPh 21</span>
                    </td>
                    <td className="p-2 md:p-4 font-mono whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg bg-slate-800/50 text-slate-200 font-semibold shadow-inner text-[10px] md:text-xs">
                        Rp {report.tax_payable.toLocaleString('id-ID')}
                      </span>
                    </td>
                    {variant === 'full' && (
                      <td className="p-2 md:p-4 text-slate-400 whitespace-nowrap hidden sm:table-cell text-[10px] md:text-xs">
                        {new Date(report.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </td>
                    )}
                    <td className="p-2 md:p-4 whitespace-nowrap">
                      <span className={getStatusBadge(report.status)}>
                        <span className={`w-1.5 h-1.5 rounded-full ${report.status === 'paid' ? 'bg-emerald-400' : report.status === 'draft' ? 'bg-orange-400' : 'bg-blue-400'} animate-pulse`}></span>
                        {getStatusLabel(report.status)}
                      </span>
                    </td>
                    {variant === 'full' && (
                      <td className="p-2 md:p-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1.5 md:gap-2">
                          {report.status === 'submitted' && (
                            <button
                              onClick={() => handleCreateBilling(report)}
                              disabled={createBilling.isPending}
                              className="px-2 py-1 md:px-2.5 md:py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-lg md:rounded-xl transition-all border border-emerald-500/20 inline-flex items-center justify-center gap-1 font-bold text-[10px] md:text-xs uppercase tracking-wider disabled:opacity-50"
                              title="Siapkan draft data pembayaran"
                            >
                              <span className="hidden sm:inline">DRAF BAYAR</span>
                              <span className="inline sm:hidden">Draf</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleExportPDF(report)}
                            className="px-2 py-1 md:px-2.5 md:py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-lg md:rounded-xl transition-all border border-blue-500/20 inline-flex items-center justify-center gap-1 font-bold text-[10px] md:text-xs uppercase tracking-wider hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                            title="Unduh Ringkasan Pajak"
                          >
                            <svg className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            PDF
                          </button>
                          <button
                            onClick={() => handleDelete(report.id)}
                            className="px-2 py-1 md:px-2.5 md:py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg md:rounded-xl transition-all border border-rose-500/20 inline-flex items-center justify-center gap-1 font-bold text-[10px] md:text-xs uppercase tracking-wider hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                            title="Hapus Laporan"
                          >
                            <svg className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {variant === 'compact' && onViewAll && (
            <div className="p-4 border-t border-slate-800/50 flex justify-center bg-slate-900/30">
              <button
                onClick={onViewAll}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 font-bold text-xs uppercase tracking-widest rounded-full transition-all border border-blue-500/20 shadow-sm"
              >
                Lihat Selengkapnya
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

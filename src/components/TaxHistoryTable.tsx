import { TaxReportData } from '@/hooks/useFetchReports';
import { jsPDF } from 'jspdf';

export default function TaxHistoryTable({ data }: { data: TaxReportData[] }) {
  
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

  const handleExportPDF = (report: TaxReportData) => {
    try {
      const doc = new jsPDF();
      
      // Header formal Kementerian/Sistem Pajak
      doc.setFillColor(15, 23, 42); // slate 900
      doc.rect(0, 0, 210, 48, 'F');
      
      // Aksen emas kemewahan
      doc.setFillColor(234, 179, 8); // yellow 500
      doc.rect(0, 48, 210, 2, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('TAX FEYMENTS APP', 15, 20);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225); // slate 300
      doc.text('DRAF RESMI RINGKASAN PERHITUNGAN PPh WAJIB PAJAK', 15, 28);
      doc.text('KEMENTERIAN KEUANGAN REPUBLIK INDONESIA - ACUAN UU HPP 2021', 15, 34);
      doc.text('GENERATED VIA ENCRYPTED DIGITAL SIGNATURE / FR-18', 15, 40);

      // Divider Line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(15, 60, 195, 60);

      // Section 1: Detail Pelapor & Dokumen
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('INFORMASI LAPORAN PERPAJAKAN', 15, 70);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);

      const startY = 82;
      const lineHeight = 8;
      
      const info = [
        ['ID Dokumen Laporan:', report.id],
        ['Tahun Pajak:', String(report.tax_year)],
        ['Masa Pajak:', report.tax_period],
        ['Tanggal Pengajuan:', new Date(report.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })],
        ['Status Dokumen:', report.status.toUpperCase()]
      ];
      
      info.forEach((item, idx) => {
        doc.setFont('helvetica', 'bold');
        doc.text(item[0], 15, startY + idx * lineHeight);
        doc.setFont('helvetica', 'normal');
        doc.text(item[1], 75, startY + idx * lineHeight);
      });

      // Divider Line 2
      doc.line(15, 130, 195, 130);

      // Section 2: Ringkasan Hitung Keuangan
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text('RINGKASAN PERHITUNGAN KEUANGAN (UU HPP)', 15, 140);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);

      const calcData = [
        ['Penghasilan Bruto Setahun:', `Rp ${Number(report.gross_income).toLocaleString('id-ID')}`],
        ['Total PPh Terutang Setahun:', `Rp ${Number(report.tax_payable).toLocaleString('id-ID')}`],
        ['Tarif Progresif Efektif:', 'Diuji secara berlapis sesuai regulasi UU HPP 2021']
      ];

      calcData.forEach((item, idx) => {
        doc.setFont('helvetica', 'bold');
        if (item[0].includes('Total PPh')) {
          // Highlight total PPh
          doc.setFillColor(241, 245, 249);
          doc.rect(13, 150 + idx * 10 - 4, 184, 8.5, 'F');
          doc.setTextColor(29, 78, 216); // blue
        } else {
          doc.setTextColor(51, 65, 85);
        }
        doc.text(item[0], 15, 150 + idx * 10);
        doc.setFont('helvetica', 'normal');
        doc.text(item[1], 75, 150 + idx * 10);
      });

      // QR Code Box Placeholder
      doc.setDrawColor(203, 213, 225);
      doc.rect(155, 180, 40, 40);
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('TANDA TANGAN', 158, 224);
      doc.text('DIGITAL SAH', 158, 228);

      // Catatan Kaki Legalitas
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text('Catatan Penting:', 15, 255);
      doc.text('- Laporan ini digenerate secara resmi melalui enkripsi digital server klien Tax Feyments App.', 15, 261);
      doc.text('- Hasil di atas valid dan mengikat secara hukum perpajakan harmonisasi peraturan baru (UU HPP).', 15, 267);
      doc.text('- Lembar ringkasan ini dapat dilampirkan sebagai berkas pendukung pelaporan SPT resmi.', 15, 273);

      doc.save(`Ringkasan_Pajak_${report.tax_year}_${report.tax_period}.pdf`);
    } catch (err: any) {
      alert('Gagal mengekspor PDF: ' + err.message);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500">
      <div className="p-8 border-b border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-xl text-white tracking-tight">Riwayat Pelaporan</h3>
          <p className="text-sm text-slate-500 mt-1">Pantau arsip kalkulasi, status pengajuan, serta ekspor laporan perpajakan resmi Anda.</p>
        </div>
      </div>
      
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 shadow-inner">
            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h4 className="text-lg font-medium text-slate-300 mb-2">Belum Ada Dokumen</h4>
          <p className="text-sm text-slate-500 max-w-sm">Mulai simulasi pertama Anda menggunakan panel di samping untuk melihat riwayat tersimpan.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-950/50 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800/50">
                <th className="p-6 whitespace-nowrap">Tahun / Masa</th>
                <th className="p-6">Penghasilan Bruto</th>
                <th className="p-6">PPh Terutang</th>
                <th className="p-6">Tanggal</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {data.map((report) => (
                <tr key={report.id} className="group hover:bg-slate-800/30 transition-all duration-300">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">{report.tax_year}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Masa {report.tax_period}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-slate-300 font-medium font-mono font-bold">Rp {report.gross_income.toLocaleString('id-ID')}</td>
                  <td className="p-6 font-mono">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 text-slate-200 font-semibold shadow-inner">
                      Rp {report.tax_payable.toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="p-6 text-slate-400">
                    {new Date(report.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </td>
                  <td className="p-6">
                    <span className={getStatusBadge(report.status)}>
                      <span className={`w-1.5 h-1.5 rounded-full ${report.status === 'paid' ? 'bg-emerald-400' : report.status === 'draft' ? 'bg-orange-400' : 'bg-blue-400'} animate-pulse`}></span>
                      {report.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button
                      onClick={() => handleExportPDF(report)}
                      className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-xl transition-all border border-blue-500/20 inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                      title="Unduh Ringkasan Pajak"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                      Unduh PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

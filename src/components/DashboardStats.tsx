import { TaxReportData } from '@/hooks/useFetchReports';

export default function DashboardStats({ data }: { data: TaxReportData[] }) {
  const totalDraftPayable = data
    .filter((report) => report.status === 'draft')
    .reduce((sum, current) => sum + current.tax_payable, 0);

  const totalSubmitted = data.filter((report) => report.status === 'submitted').length;
  const totalPaid = data.filter((report) => report.status === 'paid').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Card 1 */}
      <div className="group relative overflow-hidden rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 transition-all hover:bg-slate-800/50 hover:border-slate-700 hover:shadow-2xl hover:shadow-orange-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <span className="text-sm font-semibold text-orange-400/90 uppercase tracking-widest">Draf Terutang</span>
          </div>
          <p className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            <span className="text-slate-500 text-2xl mr-1">Rp</span>
            {totalDraftPayable.toLocaleString('id-ID')}
          </p>
          <p className="text-sm text-slate-500 mt-4 leading-relaxed group-hover:text-slate-400 transition-colors">Menunggu pembuatan kode billing & pelaporan</p>
        </div>
      </div>

      {/* Card 2 */}
      <div className="group relative overflow-hidden rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 transition-all hover:bg-slate-800/50 hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <span className="text-sm font-semibold text-blue-400/90 uppercase tracking-widest">Disampaikan</span>
          </div>
          <p className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {totalSubmitted} <span className="text-slate-500 text-xl font-medium">Dokumen</span>
          </p>
          <p className="text-sm text-slate-500 mt-4 leading-relaxed group-hover:text-slate-400 transition-colors">Sedang dalam proses review administrasi</p>
        </div>
      </div>

      {/* Card 3 */}
      <div className="group relative overflow-hidden rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 transition-all hover:bg-slate-800/50 hover:border-slate-700 hover:shadow-2xl hover:shadow-emerald-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <span className="text-sm font-semibold text-emerald-400/90 uppercase tracking-widest">Selesai (Lunas)</span>
          </div>
          <p className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {totalPaid} <span className="text-slate-500 text-xl font-medium">Sukses</span>
          </p>
          <p className="text-sm text-slate-500 mt-4 leading-relaxed group-hover:text-slate-400 transition-colors">Telah mendapatkan Bukti Penerimaan (BPE)</p>
        </div>
      </div>

    </div>
  );
}

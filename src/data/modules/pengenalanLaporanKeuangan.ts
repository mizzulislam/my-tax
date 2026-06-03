import { TaxLearningModule } from '../taxLearningTypes';

export const pengenalanLaporanKeuanganModule: TaxLearningModule = {
    slug: 'pengenalan-laporan-keuangan',
    title: 'Pengenalan Laporan Keuangan',
    shortTitle: 'Laporan Keuangan',
    description: 'Membaca neraca, laba rugi, arus kas, perubahan ekuitas, dan catatan keuangan sebagai dasar analisis pajak.',
    difficulty: 'dasar',
    category: 'Keuangan',
    status: 'sedang',
    estimatedMinutes: 15,
    icon: 'spreadsheet',
    intro: 'Sebelum masuk ke akuntansi perpajakan, wajib pajak perlu memahami laporan keuangan. Modul ini menjelaskan bahasa dasar bisnis: aset, utang, modal, pendapatan, biaya, laba, arus kas, dan bagaimana semua komponen itu menjadi bahan awal penghitungan pajak.',
    learningGoals: [
      'Memahami fungsi neraca, laporan laba rugi, arus kas, dan perubahan ekuitas.',
      'Membedakan laba akuntansi, laba fiskal, dan arus kas.',
      'Mengenali transaksi yang berdampak ke pajak meskipun belum dibayar tunai.',
      'Membaca hubungan antara dokumen transaksi dan angka laporan keuangan.',
    ],
    coreConcept: 'Laporan keuangan adalah ringkasan sistematis dari aktivitas ekonomi. Pajak menggunakan laporan ini sebagai titik awal, lalu melakukan penyesuaian fiskal karena tidak semua perlakuan akuntansi sama dengan perlakuan pajak.',
    keyPoints: [
      'Neraca menunjukkan posisi aset, kewajiban, dan ekuitas pada tanggal tertentu.',
      'Laporan laba rugi menunjukkan kinerja pendapatan dan beban selama periode tertentu.',
      'Arus kas membantu melihat kemampuan membayar, tetapi bukan satu-satunya dasar pajak.',
      'Catatan atas laporan keuangan sering menjelaskan detail penting seperti metode depresiasi dan piutang.',
      'Dokumen sumber seperti invoice, kontrak, mutasi bank, dan bukti pembayaran menjadi dasar pencatatan.',
    ],
    analogyTitle: 'Analogi Rapor Usaha',
    analogy: 'Laporan keuangan seperti rapor bisnis. Neraca menunjukkan kondisi tubuh, laba rugi menunjukkan performa, arus kas menunjukkan napas, dan catatan laporan keuangan menjelaskan detail yang tidak terlihat dari angka utama.',
    relevanceTitle: 'Relevansi untuk Pajak',
    relevance: 'Modul ini penting untuk UMKM, freelancer yang mulai rapi mencatat, badan usaha, dan siapa pun yang ingin memahami kenapa angka laba di laporan bisnis belum tentu sama dengan angka yang menjadi dasar pajak.',
    practicalChecklist: [
      'Pisahkan rekening pribadi dan usaha agar data transaksi tidak tercampur.',
      'Kelompokkan pendapatan, biaya, aset, utang, dan modal secara konsisten.',
      'Rekonsiliasi mutasi bank dengan invoice dan bukti pembayaran setiap bulan.',
    ],
    nextSteps: [
      'Lanjutkan ke Akuntansi Perpajakan untuk memahami koreksi fiskal.',
      'Pelajari PPh Badan jika laporan digunakan untuk perusahaan.',
      'Gunakan laporan keuangan sebagai bahan perencanaan pajak.',
    ],
    caution: 'Materi ini mengenalkan struktur laporan, bukan menggantikan standar akuntansi. Untuk laporan formal, tetap gunakan kebijakan akuntansi yang sesuai.',
  };

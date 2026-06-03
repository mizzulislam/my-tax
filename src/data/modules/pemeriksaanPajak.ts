import { TaxLearningModule } from '../taxLearningTypes';

export const pemeriksaanPajakModule: TaxLearningModule = {
    slug: 'pemeriksaan-pajak',
    title: 'Pemeriksaan Pajak',
    shortTitle: 'Pemeriksaan',
    description: 'Proses pengujian kepatuhan: SP2, permintaan dokumen, pengujian arus uang, koreksi, SPHP, tanggapan, dan penyelesaian.',
    difficulty: 'lanjut',
    category: 'KUP',
    status: 'belum',
    estimatedMinutes: 18,
    icon: 'file',
    intro: 'Pemeriksaan pajak adalah proses ketika otoritas menguji kepatuhan wajib pajak. Modul ini membantu kamu memahami alurnya, jenis dokumen yang biasanya diminta, area yang sering diuji, dan bagaimana merespons secara tertib.',
    learningGoals: [
      'Memahami tujuan dan tahapan umum pemeriksaan pajak.',
      'Mengenali dokumen yang perlu disiapkan saat pemeriksaan.',
      'Memahami konsep koreksi fiskal, klarifikasi, SPHP, dan tanggapan.',
      'Mengetahui hubungan pemeriksaan dengan keberatan atau upaya hukum lanjutan.',
    ],
    coreConcept: 'Pemeriksaan pajak adalah pengujian atas kepatuhan berdasarkan data, dokumen, pembukuan, transaksi, dan keterangan. Hasilnya dapat menyatakan sesuai, kurang bayar, lebih bayar, atau memunculkan koreksi tertentu.',
    keyPoints: [
      'Pemeriksaan biasanya dimulai dengan surat resmi dan permintaan dokumen.',
      'Pengujian dapat mencakup arus uang, arus barang, rekonsiliasi omzet, biaya, PPN, dan bukti potong.',
      'SPHP memberi kesempatan wajib pajak menanggapi temuan sebelum hasil akhir.',
      'Dokumentasi yang rapi sering menentukan kekuatan posisi wajib pajak.',
      'Jika tidak setuju dengan hasil akhir, tersedia mekanisme keberatan dan banding sesuai prosedur.',
    ],
    analogyTitle: 'Analogi Audit Koper',
    analogy: 'Bayangkan kamu membawa koper berisi semua dokumen pajak. Pemeriksa ingin memastikan isi koper cocok dengan daftar yang kamu laporkan. Jika ada barang tanpa label, nilainya meragukan, atau tidak ada bukti, bagian itu lebih mudah dipertanyakan.',
    relevanceTitle: 'Relevansi untuk Kesiapan Dokumen',
    relevance: 'Topik ini penting untuk badan usaha, PKP, wajib pajak dengan restitusi, transaksi besar, multi-penghasilan, dan siapa pun yang ingin menjaga arsip pajak tetap siap jika diminta.',
    practicalChecklist: [
      'Susun arsip per tahun pajak: SPT, bukti bayar, bukti potong, faktur, invoice, kontrak, dan rekening koran.',
      'Buat rekonsiliasi antara laporan keuangan, SPT, dan data pihak ketiga.',
      'Tanggapi surat resmi tepat waktu dan dokumentasikan setiap komunikasi.',
    ],
    nextSteps: [
      'Pelajari KUP untuk memahami hak dan prosedur formal.',
      'Pelajari Akuntansi Perpajakan agar rekonsiliasi lebih kuat.',
      'Pelajari Perencanaan Pajak agar transaksi masa depan lebih siap dokumentasi.',
    ],
    caution: 'Pemeriksaan adalah proses formal. Respons yang keliru atau terlambat dapat merugikan posisi wajib pajak. Pertimbangkan pendampingan profesional.',
  };

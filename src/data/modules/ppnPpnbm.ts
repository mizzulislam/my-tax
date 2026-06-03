import { TaxLearningModule } from '../taxLearningTypes';

export const ppnPpnbmModule: TaxLearningModule = {
    slug: 'ppn-ppnbm',
    title: 'Pajak Pertambahan Nilai & Pajak Penjualan atas Barang Mewah (PPN & PPn BM)',
    shortTitle: 'PPN & PPn BM',
    description: 'Konsep PKP, BKP/JKP, faktur pajak, pajak keluaran-masukan, kompensasi, restitusi, dan barang mewah.',
    difficulty: 'menengah',
    category: 'PPN',
    status: 'belum',
    estimatedMinutes: 20,
    icon: 'calculator',
    intro: 'PPN dan PPn BM adalah modul utama untuk memahami pajak konsumsi. Materi ini membahas kapan transaksi dikenai PPN, siapa yang wajib memungut, bagaimana faktur pajak dibuat, dan bagaimana pajak masukan dikreditkan terhadap pajak keluaran.',
    learningGoals: [
      'Memahami konsep Pengusaha Kena Pajak, BKP, JKP, DPP, dan tarif.',
      'Membedakan pajak keluaran dan pajak masukan.',
      'Mengenali transaksi yang tidak dipungut, dibebaskan, atau mendapat fasilitas.',
      'Memahami dasar PPn BM atas barang tergolong mewah.',
    ],
    coreConcept: 'PPN adalah pajak atas konsumsi yang dipungut bertahap di rantai produksi dan distribusi, tetapi secara ekonomi dibebankan kepada konsumen akhir. PPn BM adalah tambahan pajak untuk barang tertentu yang tergolong mewah.',
    keyPoints: [
      'PKP wajib menerbitkan faktur pajak atas penyerahan BKP/JKP kena pajak.',
      'Pajak keluaran adalah PPN yang dipungut dari pembeli, sedangkan pajak masukan adalah PPN yang dibayar saat membeli input usaha.',
      'Jika pajak masukan lebih besar dari pajak keluaran, dapat terjadi lebih bayar yang dikompensasi atau dimohonkan restitusi sesuai syarat.',
      'Tidak semua PPN masukan dapat dikreditkan, terutama jika tidak memenuhi syarat formal atau material.',
      'PPn BM dikenakan pada penyerahan atau impor barang tertentu yang dikategorikan mewah.',
    ],
    analogyTitle: 'Analogi Rantai Toko',
    analogy: 'Bayangkan barang bergerak dari produsen ke distributor, toko, lalu konsumen. Di setiap tahap, PPN dicatat dan dikreditkan. Toko seperti kasir yang menagih PPN ke pembeli, tetapi juga mengurangkan PPN yang sebelumnya ia bayar saat membeli barang.',
    relevanceTitle: 'Relevansi untuk Pengusaha',
    relevance: 'Topik ini penting untuk pengusaha, UMKM yang naik kelas, marketplace seller, importir, distributor, dan perusahaan jasa. Kesalahan faktur pajak atau pengkreditan PPN dapat berdampak langsung pada cashflow dan risiko koreksi.',
    practicalChecklist: [
      'Pastikan status PKP dan data lawan transaksi valid.',
      'Cocokkan faktur pajak dengan invoice, delivery order, kontrak, dan pembayaran.',
      'Rekonsiliasi pajak keluaran, pajak masukan, penjualan, dan pembelian setiap masa.',
    ],
    nextSteps: [
      'Pelajari e-SPT/Coretax untuk alur pelaporan PPN digital.',
      'Pelajari Pemeriksaan Pajak karena PPN sering menjadi area pengujian dokumen.',
      'Hubungkan dengan Akuntansi Perpajakan untuk rekonsiliasi penjualan-pembelian.',
    ],
    caution: 'PPN sangat bergantung pada dokumen formal. Faktur yang terlambat, salah data, atau tidak valid dapat menimbulkan risiko walau transaksi ekonominya nyata.',
  };

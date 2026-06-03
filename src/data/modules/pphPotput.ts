import { TaxLearningModule } from '../taxLearningTypes';

export const pphPotputModule: TaxLearningModule = {
    slug: 'pph-potput',
    title: 'PPh Pemotongan Pemungutan (PPh POTPUT)',
    shortTitle: 'PPh POTPUT',
    description: 'PPh 21, 22, 23, 26, 4(2), bukti potong, pemotong pajak, pemungut pajak, rekonsiliasi, dan kredit pajak.',
    difficulty: 'menengah',
    category: 'PPh',
    status: 'belum',
    estimatedMinutes: 20,
    icon: 'briefcase',
    intro: 'PPh POTPUT membahas pajak yang dipotong atau dipungut oleh pihak lain. Modul ini penting karena banyak transaksi bisnis tidak hanya melibatkan penjual dan pembeli, tetapi juga kewajiban pemotongan, penyetoran, pelaporan, serta penerbitan bukti potong.',
    learningGoals: [
      'Membedakan pemotongan dan pemungutan pajak.',
      'Mengenali karakter umum PPh 21, 22, 23, 26, dan PPh final Pasal 4 ayat 2.',
      'Memahami fungsi bukti potong sebagai kredit pajak atau pajak final.',
      'Melakukan rekonsiliasi antara transaksi, bukti potong, dan pelaporan.',
    ],
    coreConcept: 'PPh POTPUT memindahkan sebagian tanggung jawab pemungutan pajak kepada pihak yang membayar atau melakukan transaksi tertentu. Pihak pemotong wajib memotong, menyetor, melaporkan, dan memberi bukti potong kepada penerima penghasilan.',
    keyPoints: [
      'PPh 21 umumnya terkait pembayaran kepada orang pribadi atas pekerjaan, jasa, atau kegiatan.',
      'PPh 23 sering muncul atas jasa, sewa tertentu, dividen, royalti, dan bunga tertentu.',
      'PPh 22 berkaitan dengan pemungutan oleh pihak tertentu atas transaksi barang atau impor.',
      'PPh 26 terkait pembayaran kepada subjek pajak luar negeri.',
      'Bukti potong harus cocok dengan penghasilan yang dilaporkan penerima.',
    ],
    analogyTitle: 'Analogi Titip Setor',
    analogy: 'Bayangkan kamu membayar vendor. Sebelum membayar penuh, ada bagian pajak yang kamu sisihkan dan setor ke negara atas nama vendor. Vendor menerima penghasilan bersih plus bukti potong sebagai tanda bahwa sebagian pajaknya sudah dibayarkan.',
    relevanceTitle: 'Relevansi untuk Transaksi Bisnis',
    relevance: 'Topik ini penting untuk perusahaan, bendahara, UMKM yang mulai bekerja dengan badan usaha, freelancer penerima bukti potong, konsultan, vendor, dan bagian finance yang menangani pembayaran.',
    practicalChecklist: [
      'Tentukan jenis transaksi sebelum memilih pasal pemotongan.',
      'Validasi NPWP/NIK lawan transaksi dan dokumen pendukung.',
      'Rekonsiliasi bukti potong dengan invoice, pembayaran, dan SPT Masa.',
    ],
    nextSteps: [
      'Pelajari PPh Orang Pribadi atau PPh Badan untuk penggunaan kredit pajak.',
      'Pelajari e-SPT/Coretax untuk penerbitan dan pelaporan bukti potong.',
      'Pelajari Pemeriksaan Pajak karena POTPUT sering diuji dari rekonsiliasi biaya.',
    ],
    caution: 'Salah pasal pemotongan dapat berdampak pada kurang potong, lebih potong, atau sengketa dengan lawan transaksi. Pastikan klasifikasi transaksi benar.',
  };

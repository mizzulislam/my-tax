import { TaxLearningModule } from '../taxLearningTypes';

export const akuntansiPerpajakanModule: TaxLearningModule = {
    slug: 'akuntansi-perpajakan',
    title: 'Akuntansi Perpajakan',
    shortTitle: 'Akuntansi Pajak',
    description: 'Rekonsiliasi komersial-fiskal, koreksi fiskal, penyusutan, amortisasi, PPN, pajak tangguhan, dan dokumentasi transaksi.',
    difficulty: 'lanjut',
    category: 'Keuangan',
    status: 'belum',
    estimatedMinutes: 20,
    icon: 'spreadsheet',
    intro: 'Akuntansi Perpajakan menghubungkan pembukuan dengan pelaporan pajak. Modul ini memperdalam perbedaan antara angka akuntansi dan angka fiskal, serta bagaimana menyusun rekonsiliasi yang dapat dijelaskan.',
    learningGoals: [
      'Memahami beda temporer dan beda tetap dalam rekonsiliasi fiskal.',
      'Mengenali koreksi fiskal positif dan negatif.',
      'Memahami penyusutan, amortisasi, persediaan, piutang, dan cadangan dari sisi pajak.',
      'Menghubungkan PPN, PPh POTPUT, dan PPh Badan dengan pembukuan.',
    ],
    coreConcept: 'Akuntansi Perpajakan adalah proses menerjemahkan transaksi bisnis ke angka pajak. Laba komersial disesuaikan menjadi laba fiskal melalui aturan yang menentukan penghasilan dan biaya mana yang diakui pajak.',
    keyPoints: [
      'Beda tetap tidak akan berbalik di periode berikutnya, sedangkan beda temporer dapat berbalik.',
      'Koreksi positif menambah laba fiskal, koreksi negatif mengurangi laba fiskal.',
      'Penyusutan fiskal mengikuti kelompok dan masa manfaat menurut aturan pajak.',
      'Rekonsiliasi PPN perlu menghubungkan penjualan, faktur pajak, dan SPT Masa.',
      'Rekonsiliasi PPh POTPUT perlu menghubungkan biaya, pembayaran, dan bukti potong.',
    ],
    analogyTitle: 'Analogi Dua Bahasa',
    analogy: 'Akuntansi komersial dan pajak seperti dua bahasa. Keduanya membicarakan transaksi yang sama, tetapi tata bahasanya berbeda. Rekonsiliasi fiskal adalah proses menerjemahkan laporan komersial ke bahasa pajak.',
    relevanceTitle: 'Relevansi untuk Penyusunan SPT',
    relevance: 'Topik ini penting untuk staf akuntansi, finance, konsultan, auditor, dan pemilik bisnis yang ingin memahami kenapa laporan komersial tidak bisa langsung dipakai sebagai angka pajak final.',
    practicalChecklist: [
      'Buat mapping akun yang sering menimbulkan koreksi fiskal.',
      'Simpan detail aset tetap dan metode penyusutan fiskal.',
      'Rekonsiliasi SPT Masa dengan buku besar sebelum SPT Tahunan.',
    ],
    nextSteps: [
      'Pelajari PPh Badan untuk menerapkan rekonsiliasi dalam SPT.',
      'Pelajari Pemeriksaan Pajak agar dokumentasi koreksi siap diuji.',
      'Pelajari e-SPT/Coretax untuk menginput data pelaporan secara benar.',
    ],
    caution: 'Akuntansi perpajakan membutuhkan konsistensi metode dan dokumentasi. Koreksi tanpa dasar dapat menimbulkan risiko saat pemeriksaan.',
  };

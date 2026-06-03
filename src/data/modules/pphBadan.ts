import { TaxLearningModule } from '../taxLearningTypes';

export const pphBadanModule: TaxLearningModule = {
    slug: 'pph-badan',
    title: 'Pajak Penghasilan WP Badan (PPh Badan)',
    shortTitle: 'PPh Badan',
    description: 'Penghitungan PPh Badan: laba fiskal, koreksi fiskal, biaya 3M, penyusutan, amortisasi, kompensasi rugi, kredit pajak, dan SPT Badan.',
    difficulty: 'lanjut',
    category: 'PPh',
    status: 'belum',
    estimatedMinutes: 22,
    icon: 'building',
    intro: 'PPh Badan adalah modul lanjutan yang menghubungkan laporan keuangan dengan kewajiban pajak perusahaan. Fokusnya bukan hanya menghitung tarif, tetapi memahami bagaimana laba komersial diubah menjadi laba fiskal melalui koreksi positif dan negatif.',
    learningGoals: [
      'Memahami subjek pajak badan dan objek PPh Badan.',
      'Membedakan laba komersial dan laba fiskal.',
      'Mengidentifikasi biaya yang boleh dan tidak boleh dikurangkan.',
      'Memahami kredit pajak, angsuran PPh 25, dan SPT Tahunan Badan.',
    ],
    coreConcept: 'PPh Badan dihitung dari penghasilan kena pajak badan, yaitu laba fiskal setelah penghasilan dan biaya disesuaikan menurut aturan pajak. Laporan keuangan menjadi titik awal, tetapi koreksi fiskal menentukan angka pajak akhir.',
    keyPoints: [
      'Biaya yang dapat dikurangkan umumnya harus terkait kegiatan mendapatkan, menagih, dan memelihara penghasilan.',
      'Biaya natura, sumbangan, entertainment, dan transaksi afiliasi perlu perhatian khusus.',
      'Penyusutan dan amortisasi fiskal dapat berbeda dari pembukuan komersial.',
      'Kompensasi kerugian fiskal memiliki batas waktu dan syarat tertentu.',
      'SPT Badan membutuhkan rekonsiliasi fiskal dan lampiran pendukung yang rapi.',
    ],
    analogyTitle: 'Analogi Mesin Bisnis',
    analogy: 'Perusahaan seperti mesin bisnis. Laporan komersial menunjukkan performa mesin menurut akuntansi, sedangkan pajak memeriksa komponen mana yang boleh dihitung sebagai bahan bakar fiskal dan mana yang harus dikeluarkan dari perhitungan.',
    relevanceTitle: 'Relevansi untuk Pemilik dan Finance Perusahaan',
    relevance: 'Topik ini penting untuk direktur, pemilik usaha berbadan hukum, staf finance, akuntan, konsultan, dan siapa pun yang menyusun laporan fiskal tahunan perusahaan.',
    practicalChecklist: [
      'Siapkan trial balance, laporan laba rugi, neraca, dan buku besar.',
      'Buat daftar koreksi fiskal positif dan negatif beserta dasar dokumen.',
      'Rekonsiliasi kredit pajak dan angsuran sebelum menghitung kurang/lebih bayar.',
    ],
    nextSteps: [
      'Pelajari Akuntansi Perpajakan untuk memperdalam koreksi fiskal.',
      'Pelajari Perencanaan Pajak untuk strategi kepatuhan yang efisien.',
      'Pelajari Pemeriksaan Pajak agar dokumentasi siap diuji.',
    ],
    caution: 'PPh Badan sangat bergantung pada kualitas pembukuan dan dokumen. Untuk pelaporan resmi, gunakan review akuntan atau konsultan pajak bila diperlukan.',
  };

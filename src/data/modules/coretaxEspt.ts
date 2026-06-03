import { TaxLearningModule } from '../taxLearningTypes';

export const coretaxEsptModule: TaxLearningModule = {
    slug: 'coretax-espt',
    title: 'Sistem Inti Administrasi Perpajakan (Coretax)',
    shortTitle: 'Coretax',
    description: 'Alur digital pajak: akun DJP, sertifikat elektronik, e-filing, e-billing, bukti potong, faktur, validasi, dan arsip elektronik.',
    difficulty: 'menengah',
    category: 'Sistem',
    status: 'belum',
    estimatedMinutes: 16,
    icon: 'calculator',
    intro: 'Modul ini membahas sisi praktis pelaporan pajak digital. Fokusnya adalah bagaimana kewajiban yang dipelajari di modul lain diterjemahkan ke aplikasi: login, validasi identitas, membuat kode billing, mengirim SPT, mengelola bukti potong, faktur, dan arsip elektronik.',
    learningGoals: [
      'Memahami fungsi kanal digital pajak seperti e-filing, e-billing, e-bupot, e-faktur, dan Coretax.',
      'Mengenali data dan dokumen yang perlu disiapkan sebelum pelaporan.',
      'Memahami alur validasi, submit, bukti penerimaan elektronik, dan arsip.',
      'Mengurangi error input dengan rekonsiliasi sebelum upload atau submit.',
    ],
    coreConcept: 'Aplikasi pelaporan pajak adalah jembatan antara kewajiban pajak dan administrasi resmi. Perhitungan yang benar tetap perlu diterjemahkan ke input sistem yang lengkap, valid, dan terdokumentasi.',
    keyPoints: [
      'Akun pajak digital harus dijaga keamanannya karena mewakili identitas wajib pajak.',
      'Kode billing digunakan untuk pembayaran pajak sebelum atau terkait pelaporan.',
      'BPE menjadi bukti bahwa SPT sudah diterima sistem.',
      'Bukti potong dan faktur elektronik harus cocok dengan transaksi dan pembukuan.',
      'Error validasi sering berasal dari data identitas, masa pajak, format file, atau angka yang tidak rekonsiliasi.',
    ],
    analogyTitle: 'Analogi Loket Digital',
    analogy: 'Coretax dan aplikasi pajak seperti loket pelayanan digital. Kamu tetap perlu membawa dokumen yang benar, mengisi formulir dengan tepat, membayar jika ada tagihan, lalu menyimpan tanda terima setelah selesai.',
    relevanceTitle: 'Relevansi untuk Pelaporan Modern',
    relevance: 'Topik ini relevan untuk semua wajib pajak yang menggunakan aplikasi pajak, terutama admin pajak perusahaan, PKP, pemberi kerja, freelancer, dan wajib pajak orang pribadi yang melaporkan SPT secara mandiri.',
    practicalChecklist: [
      'Siapkan data identitas, masa pajak, kode billing, bukti potong, faktur, dan laporan pendukung sebelum login.',
      'Rekonsiliasi angka sebelum submit agar tidak perlu pembetulan berulang.',
      'Simpan BPE, NTPN, file SPT, dan arsip elektronik di folder per tahun pajak.',
    ],
    nextSteps: [
      'Pelajari KUP untuk memahami konsekuensi submit, pembetulan, dan batas waktu.',
      'Pelajari PPN atau PPh POTPUT jika menggunakan faktur atau bukti potong elektronik.',
      'Gunakan halaman draft pembayaran aplikasi ini hanya untuk menyiapkan data sebelum membuat kode billing resmi di DJP/Coretax.',
    ],
    caution: 'Tampilan dan proses aplikasi pajak dapat berubah mengikuti implementasi sistem. Cocokkan kembali dengan panduan resmi DJP saat melakukan pelaporan nyata.',
  };

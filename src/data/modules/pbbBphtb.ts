import { TaxLearningModule } from '../taxLearningTypes';

export const pbbBphtbModule: TaxLearningModule = {
    slug: 'pbb-bphtb',
    title: 'Pajak Bumi & Bangunan (PBB) dan BPHTB',
    shortTitle: 'PBB & BPHTB',
    description: 'Pajak atas tanah/bangunan dan perolehan hak: NJOP, SPPT, objek, subjek, transaksi properti, hibah, waris, dan jual beli.',
    difficulty: 'menengah',
    category: 'Aset',
    status: 'belum',
    estimatedMinutes: 14,
    icon: 'home',
    intro: 'PBB dan BPHTB adalah modul pajak properti. Keduanya sering muncul saat seseorang memiliki rumah, tanah, ruko, melakukan jual beli properti, menerima hibah, waris, atau memindahkan hak atas tanah dan bangunan.',
    learningGoals: [
      'Memahami subjek dan objek PBB serta konsep NJOP.',
      'Membaca SPPT PBB dan bukti pembayaran.',
      'Mengenali kapan BPHTB muncul dalam perolehan hak.',
      'Menghubungkan pajak properti dengan pelaporan harta dalam SPT.',
    ],
    coreConcept: 'PBB berkaitan dengan kepemilikan atau pemanfaatan bumi dan bangunan, sedangkan BPHTB berkaitan dengan perolehan hak atas tanah dan bangunan. PBB bersifat periodik, BPHTB muncul pada momen peralihan atau perolehan hak.',
    keyPoints: [
      'NJOP menjadi salah satu dasar penting dalam administrasi PBB.',
      'SPPT PBB memuat informasi objek pajak, luas, kelas, NJOP, dan jumlah PBB terutang.',
      'BPHTB biasanya diperhitungkan dalam transaksi jual beli, hibah, waris, atau perolehan hak tertentu.',
      'Data sertifikat, luas tanah/bangunan, dan identitas pemilik perlu konsisten.',
      'Properti yang dimiliki wajib dipertimbangkan dalam daftar harta SPT.',
    ],
    analogyTitle: 'Analogi Rumah dan Kunci',
    analogy: 'PBB seperti iuran pajak tahunan atas properti yang kamu miliki atau manfaatkan. BPHTB seperti pajak saat kunci hak atas properti berpindah atau diperoleh oleh pihak baru.',
    relevanceTitle: 'Relevansi untuk Pemilik Aset',
    relevance: 'Topik ini penting untuk pemilik rumah, investor properti, ahli waris, pembeli rumah pertama, developer, notaris/PPAT, dan wajib pajak yang perlu melaporkan aset properti secara benar.',
    practicalChecklist: [
      'Cocokkan nama, alamat, luas, dan NJOP di SPPT dengan data sebenarnya.',
      'Simpan bukti pembayaran PBB tahunan.',
      'Masukkan properti ke daftar harta SPT dengan nilai dan tahun perolehan yang wajar.',
    ],
    nextSteps: [
      'Pelajari PPh Orang Pribadi untuk pelaporan harta pribadi.',
      'Pelajari Perencanaan Pajak sebelum jual beli atau hibah properti.',
      'Konsultasikan transaksi peralihan hak dengan notaris/PPAT bila nilainya besar.',
    ],
    caution: 'PBB dan BPHTB banyak dipengaruhi aturan daerah. Tarif, NJOPTKP, dan prosedur dapat berbeda antar wilayah.',
  };

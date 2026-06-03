import { TaxLearningModule } from '../taxLearningTypes';

export const pphOrangPribadiModule: TaxLearningModule = {
    slug: 'pph-orang-pribadi',
    title: 'PPh Orang Pribadi',
    shortTitle: 'PPh OP',
    description: 'Kewajiban pajak individu: status subjek pajak, penghasilan final dan non-final, PTKP, tarif progresif, kredit pajak, dan SPT Tahunan.',
    difficulty: 'menengah',
    category: 'PPh',
    status: 'belum',
    estimatedMinutes: 18,
    icon: 'briefcase',
    intro: 'PPh Orang Pribadi menyatukan seluruh aktivitas ekonomi individu dalam satu kerangka tahunan. Kamu akan belajar membedakan penghasilan dari pekerjaan, usaha, pekerjaan bebas, sewa, investasi, dan penghasilan lain, lalu memahami mana yang final dan mana yang digabung dalam SPT Tahunan.',
    learningGoals: [
      'Memahami status wajib pajak orang pribadi dalam negeri dan luar negeri.',
      'Membedakan penghasilan final, non-final, bukan objek, dan dikecualikan dari objek pajak.',
      'Menghitung peran PTKP, PKP, tarif progresif, dan kredit pajak.',
      'Menyusun logika dasar SPT Tahunan orang pribadi.',
    ],
    coreConcept: 'PPh Orang Pribadi menghitung pajak dari kemampuan ekonomis individu. Tidak semua penghasilan diperlakukan sama: ada yang final, ada yang digabung tahunan, ada yang mendapat pengurang, dan ada yang sudah dipotong pihak lain sebagai kredit pajak.',
    keyPoints: [
      'Penghasilan dari pekerjaan biasanya terkait PPh 21 dan bukti potong.',
      'Penghasilan usaha atau pekerjaan bebas dapat memerlukan pencatatan, pembukuan, atau norma tertentu.',
      'Penghasilan final seperti jenis sewa atau UMKM tertentu tidak digabung dengan tarif progresif umum.',
      'PTKP mengurangi penghasilan neto sebelum tarif progresif diterapkan.',
      'Bukti potong dan angsuran pajak menjadi kredit untuk mengurangi pajak yang masih harus dibayar.',
    ],
    analogyTitle: 'Analogi Meja Rekap',
    analogy: 'Bayangkan semua sumber uang masuk diletakkan di satu meja rekap. Ada amplop gaji, honor, usaha, sewa, bunga, dan investasi. Sebagian amplop sudah dipotong pajak, sebagian belum, dan sebagian punya aturan final. SPT Tahunan membantu menyusun amplop itu agar tidak dobel hitung.',
    relevanceTitle: 'Relevansi untuk Multi-Penghasilan',
    relevance: 'Topik ini penting untuk karyawan dengan side income, freelancer, dokter, notaris, konsultan, pemilik kos, investor, kreator konten, dan siapa pun yang tidak hanya menerima satu jenis penghasilan.',
    practicalChecklist: [
      'Kumpulkan bukti potong dari pemberi kerja atau pemotong pajak.',
      'Pisahkan penghasilan final dan non-final sejak awal tahun.',
      'Rekap harta, utang, dan anggota keluarga yang memengaruhi PTKP.',
    ],
    nextSteps: [
      'Pelajari PPh POTPUT untuk memahami bukti potong yang diterima.',
      'Pelajari Perencanaan Pajak agar penghasilan dan dokumen tertata sejak awal.',
      'Gunakan modul e-SPT/Coretax untuk memahami proses pelaporan digital.',
    ],
    caution: 'Penghasilan campuran sering menimbulkan salah klasifikasi. Validasi jenis penghasilan dan bukti potong sebelum melaporkan SPT.',
  };

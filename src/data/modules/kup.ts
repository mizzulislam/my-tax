import { TaxLearningModule } from '../taxLearningTypes';

export const kupModule: TaxLearningModule = {
    slug: 'kup',
    title: 'Ketentuan Umum dan Tata Cara Perpajakan (KUP)',
    shortTitle: 'KUP',
    description: 'Aturan administrasi pajak: NPWP, SPT, pembayaran, pembetulan, sanksi, pemeriksaan, keberatan, banding, dan penagihan.',
    difficulty: 'dasar',
    category: 'KUP',
    status: 'selesai',
    quizScore: 100,
    estimatedMinutes: 16,
    icon: 'scale',
    intro: 'KUP adalah tulang punggung administrasi perpajakan. Modul ini tidak hanya membahas angka pajak, tetapi alur kewajiban dari awal sampai akhir: mendaftar, menghitung, membayar, melapor, membetulkan kesalahan, menerima surat dari otoritas, sampai menggunakan hak keberatan atau banding.',
    learningGoals: [
      'Memahami kewajiban registrasi NPWP/NITKU dan administrasi identitas pajak.',
      'Membedakan SPT Masa dan SPT Tahunan beserta batas waktunya.',
      'Mengenali jenis sanksi administrasi berupa bunga, denda, dan kenaikan.',
      'Memahami garis besar pemeriksaan, keberatan, banding, dan penagihan pajak.',
    ],
    coreConcept: 'KUP mengatur tata cara agar sistem self-assessment berjalan tertib. Wajib pajak diberi kepercayaan untuk menghitung dan melapor sendiri, tetapi negara tetap memiliki mekanisme pengawasan, koreksi, sanksi, dan penagihan.',
    keyPoints: [
      'SPT adalah sarana resmi untuk melaporkan penghitungan dan pembayaran pajak.',
      'Pembetulan SPT dapat dilakukan ketika wajib pajak menemukan kesalahan, dengan syarat tertentu.',
      'Surat ketetapan pajak dan surat tagihan pajak muncul ketika otoritas melakukan koreksi atau menagih sanksi.',
      'Keberatan dan banding adalah jalur formal jika wajib pajak tidak setuju dengan hasil koreksi.',
      'Daluwarsa penetapan dan penagihan perlu diperhatikan dalam membaca risiko administrasi.',
    ],
    analogyTitle: 'Analogi Aturan Main',
    analogy: 'Jika pajak adalah permainan strategi, KUP adalah buku aturannya. Ia menjelaskan kapan kamu harus bergerak, dokumen apa yang perlu disiapkan, bagaimana memperbaiki langkah yang salah, dan konsekuensi jika melewati tenggat.',
    relevanceTitle: 'Relevansi dalam Kepatuhan Harian',
    relevance: 'KUP sangat penting bagi semua wajib pajak karena masalah pajak sering muncul bukan hanya dari salah hitung, tetapi juga dari telat lapor, salah format dokumen, tidak menyimpan bukti, atau tidak merespons surat pajak tepat waktu.',
    practicalChecklist: [
      'Buat kalender jatuh tempo SPT Masa, SPT Tahunan, pembayaran, dan respons surat.',
      'Simpan bukti bayar, BPE, bukti potong, faktur, invoice, dan kontrak minimal selama periode yang diwajibkan.',
      'Dokumentasikan alasan pembetulan SPT agar mudah dijelaskan jika ditanya otoritas.',
    ],
    nextSteps: [
      'Pelajari Pemeriksaan Pajak untuk memahami proses pengujian kepatuhan.',
      'Pelajari e-SPT/Coretax agar administrasi digital lebih lancar.',
      'Hubungkan materi KUP dengan modul PPh, PPN, dan Bea Meterai.',
    ],
    caution: 'Ketentuan sanksi dan prosedur dapat berubah. Selalu cek aturan terbaru dan surat resmi yang diterima sebelum mengambil tindakan.',
  };

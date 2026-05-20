export interface GlossaryItem {
  term: string;
  definition: string;
  category: 'Dasar' | 'Pengurang' | 'Dokumen' | 'Tarif';
}

export interface FAQItem {
  question: string;
  answer: string;
}

export const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    term: 'PTKP (Penghasilan Tidak Kena Pajak)',
    definition: 'Batas nominal pendapatan tahunan yang dibebaskan dari pengenaan PPh Pasal 21. Ditentukan berdasarkan status pernikahan (TK/Belum Kawin, K/Kawin) dan jumlah tanggungan anak (maksimal 3 orang). Berdasarkan UU HPP, tarif dasar PTKP TK/0 adalah Rp 54.000.000 per tahun.',
    category: 'Dasar',
  },
  {
    term: 'PKP (Penghasilan Kena Pajak)',
    definition: 'Sisa nominal pendapatan bersih Wajib Pajak setelah dikurangi biaya jabatan, iuran pensiun, dan batas PTKP. Nilai PKP inilah yang akan dikalikan dengan lapisan tarif progresif Pasal 17 UU HPP untuk menghitung total PPh terutang.',
    category: 'Dasar',
  },
  {
    term: 'PPh Terutang',
    definition: 'Total beban pajak penghasilan yang wajib disetorkan oleh Wajib Pajak ke kas negara untuk masa pajak atau tahun pajak tertentu berdasarkan hasil perhitungan berlapis UU HPP.',
    category: 'Tarif',
  },
  {
    term: 'Biaya Jabatan',
    definition: 'Fasilitas pengurangan penghasilan bruto bagi pegawai tetap sebesar 5% dari total gaji gross, dengan batas maksimal yang diperkenankan sebesar Rp 500.000 per bulan atau Rp 6.000.000 per tahun.',
    category: 'Pengurang',
  },
  {
    term: 'BPE (Bukti Penerimaan Elektronik)',
    definition: 'Tanda terima elektronik resmi yang dikeluarkan oleh Direktorat Jenderal Pajak (DJP) melalui e-Filing sebagai bukti bahwa laporan SPT Tahunan atau SPT Masa Anda telah berhasil diterima dan divalidasi oleh negara.',
    category: 'Dokumen',
  },
  {
    term: 'Iuran Pensiun / JHT',
    definition: 'Iuran hari tua yang dipotong langsung dari gaji bulanan atau dibayarkan mandiri ke lembaga pengelola dana pensiun resmi (BPJS Ketenagakerjaan). Iuran ini dapat menjadi faktor pengurang penghasilan bruto dalam kalkulasi PPh 21.',
    category: 'Pengurang',
  },
  {
    term: 'SPT Masa',
    definition: 'Surat Pemberitahuan yang digunakan oleh Wajib Pajak untuk melaporkan kewajiban pemotongan/pemungutan pajak secara bulanan (misal: SPT PPh Pasal 21 bulanan atau SPT PPN).',
    category: 'Dokumen',
  },
  {
    term: 'SPT Tahunan',
    definition: 'Surat Pemberitahuan yang wajib dilaporkan satu kali setiap akhir tahun pajak oleh Wajib Pajak Orang Pribadi (batas akhir Maret) atau Wajib Pajak Badan (batas akhir April) untuk melaporkan harta, kewajiban, serta perhitungan PPh final/non-final.',
    category: 'Dokumen',
  },
  {
    term: 'Tarif Progresif Pasal 17',
    definition: 'Sistem tarif pajak berjenjang di mana semakin besar Penghasilan Kena Pajak (PKP) Anda, semakin tinggi pula lapisan persentase tarif pajak yang dikenakan. Di bawah UU HPP, lapisan tersebut dibagi menjadi 5 tingkatan mulai dari 5% hingga 35%.',
    category: 'Tarif',
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Apa perbedaan mendasar tarif PPh progresif lama dengan aturan UU HPP terbaru?',
    answer: 'UU HPP (Harmonisasi Peraturan Perpajakan) menyempurnakan tarif progresif PPh Orang Pribadi demi keadilan sosial. Batas lapisan pertama (tarif 5%) dinaikkan dari Rp 50 Juta menjadi Rp 60 Juta setahun. Selain itu, UU HPP menambahkan lapis kelima (tarif 35%) untuk pendapatan super kaya di atas Rp 5 Miliar setahun.',
  },
  {
    question: 'Bagaimana cara menentukan jumlah tanggungan PTKP yang sah?',
    answer: 'Tanggungan yang sah adalah anggota keluarga sedarah (anak kandung, orang tua) atau keluarga semenda (mertua, anak tiri) dalam garis keturunan lurus serta menjadi tanggungan sepenuhnya Wajib Pajak. Batas maksimal tanggungan yang dapat dikurangkan adalah 3 orang.',
  },
  {
    question: 'Apakah pelaku UMKM dengan omzet di bawah Rp 500 Juta per tahun wajib membayar pajak?',
    answer: 'Berdasarkan UU HPP, Wajib Pajak Orang Pribadi pelaku UMKM yang memilih skema PPh Final PP 23 (0,5%) diberikan fasilitas pembebasan pajak untuk bagian omzet kumulatif s.d Rp 500 Juta dalam satu tahun pajak. Anda baru mulai membayar PPh 0,5% setelah omzet tahunan melampaui Rp 500 Juta.',
  },
  {
    question: 'Apa konsekuensinya jika saya terlambat melaporkan SPT Tahunan?',
    answer: 'Keterlambatan pelaporan SPT Tahunan Wajib Pajak Orang Pribadi dikenakan sanksi denda administratif sebesar Rp 100.000, sedangkan untuk Wajib Pajak Badan dikenakan denda sebesar Rp 1.000.000 sesuai dengan UU Ketentuan Umum dan Tata Cara Perpajakan (KUP).',
  },
];

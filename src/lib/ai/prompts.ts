export const RISK_WORDS = [
  'sengketa', 
  'banding', 
  'penggelapan', 
  'pidana', 
  'manipulasi', 
  'korupsi', 
  'tax evasion', 
  'fraud', 
  'hukum', 
  'sanksi', 
  'denda', 
  'palsu', 
  'menghindari pajak'
];

export const BLOCKED_REQUEST_PATTERNS = [
  /cara\s+(menghindari|mengelak|mengurangi)\s+pajak\s+secara\s+ilegal/i,
  /(manipulasi|ubah|mengubah)\s+(data|angka|nominal|laporan|spt|faktur)/i,
  /(faktur|invoice|bukti potong|dokumen)\s+(palsu|fiktif)/i,
  /(sembunyikan|menyembunyikan)\s+(aset|omzet|penghasilan|transaksi)/i,
  /(suap|menyuap)\s+(petugas|pegawai|fiskus|pajak)/i,
  /tax\s+evasion/i,
];

export function isBlockedTaxRequest(value: string) {
  return BLOCKED_REQUEST_PATTERNS.some((pattern) => pattern.test(value));
}

export const MANDATORY_SAFETY_SYSTEM_PROMPT = `
⚠️ PERINGATAN KEAMANAN MUTLAK (SANGAT KETAT) ⚠️
Kamu DILARANG KERAS:
1. Memberikan saran penggelapan pajak, penghindaran pajak ilegal (tax evasion), atau manipulasi data keuangan.
2. Membantu menyembunyikan aset, mengubah nominal transaksi palsu, atau membuat faktur fiktif.
3. Mengajarkan cara menyuap petugas pajak atau memalsukan dokumen SPT.
4. Menjawab pertanyaan di luar konteks perpajakan, keuangan, atau fitur aplikasi "My Tax".
Jika pengguna meminta hal-hal di atas, kamu WAJIB menolak dengan sopan dan mengingatkan mereka tentang risiko hukum yang berlaku di Indonesia.
`;

import { z } from "zod";

// Regex pengunci: Memastikan input string hanya berisi angka 0-9
const numericRegex = /^[0-9]+$/;

export const taxpayerProfileSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "Nama lengkap minimal terdiri dari 3 karakter." })
    .max(100, { message: "Nama lengkap maksimal 100 karakter." }),
  
  taxpayerType: z.enum(["pribadi", "badan"], {
    message: "Jenis wajib pajak harus dipilih antara 'pribadi' atau 'badan'.",
  }),

  // NIK Indonesia wajib tepat 16 digit angka sesuai KTP
  nik: z
    .string()
    .length(16, { message: "NIK harus tepat berukuran 16 digit." })
    .regex(numericRegex, { message: "NIK hanya boleh berisi karakter angka." }),

  // NPWP format 15 digit (lama) atau 16 digit (KTP/format baru per 2024/2026)
  npwp: z
    .string()
    .refine((val) => val.length === 15 || val.length === 16, {
      message: "NPWP wajib berukuran 15 digit atau 16 digit (format baru).",
    })
    .regex(numericRegex, { message: "NPWP hanya boleh berisi karakter angka tanpa tanda baca." }),

  phoneNumber: z
    .string()
    .min(10, { message: "Nomor telepon minimal berjumlah 10 digit." })
    .max(15, { message: "Nomor telepon maksimal berjumlah 15 digit." })
    .regex(/^\+?[0-9]+$/, { message: "Format nomor telepon tidak valid (Gunakan format standar angka)." }),

  // Bidang tambahan FR-03 (Personalisasi Profil & AI Assistant)
  occupation: z.string().optional().nullable(),
  education: z.string().optional().nullable(),
  maritalStatus: z.string().optional().nullable(),
  dependents: z.number().int().min(0).max(10).optional().nullable(),
  hobbies: z.string().optional().nullable(),
});

// Inferensi tipe otomatis dari skema Zod untuk TypeScript static typing
export type TaxpayerProfile = z.infer<typeof taxpayerProfileSchema>;

export const taxReportSchema = z.object({
  taxYear: z
    .number()
    .int()
    .min(2020, { message: "Tahun pajak minimal 2020." })
    .max(new Date().getFullYear(), { message: "Tahun pajak tidak boleh melebihi tahun berjalan." }),
  taxPeriod: z
    .string()
    .length(2, { message: "Masa pajak harus 2 digit (contoh: '12' untuk Tahunan/Desember)." }),
  grossIncome: z
    .number()
    .min(0, { message: "Penghasilan bruto tidak boleh bernilai negatif." }),
});

export type TaxReportInput = z.infer<typeof taxReportSchema>;

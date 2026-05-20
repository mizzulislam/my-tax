import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Daftar kata kunci berisiko tinggi atau sengketa perpajakan
const RISK_WORDS = [
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
  'gelap', 
  'menghindari pajak'
];

export async function POST(req: Request) {
  let message = '';
  let context: any = null;
  let persona = 'umum';
  let tone = 'gaul';
  let history: any[] = [];

  try {
    const body = await req.json();
    message = body.message;
    context = body.context;
    persona = body.persona || 'umum';
    tone = body.tone || 'gaul';
    history = body.history || [];
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Format permintaan tidak valid' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!message) {
    return new Response(JSON.stringify({ error: 'Pesan tidak boleh kosong' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Muat API Key secara dinamis pada setiap request untuk menghindari caching env variables
  let currentApiKey = process.env.GEMINI_API_KEY || '';
  let keySource = 'process.env.GEMINI_API_KEY';

  // Coba baca dari .env.local secara langsung
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/GEMINI_API_KEY\s*=\s*(.+)/);
      if (match && match[1]) {
        const parsedKey = match[1].trim();
        if (parsedKey) {
          currentApiKey = parsedKey;
          keySource = '.env.local file directly';
        }
      }
    }
  } catch (e) {
    console.error('Gagal membaca .env.local secara manual di POST:', e);
  }

  // Fallback ke kunci default jika kosong
  if (!currentApiKey) {
    currentApiKey = 'AIzaSyCwOCkE9zhob3SzRpntRlk8Y_lWbwUOF_A';
    keySource = 'hardcoded fallback key';
  }

  console.log(`[AI Chat API] Using key source: ${keySource}. Key prefix: ${currentApiKey.substring(0, 10)}...`);

  const dynamicGenAI = new GoogleGenerativeAI(currentApiKey);

  // Deteksi tingkat risiko berdasarkan kata kunci
  const isHighRisk = RISK_WORDS.some((word) => 
    message.toLowerCase().includes(word)
  );

  // Deskripsi persona dan analogi (Feynman Technique support)
  let personaInstruction = '';
  switch (persona) {
    case 'gamer':
      personaInstruction = 'Gunakan analogi dunia game seperti leveling up, quest, grinding, item shop, mana, HP, dan boss fight untuk menjelaskan istilah perpajakan.';
      break;
    case 'kpop':
      personaInstruction = 'Gunakan analogi dunia K-Pop seperti album debut, photocard (PC), comeback, fanchant, bias, dan konser stadium untuk menjelaskan istilah perpajakan.';
      break;
    case 'bola':
      personaInstruction = 'Gunakan analogi sepak bola seperti mencetak gol, kartu kuning/merah, formasi taktis, offside, penalty, dan babak tambahan untuk menjelaskan istilah perpajakan.';
      break;
    case 'traveler':
      personaInstruction = 'Gunakan analogi petualangan seperti boarding pass, paspor, itinerary perjalanan, transit, pemandu wisata, dan penginapan untuk menjelaskan istilah perpajakan.';
      break;
    case 'otaku':
      personaInstruction = 'Gunakan analogi dunia anime seperti kekuatan tersembunyi, jurus pamungkas, nakama, filler episode, dan evolusi karakter untuk menjelaskan istilah perpajakan.';
      break;
    case 'freelancer':
      personaInstruction = 'Gunakan analogi dunia kerja lepas seperti gig economy, invoice macet, revisi tanpa batas dari klien, deadline mepet, dan portfolio untuk menjelaskan istilah perpajakan.';
      break;
    case 'barista':
      personaInstruction = 'Gunakan analogi pembuatan kopi seperti takaran espresso, latte art, roasting, gilingan biji, dan racikan sirup untuk menjelaskan istilah perpajakan.';
      break;
    case 'creator':
      personaInstruction = 'Gunakan analogi media sosial seperti algoritma, view meledak, endorse, kolaborasi, subscribers, dan video viral untuk menjelaskan istilah perpajakan.';
      break;
    case 'pelajar':
      personaInstruction = 'Gunakan analogi sekolah seperti ujian akhir semester, tugas kelompok, PR mendadak, bolos kelas, uang jajan harian, dan kerja kelompok untuk menjelaskan istilah perpajakan.';
      break;
    default:
      personaInstruction = 'Gunakan analogi kehidupan sehari-hari yang sederhana dan mudah dipahami oleh orang awam.';
  }

  // Deskripsi tone bahasa
  let toneInstruction = '';
  switch (tone) {
    case 'formal':
      toneInstruction = 'Gunakan gaya bahasa sopan, terstruktur, formal, berwibawa, dan tertata rapi layaknya konsultan profesional senior.';
      break;
    case 'humor':
      toneInstruction = 'Gunakan gaya bahasa yang jenaka, penuh candaan kocak, sarkasme ringan, pantun lucu, dan menghibur agar materi pajak tidak membosankan.';
      break;
    case 'simple':
      toneInstruction = 'Gunakan gaya bahasa anak-anak yang super simpel, ramah, dan sangat mendasar seolah menjelaskan ke anak kecil berusia 10 tahun.';
      break;
    default: // 'gaul'
      toneInstruction = 'Gunakan gaya bahasa santai anak muda Jakarta (lue-gue, gaul, asik, pakai kata-kata seru, hindari formalitas berlebihan).';
  }

  const systemInstruction = `Kamu adalah Feyn, Asisten Konsultan Pajak dari aplikasi "Tax Feyments".
Tugasmu adalah menjawab pertanyaan tentang pajak di Indonesia dengan gaya bahasa yang SANGAT luwes, asik, to the point (langsung ke intinya tanpa basa-basi), dan akurat. Hindari jargon teknis tingkat dewa tanpa analogi.

🎯 PANDUAN MENJAWAB (WAJIB DIIKUTI!):
1. **Langsung Jawab & To the Point:** Paragraf pertama langsung menjawab pertanyaannya. 
2. **Visual & Rich Formatting:** Gunakan elemen Markdown yang menarik agar enak dibaca. 
   - Gunakan format header level 3 (\`### 💡 Analogi "[Nama Analogi]"\` atau \`### 📝 Catatan Penting\` atau \`### 📊 Perbandingan ...\`) secara aktif! Setiap kali Anda memberikan analogi atau poin penting, letakkan di bawah header level 3 tersebut agar sistem bisa merendernya sebagai Kartu Callout Visual yang cantik.
   - Gunakan emojis secara melimpah (minimal 1 emoji di setiap sub-heading dan list item) untuk memberikan elemen grafis visual pendukung!
   - Highlight kalimat penting, kata kunci, tarif pajak, atau angka penting menggunakan format Bold (\`**teks**\`) atau inline code (\`\`teks\`\`) agar otomatis disorot dengan warna khusus di aplikasi!
3. **Format Tabel Perbandingan:** Jika membandingkan dua tarif, kategori, atau opsi pajak, Anda **WAJIB** menuliskannya dalam format tabel Markdown (dengan | dan -). Ini akan otomatis dirender menjadi tabel visual interaktif dengan bar indikator persentase!
4. **Penyederhanaan Terekstrem:** Kalau ada istilah teknis, langsung ubah ke analogi kehidupan sehari-hari berdasarkan Persona dan Tone yang ditentukan.
5. **Mini Kuis & Gamifikasi (INTERAKTIF):** Di akhir jawabanmu, Anda **WAJIB** menyertakan mini kuis interaktif berupa format JSON DI DALAM CODEBLOCK \`\`\`quiz. Buat array yang berisi MINIMAL 3 SOAL kuis terkait penjelasanmu! JANGAN tulis gamifikasi, achievement, atau reward di luar codeblock JSON.

Contoh format kuis wajib (pastikan JSON valid dan memiliki properti persis seperti ini):
\`\`\`quiz
{
  "quizzes": [
    {
      "question": "Pajak apa yang dikenakan saat kamu beli kopi di cafe?",
      "options": ["Pajak Penghasilan (PPh)", "Pajak Pertambahan Nilai (PPN)", "Pajak Bumi dan Bangunan (PBB)"],
      "correctAnswerIndex": 1,
      "explanation": "Yap! PPN (Pajak Pertambahan Nilai) dikenakan untuk konsumsi barang/jasa, termasuk beli kopi!"
    },
    {
      "question": "Berapa tarif dasar PPN saat ini?",
      "options": ["10%", "11%", "5%"],
      "correctAnswerIndex": 1,
      "explanation": "Benar! Tarif dasar PPN saat ini adalah 11%."
    },
    {
      "question": "Jika Izzul berpenghasilan Rp 3.000.000 sebulan, apakah wajib membayar PPh 21?",
      "options": ["Ya, wajib", "Tidak, karena di bawah PTKP", "Ya, tapi hanya 1%"],
      "correctAnswerIndex": 1,
      "explanation": "Benar sekali! Karena Rp 3 juta/bulan (Rp 36 juta/tahun) masih di bawah batas PTKP (Rp 54 juta/tahun), Izzul tidak wajib membayar PPh 21!"
    }
  ],
  "reward": {
    "title": "TAX-FREE MASTER",
    "xp": 750
  }
}
\`\`\`

Kamu sedang berbicara dengan ${context?.full_name || context?.nama || 'Teman Feyn'}. 
Pekerjaan asli: ${context?.occupation || '-'}
Pendidikan: ${context?.education_level || '-'}
Hobi/Minat: ${(context?.hobbies && context.hobbies.length > 0) ? context.hobbies.join(', ') : 'Umum'}

💡 STRATEGI PERSONA & TONE WAJIB:
- Persona Anda saat ini: ${persona.toUpperCase()}
  -> Aturan Persona: ${personaInstruction}
- Tone suara Anda saat ini: ${tone.toUpperCase()}
  -> Aturan Tone: ${toneInstruction}
  
Buatlah analogi spesifik yang mencocokkan dunia dari Persona tersebut dengan konsep perpajakan yang sedang dijelaskan!`;

  // Format history ke dalam prompt
  let formattedPrompt = '';
  if (history && history.length > 0) {
    formattedPrompt += 'Berikut adalah riwayat percakapan sebelumnya untuk referensi Anda:\n';
    history.forEach((h: any) => {
      const roleName = h.role === 'user' ? 'User' : 'Feyn (AI)';
      const text = h.content || h.text || '';
      if (text) {
        formattedPrompt += `[${roleName}]: ${text}\n`;
      }
    });
    formattedPrompt += '\nKini, lanjutkan percakapan dan jawab pertanyaan berikut:\n';
  }
  formattedPrompt += `Pertanyaan/Pesan Pengguna: ${message}`;

  // Tentukan model dengan mekanisme fallback dinamis saat runtime
  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  let result = null;
  let selectedModelName = '';
  const modelErrors: Array<{ model: string; error: string }> = [];

  for (const modelName of modelsToTry) {
    try {
      selectedModelName = modelName;
      console.log(`[AI Chat API] Trying model: ${modelName}`);
      const model = dynamicGenAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: systemInstruction 
      });
      result = await model.generateContentStream(formattedPrompt);
      // Jika berhasil memicu pemrosesan stream, keluar dari loop
      console.log(`[AI Chat API] Successfully initiated stream with model: ${modelName}`);
      break;
    } catch (err: any) {
      const errMsg = err.message || String(err);
      console.warn(`Gagal memproses stream dengan model ${modelName}:`, errMsg);
      modelErrors.push({ model: modelName, error: errMsg });
    }
  }

  if (!result) {
    console.error('[AI Chat API] All Gemini models failed to respond.');
    return new Response(
      JSON.stringify({ 
        error: `Gagal memproses AI stream: Semua model Gemini yang dicoba tidak merespon.`,
        details: modelErrors
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result!.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }

          // Tambahkan teks peringatan otomatis jika terdeteksi high risk
          if (isHighRisk) {
            const warningText = `\n\n> ⚠️ **PENTING / RISIKO TINGGI**: Pertanyaan Anda menyentuh topik hukum/perpajakan yang cukup kompleks atau berisiko tinggi. Informasi di atas disediakan sebagai dasar pemahaman awal. Harap konsultasikan lebih lanjut dengan konsultan pajak bersertifikat atau ahli hukum resmi untuk penanganan kasus hukum konkret Anda secara sah.`;
            controller.enqueue(encoder.encode(warningText));
          }

          controller.close();
        } catch (streamError: any) {
          console.error('Error during content stream writing:', streamError);
          controller.enqueue(encoder.encode(`\n\n[Terjadi gangguan koneksi streaming jawaban: ${streamError.message}]`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-High-Risk': isHighRisk ? 'true' : 'false',
        'Access-Control-Expose-Headers': 'X-High-Risk',
      }
    });

  } catch (error: any) {
    console.error('Gemini Stream Error:', error.message);
    return new Response(JSON.stringify({ error: `Gagal memproses AI stream: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

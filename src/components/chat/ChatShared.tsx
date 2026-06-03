import React, { useState, useEffect } from 'react';
// Lists of available Personas and Tones
export const PERSONA_LIST: Record<string, { name: string; emoji: string; desc: string }> = {
  karyawan: { name: 'Karyawan', emoji: '🏢', desc: 'Analogi slip gaji, tunjangan, bukti potong' },
  umkm: { name: 'UMKM', emoji: '🏪', desc: 'Analogi omzet, kas harian, pelanggan' },
  pengusaha: { name: 'Pengusaha', emoji: '📈', desc: 'Analogi cashflow, biaya usaha, ekspansi' },
  investor: { name: 'Investor', emoji: '💹', desc: 'Analogi dividen, capital gain, portofolio' },
  properti: { name: 'Pemilik Aset', emoji: '🏠', desc: 'Analogi sewa, tanah, bangunan, harta' },
  keluarga: { name: 'Keluarga', emoji: '👨‍👩‍👧', desc: 'Analogi PTKP, tanggungan, rumah tangga' },
  pensiunan: { name: 'Pensiunan', emoji: '🧓', desc: 'Analogi pensiun, dana hari tua, pasif income' },
  konsultan: { name: 'Konsultan/Akuntan', emoji: '🧾', desc: 'Analogi rekonsiliasi, dokumen, kepatuhan' },
  umum: { name: 'Umum', emoji: '🌐', desc: 'Analogi sehari-hari sederhana' },
  gamer: { name: 'Gamer', emoji: '🎮', desc: 'Analogi leveling up, quest, boss fight' },
  kpop: { name: 'K-Popers', emoji: '🎤', desc: 'Analogi comeback, bias, photocard' },
  bola: { name: 'Pemain Bola', emoji: '⚽', desc: 'Analogi gol, penalty, kartu kuning' },
  traveler: { name: 'Traveler', emoji: '✈️', desc: 'Analogi boarding pass, itinerary' },
  otaku: { name: 'Otaku', emoji: '🌸', desc: 'Analogi anime, nakama, jurus ulti' },
  freelancer: { name: 'Freelancer', emoji: '💻', desc: 'Analogi gig, invoice, revisi klien' },
  barista: { name: 'Barista', emoji: '☕', desc: 'Analogi espresso, latte art, roasting' },
  creator: { name: 'Content Creator', emoji: '📹', desc: 'Analogi algoritma, subscribers, endorse' },
  pelajar: { name: 'Pelajar', emoji: '🎓', desc: 'Analogi ujian, PR mendadak, uang jajan' }
};

export const TONE_LIST: Record<string, { name: string; emoji: string; desc: string }> = {
  jelas: { name: 'Netral & Jelas', emoji: '🧭', desc: 'Bahasa umum, tenang, mudah dipahami' },
  eksekutif: { name: 'Ringkas Eksekutif', emoji: '📌', desc: 'Langsung ke poin untuk keputusan cepat' },
  step: { name: 'Langkah Demi Langkah', emoji: '🪜', desc: 'Terstruktur dari awal sampai akhir' },
  patuh: { name: 'Patuh Regulasi', emoji: '🛡️', desc: 'Berbasis aturan, dokumen, dan risiko' },
  empatik: { name: 'Empatik', emoji: '🤝', desc: 'Menenangkan untuk kasus pajak yang bikin cemas' },
  gaul: { name: 'Santai & Gaul', emoji: '😎', desc: 'Bahasa anak muda santai & asik' },
  formal: { name: 'Profesional', emoji: '💼', desc: 'Sopan & rapi layaknya konsultan' },
  humor: { name: 'Kocak & Humor', emoji: '😂', desc: 'Penuh joke santai & menghibur' },
  simple: { name: 'Sederhana', emoji: '👶', desc: 'Simpel seolah untuk anak 10 tahun' }
};

export interface CustomPersona {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  instruction: string;
}

export const CUSTOM_PERSONA_ICONS = ['✨', '🏢', '🏪', '📈', '💹', '🏠', '🧾', '⚖️', '🩺', '🌾', '🚚', '🛒', '🏭', '🎨', '💻', '📚'];

export function ChatMigrationNotice() {
  return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5 text-sm text-amber-100">
      <h3 className="font-black text-white">Tabel chat belum tersedia</h3>
      <p className="mt-2 leading-6 text-amber-100/80">
        Jalankan migrasi chat sessions dan chat messages sebelum memakai riwayat obrolan AI.
      </p>
    </div>
  );
}

// Komponen Kuis Interaktif Kustom (ChatQuiz) - Gamified Multi-Question Wizard (Screenshot 1-4)
export function ChatQuiz({ content, isGenerating }: { content: string; isGenerating?: boolean }) {
  interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  }

  type QuizPayload = {
    quizzes?: QuizQuestion[];
    question?: string;
    options?: string[];
    correctAnswerIndex?: number;
    explanation?: string;
    reward?: {
      title?: string;
      xp?: number;
    };
  };

  interface QuizReward {
    title: string;
    xp: number;
  }

  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [reward, setReward] = useState<QuizReward | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [parseError, setParseError] = useState(false);
  
  // Gamifikasi: Mulai Quiz Cover & Timer
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [startCountdown, setStartCountdown] = useState<number | null>(null);

  // Parse JSON data kuis dengan mekanisme recovery regex canggih
  useEffect(() => {
    try {
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```(json|quiz)?/, '').replace(/```$/, '');
      }
      cleanContent = cleanContent.trim();
      
      let parsed: QuizPayload | null = null;
      try {
        parsed = JSON.parse(cleanContent) as QuizPayload;
      } catch {
        // Upayakan recovery parsial menggunakan Regex jika JSON belum lengkap selama streaming
        const questions: QuizQuestion[] = [];
        const questionRegex = /"question"\s*:\s*"([^"]+)"/g;
        const optionsRegex = /"options"\s*:\s*\[([^\]]+)\]/g;
        const correctRegex = /"correctAnswerIndex"\s*:\s*(\d+)/g;
        const explanationRegex = /"explanation"\s*:\s*"([^"]+)"/g;
        
        let qMatch;
        const qTexts: string[] = [];
        while ((qMatch = questionRegex.exec(cleanContent)) !== null) {
          qTexts.push(qMatch[1]);
        }
        
        let oMatch;
        const oArrays: string[][] = [];
        while ((oMatch = optionsRegex.exec(cleanContent)) !== null) {
          const opts = oMatch[1].split(',').map(s => s.replace(/"/g, '').trim());
          oArrays.push(opts);
        }
        
        let cMatch;
        const cIndices: number[] = [];
        while ((cMatch = correctRegex.exec(cleanContent)) !== null) {
          cIndices.push(parseInt(cMatch[1], 10));
        }
        
        let eMatch;
        const eTexts: string[] = [];
        while ((eMatch = explanationRegex.exec(cleanContent)) !== null) {
          eTexts.push(eMatch[1]);
        }
        
        const minLength = Math.min(qTexts.length, oArrays.length);
        for (let i = 0; i < minLength; i++) {
          questions.push({
            question: qTexts[i],
            options: oArrays[i],
            correctAnswerIndex: cIndices[i] !== undefined ? cIndices[i] : 0,
            explanation: eTexts[i] || 'Jawaban yang tepat!'
          });
        }
        
        if (questions.length > 0) {
          parsed = { quizzes: questions };
        } else {
          throw new Error("Gagal mengurai quiz");
        }
      }
      
      if (parsed && Array.isArray(parsed.quizzes) && parsed.quizzes.length > 0) {
        setQuizzes(parsed.quizzes);
        setReward({
          title: parsed.reward?.title || 'TAX-FREE MASTER',
          xp: parsed.reward?.xp ?? 600,
        });
        setParseError(false);
      } else if (parsed && parsed.question && Array.isArray(parsed.options)) {
        // Fallback untuk kuis model lama (single question)
        setQuizzes([{
          question: parsed.question,
          options: parsed.options,
          correctAnswerIndex: parsed.correctAnswerIndex !== undefined ? parsed.correctAnswerIndex : 0,
          explanation: parsed.explanation || ''
        }]);
        setReward({ title: 'TAX APPRENTICE', xp: 200 });
        setParseError(false);
      } else {
        setParseError(true);
      }
    } catch {
      setParseError(true);
    }
  }, [content]);

  // Pre-quiz 3-second Countdown Effect
  useEffect(() => {
    if (startCountdown === null) return;
    if (startCountdown === 0) {
      const timer = setTimeout(() => {
        setStartCountdown(null);
        setQuizStarted(true);
        setTimeLeft(30);
      }, 800);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setStartCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [startCountdown]);

  // Timer Effect
  useEffect(() => {
    if (!quizStarted || isSubmitted || showSummary || quizzes.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Waktu habis!
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, isSubmitted, showSummary, quizzes, currentIdx]);

  const handleRetry = () => {
    setCurrentIdx(0);
    setSelectedIdx(null);
    setIsSubmitted(false);
    setScore(0);
    setShowSummary(false);
    setQuizStarted(false);
    setStartCountdown(3);
  };

  if (parseError) {
    if (isGenerating) {
      return (
        <div className="my-5 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center text-center animate-pulse">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mb-3 text-xl">
            🎯
          </div>
          <p className="text-xs font-bold text-blue-400">Feyn sedang meracik tantangan kuis untukmu...</p>
          <p className="text-[10px] text-slate-500 mt-1">Harap tunggu sebentar, persiapkan dirimu! 📝</p>
        </div>
      );
    }
    return (
      <pre className="bg-slate-950 p-4 rounded-2xl text-xs overflow-x-auto text-slate-400 border border-slate-800 max-w-full font-mono select-text">
        {content}
      </pre>
    );
  }

  if (quizzes.length === 0) return null;

  // Countdown Screen overlay (pulsing beautiful double numbers with aura)
  if (startCountdown !== null) {
    return (
      <div className="my-5 bg-gradient-to-br from-indigo-950/80 to-blue-950/80 border border-blue-500/35 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-250 text-center select-none flex flex-col items-center justify-center min-h-[220px]">
        <div className="absolute top-0 inset-x-0 h-[4px] bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-400"></div>
        
        <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-500/10 border-2 border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.35)] animate-pulse">
          <span className="text-4xl sm:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-ping absolute">
            {startCountdown === 0 ? '🏁' : startCountdown}
          </span>
          <span className="text-4xl sm:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]">
            {startCountdown === 0 ? '🏁' : startCountdown}
          </span>
        </div>
        
        <h4 className="text-base sm:text-lg font-black text-white tracking-wide mt-6 animate-pulse">
          {startCountdown === 0 ? 'MULAI! 🚀' : 'Bersiaplah...'}
        </h4>
        <p className="text-xs text-blue-300 font-bold mt-1.5">Kuis akan dimulai dalam hitungan mundur.</p>
      </div>
    );
  }

  // Cover Screen (Tantangan Feyn! - Screenshot 2)
  if (!quizStarted) {
    return (
      <div className="my-5 bg-slate-900/60 border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-250 text-center select-none">
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"></div>
        <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-lg">
          🎯
        </div>
        <h4 className="text-base sm:text-lg font-black text-white tracking-wide">Tantangan Feyn! ({quizzes.length} Soal)</h4>
        <p className="text-xs text-slate-400 mt-1.5 mb-6 max-w-sm mx-auto leading-relaxed">Berapa banyak yang sudah kamu pahami? Yuk kita tes!</p>
        
        <button
          onClick={() => {
            setStartCountdown(3);
          }}
          className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-2xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2 mx-auto uppercase tracking-wider cursor-pointer"
        >
          ▶️ Mulai Kuis
        </button>
      </div>
    );
  }

  const currentQuiz = quizzes[currentIdx];
  const isCorrect = selectedIdx === currentQuiz?.correctAnswerIndex;

  const handleSelect = (idx: number) => {
    if (isSubmitted) return;
    setSelectedIdx(idx);
  };

  const handleVerify = () => {
    if (selectedIdx === null) return;
    setIsSubmitted(true);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < quizzes.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedIdx(null);
      setIsSubmitted(false);
      setTimeLeft(30);
    } else {
      setShowSummary(true);
    }
  };

  // Summary Screen (Screenshot 4)
  if (showSummary) {
    const isPerfect = score === quizzes.length;
    return (
      <div className="my-5 bg-gradient-to-br from-indigo-950/80 to-blue-950/80 border border-blue-500/35 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-250 text-center select-none">
        <div className="absolute top-0 inset-x-0 h-[4px] bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-400"></div>
        
        {/* Glowing Trophy Icon */}
        <div className="w-16 h-16 bg-blue-500/10 border-2 border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-[0_0_25px_rgba(59,130,246,0.2)] animate-bounce">
          🏆
        </div>
        
        <h4 className="text-lg font-black text-white tracking-wide">Kuis Selesai!</h4>
        <p className="text-xs text-blue-300 font-bold mt-1">Skor Kamu: {score} dari {quizzes.length}</p>
        
        <div className="inline-block mt-3 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-[10px] sm:text-xs font-black uppercase tracking-wider text-blue-400 shadow-inner">
          ACHIEVEMENT UNLOCKED: {isPerfect ? 'TAX-FREE MASTER' : score >= quizzes.length / 2 ? 'TAX SCHOLAR' : 'TAX APPRENTICE'}
        </div>

        {reward && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <div className="px-5 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 shadow-lg">
              <span className="text-sm">✨</span>
              <span className="text-xs font-extrabold text-blue-400">
                +{isPerfect ? reward.xp : Math.round(reward.xp * (score / quizzes.length))} XP
              </span>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 shadow-lg">
              <span className="text-xs">📈</span>
              <span className="text-xs font-extrabold text-slate-300">
                Lvl {Math.min(5, Math.max(1, Math.round(score * 1.5)))}
              </span>
            </div>
          </div>
        )}

        {/* Retry Button if score is not perfect */}
        {!isPerfect && (
          <div className="mt-8 flex justify-center animate-in fade-in slide-in-from-top-3 duration-300">
            <button
              type="button"
              onClick={handleRetry}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.35)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              🔄 Coba Lagi
            </button>
          </div>
        )}
      </div>
    );
  }

  // Active Question (Screenshot 3)
  return (
    <div className="my-5 bg-slate-900/60 border border-slate-800/85 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-250 select-none">
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"></div>

      {/* Header Info */}
      <div className="flex items-center justify-between mb-4.5">
        <span className="px-3.5 py-1.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-inner">
          {currentIdx + 1}/{quizzes.length} Mini Quiz
        </span>
        
        {/* Timer UI (Pill Badge) */}
        <div className={`px-3 py-1 rounded-full border text-[10px] sm:text-xs font-black flex items-center gap-1.5 ${
          timeLeft <= 10 
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse' 
            : 'bg-slate-950/60 border-slate-800 text-slate-400'
        }`}>
          <span>⏱️</span>
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Timer Bar (Linear count down) */}
      <div className="w-full h-1 bg-slate-950 rounded-full mb-5 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            timeLeft <= 10 ? 'bg-rose-500' : 'bg-blue-500'
          }`}
          style={{ width: `${(timeLeft / 30) * 100}%` }}
        />
      </div>

      {/* Question Text (Full text wrapping) */}
      <h4 className="text-[14px] sm:text-[15px] font-black text-white leading-relaxed mb-4.5 whitespace-normal break-words select-text">
        {currentQuiz.question}
      </h4>

      {/* Options Cards */}
      <div className="space-y-2 mb-5">
        {currentQuiz.options.map((option, idx) => {
          let optionStyle = "border-slate-800 hover:bg-slate-900/50 hover:border-slate-755 text-slate-300";
          if (selectedIdx === idx) {
            optionStyle = "bg-blue-500/10 border-blue-500/50 text-blue-300 ring-2 ring-blue-500/20";
          }
          if (isSubmitted) {
            if (idx === currentQuiz.correctAnswerIndex) {
              optionStyle = "bg-blue-500/20 border-blue-500 text-blue-400 font-extrabold";
            } else if (selectedIdx === idx) {
              optionStyle = "bg-rose-500/10 border-rose-500 text-rose-400 line-through";
            } else {
              optionStyle = "opacity-50 border-slate-950 text-slate-500";
            }
          }

          return (
            <button
              type="button"
              key={idx}
              disabled={isSubmitted}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs md:text-sm border font-bold transition-all duration-200 focus:outline-none flex items-center justify-between gap-3 cursor-pointer ${optionStyle}`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] font-black flex-shrink-0 ${
                  isSubmitted && idx === currentQuiz.correctAnswerIndex
                    ? 'bg-blue-500 border-blue-500 text-slate-950'
                    : isSubmitted && selectedIdx === idx
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : selectedIdx === idx
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="whitespace-normal break-words leading-snug min-w-0 flex-1">{option}</span>
              </div>

              {/* Check/Cross Icon (Screenshot 3 style) */}
              {isSubmitted && idx === currentQuiz.correctAnswerIndex && (
                <span className="text-blue-400 font-extrabold text-sm flex-shrink-0">✓</span>
              )}
              {isSubmitted && selectedIdx === idx && idx !== currentQuiz.correctAnswerIndex && (
                <span className="text-rose-400 font-extrabold text-sm flex-shrink-0">✗</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Alert / Explanation Box & Action Button */}
      {!isSubmitted ? (
        <button
          disabled={selectedIdx === null}
          onClick={handleVerify}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 font-extrabold text-white rounded-2xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] text-[11px] uppercase tracking-wider cursor-pointer"
        >
          Periksa Jawaban
        </button>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-2.5 md:max-w-[75%] w-full">
            <span className="text-xl mt-0.5">{timeLeft === 0 && selectedIdx === null ? '⏰' : isCorrect ? '🌟' : '❌'}</span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                {timeLeft === 0 && selectedIdx === null 
                  ? 'Waktu Habis!' 
                  : isCorrect 
                  ? 'Bener Banget!' 
                  : 'Salah, Tapi Tenang!'}
              </p>
              <p className="text-[11px] font-semibold text-slate-300 mt-0.5 leading-relaxed">
                <span className="font-extrabold text-white">Penjelasan Singkat:</span> {currentQuiz.explanation}
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 font-extrabold text-white rounded-2xl transition-all text-[10px] uppercase tracking-widest cursor-pointer whitespace-nowrap self-stretch md:self-center flex items-center justify-center shadow-lg"
          >
            {currentIdx + 1 < quizzes.length ? 'Pertanyaan Selanjutnya ➔' : 'Lihat Hasil Kuis 🏆'}
          </button>
        </div>
      )}
    </div>
  );
}

// Icon Segitiga Peringatan SVG
export function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

// Icon Trash / Delete SVG
export function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}


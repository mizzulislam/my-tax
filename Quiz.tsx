import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { quizData, QuizOption, QuizQuestion } from '../lib/quiz-data';
import { Check, X, ArrowRight, Award, RotateCcw, ArrowLeft, BookOpen, Layers } from 'lucide-react';
import { Topic } from '../types';

export default function Quiz() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [initLoading, setInitLoading] = useState(true);

  // Load Topic & Questions
  useEffect(() => {
    async function loadQuiz() {
      if (!slug) return;
      try {
        const { data: topicData, error } = await supabase
          .from('topics')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setTopic(topicData);

        const qs = quizData.filter(q => q.topicSlug === slug);
        setQuestions(qs);
      } catch (err) {
        console.error(err);
      } finally {
        setInitLoading(false);
      }
    }
    loadQuiz();
  }, [slug]);

  if (initLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!topic || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <p className="text-gray-500 mb-4">Kuis untuk topik ini belum tersedia.</p>
        <button onClick={() => navigate('/dashboard')} className="text-emerald-600 font-medium hover:underline">Kembali ke Dashboard</button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const totalQ = questions.length;

  const handleSelectOption = (optId: string) => {
    if (selectedAnswer) return; // Prevent changing answer
    setSelectedAnswer(optId);
    
    // Save answer
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: optId
    }));
  };

  const handleNext = async () => {
    if (currentIdx < totalQ - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
    } else {
      // Finish Quiz
      await completeQuiz();
    }
  };

  const completeQuiz = async () => {
    setIsSaving(true);
    let correctCount = 0;
    
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / totalQ) * 100);
    setFinalScore(calculatedScore);

    try {
      if (user && topic) {
        // Save quiz score
        await supabase.from('quiz_results').insert({
          user_id: user.id,
          topic_id: topic.id,
          score: calculatedScore,
          answers: answers
        });

        // Update progress to 'selesai'
        await supabase.from('user_progress').upsert({
          user_id: user.id,
          topic_id: topic.id,
          status: 'selesai',
          last_accessed_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Failed saving quiz result', err);
    } finally {
      setIsSaving(false);
      setShowResult(true);
    }
  };

  const getMotivationalMessage = (score: number) => {
    if (score === 100) return "Luar biasa! Kamu sudah benar-benar paham topik ini.";
    if (score >= 66) return "Bagus! Ada satu konsep yang mungkin perlu diperkuat.";
    if (score > 0) return "Lumayan! Setiap ahli juga pernah salah, jangan ragu belajar lagi.";
    return "Jangan menyerah! Coba baca kembali penjelasannya pelan-pelan ya.";
  };

  if (showResult && finalScore !== null) {
    const correctCount = questions.filter(q => answers[q.id] === q.correctAnswer).length;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-6">
          <Award size={64} className={`mx-auto ${finalScore >= 66 ? 'text-emerald-500' : 'text-amber-500'} mb-2`} />
          <h2 className="text-3xl font-bold text-gray-800">Skor Kamu: {finalScore}%</h2>
          <p className="text-gray-600 font-medium text-lg">
            Selesai menjawab {correctCount} dari {totalQ} soal dengan benar.
          </p>
          <div className={`p-4 rounded-xl inline-block font-medium ${finalScore >= 66 ? 'text-emerald-800 bg-emerald-50' : 'text-amber-800 bg-amber-50'}`}>
            {getMotivationalMessage(finalScore)}
          </div>
          
          {/* Detailed Review */}
          <div className="text-left mt-8 space-y-6">
            <h3 className="font-bold text-xl text-gray-800 mb-4 border-b pb-2">Ringkasan Jawaban:</h3>
            {questions.map((q, i) => {
              const isCorrect = answers[q.id] === q.correctAnswer;
              const userAnswerText = q.options.find(o => o.id === answers[q.id])?.text;
              const correctAnswerText = q.options.find(o => o.id === q.correctAnswer)?.text;

              return (
                <div key={q.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex gap-3 mb-2">
                    <div className="mt-0.5">
                      {isCorrect ? <Check className="text-emerald-500 w-5 h-5" /> : <X className="text-red-500 w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 mb-2">{i+1}. {q.question}</p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium text-gray-500">Jawabanmu:</span>{' '}
                        <span className={isCorrect ? 'text-emerald-700 font-medium' : 'text-red-600 line-through'}>{userAnswerText || 'Tidak terjawab'}</span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-gray-700 mb-3">
                          <span className="font-medium text-emerald-600">Jawaban Benar:</span> {correctAnswerText}
                        </p>
                      )}
                      
                      <div className="mt-3 p-3 bg-white rounded-lg border border-gray-100 text-sm text-gray-700 flex items-start gap-2">
                        <Layers size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                        <p>{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-center gap-4 border-t mt-4">
            <button 
              onClick={() => navigate(`/topic/${slug}`)}
              className="py-3 px-6 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} /> Baca Lagi Materi
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen size={18} /> Lanjut Topik Lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Playing UI
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl w-full mx-auto">
        <button 
          onClick={() => navigate(`/topic/${slug}`)}
          className="text-gray-500 hover:text-gray-800 text-sm flex items-center gap-2 font-medium transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Kembali ke Materi
        </button>

        <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <div>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Kuis: {topic.title}</p>
             <h2 className="font-bold text-gray-800">
               Soal {currentIdx + 1} <span className="text-gray-400 font-medium">dari {totalQ}</span>
             </h2>
           </div>
           
           <div className="flex gap-1">
             {Array.from({length: totalQ}).map((_, i) => (
               <div key={i} className={`w-8 h-2 rounded-full ${i <= currentIdx ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
             ))}
           </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-snug">
            {currentQ.question}
          </h2>
          
          <div className="space-y-3 mt-8">
            {currentQ.options.map((opt) => {
              const isSelected = selectedAnswer === opt.id;
              const isCorrectOpt = currentQ.correctAnswer === opt.id;
              
              let styling = 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50 text-gray-700';
              
              if (selectedAnswer) {
                 if (isSelected && isCorrectOpt) {
                   styling = 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 text-emerald-800 font-medium';
                 } else if (isSelected && !isCorrectOpt) {
                   styling = 'border-red-500 bg-red-50 ring-1 ring-red-500 text-red-800 font-medium opacity-90';
                 } else if (!isSelected && isCorrectOpt) {
                   styling = 'border-emerald-400 bg-white ring-1 ring-emerald-400 text-emerald-700 font-medium opacity-90';
                 } else {
                   styling = 'border-gray-100 bg-gray-50 opacity-60 text-gray-500 cursor-not-allowed';
                 }
              }

              return (
                <button
                  key={opt.id}
                  disabled={selectedAnswer !== null}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${styling}`}
                >
                  <div className="flex justify-between items-center gap-4">
                    <span className="leading-relaxed">{opt.text}</span>
                    {selectedAnswer && isCorrectOpt && <Check className="text-emerald-600 w-5 h-5 shrink-0" />}
                    {selectedAnswer && isSelected && !isCorrectOpt && <X className="text-red-600 w-5 h-5 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedAnswer && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className={`p-5 rounded-xl border ${selectedAnswer === currentQ.correctAnswer ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 'bg-amber-50 border-amber-100 text-amber-900'}`}>
                 <p className="font-bold mb-2 flex items-center gap-2">
                   {selectedAnswer === currentQ.correctAnswer ? (
                     <><Check size={20} className="text-emerald-600" /> Benar!</>
                   ) : (
                     <><X size={20} className="text-red-600" /> Kurang Tepat.</>
                   )}
                 </p>
                 <p className="text-sm opacity-90 leading-relaxed text-gray-800">{currentQ.explanation}</p>
               </div>

               <div className="mt-6 flex justify-end">
                  <button 
                    disabled={isSaving}
                    onClick={handleNext}
                    className="py-3 px-8 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
                  >
                    {isSaving ? 'Menyimpan...' : (currentIdx < totalQ - 1 ? 'Soal Berikutnya' : 'Selesai & Lihat Skor')} 
                    {!isSaving && <ArrowRight size={18} />}
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

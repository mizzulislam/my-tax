import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFeynmanExplainer } from '../hooks/useFeynmanExplainer';
import { supabase } from '../lib/supabase';
import { Topic } from '../types';
import FeynmanOutput from '../components/FeynmanOutput';
import { ArrowLeft, RefreshCw, FileText } from 'lucide-react';

export default function TopicExplainer() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startExplaining, streamedText, isLoading, error, isComplete } = useFeynmanExplainer();
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [existingExplanation, setExistingExplanation] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadTopicAndExplanation() {
      if (!user || !slug) return;
      setPageLoading(true);
      try {
        // Fetch topic
        const { data: topicData, error: topicError } = await supabase
          .from('topics')
          .select('*')
          .eq('slug', slug)
          .single();

        if (topicError || !topicData) throw topicError || new Error('Topic not found');
        setTopic(topicData);

        // Fetch existing explanation
        const { data: explData, error: explError } = await supabase
          .from('explanations')
          .select('*')
          .eq('user_id', user.id)
          .eq('topic_id', topicData.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (explData && explData.output) {
          setExistingExplanation(explData.output);
        } else {
          // If none exists, start streaming auto
          await startExplaining(user.id, slug);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    }

    loadTopicAndExplanation();
  }, [user, slug]);

  const handleRegenerate = async () => {
    if (!user || !slug) return;
    setExistingExplanation(null);
    await startExplaining(user.id, slug);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <p className="text-gray-500 mb-4">Topik tidak ditemukan.</p>
        <button onClick={() => navigate('/dashboard')} className="text-emerald-600 font-medium">Bawa saya ke Dashboard</button>
      </div>
    );
  }

  const shownText = existingExplanation || streamedText;
  const showStreamingUI = !existingExplanation && !isComplete && isLoading;
  const showCompletedUI = existingExplanation || isComplete;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 md:py-10 px-4">
      <div className="max-w-3xl w-full space-y-6">
        
        {/* Navigation Breadcrumb */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-gray-500 hover:text-gray-800 text-sm flex items-center gap-2 font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Kembali ke Dashboard
        </button>

        {/* Header Topic */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-emerald-100 text-emerald-700 p-2 rounded-xl">
              <FileText size={24} />
            </span>
            <h1 className="text-3xl font-bold text-gray-800">{topic.title}</h1>
          </div>
          <p className="text-gray-600 text-lg ml-11">{topic.description}</p>
        </div>
        
        {/* Error Handling */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex justify-between items-center">
            <div>
              <p className="font-bold mb-1">Gagal memuat penjelasan</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
            <button onClick={handleRegenerate} className="bg-white px-4 py-2 rounded-lg text-emerald-700 border border-emerald-200 hover:bg-emerald-50 text-sm font-medium">Coba Lagi</button>
          </div>
        )}

        {/* Content Area */}
        {(!error && (shownText || showStreamingUI)) && (
          <div className="bg-transparent border-none w-full">
            {/* If there's an existing explanation, show regenerate button */}
            {existingExplanation && (
              <div className="flex justify-end mb-4">
                <button 
                  onClick={handleRegenerate}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 font-medium px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 transition-colors"
                >
                  <RefreshCw size={14} /> Perbarui penjelasan
                </button>
              </div>
            )}

            {/* AI Streaming Indicator */}
            {showStreamingUI && !shownText && (
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center space-y-4">
                 <div className="flex justify-center space-x-2 text-emerald-500 mb-4">
                   <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce"></div>
                   <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                   <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                 </div>
                 <p className="text-gray-600 font-medium text-lg">AI sedang menyiapkan penjelasan untukmu...</p>
                 <p className="text-sm text-gray-400">Menyesuaikan konteks dengan pekerjaan & hobimu</p>
               </div>
            )}

            {/* Generated / Streaming Content */}
            {shownText && (
              <FeynmanOutput content={shownText} isStreaming={!showCompletedUI} />
            )}
          </div>
        )}

        {/* Next Actions */}
        {showCompletedUI && !error && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <button 
               onClick={() => navigate('/dashboard')}
               className="text-gray-500 hover:text-gray-800 font-medium px-4 py-2"
            >
               Nanti Saja
            </button>
            <button 
              onClick={() => navigate(`/quiz/${slug}`)}
              className="py-3 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Lanjut ke Kuis &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


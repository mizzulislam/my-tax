import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getUserProfile } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { UserProfile, Topic } from '../types';
import { FileText, Calculator, Building, CheckCircle2, Circle, Scale, Landmark, HardHat, FileSpreadsheet, Home, Briefcase } from 'lucide-react';

interface TopicWithProgress extends Topic {
  status: 'belum' | 'sedang' | 'selesai';
  quizScore?: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [topics, setTopics] = useState<TopicWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const p = await getUserProfile(user.id);
        if (!p || !p.occupation) {
          navigate('/onboarding');
          return;
        }
        setProfile(p);

        // Fetch active topics
        const { data: topicsData, error: topicsError } = await supabase
          .from('topics')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (topicsError) throw topicsError;

        // Fetch user progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);

        if (progressError) throw progressError;

        // Fetch quiz results
        const { data: quizData, error: quizError } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user.id);

        if (quizError) throw quizError;

        // Extract latest max score per topic using sorting
        const sortedQuizData = (quizData || []).sort(
          (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
        );
        const topicScores: Record<string, number> = {};
        sortedQuizData.forEach(q => {
          topicScores[q.topic_id] = q.score; // later dates overwrite earlier
        });

        // Merge topic and progress and score
        const merged: TopicWithProgress[] = (topicsData || []).map((t) => {
          const prog = (progressData || []).find((p) => p.topic_id === t.id);
          return {
            ...t,
            status: prog?.status || 'belum',
            quizScore: topicScores[t.id]
          };
        });

        setTopics(merged);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const completedCount = topics.filter(t => t.status === 'selesai').length;
  const progressRatio = topics.length > 0 ? (completedCount / topics.length) * 100 : 0;

  const renderIcon = (slug: string) => {
    switch (slug) {
      case 'ppn': return <Calculator className="text-indigo-500 w-8 h-8" />;
      case 'npwp': return <FileText className="text-emerald-500 w-8 h-8" />;
      case 'kup': return <Scale className="text-amber-500 w-8 h-8" />;
      case 'pph-op': return <Briefcase className="text-blue-500 w-8 h-8" />;
      case 'pph-badan': return <Building className="text-gray-700 w-8 h-8" />;
      case 'pph-potput': return <HardHat className="text-orange-500 w-8 h-8" />;
      case 'pbb-bphtb': return <Home className="text-teal-600 w-8 h-8" />;
      case 'akuntansi-pajak': return <FileSpreadsheet className="text-purple-500 w-8 h-8" />;
      case 'pph-21': return <Landmark className="text-pink-500 w-8 h-8" />;
      default: return <Building className="text-blue-500 w-8 h-8" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-10 px-4">
      <div className="max-w-5xl w-full mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Halo, {profile?.full_name ? profile.full_name.split(' ')[0] : 'Kawan'}! 👋
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Siap belajar pajak hari ini?</p>
          </div>
          
          <div className="flex flex-col gap-2 min-w-[200px]">
            <div className="flex justify-between text-sm font-medium text-gray-600">
              <span>Progresmu</span>
              <span>{completedCount} dari {topics.length} topik selesai</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div 
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressRatio}%` }}
              ></div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors text-right mt-2"
            >
              Keluar Akun
            </button>
          </div>
        </div>
        
        {/* Topics Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Topik Pajak</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topics.map((t) => (
              <div 
                key={t.id} 
                onClick={() => navigate(`/topic/${t.slug}`)}
                className="cursor-pointer group flex flex-col bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all duration-200 h-full"
              >
                <div className="flex justify-between flex-wrap gap-2 items-start mb-4">
                  <div className="p-3 bg-gray-50 rounded-xl group-hover:scale-105 transition-transform">
                    {renderIcon(t.slug)}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    t.difficulty === 'dasar' ? 'bg-sky-100 text-sky-700' :
                    t.difficulty === 'menengah' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {t.difficulty === 'dasar' ? 'Dasar' : t.difficulty === 'menengah' ? 'Menengah' : 'Lanjut'}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-emerald-700 transition-colors">{t.title}</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2">{t.description}</p>
                
                <div className="mt-auto border-t border-gray-50 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {t.status === 'selesai' ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={16}/> Selesai 
                        {t.quizScore !== undefined && (
                          <span className="px-2 py-0.5 ml-1 bg-emerald-50 text-emerald-700 rounded-md text-xs leading-none border border-emerald-200 shadow-sm">
                            Skor: {t.quizScore}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-400 flex items-center gap-1"><Circle size={16}/> Belum dipelajari</span>
                    )}
                  </div>
                  <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 font-medium text-sm whitespace-nowrap">
                    {t.status === 'selesai' ? 'Ulangi \u2192' : 'Mulai \u2192'}
                  </span>
                </div>
              </div>
            ))}
            {topics.length === 0 && (
              <div className="col-span-full py-10 text-center text-gray-500">
                Belum ada topik yang aktif.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

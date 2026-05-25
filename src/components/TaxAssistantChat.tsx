'use client';

import { useState, useRef, useEffect } from 'react';
import { useTaxpayerStore } from '@/store/useTaxpayerStore';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { useFetchChatSessions, useCreateChatSession } from '@/hooks/useChatSessions';
import { useFetchChatMessages, useCreateChatMessage } from '@/hooks/useChatMessages';
import { useAiTaxContext } from '@/hooks/useAiTaxContext';
import { supabase } from '@/lib/supabase';

export default function TaxAssistantChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const profile = useTaxpayerStore((state) => state.profile);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const { data: sessions, error: sessionsError } = useFetchChatSessions();
  const createSession = useCreateChatSession();
  const isChatTableMissing = sessionsError?.message.includes('chat_sessions') ?? false;
  
  // Set the latest session as active by default if opening
  useEffect(() => {
    if (isOpen && !activeSessionId && sessions && sessions.length > 0) {
      setActiveSessionId(sessions[0].id);
    }
  }, [isOpen, sessions, activeSessionId]);

  const { data: dbMessages = [] } = useFetchChatMessages(activeSessionId);
  const createMessage = useCreateChatMessage();
  const { data: aiTaxContext } = useAiTaxContext();

  // Temporary local state for streaming UI
  const [tempMessage, setTempMessage] = useState<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [dbMessages, tempMessage]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    if (isChatTableMissing) {
      alert('Tabel chat Fase 6 belum dibuat. Buka halaman AI Assistant untuk melihat SQL migrasi.');
      return;
    }

    const userMessageText = input.trim();
    setInput('');
    setIsLoading(true);
    setTempMessage('');

    try {
      // 1. Ensure we have a session
      let currentSessionId = activeSessionId;
      if (!currentSessionId) {
        const newSession = await createSession.mutateAsync(userMessageText.substring(0, 30));
        currentSessionId = newSession.id;
        setActiveSessionId(currentSessionId);
      } else if (dbMessages.length === 0) {
        // Update title if it's the first message
        await supabase.from('chat_sessions').update({ title: userMessageText.substring(0, 30) }).eq('id', currentSessionId);
      }

      // 2. Save User Message to DB
      await createMessage.mutateAsync({
        session_id: currentSessionId,
        role: 'user',
        content: userMessageText
      });

      // 3. Format history for API
      const historyForApi = dbMessages.slice(-10).map(m => ({
        role: m.role,
        text: m.content
      }));

      // 4. Fetch from API (Streaming)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessageText,
          context: profile,
          aiContext: aiTaxContext,
          sessionId: currentSessionId,
          persona: 'umum',
          tone: 'jelas',
          history: historyForApi
        }),
      });

      if (!res.ok) throw new Error('Gagal mendapatkan respon AI');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      if (!reader) throw new Error('Streaming tidak didukung');

      let aiResponseText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        aiResponseText += chunk;
        setTempMessage(aiResponseText);
      }

      // 5. Save AI Response to DB
      await createMessage.mutateAsync({
        session_id: currentSessionId,
        role: 'ai',
        content: aiResponseText,
        metadata: {
          isHighRisk: res.headers.get('X-High-Risk') === 'true',
          model: res.headers.get('X-Model-Used')
        }
      });

      setTempMessage('');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal memproses jawaban AI.';
      alert(`Error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[400px] max-w-[calc(100vw-3rem)] h-[550px] max-h-[70vh] bg-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200">
          <div className="p-4 bg-slate-800/80 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">AI Taxologist</h3>
                <p className="text-xs text-blue-400">Asisten Konsultan Pajak Ahli</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {dbMessages.length === 0 && !tempMessage && (
              <div className="text-center text-slate-400 text-sm mt-8">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                </div>
                <p>Halo! Saya adalah Taxologist AI.</p>
                <p className="mt-1 opacity-80 leading-relaxed">Saya dapat membaca draf data Anda dan menjawab pertanyaan seputar regulasi pajak UU HPP terkini.</p>
                <Link 
                  href="/dashboard/assistant" 
                  onClick={() => setIsOpen(false)}
                  className="inline-block mt-4 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg transition-colors"
                >
                  Lihat Riwayat Obrolan &rarr;
                </Link>
              </div>
            )}
            
            {dbMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-md ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm'}`}>
                  {msg.role === 'ai' ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700">
                      <ReactMarkdown
                        components={{
                          code({ children, ...props }) {
                            return (
                              <code className="bg-transparent px-0 py-0 rounded-none border-0 text-blue-400 font-sans font-bold" {...props}>
                                {children}
                              </code>
                            );
                          },
                          strong({ children }) {
                            return <strong className="bg-transparent px-0 py-0 rounded-none border-0 text-blue-400 font-black">{children}</strong>;
                          },
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {tempMessage && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-md bg-slate-800 text-slate-200 rounded-tl-sm">
                  <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700">
                    <ReactMarkdown
                      components={{
                        code({ children, ...props }) {
                          return (
                            <code className="bg-transparent px-0 py-0 rounded-none border-0 text-blue-400 font-sans font-bold" {...props}>
                              {children}
                            </code>
                          );
                        },
                        strong({ children }) {
                          return <strong className="bg-transparent px-0 py-0 rounded-none border-0 text-blue-400 font-black">{children}</strong>;
                        },
                      }}
                    >
                      {tempMessage}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
            
            {isLoading && !tempMessage && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-tl-sm px-4 py-3 text-sm flex gap-1.5 items-center shadow-md">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="p-4 bg-slate-800/50 border-t border-slate-700/50">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya seputar pajak..."
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-full pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 w-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
              >
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center justify-center hover:scale-110 transition-transform focus:outline-none"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
        )}
      </button>
    </div>
  );
}

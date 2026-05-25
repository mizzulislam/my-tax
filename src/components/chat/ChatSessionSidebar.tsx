'use client';

import { useState } from 'react';
import { useFetchChatSessions, useDeleteChatSession, ChatSession } from '@/hooks/useChatSessions';

interface ChatSessionSidebarProps {
  activeSessionId: string | null;
  onSelectSession: (id: string | null) => void;
}

export default function ChatSessionSidebar({ activeSessionId, onSelectSession }: ChatSessionSidebarProps) {
  const { data: sessions = [], isLoading, error } = useFetchChatSessions();
  const deleteSession = useDeleteChatSession();
  const [pendingDeleteSession, setPendingDeleteSession] = useState<ChatSession | null>(null);

  const handleNewChat = () => {
    onSelectSession(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const session = sessions.find((item) => item.id === id);
    if (session) setPendingDeleteSession(session);
  };

  const confirmDelete = () => {
    if (!pendingDeleteSession) return;
    const sessionId = pendingDeleteSession.id;

    deleteSession.mutate(sessionId, {
      onSuccess: () => {
        if (activeSessionId === sessionId) {
          onSelectSession(null);
        }
        setPendingDeleteSession(null);
      },
      onError: () => setPendingDeleteSession(null)
    });
  };

  return (
    <div className="relative w-full md:w-72 flex-shrink-0 bg-slate-900/60 backdrop-blur-xl border-r border-slate-800/80 flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-slate-800/80">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Obrolan Baru
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {error && (
          <div className="p-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
            {error.message}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center p-6 text-slate-500 text-xs">
            Belum ada riwayat percakapan.
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                activeSessionId === session.id 
                  ? 'bg-blue-600/20 border-blue-500/30 text-white' 
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <div className="truncate text-sm font-medium">
                  {session.title || 'Percakapan Baru'}
                </div>
              </div>

              <button
                onClick={(e) => handleDelete(e, session.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Hapus percakapan"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {pendingDeleteSession && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-white">Hapus riwayat obrolan?</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  Sesi <span className="font-bold text-slate-200">&quot;{pendingDeleteSession.title || 'Percakapan Baru'}&quot;</span> akan dihapus permanen.
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPendingDeleteSession(null)}
                className="rounded-2xl border border-slate-700 bg-slate-950/40 px-4 py-3 text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteSession.isPending}
                className="rounded-2xl bg-red-500 px-4 py-3 text-xs font-black text-white hover:bg-red-400 disabled:opacity-60"
              >
                {deleteSession.isPending ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

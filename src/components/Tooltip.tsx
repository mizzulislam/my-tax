'use client';

import { useState } from 'react';

interface TooltipProps {
  content: string;
}

export default function Tooltip({ content }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-1.5 group cursor-help">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(!visible)}
        className="text-slate-500 hover:text-blue-400 transition-colors focus:outline-none flex items-center justify-center p-0.5"
        aria-label="Informasi regulasi perpajakan"
      >
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </button>

      {visible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3.5 bg-slate-900/95 backdrop-blur-xl border border-slate-800 text-[11px] text-slate-300 rounded-2xl shadow-2xl z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200 leading-relaxed font-medium">
          <span className="relative z-10 block text-left">{content}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-900"></span>
        </span>
      )}
    </span>
  );
}

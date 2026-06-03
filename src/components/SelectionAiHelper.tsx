'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useSelectionStore } from '@/store/useSelectionStore';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';

export default function SelectionAiHelper() {
  const { isSelectionModeActive, setPendingPrompt, setSelectionMode } = useSelectionStore();
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [highlightRects, setHighlightRects] = useState<{ top: number; left: number; width: number; height: number }[]>([]);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  
  const [selectedText, setSelectedText] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setPosition(null);
    setHighlightRects([]);
    setSelectedText('');
    setInput('');
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isSelectionModeActive) {
      handleClose();
      return;
    }

    const handleSelectionChange = (e?: Event) => {
      if (e?.target && popoverRef.current?.contains(e.target as Node)) return;
      if (document.activeElement && popoverRef.current?.contains(document.activeElement)) return;

      setTimeout(() => {
        if (document.activeElement && popoverRef.current?.contains(document.activeElement)) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          handleClose();
          return;
        }

        const text = selection.toString().trim();
        if (text === '') {
          handleClose();
          return;
        }

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const clientRects = range.getClientRects();

        if (rect.width === 0 && rect.height === 0) {
          handleClose();
          return;
        }

        // Dynamically find the scrolling container
        let scrollParent: HTMLElement | null = range.commonAncestorContainer as HTMLElement;
        if (scrollParent.nodeType !== 1) scrollParent = scrollParent.parentElement;
        
        while (scrollParent && scrollParent !== document.body) {
          const style = window.getComputedStyle(scrollParent);
          if (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflow === 'auto' || style.overflow === 'scroll') {
            break;
          }
          scrollParent = scrollParent.parentElement;
        }

        const targetContainer = scrollParent && scrollParent !== document.body 
          ? scrollParent 
          : (document.getElementById('dashboard-main-scroll') || document.body);
          
        // Ensure container is relative so absolute positioning works perfectly inside it
        if (targetContainer !== document.body && window.getComputedStyle(targetContainer).position === 'static') {
          targetContainer.style.position = 'relative';
        }

        setPortalTarget(targetContainer);

        const containerRect = targetContainer.getBoundingClientRect();
        const scrollTop = targetContainer === document.body ? window.scrollY : targetContainer.scrollTop;
        const scrollLeft = targetContainer === document.body ? window.scrollX : targetContainer.scrollLeft;

        // Generate exact highlight overlays relative to the container's origin
        const rectsArray = Array.from(clientRects).map(r => ({
          top: r.top - containerRect.top + scrollTop,
          left: r.left - containerRect.left + scrollLeft,
          width: r.width,
          height: r.height
        }));

        setHighlightRects(rectsArray);
        setPosition({
          top: rect.bottom - containerRect.top + 8 + scrollTop, 
          left: rect.left - containerRect.left + (rect.width / 2) + scrollLeft
        });
        
        setSelectedText(text);
        setInput('');

        // Clear native selection so only our custom persistent highlight remains
        setTimeout(() => {
          window.getSelection()?.removeAllRanges();
        }, 10);
      }, 50);
    };

    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);
    
    const handleMouseDown = (e: MouseEvent) => {
      if (popoverRef.current?.contains(e.target as Node)) return;
      handleClose();
    };
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('keyup', handleSelectionChange);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isSelectionModeActive]);

  // Focus input when it appears
  useEffect(() => {
    if (position) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [position]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const fullPrompt = `Konteks teks yang disorot: "${selectedText}"\n\nPertanyaan: ${input}`;
    
    setPendingPrompt(fullPrompt);
    setSelectionMode(false);
    handleClose();
    router.push('/dashboard/assistant');
  };

  if (!mounted || !isSelectionModeActive || !position || !portalTarget) return null;
  
  const popoverContent = (
    <>
      {highlightRects.map((rect, idx) => (
        <div
          key={idx}
          className="absolute pointer-events-none rounded-[3px] shadow-[0_0_0_1px_rgba(59,130,246,0.3)] animate-in fade-in"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            backgroundColor: 'rgba(59, 130, 246, 0.25)',
            zIndex: 20 // Below DashboardShell header (z-30)
          }}
        />
      ))}
      
      <div 
        className="absolute pointer-events-auto transition-all duration-300 ease-out"
        style={{ 
          top: position.top, 
          left: position.left,
          transform: 'translate(-50%, 0)', 
          zIndex: 25 // Below DashboardShell header (z-30), above highlight
        }}
        ref={popoverRef}
      >
        <div className="bg-[#1e1e2d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col w-[320px]">
          <form onSubmit={handleSubmit} className="flex items-center p-1.5 relative">
            <div className="flex items-center justify-center w-8 h-8 text-amber-400 shrink-0 ml-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Minta Gemini..."
              className="flex-1 bg-transparent border-none text-white text-[13px] focus:outline-none focus:ring-0 px-2 py-2 placeholder-slate-400"
            />
            {input.trim() && (
              <button type="submit" className="p-2 text-blue-400 hover:text-blue-300 shrink-0 mr-1 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            )}
          </form>
        </div>
      </div>
    </>
  );

  return createPortal(popoverContent, portalTarget);
}

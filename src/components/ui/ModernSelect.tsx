import React, { useState, useRef, useEffect } from 'react';

export type SelectOption = {
  label: string;
  value: string;
};

export function ModernSelect({
  id,
  value,
  placeholder = 'Pilih',
  options,
  onChange,
  className = '',
  disabled = false,
}: {
  id?: string;
  value?: string | null;
  placeholder?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find((option) => option.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef} id={id}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`group flex w-full items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-3.5 py-3 text-left text-sm text-white outline-none transition hover:border-blue-500/50 hover:bg-slate-950/70 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/25 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`truncate ${selected ? 'text-white' : 'text-slate-500'}`}>{selected?.label || placeholder}</span>
        <svg
          className={`h-4 w-4 flex-shrink-0 text-slate-300 transition-transform duration-200 ${open ? 'rotate-180 text-blue-300' : 'group-hover:text-blue-300'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-[100] mt-2 w-full overflow-hidden rounded-xl border border-blue-500/25 bg-slate-950/95 p-1.5 shadow-2xl shadow-blue-950/30 backdrop-blur-xl">
          <div className="max-h-56 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(59,130,246,0.45)_rgba(15,23,42,0.8)]" role="listbox">
            {options.map((option) => {
              const active = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                  }`}
                  role="option"
                  aria-selected={active}
                >
                  <span className="truncate">{option.label}</span>
                  {active && (
                    <svg className="h-4 w-4 flex-shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="m5 13 4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

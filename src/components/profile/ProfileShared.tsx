import { useState } from 'react';

export type SettingsSection = 'profil' | 'data-pribadi' | 'akun' | 'academy' | 'notifikasi';

export type NotificationPrefs = {
  email_notifications: boolean;
  push_notifications: boolean;
  deadline_reminder_days: number;
  quiet_hours_start: string;
  quiet_hours_end: string;
};

export type SelectOption = {
  label: string;
  value: string;
};

export const inputClass = 'w-full rounded-md border border-slate-700/55 bg-slate-950/40 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/25 placeholder:text-slate-600 disabled:bg-slate-900/70 disabled:text-slate-500';
export const labelClass = 'text-sm font-bold text-slate-200';
export const helperClass = 'text-xs font-medium leading-relaxed text-slate-500';

export function SettingIcon({ type }: { type: SettingsSection }) {
  const common = 'h-5 w-5';
  if (type === 'profil') {
    return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z" /></svg>;
  }
  if (type === 'data-pribadi') {
    return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6h10M10 12h10M10 18h10M4 6h.01M4 12h.01M4 18h.01" /></svg>;
  }
  if (type === 'akun') {
    return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.12 3-2.5S13.657 6 12 6 9 7.12 9 8.5 10.343 11 12 11Zm0 2c-3.314 0-6 1.343-6 3v1h12v-1c0-1.657-2.686-3-6-3Z" /></svg>;
  }
  if (type === 'academy') {
    return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m12 3 9 5-9 5-9-5 9-5Zm-5 8v4c0 1.657 2.239 3 5 3s5-1.343 5-3v-4" /></svg>;
  }
  return <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.16V11a6 6 0 0 0-12 0v3.16a2 2 0 0 1-.6 1.44L4 17h5m6 0a3 3 0 1 1-6 0" /></svg>;
}

export function Toggle({
  checked,
  onChange,
  tone = 'blue',
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  tone?: 'blue' | 'yellow';
}) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className={`h-6 w-11 rounded-full bg-slate-800 transition peer-checked:${tone === 'yellow' ? 'bg-yellow-600' : 'bg-blue-600'} peer-focus:ring-2 peer-focus:ring-blue-500/30`} />
      <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
    </label>
  );
}

export function SectionHeader({ title }: { title: string }) {
  return (
    <>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <div className="mt-5 border-t border-slate-800/60" />
    </>
  );
}

export function SliderInput({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}) {
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-2 w-full cursor-pointer appearance-none rounded-full accent-blue-500 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
      style={{
        background: `linear-gradient(to right, rgb(37 99 235) 0%, rgb(37 99 235) ${progress}%, rgb(30 41 59) ${progress}%, rgb(30 41 59) 100%)`,
      }}
    />
  );
}

export function ModernSelect({
  id,
  value,
  placeholder = 'Pilih',
  options,
  open,
  onToggle,
  onChange,
}: {
  id: string;
  value?: string | null;
  placeholder?: string;
  options: SelectOption[];
  open: boolean;
  onToggle: (id: string | null) => void;
  onChange: (value: string) => void;
}) {
  const selected = options.find((option) => option.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onToggle(open ? null : id)}
        className="group flex w-full items-center justify-between gap-3 rounded-md border border-slate-700/55 bg-slate-950/40 px-3.5 py-2.5 text-left text-sm text-white outline-none transition hover:border-blue-500/50 hover:bg-slate-950/70 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/25"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? 'text-white' : 'text-slate-500'}>{selected?.label || placeholder}</span>
        <svg
          className={`h-4 w-4 flex-shrink-0 text-slate-300 transition-transform duration-200 ${open ? 'rotate-180 text-blue-300' : 'group-hover:text-blue-300'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-blue-500/25 bg-slate-950/95 p-1.5 shadow-2xl shadow-blue-950/30 backdrop-blur-xl">
          <div className="max-h-64 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(59,130,246,0.45)_rgba(15,23,42,0.8)]" role="listbox">
            {options.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    onToggle(null);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                  role="option"
                  aria-selected={active}
                >
                  <span>{option.label}</span>
                  {active && (
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="m5 13 4 4L19 7" />
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

export function formatDateInput(value?: string | null) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function CalendarDropdown({
  value,
  open,
  viewDate,
  onToggle,
  onClose,
  onViewDateChange,
  onChange,
}: {
  value?: string | null;
  open: boolean;
  viewDate: Date;
  onToggle: () => void;
  onClose: () => void;
  onViewDateChange: (date: Date) => void;
  onChange: (value: string) => void;
}) {
  const [calendarMode, setCalendarMode] = useState<'day' | 'month' | 'year'>('day');
  const selectedDate = value ? new Date(`${value}T00:00:00`) : null;
  const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const monthLabel = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(monthStart);
  const yearLabel = String(monthStart.getFullYear());
  const firstGridDate = new Date(monthStart);
  const mondayOffset = (monthStart.getDay() + 6) % 7;
  firstGridDate.setDate(monthStart.getDate() - mondayOffset);

  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstGridDate);
    date.setDate(firstGridDate.getDate() + index);
    return date;
  });

  const changeMonth = (offset: number) => {
    onViewDateChange(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const changeCalendarPage = (offset: number) => {
    if (calendarMode === 'year') {
      onViewDateChange(new Date(viewDate.getFullYear() + (offset * 12), viewDate.getMonth(), 1));
      return;
    }

    if (calendarMode === 'month') {
      onViewDateChange(new Date(viewDate.getFullYear() + offset, viewDate.getMonth(), 1));
      return;
    }

    changeMonth(offset);
  };

  const monthOptions = Array.from({ length: 12 }, (_, index) => ({
    index,
    label: new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(new Date(viewDate.getFullYear(), index, 1)),
  }));
  const yearStart = viewDate.getFullYear() - 5;
  const yearOptions = Array.from({ length: 12 }, (_, index) => yearStart + index);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full items-center justify-between gap-3 rounded-md border border-slate-700/55 bg-slate-950/40 px-3.5 py-2.5 text-left text-sm text-white outline-none transition hover:border-blue-500/50 hover:bg-slate-950/70 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/25"
      >
        <span className={value ? 'text-white' : 'text-slate-500'}>{formatDateInput(value) || 'mm/dd/yyyy'}</span>
        <svg className="h-5 w-5 text-white/90 transition group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-3 w-[min(88vw,318px)] overflow-hidden rounded-[1.65rem] border border-blue-500/20 bg-[#1c1d24]/95 p-4 shadow-2xl shadow-blue-950/40 backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-x-14 -top-16 h-24 rounded-full bg-blue-600/35 blur-2xl" />
          <div className="relative mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeCalendarPage(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-blue-400/45 hover:bg-blue-500/20"
              aria-label="Sebelumnya"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div className="flex items-center gap-1 text-base font-bold text-white">
              <button
                type="button"
                onClick={() => setCalendarMode(calendarMode === 'month' ? 'day' : 'month')}
                className={`rounded-lg px-2 py-1 transition hover:bg-white/10 ${calendarMode === 'month' ? 'bg-blue-500/20 text-blue-200' : ''}`}
              >
                {monthLabel}
              </button>
              <button
                type="button"
                onClick={() => setCalendarMode(calendarMode === 'year' ? 'day' : 'year')}
                className={`rounded-lg px-2 py-1 transition hover:bg-white/10 ${calendarMode === 'year' ? 'bg-blue-500/20 text-blue-200' : ''}`}
              >
                {yearLabel}
              </button>
            </div>
            <button
              type="button"
              onClick={() => changeCalendarPage(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-blue-400/45 hover:bg-blue-500/20"
              aria-label="Berikutnya"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          {calendarMode === 'month' && (
            <div className="relative grid grid-cols-3 gap-2 pb-1">
              {monthOptions.map((month) => {
                const active = month.index === viewDate.getMonth();
                return (
                  <button
                    key={month.index}
                    type="button"
                    onClick={() => {
                      onViewDateChange(new Date(viewDate.getFullYear(), month.index, 1));
                      setCalendarMode('day');
                    }}
                    className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
                      active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {month.label}
                  </button>
                );
              })}
            </div>
          )}

          {calendarMode === 'year' && (
            <div className="relative grid grid-cols-3 gap-2 pb-1">
              {yearOptions.map((year) => {
                const active = year === viewDate.getFullYear();
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => {
                      onViewDateChange(new Date(year, viewDate.getMonth(), 1));
                      setCalendarMode('month');
                    }}
                    className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
                      active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          )}

          {calendarMode === 'day' && (
            <div className="relative grid grid-cols-7 gap-y-2 text-center">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                <div key={day} className="pb-1 text-[10px] font-black text-slate-500">
                  {day}
                </div>
              ))}
              {days.map((date) => {
                const inMonth = date.getMonth() === viewDate.getMonth();
                const dateValue = toDateValue(date);
                const selected = selectedDate && toDateValue(selectedDate) === dateValue;

                return (
                  <button
                    key={dateValue}
                    type="button"
                    onClick={() => {
                      onChange(dateValue);
                      setCalendarMode('day');
                      onClose();
                    }}
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                      selected
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : inMonth
                          ? 'text-white hover:bg-white/10'
                          : 'text-slate-600 hover:bg-white/5'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}



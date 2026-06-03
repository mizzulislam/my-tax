import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="space-y-2 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-slate-950/50 border text-white rounded-xl py-3.5 focus:outline-none transition-all
              ${leftIcon ? 'pl-11' : 'px-4'}
              ${rightIcon ? 'pr-11' : 'pr-4'}
              ${
                error
                  ? 'border-red-500/50 focus:ring-2 focus:ring-red-500/20'
                  : 'border-slate-800 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500'
              }
              ${className}
            `}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-400 font-medium animate-in fade-in">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500 font-medium">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Premium Base Classes
    const baseClasses =
      'relative flex items-center justify-center gap-2 overflow-hidden rounded-xl font-bold transition-all outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed group/btn';

    // Size Variants
    const sizeClasses = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-5 py-2.5 text-xs sm:text-sm',
      lg: 'px-6 py-3 text-sm sm:text-[15px]',
    };

    // Style Variants
    const variantClasses = {
      primary:
        'bg-blue-600 text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] focus:ring-blue-400 disabled:hover:bg-blue-600 disabled:hover:shadow-none',
      secondary:
        'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white focus:ring-slate-500 shadow-md shadow-slate-900/40',
      danger:
        'bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500/20 focus:ring-red-400',
      ghost:
        'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50 focus:ring-slate-500',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
        {...props}
      >
        {/* Shimmer effect for primary button */}
        {variant === 'primary' && !disabled && !isLoading && (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
        )}

        <span className="relative flex items-center justify-center gap-2 z-10">
          {isLoading && (
            <svg
              className="animate-spin h-4 w-4 text-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          {!isLoading && leftIcon && leftIcon}
          {children}
          {!isLoading && rightIcon && rightIcon}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

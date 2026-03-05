import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-500 active:bg-brand-700',
  secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100',
  ghost: 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700 active:bg-gray-150',
  danger: 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-9 px-4 text-[13px] gap-2 rounded-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-medium transition-all duration-150',
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) ? 'opacity-40 cursor-not-allowed pointer-events-none' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <Loader2 className={size === 'sm' ? 'w-3.5 h-3.5 animate-spin' : 'w-4 h-4 animate-spin'} />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}

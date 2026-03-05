import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
}

export function Input({
  error = false,
  icon,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </span>
      )}
      <input
        className={[
          'h-10 w-full text-sm bg-white border rounded-lg px-3 outline-none transition-all placeholder:text-gray-400',
          icon ? 'pl-9' : '',
          error
            ? 'border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-gray-200 focus:ring-2 focus:ring-brand-200 focus:border-brand-400',
          props.disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : '',
          className,
        ].join(' ')}
        {...props}
      />
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({
  error = false,
  className = '',
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={[
        'w-full text-sm bg-white border rounded-lg px-3 py-2.5 outline-none transition-all placeholder:text-gray-400 resize-none',
        error
          ? 'border-red-500 focus:ring-2 focus:ring-red-200'
          : 'border-gray-200 focus:ring-2 focus:ring-brand-200 focus:border-brand-400',
        props.disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : '',
        className,
      ].join(' ')}
      {...props}
    />
  );
}

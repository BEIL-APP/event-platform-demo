import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  clickable?: boolean;
  as?: 'div' | 'button';
  onClick?: () => void;
}

export function Card({
  children,
  className = '',
  clickable = false,
  as: Tag = 'div',
  onClick,
}: CardProps) {
  return (
    <Tag
      onClick={onClick}
      className={[
        'bg-white border border-gray-200/60 rounded-xl',
        clickable
          ? 'hover:border-gray-300 hover:shadow-card-hover transition-all duration-150 cursor-pointer'
          : '',
        Tag === 'button' ? 'text-left w-full' : '',
        className,
      ].join(' ')}
    >
      {children}
    </Tag>
  );
}

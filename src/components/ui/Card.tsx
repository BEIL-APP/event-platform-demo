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
        'bg-white border border-gray-200 rounded-xl shadow-card',
        clickable ? 'hover:shadow-card-hover transition-all cursor-pointer' : '',
        Tag === 'button' ? 'text-left w-full' : '',
        className,
      ].join(' ')}
    >
      {children}
    </Tag>
  );
}

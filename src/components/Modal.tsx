import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

export function Modal({ open, onClose, title, children, size = 'sm' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === 'md' ? 'max-w-md' : 'max-w-sm';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 animate-fade-in" />

      <div
        className={`relative bg-white rounded-xl shadow-modal w-full ${maxW} sm:mx-auto overflow-hidden animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

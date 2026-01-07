'use client';

import { useEffect } from 'react';

interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: (id: string) => void;
}

export default function Toast({ id, message, type, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900 border-green-500 text-green-200';
      case 'error':
        return 'bg-red-900 border-red-500 text-red-200';
      case 'warning':
        return 'bg-yellow-900 border-yellow-500 text-yellow-200';
      case 'info':
        return 'bg-blue-900 border-blue-500 text-blue-200';
      default:
        return 'bg-gray-900 border-gray-500 text-gray-200';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[300px] max-w-md mb-3 animate-slide-in ${getTypeStyles()}`}
    >
      <span className="text-xl font-bold" aria-hidden="true">
        {getIcon()}
      </span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        aria-label={`Close ${type} notification`}
        className="text-current hover:opacity-75 transition focus:outline-none focus:ring-2 focus:ring-current rounded"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

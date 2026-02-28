'use client';

import { Toaster } from 'sonner';

export function SonnerToaster() {
  return (
    <Toaster
      richColors
      position="top-right"
      expand
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg rounded-xl border border-gray-200 dark:border-gray-700',
          title: 'text-sm font-semibold',
          description: 'text-sm text-gray-500 dark:text-gray-400',
          success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
          info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        },
      }}
    />
  );
}

'use client';

import { useState, useCallback } from 'react';

interface UseLoadingState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  setData: (data: T) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Hook untuk mengelola state loading, error, dan data
 */
export function useLoadingState<T = unknown>(
  initialData: T | null = null
): UseLoadingState<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return {
    data,
    isLoading,
    error,
    setData,
    setLoading,
    setError,
  };
}

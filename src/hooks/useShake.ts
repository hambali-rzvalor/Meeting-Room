'use client';

import { useState, useCallback } from 'react';

interface UseShakeState {
  isShaking: boolean;
  triggerShake: () => void;
  resetShake: () => void;
}

/**
 * Hook untuk mengontrol animasi shake pada form
 * Digunakan saat ada error seperti konflik booking
 */
export function useShake(): UseShakeState {
  const [isShaking, setIsShaking] = useState(false);

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    // Reset setelah animasi selesai (0.5s sesuai durasi animasi CSS)
    setTimeout(() => {
      setIsShaking(false);
    }, 500);
  }, []);

  const resetShake = useCallback(() => {
    setIsShaking(false);
  }, []);

  return {
    isShaking,
    triggerShake,
    resetShake,
  };
}

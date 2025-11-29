'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateGuestId, getGuestId } from '@/lib/utils';

interface GuestContextType {
  guestId: string | null;
  isGuest: boolean;
  setIsGuest: (value: boolean) => void;
}

const GuestContext = createContext<GuestContextType>({
  guestId: null,
  isGuest: false,
  setIsGuest: () => {},
});

export function GuestProvider({ children }: { children: ReactNode }) {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check if user has a guest ID stored
    const existingGuestId = getGuestId();
    if (existingGuestId) {
      setGuestId(existingGuestId);
      setIsGuest(true);
    }
  }, []);

  const handleSetIsGuest = (value: boolean) => {
    setIsGuest(value);
    if (value && !guestId) {
      const newGuestId = generateGuestId();
      setGuestId(newGuestId);
    }
  };

  return (
    <GuestContext.Provider value={{ guestId, isGuest, setIsGuest: handleSetIsGuest }}>
      {children}
    </GuestContext.Provider>
  );
}

export const useGuest = () => useContext(GuestContext);

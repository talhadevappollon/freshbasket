'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { DEFAULT_CITY, KARACHI_AREAS } from '@/data/deliveryAreas';

export interface DeliveryLocation {
  city: string;
  area: string;
}

interface DeliveryContextType {
  /** What the shopper chose in "Deliver to", or null until they have chosen */
  location: DeliveryLocation | null;
  /** Short text for buttons: the area, or the city before anything is chosen */
  label: string;
  modalOpen: boolean;
  openDeliver: () => void;
  closeDeliver: () => void;
  setLocation: (loc: DeliveryLocation) => void;
}

const KEY = 'fb_deliver_to';
const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export function DeliveryProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<DeliveryLocation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      // only accept what the store can deliver to: a hand-edited or outdated value is ignored
      if (saved && saved.city === DEFAULT_CITY && KARACHI_AREAS.includes(saved.area)) setLocationState({ city: saved.city, area: saved.area });
    } catch {
      // private mode: the choice simply lasts for this visit
    }
  }, []);

  const setLocation = useCallback((loc: DeliveryLocation) => {
    setLocationState(loc);
    try {
      localStorage.setItem(KEY, JSON.stringify(loc));
    } catch {}
  }, []);

  const openDeliver = useCallback(() => setModalOpen(true), []);
  const closeDeliver = useCallback(() => setModalOpen(false), []);

  return (
    <DeliveryContext.Provider value={{ location, label: location?.area ?? DEFAULT_CITY, modalOpen, openDeliver, closeDeliver, setLocation }}>
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery() {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error('useDelivery must be used within a DeliveryProvider');
  return ctx;
}

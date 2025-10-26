'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

type BrandTone = {
  lover: number;
  rebel: number;
  care: number;
  citizen: number;
  sage: number;
  tone: string;
};

// default value for your app
const defaultTone: BrandTone = {
  lover: 0.3,
  rebel: 0.3,
  care: 0.2,
  citizen: 0.1,
  sage: 0.05,
  tone: 'playful-mastery',
};

export const BrandToneContext = createContext<BrandTone>(defaultTone);

export function BrandToneProvider({
  children,
  value,
}: {
  children: ReactNode;
  value?: Partial<BrandTone>;
}) {
  // allow optional overrides while keeping sane defaults
  const merged: BrandTone = { ...defaultTone, ...(value ?? {}) };
  return (
    <BrandToneContext.Provider value={merged}>
      {children}
    </BrandToneContext.Provider>
  );
}

export const useBrandTone = () => useContext(BrandToneContext);
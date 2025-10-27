"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";

export type BrandTone = {
  lover: number;
  rebel: number;
  care: number;
  citizen: number;
  sage: number;
  tone: string;
};

// Sensible defaults for the whole app
const DEFAULT_TONE: BrandTone = {
  lover: 0.3,
  rebel: 0.3,
  care: 0.2,
  citizen: 0.1,
  sage: 0.05,
  tone: "playful-mastery",
};

export const BrandToneContext = createContext<BrandTone>(DEFAULT_TONE);
BrandToneContext.displayName = "BrandToneContext";

export function BrandToneProvider({
  children,
  value,
}: {
  children: ReactNode;
  /** Optional overrides; pass a stable object to avoid re-renders */
  value?: Partial<BrandTone>;
}) {
  // Merge with defaults; memoize to avoid churning context value on re-renders
  const merged = useMemo<BrandTone>(
    () => ({ ...DEFAULT_TONE, ...(value ?? {}) }),
    // If you pass a stable `value` object from parents, this stays stable too
    [value]
  );

  return (
    <BrandToneContext.Provider value={merged}>
      {children}
    </BrandToneContext.Provider>
  );
}

/** Hook to read the current brand tone */
export const useBrandTone = (): BrandTone => useContext(BrandToneContext);
"use client";

import { TonConnectUIProvider } from "@tonconnect/ui-react";
import type { ReactNode } from "react";

export default function TonProvider({ children }: { children: ReactNode }) {
  // The UI provider reads window; keep it client-only.
  return (
    <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  );
}
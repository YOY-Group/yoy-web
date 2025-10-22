import type { Metadata } from "next";
import TelemetryClient from "./TelemetryClient";

export const metadata: Metadata = {
  title: "Drops Telemetry — YOY",
  robots: { index: false },
  alternates: { canonical: "/drops" },
};

export default function Page() {
  return (
    <main className="bg-[#0b0f17] min-h-screen text-white">
      {/* Client-side fetch to avoid preview origin issues */}
      <TelemetryClient />
    </main>
  );
}
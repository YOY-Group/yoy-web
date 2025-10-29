import React from "react"; // <- forces module & silences TS “not a module”

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { searchParams?: { session_id?: string } };

export default function OrderPaidPage({ searchParams }: Props) {
  const sid = searchParams?.session_id ?? "";

  return (
    <div className="max-w-xl mx-auto px-6 py-16 text-center space-y-4">
      <h1 className="text-2xl font-semibold">Payment received</h1>
      <p className="text-zinc-600">
        <span className="font-medium">
          Your first XP minted — welcome to Layer One.
        </span>
      </p>
      {sid && <p className="text-xs text-zinc-500">Ref: {sid}</p>}
      <div className="text-sm text-zinc-600">
        Watch your XP in the Account drawer. Early-access drops unlock as you
        climb.
      </div>
    </div>
  );
}
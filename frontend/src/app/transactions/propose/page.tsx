// src/app/transactions/propose/page.tsx
"use client";
import ProposeTransaction from "../../../components/ProposeTransaction";

export default function ProposePage() {
  return (
    <div className="container">
      <h1 className="text-3xl font-bold text-center mb-6">Propose Transaction</h1>
      <ProposeTransaction />
    </div>
  );
}
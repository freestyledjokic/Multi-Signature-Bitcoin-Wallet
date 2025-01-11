// src/app/transactions/execute/page.tsx
"use client";
import ExecuteTransactions from "../../../components/ExecuteTransaction";

export default function ExecutePage() {
  return (
    <div className="container">
      <h1 className="text-3xl font-bold text-center mb-6">Execute Transactions</h1>
      <ExecuteTransactions />
    </div>
  );
}
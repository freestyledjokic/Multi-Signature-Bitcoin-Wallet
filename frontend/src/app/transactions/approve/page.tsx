// src/app/transactions/approve/page.tsx
"use client";
import ApproveTransactions from "../../../components/ApproveTransaction";

export default function ApprovePage() {
  return (
    <div className="container">
      <h1 className="text-3xl font-bold text-center mb-6">Approve Transactions</h1>
      <ApproveTransactions />
    </div>
  );
}

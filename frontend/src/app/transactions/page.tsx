"use client";
import { useState } from "react";
import TransactionList from "../../components/TransactionList";

export default function ViewTransactions() {
  return (
    <div className="container">
      <h1 className="text-3xl font-bold text-center mb-6">View Transactions</h1>
      <TransactionList />
    </div>
  );
}
// components/ExecuteTransaction.tsx
"use client";
import { useState, useEffect } from "react";
import { Copy, CheckCircle, AlertCircle } from "lucide-react";
import contractCalls from "../utils/stacks";

interface Transaction {
  id: number;
  to: { value: string };
  amount: { value: number };
  approvals: { value: number };
  sender: { value: string };
}

export default function ExecuteTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const txIds = Array.from({ length: 10 }, (_, i) => i + 1);
      const fetchedTxs = await Promise.all(
        txIds.map(async (id) => {
          const tx = await contractCalls.getTransaction(id);
          if (tx?.value?.value) {
            const txData = tx.value.value;
            // Only return transactions with enough approvals
            if (txData.approvals.value >= 2) {
              return { id, ...txData };
            }
          }
          return null;
        })
      );

      setTransactions(fetchedTxs.filter((tx): tx is Transaction => tx !== null));
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transactions. Please try again.");
    }
  };
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleExecute = async (id: number) => {
    setIsLoading(id);
    setError("");
    setSuccessMessage("");

    try {
      await contractCalls.executeTransaction(id);
      setSuccessMessage(`Transaction ${id} has been executed successfully`);
      
      setTimeout(async () => {
        await fetchTransactions();
        setIsLoading(null);
      }, 2000);
    } catch (err) {
      setError("Failed to execute transaction. Please try again.");
      setIsLoading(null);
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Ready to Execute</h2>
        <button onClick={() => fetchTransactions()} className="btn btn-sm">
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No transactions ready for execution.</p>
          <p className="text-sm text-gray-500 mt-2">
            Transactions require 2 approvals before they can be executed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="transaction-item">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-400">ID: {tx.id}</span>
                    <span className="badge badge-success">Ready to Execute</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="tooltip">
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-400">To: </span>
                            <span className="font-mono">{tx.to.value}</span>
                            <button
                                onClick={() => handleCopy(tx.to.value)}
                                className="p-1 hover:bg-gray-700 rounded-md transition-colors group"
                                aria-label="Copy address"
                            >
                                {copiedAddress === tx.to.value ? (
                                <CheckCircle size={16} className="text-green-400" />
                                ) : (
                                <Copy 
                                    size={16} 
                                    className="text-gray-400 group-hover:text-gray-300" 
                                />
                                )}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                    <span className="text-gray-400">From: </span>
                    <span className="font-mono">{tx.sender.value}</span>
                            <button
                                onClick={() => handleCopy(tx.sender.value)}
                                className="p-1 hover:bg-gray-700 rounded-md transition-colors group"
                                aria-label="Copy address"
                            >
                                {copiedAddress === tx.sender.value ? (
                                <CheckCircle size={16} className="text-green-400" />
                                ) : (
                                <Copy 
                                    size={16} 
                                    className="text-gray-400 group-hover:text-gray-300" 
                                />
                                )}
                            </button>
                            </div>
                    
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-400">Amount: </span>
                        <p className="text-lg font-semibold">
                        {tx.amount.value} <span className="text-sm text-gray-400">Sats</span>
                        </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleExecute(tx.id)}
                  disabled={isLoading === tx.id}
                  className="btn btn-success"
                >
                  {isLoading === tx.id ? (
                    <span className="flex items-center">
                      <div className="loading-spinner mr-2" />
                      Executing...
                    </span>
                  ) : (
                    "Execute"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
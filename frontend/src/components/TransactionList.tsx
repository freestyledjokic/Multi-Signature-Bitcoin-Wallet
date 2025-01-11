// components/TransactionList.tsx
import { useEffect, useState } from "react";
import { Copy, CheckCircle, AlertCircle } from "lucide-react";
import contractCalls from "../utils/stacks";

interface Transaction {
  id: number;
  amount: { value: number };
  approvals: { value: number };
  sender: { value: string };
  to: { value: string };
}

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      setIsLoading(true);
      setError(null);
      const txIds = Array.from({ length: 10 }, (_, i) => i + 1);
      const fetchedTxs = await Promise.all(
        txIds.map(async (id) => {
          try {
            const tx = await contractCalls.getTransaction(id);
            if (tx?.value?.value) {
              return {
                id,
                ...tx.value.value
              };
            }
            return null;
          } catch (err) {
            console.error(`Error fetching transaction ${id}:`, err);
            return null;
          }
        })
      );

      const validTxs = fetchedTxs.filter((tx): tx is Transaction => 
        tx !== null && tx.to?.value !== undefined
      );

      setTransactions(validTxs);
    } catch (err) {
      setError("Failed to fetch transactions. Please try again.");
      console.error("Error fetching transactions:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-800/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="flex items-center justify-center space-x-2 text-red-400">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
        <button 
          onClick={fetchTransactions}
          className="mt-4 btn btn-primary mx-auto"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <button 
          onClick={fetchTransactions} 
          className="btn btn-sm"
          aria-label="Refresh transactions"
        >
          Refresh
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No transactions found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-gray-400 font-medium">ID</th>
                <th className="py-3 px-4 text-left text-gray-400 font-medium">Recipient</th>
                <th className="py-3 px-4 text-left text-gray-400 font-medium">Amount</th>
                <th className="py-3 px-4 text-left text-gray-400 font-medium">Approvals</th>
                <th className="py-3 px-4 text-left text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-4">{tx.id}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">
                        {`${tx.to.value.slice(0, 8)}...${tx.to.value.slice(-8)}`}
                      </span>
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
                  </td>
                  <td className="py-3 px-4">
                    {tx.amount.value.toLocaleString()} 
                    <span className="text-sm text-gray-400 ml-1">Sats</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${
                      tx.approvals.value >= 2 ? 'badge-success' : 'badge-warning'
                    }`}>
                      {tx.approvals.value}/2
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${
                      tx.approvals.value >= 2 
                        ? 'badge-success' 
                        : tx.approvals.value === 1 
                        ? 'badge-warning' 
                        : 'badge-error'
                    }`}>
                      {tx.approvals.value >= 2 
                        ? 'Ready' 
                        : tx.approvals.value === 1 
                        ? 'Pending' 
                        : 'New'
                      }
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
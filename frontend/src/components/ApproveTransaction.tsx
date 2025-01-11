"use client";
import { useState, useEffect } from "react";
import { AppConfig, UserSession } from "@stacks/connect";
import contractCalls from "../utils/stacks";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

interface TransactionValue {
  type: string;
  value: any;
}

interface Transaction {
  id: number;
  amount: TransactionValue;
  approvals: TransactionValue;
  receiverApproved: TransactionValue;
  senderApproved: TransactionValue;
  sender: TransactionValue;
  to: TransactionValue;
}

export default function ApproveTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [approvalTimeouts, setApprovalTimeouts] = useState<{[key: number]: NodeJS.Timeout}>({});
  const [approvalStates, setApprovalStates] = useState<{[key: number]: 'pending' | 'approving' | 'approved' | null}>({});

  useEffect(() => {
    const init = async () => {
      if (userSession.isUserSignedIn()) {
        const userData = userSession.loadUserData();
        setCurrentUser(userData.profile.stxAddress.testnet);
      }
      await fetchTransactions();
    };

    init();

    return () => {
      Object.values(approvalTimeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const fetchTransactions = async () => {
    try {
      const txIds = Array.from({ length: 10 }, (_, i) => i + 1);
      const fetchedTxs = await Promise.all(
        txIds.map(async (id) => {
          try {
            const tx = await contractCalls.getTransaction(id);
            if (tx?.value?.value) {
              const txData = tx.value.value;

              // Ensure default values if they are missing
              return {
                id,
                ...txData,
                senderApproved: txData.sender_approved || { type: 'bool', value: false },
                receiverApproved: txData.receiver_approved || { type: 'bool', value: false }
              };
            }
            return null;
          } catch (err) {
            console.error(`Error fetching transaction ${id}:`, err);
            return null;
          }
        })
      );

      // Filter transactions that have **less than 2 approvals** only
      const validTxs = fetchedTxs.filter((tx): tx is Transaction => 
        tx !== null && 
        tx.to?.value !== undefined &&
        tx.approvals.value < 2 // Only show transactions with fewer than 2 approvals
      );

      setTransactions(validTxs);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transactions. Please try again.");
    }
  };

  const handleApprove = async (id: number) => {
    if (!currentUser) return;

    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    setIsLoading(id);
    setError("");
    setSuccessMessage("");

    try {
      setApprovalStates(prev => ({ ...prev, [id]: 'pending' }));
      await contractCalls.approveTransaction(id);
      setApprovalStates(prev => ({ ...prev, [id]: 'approving' }));

      if (approvalTimeouts[id]) {
        clearTimeout(approvalTimeouts[id]);
      }

      const timeout = setTimeout(() => {
        setApprovalStates(prev => {
          const newStates = { ...prev };
          delete newStates[id];
          return newStates;
        });
        fetchTransactions();
      }, 10000);

      setApprovalTimeouts(prev => ({
        ...prev,
        [id]: timeout
      }));

      setSuccessMessage(`Transaction ${id} is being approved.`);
    } catch (err) {
      setError("Failed to approve transaction. Please try again.");
      setApprovalStates(prev => {
        const newStates = { ...prev };
        delete newStates[id];
        return newStates;
      });
    } finally {
      setIsLoading(null);
    }
  };

  const getUserRole = (tx: Transaction) => {
    if (!currentUser) return null;
    if (tx.sender.value === currentUser) return "Sender";
    if (tx.to.value === currentUser) return "Receiver";
    return null;
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Pending Approvals</h2>
        <button onClick={() => fetchTransactions()} className="btn btn-sm">
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No transactions pending approval.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => {
            const userRole = getUserRole(tx);
            
            return (
              <div key={tx.id} className="transaction-item">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-400">ID: {tx.id}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="text-gray-400">To: </span>
                        <span className="font-mono">{tx.to.value}</span>
                      </p>
                      
                      <p className="text-sm">
                        <span className="text-gray-400">From: </span>
                        <span className="font-mono">{tx.sender.value}</span>
                      </p>
                      
                      <p className="text-lg font-semibold">
                        {tx.amount.value} <span className="text-sm text-gray-400">Sats</span>
                      </p>

                      <div className="flex gap-2 mt-2">
                        <span className={`badge ${tx.senderApproved.value ? 'badge-success' : 'badge-warning'}`}>
                          Sender: {tx.senderApproved.value ? 'Approved' : 'Pending'}
                        </span>
                        <span className={`badge ${tx.receiverApproved.value ? 'badge-success' : 'badge-warning'}`}>
                          Receiver: {tx.receiverApproved.value ? 'Approved' : 'Pending'}
                        </span>
                      </div>

                      {userRole && (
                        <p className="text-sm text-blue-400">Your Role: {userRole}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleApprove(tx.id)}
                    disabled={isLoading === tx.id}
                    className={`btn bg-blue-500 hover:bg-blue-600 ${isLoading === tx.id ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isLoading === tx.id ? "Approving..." : "Approve"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// components/ProposeTransaction.tsx
"use client";
import { useState } from "react";
import contractCalls from "../utils/stacks";

export default function ProposeTransaction() {
  const [formData, setFormData] = useState({
    id: "",
    to: "",
    amount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const amountInSats = Math.floor(parseFloat(formData.amount) * 100000000);
      const id = Math.floor(parseInt(formData.id));

      if (isNaN(amountInSats) || amountInSats <= 0) {
        throw new Error("Invalid amount");
      }

      if (isNaN(id) || id <= 0) {
        throw new Error("Invalid ID");
      }

      await contractCalls.proposeTransaction(id, formData.to, amountInSats);
      setSuccessMessage("Transaction proposed successfully!");
      setFormData({ id: "", to: "", amount: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to propose transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Propose New Transaction</h2>

      {error && <div className="alert alert-error mb-4">{error}</div>}
      {successMessage && <div className="alert alert-success mb-4">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <label htmlFor="id" className="block text-sm font-medium text-gray-300 mb-2">
            Transaction ID
          </label>
          <input
            id="id"
            name="id"
            type="number"
            value={formData.id}
            onChange={handleInputChange}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            min="1"
            step="1"
            placeholder="Enter unique ID number"
            style={{ zIndex: 1 }}
          />
        </div>

        <div className="relative">
          <label htmlFor="to" className="block text-sm font-medium text-gray-300 mb-2">
            Bitcoin Address
          </label>
          <input
            id="to"
            name="to"
            type="text"
            value={formData.to}
            onChange={handleInputChange}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            required
            maxLength={34}
            placeholder="Enter recipient's Bitcoin address"
            style={{ zIndex: 1 }}
          />
        </div>

        <div className="relative">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
            Amount (BTC)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleInputChange}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            min="0.00000001"
            step="0.00000001"
            placeholder="Enter amount in BTC"
            style={{ zIndex: 1 }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Proposing...
            </span>
          ) : (
            "Propose Transaction"
          )}
        </button>
      </form>
    </div>
  );
}
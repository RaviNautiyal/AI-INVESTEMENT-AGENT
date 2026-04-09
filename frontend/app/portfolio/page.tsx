"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiExternalLink } from "react-icons/fi";

export default function Portfolio() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const router = useRouter();

  const getToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPortfolio = async () => {
    setFetching(true);
    try {
      const res = await fetch("http://localhost:8000/portfolio/all", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setStocks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching portfolio:", err);
    }
    setFetching(false);
  };

  const removeStock = async (ticker: string) => {
    await fetch(`http://localhost:8000/portfolio/remove/${ticker}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    fetchPortfolio();
  };

  const totalInvested = stocks.reduce((sum, s) => sum + (s.invested || 0), 0);
  const totalValue = stocks.reduce((sum, s) => sum + (s.current_value || 0), 0);
  const totalProfitLoss = totalValue - totalInvested;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Portfolio</h1>
            <p className="text-gray-400 text-sm mt-1">
              Holdings computed from your transaction history
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/transactions")}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <FiPlus /> Add Transaction
            </button>
            <button
              onClick={() => router.push("/transactions")}
              className="flex items-center gap-2 border border-white/10 hover:border-white/30 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
            >
              <FiExternalLink size={14} /> View All Trades
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6 text-sm text-indigo-300">
          💡 Your portfolio is automatically computed from your transactions.
          To add or remove holdings, use <span
            className="underline cursor-pointer"
            onClick={() => router.push("/transactions")}
          >Transaction History</span>.
        </div>

        {/* Summary Cards */}
        {stocks.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Total Invested</p>
              <p className="text-xl font-bold text-white">
                ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Current Value</p>
              <p className="text-xl font-bold text-white">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className={`rounded-xl border p-4 ${totalProfitLoss >= 0 ? "bg-emerald-400/10 border-emerald-400/20" : "bg-red-400/10 border-red-400/20"}`}>
              <p className="text-xs text-gray-400 mb-1">Total P&L</p>
              <p className={`text-xl font-bold ${totalProfitLoss >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {totalProfitLoss >= 0 ? "+" : ""}${totalProfitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}

        {/* Stock List */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {fetching ? (
            <p className="text-center text-gray-500 py-16">Fetching live prices...</p>
          ) : stocks.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">No holdings yet.</p>
              <button
                onClick={() => router.push("/transactions")}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors mx-auto"
              >
                <FiPlus /> Add your first transaction
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 text-gray-400">
                <tr>
                  {["Stock", "Shares", "Avg Cost", "Live Price (USD)", "Value", "P&L", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-semibold text-indigo-400">{stock.ticker}</td>
                    <td className="px-4 py-3">{stock.shares}</td>
                    <td className="px-4 py-3">${stock.avg_cost_usd ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span>${stock.current_price_usd}</span>
                      <span className="text-gray-500 text-xs ml-1">(₹{stock.current_price_inr})</span>
                    </td>
                    <td className="px-4 py-3">${stock.current_value?.toLocaleString()}</td>
                    <td className={`px-4 py-3 font-medium ${stock.profit_loss >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {stock.profit_loss >= 0 ? "+" : ""}${stock.profit_loss?.toFixed(2)}
                      <span className="text-xs ml-1">({stock.percent_change}%)</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeStock(stock.ticker)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                        title="Remove all transactions for this stock"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
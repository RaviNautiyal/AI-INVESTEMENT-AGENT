"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
export default function Portfolio() {
    const [stocks, setStocks] = useState<any[]>([]);
    const [ticker, setTicker] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const router = useRouter();

const getToken = () => localStorage.getItem("token") || "";
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }

  fetchPortfolio();

  const interval = setInterval(() => {
    fetchPortfolio();
  }, 30000);

  return () => clearInterval(interval);
}, []);
const fetchPortfolio = async () => {
  setFetching(true);
  try {
    const res = await fetch("http://localhost:8000/portfolio/all", {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    setStocks(data);
  } catch (err) {
    console.error("Error fetching portfolio:", err);
  }
  setFetching(false);
};

const addStock = async () => {
  if (!ticker || !amount) return;
  setLoading(true);

  await fetch("http://localhost:8000/portfolio/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ ticker: ticker.toUpperCase(), amount: parseFloat(amount) }),
  });

  setTicker("");
  setAmount("");
  setLoading(false);
  fetchPortfolio();
};

const removeStock = async (ticker: string) => {
  await fetch(`http://localhost:8000/portfolio/remove/${ticker}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  fetchPortfolio();
};


  const totalInvested = stocks.reduce((sum, s) => sum + s.invested, 0);
  const totalValue = stocks.reduce((sum, s) => sum + s.current_value, 0);
  const totalProfitLoss = totalValue - totalInvested;

  return (
    
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6">

        <h1 className="text-3xl font-bold text-gray-800">💼 My Portfolio</h1>

        {/* Add Stock Form */}
        <div className="flex gap-3 mt-6">
          <input
            className="border p-3 rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Ticker (AAPL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
          />
          <input
            className="border p-3 rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Amount ($)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            onClick={addStock}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition"
          >
            {loading ? "Adding..." : "Add Stock"}
          </button>
        </div>

        {/* Summary Cards */}
        {stocks.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-500">Total Invested</p>
              <p className="text-xl font-bold text-blue-600">${totalInvested.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-500">Current Value</p>
              <p className="text-xl font-bold text-green-600">${totalValue.toLocaleString()}</p>
            </div>
            <div className={`border rounded-lg p-4 ${totalProfitLoss >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <p className="text-sm text-gray-500">Total P&L</p>
              <p className={`text-xl font-bold ${totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalProfitLoss >= 0 ? "+" : ""}${totalProfitLoss.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Stock List */}
        <div className="mt-6 space-y-3">
          {fetching ? (
            <p className="text-center text-gray-400">Loading live prices...</p>
          ) : stocks.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">No stocks added yet.</p>
          ) : (
          stocks.map((stock, index) => (
  <div key={index} className="flex justify-between items-center border rounded-lg p-4 hover:shadow-sm transition">
    <div>
      <p className="text-lg font-semibold text-gray-800">{stock.ticker}</p>
      <p className="text-sm text-gray-500">Invested: ₹{stock.invested.toLocaleString()}</p>
      <p className="text-sm text-gray-500">Price: ${stock.current_price_usd} (₹{stock.current_price_inr})</p>
      <p className="text-sm text-gray-500">Shares: {stock.shares}</p>
    </div>
    <div className="text-right">
      <p className="text-sm text-gray-500">Current Value: ₹{stock.current_value.toLocaleString()}</p>
      <p className={`font-semibold ${stock.profit_loss >= 0 ? "text-green-600" : "text-red-600"}`}>
        {stock.profit_loss >= 0 ? "+" : ""}₹{stock.profit_loss.toLocaleString()} ({stock.percent_change}%)
      </p>
    </div>
    <button
      onClick={() => removeStock(stock.ticker)}
      className="text-red-400 hover:text-red-600 text-sm ml-4"
    >
      Remove
    </button>
  </div>
))
          )}
        </div>

      </div>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import {
  FiPlus, FiTrash2,
  FiDollarSign, FiActivity
} from "react-icons/fi";

const API = "http://localhost:8000";

interface Transaction {
  _id: string;
  symbol: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  date: string;
}

interface Position {
  symbol: string;
  quantity: number;
  avg_cost: number;
  live_price: number | null;
  current_value: number;
  unrealized_pnl: number;
  pnl_pct: number;
}

interface Summary {
  total_invested: number;
  current_value: number;
  realized_pnl: number;
  unrealized_pnl: number;
  total_pnl: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    symbol: "", type: "buy", quantity: "", price: "", date: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"positions" | "history">("positions");

  // ✅ Single token declaration — no useState, reads synchronously
  const token = typeof window !== "undefined"
    ? (localStorage.getItem("token") || localStorage.getItem("access_token"))
    : null;

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/transactions/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

     const text = await res.text();
console.log("Raw API response:", text);

if (!text || text === "null") {
  console.error("Empty response from server");
  return;
}

let data;
try {
  data = JSON.parse(text);
} catch (e) {
  console.error("JSON parse failed:", text);
  return;
}

if (!res.ok || !data) {
  console.error("API error:", data);
  return;
}

setTransactions(data.transactions || []);
setPositions(data.open_positions || []);
setSummary(data.summary || null);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async () => {
    if (!form.symbol || !form.quantity || !form.price || !form.date) return;
    setSubmitting(true);
    try {
      await fetch(`${API}/transactions/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          symbol: form.symbol,
          type: form.type,
          quantity: parseFloat(form.quantity),
          price: parseFloat(form.price),
          date: form.date
        })
      });
      setShowModal(false);
      setForm({ symbol: "", type: "buy", quantity: "", price: "", date: "" });
      fetchData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`${API}/transactions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
  };

  const pnlColor = (val: number) =>
    val >= 0 ? "text-emerald-400" : "text-red-400";

  const pnlBg = (val: number) =>
    val >= 0 ? "bg-emerald-400/10 border-emerald-400/20" : "bg-red-400/10 border-red-400/20";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Transaction History</h1>
            <p className="text-gray-400 text-sm mt-1">Track every trade — realized & unrealized P&L</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FiPlus /> Add Transaction
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Total Invested", value: summary.total_invested },
              { label: "Current Value",  value: summary.current_value },
              { label: "Realized P&L",   value: summary.realized_pnl,   colored: true },
              { label: "Unrealized P&L", value: summary.unrealized_pnl, colored: true },
              { label: "Total P&L",      value: summary.total_pnl,      colored: true },
            ].map((card, i) => (
              <div key={i} className={`rounded-xl border p-4 ${card.colored ? pnlBg(card.value) : "bg-white/5 border-white/10"}`}>
                <p className="text-gray-400 text-xs mb-1">{card.label}</p>
                <p className={`text-lg font-bold ${card.colored ? pnlColor(card.value) : "text-white"}`}>
                  {card.value >= 0 ? "+" : ""}${card.value.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/5 rounded-lg p-1 w-fit">
          {(["positions", "history"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {tab === "positions" ? "Open Positions" : "Trade History"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading...</div>
        ) : activeTab === "positions" ? (

          /* Open Positions Table */
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 text-gray-400">
                <tr>
                  {["Symbol", "Qty", "Avg Cost", "Live Price", "Value", "P&L", "P&L %"].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-gray-500 py-10">No open positions</td></tr>
                ) : positions.map((pos, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-semibold text-indigo-400">{pos.symbol}</td>
                    <td className="px-4 py-3">{pos.quantity}</td>
                    <td className="px-4 py-3">${pos.avg_cost.toFixed(2)}</td>
                    <td className="px-4 py-3">{pos.live_price ? `$${pos.live_price.toFixed(2)}` : "—"}</td>
                    <td className="px-4 py-3">${pos.current_value.toFixed(2)}</td>
                    <td className={`px-4 py-3 font-medium ${pnlColor(pos.unrealized_pnl)}`}>
                      {pos.unrealized_pnl >= 0 ? "+" : ""}${pos.unrealized_pnl.toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 font-medium ${pnlColor(pos.pnl_pct)}`}>
                      {pos.pnl_pct >= 0 ? "+" : ""}{pos.pnl_pct.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        ) : (

          /* Trade History Table */
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 text-gray-400">
                <tr>
                  {["Date", "Symbol", "Type", "Quantity", "Price", "Total", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-gray-500 py-10">No transactions yet</td></tr>
                ) : [...transactions].reverse().map((t) => (
                  <tr key={t._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{t.date}</td>
                    <td className="px-4 py-3 font-semibold text-indigo-400">{t.symbol}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        t.type === "buy"
                          ? "bg-emerald-400/20 text-emerald-400"
                          : "bg-red-400/20 text-red-400"
                      }`}>
                        {t.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">{t.quantity}</td>
                    <td className="px-4 py-3">${t.price.toFixed(2)}</td>
                    <td className="px-4 py-3 font-medium">${(t.quantity * t.price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#13131a] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-5">Add Transaction</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Symbol</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 uppercase"
                    placeholder="e.g. AAPL"
                    value={form.symbol}
                    onChange={e => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Type</label>
                  <select
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Quantity</label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="0"
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Price per share</label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="0.00"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">Date</label>
                <input
                  type="date"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={submitting}
                className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add Transaction"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
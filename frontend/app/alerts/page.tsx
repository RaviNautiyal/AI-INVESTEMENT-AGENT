"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [ticker, setTicker] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState("above");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [triggered, setTriggered] = useState<any[]>([]);

  const getToken = () => localStorage.getItem("token") || "";

  const fetchAlerts = async () => {
    try {
      const res = await fetch("http://localhost:8000/alerts/all", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addAlert = async () => {
    if (!ticker || !targetPrice) return;
    setLoading(true);
    try {
      await fetch("http://localhost:8000/alerts/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ticker: ticker.toUpperCase(),
          target_price: parseFloat(targetPrice),
          condition,
        }),
      });
      setTicker("");
      setTargetPrice("");
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const removeAlert = async (ticker: string) => {
    try {
      await fetch(`http://localhost:8000/alerts/remove/${ticker}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const checkAlerts = async () => {
    setChecking(true);
    try {
      const res = await fetch("http://localhost:8000/alerts/check", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setTriggered(data.triggered_alerts || []);
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
    setChecking(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetchAlerts();
  }, []);

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-white">🔔 Price Alerts</h1>
        <p className="text-gray-500 text-sm mt-1">
          Get notified when stocks hit your target price
        </p>
      </div>

      {/* Triggered Alerts */}
      {triggered.length > 0 && (
        <div className="bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-xl p-5">
          <p className="text-green-400 font-semibold mb-3">
            🎯 {triggered.length} Alert(s) Triggered!
          </p>
          <div className="space-y-2">
            {triggered.map((t, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-[#0d0d14] rounded-lg p-3"
              >
                <p className="text-white font-semibold">{t.ticker}</p>
                <p className="text-gray-400 text-sm">
                  Target: ${t.target_price} ({t.condition})
                </p>
                <p className="text-green-400 font-bold">
                  Now: ${t.current_price}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Alert */}
      <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-5">
        <p className="text-white font-semibold mb-4">Create New Alert</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-500 p-3 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Ticker (AAPL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
          />
          <input
            type="number"
            className="bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-500 p-3 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Target Price ($)"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
          />
          <select
            className="bg-[#1a1a2e] border border-[#2a2a3e] text-white p-3 rounded-lg focus:outline-none focus:border-blue-500"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="above">Price goes Above</option>
            <option value="below">Price goes Below</option>
          </select>
          <button
            onClick={addAlert}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-semibold text-sm"
          >
            {loading ? "Adding..." : "Set Alert"}
          </button>
        </div>
      </div>

      {/* Check Alerts Button */}
      <div className="flex justify-between items-center">
        <p className="text-gray-500 text-sm">
          {alerts.length} active alert(s)
        </p>
        <button
          onClick={checkAlerts}
          className="bg-[#1a1a2e] hover:bg-[#2a2a3e] text-gray-300 hover:text-white px-5 py-2 rounded-lg transition text-sm border border-[#2a2a3e] flex items-center gap-2"
        >
          {checking ? "Checking..." : "🔄 Check Alerts Now"}
        </button>
      </div>

      {/* Alerts Table */}
      <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[#1a1a2e]">
          <p className="text-white font-semibold">Active Alerts</p>
        </div>

        {alerts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-gray-500">No alerts set yet</p>
            <p className="text-gray-600 text-sm mt-1">
              Create an alert above to get notified
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-5 px-5 py-3 text-xs text-gray-500 uppercase tracking-wider border-b border-[#1a1a2e]">
              <span>Stock</span>
              <span className="text-right">Target Price</span>
              <span className="text-right">Condition</span>
              <span className="text-right">Status</span>
              <span className="text-right">Action</span>
            </div>

            <div className="divide-y divide-[#1a1a2e]">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 px-5 py-4 hover:bg-[#1a1a2e] transition items-center"
                >
                  <p className="text-white font-semibold">{alert.ticker}</p>

                  <p className="text-gray-300 text-right">
                    ${alert.target_price}
                  </p>

                  <p className={`text-right text-sm font-semibold ${
                    alert.condition === "above"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}>
                    {alert.condition === "above" ? "↑ Above" : "↓ Below"}
                  </p>

                  <p className={`text-right text-xs font-semibold ${
                    alert.triggered ? "text-green-400" : "text-yellow-400"
                  }`}>
                    {alert.triggered ? "✓ Triggered" : "⏳ Watching"}
                  </p>

                  <div className="flex justify-end">
                    <button
                      onClick={() => removeAlert(alert.ticker)}
                      className="text-xs text-red-400 hover:text-red-300 bg-red-600 bg-opacity-10 px-3 py-1 rounded transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
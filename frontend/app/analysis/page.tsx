"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AnalysisPage() {
  const router = useRouter();
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, []);

  const analyzeStock = async () => {
    if (!ticker) return;
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(`http://localhost:8000/analysis/stock/${ticker.toUpperCase()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) {
        setError("Stock not found. Please check the ticker.");
        setLoading(false);
        return;
      }

      const result = await res.json();
      setData(result);

    } catch (err) {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  // Build chart data
  const buildChartData = () => {
    if (!data) return [];

    const smaOffset = data.prices.length - data.sma_7.length;
    const emaOffset = data.prices.length - data.ema_7.length;

    return data.dates.map((date: string, index: number) => ({
      date: date.slice(5),
      price: data.prices[index],
      sma: index >= smaOffset ? data.sma_7[index - smaOffset] : null,
      ema: index >= emaOffset ? data.ema_7[index - emaOffset] : null,
    }));
  };

  const getTrendColor = (trend: string) => {
    if (trend === "Upward") return "text-green-600";
    if (trend === "Downward") return "text-red-600";
    return "text-gray-600";
  };

  const getRiskLevel = (volatility: number) => {
    if (volatility < 1) return { label: "Low Risk", color: "text-green-600" };
    if (volatility < 2) return { label: "Medium Risk", color: "text-yellow-600" };
    return { label: "High Risk", color: "text-red-600" };
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* Header */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h1 className="text-2xl font-bold text-gray-800">📊 Stock Analysis Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Moving averages, volatility, Sharpe ratio and trend detection
          </p>

          <div className="flex gap-3 mt-6">
            <input
              className="border p-3 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter Ticker (AAPL)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
            />
            <button
              onClick={analyzeStock}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Metrics Cards */}
        {data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white shadow rounded-xl p-4">
                <p className="text-sm text-gray-500">Trend</p>
                <p className={`text-xl font-bold ${getTrendColor(data.trend)}`}>
                  {data.trend === "Upward" ? "📈" : "📉"} {data.trend}
                </p>
              </div>

              <div className="bg-white shadow rounded-xl p-4">
                <p className="text-sm text-gray-500">Volatility</p>
                <p className={`text-xl font-bold ${getRiskLevel(data.volatility).color}`}>
                  {data.volatility}%
                </p>
                <p className={`text-xs ${getRiskLevel(data.volatility).color}`}>
                  {getRiskLevel(data.volatility).label}
                </p>
              </div>

              <div className="bg-white shadow rounded-xl p-4">
                <p className="text-sm text-gray-500">Sharpe Ratio</p>
                <p className={`text-xl font-bold ${data.sharpe_ratio > 1 ? "text-green-600" : "text-red-600"}`}>
                  {data.sharpe_ratio}
                </p>
                <p className="text-xs text-gray-400">
                  {data.sharpe_ratio > 1 ? "Good return/risk" : "Poor return/risk"}
                </p>
              </div>

              <div className="bg-white shadow rounded-xl p-4">
                <p className="text-sm text-gray-500">Max Price (30d)</p>
                <p className="text-xl font-bold text-blue-600">
                  ${data.max_price_last_30_days}
                </p>
                <p className="text-xs text-gray-400">Segment Tree query</p>
              </div>
            </div>

            {/* Price Chart with Moving Averages */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Price + Moving Averages (3 months)
              </h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={buildChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    interval={9}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#2563eb"
                    dot={false}
                    name="Price"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="sma"
                    stroke="#16a34a"
                    dot={false}
                    name="SMA (7)"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="ema"
                    stroke="#dc2626"
                    dot={false}
                    name="EMA (7)"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Algorithm Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white shadow rounded-xl p-5">
                <h3 className="font-bold text-gray-800 mb-2">📐 Algorithms Used</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Simple Moving Average (SMA)</li>
                  <li>✅ Exponential Moving Average (EMA)</li>
                  <li>✅ Segment Tree (max price query)</li>
                  <li>✅ Volatility (std deviation)</li>
                  <li>✅ Sharpe Ratio (risk adjusted return)</li>
                </ul>
              </div>

              <div className="bg-white shadow rounded-xl p-5">
                <h3 className="font-bold text-gray-800 mb-2">📋 Stock Summary</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Ticker: <span className="font-semibold">{data.ticker}</span></li>
                  <li>Data Points: <span className="font-semibold">{data.total_data_points}</span></li>
                  <li>Latest Price: <span className="font-semibold">${data.prices[data.prices.length - 1]}</span></li>
                  <li>Trend: <span className={`font-semibold ${getTrendColor(data.trend)}`}>{data.trend}</span></li>
                  <li>Risk Level: <span className={`font-semibold ${getRiskLevel(data.volatility).color}`}>{getRiskLevel(data.volatility).label}</span></li>
                </ul>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
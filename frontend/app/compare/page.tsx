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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

export default function ComparePage() {
  const router = useRouter();
  const [tickers, setTickers] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, []);

  const compareStocks = async () => {
    if (!tickers) return;
    setLoading(true);
    setError("");
    setData([]);

    try {
      const res = await fetch(
        `http://localhost:8000/comparison/compare?tickers=${tickers}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      if (!res.ok) {
        setError("Failed to fetch comparison data");
        setLoading(false);
        return;
      }

      const result = await res.json();
      setData(result);

    } catch {
      setError("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  // Build normalized chart data (base 100)
  const buildChartData = () => {
    if (!data.length) return [];

    const minLength = Math.min(...data.map((s) => s.prices.length));

    return data[0].dates.slice(-minLength).map((date: string, i: number) => {
      const point: any = { date: date.slice(5) };
      data.forEach((stock) => {
        const prices = stock.prices.slice(-minLength);
        const base = prices[0];
        point[stock.ticker] = base > 0
          ? round(((prices[i] - base) / base) * 100, 2)
          : 0;
      });
      return point;
    });
  };

  const round = (n: number, d: number) =>
    Math.round(n * 10 ** d) / 10 ** d;

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
    return `$${(cap / 1e6).toFixed(1)}M`;
  };

  const tooltipStyle = {
    backgroundColor: "#0d0d14",
    border: "1px solid #1a1a2e",
    borderRadius: "8px",
    color: "#e2e8f0",
  };

  const metrics = [
    { key: "current_price", label: "Current Price", format: (v: any) => `$${v}` },
    { key: "change_3mo", label: "3M Return", format: (v: any) => `${v >= 0 ? "+" : ""}${v}%` },
    { key: "volatility", label: "Volatility", format: (v: any) => `${v}%` },
    { key: "sharpe_ratio", label: "Sharpe Ratio", format: (v: any) => v },
    { key: "pe_ratio", label: "P/E Ratio", format: (v: any) => v || "—" },
    { key: "market_cap", label: "Market Cap", format: formatMarketCap },
    { key: "52w_high", label: "52W High", format: (v: any) => `$${v}` },
    { key: "52w_low", label: "52W Low", format: (v: any) => `$${v}` },
    { key: "dividend_yield", label: "Dividend Yield", format: (v: any) => `${v}%` },
    { key: "trend", label: "Trend", format: (v: any) => v },
  ];

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-white">⚖️ Stock Comparison</h1>
        <p className="text-gray-500 text-sm mt-1">
          Compare up to 3 stocks side by side
        </p>
      </div>

      {/* Search */}
      <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-5">
        <p className="text-gray-400 text-sm mb-3">
          Enter tickers separated by commas
        </p>
        <div className="flex gap-3">
          <input
            className="bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-500 p-3 rounded-lg flex-1 focus:outline-none focus:border-blue-500"
            placeholder="AAPL, MSFT, GOOGL"
            value={tickers}
            onChange={(e) => setTickers(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && compareStocks()}
          />
          <button
            onClick={compareStocks}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-semibold text-sm"
          >
            {loading ? "Comparing..." : "Compare"}
          </button>
        </div>

        {/* Quick comparisons */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {[
            "AAPL, MSFT, GOOGL",
            "TSLA, NVDA, AMD",
            "JPM, BAC, V",
            "AMZN, NFLX, META",
          ].map((preset, i) => (
            <button
              key={i}
              onClick={() => setTickers(preset)}
              className="px-3 py-1 bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-blue-600 rounded-lg text-xs transition"
            >
              {preset}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}
      </div>

      {data.length > 0 && (
        <>
          {/* Normalized Performance Chart */}
          <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-6">
            <h2 className="text-white font-semibold mb-1">
              Normalized Performance (Base 100)
            </h2>
            <p className="text-gray-500 text-xs mb-4">
              Shows % return from 3 months ago
            </p>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={buildChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#4a5568", fontSize: 11 }}
                  interval={9}
                />
                <YAxis
                  tick={{ fill: "#4a5568", fontSize: 11 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: any) => `${v}%`}
                />
                <Legend wrapperStyle={{ color: "#94a3b8" }} />
                {data.map((stock, i) => (
                  <Line
                    key={stock.ticker}
                    type="monotone"
                    dataKey={stock.ticker}
                    stroke={COLORS[i]}
                    dot={false}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Metrics Comparison Table */}
          <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl overflow-hidden">
            <div className="p-5 border-b border-[#1a1a2e]">
              <h2 className="text-white font-semibold">Metrics Comparison</h2>
            </div>

            {/* Header */}
            <div
              className="grid px-5 py-3 text-xs text-gray-500 uppercase tracking-wider border-b border-[#1a1a2e]"
              style={{ gridTemplateColumns: `1fr repeat(${data.length}, 1fr)` }}
            >
              <span>Metric</span>
              {data.map((stock, i) => (
                <span
                  key={i}
                  className="text-right font-bold"
                  style={{ color: COLORS[i] }}
                >
                  {stock.ticker}
                </span>
              ))}
            </div>

            <div className="divide-y divide-[#1a1a2e]">
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className="grid px-5 py-3 hover:bg-[#1a1a2e] transition items-center"
                  style={{ gridTemplateColumns: `1fr repeat(${data.length}, 1fr)` }}
                >
                  <p className="text-gray-400 text-sm">{metric.label}</p>
                  {data.map((stock, i) => {
                    const value = stock[metric.key];
                    const formatted = metric.format(value);
                    const isPositive =
                      metric.key === "change_3mo" && value >= 0;
                    const isNegative =
                      metric.key === "change_3mo" && value < 0;
                    const isUpward =
                      metric.key === "trend" && value === "Upward";
                    const isDownward =
                      metric.key === "trend" && value === "Downward";

                    return (
                      <p
                        key={i}
                        className={`text-right text-sm font-semibold ${
                          isPositive
                            ? "text-green-400"
                            : isNegative
                            ? "text-red-400"
                            : isUpward
                            ? "text-green-400"
                            : isDownward
                            ? "text-red-400"
                            : "text-gray-300"
                        }`}
                      >
                        {formatted}
                      </p>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Stock Cards */}
          <div className={`grid grid-cols-1 md:grid-cols-${data.length} gap-4`}>
            {data.map((stock, i) => (
              <div
                key={i}
                className="bg-[#0d0d14] border rounded-xl p-5"
                style={{ borderColor: COLORS[i] + "40" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[i] }}
                  />
                  <p className="text-white font-bold">{stock.ticker}</p>
                </div>
                <p className="text-gray-500 text-xs truncate mb-3">
                  {stock.name}
                </p>
                <p className="text-2xl font-bold text-white">
                  ${stock.current_price}
                </p>
                <p className={`text-sm font-semibold mt-1 ${
                  stock.change_3mo >= 0 ? "text-green-400" : "text-red-400"
                }`}>
                  {stock.change_3mo >= 0 ? "+" : ""}{stock.change_3mo}% (3M)
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && data.length === 0 && (
        <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">⚖️</p>
          <p className="text-gray-500">Enter tickers above to compare stocks</p>
          <p className="text-gray-600 text-sm mt-1">
            Try the quick presets for instant comparison
          </p>
        </div>
      )}

    </div>
  );
}
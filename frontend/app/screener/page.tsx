"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ScreenerPage() {
  const router = useRouter();
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    min_price: 0,
    max_price: 99999,
    trend: "any",
    risk: "any",
  });

  const getToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, []);

  const runScreener = async () => {
    setLoading(true);
    setStocks([]);

    try {
      const params = new URLSearchParams({
        min_price: filters.min_price.toString(),
        max_price: filters.max_price.toString(),
        trend: filters.trend,
        risk: filters.risk,
        min_volume: "0",
      });

      const res = await fetch(
        `http://localhost:8000/screener/screen?${params}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      const data = await res.json();
      setStocks(data);

    } catch (err) {
      console.error("Screener error:", err);
    }

    setLoading(false);
  };

  const formatMarketCap = (cap: number) => {
    if (!cap) return "—";
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
    return `$${(cap / 1e6).toFixed(1)}M`;
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">🔍 Stock Screener</h1>
        <p className="text-gray-500 text-sm mt-1">
          Filter stocks by price, trend and risk level
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-5">
        <p className="text-white font-semibold mb-4">Filters</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-500 text-xs mb-1">Min Price ($)</p>
            <input
              type="number"
              className="w-full bg-[#1a1a2e] border border-[#2a2a3e] text-white p-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              value={filters.min_price}
              onChange={(e) =>
                setFilters({ ...filters, min_price: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <p className="text-gray-500 text-xs mb-1">Max Price ($)</p>
            <input
              type="number"
              className="w-full bg-[#1a1a2e] border border-[#2a2a3e] text-white p-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              value={filters.max_price}
              onChange={(e) =>
                setFilters({ ...filters, max_price: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <p className="text-gray-500 text-xs mb-1">Trend</p>
            <select
              className="w-full bg-[#1a1a2e] border border-[#2a2a3e] text-white p-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              value={filters.trend}
              onChange={(e) =>
                setFilters({ ...filters, trend: e.target.value })
              }
            >
              <option value="any">Any</option>
              <option value="upward">Upward</option>
              <option value="downward">Downward</option>
            </select>
          </div>

          <div>
            <p className="text-gray-500 text-xs mb-1">Risk Level</p>
            <select
              className="w-full bg-[#1a1a2e] border border-[#2a2a3e] text-white p-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              value={filters.risk}
              onChange={(e) =>
                setFilters({ ...filters, risk: e.target.value })
              }
            >
              <option value="any">Any</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <button
          onClick={runScreener}
          className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-semibold text-sm"
        >
          {loading ? "Screening..." : "Run Screener"}
        </button>

        {loading && (
          <p className="text-gray-500 text-xs mt-2">
            Fetching live data for 20 stocks — this takes 20-30 seconds...
          </p>
        )}
      </div>

      {/* Results */}
      {stocks.length > 0 && (
        <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[#1a1a2e]">
            <p className="text-white font-semibold">
              {stocks.length} stocks found
            </p>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-7 px-5 py-3 text-xs text-gray-500 uppercase tracking-wider border-b border-[#1a1a2e]">
            <span className="col-span-2">Stock</span>
            <span className="text-right">Price</span>
            <span className="text-right">1M Change</span>
            <span className="text-right">Trend</span>
            <span className="text-right">Risk</span>
            <span className="text-right">Market Cap</span>
          </div>

          <div className="divide-y divide-[#1a1a2e]">
            {stocks.map((stock, index) => (
              <div
                key={index}
                className="grid grid-cols-7 px-5 py-4 hover:bg-[#1a1a2e] transition items-center cursor-pointer"
                onClick={() => router.push("/charts")}
              >
                <div className="col-span-2">
                  <p className="text-white font-semibold">{stock.ticker}</p>
                  <p className="text-gray-500 text-xs truncate">{stock.name}</p>
                </div>

                <p className="text-gray-300 text-right">${stock.price}</p>

                <p className={`text-right font-semibold text-sm ${
                  stock.change_1mo >= 0 ? "text-green-400" : "text-red-400"
                }`}>
                  {stock.change_1mo >= 0 ? "+" : ""}{stock.change_1mo}%
                </p>

                <p className={`text-right text-sm ${
                  stock.trend === "Upward" ? "text-green-400" : "text-red-400"
                }`}>
                  {stock.trend === "Upward" ? "↑" : "↓"} {stock.trend}
                </p>

                <span className={`text-right text-xs font-semibold ${
                  stock.risk === "Low"
                    ? "text-green-400"
                    : stock.risk === "Medium"
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}>
                  {stock.risk}
                </span>

                <p className="text-gray-400 text-right text-sm">
                  {formatMarketCap(stock.market_cap)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && stocks.length === 0 && (
        <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-500">Set your filters and run the screener</p>
          <p className="text-gray-600 text-sm mt-1">
            Screens 20 major global stocks with live data
          </p>
        </div>
      )}

    </div>
  );
}
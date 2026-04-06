"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MarketPage() {
  const router = useRouter();
  const [indices, setIndices] = useState<any[]>([]);
  const [movers, setMovers] = useState<any>({ gainers: [], losers: [] });
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("token") || "";

  const fetchAll = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };

      const [indicesRes, moversRes, summaryRes] = await Promise.all([
        fetch("http://localhost:8000/market/indices", { headers }),
        fetch("http://localhost:8000/market/movers", { headers }),
        fetch("http://localhost:8000/market/summary", { headers }),
      ]);

      const [indicesData, moversData, summaryData] = await Promise.all([
        indicesRes.json(),
        moversRes.json(),
        summaryRes.json(),
      ]);

      setIndices(indicesData);
      setMovers(moversData);
      setSummary(summaryData);

    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetchAll();
  }, []);

  const sentimentColors: any = {
    green: "text-green-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">🌍 Market Overview</h1>
          <p className="text-gray-500 text-sm mt-1">
            Global indices, top movers and market sentiment
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="bg-[#1a1a2e] hover:bg-[#2a2a3e] text-gray-400 hover:text-white px-4 py-2 rounded-lg text-sm transition border border-[#2a2a3e]"
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 text-sm">
            Fetching live market data...
          </p>
        </div>
      ) : (
        <>
          {/* Market Sentiment */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-5">
                <p className="text-gray-500 text-xs mb-1">Market Sentiment</p>
                <p className={`text-xl font-bold ${sentimentColors[summary.sentiment_color]}`}>
                  {summary.sentiment}
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  VIX: {summary.vix}
                </p>
              </div>

              <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-5">
                <p className="text-gray-500 text-xs mb-1">Gold</p>
                <p className="text-xl font-bold text-yellow-400">
                  ${summary.gold}
                </p>
                <p className="text-gray-600 text-xs mt-1">per oz</p>
              </div>

              <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-5">
                <p className="text-gray-500 text-xs mb-1">Crude Oil</p>
                <p className="text-xl font-bold text-orange-400">
                  ${summary.oil}
                </p>
                <p className="text-gray-600 text-xs mt-1">per barrel</p>
              </div>

              <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-5">
                <p className="text-gray-500 text-xs mb-1">USD / INR</p>
                <p className="text-xl font-bold text-blue-400">
                  ₹{summary.usdinr}
                </p>
                <p className="text-gray-600 text-xs mt-1">exchange rate</p>
              </div>
            </div>
          )}

          {/* Global Indices */}
          {indices.length > 0 && (
            <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl overflow-hidden">
              <div className="p-5 border-b border-[#1a1a2e]">
                <h2 className="text-white font-semibold">
                  📊 Global Indices
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#1a1a2e]">
                {indices.map((index, i) => (
                  <div
                    key={i}
                    className="p-5 hover:bg-[#1a1a2e] transition"
                  >
                    <p className="text-gray-500 text-xs">{index.name}</p>
                    <p className="text-white font-bold text-lg mt-1">
                      {index.price.toLocaleString()}
                    </p>
                    <p className={`text-sm font-semibold mt-1 ${
                      index.change >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}>
                      {index.change >= 0 ? "▲" : "▼"}{" "}
                      {Math.abs(index.change)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Gainers & Losers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Gainers */}
            <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl overflow-hidden">
              <div className="p-5 border-b border-[#1a1a2e] flex items-center gap-2">
                <span className="text-green-400 text-lg">▲</span>
                <h2 className="text-white font-semibold">Top Gainers</h2>
              </div>

              <div className="divide-y divide-[#1a1a2e]">
                {movers.gainers?.map((stock: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center px-5 py-3 hover:bg-[#1a1a2e] transition cursor-pointer"
                    onClick={() => router.push("/charts")}
                  >
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {stock.ticker}
                      </p>
                      <p className="text-gray-500 text-xs truncate max-w-32">
                        {stock.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-300 text-sm">
                        ${stock.price}
                      </p>
                      <p className="text-green-400 font-semibold text-sm">
                        +{stock.change}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Losers */}
            <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl overflow-hidden">
              <div className="p-5 border-b border-[#1a1a2e] flex items-center gap-2">
                <span className="text-red-400 text-lg">▼</span>
                <h2 className="text-white font-semibold">Top Losers</h2>
              </div>

              <div className="divide-y divide-[#1a1a2e]">
                {movers.losers?.map((stock: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center px-5 py-3 hover:bg-[#1a1a2e] transition cursor-pointer"
                    onClick={() => router.push("/charts")}
                  >
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {stock.ticker}
                      </p>
                      <p className="text-gray-500 text-xs truncate max-w-32">
                        {stock.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-300 text-sm">
                        ${stock.price}
                      </p>
                      <p className="text-red-400 font-semibold text-sm">
                        {stock.change}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
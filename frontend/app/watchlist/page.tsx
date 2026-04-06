"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WatchlistPage() {
  const router = useRouter();
  const [stocks, setStocks] = useState<any[]>([]);
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const getToken = () => localStorage.getItem("token") || "";

  const fetchWatchlist = async () => {
    setFetching(true);
    try {
      const res = await fetch("http://localhost:8000/watchlist/all", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setStocks(data);
    } catch (err) {
      console.error(err);
    }
    setFetching(false);
  };

  const addToWatchlist = async () => {
    if (!ticker) return;
    setLoading(true);
    try {
      await fetch("http://localhost:8000/watchlist/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ ticker: ticker.toUpperCase() }),
      });
      setTicker("");
      fetchWatchlist();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const removeFromWatchlist = async (ticker: string) => {
    try {
      await fetch(`http://localhost:8000/watchlist/remove/${ticker}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      fetchWatchlist();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetchWatchlist();
    const interval = setInterval(fetchWatchlist, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
    return `$${(cap / 1e6).toFixed(1)}M`;
  };

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-white">👁️ Watchlist</h1>
        <p className="text-gray-500 text-sm mt-1">
          Monitor your favourite stocks in real time
        </p>
      </div>

      {/* Add Stock */}
      <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-5">
        <p className="text-white font-semibold mb-4">Add to Watchlist</p>
        <div className="flex gap-3">
          <input
            className="bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-500 p-3 rounded-lg w-48 focus:outline-none focus:border-blue-500"
            placeholder="Ticker (AAPL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && addToWatchlist()}
          />
          <button
            onClick={addToWatchlist}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-semibold text-sm"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[#1a1a2e] flex justify-between items-center">
          <p className="text-white font-semibold">
            Watching {stocks.length} stocks
          </p>
          {fetching && (
            <p className="text-gray-600 text-xs">Refreshing...</p>
          )}
        </div>

        {stocks.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">👁️</p>
            <p className="text-gray-500">Your watchlist is empty</p>
            <p className="text-gray-600 text-sm mt-1">
              Add stocks above to start monitoring
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-6 px-5 py-3 text-xs text-gray-500 uppercase tracking-wider border-b border-[#1a1a2e]">
              <span className="col-span-2">Stock</span>
              <span className="text-right">Price</span>
              <span className="text-right">1D Change</span>
              <span className="text-right">Market Cap</span>
              <span className="text-right">Action</span>
            </div>

            <div className="divide-y divide-[#1a1a2e]">
              {stocks.map((stock, index) => (
                <div
                  key={index}
                  className="grid grid-cols-6 px-5 py-4 hover:bg-[#1a1a2e] transition items-center"
                >
                  <div className="col-span-2">
                    <p className="text-white font-semibold">{stock.ticker}</p>
                    <p className="text-gray-500 text-xs truncate">{stock.name}</p>
                  </div>

                  <p className="text-gray-300 text-right font-semibold">
                    ${stock.price}
                  </p>

                  <p className={`text-right font-semibold ${
                    stock.change_1d >= 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    {stock.change_1d >= 0 ? "+" : ""}{stock.change_1d}%
                  </p>

                  <p className="text-gray-400 text-right text-sm">
                    {formatMarketCap(stock.market_cap)}
                  </p>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => router.push("/analysis")}
                      className="text-xs text-blue-400 hover:text-blue-300 bg-blue-600 bg-opacity-10 px-2 py-1 rounded transition"
                    >
                      Analyze
                    </button>
                    <button
                      onClick={() => removeFromWatchlist(stock.ticker)}
                      className="text-xs text-red-400 hover:text-red-300 bg-red-600 bg-opacity-10 px-2 py-1 rounded transition"
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
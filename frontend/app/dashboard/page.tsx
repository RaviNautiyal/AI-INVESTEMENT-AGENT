"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "../../components/SearchBar";
import StockChart from "../../components/StockChart";

const featuredTickers = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "AMZN"];

export default function Dashboard() {
  const router = useRouter();
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, []);

  const fetchStock = async (t?: string) => {
    const symbol = t || ticker;
    if (!symbol) return;
    setLoading(true);
    setTicker(symbol);
    try {
      const res = await fetch(`http://localhost:8000/stock/${symbol}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-white">Market Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time market data powered by AI</p>
      </div>

      {/* Search */}
      <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-5">
        <p className="text-gray-400 text-sm mb-3">Search any stock</p>
        <div className="flex gap-3">
          <SearchBar onSelect={(t: string) => setTicker(t)} />
          <button
            onClick={() => fetchStock()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-semibold text-sm"
          >
            {loading ? "Loading..." : "Analyze"}
          </button>
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          {featuredTickers.map((t) => (
            <button
              key={t}
              onClick={() => fetchStock(t)}
              className="px-3 py-1 bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-blue-600 rounded-lg text-xs transition"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "AI Engine", value: "Gemini 2.0", icon: "🤖" },
          { label: "Algorithms", value: "6 Active", icon: "⚙️" },
          { label: "Data Feed", value: "Live", icon: "📡" },
          { label: "Markets", value: "Global", icon: "🌍" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-4">
            <p className="text-2xl">{stat.icon}</p>
            <p className="text-white font-bold mt-2">{stat.value}</p>
            <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {data && (
        <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">{data.ticker}</h2>
              <p className="text-gray-500 text-sm">
                Latest: ${data.close_prices[data.close_prices.length - 1]?.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/analysis")}
                className="bg-blue-600 bg-opacity-20 text-blue-400 px-3 py-1.5 rounded-lg text-xs hover:bg-opacity-40 transition"
              >
                Deep Analysis →
              </button>
              <button
                onClick={() => router.push("/news")}
                className="bg-green-600 bg-opacity-20 text-green-400 px-3 py-1.5 rounded-lg text-xs hover:bg-opacity-40 transition"
              >
                News →
              </button>
            </div>
          </div>
          <StockChart data={data} />
        </div>
      )}

      {/* Feature Grid */}
      {!data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "💼", title: "Portfolio", desc: "Live P&L tracking", link: "/portfolio" },
            { icon: "🤖", title: "AI Advisor", desc: "Gemini AI insights", link: "/ai" },
            { icon: "📰", title: "News", desc: "AI news analysis", link: "/news" },
            { icon: "📊", title: "Analysis", desc: "Technical indicators", link: "/analysis" },
            { icon: "⚙️", title: "Optimizer", desc: "Knapsack allocation", link: "/optimize" },
            { icon: "🔍", title: "Screener", desc: "Filter stocks", link: "/screener" },
          ].map((f, i) => (
            <div
              key={i}
              onClick={() => router.push(f.link)}
              className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-5 cursor-pointer hover:border-blue-600 transition-all group"
            >
              <p className="text-3xl">{f.icon}</p>
              <h3 className="text-white font-semibold mt-3 group-hover:text-blue-400 transition">{f.title}</h3>
              <p className="text-gray-500 text-sm mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
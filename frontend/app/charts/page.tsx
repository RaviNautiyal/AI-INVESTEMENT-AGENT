"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdvancedChart from "../../components/AdvancedChart";

const periods = [
  { label: "1M", value: "1mo" },
  { label: "3M", value: "3mo" },
  { label: "6M", value: "6mo" },
  { label: "1Y", value: "1y" },
  { label: "2Y", value: "2y" },
];

export default function ChartsPage() {
  const router = useRouter();
  const [ticker, setTicker] = useState("");
  const [period, setPeriod] = useState("3mo");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, []);

  const fetchChart = async (t?: string, p?: string) => {
    const symbol = t || ticker;
    const per = p || period;
    if (!symbol) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `http://localhost:8000/analysis/candles/${symbol.toUpperCase()}?period=${per}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      if (!res.ok) {
        setError("Stock not found");
        setLoading(false);
        return;
      }

      const result = await res.json();
      setData(result);

    } catch {
      setError("Something went wrong");
    }

    setLoading(false);
  };

  const changePeriod = (p: string) => {
    setPeriod(p);
    if (ticker) fetchChart(ticker, p);
  };

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-white">📉 Advanced Charts</h1>
        <p className="text-gray-500 text-sm mt-1">
          Candlestick charts with RSI, MACD and Volume
        </p>
      </div>

      {/* Search + Period */}
      <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-5">
        <div className="flex gap-3 flex-wrap">
          <input
            className="bg-[#1a1a2e] border border-[#2a2a3e] text-white placeholder-gray-500 p-3 rounded-lg w-48 focus:outline-none focus:border-blue-500"
            placeholder="Enter Ticker (AAPL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && fetchChart()}
          />
          <button
            onClick={() => fetchChart()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-semibold text-sm"
          >
            {loading ? "Loading..." : "Load Chart"}
          </button>

          {/* Period selector */}
          {data && (
            <div className="flex gap-2 ml-auto">
              {periods.map((p) => (
                <button
                  key={p.value}
                  onClick={() => changePeriod(p.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    period === p.value
                      ? "bg-blue-600 text-white"
                      : "bg-[#1a1a2e] text-gray-400 hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick picks */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTicker(t);
                fetchChart(t);
              }}
              className="px-3 py-1 bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-blue-600 rounded-lg text-xs transition"
            >
              {t}
            </button>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {/* Chart */}
      {data && (
        <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">{data.ticker}</h2>
              <p className="text-gray-500 text-sm">
                Current Price:{" "}
                <span className="text-white font-semibold">
                  ${data.current_price}
                </span>
              </p>
            </div>
          </div>

          <AdvancedChart data={data} />
        </div>
      )}

      {!data && !loading && (
        <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">📉</p>
          <p className="text-gray-500">Enter a ticker to load advanced charts</p>
          <p className="text-gray-600 text-sm mt-1">
            Powered by TradingView Lightweight Charts
          </p>
        </div>
      )}

    </div>
  );
}
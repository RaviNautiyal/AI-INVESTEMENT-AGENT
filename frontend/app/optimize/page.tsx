"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#d97706", "#7c3aed", "#0891b2"];

export default function OptimizePage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [riskTolerance, setRiskTolerance] = useState("medium");

  const getToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, []);

  const optimizePortfolio = async () => {
    setLoading(true);
    setData(null);

    try {
      const res = await fetch(
        `http://localhost:8000/analysis/portfolio-optimize?risk_tolerance=${riskTolerance}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      const result = await res.json();
      setData(result);

    } catch (err) {
      console.error("Error optimizing portfolio:", err);
    }

    setLoading(false);
  };

  const pieData = data?.optimized_allocation?.map((stock: any) => ({
    name: stock.ticker,
    value: stock.allocation,
  })) || [];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-4">

        {/* Header */}
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h1 className="text-2xl font-bold text-gray-800">
            ⚙️ Portfolio Optimizer
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Optimize your portfolio allocation using Knapsack algorithm
          </p>

          {/* Risk Tolerance */}
          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Select Risk Tolerance
            </p>
            <div className="flex gap-3">
              {["low", "medium", "high"].map((level) => (
                <button
                  key={level}
                  onClick={() => setRiskTolerance(level)}
                  className={`px-5 py-2 rounded-lg capitalize font-semibold text-sm transition ${
                    riskTolerance === level
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={optimizePortfolio}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-semibold"
          >
            {loading ? "Optimizing..." : "Optimize My Portfolio"}
          </button>
        </div>

        {/* Results */}
        {data && (
          <>
            {/* Summary */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                Optimization Result
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Algorithm: {data.algorithm}
              </p>
              <p className="text-sm text-gray-600">
                Total Budget:{" "}
                <span className="font-bold text-blue-600">
                  ₹{data.total_budget?.toLocaleString()}
                </span>
              </p>
            </div>

            {/* Pie Chart */}
            {pieData.length > 0 && (
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Suggested Allocation
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((_: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) =>
                        `₹${value.toLocaleString()}`
                      }
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Allocation Table */}
            {data.optimized_allocation?.length > 0 && (
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Detailed Breakdown
                </h2>
                <div className="space-y-3">
                  {data.optimized_allocation.map((stock: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center border rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {stock.ticker}
                          </p>
                          <p className="text-xs text-gray-500">
                            Risk: {(stock.risk * 100).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">
                          ₹{stock.allocation.toLocaleString()}
                        </p>
                        <p className={`text-xs font-semibold ${
                          stock.expected_return >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}>
                          Expected: {(stock.expected_return * 100).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No stocks message */}
            {data.optimized_allocation?.length === 0 && (
              <div className="bg-white shadow-lg rounded-xl p-6 text-center">
                <p className="text-gray-500">
                  No stocks could be optimized. Try adding more stocks to your portfolio first.
                </p>
              </div>
            )}

            {/* Algorithm explanation */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">
                🧠 How This Works
              </h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ Fetches your portfolio stocks from database</li>
                <li>✅ Calculates expected return and risk for each stock</li>
                <li>✅ Filters stocks based on your risk tolerance</li>
                <li>✅ Uses Greedy Knapsack algorithm to maximize returns</li>
                <li>✅ Suggests optimal budget allocation per stock</li>
              </ul>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
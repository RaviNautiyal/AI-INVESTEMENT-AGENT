"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewsPage() {
  const router = useRouter();
  const [ticker, setTicker] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [articles, setArticles] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, []);

  const analyzeNews = async () => {
    if (!ticker) return;
    setLoading(true);
    setArticles([]);
    setAnalysis("");

    try {
      const res = await fetch("http://localhost:8000/news/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ticker: ticker.toUpperCase(),
          company_name: companyName,
        }),
      });

      const data = await res.json();
      setArticles(data.articles || []);
      setAnalysis(data.analysis || "");

    } catch (err) {
      console.error("Error fetching news:", err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white shadow-lg rounded-xl p-6">
          <h1 className="text-2xl font-bold text-gray-800">📰 AI News Analyzer</h1>
          <p className="text-gray-500 text-sm mt-1">
            Get AI-powered analysis of latest stock news
          </p>

          <div className="flex gap-3 mt-6">
            <input
              className="border p-3 rounded-lg w-36 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ticker (AAPL)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
            />
            <input
              className="border p-3 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Company Name (Apple)"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <button
              onClick={analyzeNews}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </div>

        {/* AI Analysis */}
        {analysis && (
          <div className="bg-white shadow-lg rounded-xl p-6 mt-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">🤖 AI Analysis</h2>
            <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
              {analysis}
            </p>
          </div>
        )}

        {/* News Articles */}
        {articles.length > 0 && (
          <div className="bg-white shadow-lg rounded-xl p-6 mt-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              📄 Latest News ({articles.length} articles)
            </h2>
            <div className="space-y-4">
              {articles.map((article, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-semibold text-sm">
                  
                    {article.title}
                  </a>
                  {article.description && (
                    <p className="text-gray-500 text-sm mt-1">{article.description}</p>
                  )}
                  <div className="flex gap-4 mt-2">
                    <p className="text-xs text-gray-400">{article.source}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
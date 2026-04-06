"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.email);
      router.push("/dashboard");

    } catch {
      setError("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">

      {/* Left Side — Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#0d0d14] border-r border-[#1a1a2e] flex-col justify-between p-12">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm text-white">
            Q
          </div>
          <span className="text-white font-bold text-lg">QuantAI</span>
        </div>

        {/* Center content */}
        <div>
          <div className="w-16 h-16 bg-blue-600 bg-opacity-20 rounded-2xl flex items-center justify-center text-4xl mb-6">
            📈
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            Make smarter<br />investment decisions
          </h2>
          <p className="text-gray-500 mt-4 leading-relaxed">
            AI-powered portfolio analysis, real-time market data,
            and advanced algorithms — all in one platform.
          </p>

          {/* Feature list */}
          <div className="mt-8 space-y-3">
            {[
              "AI Investment Advisor powered by Gemini",
              "Live portfolio P&L tracking",
              "Technical analysis with 6 algorithms",
              "Financial news analysis",
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-600 bg-opacity-30 rounded-full flex items-center justify-center">
                  <span className="text-blue-400 text-xs">✓</span>
                </div>
                <p className="text-gray-400 text-sm">{f}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="text-gray-600 text-sm">© 2025 QuantAI. Built for serious investors.</p>
      </div>

      {/* Right Side — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm text-white">
              Q
            </div>
            <span className="text-white font-bold text-lg">QuantAI</span>
          </div>

          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">
            Login to your account to continue
          </p>

          <div className="mt-8 space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0d0d14] border border-[#2a2a3e] text-white placeholder-gray-600 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-[#0d0d14] border border-[#2a2a3e] text-white placeholder-gray-600 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {error && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 text-red-400 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition font-semibold text-sm mt-2"
            >
              {loading ? "Logging in..." : "Login to Dashboard"}
            </button>
          </div>

          <p className="text-center text-gray-600 text-sm mt-6">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-400 hover:text-blue-300 transition">
              Create one free
            </a>
          </p>

          <p className="text-center text-gray-700 text-xs mt-8">
            By continuing you agree to our Terms of Service
          </p>

        </div>
      </div>

    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) return;

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Signup failed");
        setLoading(false);
        return;
      }

      router.push("/login");

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

        {/* Center */}
        <div>
          <div className="w-16 h-16 bg-blue-600 bg-opacity-20 rounded-2xl flex items-center justify-center text-4xl mb-6">
            🚀
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            Start investing<br />smarter today
          </h2>
          <p className="text-gray-500 mt-4 leading-relaxed">
            Join thousands of investors using AI to analyze markets,
            track portfolios and make data-driven decisions.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            {[
              { value: "Free", label: "To get started" },
              { value: "AI", label: "Powered analysis" },
              { value: "Live", label: "Market data" },
              { value: "6+", label: "Algorithms" },
            ].map((s, i) => (
              <div key={i} className="bg-[#0a0a0f] rounded-xl p-4 border border-[#2a2a3e]">
                <p className="text-blue-400 font-bold text-xl">{s.value}</p>
                <p className="text-gray-600 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-600 text-sm">© 2025 QuantAI. Built for serious investors.</p>
      </div>

      {/* Right Side — Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm text-white">
              Q
            </div>
            <span className="text-white font-bold text-lg">QuantAI</span>
          </div>

          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">
            Start for free — no credit card required
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
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0d0d14] border border-[#2a2a3e] text-white placeholder-gray-600 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                className="w-full bg-[#0d0d14] border border-[#2a2a3e] text-white placeholder-gray-600 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {error && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 text-red-400 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleSignup}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition font-semibold text-sm mt-2"
            >
              {loading ? "Creating account..." : "Create Free Account"}
            </button>
          </div>

          <p className="text-center text-gray-600 text-sm mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-blue-400 hover:text-blue-300 transition">
              Login here
            </a>
          </p>

          <p className="text-center text-gray-700 text-xs mt-8">
            By signing up you agree to our Terms of Service
          </p>

        </div>
      </div>

    </div>
  );
}
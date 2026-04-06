"use client";

import { useRouter } from "next/navigation";

const features = [
  {
    icon: "🤖",
    title: "AI Investment Advisor",
    desc: "Get personalized investment insights powered by Google Gemini AI. Ask anything about stocks, portfolios, and market trends.",
  },
  {
    icon: "📊",
    title: "Technical Analysis",
    desc: "Advanced algorithms including SMA, EMA, Sharpe Ratio, Segment Tree queries and volatility calculations.",
  },
  {
    icon: "💼",
    title: "Portfolio Tracker",
    desc: "Track your investments with live P&L calculation. Real-time prices with automatic USD to INR conversion.",
  },
  {
    icon: "📰",
    title: "AI News Analysis",
    desc: "Get AI-summarized financial news for any stock. Understand market sentiment instantly.",
  },
  {
    icon: "⚙️",
    title: "Portfolio Optimizer",
    desc: "Knapsack algorithm based portfolio optimization. Maximize returns based on your risk tolerance.",
  },
  {
    icon: "🔍",
    title: "Stock Screener",
    desc: "Filter and discover stocks based on technical and fundamental criteria across global markets.",
  },
];

const stats = [
  { value: "6+", label: "DSA Algorithms" },
  { value: "AI", label: "Gemini Powered" },
  { value: "Live", label: "Market Data" },
  { value: "Global", label: "Market Coverage" },
];

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: [
      "5 AI queries per day",
      "Basic portfolio tracking",
      "Stock charts",
      "News analysis",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "per month",
    features: [
      "Unlimited AI queries",
      "Advanced technical analysis",
      "Portfolio optimizer",
      "Real-time alerts",
      "Priority support",
    ],
    cta: "Start Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    features: [
      "Everything in Pro",
      "Custom AI models",
      "API access",
      "Dedicated support",
      "Team accounts",
    ],
    cta: "Contact Us",
    highlighted: false,
  },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-[#1a1a2e] sticky top-0 bg-[#0a0a0f] bg-opacity-90 backdrop-blur z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
            Q
          </div>
          <span className="font-bold text-lg">QuantAI</span>
        </div>

        <div className="hidden md:flex gap-8 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-gray-400 hover:text-white px-4 py-2 transition"
          >
            Login
          </button>
          <button
            onClick={() => router.push("/signup")}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-8 py-24 text-center overflow-hidden">

        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600 opacity-10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-600 bg-opacity-20 border border-blue-600 border-opacity-30 text-blue-400 text-xs px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Powered by Google Gemini AI
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            The AI Platform for
            <span className="text-blue-400"> Smarter </span>
            Investing
          </h1>

          <p className="text-gray-400 text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
            Analyze stocks, track your portfolio, and get AI-powered investment insights.
            Built with advanced algorithms and real-time market data.
          </p>

          <div className="flex gap-4 justify-center mt-8 flex-wrap">
            <button
              onClick={() => router.push("/signup")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition text-sm"
            >
              Start for Free →
            </button>
            <button
              onClick={() => router.push("/login")}
              className="bg-[#1a1a2e] hover:bg-[#2a2a3e] text-gray-300 px-8 py-4 rounded-xl font-semibold transition text-sm border border-[#2a2a3e]"
            >
              Login to Dashboard
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {stats.map((stat, i) => (
              <div key={i} className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-4">
                <p className="text-2xl font-bold text-blue-400">{stat.value}</p>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-8 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Everything You Need to Invest Smarter</h2>
          <p className="text-gray-500 mt-3">
            Professional-grade tools powered by AI and advanced algorithms
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-6 hover:border-blue-600 hover:border-opacity-50 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-600 bg-opacity-20 rounded-xl flex items-center justify-center text-2xl mb-4">
                {f.icon}
              </div>
              <h3 className="text-white font-semibold text-lg group-hover:text-blue-400 transition">
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="px-8 py-20 bg-[#0d0d14] border-y border-[#1a1a2e]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-gray-500 mt-3">Get started in minutes</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up for free and set up your investor profile in seconds.",
              },
              {
                step: "02",
                title: "Add Your Portfolio",
                desc: "Add your stock holdings and let us track live P&L automatically.",
              },
              {
                step: "03",
                title: "Get AI Insights",
                desc: "Ask our AI advisor anything and get personalized investment recommendations.",
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="w-12 h-12 bg-blue-600 bg-opacity-20 border border-blue-600 border-opacity-30 rounded-xl flex items-center justify-center text-blue-400 font-bold mx-auto">
                  {step.step}
                </div>
                <h3 className="text-white font-semibold mt-4">{step.title}</h3>
                <p className="text-gray-500 text-sm mt-2">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-8 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Simple Pricing</h2>
          <p className="text-gray-500 mt-3">Start free, upgrade when you need more</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-xl p-6 border ${
                plan.highlighted
                  ? "bg-blue-600 border-blue-500"
                  : "bg-[#0d0d14] border-[#1a1a2e]"
              }`}
            >
              <p className={`font-semibold ${plan.highlighted ? "text-blue-100" : "text-gray-400"}`}>
                {plan.name}
              </p>
              <p className="text-3xl font-bold text-white mt-2">{plan.price}</p>
              <p className={`text-sm mt-1 ${plan.highlighted ? "text-blue-200" : "text-gray-500"}`}>
                {plan.period}
              </p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, j) => (
                  <li
                    key={j}
                    className={`text-sm flex items-center gap-2 ${
                      plan.highlighted ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    <span className={plan.highlighted ? "text-white" : "text-blue-400"}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => router.push("/signup")}
                className={`w-full mt-8 py-3 rounded-lg font-semibold text-sm transition ${
                  plan.highlighted
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-[#1a1a2e] text-white hover:bg-[#2a2a3e] border border-[#2a2a3e]"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 py-20 text-center">
        <div className="max-w-2xl mx-auto bg-[#0d0d14] border border-[#1a1a2e] rounded-2xl p-12 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600 opacity-10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold">Ready to Invest Smarter?</h2>
            <p className="text-gray-500 mt-3">
              Join thousands of investors using AI to make better decisions.
            </p>
            <button
              onClick={() => router.push("/signup")}
              className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition text-sm"
            >
              Get Started for Free →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a2e] px-8 py-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center font-bold text-xs">
            Q
          </div>
          <span className="font-bold text-sm">QuantAI</span>
        </div>
        <p className="text-gray-600 text-sm">
          © 2025 QuantAI. Built for serious investors.
        </p>
      </footer>

    </div>
  );
}
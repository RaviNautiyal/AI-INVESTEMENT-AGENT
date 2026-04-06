"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AIChat from "../../components/AIChat";

export default function AIPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">

        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">🤖 AI Investment Advisor</h1>
          <p className="text-gray-500 text-sm mt-1">
            Powered by Gemini AI — Ask anything about stocks and investments
          </p>
        </div>

        <AIChat />

      </div>
    </div>
  );
}
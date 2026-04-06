"use client";

import { useState } from "react";

export default function AIChat() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem("token") || "";

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.response }]);

    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong. Please try again." },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 max-h-96">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            <p className="text-4xl">🤖</p>
            <p className="mt-2">Ask me anything about stocks or your portfolio</p>
            <div className="mt-4 space-y-2">
              <p
                className="text-blue-500 cursor-pointer hover:underline text-sm"
                onClick={() => setInput("Should I invest in Apple stock?")}
              >
                "Should I invest in Apple stock?"
              </p>
              <p
                className="text-blue-500 cursor-pointer hover:underline text-sm"
                onClick={() => setInput("Analyze my portfolio")}
              >
                "Analyze my portfolio"
              </p>
              <p
                className="text-blue-500 cursor-pointer hover:underline text-sm"
                onClick={() => setInput("What are the best stocks to buy in 2025?")}
              >
                "What are the best stocks to buy in 2025?"
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl text-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.role === "ai" && (
                  <p className="text-xs text-gray-400 mb-1">🤖 AI Advisor</p>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-xl rounded-bl-none">
              <p className="text-gray-400 text-sm">AI is thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4 flex gap-3">
        <input
          className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          placeholder="Ask about stocks, portfolio, investments..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>

    </div>
  );
}
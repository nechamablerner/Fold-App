import React, { useState } from "react";
import "./Chatbot.css";

// Uses your Vite environment variable or falls back to your API URL
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://YOUR_API_GATEWAY_URL.execute-api.us-east-1.amazonaws.com";
const API_ENDPOINT = `${BASE_URL}/chat`;

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! Welcome to Fold. How can I help today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");

    // 1. Instantly display user's message in chat window
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      // 2. Send message payload to AWS Lambda via API Gateway
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      // 3. Append bot reply from Gemini AI
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply || "Sorry, I couldn't get an answer right now.",
        },
      ]);
    } catch (err) {
      console.error("Chatbot Request Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I'm having trouble connecting to the server. Please try again in a moment!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {/* Toggle Button in Bottom Right Corner */}
      <button
        className="chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Assistant Chat"
      >
        {isOpen ? "✕ Close" : "💬 Ask Fold AI"}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Fold Assistant</h3>
            <span>Kosher Sandwiches & Wraps</span>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                <div className="bubble">{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className="message bot">
                <div className="bubble loading-dots">Thinking...</div>
              </div>
            )}
          </div>

          <form className="chat-input-form" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Ask about menu, hours, or allergies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { Send, HeadphonesIcon } from "lucide-react";
import "./ChatSupport.css";

export default function ChatSupport() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "support",
      text: "Hello! Welcome to PingMe Support. How can we help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Mock Backend: Auto-reply after 1.5 seconds
    setTimeout(() => {
      const supportMsg = {
        id: (Date.now() + 1).toString(),
        sender: "support",
        text: "Thanks for reaching out! A support agent will review your message shortly. This is an automated response.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, supportMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div style={{ padding: '24px 16px 20px 16px' }}>
      <div className="chat-support-container">
        {/* Header */}
        <div className="chat-header">
          <div style={{ padding: 8, background: 'rgba(164, 38, 44, 0.1)', borderRadius: '50%' }}>
            <HeadphonesIcon size={24} color="var(--color-primary)" />
          </div>
          <div>
            <h2 className="chat-header-title">Support Help Desk</h2>
            <p className="chat-header-sub">We usually reply instantly.</p>
          </div>
        </div>

        {/* Message Area */}
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
              <div className="chat-bubble">
                {msg.text}
              </div>
              <p className="chat-timestamp">{msg.time}</p>
            </div>
          ))}

          {isTyping && (
            <div className="chat-bubble-wrapper support">
              <div className="chat-bubble" style={{ fontStyle: 'italic', opacity: 0.7 }}>
                Support is typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          <form className="chat-form" onSubmit={handleSend}>
            <textarea
              className="chat-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!inputText.trim() || isTyping}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

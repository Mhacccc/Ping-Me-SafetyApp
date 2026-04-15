import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MoreVertical, MessageCircle, Send } from "lucide-react";
import "./MyBraceletMessage.css";

const DEFAULT_MESSAGE = "Hi! I'm currently in Manila. I'm safe, no need to worry!";

export default function MyBraceletMessage() {
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const [currentMessage, setCurrentMessage] = useState(DEFAULT_MESSAGE);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = async () => {
    if (!newMessage.trim()) return;
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setCurrentMessage(newMessage.trim());
    setNewMessage("");
    setIsSaving(false);
  };

  return (
    <div className="br-page bmc-page" onClick={() => setIsMenuOpen(false)}>

      {/* ── Standard Feature Navbar ── */}
      <header className="br-navbar">
        <button
          className="br-nav-back"
          onClick={(e) => { e.stopPropagation(); navigate("/app/my-bracelet"); }}
          id="bmc-back-btn"
        >
          <ChevronLeft size={24} color="#444" />
        </button>

        <h1 className="br-nav-title">Chat customization</h1>

        {/* Three-dot menu replaces the spacer */}
        <div className="bmc-menu-wrap" onClick={(e) => e.stopPropagation()}>
          <button
            className="bmc-three-dot-btn"
            onClick={() => setIsMenuOpen((p) => !p)}
            id="bmc-menu-btn"
          >
            <MoreVertical size={22} color="#444" />
          </button>

          {isMenuOpen && (
            <div className="bmc-context-menu" id="bmc-context-menu">
              <button
                className="bmc-context-item"
                onClick={() => { setCurrentMessage(DEFAULT_MESSAGE); setIsMenuOpen(false); }}
              >
                Reset to default
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="br-main bmc-main">

        {/* Transparent Intro – sits directly on page background */}
        <div className="bmc-intro">
          <h2 className="bmc-heading">Customize Your Emergency Message</h2>
          <p className="bmc-subtext">
            You can personalize the message sent during an emergency to make it
            more comforting and clear. Your words can bring peace of mind in
            moments that matter.
          </p>
        </div>

        {/* Current Message */}
        <div className="bmc-section">
          <span className="bmc-section-label">Current Message</span>
          <div className="bmc-chat-row">
            <div className="bmc-avatar">
              <MessageCircle size={18} color="#a4262c" strokeWidth={2} />
            </div>
            <div className="bmc-bubble">
              <p className="bmc-bubble-text">{currentMessage}</p>
            </div>
          </div>
        </div>

        {/* New Message Input */}
        <div className="bmc-section">
          <span className="bmc-section-label">New Message</span>
          <div className="bmc-textarea-border">
            <textarea
              id="bmc-new-message-input"
              className="bmc-textarea"
              placeholder="Type here your new message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </main>

      {/* ── Footer Action ── */}
      <footer className="br-footer bmc-footer">
        <button
          id="bmc-edit-btn"
          className={`bmc-edit-btn ${!newMessage.trim() ? "bmc-edit-btn--disabled" : ""}`}
          onClick={handleEdit}
          disabled={!newMessage.trim() || isSaving}
        >
          <Send size={15} strokeWidth={2.5} />
          {isSaving ? "Saving…" : "Edit"}
        </button>
      </footer>
    </div>
  );
}

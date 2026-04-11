import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { User, ShieldCheck, ChevronRight, ChevronLeft } from "lucide-react";
import "../../styles/MenuLayout.css";
import "./AccountMenu.css";

export default function AccountMenu() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const displayName = currentUser?.displayName || "User";
  const email = currentUser?.email || "";
  const avatarUrl = currentUser?.photoURL || null;

  return (
    <div className="br-page">
      <header className="br-navbar">
        <button className="br-nav-back" onClick={() => navigate("/app", { state: { openProfile: true } })}>
          <ChevronLeft size={24} color="#444" />
        </button>
        <h1 className="br-nav-title">Account</h1>
        <div className="br-nav-spacer" />
      </header>

      <main className="br-main acm-main">
        {/* ── Profile Hero ── */}
        <div className="acm-identity">
          <div className="acm-avatar-wrap">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="acm-avatar"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="acm-avatar"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(164,38,44,0.15), rgba(164,38,44,0.05))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "3px solid #fff",
                }}
              >
                <User size={36} color="#a4262c" strokeWidth={1.5} />
              </div>
            )}
          </div>

          <div className="acm-identity-text">
            <p className="acm-identity-name">{displayName}</p>
            <p className="acm-identity-email">{email}</p>
          </div>
        </div>

        {/* ── Section Label ── */}
        <p className="acm-section-label">Settings</p>

        {/* ── Menu List ── */}
        <div className="acm-menu">
          {/* Account Information */}
          <button
            className="acm-menu-item"
            onClick={() => navigate("/app/account/info")}
            id="account-info-btn"
          >
            <span className="acm-menu-icon-wrap acm-icon-info">
              <User size={18} strokeWidth={2} />
            </span>
            <span className="acm-menu-text">
              <span className="acm-menu-label">Account Information</span>
              <span className="acm-menu-desc">
                Name, email, and profile details
              </span>
            </span>
            <ChevronRight size={18} className="acm-menu-arrow" />
          </button>

          {/* Security & Password */}
          <button
            className="acm-menu-item"
            onClick={() => navigate("/app/account/security")}
            id="account-security-btn"
          >
            <span className="acm-menu-icon-wrap acm-icon-security">
              <ShieldCheck size={18} strokeWidth={2} />
            </span>
            <span className="acm-menu-text">
              <span className="acm-menu-label">Security &amp; Password</span>
              <span className="acm-menu-desc">
                Password, verification, and linked accounts
              </span>
            </span>
            <ChevronRight size={18} className="acm-menu-arrow" />
          </button>
        </div>
      </main>
    </div>
  );
}

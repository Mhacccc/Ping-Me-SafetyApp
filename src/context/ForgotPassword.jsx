import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Mail, ChevronLeft } from "lucide-react";
import { getAuthErrorMessage } from "../utils/authErrors";

import logo from "../assets/logo.png";
import Input from "../ui/Input";

import "../styles/auth.css";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      await resetPassword(email);
      setMessage("Check your email (and spam folder) for further instructions.");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="authPage">
      <main className="authMain">
        <div className="authCard">
          <div className="authLeft">
            <div className="authLogoContainer">
              <Link to="/">
                <img src={logo} alt="PingMe Logo" className="authLogo" />
              </Link>
            </div>

            <div className="authHeader">
              <h1>Password Reset</h1>
              <p>Enter your email and we'll send you a link to reset your password.</p>
            </div>
          </div>

          <div className="authRight">
            <form className="authForm" onSubmit={onSubmit}>
              <Input
                label="Email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                leftSlot={<Mail size={18} />}
              />

              {error && (
                <div 
                  className="authError" 
                  style={{ 
                    textAlign: 'center', 
                    color: '#fff', 
                    background: 'rgba(231, 76, 60, 0.8)', 
                    padding: '8px', 
                    borderRadius: '8px', 
                    fontSize: '12px' 
                  }}
                >
                  {error}
                </div>
              )}

              {message && (
                <div 
                  className="authSuccess" 
                  style={{ 
                    textAlign: 'center', 
                    color: '#fff', 
                    background: 'rgba(46, 204, 113, 0.8)', 
                    padding: '8px', 
                    borderRadius: '8px', 
                    fontSize: '12px' 
                  }}
                >
                  {message}
                </div>
              )}

              <div className="authBtnContainer">
                <button className="authBtnMaroon" type="submit" disabled={submitting}>
                  {submitting ? "Sending..." : "Reset Password"}
                </button>
              </div>

              <div className="authFooter">
                <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <ChevronLeft size={16} /> Back to Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

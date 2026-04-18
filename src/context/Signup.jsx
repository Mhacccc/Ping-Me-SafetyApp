import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Mail, Lock, Eye, EyeOff, User, Check, X } from "lucide-react";
import { getAuthErrorMessage } from "../utils/authErrors";
import {
  checkPasswordRules,
  getPasswordStrengthScore,
  getStrengthMeta,
  isPasswordValid,
} from "../utils/passwordValidation";

import logo from "../assets/logo.png";
import Input from "../ui/Input";

import "../styles/auth.css";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, signInWithGoogle } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Track whether the user has focused the password fields
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  /* ── Derived password state ────────────────────────────────────── */
  const rules = checkPasswordRules(password);
  const score = getPasswordStrengthScore(password);
  const { label: strengthLabel, level: strengthLevel } = getStrengthMeta(score);

  /* ── Handlers ──────────────────────────────────────────────────── */
  const handleSignup = async (e) => {
    e.preventDefault();
    setFormError("");

    // 1. Strong-password gate
    if (!isPasswordValid(password)) {
      setFormError("Please create a stronger password meeting all the requirements below.");
      return;
    }

    // 2. Confirm-password match
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await signup(email, password, fullName);
      navigate("/app", { replace: true });
    } catch (err) {
      setFormError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setFormError("");
    setSubmitting(true);

    try {
      await signInWithGoogle();
      navigate("/app", { replace: true });
    } catch (err) {
      setFormError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Render ────────────────────────────────────────────────────── */
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
              <h1>Join PingMe's trusted Network</h1>
              <p>Sign up to start tracking and requesting help when it's needed the most.</p>
            </div>
          </div>

          <div className="authRight">
            <form className="authForm" onSubmit={handleSignup}>
              <Input
                label="Full Name"
                type="text"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                leftSlot={<User size={18} />}
              />

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

              {/* ── Password field + strength indicator ── */}
              <Input
                label="Password"
                type={showPw ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                autoComplete="new-password"
                required
                leftSlot={<Lock size={18} />}
                rightSlot={
                  <button
                    type="button"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff size={18} color="#888" /> : <Eye size={18} color="#888" />}
                  </button>
                }
              />

              {/* Strength indicator — block always exists if typing started, checklist hides on blur */}
              {password.length > 0 && (
                <div className="pwStrengthBlock" aria-live="polite">
                  {/* Label only — always visible */}
                  {strengthLabel && (
                    <span className={`pwStrengthLabel pwStrengthLabel--${strengthLevel}`}>
                      {strengthLabel}
                    </span>
                  )}

                  {/* Per-rule checklist — hidden when unfocused */}
                  {passwordFocused && (
                    <ul className="pwRuleList" aria-label="Password requirements">
                      {rules.map((rule) => (
                        <li
                          key={rule.id}
                          className={`pwRuleItem ${rule.passed ? "pwRuleItem--pass" : "pwRuleItem--fail"}`}
                        >
                          {rule.passed ? (
                            <Check size={12} strokeWidth={3} className="pwRuleIcon" />
                          ) : (
                            <X size={12} strokeWidth={3} className="pwRuleIcon" />
                          )}
                          {rule.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <Input
                label="Confirm Password"
                type={showPw ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
                autoComplete="new-password"
                required
                leftSlot={<Lock size={18} />}
                rightSlot={
                  <button
                    type="button"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff size={18} color="#888" /> : <Eye size={18} color="#888" />}
                  </button>
                }
                /* Inline mismatch hint — only when both fields have text and confirm is focused */
                error={
                  confirmPasswordFocused && confirmPassword && password && confirmPassword !== password
                    ? "Passwords do not match"
                    : undefined
                }
              />

              {formError ? (
                <div
                  className="authError"
                  role="alert"
                  style={{
                    textAlign: "center",
                    color: "#fff",
                    background: "rgba(231, 76, 60, 0.8)",
                    padding: "8px",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                >
                  {formError}
                </div>
              ) : null}

              <div className="authBtnContainer">
                <button className="authBtnMaroon" type="submit" disabled={submitting}>
                  {submitting ? "Signing up..." : "Sign up"}
                </button>
              </div>

              <div className="authDivider">or</div>

              <div className="authBtnContainer" style={{ marginTop: 0 }}>
                <button
                  className="authBtnGoogle"
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={submitting}
                >
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  {submitting ? "Signing up..." : "Sign up with Google"}
                </button>
              </div>

              <div className="authFooter">
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

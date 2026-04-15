import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ChevronLeft,
  MoreVertical,
  Send,
  Lock,
  MessageCircle,
  ShieldAlert,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import {
  buildEmergencySms,
  buildSafeSms,
  buildLocationUrl,
  DEFAULT_HELP_PHRASE,
  LEVEL_LABEL,
} from "../../utils/smsTemplates";
import "./MyBraceletMessage.css";

// ── Constants ────────────────────────────────────────────────────────────────

/** Example position used purely for the preview URL in the UI. */
const PREVIEW_POSITION = [14.5995, 120.9842]; // Manila coordinates
const PREVIEW_BRACELET_ID = "PM-XXXX-XXX";

// ── Sub-components ────────────────────────────────────────────────────────────

/** A single locked field row in the "Required Details" card. */
function LockedField({ icon: Icon, label, value }) {
  return (
    <div className="bmc-locked-field">
      <span className="bmc-locked-icon">
        <Icon size={14} strokeWidth={2} />
      </span>
      <div className="bmc-locked-body">
        <span className="bmc-locked-label">{label}</span>
        <span className="bmc-locked-value">{value}</span>
      </div>
      <Lock size={12} className="bmc-lock-icon" />
    </div>
  );
}

/** Live SMS preview — splits the assembled message into readable lines. */
function SmsPreview({ message }) {
  // Split on the two sentence boundaries so each part sits on its own line
  // Pattern: "...[Level Emergency]. " / "This is Name. Phrase " / "Track me..."
  const trackIndex   = message.indexOf('Track me on the app:');
  const thisIsIndex  = message.indexOf('This is ');

  let lines = [];
  if (trackIndex > 0 && thisIsIndex > 0) {
    lines = [
      message.slice(0, thisIsIndex).trim(),
      message.slice(thisIsIndex, trackIndex).trim(),
      message.slice(trackIndex).trim(),
    ];
  } else {
    // Fallback: render as-is
    lines = [message];
  }

  return (
    <div className="bmc-preview-wrap">
      <div className="bmc-preview-header">
        <MessageCircle size={13} strokeWidth={2.5} />
        <span>SMS Preview</span>
      </div>
      <div className="bmc-preview-bubble">
        {lines.map((line, i) => (
          <p key={i} className="bmc-preview-text">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function MyBraceletMessage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const menuWrapRef = useRef(null);

  // Bracelet data
  const [serialNumber, setSerialNumber] = useState(null);
  const [isLoadingBracelet, setIsLoadingBracelet] = useState(true);

  // Active tab: "emergency" | "safe"
  const [activeTab, setActiveTab] = useState("emergency");

  // The custom middle phrase the user edits (Emergency tab only)
  const [savedPhrase, setSavedPhrase] = useState(DEFAULT_HELP_PHRASE);
  const [draftPhrase, setDraftPhrase] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Three-dot menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ── Fetch bracelet + saved phrase ────────────────────────────────────────
  useEffect(() => {
    const fetchBracelet = async () => {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, "braceletUsers"),
          where("ownerAppUserId", "==", currentUser.uid)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data();
          setSerialNumber(data.serialNumber ?? snap.docs[0].id);
          if (data.customHelpPhrase) {
            setSavedPhrase(data.customHelpPhrase);
          }
        }
      } catch (err) {
        console.error("Error fetching bracelet:", err);
      } finally {
        setIsLoadingBracelet(false);
      }
    };
    fetchBracelet();
  }, [currentUser]);

  // ── Close menu on outside click ──────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (menuWrapRef.current && !menuWrapRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Derived values ───────────────────────────────────────────────────────
  const ownerName = currentUser?.displayName || "Your Name";
  const previewUrl = buildLocationUrl(
    PREVIEW_POSITION[0], PREVIEW_POSITION[1], PREVIEW_BRACELET_ID
  );

  // Emergency: build a live preview using all three severity examples
  const previewPhraseInUse = draftPhrase.trim() || savedPhrase;
  const emergencyPreview = buildEmergencySms(
    ownerName, 3, previewUrl, previewPhraseInUse
  );
  const safePreview = buildSafeSms(ownerName);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const phrase = draftPhrase.trim();
    if (!phrase) return;
    setIsSaving(true);
    try {
      if (serialNumber) {
        const braceletRef = doc(db, "braceletUsers", serialNumber);
        await setDoc(braceletRef, { customHelpPhrase: phrase }, { merge: true });
      }
      setSavedPhrase(phrase);
      setDraftPhrase("");
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error("Error saving phrase:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSavedPhrase(DEFAULT_HELP_PHRASE);
    setDraftPhrase("");
    setIsMenuOpen(false);
    if (serialNumber) {
      const braceletRef = doc(db, "braceletUsers", serialNumber);
      setDoc(braceletRef, { customHelpPhrase: DEFAULT_HELP_PHRASE }, { merge: true }).catch(
        (err) => console.error("Error resetting phrase:", err)
      );
    }
  };

  const canSave = draftPhrase.trim().length > 0 && !isSaving;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="br-page bmc-page" onClick={() => setIsMenuOpen(false)}>

      {/* ── Navbar ── */}
      <header className="br-navbar">
        <button
          className="br-nav-back"
          onClick={(e) => { e.stopPropagation(); navigate("/app/my-bracelet"); }}
          id="bmc-back-btn"
        >
          <ChevronLeft size={24} color="#444" />
        </button>

        <h1 className="br-nav-title">Message Customization</h1>

        <div
          className="bmc-menu-wrap"
          ref={menuWrapRef}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="bmc-three-dot-btn"
            onClick={() => setIsMenuOpen((p) => !p)}
            id="bmc-menu-btn"
            aria-label="Options menu"
          >
            <MoreVertical size={22} color="#444" />
          </button>
          {isMenuOpen && (
            <div className="bmc-context-menu" id="bmc-context-menu">
              <button className="bmc-context-item" onClick={handleReset}>
                Reset to default
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="br-main bmc-main">

        {/* Subtext */}
        <p className="bmc-subtext">
          Customize the help phrase sent during an emergency. The mandatory
          fields below (name, severity level, location link) are always
          automatically included in every alert.
        </p>

        {/* ── Tab Switcher ── */}
        <div className="bmc-tab-switcher" role="tablist">
          {[
            { key: "emergency", label: "Emergency" },
            { key: "safe",      label: "I am Safe"  },
          ].map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeTab === key}
              className={`bmc-tab ${activeTab === key ? "bmc-tab--active" : ""}`}
              onClick={(e) => { e.stopPropagation(); setActiveTab(key); }}
              id={`bmc-tab-${key}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ════════════════════ EMERGENCY TAB ════════════════════ */}
        {activeTab === "emergency" && (
          <>
            {/* ── Required Details (locked) ── */}
            <div className="bmc-section">
              <div className="bmc-section-header-row">
                <span className="bmc-section-label">Required Details</span>
                <span className="bmc-locked-badge">
                  <Lock size={10} strokeWidth={3} /> Auto-injected
                </span>
              </div>

              <div className="bmc-locked-card">
                <div className="bmc-locked-card-note">
                  The fields below are automatically included in
                  every SMS alert and cannot be edited or removed.
                </div>

                <LockedField
                  icon={({ size, strokeWidth }) => (
                    /* person icon inline */
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  )}
                  label="User Name"
                  value={isLoadingBracelet ? "Loading…" : ownerName}
                />

                <div className="bmc-locked-divider" />

                {/* Show all 3 severity levels as badges */}
                <div className="bmc-locked-field bmc-locked-field--levels">
                  <span className="bmc-locked-icon">
                    <ShieldAlert size={14} strokeWidth={2} />
                  </span>
                  <div className="bmc-locked-body">
                    <span className="bmc-locked-label">Emergency Level</span>
                    <div className="bmc-level-badges">
                      {Object.entries(LEVEL_LABEL).map(([lvl, label]) => (
                        <span
                          key={lvl}
                          className={`bmc-level-badge bmc-level-badge--${label.toLowerCase()}`}
                        >
                          [{label} Emergency]
                        </span>
                      ))}
                    </div>
                    <span className="bmc-locked-hint">
                      Dynamically set by bracelet sensor at alert time
                    </span>
                  </div>
                  <Lock size={12} className="bmc-lock-icon" />
                </div>

                <div className="bmc-locked-divider" />

                <div className="bmc-locked-field bmc-locked-field--url">
                  <span className="bmc-locked-icon">
                    <MapPin size={14} strokeWidth={2} />
                  </span>
                  <div className="bmc-locked-body">
                    <span className="bmc-locked-label">Location Link</span>
                    <span className="bmc-locked-value bmc-locked-value--url">
                      https://ping-me-now.netlify.app/track?lat=…&amp;lng=…
                    </span>
                    <span className="bmc-locked-hint">
                      Real-time coordinates are injected at alert time
                    </span>
                  </div>
                  <Lock size={12} className="bmc-lock-icon" />
                </div>
              </div>
            </div>

            {/* ── Help Message ── */}
            <div className="bmc-section">
              <span className="bmc-section-label">Help Message</span>
              <p className="bmc-field-hint">
                Current phrase:{" "}
                <strong className="bmc-current-phrase">"{savedPhrase}"</strong>
              </p>
              <div className="bmc-textarea-border">
                <textarea
                  id="bmc-new-message-input"
                  className="bmc-textarea"
                  placeholder={`Type a new phrase (default: "${DEFAULT_HELP_PHRASE}")`}
                  value={draftPhrase}
                  onChange={(e) => setDraftPhrase(e.target.value)}
                  rows={3}
                />
              </div>
              <p className="bmc-field-hint bmc-field-hint--subtle">
                Only this phrase is editable. Name, level, and location are
                always prepended/appended automatically.
              </p>
            </div>

            {/* ── Live SMS Preview ── */}
            <div className="bmc-section">
              <span className="bmc-section-label">Live SMS Preview</span>
              <SmsPreview message={emergencyPreview} />
              <p className="bmc-field-hint bmc-field-hint--subtle">
                Showing <strong>[SEVERE]</strong> example · actual level is
                set by sensor at alert time
              </p>
            </div>
          </>
        )}

        {/* ════════════════════ SAFE TAB ════════════════════ */}
        {activeTab === "safe" && (
          <>
            <div className="bmc-section">
              <span className="bmc-section-label">Automated Safe Message</span>
              <div className="bmc-safe-info-card">
                <CheckCircle2 size={18} className="bmc-safe-check-icon" strokeWidth={2.5} />
                <p className="bmc-safe-info-text">
                  When the SOS is deactivated, this message is automatically
                  sent to all emergency contacts. No customization is needed —
                  it always includes your current profile name.
                </p>
              </div>
            </div>

            <div className="bmc-section">
              <div className="bmc-section-header-row">
                <span className="bmc-section-label">Required Details</span>
                <span className="bmc-locked-badge">
                  <Lock size={10} strokeWidth={3} /> Auto-injected
                </span>
              </div>
              <div className="bmc-locked-card">
                <LockedField
                  icon={({ size, strokeWidth }) => (
                    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  )}
                  label="User Name"
                  value={ownerName}
                />
              </div>
            </div>

            <div className="bmc-section">
              <span className="bmc-section-label">SMS Preview</span>
              <SmsPreview message={safePreview} />
            </div>
          </>
        )}
      </main>

      {/* ── Footer — only shown on Emergency tab when there's a draft ── */}
      {activeTab === "emergency" && (
        <footer className="br-footer bmc-footer">
          {savedSuccess ? (
            <div className="bmc-save-success">
              <CheckCircle2 size={16} strokeWidth={2.5} />
              Phrase saved successfully!
            </div>
          ) : (
            <button
              id="bmc-edit-btn"
              className={`bmc-edit-btn ${!canSave ? "bmc-edit-btn--disabled" : ""}`}
              onClick={handleSave}
              disabled={!canSave}
            >
              <Send size={15} strokeWidth={2.5} />
              {isSaving ? "Saving…" : "Save Help Phrase"}
            </button>
          )}
        </footer>
      )}
    </div>
  );
}

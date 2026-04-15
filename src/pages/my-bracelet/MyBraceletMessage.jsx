import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ChevronLeft, MoreVertical, MessageCircle, Send, ChevronDown, Check } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import "./MyBraceletMessage.css";

const STATES = {
  emergency: {
    tab: "Emergency",
    defaultMessage: "Help! I'm in an emergency at [Location]. Please check on me.",
  },
  safe: {
    tab: "I am Safe",
    defaultMessage: "Hi! I'm currently in Manila. I'm safe, no need to worry!",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Builds a human-readable summary of selected contacts */
function buildSummary(selected, allContacts) {
  if (selected.length === 0) return "No contacts selected";
  if (selected.length === allContacts.length) return "All Contacts Selected";
  if (selected.length === 1) return selected[0].name;
  if (selected.length === 2) return `${selected[0].name} & ${selected[1].name}`;
  return `${selected[0].name}, ${selected[1].name} & ${selected.length - 2} other${selected.length - 2 > 1 ? "s" : ""}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MyBraceletMessage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const dropdownRef = useRef(null);

  // Per-state current messages (committed)
  const [currentMessages, setCurrentMessages] = useState({
    emergency: STATES.emergency.defaultMessage,
    safe: STATES.safe.defaultMessage,
  });

  // Per-state draft inputs
  const [draftMessages, setDraftMessages] = useState({ emergency: "", safe: "" });

  const [activeTab, setActiveTab] = useState("emergency");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Contacts data
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]); // array of { name, contactNo }
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);

  // Per-state recipient selections (stored as contact indices for backend)
  const [recipientMap, setRecipientMap] = useState({ emergency: [], safe: [] });

  // ── Fetch emergency contacts ──
  useEffect(() => {
    const fetchContacts = async () => {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, "braceletUsers"),
          where("ownerAppUserId", "==", currentUser.uid)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data();
          const contacts = (data.emergencyContacts || []).map((c, i) => ({
            id: `contact_${i}`,
            name: c.name,
            contactNo: c.contactNo,
          }));
          setAllContacts(contacts);
          setSelectedContacts(contacts); // default: all selected
          setRecipientMap({
            emergency: contacts.map((c) => c.id),
            safe: contacts.map((c) => c.id),
          });
        }
      } catch (err) {
        console.error("Error fetching contacts:", err);
      } finally {
        setIsLoadingContacts(false);
      }
    };
    fetchContacts();
  }, [currentUser]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // ── Derived state ──
  const currentDraft = draftMessages[activeTab];
  const currentDisplayMessage = currentMessages[activeTab];
  const activeState = STATES[activeTab];
  const isAllSelected = selectedContacts.length === allContacts.length && allContacts.length > 0;
  const summaryText = isLoadingContacts
    ? "Loading contacts..."
    : allContacts.length === 0
    ? "No emergency contacts saved"
    : buildSummary(selectedContacts, allContacts);

  // ── Handlers ──
  const handleDraftChange = (e) =>
    setDraftMessages((prev) => ({ ...prev, [activeTab]: e.target.value }));

  const handleToggleAll = () => {
    const next = isAllSelected ? [] : [...allContacts];
    setSelectedContacts(next);
    setRecipientMap((prev) => ({ ...prev, [activeTab]: next.map((c) => c.id) }));
  };

  const handleToggleContact = (contact) => {
    const isChecked = selectedContacts.some((c) => c.id === contact.id);
    const next = isChecked
      ? selectedContacts.filter((c) => c.id !== contact.id)
      : [...selectedContacts, contact];
    setSelectedContacts(next);
    setRecipientMap((prev) => ({ ...prev, [activeTab]: next.map((c) => c.id) }));
  };

  const handleEdit = async () => {
    if (!currentDraft.trim()) return;
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setCurrentMessages((prev) => ({ ...prev, [activeTab]: currentDraft.trim() }));
    setDraftMessages((prev) => ({ ...prev, [activeTab]: "" }));
    setIsSaving(false);
  };

  const handleReset = () => {
    setCurrentMessages((prev) => ({ ...prev, [activeTab]: STATES[activeTab].defaultMessage }));
    setDraftMessages((prev) => ({ ...prev, [activeTab]: "" }));
    setIsMenuOpen(false);
  };

  const handleTabSwitch = (key) => {
    setActiveTab(key);
    // Restore per-tab recipient selection when switching tabs
    const tabRecipients = recipientMap[key];
    setSelectedContacts(allContacts.filter((c) => tabRecipients.includes(c.id)));
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
              <button className="bmc-context-item" onClick={handleReset}>
                Reset to default
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="br-main bmc-main">

        {/* Instructional text — transparent */}
        <p className="bmc-subtext">
          Personalize your responses for different situations to keep your
          contacts informed automatically.
        </p>

        {/* ── Segmented Tab Switcher ── */}
        <div className="bmc-tab-switcher" role="tablist">
          {Object.entries(STATES).map(([key, val]) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeTab === key}
              className={`bmc-tab ${activeTab === key ? "bmc-tab--active" : ""}`}
              onClick={(e) => { e.stopPropagation(); handleTabSwitch(key); }}
              id={`bmc-tab-${key}`}
            >
              {val.tab}
            </button>
          ))}
        </div>

        {/* ── Current Message ── */}
        <div className="bmc-section">
          <span className="bmc-section-label">
            Current {activeState.tab} Message
          </span>
          <div className="bmc-chat-row">
            <div className="bmc-avatar">
              <MessageCircle size={18} color="#a4262c" strokeWidth={2} />
            </div>
            <div className="bmc-bubble">
              <p className="bmc-bubble-text">{currentDisplayMessage}</p>
            </div>
          </div>
        </div>

        {/* ── New Message Input ── */}
        <div className="bmc-section">
          <span className="bmc-section-label">
            New {activeState.tab} Message
          </span>
          <div className="bmc-textarea-border">
            <textarea
              id="bmc-new-message-input"
              className="bmc-textarea"
              placeholder="Type here your new message..."
              value={currentDraft}
              onChange={handleDraftChange}
              rows={4}
            />
          </div>
        </div>

        {/* ── Apply To — Multi-select Dropdown ── */}
        <div className="bmc-section bmc-apply-group" ref={dropdownRef}>
          <span className="bmc-section-label">Apply to:</span>

          <button
            className="bmc-dropdown-trigger"
            id="bmc-apply-select"
            onClick={(e) => { e.stopPropagation(); setIsDropdownOpen((p) => !p); }}
            disabled={isLoadingContacts || allContacts.length === 0}
          >
            <span className="bmc-dropdown-summary">{summaryText}</span>
            <ChevronDown
              size={16}
              className={`bmc-chevron ${isDropdownOpen ? "bmc-chevron--open" : ""}`}
            />
          </button>

          {isDropdownOpen && allContacts.length > 0 && (
            <div className="bmc-checklist" onClick={(e) => e.stopPropagation()}>
              {/* Select All row */}
              <label className="bmc-check-row bmc-check-row--all" htmlFor="bmc-check-all">
                <span className="bmc-check-box-wrap">
                  <input
                    type="checkbox"
                    id="bmc-check-all"
                    className="bmc-check-input"
                    checked={isAllSelected}
                    onChange={handleToggleAll}
                  />
                  <span className={`bmc-check-box ${isAllSelected ? "bmc-check-box--checked" : ""}`}>
                    {isAllSelected && <Check size={11} strokeWidth={3} color="#fff" />}
                  </span>
                </span>
                <span className="bmc-check-label bmc-check-label--all">All Emergency Contacts</span>
              </label>

              <div className="bmc-check-divider" />

              {/* Individual contacts */}
              {allContacts.map((contact) => {
                const checked = selectedContacts.some((c) => c.id === contact.id);
                return (
                  <label
                    key={contact.id}
                    className="bmc-check-row"
                    htmlFor={`bmc-check-${contact.id}`}
                  >
                    <span className="bmc-check-box-wrap">
                      <input
                        type="checkbox"
                        id={`bmc-check-${contact.id}`}
                        className="bmc-check-input"
                        checked={checked}
                        onChange={() => handleToggleContact(contact)}
                      />
                      <span className={`bmc-check-box ${checked ? "bmc-check-box--checked" : ""}`}>
                        {checked && <Check size={11} strokeWidth={3} color="#fff" />}
                      </span>
                    </span>
                    <span className="bmc-check-info">
                      <span className="bmc-check-label">{contact.name}</span>
                      <span className="bmc-check-sub">{contact.contactNo}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {/* Empty state if no contacts saved */}
          {!isLoadingContacts && allContacts.length === 0 && (
            <p className="bmc-no-contacts">
              No emergency contacts found. Add contacts in the Emergency Contact screen first.
            </p>
          )}
        </div>
      </main>

      {/* ── Footer Action ── */}
      <footer className="br-footer bmc-footer">
        <button
          id="bmc-edit-btn"
          className={`bmc-edit-btn ${!currentDraft.trim() ? "bmc-edit-btn--disabled" : ""}`}
          onClick={handleEdit}
          disabled={!currentDraft.trim() || isSaving}
        >
          <Send size={15} strokeWidth={2.5} />
          {isSaving ? "Saving…" : "Edit"}
        </button>
      </footer>
    </div>
  );
}

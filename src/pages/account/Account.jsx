import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile, deleteUser } from "firebase/auth";
import { useToast } from "../../context/ToastContext";
import { Camera, Save, AlertTriangle } from "lucide-react";
import "./Account.css";

export default function Account() {
  const { currentUser } = useAuth();
  const { openToast } = useToast();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || "");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Mock local preview (No actual backend storage upload yet to keep it simple)
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result);
        openToast("success", "Photo preview updated (local only).");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      await updateProfile(currentUser, {
        displayName: displayName
        // photoURL could be included if we uploaded to cloud storage
      });
      openToast("success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      openToast("error", "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    try {
      if (currentUser) {
        await deleteUser(currentUser);
        openToast("success", "Account deleted.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      // Re-authentication is often required for delete
      openToast("error", "Failed to delete. You may need to log in again first.");
    }
  };

  return (
    <div className="account-container">
      <h2 className="account-header">Account</h2>
      <p className="account-subtitle">Manage your personal details and settings.</p>

      {/* Avatar Upload */}
      <div className="account-photo-section">
        <div className="account-avatar-wrapper" onClick={handlePhotoClick}>
          {photoURL ? (
            <img src={photoURL} alt="Avatar" className="account-avatar-img" />
          ) : (
            <Camera size={32} color="var(--color-text-secondary)" />
          )}
          <div className="account-avatar-overlay">
            <Camera size={24} />
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handlePhotoChange}
        />
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          Tap to change photo
        </span>
      </div>

      {/* Editable Form */}
      <div className="account-form-section">
        <div className="account-input-group">
          <label>Display Name</label>
          <input
            type="text"
            className="account-input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        <div className="account-input-group">
          <label>Email Address</label>
          <input
            type="email"
            className="account-input"
            value={currentUser?.email || ""}
            disabled
          />
        </div>

        <button
          className="account-save-btn"
          onClick={handleSave}
          disabled={saving || (displayName === currentUser?.displayName && photoURL === currentUser?.photoURL)}
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="account-danger-zone">
        <h3 className="account-danger-title">Danger Zone</h3>
        <p className="account-danger-text">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button className="account-delete-btn" onClick={handleDelete}>
          Delete Account
        </button>
      </div>
    </div>
  );
}

import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, isDanger }) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-backdrop">
      <div className="confirmation-modal-content">
        <div className="confirmation-modal-icon-wrapper">
          {isDanger ? (
             <Trash2 size={48} color="var(--pm-danger, #A4262C)" strokeWidth={1.5} />
          ) : (
             <AlertTriangle size={48} color="var(--pm-warning, #856404)" strokeWidth={1.5} />
          )}
        </div>
        <h2 className="confirmation-modal-title">
          {title || "Are you sure?"}
        </h2>
        <p className="confirmation-modal-message">
          {message || "This action cannot be undone."}
        </p>
        <div className="confirmation-modal-actions">
           <button 
             className={`confirmation-modal-btn confirm ${isDanger ? 'danger' : ''}`}
             onClick={onConfirm}
           >
             {confirmText || "Confirm"}
           </button>
           <button 
             className="confirmation-modal-btn cancel" 
             onClick={onClose}
           >
             {cancelText || "Cancel"}
           </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

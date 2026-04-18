import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import './SuccessModal.css';

const SuccessModal = ({ isOpen, onClose, title, message, buttonText, hideButton, autoClose, autoCloseTime = 3000 }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (isOpen && autoClose) {
      timer = setTimeout(() => {
        handleClose();
      }, autoCloseTime);
    }
    return () => clearTimeout(timer);
  }, [isOpen, autoClose, autoCloseTime]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className={`success-modal-backdrop ${isClosing ? 'fade-out' : ''}`}>
      <div className={`success-modal-content ${isClosing ? 'pop-out' : ''}`}>
        <div className="success-modal-icon-wrapper">
          <CheckCircle2 size={48} color="var(--pm-primary, #a4262c)" strokeWidth={1.5} />
        </div>
        <h2 className="success-modal-title">
          {title || "Success"}
        </h2>
        <p className="success-modal-message">
          {message || "The operation was completed successfully."}
        </p>
        {!hideButton && (
          <button 
            className="success-modal-btn" 
            onClick={handleClose}
          >
            {buttonText || "Okay"}
          </button>
        )}
      </div>
    </div>
  );
};

export default SuccessModal;

// src/components/NotificationModal.jsx
import React from 'react';
import { X, Trash2 } from 'lucide-react';
import './NotificationModal.css';
import logo from '../assets/logo.png';
import LoadingSpinner from './LoadingSpinner';

const NotificationModal = ({ isOpen, onClose, notifications, loading, onMarkAsRead, onDeleteNotification }) => {
  if (!isOpen) return null;

  return (
    <div className="notification-modal-overlay">
      <div className="notification-modal">
        <header className="notification-modal-header">
          <h1 className="notification-modal-title">Notifications</h1>
          <button className="notification-modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </header>
        <main className="notification-modal-content">
          {loading ? (
            <LoadingSpinner message="Loading updates..." />
          ) : notifications.length === 0 ? (
            <div className="notifications-empty">No notifications</div>
          ) : (
            <ul className="notification-modal-list">
              {notifications.map((item) => (
                <li
                  key={item.id}
                  className={`notification-item ${!item.read ? 'unread' : ''}`}
                  onClick={(e) => onMarkAsRead(e, item.id, item.read)}
                >
                  <div className="notification-icon">
                    <img src={item.icon || logo} alt={item.title || 'Notification'} />
                  </div>
                  <div className="notification-text">
                    <p className="notification-title-text">{item.title}</p>
                    <p className="notification-message">{item.message}</p>
                  </div>
                  <div className="notification-meta">
                    <span className="notification-time">
                      {item.time ? (item.time.toDate ? item.time.toDate().toLocaleString() : item.time) : ''}
                    </span>
                    <div className="notification-actions">
                      {!item.read && (
                        <div
                          className="notification-unread-dot"
                          aria-label="Mark as read"
                        />
                      )}
                      <button
                        className="notification-delete-btn"
                        onClick={(e) => onDeleteNotification(e, item.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
};

export default NotificationModal;

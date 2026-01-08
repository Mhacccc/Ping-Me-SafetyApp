// src/pages/app/NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreHorizontal, Trash2 } from 'lucide-react';
import './NotificationsPage.css';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'notifications'), where('appUserId', '==', currentUser.uid));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // sort by time if provided
        items.sort((a, b) => {
          const ta = a.time?.seconds ?? a.time ?? 0;
          const tb = b.time?.seconds ?? b.time ?? 0;
          return tb - ta;
        });
        setNotifications(items);
        setLoading(false);
      },
      (err) => {
        console.error('Notifications listener error:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUser]);

  const markAsRead = async (e, id, alreadyRead) => {
    e.stopPropagation();
    if (alreadyRead) return;
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this notification?")) return;
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return (
    <div className="notifications-page">
      <header className="notifications-header">
        <button className="header-btn-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={26} />
        </button>
        <h1 className="notifications-title">Notification</h1>
        <button className="header-btn-more">
          <MoreHorizontal size={24} />
        </button>
      </header>

      <main className="notifications-content">
        {loading ? (
          <div className="loading-container">
            <div className="cool-spinner"></div>
            <p>Loading updates...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">No notifications</div>
        ) : (
          <ul className="notifications-list">
            {notifications.map((item) => (
              <li key={item.id} className={`notification-item ${!item.read ? 'unread' : ''}`}>
                <div className="notification-icon">
                  <img src={item.icon || logo} alt={item.title || 'Notification'} />
                </div>
                <div className="notification-text">
                  <p className="notification-title-text">{item.title}</p>
                  <p className="notification-message">{item.message}</p>
                </div>
                <div className="notification-meta">
                  <span className="notification-time">{item.time ? (item.time.toDate ? item.time.toDate().toLocaleString() : item.time) : ''}</span>
                  <div className="notification-actions">
                    {!item.read && (
                      <button
                        className="notification-unread-dot"
                        aria-label="Mark as read"
                        onClick={(e) => markAsRead(e, item.id, item.read)}
                      />
                    )}
                    <button 
                      className="notification-delete-btn"
                      onClick={(e) => deleteNotification(e, item.id)}
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
  );
};

export default NotificationsPage;
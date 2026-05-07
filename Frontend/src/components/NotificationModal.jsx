import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './NotificationModal.css';

function NotificationModal({ alerts, onClose, onMarkRead }) {
  return (
    <div className="nm-overlay" onClick={onClose}>
      <motion.div 
        className="nm-modal" 
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <div className="nm-header">
          <h3>Notifications & Alerts</h3>
          <button className="nm-close" onClick={onClose}>&times;</button>
        </div>

        <div className="nm-content">
          {alerts.length === 0 ? (
            <div className="nm-empty">
              <span className="nm-empty-icon">🔔</span>
              <p>No new alerts at this time.</p>
            </div>
          ) : (
            <div className="nm-list">
              {alerts.map(alert => (
                <div key={alert.id || Math.random()} className={`nm-item ${(alert.priority || 'INFO').toLowerCase()} ${alert.isRead ? 'read' : 'unread'}`}>
                  <div className="nm-item-header">
                    <span className="nm-priority-tag">{alert.priority || 'ALERT'}</span>
                    <span className="nm-date">{alert.timestamp ? new Date(alert.timestamp).toLocaleDateString() : 'Today'}</span>
                  </div>
                  <div className="nm-message">{alert.message}</div>
                  {!alert.isRead && (
                    <button className="nm-mark-btn" onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead(alert.id);
                    }}>Mark as Read</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default NotificationModal;

import React from 'react';
import { useApp } from '../../../shared/context/AppContext';
import './Notification.css';

/**
 * Notification Component
 * Toast-style notifications
 */
export function Notification() {
  const { notification } = useApp();

  if (!notification) return null;

  return (
    <div className="notification">
      {notification}
    </div>
  );
}

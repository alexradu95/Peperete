import React from 'react';
import { useApp } from '../../../shared/context/AppContext';

/**
 * Notification Component
 * Toast-style notifications
 */
export function Notification() {
  const { notification } = useApp();

  if (!notification) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-black/90 text-white px-6 py-3 rounded-md border border-white/20 z-[10000] text-sm animate-slideDown shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      {notification}
    </div>
  );
}

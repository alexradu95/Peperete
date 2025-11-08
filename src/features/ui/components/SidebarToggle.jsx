import React from 'react';
import { useApp } from '../../../shared/context/AppContext';
import './SidebarToggle.css';

/**
 * Sidebar Toggle Button
 * Floating button to toggle sidebar visibility
 */
export function SidebarToggle() {
  const { isSidebarVisible, toggleSidebar } = useApp();

  return (
    <button
      className={`sidebar-toggle ${isSidebarVisible ? 'visible' : 'hidden'}`}
      onClick={toggleSidebar}
      title={isSidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
    >
      {isSidebarVisible ? '◀' : '▶'}
    </button>
  );
}

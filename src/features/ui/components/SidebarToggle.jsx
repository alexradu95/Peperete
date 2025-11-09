import React from 'react';
import { useApp } from '../../../shared/context/AppContext';

/**
 * Sidebar Toggle Button
 * Floating button to toggle sidebar visibility
 */
export function SidebarToggle() {
  const { isSidebarVisible, toggleSidebar } = useApp();

  return (
    <button
      className={`fixed top-5 ${isSidebarVisible ? 'left-[268px]' : 'left-2.5'} z-[1001] bg-[rgba(0,170,255,0.9)] hover:bg-[rgb(0,170,255)] text-white border-none rounded w-8 h-8 cursor-pointer text-base flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-110 shadow-[0_2px_8px_rgba(0,0,0,0.3)]`}
      onClick={toggleSidebar}
      title={isSidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
    >
      {isSidebarVisible ? '◀' : '▶'}
    </button>
  );
}

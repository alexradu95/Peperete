import { useEffect } from 'react';

/**
 * Custom hook for handling keyboard shortcuts
 * @param {Object} handlers - Map of key -> handler function
 * @param {boolean} enabled - Whether keyboard handling is enabled
 */
export function useKeyboard(handlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      const handler = handlers[event.key];
      if (handler) {
        event.preventDefault();
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers, enabled]);
}

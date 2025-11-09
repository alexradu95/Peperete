import { useEffect } from 'react';

type KeyboardHandler = (event: KeyboardEvent) => void;
type KeyboardHandlers = Record<string, KeyboardHandler>;

export const useKeyboard = (
  handlers: KeyboardHandlers,
  enabled: boolean = true
): void => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement;

      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
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
};

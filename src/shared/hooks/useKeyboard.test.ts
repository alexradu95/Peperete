import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboard } from './useKeyboard';

describe('useKeyboard', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  describe('event listener registration', () => {
    it('should register keydown event listener on mount when enabled', () => {
      const handlers = { a: vi.fn() };
      renderHook(() => useKeyboard(handlers));

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should not register event listener when disabled', () => {
      const handlers = { a: vi.fn() };
      renderHook(() => useKeyboard(handlers, false));

      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    it('should remove event listener on unmount', () => {
      const handlers = { a: vi.fn() };
      const { unmount } = renderHook(() => useKeyboard(handlers));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should reregister listener when handlers change', () => {
      const handlers1 = { a: vi.fn() };
      const { rerender } = renderHook(
        ({ handlers }: { handlers: Record<string, () => void> }) => useKeyboard(handlers),
        { initialProps: { handlers: handlers1 as Record<string, () => void> } }
      );

      addEventListenerSpy.mockClear();
      removeEventListenerSpy.mockClear();

      const handlers2 = { b: vi.fn() };
      rerender({ handlers: handlers2 as Record<string, () => void> });

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
    });

    it('should reregister listener when enabled state changes', () => {
      const handlers = { a: vi.fn() };
      const { rerender } = renderHook(
        ({ enabled }) => useKeyboard(handlers, enabled),
        { initialProps: { enabled: true } }
      );

      addEventListenerSpy.mockClear();
      removeEventListenerSpy.mockClear();

      rerender({ enabled: false });

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });
  });

  describe('keyboard handler invocation', () => {
    it('should call handler when matching key is pressed', () => {
      const handlerA = vi.fn();
      const handlers = { a: handlerA };

      renderHook(() => useKeyboard(handlers));

      const event = new KeyboardEvent('keydown', { key: 'a' });
      window.dispatchEvent(event);

      expect(handlerA).toHaveBeenCalledTimes(1);
      expect(handlerA).toHaveBeenCalledWith(expect.objectContaining({ key: 'a' }));
    });

    it('should not call handler when non-matching key is pressed', () => {
      const handlerA = vi.fn();
      const handlers = { a: handlerA };

      renderHook(() => useKeyboard(handlers));

      const event = new KeyboardEvent('keydown', { key: 'b' });
      window.dispatchEvent(event);

      expect(handlerA).not.toHaveBeenCalled();
    });

    it('should call correct handler for multiple keys', () => {
      const handlerA = vi.fn();
      const handlerB = vi.fn();
      const handlerSpace = vi.fn();
      const handlers = {
        a: handlerA,
        b: handlerB,
        ' ': handlerSpace
      };

      renderHook(() => useKeyboard(handlers));

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

      expect(handlerA).toHaveBeenCalledTimes(1);
      expect(handlerB).toHaveBeenCalledTimes(1);
      expect(handlerSpace).toHaveBeenCalledTimes(1);
    });

    it('should prevent default behavior when handler exists', () => {
      const handler = vi.fn();
      const handlers = { a: handler };

      renderHook(() => useKeyboard(handlers));

      const event = new KeyboardEvent('keydown', { key: 'a' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not prevent default when no handler matches', () => {
      const handlerA = vi.fn();
      const handlers = { a: handlerA };

      renderHook(() => useKeyboard(handlers));

      const event = new KeyboardEvent('keydown', { key: 'b' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe('input element handling', () => {
    it('should not call handler when key pressed in INPUT element', () => {
      const handler = vi.fn();
      const handlers = { a: handler };

      renderHook(() => useKeyboard(handlers));

      const input = document.createElement('input');
      document.body.appendChild(input);

      const event = new KeyboardEvent('keydown', {
        key: 'a',
        bubbles: true
      });
      Object.defineProperty(event, 'target', {
        value: input,
        enumerable: true
      });

      input.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it('should not call handler when key pressed in TEXTAREA element', () => {
      const handler = vi.fn();
      const handlers = { a: handler };

      renderHook(() => useKeyboard(handlers));

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);

      const event = new KeyboardEvent('keydown', {
        key: 'a',
        bubbles: true
      });
      Object.defineProperty(event, 'target', {
        value: textarea,
        enumerable: true
      });

      textarea.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();

      document.body.removeChild(textarea);
    });

    it('should call handler when key pressed outside input elements', () => {
      const handler = vi.fn();
      const handlers = { a: handler };

      renderHook(() => useKeyboard(handlers));

      const div = document.createElement('div');
      document.body.appendChild(div);

      const event = new KeyboardEvent('keydown', {
        key: 'a',
        bubbles: true
      });
      Object.defineProperty(event, 'target', {
        value: div,
        enumerable: true
      });

      div.dispatchEvent(event);

      expect(handler).toHaveBeenCalledTimes(1);

      document.body.removeChild(div);
    });
  });

  describe('enabled state toggling', () => {
    it('should not call handler when disabled', () => {
      const handler = vi.fn();
      const handlers = { a: handler };

      renderHook(() => useKeyboard(handlers, false));

      const event = new KeyboardEvent('keydown', { key: 'a' });
      window.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should call handler after being re-enabled', () => {
      const handler = vi.fn();
      const handlers = { a: handler };

      const { rerender } = renderHook(
        ({ enabled }) => useKeyboard(handlers, enabled),
        { initialProps: { enabled: false } }
      );

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      expect(handler).not.toHaveBeenCalled();

      rerender({ enabled: true });

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should stop calling handler after being disabled', () => {
      const handler = vi.fn();
      const handlers = { a: handler };

      const { rerender } = renderHook(
        ({ enabled }) => useKeyboard(handlers, enabled),
        { initialProps: { enabled: true } }
      );

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      expect(handler).toHaveBeenCalledTimes(1);

      rerender({ enabled: false });

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      expect(handler).toHaveBeenCalledTimes(1); // Still 1, not 2
    });
  });

  describe('special keys', () => {
    it('should handle special keys like Escape', () => {
      const handler = vi.fn();
      const handlers = { Escape: handler };

      renderHook(() => useKeyboard(handlers));

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should handle arrow keys', () => {
      const upHandler = vi.fn();
      const downHandler = vi.fn();
      const leftHandler = vi.fn();
      const rightHandler = vi.fn();
      const handlers = {
        ArrowUp: upHandler,
        ArrowDown: downHandler,
        ArrowLeft: leftHandler,
        ArrowRight: rightHandler
      };

      renderHook(() => useKeyboard(handlers));

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

      expect(upHandler).toHaveBeenCalledTimes(1);
      expect(downHandler).toHaveBeenCalledTimes(1);
      expect(leftHandler).toHaveBeenCalledTimes(1);
      expect(rightHandler).toHaveBeenCalledTimes(1);
    });

    it('should handle function keys', () => {
      const handler = vi.fn();
      const handlers = { F1: handler, F12: vi.fn() };

      renderHook(() => useKeyboard(handlers));

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F1' }));

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});

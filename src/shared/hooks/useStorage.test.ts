import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { z } from 'zod';
import { useStorage } from './useStorage';

// Test schemas
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number().min(0)
});

const CounterSchema = z.number().int().min(0);

describe('useStorage with schema validation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('initial value loading', () => {
    it('should return default value when localStorage is empty', () => {
      const defaultUser = { id: '1', name: 'John', age: 30 };

      const { result } = renderHook(() =>
        useStorage({
          key: 'user',
          defaultValue: defaultUser,
          schema: UserSchema
        })
      );

      const [value] = result.current;
      expect(value).toEqual(defaultUser);
    });

    it('should load and validate data from localStorage when valid', () => {
      const storedUser = { id: '2', name: 'Jane', age: 25 };
      localStorage.setItem('user', JSON.stringify(storedUser));

      const { result } = renderHook(() =>
        useStorage({
          key: 'user',
          defaultValue: { id: '0', name: 'Default', age: 0 },
          schema: UserSchema
        })
      );

      const [value] = result.current;
      expect(value).toEqual(storedUser);
    });

    it('should return default value when stored data fails schema validation', () => {
      const invalidUser = { id: '3', name: 'Invalid', age: -5 }; // Negative age fails validation
      localStorage.setItem('user', JSON.stringify(invalidUser));

      const defaultUser = { id: '0', name: 'Default', age: 0 };
      const { result } = renderHook(() =>
        useStorage({
          key: 'user',
          defaultValue: defaultUser,
          schema: UserSchema
        })
      );

      const [value] = result.current;
      expect(value).toEqual(defaultUser);
    });

    it('should return default value when stored data has wrong shape', () => {
      localStorage.setItem('user', JSON.stringify({ wrong: 'shape' }));

      const defaultUser = { id: '0', name: 'Default', age: 0 };
      const { result } = renderHook(() =>
        useStorage({
          key: 'user',
          defaultValue: defaultUser,
          schema: UserSchema
        })
      );

      const [value] = result.current;
      expect(value).toEqual(defaultUser);
    });

    it('should return default value when localStorage contains invalid JSON', () => {
      localStorage.setItem('user', 'not valid json{');

      const defaultUser = { id: '0', name: 'Default', age: 0 };
      const { result } = renderHook(() =>
        useStorage({
          key: 'user',
          defaultValue: defaultUser,
          schema: UserSchema
        })
      );

      const [value] = result.current;
      expect(value).toEqual(defaultUser);
    });
  });

  describe('setting values', () => {
    it('should update value and persist to localStorage', () => {
      const defaultUser = { id: '0', name: 'Default', age: 0 };
      const { result } = renderHook(() =>
        useStorage({
          key: 'user',
          defaultValue: defaultUser,
          schema: UserSchema
        })
      );

      const newUser = { id: '4', name: 'Updated', age: 35 };

      act(() => {
        const [, setValue] = result.current;
        setValue(newUser);
      });

      const [value] = result.current;
      expect(value).toEqual(newUser);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(newUser));
    });

    it('should handle primitive values correctly', () => {
      const { result } = renderHook(() =>
        useStorage({
          key: 'counter',
          defaultValue: 0,
          schema: CounterSchema
        })
      );

      act(() => {
        const [, setValue] = result.current;
        setValue(42);
      });

      const [value] = result.current;
      expect(value).toBe(42);
      expect(localStorage.getItem('counter')).toBe('42');
    });
  });

  describe('remove function', () => {
    it('should remove value from localStorage and reset to default', () => {
      const storedUser = { id: '5', name: 'ToRemove', age: 20 };
      localStorage.setItem('user', JSON.stringify(storedUser));

      const defaultUser = { id: '0', name: 'Default', age: 0 };
      const { result } = renderHook(() =>
        useStorage({
          key: 'user',
          defaultValue: defaultUser,
          schema: UserSchema
        })
      );

      act(() => {
        const [, , remove] = result.current;
        remove();
      });

      const [value] = result.current;
      expect(value).toEqual(defaultUser);
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle localStorage quota exceeded gracefully', () => {
      const defaultUser = { id: '0', name: 'Default', age: 0 };

      // Mock setItem to throw quota exceeded error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      const { result } = renderHook(() =>
        useStorage({
          key: 'user',
          defaultValue: defaultUser,
          schema: UserSchema
        })
      );

      act(() => {
        const [, setValue] = result.current;
        setValue({ id: '6', name: 'Test', age: 40 });
      });

      // Should not crash
      const [value] = result.current;
      expect(value).toEqual({ id: '6', name: 'Test', age: 40 });

      // Restore original
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('schema validation edge cases', () => {
    it('should validate complex nested objects', () => {
      const SurfaceSchema = z.object({
        id: z.string(),
        corners: z.record(z.string(), z.object({
          x: z.number(),
          y: z.number()
        }))
      });

      const validSurface = {
        id: 'surface-1',
        corners: {
          point0: { x: 100, y: 100 },
          point1: { x: 200, y: 100 }
        }
      };

      localStorage.setItem('surface', JSON.stringify(validSurface));

      const { result } = renderHook(() =>
        useStorage({
          key: 'surface',
          defaultValue: { id: 'default', corners: {} },
          schema: SurfaceSchema
        })
      );

      const [value] = result.current;
      expect(value).toEqual(validSurface);
    });

    it('should reject invalid nested objects', () => {
      const SurfaceSchema = z.object({
        id: z.string(),
        corners: z.record(z.string(), z.object({
          x: z.number(),
          y: z.number()
        }))
      });

      const invalidSurface = {
        id: 'surface-1',
        corners: {
          point0: { x: 'invalid', y: 100 } // x should be number
        }
      };

      localStorage.setItem('surface', JSON.stringify(invalidSurface));

      const defaultSurface = { id: 'default', corners: {} };
      const { result } = renderHook(() =>
        useStorage({
          key: 'surface',
          defaultValue: defaultSurface,
          schema: SurfaceSchema
        })
      );

      const [value] = result.current;
      expect(value).toEqual(defaultSurface);
    });
  });
});

import { useState, useEffect, useCallback, useRef } from 'react';
import type { z } from 'zod';

type UseStorageOptions<T> = {
  key: string;
  defaultValue: T;
  schema: z.ZodType<T>;
};

type UseStorageReturn<T> = [T, (value: T) => void, () => void];

export const useStorage = <T>({
  key,
  defaultValue,
  schema
}: UseStorageOptions<T>): UseStorageReturn<T> => {
  const isRemovingRef = useRef(false);

  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);

      if (!stored) {
        return defaultValue;
      }

      const parsed = JSON.parse(stored);
      const validationResult = schema.safeParse(parsed);

      if (validationResult.success) {
        return validationResult.data;
      }

      console.warn(
        `Invalid data in localStorage for key "${key}". Using default value.`,
        validationResult.error.format()
      );
      return defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    if (isRemovingRef.current) {
      isRemovingRef.current = false;
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  }, [key, value]);

  const remove = useCallback(() => {
    try {
      isRemovingRef.current = true;
      localStorage.removeItem(key);
      setValue(defaultValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [value, setValue, remove];
};

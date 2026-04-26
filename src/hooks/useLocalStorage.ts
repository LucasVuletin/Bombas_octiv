import { useEffect, useState } from "react";

type StoredValue<T> = {
  version: number;
  data: T;
};

function resolveInitialValue<T>(initialValue: T | (() => T)): T {
  return initialValue instanceof Function ? initialValue() : initialValue;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  version = 1,
) {
  const [value, setValue] = useState<T>(() => {
    const fallbackValue = resolveInitialValue(initialValue);

    try {
      const storedValue = window.localStorage.getItem(key);

      if (!storedValue) {
        return fallbackValue;
      }

      const parsedValue = JSON.parse(storedValue) as StoredValue<T> | T;

      // Mantiene una envoltura versionada para poder evolucionar el schema luego.
      if (
        typeof parsedValue === "object" &&
        parsedValue !== null &&
        "version" in parsedValue &&
        "data" in parsedValue
      ) {
        return parsedValue.version === version ? parsedValue.data : fallbackValue;
      }

      return parsedValue as T;
    } catch (error) {
      console.warn("No se pudo leer localStorage:", error);
      return fallbackValue;
    }
  });

  useEffect(() => {
    try {
      const payload: StoredValue<T> = {
        version,
        data: value,
      };

      window.localStorage.setItem(key, JSON.stringify(payload));
    } catch (error) {
      console.warn("No se pudo escribir localStorage:", error);
    }
  }, [key, value, version]);

  const resetValue = () => {
    setValue(resolveInitialValue(initialValue));
  };

  return [value, setValue, resetValue] as const;
}

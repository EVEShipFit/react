import React from "react";

export const useLocalStorage = function <T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  const storedValueRef = React.useRef(storedValue);
  storedValueRef.current = storedValue;

  const setValue = React.useCallback(
    (value: T | ((val: T) => T)) => {
      if (typeof window === "undefined") return;
      if (storedValueRef.current == value) return;

      const valueToStore = value instanceof Function ? value(storedValueRef.current) : value;
      setStoredValue(valueToStore);

      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
        return;
      }

      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    },
    [key],
  );

  return [storedValue, setValue] as const;
};

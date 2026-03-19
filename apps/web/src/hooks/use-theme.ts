import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "swapsphere:theme";

const getIsDark = (): boolean => {
  return document.documentElement.classList.contains("dark");
};

const listeners = new Set<() => void>();

const subscribe = (callback: () => void): (() => void) => {
  listeners.add(callback);
  return () => { listeners.delete(callback); };
};

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

export const useTheme = () => {
  const isDark = useSyncExternalStore(subscribe, getIsDark, () => false);

  const toggle = useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    notify();
  }, []);

  return { isDark, toggle };
};

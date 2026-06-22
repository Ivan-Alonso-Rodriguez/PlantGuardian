import { create } from "zustand";

type ThemeMode = "light" | "dark";

type SettingsState = {
  apiBaseUrl: string;
  themeMode: ThemeMode;
  setApiBaseUrl: (value: string) => void;
  toggleTheme: () => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  apiBaseUrl: "http://127.0.0.1:8000",
  themeMode: "dark",
  setApiBaseUrl: (apiBaseUrl) => set({ apiBaseUrl }),
  toggleTheme: () =>
    set((state) => ({ themeMode: state.themeMode === "dark" ? "light" : "dark" }))
}));

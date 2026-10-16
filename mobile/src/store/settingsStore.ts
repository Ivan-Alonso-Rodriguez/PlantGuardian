import { create } from "zustand";

import { getDefaultApiBaseUrl } from "../utils/network";

type ThemeMode = "light" | "dark";

type SettingsState = {
  apiBaseUrl: string;
  themeMode: ThemeMode;
  setApiBaseUrl: (value: string) => void;
  toggleTheme: () => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  apiBaseUrl: getDefaultApiBaseUrl(),
  themeMode: "dark",
  setApiBaseUrl: (apiBaseUrl) => set({ apiBaseUrl }),
  toggleTheme: () =>
    set((state) => ({ themeMode: state.themeMode === "dark" ? "light" : "dark" }))
}));

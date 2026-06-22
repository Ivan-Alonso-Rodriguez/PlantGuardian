import { darkTheme, lightTheme } from "./theme";
import { useSettingsStore } from "../store/settingsStore";

export function useTheme() {
  const themeMode = useSettingsStore((state) => state.themeMode);
  return themeMode === "dark" ? darkTheme : lightTheme;
}

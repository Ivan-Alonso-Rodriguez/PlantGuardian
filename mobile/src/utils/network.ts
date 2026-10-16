import { NativeModules, Platform } from "react-native";

const API_PORT = 8000;
const LOCALHOST = "127.0.0.1";

function hostFromUrl(value?: string) {
  if (!value) {
    return null;
  }

  const match = value.match(/^https?:\/\/(\[[^\]]+\]|[^/:]+)/i);
  return match?.[1] ?? null;
}

export function getDefaultApiBaseUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  const webHost =
    Platform.OS === "web" && typeof window !== "undefined"
      ? window.location.hostname
      : null;
  const metroHost = hostFromUrl(NativeModules.SourceCode?.scriptURL);
  const host = webHost || metroHost || LOCALHOST;

  return `http://${host}:${API_PORT}`;
}

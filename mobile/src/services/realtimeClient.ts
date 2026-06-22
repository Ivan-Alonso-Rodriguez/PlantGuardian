import { DashboardResponse } from "../types/api";

export function createRealtimeUrl(apiBaseUrl: string) {
  return apiBaseUrl.replace(/^http/, "ws") + "/ws/realtime";
}

export function connectRealtime(
  apiBaseUrl: string,
  onMessage: (message: Partial<DashboardResponse>) => void,
  onStateChange?: (connected: boolean) => void
) {
  const socket = new WebSocket(createRealtimeUrl(apiBaseUrl));

  socket.onopen = () => onStateChange?.(true);
  socket.onclose = () => onStateChange?.(false);
  socket.onerror = () => onStateChange?.(false);
  socket.onmessage = (event) => {
    try {
      onMessage(JSON.parse(event.data));
    } catch {
      onStateChange?.(false);
    }
  };

  return () => socket.close();
}

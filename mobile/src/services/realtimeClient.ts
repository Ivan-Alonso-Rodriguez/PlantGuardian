import { DashboardResponse } from "../types/api";

export function createRealtimeUrl(apiBaseUrl: string) {
  return apiBaseUrl.replace(/^http/, "ws") + "/ws/realtime";
}

export function connectRealtime(
  apiBaseUrl: string,
  onMessage: (message: Partial<DashboardResponse>) => void,
  onStateChange?: (connected: boolean) => void
) {
  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let closedByCaller = false;

  const connect = () => {
    socket = new WebSocket(createRealtimeUrl(apiBaseUrl));

    socket.onopen = () => onStateChange?.(true);
    socket.onclose = () => {
      onStateChange?.(false);
      if (!closedByCaller) {
        reconnectTimer = setTimeout(connect, 2000);
      }
    };
    socket.onerror = () => {
      onStateChange?.(false);
      socket?.close();
    };
    socket.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch {
        onStateChange?.(false);
      }
    };
  };

  connect();

  return () => {
    closedByCaller = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    socket?.close();
  };
}
